// ===========================================
// Logs Management & Export Module
// ===========================================

let currentLogFilter = 'all';

// ========== Render Logs ==========
function renderLogs(filterType = 'all') {
  currentLogFilter = filterType;
  
  const logsContainer = document.getElementById('logsContainer');
  if (!logsContainer) return;
  
  let logs = getLogs();
  
  // Apply filter
  if (filterType !== 'all') {
    logs = logs.filter(log => log.type === filterType);
  }
  
  // Update filter buttons
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.classList.remove('btn-primary');
    btn.classList.add('btn-outline');
  });
  
  const activeBtn = document.querySelector(`[data-filter="${filterType}"]`);
  if (activeBtn) {
    activeBtn.classList.remove('btn-outline');
    activeBtn.classList.add('btn-primary');
  }
  
  if (logs.length === 0) {
    logsContainer.innerHTML = `
      <div class="card">
        <div class="card-body text-center text-muted">
          ไม่มีบันทึกกิจกรรม
        </div>
      </div>
    `;
    return;
  }
  
  logsContainer.innerHTML = `
    <div class="timeline">
      ${logs.map(renderLogItem).join('')}
    </div>
  `;
}

function renderLogItem(log) {
  const typeIcons = {
    auth: '🔐',
    task: '📋',
    project: '📁',
    comment: '💬',
    checklist: '☑️',
    notification: '🔔',
    settings: '⚙️',
    reminder: '⏰'
  };
  
  const typeLabels = {
    auth: 'การเข้าสู่ระบบ',
    task: 'งาน',
    project: 'โปรเจกต์',
    comment: 'ความคิดเห็น',
    checklist: 'รายการตรวจสอบ',
    notification: 'การแจ้งเตือน',
    settings: 'การตั้งค่า',
    reminder: 'การแจ้งเตือน'
  };
  
  return `
    <div class="timeline-item">
      <div class="timeline-dot"></div>
      <div class="timeline-content">
        <div class="timeline-title">
          ${typeIcons[log.type] || '📝'} ${log.action}
        </div>
        <div class="timeline-description">
          ${log.description}
        </div>
        <div class="timeline-time">
          👤 ${log.userName} • 📅 ${formatDateTime(log.timestamp)} • 🏷️ ${typeLabels[log.type] || log.type}
        </div>
      </div>
    </div>
  `;
}

// ========== Export Functions ==========
function exportLogs(format) {
  const logs = getLogs();
  
  if (logs.length === 0) {
    showToast('ไม่มีบันทึกกิจกรรมให้ Export', 'error');
    return;
  }
  
  switch (format) {
    case 'csv':
      exportToCSV(logs);
      break;
    case 'excel':
      exportToExcel(logs);
      break;
    case 'json':
      exportToJSON(logs);
      break;
    default:
      showToast('รูปแบบไม่ถูกต้อง', 'error');
  }
}

function exportToCSV(logs) {
  // Create CSV header
  const headers = ['ID', 'ประเภท', 'การทำงาน', 'รายละเอียด', 'ผู้ใช้', 'วันที่-เวลา'];
  
  // Create CSV rows
  const rows = logs.map(log => [
    log.id,
    log.type,
    log.action,
    log.description.replace(/,/g, ';'), // Replace commas to avoid CSV issues
    log.userName,
    formatDateTime(log.timestamp)
  ]);
  
  // Combine headers and rows
  const csvContent = [
    '\ufeff' + headers.join(','), // Add BOM for Thai characters
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');
  
  // Download file
  downloadFile(csvContent, 'logs.csv', 'text/csv;charset=utf-8;');
  
  addLog('export', 'Export CSV', 'Export บันทึกกิจกรรมเป็น CSV');
  showToast('Export CSV สำเร็จ', 'success');
}

function exportToExcel(logs) {
  // Create HTML table for Excel
  const headers = ['ID', 'ประเภท', 'การทำงาน', 'รายละเอียด', 'ผู้ใช้', 'วันที่-เวลา'];
  
  const tableRows = logs.map(log => `
    <tr>
      <td>${log.id}</td>
      <td>${log.type}</td>
      <td>${log.action}</td>
      <td>${log.description}</td>
      <td>${log.userName}</td>
      <td>${formatDateTime(log.timestamp)}</td>
    </tr>
  `).join('');
  
  const htmlContent = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel">
    <head>
      <meta charset="utf-8">
      <style>
        table { border-collapse: collapse; width: 100%; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #4CAF50; color: white; font-weight: bold; }
      </style>
    </head>
    <body>
      <table>
        <thead>
          <tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr>
        </thead>
        <tbody>
          ${tableRows}
        </tbody>
      </table>
    </body>
    </html>
  `;
  
  downloadFile(htmlContent, 'logs.xls', 'application/vnd.ms-excel');
  
  addLog('export', 'Export Excel', 'Export บันทึกกิจกรรมเป็น Excel');
  showToast('Export Excel สำเร็จ', 'success');
}

function exportToJSON(logs) {
  const jsonContent = JSON.stringify(logs, null, 2);
  
  downloadFile(jsonContent, 'logs.json', 'application/json');
  
  addLog('export', 'Export JSON', 'Export บันทึกกิจกรรมเป็น JSON');
  showToast('Export JSON สำเร็จ', 'success');
}

function downloadFile(content, filename, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// ========== Initialize ==========
if (document.getElementById('logsContainer')) {
  renderLogs();
}
