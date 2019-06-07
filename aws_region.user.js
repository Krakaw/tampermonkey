// ==UserScript==
// @name         AWS Region Colouring
// @namespace    http://krakaw.github.io/
// @updateURL    https://github.com/Krakaw/tampermonkey/raw/master/aws_region.user.js
// @version      0.3
// @description  Adjust the colour of the region menu element
// @author       Krakaw (Original concept from https://github.com/JB4GDI/awsazcolorchromeextension)
// @match        https://*.console.aws.amazon.com/*
// @grant        none
// ==/UserScript==

(function($) {
    'use strict';
    const REGIONS = {
        "Global": {fontColor: "#ffffff", backgroundColor: "#232f3e"},
        "N. Virginia": {fontColor: "#97c8f0", backgroundColor: "#00297b",},
        "Ohio": {fontColor: "#d43547", backgroundColor: "#00155a",},
        "N. California": {fontColor: "#be8b5e", backgroundColor: "#b80a31",},
        "Oregon": {fontColor: "#ffeb07", backgroundColor: "#002587",},
        "Hong Kong": {fontColor: "#d71811", backgroundColor: "#ffffff",},
        "Mumbai": {fontColor: "#138808", backgroundColor: "#ff9933",},
        "Seoul": {fontColor: "#359a3e", backgroundColor: "#be1135",},
        "Singapore": {fontColor: "#ffffff", backgroundColor: "#ed2939",},
        "Sydney": {fontColor: "#262873", backgroundColor: "#f0ba19",},
        "Tokyo": {fontColor: "#ffffff", backgroundColor: "#4b0082",},
        "Central": {fontColor: "#d52b1e", backgroundColor: "#ffffff",},
        "Frankfurt": {fontColor: "#fccf00", backgroundColor: "#ff0000",},
        "Ireland": {fontColor: "#ff883e", backgroundColor: "#169b62",},
        "London": {fontColor: "#cf142b", backgroundColor: "#ffffff",},
        "Paris": {fontColor: "#ed2939", backgroundColor: "#002395",},
        "Stockholm": {fontColor: "#ffc90e", backgroundColor: "#2452bd",},
        "S&atilde;o Paulo": {fontColor: "#294292", backgroundColor: "#212125",},
    };

    const regionMenuParent = document.getElementById('nav-regionMenu');
    const label = regionMenuParent.querySelector('div.nav-elt-label');
    const regionText = label.textContent;
    if (REGIONS.hasOwnProperty(regionText)) {
        let style = REGIONS[regionText];
        label.style.cssText = `color: ${style.fontColor} !important; font-weight: bold !important; text-shadow: none !important`;
        regionMenuParent.style.cssText = `background-color: ${style.backgroundColor} !important`;
    } else {
        console.error(`Missing Region: ${regionText}`);
    }

    regionMenuParent.addEventListener('click', function() {
        document.querySelectorAll('#regionMenuContent > a').forEach(item => {
            let menuRegionText = item.textContent.replace(/.*?\((.*?)\)/, "$1");
            let style = REGIONS[menuRegionText];
            if (!style) return;
            let div = document.createElement('span');
            div.style.cssText = `background: linear-gradient(45deg, ${style.fontColor} 50%, ${style.backgroundColor} 50%); width: 16px; height:16px; display: inline-block; margin:0; margin-right: 2px;`;
            item.prepend(div);
        })
    });
})();
