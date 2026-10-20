// CRYO QUEST - languages (English / Español).
// The game code is written in English. In Spanish mode every on-screen label is swapped for its
// translation below (the font does this automatically), and Pip's lines come from lines_es.js.
(function () {
  'use strict';
  const CQ = window.CQ;

  // English on-screen text (ALL CAPS, exactly as drawn) -> Spanish
  const UI_ES = {
    // title screen + attract slides
    'A FROZEN ADVENTURE INTO THE CELL': 'UNA AVENTURA CONGELADA DENTRO DE LA CÉLULA',
    'TO PLAY!': 'PARA JUGAR',
    'CLICK OR PRESS ANY KEY FOR SOUND': 'HAZ CLIC O PULSA UNA TECLA PARA OÍR',
    'HOW TO BE A CRYO-ET SCIENTIST': 'CÓMO SER CIENTÍFICO/A DE CRIO-ET',
    'FREEZE IT!': '¡CONGÉLALA!',
    'SUPER FAST, INTO GLASS ICE': 'SÚPER RÁPIDO, EN HIELO DE VIDRIO',
    'SLICE IT!': '¡CÓRTALA!',
    'A BEAM CUTS A THIN SLICE': 'UN HAZ CORTA UNA REBANADA FINA',
    'SNAP IT!': '¡TOMA FOTOS!',
    'PICTURES FROM MANY SIDES': 'FOTOS DESDE MUCHOS LADOS',
    'SEE IT IN 3D!': '¡MÍRALA EN 3D!',
    'DIVE INSIDE A REAL CELL': 'BUCEA DENTRO DE UNA CÉLULA',

    // kiosk + shared
    'STILL THERE?': '¿SIGUES AHÍ?',
    'TO KEEP PLAYING': 'PARA SEGUIR JUGANDO',
    'GREAT WORK!': '¡BUEN TRABAJO!',
    'PRESS A!': '¡PRESIONA A!',
    'TO PICK': 'PARA ELEGIR',
    'TO CHOOSE': 'PARA ELEGIR',
    'PICK YOUR SCIENTIST!': '¡ELIGE TU PERSONAJE!',
    "LET'S GO!": '¡VAMOS!',
    'FREEZE': 'CONGELAR',
    'SLICE': 'CORTAR',
    'SNAP': 'FOTOS',
    'COLD': 'FRÍO',
    'BACTERIA': 'BACTERIAS',
    'YEAST': 'LEVADURA',
    'WORM': 'GUSANO',
    'OUR CRYO-EM LAB': 'NUESTRO LAB DE CRIO-EM',
    'OUR LAB': 'NUESTRO LAB',

    // stage 1: freezing
    'PICK A SAMPLE!': '¡ELIGE UNA MUESTRA!',
    'THIN': 'DELGADO',
    'THICK': 'GRUESO',
    'DROP': 'GOTA',
    'BLOT': 'SECAR',
    'PLUNGE': 'SUMERGIR',
    'PLUNGE!': '¡SUMERGE!',
    'LOAD': 'CARGAR',
    'SQUEEZE': 'APRETAR',
    'DRY': 'SECO',
    'HOLD TO SOAK': 'MANTÉN PARA SECAR',
    'TO DROP': 'PARA SOLTAR',
    'LIQUID ETHANE': 'ETANO LÍQUIDO',
    'LIQUID NITROGEN': 'NITRÓGENO LÍQUIDO',
    'TOP': 'ARRIBA',
    'BOTTOM': 'ABAJO',
    'CLOSE IT!': '¡CIÉRRALO!',
    'SAMPLE': 'MUESTRA',
    'TAP TAP!': '¡DALE, DALE!',
    "LET'S ZOOM IN ON THE WATER!": '¡VEAMOS EL AGUA DE CERCA!',
    'SLOW FREEZE': 'CONGELADO LENTO',
    'SUPER FAST FREEZE': 'CONGELADO SÚPER RÁPIDO',
    'OUCH!': '¡AY!',
    'SAFE!': '¡A SALVO!',
    'GLASS ICE': 'HIELO DE VIDRIO',
    'VITRIFICATION': 'VITRIFICACIÓN',

    // stage 2: cryo-FIB-SEM
    'FIND': 'BUSCAR',
    'COAT': 'CUBRIR',
    'DIG': 'EXCAVAR',
    'POLISH': 'PULIR',
    'LOOK': 'MIRAR',
    'ELECTRONS': 'ELECTRONES',
    'CUT': 'CORTAR',
    'IONS': 'IONES',
    'CRYO FIB-SEM': 'CRIO FIB-SEM',
    'SEM  ZOOM': 'SEM  ZOOM',
    'FIB  ION BEAM': 'FIB  HAZ DE IONES',
    'PICK A CELL': 'ELIGE UNA CÉLULA',
    'PICK A WORM': 'ELIGE UN GUSANO',
    'PLATINUM SPRAY': 'ROCÍO DE PLATINO',
    'HOLD!': '¡MANTÉN!',
    'KEEP': 'DEJAR',
    'OUR LAMELLA': 'NUESTRA LAMELA',
    'A SUPER THIN SLICE OF THE CELL': 'UNA REBANADA SÚPER FINA DE LA CÉLULA',
    'ONE HAIR': 'UN PELO',
    'OUR SLICE': 'NUESTRA REBANADA',
    'SO THIN!': '¡QUÉ FINA!',

    // stage 3: Krios
    'TILT + SNAP': 'GIRAR + FOTO',
    'GUN': 'CAÑÓN',
    'CAMERA': 'CÁMARA',
    'CRYO-TEM': 'CRIO-TEM',
    'ROBOT LOADER': 'CARGADOR ROBOT',
    'MICROSCOPE': 'MICROSCOPIO',
    'LOAD IT!': '¡CÁRGALO!',
    'GRID MAP': 'MAPA DE LA REJILLA',
    'EACH SQUARE IS': 'CADA CUADRITO ES',
    'A TINY WINDOW': 'UNA VENTANITA',
    'ZAP': 'ZAS',
    'SNAP!': '¡FOTO!',
    'OUR TILT SERIES': 'NUESTRA SERIE DE FOTOS',

    // stage 4: tomogram
    'TOMOGRAM BUILDER': 'CONSTRUCTOR DE TOMOGRAMAS',
    '3D!': '¡3D!',
    'DIVE THROUGH THE CELL!': '¡BUCEA POR LA CÉLULA!',
    'DOWN!': '¡ABAJO!',
    'UP!': '¡ARRIBA!',
    'FIND:': 'BUSCA:',
    'WHEEL = DIVE': 'RUEDA = BUCEAR',
    'UP/DOWN = DIVE': 'FLECHAS = BUCEAR',
    'STICK = DIVE': 'PALANCA = BUCEAR',
    'FOUND!': '¡LO ENCONTRASTE!',
    'MEMBRANE': 'MEMBRANA',
    'MEMBRANES': 'MEMBRANAS',
    'RIBOSOMES': 'RIBOSOMAS',
    'DNA': 'ADN',
    'FLAGELLUM': 'FLAGELO',
    'MITOCHONDRION': 'MITOCONDRIA',
    'NUCLEUS': 'NÚCLEO',
    'MUSCLE FIBERS': 'MÚSCULOS',

    // real pictures + certificate
    'THE REAL THING!': '¡ES DE VERDAD!',
    'NEXT': 'SIGUIENTE',
    'A REAL FROZEN GRID!': '¡UNA REJILLA CONGELADA DE VERDAD!',
    'A REAL LAMELLA!': '¡UNA LAMELA DE VERDAD!',
    'A REAL MICROSCOPE PICTURE!': '¡UNA FOTO DE MICROSCOPIO DE VERDAD!',
    'A REAL TOMOGRAM!': '¡UN TOMOGRAMA DE VERDAD!',
    'REAL FROZEN BACTERIA!': '¡BACTERIAS CONGELADAS DE VERDAD!',
    'A REAL LAMELLA OF BACTERIA!': '¡UNA LAMELA DE BACTERIAS DE VERDAD!',
    'REAL BACTERIA IN THE MICROSCOPE!': '¡BACTERIAS DE VERDAD EN EL MICROSCOPIO!',
    'A REAL BACTERIA TOMOGRAM!': '¡UN TOMOGRAMA DE BACTERIAS DE VERDAD!',
    'REAL FROZEN YEAST!': '¡LEVADURA CONGELADA DE VERDAD!',
    'A REAL LAMELLA OF YEAST!': '¡UNA LAMELA DE LEVADURA DE VERDAD!',
    'REAL YEAST IN THE MICROSCOPE!': '¡LEVADURA DE VERDAD EN EL MICROSCOPIO!',
    'A REAL YEAST TOMOGRAM!': '¡UN TOMOGRAMA DE LEVADURA DE VERDAD!',
    'A REAL FROZEN WORM!': '¡UN GUSANO CONGELADO DE VERDAD!',
    'A REAL LAMELLA OF A WORM!': '¡UNA LAMELA DE GUSANO DE VERDAD!',
    'A REAL WORM IN THE MICROSCOPE!': '¡UN GUSANO DE VERDAD EN EL MICROSCOPIO!',
    'A REAL WORM TOMOGRAM!': '¡UN TOMOGRAMA DE GUSANO DE VERDAD!',
    'CERTIFICATE': 'CERTIFICADO',
    'STARS': 'ESTRELLAS',
    'WE LOOKED INSIDE:': 'MIRAMOS DENTRO DE:',
    'TO FINISH': 'PARA TERMINAR',
  };

  // labels with numbers or names in them
  const PATTERNS_ES = [
    [/^EXPLORERS TODAY: (\d+)$/, 'EXPLORADORES HOY: $1'],
    [/^EXPLORER #(\d+) AT (.+)$/, (m, n, lab) => 'EXPLORADOR/A #' + n + ' EN ' + (UI_ES[lab] || lab)],
    [/^EXPLORER #(\d+)$/, 'EXPLORADOR/A #$1'],
    [/^PICTURE (\d+) OF (\d+)$/, 'FOTO $1 DE $2'],
    [/^SLICE (\d+)\/(\d+)$/, 'CORTE $1/$2'],
  ];

  const LANGS = ['en', 'es'];

  const i18n = CQ.i18n = {
    langs: LANGS,
    names: { en: 'ENGLISH', es: 'ESPAÑOL' },
    lang: LANGS.indexOf(CQ.settings.lang) >= 0 ? CQ.settings.lang : 'en',

    // translate one ALL-CAPS on-screen label (anything not listed is drawn as-is)
    ui(str) {
      if (i18n.lang !== 'es') return str;
      const t = UI_ES[str];
      if (t !== undefined) return t;
      for (const p of PATTERNS_ES) if (p[0].test(str)) return str.replace(p[0], p[1]);
      return str;
    },

    // one of Pip's lines by id, in the current language (falls back to English)
    line(id) {
      return (i18n.lang === 'es' && CQ.LINES_ES && CQ.LINES_ES[id]) || (CQ.LINES && CQ.LINES[id]) || null;
    },

    set(lang) {
      if (LANGS.indexOf(lang) < 0 || lang === i18n.lang) return;
      i18n.lang = lang;
      CQ.settings.lang = lang;
      CQ.saveSettings();
      document.documentElement.lang = lang;
      if (CQ.sprites && CQ.sprites.relabel) CQ.sprites.relabel();
      if (CQ.voice && CQ.voice.langChanged) CQ.voice.langChanged();
    },
    next(d) {
      const i = LANGS.indexOf(i18n.lang);
      i18n.set(LANGS[(i + (d || 1) + LANGS.length) % LANGS.length]);
    },
  };
  document.documentElement.lang = i18n.lang;
})();
