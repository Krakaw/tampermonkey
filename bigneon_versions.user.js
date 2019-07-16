// ==UserScript==
// @name         BigNeon Versions
// @namespace    https://krakaw.github.io/
// @updateURL    https://github.com/Krakaw/tampermonkey/raw/master/bigneon_versions.user.js
// @version      0.7
// @description  Extract relevant version numbers from the Big Neon website
// @author       Krakaw
// @match        https://*.bigneon.com/*
// @match        http://localhost:3000/*
// @match        https://bn-web-development.firebaseapp.com/*
// @match        https://bigneon-develop-cfe0cd.netlify.com/*
// @grant        GM_addStyle
// ==/UserScript==
const SUPERMAN_IMAGE = `url('data:image/png;base64,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')`;

var BN_API_NODE_VERSION = "Waiting for request";
var BN_API_VERSION = "Waiting for request";
var BN_WEB_VERSION = "Waiting for request";
var IS_SUPER_ADMIN = false;
var VERSION_DIV = document.createElement("div");

VERSION_DIV.id = 'js-bigneon-versions';
(function () {
    "use strict";
    GM_addStyle(`#js-bigneon-versions { position: fixed; display: flex; flex-direction: column; border-radius: 4px; right:6px; top:100px; background-color: rgba(0,0,0,0.5); color: #fff; height: 100px; z-index:10000; padding: 5px; } #js-bigneon-versions.super-admin:after {content: ""; opacity: 0.5; background-image: ${SUPERMAN_IMAGE}; background-repeat: no-repeat; background-size: contain; background-position: center center; top: 0; left: 0; bottom: 0; right: 0; position: absolute; z-index: -1; } `);



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
        if (IS_SUPER_ADMIN) {
            VERSION_DIV.className = 'super-admin';
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
