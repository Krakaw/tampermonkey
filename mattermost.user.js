// ==UserScript==
// @name         Mattermost favicon and hover
// @namespace    https://krakaw.github.io/
// @updateURL    https://github.com/Krakaw/tampermonkey/raw/master/mattermost.user.js
// @version      0.10
// @description  Favicon change when there are unread messages, when hovering over a name, expose all members of private groups
// @author       Krakaw
// @match        https://nomatter.tari.com/*
// @grant        GM_notification
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        window.focus
// @grant unsafeWindow
// ==/UserScript==


/*var notificationDetails = {
    text: 'THIS IS A TEST NOTIFICATION!!!',
    title: 'TEST',
    timeout: 15000,
    onclick: function() { window.focus(); },
  };
GM_notification(notificationDetails);*/
class StoredLinks {
    constructor() {
        this.div = document.createElement('div')
        this.div.id = 'saved-messages';
        const svg = `
        <svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" height="17" width="14"
             xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 64 64" fill="white" enable-background="new 0 0 64 64"
             xml:space="preserve"><g id="Bullet-list"><path  d="M22.9840508,12.7494497h40c0.5522995,0,0.9995995-0.4471998,0.9995995-0.9994993c0-0.5522003-0.4473-0.9995003-0.9995995-0.9995003h-40c-0.5522003,0-0.9995003,0.4473-0.9995003,0.9995003C21.9845505,12.3022499,22.4318504,12.7494497,22.9840508,12.7494497z"/><path
                d="M62.9840508,31.2963505h-40c-0.5522003,0-0.9995003,0.4473-0.9995003,0.9994984c0,0.5522995,0.4473,0.9995003,0.9995003,0.9995003h40c0.5522995,0,0.9995995-0.4472008,0.9995995-0.9995003C63.9836502,31.7436504,63.5363503,31.2963505,62.9840508,31.2963505z"/><path
                d="M62.9840508,51.2504501h-40c-0.5522003,0-0.9995003,0.4473-0.9995003,0.9995003c0,0.5522995,0.4473,0.9995003,0.9995003,0.9995003h40c0.5522995,0,0.9995995-0.4472008,0.9995995-0.9995003C63.9836502,51.6977501,63.5363503,51.2504501,62.9840508,51.2504501z"/><path
                d="M5.9840508,5.7822499c-3.2904999,0-5.9677,2.6771998-5.9677,5.9677005c0,3.2905998,2.6772001,5.9678001,5.9677,5.9678001c3.2905998,0,5.9678001-2.6772003,5.9678001-5.9678001C11.9518509,8.4594498,9.2746506,5.7822499,5.9840508,5.7822499z M5.9840508,15.7822504c-2.2235854,0-4.0321999-1.8086004-4.0321999-4.0323c0-2.2236004,1.8086146-4.0322003,4.0321999-4.0322003c2.2236996,0,4.0323,1.8085999,4.0323,4.0322003C10.0163507,13.97365,8.2077503,15.7822504,5.9840508,15.7822504z"/><path
                d="M5.9840508,26.3281498c-3.2904999,0-5.9677,2.6772003-5.9677,5.9676991c0,3.2905998,2.6772001,5.9678001,5.9677,5.9678001c3.2905998,0,5.9678001-2.6772003,5.9678001-5.9678001C11.9518509,29.0053501,9.2746506,26.3281498,5.9840508,26.3281498z M5.9840508,36.3281517c-2.2235854,0-4.0321999-1.8086014-4.0321999-4.0323029c0-2.2235985,1.8086146-4.032198,4.0321999-4.032198c2.2236996,0,4.0323,1.8085995,4.0323,4.032198C10.0163507,34.5195503,8.2077503,36.3281517,5.9840508,36.3281517z"/><path
                d="M5.9840508,46.2822495c-3.2904999,0-5.9677,2.6772003-5.9677,5.967701c0,3.2905998,2.6772001,5.9678001,5.9677,5.9678001c3.2905998,0,5.9678001-2.6772003,5.9678001-5.9678001C11.9518509,48.9594498,9.2746506,46.2822495,5.9840508,46.2822495z M5.9840508,56.2822495c-2.2235854,0-4.0321999-1.8085976-4.0321999-4.032299c0-2.2236023,1.8086146-4.0321999,4.0321999-4.0321999c2.2236996,0,4.0323,1.8085976,4.0323,4.0321999C10.0163507,54.4736519,8.2077503,56.2822495,5.9840508,56.2822495z"/></g>
        </svg>
        <span id="quantity">0</span>
`;
        const button = document.createElement('button')
        button.className = 'channel-header__icon';
        button.innerHTML = svg;
        button.onclick = () => {
            this.showList();
        }
        button.setQuantity = (quantity) => {
            button.querySelector('span').innerText = quantity;
        }
        button.setQuantity(this._getData().length)
        this.div.appendChild(button);
        this.button = button;

    }


    init() {
        if (!document.getElementById('saved-messages')) {
            const header = document.querySelector("#channel-header > div > div:nth-child(1)");
            header.insertAdjacentElement('afterEnd', this.div)
            this.addObserver();
        }
    }

    addObserver() {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if ( mutation.type === 'childList' ) {
                    if (mutation.addedNodes.length >= 1) {
                        const menu = [...mutation.addedNodes].find(n => n && n.className && n.className.indexOf('MenuWrapper') > -1 && n.querySelector('ul.Menu__content'));
                        if (menu) {
                            const postId = menu.closest('.a11y__section').id.split('_').pop();
                            const postElement = document.getElementById(`post_${postId}`);
                            const postTitle = postElement.getAttribute('aria-label');

                            const matches = postTitle.match(/At (.*?, .*?), (.*?) (wrote|replied), (.*)/);
                            const date = matches[1];
                            const username = matches[2];
                            const postText = matches[4];
                            const channel = document.getElementById('channelHeaderTitle').innerText;

                            const storeItem = document.createElement('li');
                            storeItem.className = 'MenuItem';
                            storeItem.setAttribute('role', 'menuitem');
                            const storeButton = document.createElement('button');
                            storeButton.className = 'style--none';
                            storeButton.innerHTML = '<span class="MenuItem__primary-text">Store Link</span>';
                            storeButton.onclick = () => {
                                const data = this._getData();
                                data.push({
                                    date,
                                    username,
                                    channel,
                                    text: postText,
                                    id: postId
                                });
                                this._setData(data);
                            }
                            storeItem.appendChild(storeButton)
                            menu.querySelector('ul.Menu__content').prepend(storeItem)
                        }
                    }
                }
            });
        });

        const observerConfig = {
            attributes: true,
            childList: true,
            characterData: true,
            subtree: true
        };

        const targetNode = document.body;
        observer.observe(targetNode, observerConfig);
    }
    showList() {
        const list = this._getData()
        if (document.getElementById('list-stored-links')) {
            document.body.removeChild(document.getElementById('list-stored-links'));
            return;
        }
        const holder = document.createElement('div');
        holder.id = 'list-stored-links';
        holder.style.backgroundColor = 'black';
        holder.style.position = 'fixed';
        holder.style.top = '0px';
        holder.style.left = '0px';
        holder.style.zIndex = '9999';
        holder.style.maxWidth = '70%';
        const ul = document.createElement('ul');
        ul.style.color = 'white'
        holder.appendChild(ul);
        const baseUrl = `https://${window.location.hostname}/${window.location.pathname.split('/')[1]}/pl/`
        list.forEach(item => {
            const li = document.createElement('li');
            const deleteButton = document.createElement('button');
            deleteButton.innerText = 'X';
            deleteButton.onclick = () => {
                this._deleteId(item.id)
                ul.removeChild(li);
            }
            li.innerHTML = `<a href="${baseUrl}/${item.id}">${item.channel} @${item.username} [${item.date}] - ${item.text.substr(0, 100)} </a>`;
            li.appendChild(deleteButton)
            ul.appendChild(li);
        });
        document.body.appendChild(holder);
    }
    _deleteId(id) {
        const data = this._getData().filter(i => i.id !== id);
        this._setData(data);
    }
    _getData() {
        return JSON.parse(GM_getValue('storedLinks', '[]'));
    }
    _setData(data) {
        GM_setValue('storedLinks', JSON.stringify(data));
        this.button.setQuantity(data.length);
    }
}

(function (document) {
    'use strict';
    console.log('Tampermonkey script init');
    const storedLinks = new StoredLinks();
    var logoColor = "0089de";
    var sideBarColors = {
        new: "rgba(255,25,25,0.7)",
        old: "rgb(27, 44, 62)"
    };

    var directLinksContainer = null;
    var css = `
        .direct-link {
           position: fixed; left: 0;
           width: 70px;
           opacity: 1;
           z-index: 10000;
           padding-left: 2px;
           top: 200px;
        }
		.direct-link a {
			padding-top: 5px;
			color: #121212;
			text-decoration: underline;
			font-size: 10px;
		}
        #sidebarChannelContainer ul:not(.override-visible) li:not(.sidebar-section__header) { display: none }
        #sidebarChannelContainer ul li:nth-child(-n+11) { display: block !important}
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
                e.preventDefault();
            });
            document.body.append(directLinksContainer);
        }
        directLinksContainer.innerHTML = '';

        const elements = Array.from(unreadElements);
        elements.sort((a, b) => a.innerText.toLowerCase() > b.innerText.toLowerCase() ? 1 : -1);
        elements.forEach(el => {
            const a = document.createElement('a');
            a.href = "javascript:";
            a.innerText = el.parentNode.title;
            a.setAttribute("data-href", el.href.replace(`https://${window.location.hostname}`, ''));
            directLinksContainer.append(a);
        });
    }


    document.body.addEventListener("click", function (event) {
        if (event.target.classList.contains("unread") && event.target.classList.contains("team-container")) {
            event.target.classList.remove("unread");
        }
    });

    function initialize() {
        const sideBarEl = document.querySelector('.team-sidebar');
        if (!sideBarEl) {
            setTimeout(initialize, 10000);
            return;
        }
        console.log("Running Tampermonkey mods");
        storedLinks.init();



        var canvas = document.createElement('canvas'),
            ctx,
            img = document.createElement('img'),
            links = document.querySelectorAll("head link[rel=icon]"),
            channelGroups = document.querySelectorAll('#sidebarChannelContainer ul li.sidebar-section__header');

        channelGroups.forEach(group => {
            group.addEventListener('click', (e) => {
                group.parentElement.classList.toggle("override-visible");
            });

        });
        const origLink = links[0].href;

        const setTitles = function () {
            document.querySelectorAll('.sidebar-item__name').forEach(function (item) {
                if (item) {
                    item.parentElement.parentElement.setAttribute("title", item.innerText.trim())
                }
            });
        };
        setTitles();
        setInterval(setTitles, 60000);


        setInterval(function () {
            const unreadElements = document.querySelectorAll('.SidebarChannel .unread-title');
            createDirectUnreadLinks(sideBarEl, unreadElements);

            const unreadCount = unreadElements.length
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
                links.forEach(link => {link.href = canvas.toDataURL('image/png');})
            };
            img.src = origLink;
        }, 1000);
    }

    initialize();

})(document);
