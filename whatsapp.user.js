// ==UserScript==
// @name         WhatsApp Web Keyboard Shortcuts
// @namespace    https://krakaw.github.io/
// @updateURL    https://github.com/Krakaw/tampermonkey/raw/master/whatsapp.user.js
// @version      0.2
// @description  Press the up arrow key in the input box to edit your last message, or shift + backspace to reply to the last message you received.
// @author       Krakaw
// @match        https://web.whatsapp.com/*
// @grant        none
// ==/UserScript==

(function() {
  'use strict';

  const sleep = function(delayMs) {
    return new Promise((r) => {
      setTimeout(r, delayMs);
    });
  };

  async function pressMenuButton(inOrOut, label) {
    const inOrOutClass = inOrOut === 'out' ? '.message-out' : '.message-in';
    const msgs = document.querySelectorAll(inOrOutClass);
    const lastOutgoingMessage = msgs[msgs.length - 1].querySelector('div > div:first-child');
    if (lastOutgoingMessage) {
      try {
        lastOutgoingMessage.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }));
        await sleep(150);
        document.querySelector('.message-out.focusable-list-item span[data-icon="down-context"]')?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        await sleep(150);
        document.querySelector(`#app .app-wrapper-web li > div[aria-label="${label}"]`)?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        await sleep(150);
        document.querySelector('div[role="dialog"] p.selectable-text.copyable-text')?.dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
      } catch {
      }
    }
  }

  document.addEventListener('keyup', async function(e) {
    // Check if the active element is the input box and the up arrow key was pressed
    if (document.activeElement.getAttribute('contenteditable') === 'true' &&
      document.activeElement.getAttribute('role') === 'textbox' &&
      document.activeElement.getAttribute('title') === 'Type a message'
     ) {
      // Find the last message sent by the user
      const action = e.key === 'ArrowUp' ? 'edit' : e.shiftKey && e.key === 'Backspace' ? 'delete' : null;
      switch(action) {
        // Arrow up
        case  'edit': {
          await pressMenuButton('out', 'Edit');
        }
        break;
        // Shift + backspace
        case 'reply': {
          await pressMenuButton('in', 'Reply');
        }
          break;
        default:
          // Do nothing

      }


    }
  });
})();
