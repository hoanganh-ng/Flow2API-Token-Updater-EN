// popup.js - Chrome extension configuration UI script

document.addEventListener('DOMContentLoaded', async () => {
    // Load saved config
    const config = await chrome.storage.sync.get(['apiUrl', 'connectionToken', 'refreshInterval']);

    if (config.apiUrl) {
        document.getElementById('apiUrl').value = config.apiUrl;
    }
    if (config.connectionToken) {
        document.getElementById('connectionToken').value = config.connectionToken;
    }
    if (config.refreshInterval) {
        document.getElementById('refreshInterval').value = config.refreshInterval;
    }

    // Save config
    document.getElementById('saveBtn').addEventListener('click', async () => {
        const apiUrl = document.getElementById('apiUrl').value.trim();
        const connectionToken = document.getElementById('connectionToken').value.trim();
        const refreshInterval = parseInt(document.getElementById('refreshInterval').value);

        if (!apiUrl || !connectionToken) {
            showStatus('Please fill in all configuration fields', 'error');
            return;
        }

        if (refreshInterval < 1 || refreshInterval > 1440) {
            showStatus('Refresh interval must be between 1-1440 minutes', 'error');
            return;
        }

        // Save config
        await chrome.storage.sync.set({
            apiUrl,
            connectionToken,
            refreshInterval
        });

        // Notify background script to update timer
        chrome.runtime.sendMessage({
            action: 'updateConfig',
            config: { apiUrl, connectionToken, refreshInterval }
        });

        showStatus('Configuration saved successfully!', 'success');
    });

    // Test immediately
    document.getElementById('testBtn').addEventListener('click', async () => {
        const apiUrl = document.getElementById('apiUrl').value.trim();
        const connectionToken = document.getElementById('connectionToken').value.trim();

        if (!apiUrl || !connectionToken) {
            showStatus('Please fill in and save the configuration first', 'error');
            return;
        }

        showStatus('Testing connection...', 'info');

        // Notify background script to execute immediately
        chrome.runtime.sendMessage({
            action: 'testNow'
        }, (response) => {
            if (response && response.success) {
                // Show different success messages based on action
                let statusMessage = '';
                if (response.action === 'updated') {
                    statusMessage = `✅ Test successful! Token updated to upstream\n${response.message}`;
                } else if (response.action === 'added') {
                    statusMessage = `✅ Test successful! Token added to upstream\n${response.message}`;
                } else {
                    statusMessage = `✅ Test successful! ${response.message}`;
                }
                showStatus(statusMessage, 'success');
            } else {
                showStatus(`❌ Test failed: ${response ? response.error : 'Unknown error'}`, 'error');
            }
        });
    });

    // View logs
    document.getElementById('logsBtn').addEventListener('click', () => {
        window.location.href = 'logs.html';
    });
});

function showStatus(message, type) {
    const statusEl = document.getElementById('status');
    statusEl.textContent = message;
    statusEl.className = `status ${type}`;
    statusEl.style.display = 'block';

    // Auto-hide after 3 seconds
    setTimeout(() => {
        statusEl.style.display = 'none';
    }, 3000);
}
