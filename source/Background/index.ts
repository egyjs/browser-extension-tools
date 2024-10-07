import {browser, WebRequest} from 'webextension-polyfill-ts';

browser.runtime.onInstalled.addListener((): void => {
  console.log('🦄', 'extension installed');
});

browser.runtime.onMessage.addListener((message): void => {
  console.log('🐉', message);
});

browser.webRequest.onBeforeRequest.addListener(
    (details: WebRequest.OnBeforeRequestDetailsType) => {
        // send the details to the content script
        browser.tabs.query({ active: true, currentWindow: true })
            .then((tabs) => {
                if (tabs[0]) {
                    browser.tabs.sendMessage(tabs[0].id, {
                        "name": "request",
                        details: details
                    });
                }
            });
     },
    { urls: ["<all_urls>"] },
    ["blocking"]
);
