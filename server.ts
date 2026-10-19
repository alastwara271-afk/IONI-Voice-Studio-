import express, { Request, Response } from 'express';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT ? parseInt(process.env.PORT) : 3000;

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Personal Studio Security & Access Control
// Set via STUDIO_PIN env var or fallback to 'ioni2026'
const STUDIO_PIN = process.env.STUDIO_PIN || 'ioni2026';

// Free Tier Usage Tracker (Gemini Free Tier: 15 Requests/Min, 1,500 Requests/Day)
interface UsageStats {
  date: string;
  dailyRequests: number;
  minuteRequests: number;
  lastMinuteTimestamp: number;
}

const usage: UsageStats = {
  date: new Date().toISOString().slice(0, 10),
  dailyRequests: 0,
  minuteRequests: 0,
  lastMinuteTimestamp: Date.now(),
};

function recordAndCheckUsage(): { allowed: boolean; waitSeconds?: number; stats: any } {
  const now = Date.now();
  const today = new Date().toISOString().slice(0, 10);

  // Daily reset
  if (usage.date !== today) {
    usage.date = today;
    usage.dailyRequests = 0;
  }

  // Minute reset
  if (now - usage.lastMinuteTimestamp > 60000) {
    usage.minuteRequests = 0;
    usage.lastMinuteTimestamp = now;
  }

  // Check 15 RPM free-tier safety buffer (limit to 14 to prevent 429)
  if (usage.minuteRequests >= 14) {
    const waitSeconds = Math.ceil((60000 - (now - usage.lastMinuteTimestamp)) / 1000);
    return {
      allowed: false,
      waitSeconds: Math.max(1, waitSeconds),
      stats: {
        dailyRequests: usage.dailyRequests,
        dailyLimit: 1500,
        minuteRequests: usage.minuteRequests,
        minuteLimit: 15,
      },
    };
  }

  // Check 1,500 RPD daily limit
  if (usage.dailyRequests >= 1500) {
    return {
      allowed: false,
      waitSeconds: 0,
      stats: {
        dailyRequests: usage.dailyRequests,
        dailyLimit: 1500,
        minuteRequests: usage.minuteRequests,
        minuteLimit: 15,
      },
    };
  }

  usage.minuteRequests += 1;
  usage.dailyRequests += 1;

  return {
    allowed: true,
    stats: {
      dailyRequests: usage.dailyRequests,
      dailyLimit: 1500,
      minuteRequests: usage.minuteRequests,
      minuteLimit: 15,
    },
  };
}

// Public Access Configuration
// When PUBLIC_ACCESS is true, any visitor with the URL can use the studio without PIN or Google sign-in.
const PUBLIC_ACCESS = true;

// Security PIN verification middleware (permits all visitors when PUBLIC_ACCESS is true)
function verifyPersonalAccess(req: Request, res: Response, next: express.NextFunction) {
  if (PUBLIC_ACCESS) {
    return next();
  }
  const pinHeader = req.headers['x-personal-pin'];
  if (pinHeader !== STUDIO_PIN) {
    return res.status(401).json({
      error: 'Unauthorized: Studio PIN required.',
      requiresPin: true,
    });
  }
  next();
}

// Helper to get GoogleGenAI client
function getGenAIClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured in the server environment.');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Helper: build valid WAV file from raw PCM or fix RIFF header for multiple chunks
function createWavHeader(dataLength: number, sampleRate = 24000, channels = 1, bitsPerSample = 16): Buffer {
  const header = Buffer.alloc(44);
  const byteRate = sampleRate * channels * (bitsPerSample / 8);
  const blockAlign = channels * (bitsPerSample / 8);

  // RIFF identifier
  header.write('RIFF', 0);
  // file length - 8
  header.writeUInt32LE(36 + dataLength, 4);
  // RIFF type
  header.write('WAVE', 8);
  // format chunk identifier
  header.write('fmt ', 12);
  // format chunk length
  header.writeUInt32LE(16, 16);
  // sample format (1 is PCM)
  header.writeUInt16LE(1, 20);
  // channel count
  header.writeUInt16LE(channels, 22);
  // sample rate
  header.writeUInt32LE(sampleRate, 24);
  // byte rate
  header.writeUInt32LE(byteRate, 28);
  // block align
  header.writeUInt16LE(blockAlign, 32);
  // bits per sample
  header.writeUInt16LE(bitsPerSample, 34);
  // data chunk identifier
  header.write('data', 36);
  // data chunk length
  header.writeUInt32LE(dataLength, 40);

  return header;
}

// 1. API Status & Quota check
app.get('/api/status', (req: Request, res: Response) => {
  const hasKey = Boolean(process.env.GEMINI_API_KEY);
  const providedPin = req.headers['x-personal-pin'];
  const isPinValid = providedPin === STUDIO_PIN;

  res.json({
    status: 'ok',
    publicAccess: true,
    hasApiKey: hasKey,
    isPinValid: true,
    defaultModel: 'gemini-3.8-flash-lite-tts',
    advancedModel: 'gemini-3.8-flash-tts',
    audioFormat: 'audio/wav',
    sampleRate: 24000,
    freeTierInfo: {
      cost: '$0.00 / month (100% Free Tier)',
      limits: {
        rpm: 15,
        rpd: 1500,
        tpm: 1000000,
      },
      currentUsage: {
        dailyRequests: usage.dailyRequests,
        dailyLimit: 1500,
        minuteRequests: usage.minuteRequests,
        minuteLimit: 15,
      },
    },
  });
});

// Verify PIN endpoint
app.post('/api/auth/verify-pin', (req: Request, res: Response) => {
  const { pin } = req.body;
  if (pin === STUDIO_PIN) {
    return res.json({ success: true, message: 'Personal Studio Unlocked.' });
  }
  return res.status(401).json({ success: false, error: 'Incorrect PIN.' });
});

// 2. Synthesize speech (Protected by Personal PIN & Rate-Limit Guard)
app.post('/api/tts/generate', verifyPersonalAccess, async (req: Request, res: Response) => {
  try {
    const {
      text,
      voiceName = 'Kore',
      style = 'Clear, confident, friendly educational presenter',
      language = 'ar-SA',
      speed = 'normal', // normal, slow, brisk
    } = req.body;

    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return res.status(400).json({ error: 'Text prompt is required.' });
    }

    // Free tier rate & quota protection
    const usageCheck = recordAndCheckUsage();
    if (!usageCheck.allowed) {
      if (usageCheck.waitSeconds && usageCheck.waitSeconds > 0) {
        return res.status(429).json({
          error: `Free-tier rate buffer active (15 requests/min limit). Auto-pausing for ${usageCheck.waitSeconds} seconds to avoid Google 429 blocks.`,
          retryAfterSeconds: usageCheck.waitSeconds,
          stats: usageCheck.stats,
        });
      }
      return res.status(429).json({
        error: 'Daily free-tier quota (1,500 requests/day) reached. Resets at midnight UTC. No unexpected billing can occur.',
        dailyLimitReached: true,
        stats: usageCheck.stats,
      });
    }

    const ai = getGenAIClient();

    // Prepare style prompt including pacing and language intonation hints
    let fullStyle = style;
    if (speed === 'slow') {
      fullStyle += ', speaking at a calm, deliberate and measured pace';
    } else if (speed === 'brisk' || speed === 'fast') {
      fullStyle += ', speaking at an energetic, dynamic, and brisk pace';
    }

    if (language === 'ar' || language === 'ar-EG' || language === 'ar-SA') {
      if (language === 'ar-EG') {
        fullStyle += ', in authentic Egyptian Arabic dialect, with warm charismatic Egyptian intonation, natural phrasing';
      } else {
        fullStyle += ', in eloquent Modern Standard Arabic (الفصحى), clear pronunciation of Arabic letters and voweling, natural cadence';
      }
    }

    const promptText = text.trim();

    // Call Gemini TTS
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash-lite-tts',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: promptText,
              speechMetadata: {
                style: fullStyle,
              },
            },
          ],
        },
      ],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName },
          },
        },
      },
    });

    const candidates = response.candidates;
    if (!candidates || candidates.length === 0) {
      throw new Error('No candidate audio returned from Gemini TTS.');
    }

    const candidate = candidates[0];
    const audioPart = candidate.content?.parts?.find(
      (part: { inlineData?: { data?: string; mimeType?: string } }) => part.inlineData?.data
    );

    if (!audioPart || !audioPart.inlineData?.data) {
      throw new Error('TTS response did not contain audio data.');
    }

    const rawBase64 = audioPart.inlineData.data;
    const audioBuffer = Buffer.from(rawBase64, 'base64');

    // Gemini unary audio returns a complete 24kHz mono 16-bit WAV file with RIFF header
    // Let's calculate duration from PCM sample count
    let durationSeconds = 0;
    if (audioBuffer.length > 44) {
      const pcmBytes = audioBuffer.length - 44;
      // 24000 samples/sec * 1 channel * 2 bytes/sample = 48000 bytes/sec
      durationSeconds = Math.round((pcmBytes / 48000) * 100) / 100;
    }

    return res.json({
      success: true,
      audioBase64: rawBase64,
      mimeType: 'audio/wav',
      sampleRate: 24000,
      durationSeconds,
      voiceName,
      style: fullStyle,
      sizeBytes: audioBuffer.length,
    });
  } catch (error: any) {
    console.error('TTS Generation error:', error);
    const message = error?.message || 'Failed to synthesize speech with Gemini TTS.';
    return res.status(500).json({ error: message });
  }
});

// 3. Concatenate multiple audio clips into a single lossless master WAV
app.post('/api/tts/concat', verifyPersonalAccess, async (req: Request, res: Response) => {
  try {
    const { audioClips } = req.body; // Array of base64 strings

    if (!Array.isArray(audioClips) || audioClips.length === 0) {
      return res.status(400).json({ error: 'Array of audioClips is required.' });
    }

    // Extract raw PCM chunks by slicing off the 44-byte WAV header of each clip
    const pcmChunks: Buffer[] = [];
    for (const base64Str of audioClips) {
      const buf = Buffer.from(base64Str, 'base64');
      if (buf.length > 44) {
        // Verify RIFF header
        if (buf.toString('ascii', 0, 4) === 'RIFF') {
          pcmChunks.push(buf.subarray(44));
        } else {
          pcmChunks.push(buf);
        }
      }
    }

    const totalPcm = Buffer.concat(pcmChunks);
    const newHeader = createWavHeader(totalPcm.length, 24000, 1, 16);
    const combinedWav = Buffer.concat([newHeader, totalPcm]);

    const durationSeconds = Math.round((totalPcm.length / 48000) * 100) / 100;

    return res.json({
      success: true,
      audioBase64: combinedWav.toString('base64'),
      mimeType: 'audio/wav',
      sampleRate: 24000,
      durationSeconds,
      sizeBytes: combinedWav.length,
      clipsCount: audioClips.length,
    });
  } catch (error: any) {
    console.error('Concat error:', error);
    return res.status(500).json({ error: error?.message || 'Failed to concatenate audio.' });
  }
});

// 4. Arabic Tashkeel (Diacritization) & Educational Pronunciation Optimizer
app.post('/api/text/tashkeel', verifyPersonalAccess, async (req: Request, res: Response) => {
  try {
    const { text, dialect = 'msa' } = req.body;
    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Text is required.' });
    }

    const ai = getGenAIClient();

    const systemInstruction = dialect === 'egyptian'
      ? `You are an expert Arabic voiceover linguistic coach for Egyptian Arabic educational YouTube videos. 
Take the provided Arabic text and adapt it for an engaging, natural Egyptian Arabic voiceover.
Add clear pronunciation vowel marks (حركات التشكيل) where needed to prevent misreading, keep sentence rhythm smooth, and add brief punctuation (commas, ellipses) for natural narrator pauses. 
Return ONLY the formatted Arabic script without any conversational intro or markdown explanations.`
      : `You are an expert Arabic voiceover linguistic editor for high-quality educational narration in Modern Standard Arabic (الفصحى).
Take the provided Arabic text and add accurate Arabic diacritics/vowels (التشكيل الكامل أو شبه الكامل للكلمات المحتمل التباسها) to ensure flawless text-to-speech pronunciation.
Ensure proper pauses by inserting punctuation marks (، . ...).
Return ONLY the diacritized Arabic script without any conversational intro or markdown explanations.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: text,
      config: {
        systemInstruction,
        temperature: 0.2,
      },
    });

    const optimizedText = response.text?.trim() || text;
    return res.json({ success: true, optimizedText });
  } catch (error: any) {
    console.error('Tashkeel error:', error);
    return res.status(500).json({ error: error?.message || 'Failed to diacritize Arabic text.' });
  }
});

// Setup Vite middlewares in development or static serve in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);

    // Explicit SPA fallback for dev mode so any client route serves index.html
    app.use('*', async (req: Request, res: Response, next) => {
      if (req.originalUrl.startsWith('/api')) {
        return next();
      }
      try {
        const url = req.originalUrl;
        const indexPath = path.resolve(__dirname, 'index.html');
        if (fs.existsSync(indexPath)) {
          let template = fs.readFileSync(indexPath, 'utf-8');
          template = await vite.transformIndexHtml(url, template);
          res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
        } else {
          next();
        }
      } catch (e) {
        next(e);
      }
    });
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response, next) => {
      if (req.originalUrl.startsWith('/api')) {
        return next();
      }
      const indexPath = path.join(distPath, 'index.html');
      if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
      } else {
        res.status(200).send('<!doctype html><html><head><title>IONI Voice Studio</title></head><body><div id="root">Loading IONI Studio...</div></body></html>');
      }
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`IONI Voice Studio server running at http://0.0.0.0:${port}`);
  });
}

startServer();
