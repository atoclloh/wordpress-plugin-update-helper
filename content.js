function addGenerateButton() {
    const heading = document.querySelector('h1');
    if (!heading) {
        console.log('WordPress header not found');
        return;
    }

    if (document.getElementById('generate-plugin-update-list')) return;

    const button = document.createElement('button');
    button.id = 'generate-plugin-update-list';
    button.textContent = 'Generate Update List';
    button.style.cssText = `
        margin-left: 10px;
        padding: 5px 10px;
        background-color: #2271b1;
        color: white;
        border: none;
        border-radius: 3px;
        cursor: pointer;
    `;

    button.addEventListener('click', generatePluginList);
    heading.appendChild(button);
}

function generatePluginList() {
    const pluginsList = [];
    const themesList = [];

    // Process plugins
    const pluginContainers = document.querySelectorAll('#update-plugins-table .plugin-title');
    pluginContainers.forEach(container => {
        const html = container.innerHTML.trim();
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');

        const name = doc.querySelector('strong')?.textContent;
        const currentVersion = html.match(/You have version ([\d.]+) installed/)?.[1];
        const newVersion = html.match(/Update to ([\d.]+)/)?.[1];

        if (name && currentVersion && newVersion) {
            pluginsList.push({
                name: name.trim(),
                current: currentVersion,
                new: newVersion
            });
        }
    });

    // Process themes
    const themeContainers = document.querySelectorAll('#update-themes-table .plugin-title');
    themeContainers.forEach(container => {
        const html = container.innerHTML.trim();
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');

        const name = doc.querySelector('strong')?.textContent;
        const currentVersion = html.match(/You have version ([\d.]+) installed/)?.[1];
        const newVersion = html.match(/Update to ([\d.]+)/)?.[1];

        if (name && currentVersion && newVersion) {
            themesList.push({
                name: name.trim(),
                current: currentVersion,
                new: newVersion
            });
        }
    });

    displayResults(pluginsList, themesList);
}

function displayResults(pluginsList, themesList) {
    // Create formatted text
    let formattedText = '';

    if (pluginsList.length > 0) {
        formattedText += `Plugins\n${pluginsList.map(plugin =>
            `- ${plugin.name} | ${plugin.current} → ${plugin.new}`
        ).join('\n')}\n\n`;
    }

    if (themesList.length > 0) {
        formattedText += `Themes\n${themesList.map(theme =>
            `- ${theme.name} | ${theme.current} → ${theme.new}`
        ).join('\n')}`;
    }

    // Create modal HTML
    const modalHTML = `
    <div id="plugin-update-modal" style="
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: white;
        padding: 20px;
        border-radius: 5px;
        box-shadow: 0 0 10px rgba(0,0,0,0.5);
        z-index: 9999;
        max-width: 80%;
        max-height: 80vh;
        overflow: auto;
    ">
        <button onclick="this.parentElement.remove()" style="
            float: right;
            margin-bottom: 10px;
        ">Close</button>
        <h2 style="margin-top: 0;">Plugin Updates</h2>
        <pre style="
            white-space: pre-wrap;
            word-wrap: break-word;
            margin: 0;
            font-family: monospace;
        ">${formattedText}</pre>
        <button id="copy-plugin-list" style="margin-top: 10px;">Copy to Clipboard</button>
    </div>`;

    // Rest of the modal code remains the same
    const modal = new DOMParser().parseFromString(modalHTML, 'text/html').body.firstChild;

    modal.querySelector('#copy-plugin-list').addEventListener('click', () => {
        navigator.clipboard.writeText(formattedText).then(() => {
            const btn = document.querySelector('#copy-plugin-list');
            btn.textContent = 'Copied!';
            setTimeout(() => btn.textContent = 'Copy to Clipboard', 2000);
        });
    });

    document.body.appendChild(modal);
}

function initializeExtension() {
    addGenerateButton();

    const observer = new MutationObserver(mutations => {
        mutations.forEach(mutation => {
            if (mutation.addedNodes.length) {
                addGenerateButton();
            }
        });
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

    let attempts = 0;
    const interval = setInterval(() => {
        if (attempts >= 5 || document.getElementById('generate-plugin-update-list')) {
            clearInterval(interval);
            return;
        }
        addGenerateButton();
        attempts++;
    }, 1000);
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeExtension);
} else {
    initializeExtension();
}