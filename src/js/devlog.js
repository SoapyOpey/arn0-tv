/* Console log for the launcher; nothing leaves the TV. */
(function () {
    'use strict';

    function errorText(err) {
        if (!err) return String(err);
        return (err.name ? err.name + ': ' : '') + (err.message || String(err));
    }

    function log(message, data) {
        console.log('[launcher]', message, data === undefined ? '' : data);
    }

    window.DevLog = { log: log, errorText: errorText };
})();
