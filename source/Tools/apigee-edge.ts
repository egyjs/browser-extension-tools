
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const getProxyRevisions = async (org:string,proxy: string): Promise<string[]> => {
    const { origin } = window.location;
    const url = `${origin}/ws/proxy/organizations/${org}/apis/${proxy}?includeRevisions=true`;
    console.log("Fetching proxy revisions from URL:", url);
    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    });
    const data = await response.json();
    console.log("Received proxy revisions:", data);
    return data.revision;
};

const downloadRevisionBundle = async (org:string,proxy: string, revision: string): Promise<Blob> => {
    const { origin } = window.location;
    const url = `${origin}/gw/download/${org}/${proxy}/${revision}/`;
    console.log("Downloading revision bundle from URL:", url);
    const response = await fetch(url);
    console.log("Downloaded revision bundle for revision:", revision);
    return response.blob();
};

const createRevisionSelectorTemplate = (currentRev: string, revisions: string[]): string => {
    console.log("Creating revision selector template for current revision:", currentRev, "with revisions:", revisions);
    return `
    <div class="revisionSelectorContainer">
      <div class="btn-group">
        <button class="btn btn-small btn-revision dropdown-toggle" data-toggle="dropdown" href="#">
          <span>Diff </span><span> ${currentRev}</span>
          <span class="caret"></span>
        </button>
        <ul class="dropdown-menu rev-selector-menu">
          ${revisions.map(rev => `<li><a href="#" data-rev="${rev}">${rev}</a></li>`).join('')}
        </ul>
      </div>
    </div>
  `;
};

const insertRevisionSelector = (template: string) => {
    console.log("Inserting revision selector into the DOM.");
    const itemBefore = document.querySelector('.revisionSelectorContainer');
    if (itemBefore) {
        itemBefore.insertAdjacentHTML('afterend', template);
        console.log("Revision selector inserted successfully.");
    } else {
        console.log("Failed to find the element to insert the revision selector after.");
    }
};

const diff = async () => {
    const pathParts = window.location.pathname.split('/');
    const proxy = pathParts[4];
    let currentRev = pathParts[6];
    const org = pathParts[2];
    console.log("Current revision:", currentRev, "for proxy:", proxy, "in org:", org);

    console.log("Starting diff process for proxy:", proxy, "and current revision:", currentRev);
    const revisions = await getProxyRevisions(org,proxy).then(revs => revs.filter(rev => rev !== currentRev));
    console.log("Revisions fetched:", revisions);

    let currentRevBundle = await downloadRevisionBundle(org,proxy, currentRev);
    console.log("Current revision bundle downloaded:", currentRevBundle);


    await delay(1000);
    console.log("Delay of 1 second completed.");

    const template = createRevisionSelectorTemplate(currentRev, revisions);
    insertRevisionSelector(template);

    // Add event listener to open the diff UI when a revision is selected
    document.querySelector('.rev-selector-menu')?.addEventListener('click', async (event) => {
        const target = event.target as HTMLElement;
        if (target.tagName === 'A' && target.dataset.rev) {
            const selectedRev = target.dataset.rev;
            console.log("Selected revision for diff:", selectedRev);
            const selectedRevBundle = await downloadRevisionBundle(org,proxy, selectedRev);
            console.log("Selected revision bundle downloaded:", selectedRevBundle);

            // Open a new window with the diff UI
            openDiffUI({ rev: currentRev, bundle: currentRevBundle }, { rev: selectedRev, bundle: selectedRevBundle });
        }
    });

    console.log("Diff process completed.");
};

const openDiffUI = async (rev1: { rev: string, bundle: Blob }, rev2: { rev: string, bundle: Blob }) => {
    // Create a new window to show the diff UI
    const newWindow = window.open("", "_blank");
    const blob1 = rev1.bundle;
    const blob2 = rev2.bundle;
    if (newWindow) {
        const blob1ArrayBuffer = await blob1.arrayBuffer();
        const blob2ArrayBuffer = await blob2.arrayBuffer();

        newWindow.document.write(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Diff Viewer</title>
        <style>
          body {
            font-family: Arial, sans-serif;
          }
          .navigation {
            width: 30%;
            border-right: 1px solid #ccc;
            padding: 10px;
            box-sizing: border-box;
            float: left;
          }
          .diff-viewer {
                width: 70%;
                padding: 10px;
                box-sizing: border-box;
                float: left;
        }
          ul {
            list-style-type: none;
            padding: 0;
          }
          li:not(.f-removed) {
            padding: 5px;
            border-bottom: 1px solid #ddd;
            cursor: pointer;
          }
          li:hover {
            background-color: #f0f0f0;
          }
          .added {
            background-color: #e6ffe6;
          }
          .removed {
            background-color: #ffe6e6;
          }
          .f-added {
            color: #00b100;
          }
          .f-removed {
            color: red;
          }
          .f-modified {
            color: #003e00;
            font-weight: bold;
          }
          li.active {
            background-color: #eee     
          }
        </style>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/jszip/3.7.1/jszip.min.js"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/jsdiff/7.0.0/diff.min.js"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/10.7.1/styles/github.min.css" />
    <link
      rel="stylesheet" 
      type="text/css"
      href="https://cdn.jsdelivr.net/npm/diff2html/bundles/css/diff2html.min.css"
    />
    <script type="text/javascript" src="https://cdn.jsdelivr.net/npm/diff2html/bundles/js/diff2html-ui.min.js"></script>
      </head>
      <body>
        <div class="navigation">
          <h3>Files -  Rev ( <span class="f-added">"${rev1.rev}"</span> vs "${rev2.rev}")</h3>
          <ul id="file-list"></ul>
        </div>
        <div class="diff-viewer" id="diff-viewer">
          <h3>Diff</h3>
          <div id="diff-el"></div>
        </div>
        <script>
          (async function(blob1ArrayBuffer, blob2ArrayBuffer) {
            const fileList = document.getElementById('file-list');
            const diffContent = document.getElementById('diff-el');
            
            // Load and extract files from the zip blobs
            const zip1 = await JSZip.loadAsync(blob1ArrayBuffer);
            const zip2 = await JSZip.loadAsync(blob2ArrayBuffer);
            
            let files = Object.keys(zip1.files).map(fileName => {
                const is_new = zip2.files[fileName] === undefined;
                const is_deleted = false;
                return {
                    fileName,
                    is_new,
                    is_deleted: is_deleted,
                    is_modified: (!is_deleted && zip2.files[fileName]?._data.compressedSize !== zip1.files[fileName]?._data.compressedSize)};
            });
            Object.keys(zip2.files).forEach(fileName => {
                if (zip1.files[fileName] === undefined) {
                    files.push({fileName, is_new: false, is_deleted: true, is_modified: false});
                }
            });
               
            const color = (file) => {
                if (file.is_new) {
                    return 'f-added';
                } else if (file.is_deleted) {
                    return 'f-removed';
                } else if (file.is_modified) {
                    return 'f-modified';
                } else {
                    return '';
                }
            }
            
            files.forEach(file => {
              const fileName = file.fileName;
              const li = document.createElement('li');
              li.textContent = fileName;
              li.className = color(file);
              li.onclick = async () => {
                  if (file.is_deleted) {
                    return;
                  }
                  // add .active class to the clicked li
                const active = document.querySelector('.active');
                if (active) {
                    active.classList.remove('active');
                }
                li.classList.add('active');
                const file1Content = await zip1.files[fileName].async('string');
                const file2Content = await zip2.files[fileName]?.async('string') || '';
                const diff = Diff.createTwoFilesPatch(fileName,fileName,file2Content, file1Content);
                
                
                var configuration = {
                    drawFileList: true,
                    fileListToggle: false,
                    fileListStartVisible: false,
                    fileContentToggle: false,
                    matching: 'lines',
                    outputFormat: 'side-by-side',
                    synchronisedScroll: true,
                    highlight: true,
                    renderNothingWhenEmpty: false,
                 };
              var diff2htmlUi = new Diff2HtmlUI(diffContent, diff, configuration);
              diff2htmlUi.draw();
              diff2htmlUi.highlightCode();

                // diffContent.innerHTML = '';
                // diff.forEach(part => {
                //   const span = document.createElement('span');
                //   span.textContent = part.value;
                //   if (part.added) {
                //     span.className = 'added';
                //   } else if (part.removed) {
                //     span.className = 'removed';
                //   }
                //   diffContent.appendChild(span);
                // });
              };
              fileList.appendChild(li);
            });
      })(${JSON.stringify(Array.from(new Uint8Array(blob1ArrayBuffer)))}, ${JSON.stringify(Array.from(new Uint8Array(blob2ArrayBuffer)))});
        </script>
      </body>
      </html>
    `);
    }
};
export { diff };
