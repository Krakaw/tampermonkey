// ==UserScript==
// @name         Mattermost favicon and hover
// @namespace    https://krakaw.github.io/
// @updateURL    https://github.com/Krakaw/tampermonkey/raw/master/mattermost.user.js
// @version      0.4
// @description  Favicon change when there are unread messages, when hovering over a name, expose all members of private groups
// @author       Krakaw
// @match        https://nomatter.tari.com/*
// @grant        GM_notification
// @grant        window.focus
// ==/UserScript==


/*var notificationDetails = {
    text: 'THIS IS A TEST NOTIFICATION!!!',
    title: 'TEST',
    timeout: 15000,
    onclick: function() { window.focus(); },
  };
GM_notification(notificationDetails);*/

(function (document) {
    'use strict';
    var logoColor = "0089de";
    var sideBarColors = {
        new: "rgba(255,25,25,0.7)",
        old: "rgb(27, 44, 62)"
    };

    var directLinksContainer = null;
    var css = `
		.direct-link a {
			padding-top: 5px;
			color: #121212;
			text-decoration: underline;
			font-size: 10px;
		}
	`,
        head = document.head || document.getElementsByTagName('head')[0],
        style = document.createElement('style');
    style.type = 'text/css';
    head.appendChild(style);
    style.appendChild(document.createTextNode(css));

    function createDirectUnreadLinks(sideBarEl, unreadElements) {
        if (!directLinksContainer) {
            directLinksContainer = document.createElement('div');
            directLinksContainer.className = 'direct-link';
            directLinksContainer.addEventListener('click', function (e) {
                let href = e.target.getAttribute("data-href");
                window.location.hash = href;
                window.history.pushState(null, null, href);
            });
            const teamList = sideBarEl.querySelectorAll('.team-btn');
            var lastTeamEl = teamList[teamList.length - 1];
            lastTeamEl.after(directLinksContainer);
        }
        directLinksContainer.innerHTML = '';

        const elements = Array.from(unreadElements);
        elements.sort((a, b) => a.innerText.toLowerCase() > b.innerText.toLowerCase() ? 1 : -1);
        elements.forEach(el => {
            var a = document.createElement('a');
            a.href = "javascript:";
            a.innerText = el.parentNode.title;
            a.setAttribute("data-href", el.href.replace('https://nomatter.tari.com', ''));
            directLinksContainer.append(a);

        });


    }

    window.addEventListener('load', function () {

        document.body.addEventListener("click", function (event) {
            if (event.target.classList.contains("unread") && event.target.classList.contains("team-container")) {
                event.target.classList.remove("unread");
            }
        });

        setTimeout(function () {
            console.log("Running Tampermonkey mods");
            var sideBarEl = document.querySelector('.team-sidebar');

            var canvas = document.createElement('canvas'),
                ctx,
                img = document.createElement('img'),
                link = document.getElementById('favicon');
            var origLink = link.href;

            var setTitles = function () {
                document.querySelectorAll('.sidebar-item__name').forEach(function (item) {
                    if (item) {
                        item.parentElement.parentElement.setAttribute("title", item.innerText.trim())
                    }
                });
            };
            setTitles();
            setInterval(setTitles, 60000);


            setInterval(function () {
                const unreadElements = document.querySelectorAll('#sidebarChannelContainer .unread-title');
                createDirectUnreadLinks(sideBarEl, unreadElements);

                var unreadCount = unreadElements.length
                    + document.querySelectorAll('.team-btn .badge').length
                    + document.querySelectorAll('.team-container.unread').length;
                canvas.height = canvas.width = 16; // set the size
                ctx = canvas.getContext('2d');
                img.onload = function () { // once the image has loaded
                    ctx.drawImage(this, 0, 0);
                    sideBarEl.style.backgroundColor = sideBarColors.old;
                    if (unreadCount > 0) {
                        sideBarEl.style.backgroundColor = sideBarColors.new;
                        var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                        var data = imageData.data;
                        for (var i = 0; i < data.length; i += 4) {
                            data[i] = data[i] ^ 255; // Invert Red
                            data[i + 1] = data[i + 1] ^ 255; // Invert Green
                            data[i + 2] = data[i + 2] ^ 255; // Invert Blue
                        }
                        ctx.putImageData(imageData, 0, 0);
                        ctx.font = 'bolder 12px "helvetica", sans-serif';
                        ctx.fillStyle = '#ffffff';
                        ctx.fillText(unreadCount, 4, 12);
                    }
                    document.getElementById('favicon').href = canvas.toDataURL('image/png');
                };
                img.src = origLink;
            }, 1000);
        }, 10000);


    }, false);
})(document);
