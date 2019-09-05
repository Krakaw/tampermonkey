// ==UserScript==
// @name         Asana Point Counter
// @namespace    https://krakaw.github.io/
// @updateURL    https://github.com/Krakaw/tampermonkey/raw/master/asana_points.user.js
// @version      0.1
// @description  Calculates points for a sprint
// @author       Krakaw
// @match        https://app.asana.com/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    function _getHeaders(column) {
        const header = column.querySelector('.BoardColumnHeader .BoardColumnHeaderTitle');
        if (!header.querySelector('.js-total-points')) {
            header.innerHTML += '<span class="js-total-points Pill--colorYellowGreen Pill--deuteranopia Pill Pill--small"></span>'
        }
        if (!header.querySelector('.js-estimate-points')) {
            header.innerHTML += '<span class="js-estimate-points Pill--colorBlue Pill--deuteranopia Pill Pill--small"></span>'
        }

        let total = header.querySelector('.js-total-points');
        let estimateTotal = header.querySelector('.js-estimate-points');
        return {
            total,
            estimateTotal
        };
    }

    function _countPoints(column) {
        let total = 0;
        let estimateTotal = 0;
        [...column.querySelectorAll('.CustomPropertyEnumPreviewCell.BoardCardCustomPropertyPreviewCell-cell')].forEach(i => {
            let titleValue = i.getAttribute('title');
            //Check if it is an estimate
            const [_, value, isEstimate] = titleValue.match(/^([0-9.]+)(E$)?/) || [];
            if (!isNaN(value)) {
                if (isEstimate) {
                    estimateTotal += +value;
                } else {
                    total += +value;
                }
            }
        });
        return {total, estimateTotal};
    }

    function tally() {
        let tallyTotal = document.getElementById('tallys');
        if (!tallyTotal) {
            tallyTotal = document.createElement('span');
            tallyTotal.id = "tallys";
            document.querySelector('.PageToolbarStructure-leftChildren').appendChild(tallyTotal);
        }
        let total = 0;
        let estimatedTotal = 0;
        let columns = [...document.querySelectorAll('.BoardColumn')];
        columns.forEach(col => {
            const headers = _getHeaders(col);
            const points = _countPoints(col);

            headers.total.innerText = points.total;
            headers.estimateTotal.innerText = points.estimateTotal

            total += points.total;
            estimatedTotal+=points.estimateTotal;

        });

        tallyTotal.innerHTML = `Estimated: ${estimatedTotal}      Actual: ${total}`;
    }

    setInterval(tally, 5000);
})();
