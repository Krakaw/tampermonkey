// ==UserScript==
// @name         Asana Point Counter
// @namespace    https://krakaw.github.io/
// @updateURL    https://github.com/Krakaw/tampermonkey/raw/master/asana_points.user.js
// @version      0.4
// @description  Calculates points for a sprint
// @author       Krakaw
// @match        https://app.asana.com/*
// @grant        GM_addStyle
// ==/UserScript==

(function () {
	"use strict";

	String.prototype.hashCode = function () {
		let hash = 0, i, chr;
		if (this.length === 0) return hash;
		for (i = 0; i < this.length; i++) {
			chr = this.charCodeAt(i);
			hash = ((hash << 5) - hash) + chr;
			hash |= 0; // Convert to 32bit integer
		}
		return hash;
	};

	GM_addStyle("#tallys::before {content: none !important;}")
	const styleSheet = GM_addStyle("").sheet;
	const hideToggle = document.createElement("span");
	hideToggle.addEventListener("click", toggle);
	const userAvatarElements = {};

	const STACKS = ["API", "Web", "React Native - Consumer", "iOS - Studio", "Android - Studio"];

	function toggle() {
		if (styleSheet.cssRules.length) {
			show();
		} else {
			hide();
		}
	}

	function show() {
		if (styleSheet.cssRules.length) {
			styleSheet.deleteRule(0);
		}
	}

	function hide() {
		styleSheet.insertRule(".js-values {display:None}");
	}

	function _pill(color, value) {
		return `<span class="Pill--color${color} Pill--deuteranopia Pill Pill--small">${value}</span>`;
	}

	function _row(stack, total, estimated) {
		return `<div style="display: flex; flex-direction: row">${stack}: <span style="flex: 1"></span> ${_pill("YellowGreen", total)} ${_pill("Blue", estimated)}</div>`;
	}


	function _cardValues(card) {
		let currentStack = "";
		let cardTotal = 0;
		let cardEstimateTotal = 0;
		[...card.querySelectorAll(".CustomPropertyEnumPreviewCell.BoardCardCustomPropertyPreviewCell-cell")].forEach(i => {
			let titleValue = i.getAttribute("title");

			//Check if it is an estimate
			const [_, value, isEstimate] = titleValue.match(/^([0-9.]+)(E$)?/) || [];
			if (!isNaN(value)) {
				if (isEstimate) {
					cardEstimateTotal += +value;
				} else {
					cardTotal += +value;
				}
			} else if (STACKS.indexOf(titleValue) > -1) {
				currentStack = titleValue;
			}
		});
		//Check if the card is assigned to someone and attach a point value to their score
		let avatar = card.querySelector(".DomainUserAvatar-avatar");
		let avatarUrl = false;
		if (avatar) {
			avatarUrl = avatar.style.backgroundImage.replace("url(\"", "").replace("\")", "") || [...avatar.classList].find(i => i.indexOf(`Avatar--color`) === 0);
		}
		return { currentStack, cardTotal, cardEstimateTotal, avatarUrl };
	}

	function _columnValues(column) {
		let total = 0;
		let estimateTotal = 0;

		let perUserPoints = {};
		let stackValues = {};
		STACKS.forEach(stack => {
			stackValues[stack] = { e: 0, t: 0 };
		});

		[...column.querySelectorAll(".BoardCardWithCustomProperties-contents")].forEach(card => {
			const { currentStack, cardTotal, cardEstimateTotal, avatarUrl } = _cardValues(card);
			if (avatarUrl) {
				if (!perUserPoints.hasOwnProperty(avatarUrl)) {
					perUserPoints[avatarUrl] = 0;
				}
				perUserPoints[avatarUrl] += cardTotal + cardEstimateTotal;
			}

			total += cardTotal;
			estimateTotal += cardEstimateTotal;

			if (currentStack) {
				stackValues[currentStack].t += +cardTotal;
				stackValues[currentStack].e += +cardEstimateTotal;
			}
		});

		return { total, estimateTotal, stackValues, perUserPoints };
	}

	function _renderColumn(column, values) {
		let oldValues = column.querySelector(".js-values");
		if (oldValues) {
			column.removeChild(oldValues);
		}

		let stackHtml = "";
		for (let stack in values.stackValues) {
			const { t: total, e: estimated } = values.stackValues[stack];
			stackHtml += _row(stack, total, estimated);
		}
		let html = `<div style="flex-direction: column;">
${_row("<b>Total</b>", values.total, values.estimateTotal)}
${stackHtml}
</div>`;

		let div = document.createElement("div");
		div.innerHTML = html;
		div.className = "js-values";
		column.prepend(div);
	}

	function _renderPerUserPoints(avatarUrl) {
		let hasUrl = avatarUrl.indexOf("https") === 0;
		let color = hasUrl ? "Avatar--color0" : avatarUrl;
		let backgroundUrls = hasUrl ? `background-image: linear-gradient(to bottom, rgba(0,0,0,0.3) 0%,rgba(0,0,0,0.3) 100%), url(${avatarUrl});` : "";
		return `<div id="avatar-${avatarUrl.hashCode()}" class="DomainUserAvatar-avatar ${color} AvatarPhoto AvatarPhoto--small" role="img" style="font-weight: bolder; font-size: 1em; ${backgroundUrls}"></div>`
	}

	function renderPerUserPointsList(perUserPoints, tallyTotal) {
		Object.keys(perUserPoints).forEach(avatarUrl => {
			let id = `avatar-${avatarUrl.hashCode()}`;
			let avatarElement = document.getElementById(id);
			if (!avatarElement) {
				tallyTotal.innerHTML += _renderPerUserPoints(avatarUrl);
				avatarElement = document.getElementById(id)
			}
			avatarElement.innerText = perUserPoints[avatarUrl];

		});
	}

	function tally() {
		let tallyTotal = document.getElementById("tallys");
		if (!tallyTotal) {
			tallyTotal = document.createElement("span");
			tallyTotal.id = "tallys";
			document.querySelector(".PageToolbarStructure-leftChildren").appendChild(tallyTotal);
			tallyTotal.append(hideToggle);
		}
		let total = 0;
		let estimatedTotal = 0;
		let columns = [...document.querySelectorAll(".BoardColumn")];

		const perUserPoints = {};
		let stackValues = {};
		STACKS.forEach(stack => {
			stackValues[stack] = { e: 0, t: 0 };
		});


		columns.forEach(column => {
			const values = _columnValues(column);
			_renderColumn(column, values);

			for (let stack in values.stackValues) {
				stackValues[stack].t += values.stackValues[stack].t;
				stackValues[stack].e += values.stackValues[stack].e;
			}

			for (let avatarUrl in values.perUserPoints) {
				if (!perUserPoints.hasOwnProperty(avatarUrl)) {
					perUserPoints[avatarUrl] = 0;
				}
				perUserPoints[avatarUrl] += values.perUserPoints[avatarUrl];
			}
			total += values.total;
			estimatedTotal += values.estimateTotal;

		});


		hideToggle.innerHTML = `${_row("👁 <b>Board Total</b>", total, estimatedTotal)}`;
		renderPerUserPointsList(perUserPoints, tallyTotal);
	}

	setInterval(tally, 5000);
})();
