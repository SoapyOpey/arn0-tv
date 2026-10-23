/*
 * Navigation sound: a short synthesised click when focus moves.
 *
 * Synthesised rather than sampled, so there is no audio file to licence, bundle or decode, and
 * no question about which codecs this engine accepts. Each click is one oscillator and one gain
 * envelope, created and discarded per press; nothing is held open between keys.
 *
 * Tuning lives in config.js under `sound`. Everything here is wrapped so that a failure is
 * silent: a launcher that is someone's Home button must not break because audio did.
 *
 * EXPERIMENTAL. Latency is the open question — if the TV's audio path delays the click much past
 * ~60 ms it will feel detached from the remote and should be turned off.
 */
(function () {
    'use strict';

    var DEFAULTS = {
        enabled: true,
        preset: 'soft',
        volume: 0.08,
        minGapMs: 45,   // key repeat can fire faster than this; extra presses are dropped
        presets: {
            soft: { label: 'Soft', freq: 620, ms: 30, type: 'sine' },
            warm: { label: 'Warm', freq: 520, ms: 44, type: 'triangle' },
            bright: { label: 'Bright', freq: 1040, ms: 30, type: 'triangle' }
        },
        move: { freq: 880, ms: 38, type: 'triangle' },
        edge: { freq: 200, ms: 70, type: 'sine' },
        select: { freq: 1320, ms: 55, type: 'triangle' }
    };

    var ctx = null;
    var broken = false;
    var lastPlay = 0;

    function cfg() {
        var c = (window.LAUNCHER_CONFIG && window.LAUNCHER_CONFIG.sound) || {};
        var out = {};
        Object.keys(DEFAULTS).forEach(function (k) {
            out[k] = c[k] !== undefined ? c[k] : DEFAULTS[k];
        });
        return out;
    }

    function enabled() {
        if (broken) return false;
        var c = cfg();
        // A saved preference wins over the config default once Settings exposes one.
        var prefs = window.Prefs && Prefs.get ? Prefs.get() : null;
        if (prefs && prefs.sound && prefs.sound.enabled !== undefined) return !!prefs.sound.enabled;
        return !!c.enabled;
    }

    function selectedPreset() {
        var c = cfg();
        var prefs = window.Prefs && Prefs.get ? Prefs.get() : null;
        var key = prefs && prefs.sound && prefs.sound.preset || c.preset;
        return c.presets[key] || c.presets[c.preset] || c.move;
    }

    function presetOptions() {
        var presets = cfg().presets;
        return Object.keys(presets).map(function (key) {
            return { key: key, label: presets[key].label || key };
        });
    }

    /*
     * The context is created on the first key press rather than at boot: engines may refuse to
     * start audio without a user gesture, and on a TV the first remote press is that gesture.
     */
    function context() {
        if (ctx || broken) return ctx;
        try {
            var Ctor = window.AudioContext || window.webkitAudioContext;
            if (!Ctor) {
                broken = true;
                return null;
            }
            ctx = new Ctor();
        } catch (e) {
            broken = true;
            if (window.DevLog) DevLog.log('Sound unavailable: ' + DevLog.errorText(e));
            return null;
        }
        return ctx;
    }

    function play(name, force) {
        if (!force && !enabled()) return;
        var c = cfg();
        var now = Date.now();
        if (!force && now - lastPlay < c.minGapMs) return;

        var ac = context();
        if (!ac) return;

        try {
            // Held keys can arrive while the context is suspended by the platform.
            if (ac.state === 'suspended' && ac.resume) ac.resume();

            var voice = name === 'move' ? selectedPreset() : (c[name] || c.move);
            var t = ac.currentTime;
            var seconds = voice.ms / 1000;

            var osc = ac.createOscillator();
            osc.type = voice.type;
            osc.frequency.value = voice.freq;

            var gain = ac.createGain();
            // Tiny attack keeps the start from clicking; exponential decay reads as a tick.
            gain.gain.setValueAtTime(0.0001, t);
            gain.gain.exponentialRampToValueAtTime(c.volume, t + 0.004);
            gain.gain.exponentialRampToValueAtTime(0.0001, t + seconds);

            osc.connect(gain);
            gain.connect(ac.destination);
            osc.start(t);
            osc.stop(t + seconds + 0.02);
            osc.onended = function () {
                try {
                    gain.disconnect();
                    osc.disconnect();
                } catch (e) {
                    // Already torn down.
                }
            };
            lastPlay = now;
        } catch (e) {
            broken = true;
            if (window.DevLog) DevLog.log('Sound failed, disabling: ' + DevLog.errorText(e));
        }
    }

    window.Sound = {
        play: play,
        preview: function () { play('move', true); },
        enabled: enabled,
        presetOptions: presetOptions,
        presetLabel: function () { return selectedPreset().label || 'Custom'; }
    };
})();
