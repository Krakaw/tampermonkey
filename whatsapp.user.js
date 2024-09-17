// ==UserScript==
// @name         WhatsApp Web Keyboard Shortcuts
// @namespace    https://krakaw.github.io/
// @updateURL    https://github.com/Krakaw/tampermonkey/raw/master/whatsapp.user.js
// @version      0.6
// @description  Press the up arrow key in the input box to edit your last message, or shift + backspace to reply to the last message you received.
// @author       Krakaw
// @match        https://web.whatsapp.com/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    const debug = false;
    const sleepDelay = 150;
    const sleep = function(delayMs) {
        return new Promise((r) => {
            setTimeout(r, delayMs);
        });
    };

    function log(...args) {
        if (debug) {
            console.log(args);
        }
    }

    async function pressMenuButton(inOrOut, label) {
        const inOrOutClass = inOrOut === 'out' ? '.message-out' : '.message-in';
        const msgs = document.querySelectorAll(inOrOutClass);
        log(msgs)
        const lastMessage = msgs[msgs.length - 1].querySelector('div > div:first-child');
        log(lastMessage)
        if (lastMessage) {
            try {
                lastMessage.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }));
                await sleep(sleepDelay);
                document.querySelector(`${inOrOutClass}.focusable-list-item span[data-icon="down-context"]`)?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
                await sleep(sleepDelay);
                document.querySelector(`#app .app-wrapper-web li > div[aria-label="${label}"]`)?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
                if (inOrOut === 'out') {
                    await sleep(sleepDelay);
                    document.querySelector('div[role="dialog"] p.selectable-text.copyable-text')?.dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
                }
            } catch (e) {
                console.error(`WhatsApp:`, e);
            }
        }
    }


    document.addEventListener('keyup', async function(e) {
        // Check if the active element is the input box and the up arrow key was pressed
        if (document.activeElement.getAttribute('contenteditable') === 'true' &&
            document.activeElement.getAttribute('role') === 'textbox' &&
            (document.activeElement.getAttribute('aria-label') === 'Type a message' || document.activeElement.getAttribute('aria-placeholder') === 'Type a message')
           ) {


            const action = e.key === 'ArrowUp' && !document.activeElement.innerText.trim() ? 'edit' : e.shiftKey && e.key === 'Backspace' ? 'reply' : null;

            log('action', action);
            switch (action) {
                // Arrow up
                case 'edit':
                    await pressMenuButton('out', 'Edit');
                    break;
                // Shift + backspace
                case 'reply':
                    await pressMenuButton('in', 'Reply');
                    break;
                default:
                    // Do nothing
            }
        }
    });
})();
