// =====================================================================
//  CRYO QUEST - SETTINGS YOU CAN EDIT
//  Open this file in Notepad, change values, save, and restart the game.
// =====================================================================
window.CQ_CONFIG = {

  // Name printed on the certificate at the end ("A CRYO-ET SCIENTIST AT ...")
  labName: 'OUR CRYO-EM LAB',
  // The same name in Spanish (leave '' to use labName)
  labNameSpanish: '',

  // Language the game starts in: 'en' = English, 'es' = Español.
  // Players can switch on the title screen (left/right or click); their choice is remembered.
  language: 'en',

  // Shown in the bottom right corner of the title screen ('' to hide)
  copyright: '© 2026 EVAN KRYSTOFIAK',

  // Pip's voice. true = talk, false = silent (text only)
  voice: true,

  // If you record real voice lines, put them in the "voice" folder as <LINE_ID>.mp3
  // (see VOICE_SCRIPT.csv for every line ID). They are used automatically.
  useRecordedVoice: true,

  // Leave empty to pick automatically, or put part of a voice name, e.g. 'Zira' or 'Aria'
  voiceName: '',
  // Spanish voice, e.g. 'Dalia', 'Paloma' or 'Sabina'. Spanish recordings go in voice/es/<LINE_ID>.mp3
  // (see VOICE_SCRIPT_ES.csv). If the computer has no Spanish voice, Pip's Spanish lines are text only.
  voiceNameSpanish: '',

  musicVolume: 0.5,   // 0.0 - 1.0
  sfxVolume: 0.8,     // 0.0 - 1.0

  // Kiosk: seconds without any button press before "STILL THERE?" appears
  idleTimeoutSeconds: 60,

  // The poster on the lab wall (pixel art, 74 x 49 pixels)
  labPosterImage: 'assets/art/lab_poster.png',

  // -------------------------------------------------------------------
  //  REAL PICTURES FROM YOUR LAB
  //  Put image files (PNG or JPG) in the assets/data folder and type the
  //  file names below. Leave '' (empty) to skip that card.
  //  They are shown after each stage as "THE REAL THING!"
  //  The built-in captions are translated automatically. For your own captions
  //  you can add a Spanish one too, e.g.  caption_es: '¡UNA LAMELA DE VERDAD!'
  // -------------------------------------------------------------------
  real: {
    // after stage 1 (freezing): e.g. a photo of your plunger, or a grid atlas
    freeze: { image: '', caption: 'A REAL FROZEN GRID!' },

    // after stage 2 (FIB-SEM): e.g. an SEM or FIB image of a finished lamella
    fib: { image: '', caption: 'A REAL LAMELLA!' },

    // after stage 3 (Krios): e.g. one tilt image, or a photo of the Krios
    krios: { image: '', caption: 'A REAL MICROSCOPE PICTURE!' },

    // finale: a tomogram. EITHER a list of slice images in order...
    //   slices: ['slice_01.png', 'slice_02.png', ...]
    // ...OR a movie file (MP4):  video: 'tomogram.mp4'
    tomogram: { slices: [], video: '', caption: 'A REAL TOMOGRAM!' },

    // -----------------------------------------------------------------
    //  OPTIONAL: different pictures for each sample the kids can pick.
    //  Anything filled in here is used instead of the general picture
    //  above when that sample was chosen. Leave '' to use the general one.
    // -----------------------------------------------------------------
    bacteria: {
      freeze: { image: '', caption: 'REAL FROZEN BACTERIA!' },
      fib: { image: '', caption: 'A REAL LAMELLA OF BACTERIA!' },
      krios: { image: '', caption: 'REAL BACTERIA IN THE MICROSCOPE!' },
      tomogram: { slices: [], video: '', caption: 'A REAL BACTERIA TOMOGRAM!' },
    },
    yeast: {
      freeze: { image: '', caption: 'REAL FROZEN YEAST!' },
      fib: { image: '', caption: 'A REAL LAMELLA OF YEAST!' },
      krios: { image: '', caption: 'REAL YEAST IN THE MICROSCOPE!' },
      tomogram: { slices: [], video: '', caption: 'A REAL YEAST TOMOGRAM!' },
    },
    worm: {
      freeze: { image: '', caption: 'A REAL FROZEN WORM!' },
      fib: { image: '', caption: 'A REAL LAMELLA OF A WORM!' },
      krios: { image: '', caption: 'A REAL WORM IN THE MICROSCOPE!' },
      tomogram: { slices: [], video: '', caption: 'A REAL WORM TOMOGRAM!' },
    },
  },
};
