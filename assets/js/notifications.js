// ===========================================
// Notifications Management Module
// ===========================================

let currentTab = 'inbox';

// ========== Notification Functions ==========
function createNotification(type, subject, body, metadata = {}) {
  const notifications = getNotifications();
  
  const notification = {
    id: generateId('notif'),
    type,
    subject,
    body,
    metadata,
    read: false,
    deleted: false,
    createdAt: new Date().toISOString()
  };
  
  notifications.unshift(notification);
  localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
  
  addLog('notification', 'สร้างการแจ้งเตือน', `${subject}`, metadata);
  
  return notification;
}

function markAsRead(notificationId) {
  const notifications = getNotifications();
  const notification = notifications.find(n => n.id === notificationId);
  
  if (notification) {
    notification.read = true;
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
    
    addLog('notification', 'อ่านแล้ว', `อ่านการแจ้งเตือน: ${notification.subject}`);
    
    renderNotifications();
  }
}

function markAsUnread(notificationId) {
  const notifications = getNotifications();
  const notification = notifications.find(n => n.id === notificationId);
  
  if (notification) {
    notification.read = false;
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
    
    renderNotifications();
  }
}

function deleteNotification(notificationId) {
  const notifications = getNotifications();
  const notification = notifications.find(n => n.id === notificationId);
  
  if (notification) {
    notification.deleted = true;
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
    
    addLog('notification', 'ลบการแจ้งเตือน', `ย้ายไปถังขยะ: ${notification.subject}`);
    
    showToast('ย้ายไปถังขยะเรียบร้อย', 'success');
    renderNotifications();
  }
}

function restoreNotification(notificationId) {
  const notifications = getNotifications();
  const notification = notifications.find(n => n.id === notificationId);
  
  if (notification) {
    notification.deleted = false;
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
    
    addLog('notification', 'กู้คืนการแจ้งเตือน', `กู้คืน: ${notification.subject}`);
    
    showToast('กู้คืนการแจ้งเตือนเรียบร้อย', 'success');
    renderNotifications();
  }
}

function permanentlyDeleteNotification(notificationId) {
  if (!confirm('คุณแน่ใจหรือไม่ที่จะลบการแจ้งเตือนนี้ถาวร?')) {
    return;
  }
  
  let notifications = getNotifications();
  const notification = notifications.find(n => n.id === notificationId);
  
  if (notification) {
    notifications = notifications.filter(n => n.id !== notificationId);
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
    
    addLog('notification', 'ลบถาวร', `ลบการแจ้งเตือนถาวร: ${notification.subject}`);
    
    showToast('ลบการแจ้งเตือนถาวรเรียบร้อย', 'success');
    renderNotifications();
  }
}

// ========== Reminder Functions ==========
function createReminder(taskId, reminderDate, message) {
  const task = getTaskById(taskId);
  if (!task) return null;
  
  const currentUser = getCurrentUser();
  
  // Create notification
  const notification = createNotification(
    'reminder',
    `🔔 การแจ้งเตือน: ${task.title}`,
    message || `งาน "${task.title}" กำหนดส่งวันที่ ${formatDate(task.dueDate)}`,
    { taskId, reminderDate }
  );
  
  // Simulate email
  sendEmail(
    currentUser.email,
    `🔔 การแจ้งเตือน: ${task.title}`,
    message || `งาน "${task.title}" กำหนดส่งวันที่ ${formatDate(task.dueDate)}`
  );
  
  showToast('ตั้งค่าการแจ้งเตือนเรียบร้อย', 'success');
  
  return notification;
}

// ========== Render Functions ==========
function renderNotifications() {
  const inboxContainer = document.getElementById('inboxNotifications');
  const trashContainer = document.getElementById('trashNotifications');
  
  if (!inboxContainer && !trashContainer) return;
  
  const notifications = getNotifications();
  
  // Filter notifications
  const inboxNotifs = notifications.filter(n => !n.deleted);
  const trashNotifs = notifications.filter(n => n.deleted);
  const unreadCount = inboxNotifs.filter(n => !n.read).length;
  
  // Update tab counts
  const inboxTab = document.querySelector('[data-tab="inbox"]');
  const trashTab = document.querySelector('[data-tab="trash"]');
  
  if (inboxTab) {
    inboxTab.innerHTML = `📥 กล่องข้อความ ${unreadCount > 0 ? `<span class="badge badge-priority-high">${unreadCount}</span>` : ''}`;
  }
  
  if (trashTab) {
    trashTab.innerHTML = `🗑️ ถังขยะ ${trashNotifs.length > 0 ? `<span class="badge badge-todo">${trashNotifs.length}</span>` : ''}`;
  }
  
  // Render inbox
  if (inboxContainer) {
    if (inboxNotifs.length === 0) {
      inboxContainer.innerHTML = `
        <div class="card">
          <div class="card-body text-center text-muted">
            ไม่มีการแจ้งเตือน
          </div>
        </div>
      `;
    } else {
      inboxContainer.innerHTML = inboxNotifs.map(renderNotificationCard).join('');
    }
  }
  
  // Render trash
  if (trashContainer) {
    if (trashNotifs.length === 0) {
      trashContainer.innerHTML = `
        <div class="card">
          <div class="card-body text-center text-muted">
            ถังขยะว่างเปล่า
          </div>
        </div>
      `;
    } else {
      trashContainer.innerHTML = trashNotifs.map(renderTrashCard).join('');
    }
  }
}

function renderNotificationCard(notification) {
  const typeIcons = {
    email: '📧',
    reminder: '🔔',
    system: '⚙️',
    task: '📋'
  };
  
  return `
    <div class="card ${!notification.read ? 'unread' : ''}" style="${!notification.read ? 'border-left: 4px solid var(--color-primary);' : ''}">
      <div class="card-body">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: var(--spacing-sm);">
          <div style="flex: 1;">
            <div style="display: flex; align-items: center; gap: var(--spacing-sm); margin-bottom: var(--spacing-xs);">
              <span>${typeIcons[notification.type] || '📬'}</span>
              <strong style="font-size: 1.05rem;">${notification.subject}</strong>
              ${!notification.read ? '<span class="badge badge-primary">ใหม่</span>' : ''}
            </div>
            <div class="text-muted" style="font-size: 0.875rem; margin-bottom: var(--spacing-sm);">
              ${notification.body}
            </div>
            <div class="text-muted" style="font-size: 0.75rem;">
              📅 ${formatRelativeTime(notification.createdAt)}
            </div>
          </div>
        </div>
        <div style="display: flex; gap: var(--spacing-sm); margin-top: var(--spacing-md); padding-top: var(--spacing-md); border-top: 1px solid var(--color-gray-100);">
          ${!notification.read ? `
            <button class="btn btn-sm btn-primary" onclick="markAsRead('${notification.id}')">
              ✓ ทำเครื่องหมายว่าอ่านแล้ว
            </button>
          ` : `
            <button class="btn btn-sm btn-outline" onclick="markAsUnread('${notification.id}')">
              ทำเครื่องหมายว่ายังไม่ได้อ่าน
            </button>
          `}
          <button class="btn btn-sm btn-danger" onclick="deleteNotification('${notification.id}')">
            🗑️ ย้ายไปถังขยะ
          </button>
        </div>
      </div>
    </div>
  `;
}

function renderTrashCard(notification) {
  const typeIcons = {
    email: '📧',
    reminder: '🔔',
    system: '⚙️',
    task: '📋'
  };
  
  return `
    <div class="card">
      <div class="card-body">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: var(--spacing-sm);">
          <div style="flex: 1;">
            <div style="display: flex; align-items: center; gap: var(--spacing-sm); margin-bottom: var(--spacing-xs);">
              <span>${typeIcons[notification.type] || '📬'}</span>
              <strong style="font-size: 1.05rem;">${notification.subject}</strong>
            </div>
            <div class="text-muted" style="font-size: 0.875rem; margin-bottom: var(--spacing-sm);">
              ${notification.body}
            </div>
            <div class="text-muted" style="font-size: 0.75rem;">
              📅 ${formatRelativeTime(notification.createdAt)}
            </div>
          </div>
        </div>
        <div style="display: flex; gap: var(--spacing-sm); margin-top: var(--spacing-md); padding-top: var(--spacing-md); border-top: 1px solid var(--color-gray-100);">
          <button class="btn btn-sm btn-primary" onclick="restoreNotification('${notification.id}')">
            ↩️ กู้คืน
          </button>
          <button class="btn btn-sm btn-danger" onclick="permanentlyDeleteNotification('${notification.id}')">
            ❌ ลบถาวร
          </button>
        </div>
      </div>
    </div>
  `;
}

// ========== Tab Functions ==========
function switchTab(tabName) {
  currentTab = tabName;
  
  // Update tab links
  document.querySelectorAll('.tab-link').forEach(tab => {
    tab.classList.remove('active');
  });
  
  const activeTabLink = document.querySelector(`[data-tab="${tabName}"]`);
  if (activeTabLink) {
    activeTabLink.classList.add('active');
  }
  
  // Update tab content
  document.querySelectorAll('.tab-content').forEach(content => {
    content.classList.remove('active');
  });
  
  const activeContent = document.getElementById(`${tabName}Tab`);
  if (activeContent) {
    activeContent.classList.add('active');
  }
}

// ========== Initialize ==========
if (document.getElementById('inboxNotifications') || document.getElementById('trashNotifications')) {
  renderNotifications();
}
