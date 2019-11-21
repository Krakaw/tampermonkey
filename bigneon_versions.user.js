// ==UserScript==
// @name         BigNeon Versions
// @namespace    https://krakaw.github.io/
// @updateURL    https://github.com/Krakaw/tampermonkey/raw/master/bigneon_versions.user.js
// @version      0.9
// @description  Extract relevant version numbers from the Big Neon website
// @author       Krakaw
// @match        https://*.bigneon.com/*
// @match        http://*.scratch.bigneon.com/*
// @match        http://localhost:3000/*
// @match        https://bn-web-development.firebaseapp.com/*
// @match        https://bigneon-develop-cfe0cd.netlify.com/*
// @grant        GM_addStyle
// ==/UserScript==
const SUPERMAN_IMAGE = `url('data:image/png;base64,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')`;
const HYDRA_IMAGE = `url('data:image/png;base64,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')`;

var BN_API_NODE_VERSION = "Waiting for request";
var BN_API_VERSION = "Waiting for request";
var BN_WEB_VERSION = "Waiting for request";
var IS_SUPER_ADMIN = false;
var IS_ULTRA_ADMIN = false;
var VERSION_DIV = document.createElement("div");

VERSION_DIV.id = 'js-bigneon-versions';
(function () {
    "use strict";
    if (window.location.host.indexOf('bigneon') === -1 && window.location.host.indexOf(':3000') === -1) {
        return;
    }
    GM_addStyle(`#js-bigneon-versions { position: fixed; display: flex; flex-direction: column; border-radius: 4px; right:6px; top:100px; background-color: rgba(0,0,0,0.5); color: #fff; height: 140px; z-index:10000; padding: 5px; } #js-bigneon-versions.ultra-admin:after { background-image: ${HYDRA_IMAGE}; } #js-bigneon-versions.super-admin:after { background-image: ${SUPERMAN_IMAGE}; } #js-bigneon-versions.admin:after {content: ""; opacity: 0.5; background-repeat: no-repeat; background-size: contain; background-position: center center; top: 0; left: 0; bottom: 0; right: 0; position: absolute; z-index: -1; } `);



    document.body.appendChild(VERSION_DIV);
    VERSION_DIV.addEventListener("click", function () {
        document.body.removeChild(VERSION_DIV);
    });


    (function (open) {
        XMLHttpRequest.prototype.open = function () {
            this.addEventListener("readystatechange", function () {
                if (this.responseURL.indexOf("bigneon") > -1 && this.readyState === 4) {
                    try {
                        if (this.status === 200 && this.responseURL.indexOf("/me") > -1) {
                            let json = JSON.parse(this.responseText);
                            if (json.roles && json.roles.indexOf('Admin') > -1) {
                                IS_SUPER_ADMIN = true;
                            }
                            if (json.roles && json.roles.indexOf('Super') > -1) {
                                IS_ULTRA_ADMIN = true;
                            }
                        }
                        BN_API_VERSION = this.getResponseHeader("x-app-version") || "Unknown";
                    } catch (e) {
                    }
                }

            }, false);

            open.apply(this, arguments);
        };
    })(XMLHttpRequest.prototype.open);

    setInterval(function () {
        BN_WEB_VERSION = unsafeWindow.bigneonVersion || "Unknown";
        if (IS_ULTRA_ADMIN) {
            VERSION_DIV.className = 'ultra-admin admin';
        } else if (IS_SUPER_ADMIN) {
            VERSION_DIV.className = 'super-admin admin';
        }

        VERSION_DIV.innerHTML = `Host: ${window.location.host}<hr/>Node: ${BN_API_NODE_VERSION}<hr/>API: ${BN_API_VERSION}<hr/>Web: ${BN_WEB_VERSION}`;
    }, 5000);
})();
XMLHttpRequest.prototype.wrappedSetRequestHeader =
    XMLHttpRequest.prototype.setRequestHeader;

// Override the existing setRequestHeader function so that it stores the headers
XMLHttpRequest.prototype.setRequestHeader = function (header, value) {
    // Call the wrappedSetRequestHeader function first
    // so we get exceptions if we are in an erronous state etc.
    this.wrappedSetRequestHeader(header, value);

    if (header === "X-API-Client-Version") {
        BN_API_NODE_VERSION = value;
    }

    // Create a headers map if it does not exist
    if (!this.headers) {
        this.headers = {};
    }

    // Create a list for the header that if it does not exist
    if (!this.headers[header]) {
        this.headers[header] = [];
    }

    // Add the value to the header
    this.headers[header].push(value);
}
