/*
 * Evening dimming: between Prefs.night.from and .to (TV clock, 24-hour) <html> carries the `night`
 * class, which the stylesheet turns into a dark layer over the wallpaper and the screen saver
 * photos. Tiles and text stay bright. Checked once a minute.
 */
(function () {
    'use strict';

    var timer = null;

    function minutes(hhmm) {
        var m = /^(\d{1,2}):(\d{2})$/.exec(String(hhmm || ''));
        if (!m) return null;
        return Number(m[1]) * 60 + Number(m[2]);
    }

    function active() {
        var n = Prefs.get().night;
        if (!n || !n.enabled) return false;
        var from = minutes(n.from);
        var to = minutes(n.to);
        if (from === null || to === null) return false;
        var d = new Date();
        var now = d.getHours() * 60 + d.getMinutes();
        // A window that crosses midnight (20:00 → 06:00) is the normal case.
        return from <= to ? (now >= from && now < to) : (now >= from || now < to);
    }

    function apply() {
        document.documentElement.classList.toggle('night', active());
    }

    function init() {
        apply();
        if (timer) clearInterval(timer);
        timer = setInterval(apply, 60 * 1000);
    }

    window.Night = { init: init, apply: apply, active: active };
})();
