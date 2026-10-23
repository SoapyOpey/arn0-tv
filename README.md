# Hjem

A quieter home screen for a Samsung Tizen TV: a clock, a row of your apps, a row of your HDMI
sources, and nothing else. A fork of [NelsonEU/arn0-tv](https://github.com/NelsonEU/arn0-tv),
trimmed to what one living room needs.

![The launcher on the "Milky Way" wallpaper, showing the clock, an apps row and a consoles row](docs/preview.png)

*The browser preview, with the bundled Manrope font and the "Milky Way" wallpaper.*

It runs on a Samsung S95B (2022, Tizen 6.5) as an ordinary sideloaded app. It does not and cannot
replace Samsung's Home button; see [the setup guide](docs/setup-tv.md) for what it can do.

## What it does

- **Apps row** — the apps you list in `config.js`, found by Tizen app id or by name, with brand
  tiles where a mark exists and the TV's own icon otherwise. Opens them with the normal launch and
  falls back to an app-control launch if an app refuses the first.
- **Consoles row** — HDMI sources with a name, a logo and a green dot when the TV reports the port
  as connected. Selecting one switches the TV's source.
- **All apps** — everything launchable on the TV, filtered to consumer apps; Yellow shows the rest.
- **Wallpapers** — ten bundled photos, held or rotated on a schedule, with the readability scrim
  baked in at build time.
- **Screen saver** — the photos full screen after a few idle minutes, with a drifting clock, then
  black after a set time.
- **Evening dimming** — a dark layer over the wallpaper and the screen saver photos between two
  clock times; tiles and text stay bright. Ported from
  [Glass Home](https://github.com/victaphu/glass-home-samsung-tv).
- **Settings on the TV** — apps, consoles, appearance, navigation sound, screen saver and dimming,
  all from the remote. Saved on the TV; `config.js` only supplies the defaults.

Nothing leaves the TV: the package has no network use, no analytics and no dependencies.

### Removed from upstream

The hidden game, the Open-Meteo weather widget, the Lab screen with its render and platform probes,
the log upload to a computer, the native Home-button helpers and the brand marks for apps this TV
does not have. Upstream's README documents those if you want them back.

## Try the interface

Needs Node.js 20 or newer. Nothing is installed and no TV is involved.

```sh
git clone https://github.com/SoapyOpey/arn0-tv.git
cd arn0-tv
npm run preview        # http://localhost:8080
```

Navigate with the arrow keys and Enter; Esc or Backspace is Back; `R` `G` `Y` are the remote's
colour keys. `#all` and `#settings` in the URL open those screens directly.

The preview runs against [`src/js/tizen-mock.js`](src/js/tizen-mock.js), a stand-in for the Tizen
APIs that is inert on the TV itself. So the layout, focus behaviour, settings, fonts and wallpapers
are all real, while launching apps and switching HDMI inputs only do something on a real TV.

## What you can change

Everything in [`src/js/config.js`](src/js/config.js) is meant to be edited: which apps appear, which
consoles and on which HDMI ports, how an input tile switches the TV, the locale, the starting
wallpaper, the dimming hours. Most of it is also editable from the launcher's own Settings once it is
on the TV, and the TV's copy wins once you have edited it there.

Beyond config: tile colours and brand marks in [`src/js/brands.js`](src/js/brands.js), the whole
look in [`src/css/style.css`](src/css/style.css), and your own photos as wallpapers.

Anything specific to one TV belongs in `src/js/config.local.js` instead. That file is gitignored
and merged over `config.js` one level deep, and it reaches both the browser preview and the
packaged `.wgt`. Copy [`config.local.example.js`](src/js/config.local.example.js) to start.

## Put it on a TV

**[docs/setup-tv.md](docs/setup-tv.md)** — Developer Mode, building the package on Windows or with
`zip`, installing it with Apps2Samsung, and the supported TV settings that start the TV in the
launcher. Installing is reversible by uninstalling.

## Reference

### Commands

```sh
npm run preview      # browser preview on :8080
npm run build        # -> dist/arn0-launcher.wgt (needs zip; Git Bash on Windows has none)
npm run build:win    # the same package via Windows' own tar.exe
node scripts/prepare-wallpapers.mjs <folder>   # regenerate wallpapers from your photos (macOS: uses sips)
```

### Remote

| Key | Action |
| --- | --- |
| Arrows | move (Up from the apps row reaches the gear = Settings) |
| OK | open app / switch input / select |
| Back | one level back (does nothing on Home) |
| Red | All apps |
| Green | next wallpaper |
| Yellow | in All apps: show system apps too |

### Layout

```
src/                  everything that goes into the .wgt
  config.xml          Tizen manifest (app id, name, privileges)
  css/style.css       1920x1080 stage; performance rules measured upstream, not assumed (see its header)
  fonts/              Manrope, Inter, Outfit, DM Sans (OFL), bundled so nothing loads from the network
  img/marks/          brand marks (Simple Icons CC0, Custom Brand Icons MIT; see SOURCES.md)
  img/tiles/          marks recoloured per brand (generated at build)
  img/wallpapers/     1920x1080 wallpapers with the readability scrim baked in (generated)
  js/config.js        your apps, consoles, HDMI method, locale, theme, dimming hours
  js/config.local.js  gitignored per-TV overrides, merged over config.js (not in the repo)
  js/brands.js        tile colours and marks per brand
  js/apps.js          list / filter / launch via tizen.application
  js/inputs.js        HDMI via tizen.systeminfo + tizen.tvwindow
  js/wallpaper.js     wallpaper display and rotation
  js/screensaver.js   idle screen saver: photos, slow pan, clock
  js/night.js         evening dimming by the TV clock
  js/appearance.js    clock, date and font settings
  js/prefs.js         settings saved on the TV
  js/ui.js            screens, focus, keys, toast, pop-up menu
  js/home.js          Home and All apps
  js/settings.js      Settings pages
  js/devlog.js        console log
  js/boot.js          start-up
  js/tizen-mock.js    fake Tizen APIs for the browser preview (inactive on the TV)
scripts/              build.sh, build.ps1, serve.mjs, fetch-assets.mjs, make-icon.mjs, prepare-wallpapers.mjs
docs/                 setup guide
```

### Settings

Saved on the TV in `localStorage`. They survive restarts, not an uninstall — and Apps2Samsung
updates by uninstalling and reinstalling, so note down what you changed before updating.

- **Background** — Off (plain gradient), one photo, or rotate: on each Home, 30 s, 5 min, 15 min,
  1 hour, daily.
- **Apps on Home** — OK on an app opens Move / Remove; OK on the right-hand slot adds one.
- **Consoles** — per console: rename (on-screen keyboard), HDMI port, logo, how it opens, hide,
  reorder, remove; plus add a console.
- **Appearance** — 24/12-hour clock, date shown/hidden, date language (Norsk, English, Español, Français),
  font, app names (always / when selected / never).
- **Navigation sound** — turn arrow-key sounds on or off, choose Soft, Warm or Bright, and preview
  the selected tone.
- **Screen saver** — on or off, start after 3/5/10/15 min idle on Home, photo change every
  60/75/90 s while Background is on Rotate, go dark after 30 min / 1 hour / 2 hours / never,
  evening dimming on or off (the hours live in `config.js`), and show it now.
- **Samsung Home** — opens `com.samsung.tv.csfs`, from which TV settings are one press away.
- **Advanced** — refresh the app list, reset everything.

### Wallpapers

Photos are cropped to 1920x1080 and darkened (top-left for the clock, bottom for the tiles) at
build time, so the TV only ever draws one plain JPEG on its own layer. Drop photos in a folder and
run `node scripts/prepare-wallpapers.mjs <folder>`; that script uses macOS's `sips` and needs
adapting on Windows. Current photos are from Unsplash; credits appear when you switch with Green.

### Screen saver

After a few minutes with no input on Home it shows the wallpapers full screen with the clock and the
photo's name in the corners. Any button closes it, and that press does nothing else. It never
appears over a console input or another screen.

Everything in it moves, because a clock parked in one corner for an hour is a burn-in risk: the
photo pans across 320 px while it is up and the next one pans back the other way, the corner text
shifts a few pixels on each photo change, the clock moves to another corner every two and a half
minutes, and the whole thing fades to black once the configured hour is up. Photos follow the
**Background** setting — Rotate cycles them, a single photo is held, Off leaves just the clock —
using the screen saver's own position, so it never rewrites the wallpaper Home comes back to.

Black, rather than off, because a web app cannot turn this panel off: neither `tizen.power` nor
`webapis.power` exists on these TVs. A real power-off is the TV's own Eco Solution ▸ Auto Power Off,
driven by the same absence of remote input that started the screen saver.

### Evening dimming

`night` in `config.js` sets the hours (default 20:00 to 06:00, TV clock, may cross midnight) and
whether it starts on. While active, `<html>` carries the `night` class and a plain black layer at
45 % sits over the wallpaper on Home and over the photos in the screen saver. It is a separate
layer rather than a filter, because filters are expensive on this hardware. Toggle it under
Settings ▸ Screen saver.

### Apps

`getAppsInfo` reports many internal services as visible, so **All apps** keeps only ids that look
like store apps (`AbCdEfGhIj.Name`, or numeric) plus a short list of preinstalled consumer apps, and
drops names containing service/worker/agent/e-manual. Yellow shows everything when you need to find
something. The id of the focused app is shown bottom-left — pin it in `config.js` as `{ id: '...' }`,
which is more reliable than a name match.

Launching tries `tizen.application.launch` first and, if that fails, an app control with the
default operation aimed at the same app id. Some apps only open the second way.

### HDMI inputs

`tizen.systeminfo.getPropertyValue('VIDEOSOURCE')` lists the ports and `tizen.tvwindow.setSource()`
changes the source (privilege `tv.window`, public). What happens next is undocumented, so
`inputMethod` has three options:

- `switch+viewer` (default) — set the source, then open Samsung's TV viewer, so the console is shown
  by the TV itself with Game Mode and friends as usual.
- `switch` — only set the source.
- `inapp` — show the input full screen inside the launcher; Back returns to the dashboard. Probably
  no automatic Game Mode or VRR this way.

The dot on each tile is green when the TV reports that port as connected.

### Privileges

| Privilege | Used for |
| --- | --- |
| `application.launch` | opening apps and the TV viewer |
| `application.info` | listing apps |
| `tv.inputdevice` | colour keys (arrows, OK and Back need no registration) |
| `tv.window` | HDMI source switching and display |

No `internet` privilege: nothing in the package talks to the network.

## Licence and credits

MIT — see [LICENSE](LICENSE). The original launcher is by Arnaud Etienne
([NelsonEU/arn0-tv](https://github.com/NelsonEU/arn0-tv)); the evening dimming and the launch
fallback follow [Glass Home](https://github.com/victaphu/glass-home-samsung-tv). Bundled fonts
(OFL), Unsplash photos and brand marks keep their own terms. Brand names and logos belong to their
owners.

This project is independent and is not affiliated with Samsung or any streaming service.
