# CRYO QUEST

A 16-bit style educational game about **cryo-electron tomography (cryo-ET)** for children aged 5–7.
It is built for an **outreach event kiosk** with an **Xbox controller**, and it also works with a mouse or keyboard.

Kids follow **Pip the penguin** through the lab:

| Stage | Instrument | What the kids do | Science idea |
|---|---|---|---|
| 1. FREEZE | Leica EM GP2 plunge freezer **or** Leica EM ICE high-pressure freezer | Pick a sample (**bacteria, yeast or a worm**), then pick the right freezer: thin drops of bacteria or yeast go in the plunger, the thick worm goes in the HPF. Plunger: drop, blot, plunge into liquid ethane. HPF: close the sample "sandwich", pump to ~2,100 bar, freeze. | Fast freezing turns water into smooth **glass ice** (vitrification) instead of spiky crystals |
| 2. SLICE | Zeiss Crossbeam 550 cryo-FIB-SEM | Find a good cell (rods, budding yeast or worms, depending on the sample) in the SEM image, spray a platinum coat, then dig away the top and bottom with the ion beam, then polish | A **lamella** is a slice hundreds of times thinner than a hair, so electrons can pass through |
| 3. SNAP | Titan Krios G4 | Load the grid with the robot loader, find the lamella on the grid map, then keep the target in the circle and snap 13 pictures from −60° to +60° | A **tilt series**: pictures from many angles, using as few electrons as possible |
| 4. 3D | Computer | Watch the pictures combine into a 3D **tomogram**, then dive through it slice by slice to find four things (see below) | Each slice of a tomogram shows the inside of the cell |

The sample the kid picks follows them through the whole game:

| Sample | Freezer | What they find in the tomogram |
|---|---|---|
| **Bacteria** (rod-shaped, like *E. coli*) | Plunge freezer | Membranes (two!), ribosomes, DNA (no nucleus), flagellum |
| **Yeast** (budding yeast) | Plunge freezer | Membrane, ribosomes, mitochondrion, nucleus |
| **Worm** (*C. elegans*) | High-pressure freezer | Membrane, ribosomes, mitochondrion, muscle fibers |

When a kid moves between the samples, Pip says each name out loud for children who can't read yet.

One play-through takes about 6–9 minutes. There is no way to fail; kids earn 1–3 stars per stage and get a certificate at the end.

---

## How to start

* **Double-click `CryoQuest.exe`** → full screen (kiosk mode). **Exit with Alt+F4.**
* To play in a normal window (for testing): run `CryoQuest.exe --window`, or double-click
  `Play CRYO QUEST (backup).bat` with the word `window` after it.
* If Windows blocks the .exe, use **`Play CRYO QUEST (backup).bat`** (same thing).
* You can also just open `index.html` in Edge or Chrome. In that case click once (or press a key) so the
  browser allows sound and Pip's voice. The .exe and .bat do this for you.

Nothing needs to be installed. The game runs **offline**. It needs Microsoft Edge (built into Windows 10/11)
or Google Chrome. The .exe is a tiny launcher that opens the game in Edge's kiosk mode with a separate
profile, so it does not touch anyone's normal browser.

## Controls

| | Xbox controller | Keyboard | Mouse / touch |
|---|---|---|---|
| Move / aim | Left stick or D-pad | Arrow keys | Move the pointer, click where to walk |
| Do it! | **A** | **A**, Space or Enter | Click / tap (hold to keep spraying or digging) |
| Dive through tomogram | Stick up/down (or LB/RB) | Up/Down | Mouse wheel or drag the slider |

Connect or pair the controller **before** starting the game. Press A once on the title screen so the
browser notices it.

## Kiosk tips

* **Idle reset:** after 60 seconds with no input, "STILL THERE?" appears, and the game returns to the title after 10 more seconds.
* **Attract mode:** the title screen shows a short "how it works" slideshow when nobody is playing.
* **Explorer counter:** the title screen shows how many kids played today, which is handy for outreach reports.
* **Staff menu:** press **F2**, or **hold View + Menu on the controller for 3 seconds**. From there you can:
  turn the voice on/off, choose a voice, set music/sound volume, change the idle time, reset the explorer
  count, or restart the game.
* Set Windows to never sleep or turn off the screen (Settings → System → Power).
* To start automatically when the PC logs in: press Win+R, type `shell:startup`, and put a shortcut
  to `CryoQuest.exe` in that folder.
* For a locked-down kiosk you can also use Windows "Assigned access", but the steps above are usually enough.

## Adding your own pictures ("THE REAL THING!")

After each stage the game can show a real image from your lab at full resolution.

1. Put PNG or JPG files in `assets\data\`.
2. Open `assets\config.js` in Notepad and type the file names, for example:
   ```js
   freeze: { image: 'grid_atlas.png', caption: 'A REAL FROZEN GRID!' },
   fib:    { image: 'lamella_fib.png', caption: 'A REAL LAMELLA!' },
   krios:  { image: 'tilt_0deg.png',   caption: 'A REAL MICROSCOPE PICTURE!' },
   tomogram: { slices: ['slice_01.png', 'slice_02.png', 'slice_03.png'], caption: 'A REAL TOMOGRAM!' },
   ```
   For the tomogram you can use a list of slice images (the game flips through them like a movie) **or**
   an MP4 movie: `tomogram: { video: 'tomogram.mp4', caption: 'A REAL TOMOGRAM!' }`.
3. **Different pictures per sample (optional):** further down in `config.js` there are `bacteria`, `yeast`
   and `worm` sections. Anything you fill in there is shown instead of the general picture when that sample
   was picked. For example, a real yeast tomogram after a yeast run and a real bacteria tomogram after a bacteria run.
4. Save and restart the game. Leave a value as `''` to skip that card.

Photos of your instruments in `assets\photos\` are only reference for redrawing the pixel-art machines;
the game does not load them. The machines in the game are drawn from your facility's own instruments:
Leica EM GP2, Leica EM ICE, Zeiss Crossbeam 550 and Thermo Scientific Krios G4, each with an LN2 dewar next to it.

**Lab wall poster:** the framed picture on the lab wall is `assets\art\lab_poster.png` (74 × 49 pixels),
made from the Vanderbilt CISR SEM image (`assets\photos\vanderbilt_cisr_sem.jpg`). To use another picture,
replace that PNG with one of the same size, or change `labPosterImage` in `assets\config.js`.

## Pip's voice

Right now Pip talks with the computer's text-to-speech voice. With internet, Edge offers natural-sounding
online voices and the game picks one automatically. Offline, it uses the built-in Windows voice (Zira).
You can choose a different voice in the staff menu (F2).

To use **real recorded voice-over**:

1. Open `VOICE_SCRIPT.csv` in Excel. It lists every line, what to say, and the file name to use.
2. Record each line and save it as an MP3 in the `voice\` folder, named exactly like the `line_id`
   (for example `voice\intro_1.mp3`).
3. Restart the game. Recorded lines are used automatically, and the computer voice fills in any line that has no recording.

To change what Pip says, edit `js\lines.js` (keep lines short for young readers), then update the CSV
to match.

## Logo

`logo\` contains the gold-and-black cryo-EM logo:

* `cryoem-logo.svg` / `.png`: full logo with "CRYO-EM / ELECTRON MICROSCOPY" (1280×480)
* `cryoem-logo-mark.svg` / `.png`: the hexagon badge only, with a transparent background (512×512)

The SVG files scale to any size, for posters, banners and stickers. The game uses a pixel-art version of the same badge.

## Science notes (simplifications for young kids)

* Liquid ethane in a plunge freezer is about −180 °C. High-pressure freezing uses about 2,100 bar, roughly
  twice the pressure at the bottom of the Mariana Trench, followed by jets of liquid nitrogen.
* Plunging is for thin samples (cells on a grid); high-pressure freezing is for thick samples (a *C. elegans*
  worm or tissue). Lift-out for thick samples is not shown, and the game uses the same lamella stage for both.
* Yeast is sent to the plunge freezer, as usual for cryo-FIB on grids. Yeast can also be high-pressure frozen
  (for example as a paste), but the game keeps the simple rule "thin → plunger, thick → HPF".
* The bacterium is modeled on a rod-shaped Gram-negative cell like *E. coli*. It has an outer membrane, a thin
  cell wall, an inner membrane, a nucleoid (DNA with no nucleus around it), dense storage granules and a flagellum.
  The yeast cell has a cell wall, nucleus with pores, mitochondria, a vacuole and a lipid droplet. The worm cell
  is a body-wall muscle cell with rows of filaments and mitochondria.
* In the Krios stage, the glowing target is a dense granule for bacteria and a mitochondrion for yeast and the worm.
* Lamellae are typically ~150–250 nm thick; a hair is ~50–100 µm.
* The game takes 13 pictures in 10° steps from −60° to +60°, alternating sides (a simplified
  dose-symmetric scheme). Real tilt series usually have ~40 images in 2–3° steps.
* The tomogram in the game is a made-up cell; it is built from the same 3D model the Krios stage
  "photographs". Real data can be shown with the tomogram card (see above).

## Files

```
CryoQuest.exe                 launcher (full screen; --window for a window)
Play CRYO QUEST (backup).bat  backup launcher
index.html                    the game
assets\config.js              settings + your real pictures
assets\data\                  put real images / movies here
voice\                        put recorded voice lines here (optional)
VOICE_SCRIPT.csv              every line Pip says, for recording
js\                           game code (plain JavaScript, no build step)
logo\                         logo files
launcher\                     launcher source code and icon
```

To rebuild the launcher after changing `launcher\CryoQuest.cs` (no Visual Studio needed), run this in the
`CryoQuest` folder:

```
C:\Windows\Microsoft.NET\Framework64\v4.0.30319\csc.exe /target:winexe /out:CryoQuest.exe /win32icon:launcher\cryoquest.ico /reference:System.Windows.Forms.dll launcher\CryoQuest.cs
```

Press **F3** in the game to show the frame rate (for checking slow PCs).
