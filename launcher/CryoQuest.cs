// CRYO QUEST launcher
// Opens the game full screen (kiosk mode) in Microsoft Edge, which is built into Windows 10/11.
// Falls back to Google Chrome if Edge is missing.
//
//   CryoQuest.exe            -> full screen kiosk (exit with Alt+F4)
//   CryoQuest.exe --window   -> normal window (for testing)
//
// Build (no Visual Studio needed):
//   C:\Windows\Microsoft.NET\Framework64\v4.0.30319\csc.exe /target:winexe /out:CryoQuest.exe
//       /win32icon:launcher\cryoquest.ico /reference:System.Windows.Forms.dll launcher\CryoQuest.cs
using System;
using System.Diagnostics;
using System.IO;
using System.Windows.Forms;
using Microsoft.Win32;

static class CryoQuestLauncher
{
    [STAThread]
    static int Main(string[] args)
    {
        bool windowed = false;
        foreach (string a in args)
        {
            string s = a.ToLowerInvariant();
            if (s == "--window" || s == "/window" || s == "-w") windowed = true;
        }

        string gameDir = FindGameDir();
        if (gameDir == null)
        {
            MessageBox.Show("Could not find index.html.\n\nKeep CryoQuest.exe in the same folder as index.html.",
                "CRYO QUEST", MessageBoxButtons.OK, MessageBoxIcon.Error);
            return 1;
        }

        string browser = FindBrowser("msedge.exe", new string[] {
            @"%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe",
            @"%ProgramFiles%\Microsoft\Edge\Application\msedge.exe",
            @"%LocalAppData%\Microsoft\Edge\Application\msedge.exe" });
        if (browser == null)
            browser = FindBrowser("chrome.exe", new string[] {
                @"%ProgramFiles%\Google\Chrome\Application\chrome.exe",
                @"%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe",
                @"%LocalAppData%\Google\Chrome\Application\chrome.exe" });
        if (browser == null)
        {
            MessageBox.Show("CRYO QUEST needs Microsoft Edge or Google Chrome.\n\nEdge comes with Windows 10 and 11 - please install it from microsoft.com/edge.",
                "CRYO QUEST", MessageBoxButtons.OK, MessageBoxIcon.Error);
            return 2;
        }

        string url = new Uri(Path.Combine(gameDir, "index.html")).AbsoluteUri;

        // A private browser profile just for the game: keeps the explorer counter and settings,
        // and lets kiosk mode start even if Edge is already open.
        string profile = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), "CryoQuest", "BrowserProfile");
        Directory.CreateDirectory(profile);

        string common =
            " --user-data-dir=" + Quote(profile) +
            " --no-first-run --no-default-browser-check" +
            " --autoplay-policy=no-user-gesture-required" +   // music + voice work even if only the controller is used
            " --disable-features=Translate,msEdgeTranslate" +
            " --overscroll-history-navigation=0 --disable-pinch" +
            " --disable-session-crashed-bubble";

        string arguments = windowed
            ? "--app=" + Quote(url) + " --window-size=1280,760" + common
            : "--kiosk " + Quote(url) + " --edge-kiosk-type=fullscreen" + common;

        try
        {
            ProcessStartInfo psi = new ProcessStartInfo(browser, arguments);
            psi.UseShellExecute = false;
            psi.WorkingDirectory = gameDir;
            Process.Start(psi);
        }
        catch (Exception e)
        {
            MessageBox.Show("Could not start the browser:\n" + e.Message, "CRYO QUEST", MessageBoxButtons.OK, MessageBoxIcon.Error);
            return 3;
        }
        return 0;
    }

    static string Quote(string s) { return "\"" + s + "\""; }

    static string FindGameDir()
    {
        string dir = AppDomain.CurrentDomain.BaseDirectory;
        for (int i = 0; i < 3 && dir != null; i++)
        {
            if (File.Exists(Path.Combine(dir, "index.html"))) return dir;
            DirectoryInfo parent = Directory.GetParent(dir.TrimEnd('\\', '/'));
            dir = parent == null ? null : parent.FullName;
        }
        return null;
    }

    static string FindBrowser(string exe, string[] candidates)
    {
        foreach (RegistryKey root in new RegistryKey[] { Registry.CurrentUser, Registry.LocalMachine })
        {
            try
            {
                using (RegistryKey k = root.OpenSubKey(@"SOFTWARE\Microsoft\Windows\CurrentVersion\App Paths\" + exe))
                {
                    if (k != null)
                    {
                        string p = k.GetValue("") as string;
                        if (!string.IsNullOrEmpty(p) && File.Exists(p.Trim('"'))) return p.Trim('"');
                    }
                }
            }
            catch (Exception) { }
        }
        foreach (string c in candidates)
        {
            string p = Environment.ExpandEnvironmentVariables(c);
            if (File.Exists(p)) return p;
        }
        return null;
    }
}
