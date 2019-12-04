// ==UserScript==
// @name         Asana Point Counter
// @namespace    https://krakaw.github.io/
// @updateURL    https://github.com/Krakaw/tampermonkey/raw/master/asana_points.user.js
// @version      0.10
// @description  Calculates points for a sprint
// @author       Krakaw
// @match        https://app.asana.com/*
// @grant        GM_addStyle
// ==/UserScript==

(function () {
  "use strict";
  const containerId = "apc-point-tally-holder";
  const userAvatars = {
    "https://s3.amazonaws.com/profile_photos/961577555524527.wcxoGb1euatpnNDWNTw9_27x27.png": "harrison",
    "https://s3.amazonaws.com/profile_photos/1121302342015397.rshVxhAYmGawnH0zD11S_27x27.png": "shanimal",
    "https://s3.amazonaws.com/profile_photos/729042145502554.JbsCbeAEKIjzaRwI1UPq_27x27.png": "mikethetike",
    "https://s3.amazonaws.com/profile_photos/752538406785485.z8FYfIcAm9NU6nudO9BV_27x27.png": "krakaw",
    "Avatar--color2": "bojan",
    "https://s3.amazonaws.com/profile_photos/1131859350497839.CTGHC191s8Fyxl0goQZb_27x27.png": "jay",
    "https://s3.amazonaws.com/profile_photos/1129433571072339.rKssqaNnzSMVpjhdGpZC_27x27.png": "ridley",
    "https://s3.amazonaws.com/profile_photos/1122382265175950.0DG1fvPUohiHivBS3K58_27x27.png": "zuzu",
    "https://s3.amazonaws.com/profile_photos/1138169963727452.doZhsHqa67GFwisflPLT_27x27.png": "icecool",
    "Avatar--color3": "nine",
    "https://s3.amazonaws.com/profile_photos/1126525471135378.EJXWe1srDcr1pP5naHmE_27x27.png": "mono",
    "https://s3.amazonaws.com/profile_photos/1148890256178133.QCVPF3t9T8RY79ISzAWW_27x27.png": "yenty",
    "https://s3.amazonaws.com/profile_photos/1107731534831075.TmOlbhFjttfbsvSdcPuB_27x27.png": "leet"
  };
  const stacks = ["API", "Web", "React Native - Consumer", "Infrastructure"];

  /** -------------------------- Don't edit anything after here -------------------------- **/

  GM_addStyle("#apc-totals::before {content: none !important;} #apc-totals {max-width: 200px;} #apc-point-tally-holder {margin-left: 15px;}");
  const styleSheet = GM_addStyle("").sheet;
  const columnClass = "apc-column-values";
  const avatarClass = "apc-avatar";

  let container;

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

  function toggleVisibility() {
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
    styleSheet.insertRule(`.${columnClass}, .${avatarClass} {display:none !important}`);
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
      } else if (stacks.indexOf(titleValue) > -1) {
        currentStack = titleValue;
      }
    });
    //Check if the card is assigned to someone and attach a point value to their score
    let avatar = card.querySelector(".DomainUserAvatar-avatar");
    let avatarUrl = false;
    if (avatar) {
      avatarUrl = avatar.style.backgroundImage.replace("url(\"", "").replace("\")", "") || [...avatar.classList].find(i => i.indexOf(`Avatar--color`) === 0);
    }
    return {currentStack, cardTotal, cardEstimateTotal, avatarUrl};
  }

  function _columnValues(column) {
    let total = 0;
    let estimateTotal = 0;

    let perUserPoints = {};
    let stackValues = {};
    stacks.forEach(stack => {
      stackValues[stack] = {e: 0, t: 0};
    });

    [...column.querySelectorAll(".BoardCard-contents")].forEach(card => {
      const {currentStack, cardTotal, cardEstimateTotal, avatarUrl} = _cardValues(card);
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

    return {total, estimateTotal, stackValues, perUserPoints};
  }

  function _renderColumn(column, values) {
    let oldValues = column.querySelector(`.${columnClass}`);
    if (oldValues) {
      column.removeChild(oldValues);
    }

    let stackHtml = "";
    for (let stack in values.stackValues) {
      const {t: total, e: estimated} = values.stackValues[stack];
      stackHtml += _row(stack, total, estimated);
    }
    let html = `<div style="flex-direction: column;">${_row("<b>Total</b>", values.total, values.estimateTotal)}${stackHtml}</div>`;

    let div = document.createElement("div");
    div.innerHTML = html;
    div.className = columnClass;
    column.prepend(div);
  }

  function _renderPerUserPoints(avatarUrl) {
    let hasUrl = avatarUrl.indexOf("https") === 0;
    let color = hasUrl ? "Avatar--color0" : avatarUrl;
    let backgroundUrls = hasUrl ? `background-image: linear-gradient(to bottom, rgba(0,0,0,0.3) 0%,rgba(0,0,0,0.3) 100%), url(${avatarUrl.replace('27x27', '128x128')});` : "";
    if (!userAvatars.hasOwnProperty(avatarUrl)) {
      console.log("Add avatar for", avatarUrl);
    }
    let title = userAvatars[avatarUrl] || `Ask Krakaw To Add Me! ${avatarUrl}`;

    let size = `width: 48px; min-width: 48px; height: 48px; line-height: 48px;`;
    return htmlToElement(`<div title="${title}" id="avatar-${avatarUrl.hashCode()}" class="DomainUserAvatar-avatar ${color} AvatarPhoto AvatarPhoto--small ${avatarClass}" role="img" style="${size} font-weight: bolder; font-size: 1em; ${backgroundUrls}"></div>`);
  }

  function htmlToElement(html) {
    const template = document.createElement('template');
    html = html.trim(); // Never return a text node of whitespace as the result
    template.innerHTML = html;
    return template.content.firstChild;
  }

  function renderPerUserPointsList(perUserPoints) {
    const documentFragment = document.createDocumentFragment();
    const elements = [];
    Object.keys(perUserPoints).forEach(avatarUrl => {
      let id = `avatar-${avatarUrl.hashCode()}`;
      let avatarElement = document.getElementById(id);
      if (!avatarElement) {
        avatarElement = _renderPerUserPoints(avatarUrl);
      }
      avatarElement.innerText = perUserPoints[avatarUrl];
      avatarElement.points = perUserPoints[avatarUrl];
      elements.push(avatarElement);
    });
    elements.sort((a, b) => a.points > b.points ? -1 : 1);
    elements.forEach(avatarElement => {
      documentFragment.appendChild(avatarElement);
    });

    return documentFragment;
  }

  function getContainer() {
    container = document.getElementById(containerId);
    if (!container) {
      container = document.createElement("div");
      container.id = containerId;

      const totals = document.createElement("div");
      totals.id = "apc-totals"
      totals.addEventListener("click", toggleVisibility);
      container.appendChild(totals);
      container.setTotals = (html) => {
        totals.innerHTML = html;
      };

      const userPoints = document.createElement("div");
      container.appendChild(userPoints);
      container.setPoints = (elem) => {
        userPoints.innerHTML = '';
        userPoints.appendChild(elem);
      };

      document.querySelector(".BoardBody-columnHorizontalScrollable").prepend(container);
    }
    return container;
  }

  function tally() {
    let total = 0;
    let estimatedTotal = 0;
    let columns = [...document.querySelectorAll(".BoardColumn")];

    const perUserPoints = {};
    let stackValues = {};
    stacks.forEach(stack => {
      stackValues[stack] = {e: 0, t: 0};
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
    const container = getContainer();
    container.setTotals(_row("👁 <b>Board Total</b>", total, estimatedTotal));
    container.setPoints(renderPerUserPointsList(perUserPoints));
  }
  setInterval(tally, 5000);
})();
