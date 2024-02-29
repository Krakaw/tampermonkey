// ==UserScript==
// @name         Title Changer
// @namespace    https://krakaw.github.io/
// @version      0.1
// @description  Adds a keyword to the title
// @author       Krakaw
// @match        https://app.plex.tv/*
// @match        https://www.youtube.com/*
// @match        https://*.reddit.com/*
// @match        https://reddit.com/
// @match        https://old.reddit.com/
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    const titleKeyword = 'zxz';
    document.title = document.title + ` ${titleKeyword}`;
    window.addEventListener('load', function() {
        if (document.title.toLowerCase().indexOf(titleKeyword) === -1) {
            document.title = document.title + ` ${titleKeyword}`;
        }
    }, false);
})();
