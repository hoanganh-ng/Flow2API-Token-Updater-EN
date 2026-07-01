// logs.js - Logs viewer page script

// Format time
function formatTime(isoString) {
    const date = new Date(isoString);
    const now = new Date();
    const diff = now - date;

    // If today
    if (date.toDateString() === now.toDateString()) {
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    }

    // If yesterday
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) {
        return 'Yesterday ' + date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    }

    // Other dates
    return date.toLocaleString('en-US', {
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Render logs
function renderLogs(logs) {
    const container = document.getElementById('logsContainer');

    if (!logs || logs.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📝</div>
                <div>No log records yet</div>
            </div>
        `;
        return;
    }

    container.innerHTML = logs.map(log => {
        const detailsHtml = log.details
            ? `<div class="log-details">${JSON.stringify(log.details, null, 2)}</div>`
            : '';

        return `
            <div class="log-entry ${log.level}">
                <div class="log-header">
                    <span class="log-level ${log.level}">${log.level}</span>
                    <span class="log-time">${formatTime(log.timestamp)}</span>
                </div>
                <div class="log-message">${log.message}</div>
                ${detailsHtml}
            </div>
        `;
    }).join('');
}

// Load logs
async function loadLogs() {
    chrome.runtime.sendMessage({ action: 'getLogs' }, (response) => {
        if (response && response.success) {
            renderLogs(response.logs);
        } else {
            document.getElementById('logsContainer').innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">❌</div>
                    <div>Failed to load logs</div>
                </div>
            `;
        }
    });
}

// Clear logs
async function clearLogs() {
    if (!confirm('Are you sure you want to clear all logs?')) {
        return;
    }

    chrome.runtime.sendMessage({ action: 'clearLogs' }, (response) => {
        if (response && response.success) {
            loadLogs();
        }
    });
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadLogs();

    // Refresh button
    document.getElementById('refreshBtn').addEventListener('click', loadLogs);

    // Clear button
    document.getElementById('clearBtn').addEventListener('click', clearLogs);

    // Back button
    document.getElementById('backBtn').addEventListener('click', () => {
        window.location.href = 'popup.html';
    });

    // Auto refresh (every 5 seconds)
    setInterval(loadLogs, 5000);
});
