// ==UserScript==
// @name         Asana Point Counter
// @namespace    https://krakaw.github.io/
// @updateURL    https://github.com/Krakaw/tampermonkey/raw/master/asana_points.user.js
// @version      0.3
// @description  Calculates points for a sprint
// @author       Krakaw
// @match        https://app.asana.com/*
// @grant        GM_addStyle
// ==/UserScript==

(function() {
	'use strict';

    GM_addStyle('#tallys::before {content: none !important;}')
	const styleSheet = GM_addStyle('').sheet;
    const hideToggle = document.createElement('span');
	hideToggle.addEventListener('click', toggle);

    const STACKS = ['API', 'Web', 'React Native - Consumer', 'iOS - Studio', 'Android - Studio'];

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
		styleSheet.insertRule('.js-values {display:None}');
	}

	function _pill(color, value) {
		return `<span class="Pill--color${color} Pill--deuteranopia Pill Pill--small">${value}</span>`;
	}

	function _row(stack, total, estimated) {
		return `<div style="display: flex; flex-direction: row">${stack}: <span style="flex: 1"></span> ${_pill('YellowGreen', total)} ${_pill('Blue', estimated)}</div>`;
	}


	function _cardValues(card) {
		let currentStack = '';
		let cardTotal = 0;
		let cardEstimateTotal = 0;
		[...card.querySelectorAll('.CustomPropertyEnumPreviewCell.BoardCardCustomPropertyPreviewCell-cell')].forEach(i => {
			let titleValue = i.getAttribute('title');

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
		return {currentStack, cardTotal, cardEstimateTotal};
	}

	function _columnValues(column) {
		let total = 0;
		let estimateTotal = 0;

		let stackValues = {};
		STACKS.forEach(stack => {
			stackValues[stack] = {e: 0, t: 0};
		});

		[...column.querySelectorAll('.BoardCardWithCustomProperties-contents')].forEach(card => {
			const {currentStack, cardTotal, cardEstimateTotal} = _cardValues(card);
			total += cardTotal;
			estimateTotal += cardEstimateTotal;

			if (currentStack) {
				stackValues[currentStack].t += +cardTotal;
				stackValues[currentStack].e += +cardEstimateTotal;
			}
		});

		return {total, estimateTotal, stackValues};
	}

	function _renderColumn(column, values) {
		let oldValues = column.querySelector('.js-values');
		if (oldValues) {
			column.removeChild(oldValues);
		}

		let stackHtml = '';
		for (let stack in values.stackValues) {
			const {t: total, e: estimated} = values.stackValues[stack];
			stackHtml += _row(stack, total, estimated);
		}
		let html = `<div style="flex-direction: column;">
						${_row('<b>Total</b>', values.total, values.estimateTotal)}
						${stackHtml}
					</div>`;

		let div = document.createElement('div');
		div.innerHTML = html;
		div.className = 'js-values';
		column.prepend(div);

	}

	function tally() {
		let tallyTotal = document.getElementById('tallys');
		if (!tallyTotal) {
			tallyTotal = document.createElement('span');
			tallyTotal.id = 'tallys';
			document.querySelector('.PageToolbarStructure-leftChildren').appendChild(tallyTotal);
            		tallyTotal.append(hideToggle);
		}
		let total = 0;
		let estimatedTotal = 0;
		let columns = [...document.querySelectorAll('.BoardColumn')];

		let stackValues = {};
		STACKS.forEach(stack => {
			stackValues[stack] = {e: 0, t: 0};
		});


		columns.forEach(column => {
			const values = _columnValues(column);
			_renderColumn(column, values);

			for (let stack in values.stackValues) {
				stackValues[stack].t += values.stackValues[stack].t;
				stackValues[stack].e += values.stackValues[stack].e;
			}
			total += values.total;
			estimatedTotal += values.estimateTotal;

		});

		hideToggle.innerHTML = `${_row('👁 <b>Board Total</b>', total, estimatedTotal)}`;
	}

	setInterval(tally, 5000);
})();
