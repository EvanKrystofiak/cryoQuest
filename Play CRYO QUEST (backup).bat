@echo off
rem ------------------------------------------------------------
rem  CRYO QUEST - backup launcher (use this if CryoQuest.exe is blocked)
rem  Opens the game full screen in Microsoft Edge. Exit with Alt+F4.
rem  Add  window  after the file name to play in a normal window.
rem ------------------------------------------------------------
setlocal
set "GAME=%~dp0index.html"
set "PROFILE=%LOCALAPPDATA%\CryoQuest\BrowserProfile"

set "EDGE=%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe"
if not exist "%EDGE%" set "EDGE=%ProgramFiles%\Microsoft\Edge\Application\msedge.exe"
if not exist "%EDGE%" set "EDGE=%ProgramFiles%\Google\Chrome\Application\chrome.exe"
if not exist "%EDGE%" (
  echo Could not find Microsoft Edge or Google Chrome.
  pause
  exit /b 1
)

if /i "%~1"=="window" (
  start "" "%EDGE%" --app="%GAME%" --window-size=1280,760 --user-data-dir="%PROFILE%" --no-first-run --no-default-browser-check --autoplay-policy=no-user-gesture-required --overscroll-history-navigation=0 --disable-pinch
) else (
  start "" "%EDGE%" --kiosk "%GAME%" --edge-kiosk-type=fullscreen --user-data-dir="%PROFILE%" --no-first-run --no-default-browser-check --autoplay-policy=no-user-gesture-required --overscroll-history-navigation=0 --disable-pinch
)
endlocal
