// ==UserScript==
// @name         Github formatting
// @namespace    https://krakaw.github.io/
// @version      0.1
// @description  Some github enhancements
// @author       Krakaw
// @match        https://github.com/*/pulls
// @match        https://github.com/*/pull/*
// @match        https://github.com/*/issues/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    let href = window.location.href;
    if (href.indexOf('/pull/') > -1 || href.indexOf('/issues/') > -1) {
        let shortcode = href.replace('https://github.com/', '').replace('/pull/', '#').replace('/issues/', '#');
        let input = document.createElement('input');
        input.value = shortcode;
        input.setAttribute('readonly', true);
        input.addEventListener('click', function() {this.setSelectionRange(0, this.value.length)})
        document.querySelector('span.gh-header-number').replaceWith(input);
    } else {
        document.querySelectorAll('relative-time').forEach(item => {item.innerHTML = `${item.getAttribute('title')}<br>` + item.innerHTML});
    }
})();
