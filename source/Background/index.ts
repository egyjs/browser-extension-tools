import {browser} from 'webextension-polyfill-ts';

browser.runtime.onInstalled.addListener((): void => {
  console.log('🦄', 'extension installed');
});

browser.runtime.onMessage.addListener((message): void => {
  console.log('🐉', message);
});
