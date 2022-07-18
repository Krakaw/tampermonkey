// ==UserScript==
// @name         Telegram web favicon
// @namespace    https://krakaw.github.io/
// @updateURL    https://github.com/Krakaw/tampermonkey/raw/master/telegram.user.js
// @version      0.1
// @description  Show unread count in telegram web favicon
// @author       Krakaw
// @match        https://web.telegram.org/k/
// @icon         https://www.google.com/s2/favicons?sz=64&domain=telegram.org
// @grant unsafeWindow
// ==/UserScript==

(function () {
    'use strict';
    const canvas = document.createElement('canvas'),
        img = document.createElement('img'),
        links = document.querySelectorAll("head link[rel=icon]");
    const origLink = links[0].href;
    let ctx,
        unreadCount = 0;
    document.querySelectorAll("head link[rel*=icon]").forEach(l => {
        l.remove()
    })
    let icon = document.createElement('link');
    icon.href = origLink;
    icon.rel = "icon";
    document.querySelector('head').append(icon);
    setInterval(() => {
        unreadCount = document.querySelectorAll('a:not(.is-muted) .is-visible.unread').length;
        canvas.height = canvas.width = 16; // set the size
        ctx = canvas.getContext('2d');
        img.onload = function () { // once the image has loaded
            ctx.drawImage(this, 0, 0);
            if (unreadCount > 0) {
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const data = imageData.data;
                for (let i = 0; i < data.length; i += 4) {
                    data[i] = data[i] ^ 255; // Invert Red
                    data[i + 1] = data[i + 1] ^ 255; // Invert Green
                    data[i + 2] = data[i + 2] ^ 255; // Invert Blue
                }
                ctx.putImageData(imageData, 0, 0);
                ctx.font = 'bolder 12px "helvetica", sans-serif';
                ctx.fillStyle = '#ffffff';
                ctx.fillText(unreadCount, 4, 12);
            }
            icon.href = canvas.toDataURL('image/png');
        };
        img.src = origLink;
    }, 1000);
})();
