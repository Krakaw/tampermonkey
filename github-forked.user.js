// ==UserScript==
// @name         Highlight Forked Repos
// @namespace    http://tampermonkey.net/
// @updateURL    https://github.com/Krakaw/tampermonkey/raw/master/github-forked.user.js
// @version      0.1
// @description  Highlight forked repositories on github user profiles
// @author       You
// @match        https://github.com/*
// @icon         https://github.githubassets.com/favicons/favicon.png
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    document.querySelectorAll(".f6.color-fg-muted.mb-1").forEach(i => {
        i.parentNode.parentElement.style.backgroundColor = 'rgba(255,0,0,.3)'
    });
})();
