// ==UserScript==
// @name         Github formatting
// @namespace    https://krakaw.github.io/
// @version      0.2
// @description  Some github enhancements
// @author       Krakaw
// @match        https://github.com/*/pulls*
// @match        https://github.com/*/pull/*
// @match        https://github.com/*/issues/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';



    /**
 * Returns the week number for this date.  dowOffset is the day of week the week
 * "starts" on for your locale - it can be from 0 to 6. If dowOffset is 1 (Monday),
 * the week returned is the ISO 8601 week number.
 * @param int dowOffset
 * @return int
 */
    Date.prototype.getWeek = function (dowOffset) {
        /*getWeek() was developed by Nick Baicoianu at MeanFreePath: http://www.epoch-calendar.com */

        dowOffset = typeof(dowOffset) == 'int' ? dowOffset : 0; //default dowOffset to zero
        var newYear = new Date(this.getFullYear(),0,1);
        var day = newYear.getDay() - dowOffset; //the day of week the year begins on
        day = (day >= 0 ? day : day + 7);
        var daynum = Math.floor((this.getTime() - newYear.getTime() - 	(this.getTimezoneOffset()-newYear.getTimezoneOffset())*60000)/86400000) + 1;
        var weeknum;
        //if the year starts before the middle of a week
        if(day < 4) {
            weeknum = Math.floor((daynum+day-1)/7) + 1;
            if(weeknum > 52) {
                let nYear = new Date(this.getFullYear() + 1,0,1);
                let nday = nYear.getDay() - dowOffset;
                nday = nday >= 0 ? nday : nday + 7;
                /*if the next year starts before the middle of
 			  the week, it is week #1 of that year*/
                weeknum = nday < 4 ? 1 : 53;
            }
        }
        else {
            weeknum = Math.floor((daynum+day-1)/7);
        }
        return weeknum;
    };


    let href = window.location.href;
    if (href.indexOf('/pull/') > -1 || href.indexOf('/issues/') > -1) {
        let shortcode = href.replace('https://github.com/', '').replace('/pull/', '#').replace('/issues/', '#');
        let input = document.createElement('input');
        input.value = shortcode;
        input.setAttribute('readonly', true);
        input.addEventListener('click', function() {this.setSelectionRange(0, this.value.length)})
        document.querySelector('span.gh-header-number').replaceWith(input);
    } else {
        //List of pull requests
        document.querySelectorAll('.opened-by relative-time').forEach(item => {
            try {

                if (!item) {
                    return;
                }
                let dateTime = item.getAttribute('datetime');
                let parentIdNode = item.parentNode.parentNode.parentNode.parentNode.parentNode;
                let date = new Date(dateTime);
                item.innerHTML = `${item.getAttribute('title')}<br>` + item.innerHTML
                let label = parentIdNode.querySelector('label.float-left.py-2.pl-3');
                label.innerHTML = date.getWeek(6) + label.innerHTML;
            }catch(e) {}
        });
    }
})();
