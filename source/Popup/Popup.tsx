import * as React from 'react';
import {browser, Tabs} from 'webextension-polyfill-ts';

import './styles.scss';

function openWebPage(url: string): Promise<Tabs.Tab> {
  return browser.tabs.create({url});
}

const Popup: React.FC = () => {
  return (
    <section id="popup">
      <h2>EgyJs Tools</h2>
      <button
        id="options__button"
        type="button"
        onClick={(): Promise<Tabs.Tab> => {
          return openWebPage('options.html');
        }}
      >
        Options Page
      </button>
      <div className="links__holder">
        <ul>
          <li>
            <button
              type="button"
              onClick={(): Promise<Tabs.Tab> => {
                return openWebPage(
                  'https://github.com/egyjs/browser-extension-tools'
                );
              }}
            >
              GitHub
            </button>
          </li>
          <li>
            <button
              type="button"
              onClick={(): Promise<Tabs.Tab> => {
                return openWebPage(
                  'https://www.paypal.me/el3zahaby'
                );
              }}
            >
              Buy Me A Coffee
            </button>
          </li>
        </ul>
      </div>
    </section>
  );
};

export default Popup;
