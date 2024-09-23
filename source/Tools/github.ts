const release = () => {
    const regex = /(.by.(@\w+)(?=\s).*|\*\*Full.*)/g;
    const releaseBody = document.querySelector('#release_body');
    const actionBar = document.querySelector('.ActionBar-item-container');

    const buttonTemplate = `<div class="ActionBar-item" data-offset-width="32" style="visibility: visible;">
  <button id="action-bar-remove-users" type="button" data-view-component="true" class="Button Button--iconOnly Button--invisible Button--medium" tabindex="0">
    <svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" height="16" version="1.1" width="16" data-view-component="true" class="octicon octicon-heading Button-visual" viewBox="0 0 24 24">
      <path d="m8,12c3.309,0,6-2.691,6-6S11.309,0,8,0,2,2.691,2,6s2.691,6,6,6Zm0-9c1.654,0,3,1.346,3,3s-1.346,3-3,3-3-1.346-3-3,1.346-3,3-3Zm8,19v.5c0,.829-.672,1.5-1.5,1.5s-1.5-.671-1.5-1.5v-.5c0-2.757-2.243-5-5-5s-5,2.243-5,5v.5c0,.829-.672,1.5-1.5,1.5s-1.5-.671-1.5-1.5v-.5c0-4.411,3.589-8,8-8s8,3.589,8,8Zm8-10.5c0,.829-.672,1.5-1.5,1.5h-6c-.828,0-1.5-.671-1.5-1.5s.672-1.5,1.5-1.5h6c.828,0,1.5.671,1.5,1.5Z"/>
    </svg>
    <span class="sr-only">Remove By (egyjs tool)</span>
  </button>
  <tool-tip id="tooltip-remove-users" for="action-bar-remove-users" popover="manual" data-direction="s" data-type="label" data-view-component="true" class="sr-only position-absolute" aria-hidden="true" role="tooltip">Remove By (egyjs tool)</tool-tip>
</div>`;

    let removeUsersButton = document.getElementById('action-bar-remove-users');

    if (!removeUsersButton && actionBar) {
        actionBar.insertAdjacentHTML('afterbegin', buttonTemplate);
        removeUsersButton = document.getElementById('action-bar-remove-users');
    }

    if (removeUsersButton && releaseBody) {
        removeUsersButton.addEventListener('click', () => {
            // @ts-ignore
            releaseBody.value = releaseBody.value.replaceAll(regex, '.').trim();
        });
    }
};


export {
    release
};
