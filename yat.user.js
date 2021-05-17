// ==UserScript==
// @name         Yat Search
// @namespace    https://krakaw.github.io
// @version      0.1
// @description  Search for your Yats
// @author       Krakaw ☠️🐙☠️
// @match        http://localhost:3000/*
// @match        https://y.at/*
// @icon         https://i.y.at/%E2%98%A0%EF%B8%8F%F0%9F%90%99%E2%98%A0%EF%B8%8F?padding=1&transparent=1&width=64&height=64
// @grant        none
// ==/UserScript==

(function () {
  'use strict';

  const setup = () => {
    const menu = document.querySelector('#root > main > div > div.hidden-on-mobi > div > div > div > div:nth-child(2) > div > div.list');
    if (!menu) {
      return;
    }
    clearInterval(interval);
    menu.style.maxHeight = '90vh';
    const span = document.createElement('span');
    span.classList.add('list-yat');
    span.classList.add('js-search-list-yat');
    span.style.padding = '0';
    span.style.margin = '0';
    const search = document.createElement('input');
    search.style.margin = 'auto';
    search.style.padding = '0';
    search.style.maxWidth = '99%;';
    //search.style.border = 'none';

    search.addEventListener('keyup', (e) => {
      const query = e.target.value;
      [...menu.children].filter(child => child.className.indexOf('js-search-list-yat') === -1).forEach(child => {
        if (!query || child.innerText.indexOf(query) > -1) {
          child.style.display = 'block';
        } else {
          child.style.display = 'none';
        }
      });
      console.log(e.target.value);
    });
    span.appendChild(search);
    menu.prepend(span);
  };

  const interval = window.setInterval(() => {
    setup();
  }, 5000);

  // Your code here...
})();
