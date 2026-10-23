# Putting it on a TV

This fork installs as an ordinary web app, which is reversible by uninstalling it. The upstream
project's second half, which reassigns the TV's Home button through undocumented platform
preferences, is not part of this fork; see [NelsonEU/arn0-tv](https://github.com/NelsonEU/arn0-tv)
if you want that.

## Device this fork runs on

| | |
| --- | --- |
| Model | QE65S95BATXXC (Samsung S95B, 2022) |
| Platform | Tizen 6.5, armv7 / 32-bit |
| App id | `Arn0Lnchr0.Launcher` (unchanged from upstream so updates install in place) |
| Display name | Hjem |

Upstream was built and tested on a Q70B from the same year and firmware family. No other model
has been tried.

## 1. Developer Mode on the TV

1. Home → Apps → App Settings (bottom of the list), then type `12345` on the remote's number keys.
2. Developer mode **On**, and enter your computer's IP address as **Host PC IP**.
3. Restart the TV fully: hold the power button until it switches off, then turn it on again.

The TV only accepts installs from the Host PC IP. If your computer gets a new address from the
router later, the install fails with "connection forcibly closed by the remote host": update the
field and restart the TV. A fixed address for the computer in the router avoids this.

## 2. Build the package

```sh
npm run build          # Git Bash with zip -> dist/hjem-launcher.wgt
npm run build:win      # Windows without zip; uses the built-in tar.exe
```

The package is unsigned on purpose; the installer signs it for your TV.

## 3. Install

Use [Apps2Samsung](https://github.com/Apps2Samsung/Apps2Samsung) (older versions are called
Jellyfin2Samsung; it is the same program). Pick **Custom WGT** in the Release list, point it at
`dist/hjem-launcher.wgt`, select the TV and install. The first time it opens a Samsung account
sign-in to create a free developer certificate for your TV.

The program makes a fresh certificate on each run and therefore updates by **uninstalling the
launcher and installing it again**, which clears the settings saved on the TV. It finds the
existing install by **title**, using the part of the package file name before the first dash, so
the file is called `hjem-launcher.wgt` to match the app name **Hjem**. Rename the app and you must
rename the file. If it still fails with "Author certificate not match", remove **Hjem** from the
TV's app list (Apps → App Settings → Hjem → Delete) and install again.
The program re-signs the file in `dist/` in place and may delete it afterwards; just build again.

Then open **Hjem** from the TV's app list.

## 4. Start the TV in the launcher (optional, supported settings only)

Settings → General & Privacy → Start Screen Options: **Start with Smart Hub Home** off and
**Autorun Last App** on. The TV then resumes the last app it was running, so switch it off from
the launcher to come back to it. The Home button still opens Samsung's own Home.

## Removing it

Uninstall from the TV's app list. That also clears the launcher's saved settings.
