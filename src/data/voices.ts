import { VoiceProfile } from '../types';

export const VOICES: VoiceProfile[] = [
  {
    id: 'kore',
    name: 'Kore',
    displayName: 'Kore (IONI Primary Presenter)',
    gender: 'Female',
    supportedLanguages: [
      { code: 'ar-SA', label: 'العربية (الفصحى)' },
      { code: 'ar-EG', label: 'العربية (اللهجة المصرية)' },
      { code: 'en-US', label: 'English (US)' },
    ],
    defaultStyle: 'Clear, confident, friendly educational presenter',
    toneTag: 'Educational & Warm',
    category: 'educational',
    description: 'The signature voice of the IONI educational YouTube channel. Articulate, inspiring, and exceptionally clear for scientific and technical tutorials.',
    avatarColor: 'from-cyan-500 to-blue-600',
    avatarGradient: 'bg-gradient-to-tr from-cyan-500 to-blue-600',
    arabicSample: 'مرحباً بكم في قناة أيوني التعليمية. اليوم سنكتشف معاً كيف يغير الذكاء الاصطناعي طريقة صناعة المحتوى المرئي والمسموع.',
    englishSample: 'Welcome to IONI Studio! Today we are exploring how next-generation AI speech synthesis brings educational storytelling to life.',
    isIoniDefault: true,
  },
  {
    id: 'fenrir',
    name: 'Fenrir',
    displayName: 'Fenrir (Deep Storyteller)',
    gender: 'Male',
    supportedLanguages: [
      { code: 'ar-SA', label: 'العربية (الفصحى)' },
      { code: 'ar-EG', label: 'العربية (اللهجة المصرية)' },
      { code: 'en-US', label: 'English (US)' },
    ],
    defaultStyle: 'Warm, rich, cinematic storyteller with emotional depth',
    toneTag: 'Storyteller & Deep',
    category: 'storytelling',
    description: 'A deep, resonant baritone that draws listeners into historical narratives, documentary intros, and philosophical concepts.',
    avatarColor: 'from-blue-600 to-indigo-800',
    avatarGradient: 'bg-gradient-to-tr from-blue-600 to-indigo-800',
    arabicSample: 'في أعماق التاريخ، كانت المعرفة تنتقل عبر الكلمات المنطوقة، واليوم نكتب فصلاً جديداً في تاريخ التواصل الإنساني.',
    englishSample: 'Throughout history, great stories have shaped civilizations. Now, voice technology opens an entirely new chapter of human imagination.',
  },
  {
    id: 'puck',
    name: 'Puck',
    displayName: 'Puck (Energetic Tech Host)',
    gender: 'Male',
    supportedLanguages: [
      { code: 'ar-SA', label: 'العربية (الفصحى)' },
      { code: 'ar-EG', label: 'العربية (اللهجة المصرية)' },
      { code: 'en-US', label: 'English (US)' },
    ],
    defaultStyle: 'Energetic, fast-paced, enthusiastic tech explainer',
    toneTag: 'Energetic & Modern',
    category: 'energetic',
    description: 'Brisk, charismatic, and youthful. Outstanding for YouTube Shorts, fast tech breakdowns, opening hooks, and engaging tutorials.',
    avatarColor: 'from-emerald-400 to-cyan-600',
    avatarGradient: 'bg-gradient-to-tr from-emerald-400 to-cyan-600',
    arabicSample: 'خلونا نبتدي على طول بدون تضييع وقت! في فيديو اليوم هنشرح خمس خطوات عملية وسريعة هتغير طريقة مونتاجك تماماً!',
    englishSample: "Let's jump right in! In today's video, I will show you five game-changing workflows to level up your YouTube video production!",
  },
  {
    id: 'zephyr',
    name: 'Zephyr',
    displayName: 'Zephyr (Calm & Academic)',
    gender: 'Female',
    supportedLanguages: [
      { code: 'ar-SA', label: 'العربية (الفصحى)' },
      { code: 'ar-EG', label: 'العربية (اللهجة المصرية)' },
      { code: 'en-US', label: 'English (US)' },
    ],
    defaultStyle: 'Calm, gentle, crystal-clear academic instructor',
    toneTag: 'Calm & Mindful',
    category: 'calm',
    description: 'Soothing and analytical. Ideal for complex scientific explainers, medical education, step-by-step programming, and bedtime knowledge.',
    avatarColor: 'from-teal-400 to-sky-600',
    avatarGradient: 'bg-gradient-to-tr from-teal-400 to-sky-600',
    arabicSample: 'لنأخذ دقيقة للتفكير في آلية عمل الخلايا العصبية. كل فكرة تراودك الآن هي نتيجة نبضات كهربائية متناغمة بدقة متناهية.',
    englishSample: 'Take a gentle moment to observe how complex neural systems operate. Every thought begins as a harmonious pulse of electrical energy.',
  },
  {
    id: 'charon',
    name: 'Charon',
    displayName: 'Charon (Authoritative Documentary)',
    gender: 'Male',
    supportedLanguages: [
      { code: 'ar-SA', label: 'العربية (الفصحى)' },
      { code: 'ar-EG', label: 'العربية (اللهجة المصرية)' },
      { code: 'en-US', label: 'English (US)' },
    ],
    defaultStyle: 'Authoritative, serious, broadcast-grade documentary narrator',
    toneTag: 'Authoritative & Solid',
    category: 'authoritative',
    description: 'Imposing, deep, and trustworthy voice suited for geopolitical analyses, astronomy documentaries, and formal YouTube presentations.',
    avatarColor: 'from-slate-600 to-slate-900',
    avatarGradient: 'bg-gradient-to-tr from-slate-600 to-slate-900',
    arabicSample: 'الكون الفسيح لا يتوقف عن التمدد، وبينما ننظر إلى النجوم البعيدة، نحن في الواقع ننظر إلى الماضي السحيق للمجرة.',
    englishSample: 'The universe expands silently across billions of light years. When we gaze into deep space, we are observing the distant dawn of time itself.',
  },
  {
    id: 'aoede',
    name: 'Aoede',
    displayName: 'Aoede (Expressive & Friendly)',
    gender: 'Female',
    supportedLanguages: [
      { code: 'ar-SA', label: 'العربية (الفصحى)' },
      { code: 'ar-EG', label: 'العربية (اللهجة المصرية)' },
      { code: 'en-US', label: 'English (US)' },
    ],
    defaultStyle: 'Expressive, joyful, friendly and melodic instructor',
    toneTag: 'Friendly & Cheerful',
    category: 'friendly',
    description: 'Bright and encouraging. Specially tuned for language learning tutorials, creative writing, and student engagement.',
    avatarColor: 'from-fuchsia-500 to-pink-600',
    avatarGradient: 'bg-gradient-to-tr from-fuchsia-500 to-pink-600',
    arabicSample: 'تعلم أشياء جديدة لا ينبغي أن يكون مملاً أبداً! فلنكتشف معاً أسرار اللغات وكيف نتحدث بطلاقة وثقة.',
    englishSample: 'Learning should always feel like an adventure! Join me as we uncover simple secrets to speaking with clarity and total confidence.',
  },
];

export const STYLE_PRESETS = [
  {
    id: 'educational',
    label: 'Educational Presenter (قناة تعليمية)',
    prompt: 'Clear, confident, friendly educational presenter speaking with instructional clarity and engaging pace',
    icon: 'GraduationCap',
  },
  {
    id: 'storyteller',
    label: 'Dramatic Storyteller (سرد وثائقي)',
    prompt: 'Warm, cinematic storyteller with natural pauses, emotional resonance, and immersive rhythm',
    icon: 'BookOpen',
  },
  {
    id: 'energetic',
    label: 'High Energy Hook (حماسي وتشويقي)',
    prompt: 'Energetic, fast, dynamic, enthusiastic YouTube creator grabbing audience attention immediately',
    icon: 'Zap',
  },
  {
    id: 'calm',
    label: 'Calm & Analytical (هادئ وتحليلي)',
    prompt: 'Calm, measured, gentle, crystal-clear academic instructor with steady pacing',
    icon: 'Feather',
  },
  {
    id: 'friendly',
    label: 'Friendly Conversational (حوار ودي)',
    prompt: 'Friendly, natural, approachable YouTuber speaking directly to a friend with warmth',
    icon: 'Smile',
  },
];

export const SAMPLE_SCRIPTS = {
  arabicEdu: `مرحباً بكم في حلقة جديدة من قناة أيوني التعليمية!
اليوم سنستكشف واحداً من أعظم الاكتشافات العلمية في القرن الحادي والعشرين.
كيف تعمل شبكات التعلم العميق على تحويل النصوص العادية إلى أصوات بشرية متقنة؟
تابعوا معنا هذه التجربة الفريدة، ولا تنسوا الاشتراك في القناة وتفعيل زر الجرس لتصلكم أحدث الحلقات!`,
  
  egyptianReview: `أهلاً بيكم يا شباب في حلقة جديدة ومهمة جداً!
النهارده هنراجع مع بعض أفضل طريقة تعمل بيها فويس أوفر احترافي لفيديوهات اليوتيوب وتيك توك بدون أي معدات معقدة.
شايفين النتيجة والصوت الطبيعي؟ تقدروا تنزلو الملف الصوتي مباشرة وتدمجوه في برنامج كاب كات بضغطة زر واحدة!`,

  englishTutorial: `Welcome back to IONI Studio!
In this tutorial, we will break down the essential workflow for synchronizing AI-generated voiceovers with CapCut timeline markers.
Notice the cadence, clarity, and natural breathing pauses.
Whether you are creating educational documentaries or fast-paced YouTube Shorts, natural audio makes all the difference.`,
};
