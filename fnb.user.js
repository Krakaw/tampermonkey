// ==UserScript==
// @name         FNB Rand Account Totals
// @namespace    https://krakaw.github.io/
// @updateURL    https://github.com/Krakaw/tampermonkey/raw/master/fnb.user.js
// @version      0.13
// @description  Extract Rand account non-investment non-loan accounts
// @author       Krakaw
// @match        https://www.online.fnb.co.za/banking/main.jsp
// @grant        none
// ==/UserScript==

//Super functions
if (console.log.toString().indexOf('[native code]') === -1) {
    delete console;
}

//Prototypes
Number.prototype.currency = function (c, d, t) {
    var n = this,
        c = isNaN(c = Math.abs(c)) ? 2 : c,
        d = d == undefined ? "." : d,
        t = t == undefined ? "," : t,
        s = n < 0 ? "-%s" : "%s",
        i = parseInt(n = Math.abs(+n || 0).toFixed(c)) + "",
        j = (j = i.length) > 3 ? j % 3 : 0;
    var tmp = (j ? i.substr(0, j) + t : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t) + (c ? d + Math.abs(n - i).toFixed(c).slice(2) : "");
    return s.replace('%s', tmp);
};


//Helper Functions

function get_exchange_rate(currency, callback) {
    var map = {
        '$': 'USD'
    };
    var currency_code = map[currency];
    //var source_html_url = 'https://www.fnb.co.za/Controller?nav=rates.forex.list.ForexRatesList&targetDiv=ui-workspace&ajax=true';
    //$.get(source_html_url, function(html) {
    //    var prices = $(html).find('.td20:contains("'+currency_code+'")').parent().find('.td20:contains("Bank Buying TT")');
    //    var price = prices.html().split(' ').pop();
    //    exchange_rates[currency] = price;
    //});
    $.getJSON('https://free.currconv.com/api/v7/convert?q=USD_ZAR&compact=ultra&apiKey=3bc309ae35a7e2f86878', function (data) {
        exchange_rates[currency] = data.USD_ZAR;
        if (typeof callback == 'function') {
            callback();
        }
    });
}

function calculate_forex(symbol, value) {
    return value * exchange_rates[symbol];
}

function extract_currency_value(html) {
    html = html.trim().replace(',', '');
    var parts = html.split(' ');
    if (parts.length == 1) {
        parts = [
            'R',
            parts[0]
        ];
    }
    var currency_symbol = parts[0];
    var value = parseFloat(parts[1]);

    return {symbol: currency_symbol, value: value};
}

//This extracts per line
function extract_balance(element) {
    var real_total = 0;
    var available_total = 0;
    $(element).find('div[name="ledgerBalance"]').each(function () {
        var real_pieces = extract_currency_value($(this).html());
        real_total += calculate_forex(real_pieces.symbol, real_pieces.value);
    });

    $(element).find('div[name="availablebalance"] a').each(function () {
        var available_pieces = extract_currency_value($(this).html());
        available_total += calculate_forex(available_pieces.symbol, available_pieces.value);
    });
    //real_total = real_total.currency();
    //available_total = available_total.currency();

    return {
        real_total: real_total || 0,
        available_total: available_total || 0
    };
}

//Execution Order
var exchange_rates = {
    'R': 1,
    'eB': 0.1,
    '$': 0
};


function get_totals() {
    if ($('#accountsTable_tableContent').length === 0) return;
    var data_blocks = {};
    var current_data_block = '';
    $('#accountsTable_tableContent').children().not('.expandableTableRow, .tableGroupHeader, .buttonGroupRow, .clear, .footerMessage').each(function () {
        //If there's a header, set that to the data block.
        if ($(this).hasClass('tableRowHeader')) {
            var block_id = $(this).attr('id');
            if (!data_blocks.hasOwnProperty(block_id)) {
                data_blocks[block_id] = {
                    elements: [],
                    real_total: 0,
                    available_total: 0
                };
                current_data_block = block_id;
                return;
            }
            alert('Somethings fucked. Multiple headers found');
        }
        data_blocks[current_data_block].elements.push(this);
        var totals = extract_balance(this);
        data_blocks[current_data_block].real_total += totals.real_total;
        data_blocks[current_data_block].available_total += totals.available_total;
    });

    var overall_real_total = 0;
    var overall_available_total = 0;

    for (var block_id in data_blocks) {
        var data = data_blocks[block_id];
        var real_colour = data.real_total > 0 ? 'green' : 'red';
        var available_colour = data.available_total > 0 ? 'green' : 'red';
        overall_real_total += data.real_total;
        overall_available_total += data.available_total;

        $('#' + block_id + ' .col3 a .hinner').html('Balance <span style="color:' + real_colour + ' ">' + data.real_total.currency() + '</span>');
        $('#' + block_id + ' .col4 a .hinner').html('Available Balance <span style="color:' + available_colour + ' ">' + data.available_total.currency() + '</span>');
    }

    if ($('#overall').length === 0) {
        $('#accountsTable_tableContent').before('<div id="overall"><table style="width:100%; color: #000"><tr><th style="color:#000">Real Total</th><th style="color:#000">Available Total</th></tr><tr><td><h2 id="overall_real_total" ></h2></td><td><h2 id="overall_available_total"></h2></td></tr></table></div>');
    }
    $('#overall_real_total').html(overall_real_total.currency());
    $('#overall_available_total').html(overall_available_total.currency());
}

get_exchange_rate('$', get_totals());

var interval = setInterval(get_totals, 2000);
