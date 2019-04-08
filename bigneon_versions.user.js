// ==UserScript==
// @name         BigNeon Versions
// @namespace    https://krakaw.github.io/
// @updateURL    https://github.com/Krakaw/tampermonkey/raw/master/bigneon_versions.user.js
// @version      0.3
// @description  Extract relevant version numbers from the Big Neon website
// @author       Krakaw
// @match        https://*.bigneon.com/*
// @match        https://bn.scrathpad.metalworks.tarilabs.com/*
// @match        http://localhost:3000/*
// @match        https://bn-web-development.firebaseapp.com/*
// @match        https://bigneon-develop-cfe0cd.netlify.com/*
// @grant        none
// ==/UserScript==

var BN_API_NODE_VERSION = "Waiting for request";
var BN_API_VERSION = "Waiting for request";
var BN_WEB_VERSION = "Waiting for request";
var VERSION_DIV = document.createElement("div");
document.body.appendChild(VERSION_DIV);
VERSION_DIV.style = "position: fixed; display: flex; flex-direction: column; border-radius: 4px; right:6px; top:100px; background-color: rgba(0,0,0,0.5); color: #fff; height: 100px; z-index:10000; padding: 5px; border-";
VERSION_DIV.addEventListener("click", function () {
	document.body.removeChild(VERSION_DIV);
});
(function () {
	"use strict";
	(function (open) {
		XMLHttpRequest.prototype.open = function () {
			this.addEventListener("readystatechange", function () {
				if (this.responseURL.indexOf("bigneon") > -1 && this.readyState === 4) {
					try {
						BN_API_VERSION = this.getResponseHeader("x-app-version") || "Unknown";
					} catch (e) {
					}
				}

			}, false);
			BN_WEB_VERSION = window.bigneonVersion || "Unknown";
			open.apply(this, arguments);
		};
	})(XMLHttpRequest.prototype.open);

	setInterval(function () {
		VERSION_DIV.innerHTML = `Node: ${BN_API_NODE_VERSION}<hr/>API: ${BN_API_VERSION}<hr/>Web: ${BN_WEB_VERSION}`;
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
