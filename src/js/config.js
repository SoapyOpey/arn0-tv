/*
 * Home screen content.
 *
 * apps: each entry picks the first installed app matching it:
 *   { id: 'org.tizen.netflix-app' }   exact app id (most reliable; see "All apps", the id of
 *                                     the focused app is shown at the bottom)
 *   { match: 'netflix' }              case-insensitive regex on id or name
 *   label                             optional display name
 *   brand                             optional key from js/brands.js (otherwise guessed from the name)
 * Entries that match nothing are skipped.
 *
 * inputs: HDMI ports shown in the second row. Set `hdmi` to the port each device is plugged into.
 */
window.LAUNCHER_CONFIG = {
    apps: [
        { match: 'jellyfin', label: 'Jellyfin', brand: 'jellyfin' },
        { match: 'nrk', label: 'NRK TV' },
        { match: '^tv ?2\\b', label: 'TV 2 Play' },
        { id: 'org.tizen.netflix-app', label: 'Netflix' },
        { match: 'hbo|^max$', label: 'HBO Max', brand: 'max' },
        { id: 'org.tizen.primevideo', label: 'Prime Video' },
        { match: 'viaplay', label: 'Viaplay' },
        { id: 'MCmYXNxgcu.DisneyPlus', label: 'Disney+' },
        { id: 'com.samsung.tv.aria-video', label: 'Apple TV' },
        { match: 'youtube|tizentube', label: 'YouTube', brand: 'youtube' }
    ],

    inputs: [
        { hdmi: 2, label: 'PlayStation 5', brand: 'playstation' },
        { hdmi: 3, label: 'Xbox Series X', brand: 'xbox' },
        { hdmi: 4, label: 'Chromecast', brand: 'chromecast' }
    ],

    // How an input tile switches the TV. See README "HDMI inputs".
    //   'switch+viewer'  set the TV source, then open Samsung's TV viewer (default)
    //   'switch'         only set the TV source
    //   'inapp'          show the input full screen inside the launcher (Back returns)
    inputMethod: 'switch+viewer',

    locale: 'nb-NO',

    theme: {
        // Starting wallpaper (key from js/wallpapers.js), or null for none (plain gradient).
        // Changed from Settings → Background; the TV remembers the choice.
        wallpaper: null
    },

    // Evening dimming: a dark layer over the wallpaper and the screen saver photos between these
    // times (TV clock, 24-hour; may cross midnight). Tiles and text stay bright. On/off is also
    // in Settings → Screen saver.
    night: { enabled: true, from: '20:00', to: '06:00' },

    /*
     * EXPERIMENTAL navigation sound. Synthesised, so there is no audio file. `move` plays when
     * focus changes, `edge` when it cannot (the end of a row). Tune by ear in the browser
     * preview; `volume` is 0–1 and sits on top of the TV's own volume.
     * Set enabled to false to silence it.
     */
    sound: {
        enabled: true,
        preset: 'soft',
        volume: 0.08,
        minGapMs: 45,
        presets: {
            soft: { label: 'Soft', freq: 620, ms: 30, type: 'sine' },
            warm: { label: 'Warm', freq: 520, ms: 44, type: 'triangle' },
            bright: { label: 'Bright', freq: 1040, ms: 30, type: 'triangle' }
        },
        move: { freq: 880, ms: 38, type: 'triangle' },
        edge: { freq: 200, ms: 70, type: 'sine' },
        select: { freq: 1320, ms: 55, type: 'triangle' }
    }
};

/*
 * Local overrides from js/config.local.js, which is gitignored and loaded just before this file.
 * That is where values specific to one TV belong, so this file
 * can stay in the repository with nulls in it. Nothing to strip before a push, nothing to put
 * back before a build, and the overlay reaches the browser preview and the .wgt alike.
 *
 * Merged one level deep, so a local file can set one value in a block without restating the rest.
 * Arrays (apps, inputs) and plain values replace the default outright.
 */
(function () {
    'use strict';

    var local = window.LAUNCHER_LOCAL;
    if (!local) return;

    function plainObject(v) {
        return v && typeof v === 'object' && !Array.isArray(v);
    }

    Object.keys(local).forEach(function (key) {
        if (plainObject(local[key]) && plainObject(window.LAUNCHER_CONFIG[key])) {
            Object.keys(local[key]).forEach(function (inner) {
                window.LAUNCHER_CONFIG[key][inner] = local[key][inner];
            });
        } else {
            window.LAUNCHER_CONFIG[key] = local[key];
        }
    });
})();
