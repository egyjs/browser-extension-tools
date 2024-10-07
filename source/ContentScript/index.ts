import {github, apigeeEdge} from '../Tools';

function docReady(fn:any) {
    // see if DOM is already available
    if (document.readyState === "complete" || document.readyState === "interactive") {
        // call on next available tick
        setTimeout(fn, 1);
    } else {
        document.addEventListener("DOMContentLoaded", fn);
    }
}


const main = async () => {


    const url = window.location.href;

    // github release
    let pattern = /^https:\/\/github.com\/.*\/.*\/releases\/new$/;

    if (pattern.test(url)) {
        github.release();
    }

    // apigee Edge diff
    // if document has div[apigee-menu]
    // && url ends with /develop\/\d+$
    if (document.querySelector('div[apigee-menu]')
        && /\/develop\/\d+$/.test(url)
    ) {
        apigeeEdge.diff();
    } else {
        console.log('no match');
    }


};

// @ts-ignore
window.navigation.addEventListener('navigate', () => {
    main();
});

// when page is loaded
docReady(main);

export {};
