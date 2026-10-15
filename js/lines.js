// CRYO QUEST - every line Pip says.
//   t   = text shown on screen (keep it short: players are 5-7 years old)
//   say = optional different wording for the speaking voice (pronunciation help)
// To record real voice-over later, save each line as voice/<ID>.mp3 (for example voice/intro_1.mp3).
(function () {
  'use strict';
  window.CQ.LINES = {
    // --- title / kiosk ---
    attract_1: { t: 'PRESS THE GREEN A BUTTON TO PLAY!' },
    idle_1: { t: 'ARE YOU STILL THERE? PRESS A TO KEEP PLAYING!' },
    pick_1: { t: 'PICK YOUR SCIENTIST!', say: 'Pick your scientist! Move left or right, then press A.' },

    // --- intro ---
    intro_1: { t: "HI! I'M PIP THE PENGUIN!" },
    intro_2: { t: 'I WANT TO SEE INSIDE A TINY, TINY CELL.' },
    intro_3: { t: 'CELLS ARE TOO SMALL TO SEE WITH OUR EYES!' },
    intro_4: { t: "LET'S MAKE A 3D PICTURE OF ONE. FOLLOW ME!", say: "Let's make a 3 D picture of one. Follow me!" },

    // --- lab hub ---
    hub_go0: { t: 'WALK TO THE FREEZERS. LOOK FOR THE GOLD ARROW!' },
    hub_go1: { t: 'NEXT STOP: THE FIB-SEM! FOLLOW THE ARROW.', say: 'Next stop: the fib S E M! Follow the arrow.' },
    hub_go2: { t: 'NOW THE GIANT MICROSCOPE: THE KRIOS!', say: 'Now the giant microscope: the Cry-oss!' },
    hub_go3: { t: 'LAST STOP: THE COMPUTER!' },
    hub_hint: { t: 'USE THE STICK TO WALK. PRESS A AT THE GOLD ARROW!' },
    hub_locked: { t: "NOT YET! LET'S GO IN ORDER. FOLLOW THE GOLD ARROW." },
    hub_done: { t: 'WE DID THAT ONE ALREADY. FOLLOW THE GOLD ARROW!' },

    // --- stage 1: freezing ---
    fr_1: { t: 'THIS IS THE FREEZING STATION. BRRR!' },
    fr_pick: { t: 'WHAT SHALL WE LOOK INSIDE TODAY? PICK A SAMPLE!' },
    name_bacteria: { t: 'BACTERIA!' },
    name_yeast: { t: 'YEAST!' },
    name_worm: { t: 'A TINY WORM!' },
    fr_bac_1: { t: 'BACTERIA ARE SUPER TINY. SOME LIVE IN YOUR TUMMY AND HELP YOU!' },
    fr_bac_2: { t: 'A DROP OF BACTERIA IS VERY THIN.' },
    fr_yeast_1: { t: 'YEAST IS A TINY FUNGUS. IT HELPS MAKE BREAD FLUFFY!' },
    fr_yeast_2: { t: 'A DROP OF YEAST CELLS IS THIN.' },
    fr_worm_1: { t: 'THIS LITTLE WORM IS SMALLER THAN A GRAIN OF RICE!' },
    fr_worm_2: { t: 'BUT IT IS MUCH THICKER THAN A DROP OF CELLS.' },
    fr_2: { t: 'WATER IN CELLS CAN TURN INTO SPIKY ICE CRYSTALS.' },
    fr_4: { t: 'SO WE FREEZE SUPER FAST. THE WATER TURNS INTO SMOOTH GLASS ICE!' },
    fr_rule: { t: 'THIN THINGS: PLUNGE FREEZER. THICK THINGS: HIGH PRESSURE FREEZER.',
      say: 'Thin things go in the plunge freezer. Thick things go in the high pressure freezer.' },
    fr_ask: { t: 'WHICH MACHINE SHOULD WE USE?' },
    fr_wrong_thin: { t: 'HMM... THAT ONE IS FOR THICK THINGS. TRY THE OTHER ONE!' },
    fr_wrong_thick: { t: 'HMM... THAT ONE IS FOR THIN THINGS. TRY THE OTHER ONE!' },
    fr_right: { t: 'YES! GREAT CHOICE!' },

    pl_1: { t: 'THIS IS THE LEICA EM GP2. IT IS A PLUNGE FREEZER.', say: 'This is the Leica E M G P 2. It is a plunge freezer.' },
    pl_grid: { t: 'THE GRID IS A TINY METAL NET. IT IS SMALLER THAN YOUR FINGERNAIL!' },
    pl_drop: { t: 'PRESS A WHEN THE DROPPER IS OVER THE GRID!' },
    pl_miss: { t: 'OOPS, MISSED! TRY AGAIN.' },
    pl_hit: { t: 'PLOP! NICE DROP!' },
    pl_blot: { t: 'TOO MUCH WATER! HOLD A TO SOAK IT UP. LET GO IN THE GREEN!' },
    pl_blot_more: { t: 'A LITTLE MORE! HOLD A AGAIN.' },
    pl_blot_good: { t: 'PERFECT! A SUPER THIN LAYER OF WATER.' },
    pl_blot_dry: { t: 'A BIT TOO DRY, BUT OKAY!' },
    pl_plunge: { t: 'NOW QUICK! PRESS A TO PLUNGE!' },
    pl_cold: { t: 'SPLASH! INTO LIQUID ETHANE. IT IS ABOUT -180 °C!',
      say: 'Splash! Into liquid ethane. It is about minus 180 degrees!' },
    pl_pole: { t: "THAT'S EVEN COLDER THAN MY HOME AT THE SOUTH POLE!" },

    hp_1: { t: 'THIS IS THE LEICA EM ICE. IT IS A HIGH PRESSURE FREEZER.', say: 'This is the Leica E M Ice. It is a high pressure freezer.' },
    hp_load: { t: 'PRESS A TO TUCK THE WORM INTO ITS TINY METAL SANDWICH!' },
    hp_pump: { t: 'TAP A AGAIN AND AGAIN TO PUMP UP THE PRESSURE!' },
    hp_full: { t: 'FULL PRESSURE! FREEZE!' },
    hp_fact: { t: "THAT'S TWICE AS MUCH SQUEEZE AS THE BOTTOM OF THE DEEPEST OCEAN!" },
    hp_why: { t: 'SQUEEZING STOPS SPIKY ICE. THEN LIQUID NITROGEN FREEZES IT IN A FLASH!' },

    ice_1: { t: "LET'S ZOOM IN ON THE WATER!" },
    ice_slow: { t: 'FROZEN SLOWLY, WATER MAKES SPIKY CRYSTALS. OUCH!' },
    ice_fast: { t: 'FROZEN SUPER FAST, IT BECOMES SMOOTH GLASS ICE. THE CELL IS SAFE!' },
    ice_word: { t: 'SCIENTISTS CALL THIS VITRIFICATION!', say: 'Scientists call this vitrification! That means turning into glass.' },
    fr_done: { t: 'YOUR SAMPLE IS FROZEN! NOW WE KEEP IT SUPER COLD.' },
    fr_next: { t: "LET'S TAKE IT TO THE FIB-SEM!", say: "Let's take it to the fib S E M!" },

    // --- stage 2: cryo-FIB-SEM ---
    fib_1: { t: 'THIS IS THE ZEISS CROSSBEAM 550.', say: 'This is the Zeiss Crossbeam five fifty.' },
    fib_2: { t: 'IT HAS TWO BEAMS: ONE TO LOOK, AND ONE TO CUT!' },
    fib_why: { t: 'OUR SAMPLE IS TOO THICK TO SEE THROUGH. WE MUST CUT A THIN SLICE!' },
    fib_find: { t: 'FIND A NICE, WHOLE CELL. MOVE THE TARGET AND PRESS A!' },
    fib_find_worm: { t: 'FIND A NICE, WHOLE WORM. MOVE THE TARGET AND PRESS A!' },
    fib_bad_bar: { t: 'THAT ONE IS ON THE METAL BAR. TRY ANOTHER!' },
    fib_bad_broken: { t: 'THAT ONE IS BROKEN. TRY ANOTHER!' },
    fib_bad_clump: { t: 'TOO MANY CELLS SQUISHED TOGETHER. TRY ANOTHER!' },
    fib_bad_none: { t: "THERE'S NOTHING THERE. LOOK FOR A BUMP!", say: "There's nothing there. Look for a bump!" },
    fib_good: { t: 'WHAT A NICE CELL!' },
    fib_good_worm: { t: 'WHAT A NICE WORM!' },
    fib_coat: { t: 'FIRST, A SHINY METAL COAT TO PROTECT THE TOP. HOLD A TO SPRAY!' },
    fib_coat_done: { t: 'SHINY! LIKE A SUIT OF ARMOR.' },
    fib_mill: { t: 'NOW THE ION BEAM! HOLD A AND DIG AWAY THE ORANGE PARTS.' },
    fib_keep: { t: 'KEEP THE GOLD SLICE IN THE MIDDLE!' },
    fib_careful: { t: "CAREFUL! DON'T DIG THE GOLD SLICE!" },
    fib_polish: { t: 'GREAT DIGGING! NOW POLISH IT EVEN THINNER.' },
    fib_done: { t: 'WE MADE A LAMELLA! THAT MEANS A SUPER THIN SLICE.' },
    fib_fact: { t: "IT'S HUNDREDS OF TIMES THINNER THAN ONE HAIR!" },
    fib_next: { t: 'NOW TO THE GIANT MICROSCOPE: THE KRIOS!', say: 'Now to the giant microscope: the Cry-oss!' },

    // --- stage 3: Titan Krios G4 ---
    kr_1: { t: 'THIS IS THE TITAN KRIOS G4. IT IS HUGE!', say: 'This is the Titan Cry-oss G 4. It is huge!' },
    kr_2: { t: 'IT SHOOTS TINY ELECTRONS THROUGH OUR SLICE TO TAKE PICTURES.' },
    kr_3: { t: 'INSIDE THERE IS NO AIR AT ALL, AND IT STAYS SUPER COLD!' },
    kr_load: { t: 'PRESS A TO LOAD OUR GRID INTO THE ROBOT LOADER!' },
    kr_find: { t: 'WHERE IS OUR SLICE? FIND THE GLOWING LAMELLA AND PRESS A!' },
    kr_found: { t: 'THERE IT IS! ZOOM IN!' },
    kr_notit: { t: "THAT'S NOT IT. LOOK FOR THE GLOWING SLICE!" },
    kr_tilt1: { t: 'NOW WE TILT THE SLICE AND TAKE PICTURES FROM MANY SIDES.' },
    kr_tilt2: { t: 'LIKE WALKING AROUND A STATUE TO SEE ALL OF IT!' },
    kr_tilt3: { t: 'MOVE THE GOLD CIRCLE ONTO THE GLOWING PART. PRESS A TO SNAP!' },
    kr_miss: { t: 'OOPS! CENTER IT FIRST, THEN SNAP.' },
    kr_gentle: { t: 'ELECTRONS ARE STRONG. QUICK PICTURES KEEP THE CELL SAFE.' },
    kr_done: { t: 'WE TOOK 13 PICTURES! SCIENTISTS CALL THIS A TILT SERIES.' },
    kr_next: { t: "LET'S BUILD THE 3D PICTURE ON THE COMPUTER!", say: "Let's build the 3 D picture on the computer!" },

    // --- stage 4: tomogram ---
    tm_1: { t: 'THE COMPUTER PUTS ALL THE PICTURES TOGETHER...' },
    tm_2: { t: 'TA-DA! A 3D TOMOGRAM!', say: 'Ta da! A 3 D tomogram!' },
    tm_3: { t: 'NOW WE CAN DIVE THROUGH THE CELL, SLICE BY SLICE.' },
    tm_4: { t: 'PUSH UP AND DOWN TO DIVE. PRESS A WHEN SOMETHING GLOWS!' },
    tm_membrane: { t: "THE MEMBRANE! IT'S THE CELL'S SKIN." },
    tm_membrane_bac: { t: 'MEMBRANES! THIS KIND OF BACTERIA HAS TWO SKINS, ONE INSIDE THE OTHER!' },
    tm_ribosome: { t: 'RIBOSOMES! TINY FACTORIES THAT MAKE PROTEINS.' },
    tm_mito: { t: "A MITOCHONDRION! THE CELL'S POWER PLANT.", say: "A mito-condree-on! The cell's power plant." },
    tm_nucleus: { t: "THE NUCLEUS! IT KEEPS THE CELL'S DNA SAFE.", say: "The new-clee-us! It keeps the cell's D N A safe." },
    tm_dna: { t: "THE DNA! IT'S THE CELL'S INSTRUCTION BOOK. BACTERIA HAVE NO NUCLEUS.", say: "The D N A! It's the cell's instruction book. Bacteria have no new-clee-us." },
    tm_flagellum: { t: 'A FLAGELLUM! A TAIL THAT SPINS LIKE A PROPELLER!', say: 'A fla-jell-um! A tail that spins like a propeller!' },
    tm_muscle: { t: 'MUSCLE FIBERS! THEY PULL SO THE WORM CAN WIGGLE!' },
    tm_all: { t: 'YOU FOUND THEM ALL!' },
    tm_real: { t: 'AND THIS IS A REAL TOMOGRAM FROM OUR LAB!' },

    // --- rewards / ending ---
    real_1: { t: 'LOOK! THIS IS A REAL PICTURE FROM OUR LAB!' },
    stars_3: { t: 'AMAZING! THREE STARS!' },
    stars_2: { t: 'GREAT JOB! TWO STARS!' },
    stars_1: { t: 'GOOD JOB! YOU GOT A STAR!' },
    cert_1: { t: 'YOU DID IT! YOU ARE A CRYO-ET SCIENTIST!', say: 'You did it! You are a cryo E T scientist!' },
    cert_2: { t: 'THANKS FOR PLAYING. COME BACK SOON!' },
  };
})();
