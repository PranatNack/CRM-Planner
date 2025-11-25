// ===========================================
// Thai Task & Project Management System
// Main Application JavaScript
// ===========================================

// ========== LocalStorage Keys ==========
const STORAGE_KEYS = {
  USERS: 'tpm_users',
  CURRENT_USER: 'tpm_current_user',
  TASKS: 'tpm_tasks',
  PROJECTS: 'tpm_projects',
  NOTIFICATIONS: 'tpm_notifications',
  LOGS: 'tpm_logs',
  SETTINGS: 'tpm_settings'
};

// ========== Initialize Application ==========
function initApp() {
  // Initialize demo data if first time
  if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
    initializeDemoData();
  }
  
  // Check authentication
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  const currentUser = getCurrentUser();
  
  if (!currentUser && currentPage !== 'login.html') {
    window.location.href = 'login.html';
    return;
  }
  
  if (currentUser && currentPage === 'login.html') {
    window.location.href = 'index.html';
    return;
  }
  
  // Apply theme
  applyTheme();
  
  // Initialize header if not login page
  if (currentPage !== 'login.html') {
    initHeader();
  }
  
  // Create loading overlay
  createLoadingOverlay();
}

// ========== Demo Data Initialization ==========
function initializeDemoData() {
  // Create demo users
  const users = [
    {
      id: 'user1',
      name: 'แน็ก',
      email: 'admin@example.com',
      password: '123456',
      avatar: '👨‍💼',
      role: 'admin'
    },
    {
      id: 'user2',
      name: 'PGun',
      email: 'user@example.com',
      password: '123456',
      avatar: '👔',
      role: 'manager'
    },
    {
      id: 'user3',
      name: 'PBoat',
      email: 'vichai@example.com',
      password: '123456',
      avatar: '👨‍🎨',
      role: 'user'
    },
    {
      id: 'user4',
      name: 'PBon',
      email: 'suda@example.com',
      password: '123456',
      avatar: '👩‍🔧',
      role: 'user'
    },
    {
      id: 'user5',
      name: 'PAo',
      email: 'PAo@example.com',
      password: '123456',
      avatar: '👔',
      role: 'manager'
    }
  ];
  
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  
  // Create demo tasks with various due dates
  const now = new Date();
  const tasks = [
    {
      id: 'task1',
      title: 'ออกแบบฐานข้อมูล',
      description: 'ออกแบบโครงสร้างฐานข้อมูลสำหรับระบบคลังสินค้า พร้อม ER Diagram',
      status: 'done',
      priority: 'high',
      projectId: 'proj1',
      assignee: 'user1',
      manager: 'user1',
      dueDate: '2025-02-28',
      checklist: [
        {
          id: 'cl1',
          text: 'สร้าง ER Diagram',
          completed: true,
          comments: [],
          createdAt: new Date('2025-01-20').toISOString()
        },
        {
          id: 'cl2',
          text: 'Review โครงสร้างกับทีม',
          completed: true,
          comments: [],
          createdAt: new Date('2025-01-20').toISOString()
        }
      ],
      comments: [
        {
          id: 'comm1',
          text: 'ออกแบบเสร็จแล้ว รอ review ค่ะ',
          userId: 'user1',
          userName: 'สมชาย ใจดี',
          createdAt: new Date('2025-02-15T10:30:00').toISOString()
        }
      ],
      createdAt: new Date('2025-01-16').toISOString(),
      updatedAt: new Date('2025-02-20').toISOString()
    },
    {
      id: 'task2',
      title: 'พัฒนา API Backend',
      description: 'สร้าง RESTful API สำหรับระบบคลังสินค้า',
      status: 'inprogress',
      priority: 'high',
      projectId: 'proj1',
      assignee: 'user2',
      manager: 'user1',
      dueDate: '2025-11-28',
      checklist: [
        {
          id: 'cl3',
          text: 'สร้าง User Authentication API',
          completed: true,
          comments: [
            {
              id: 'clcomm1',
              text: 'ใช้ JWT สำหรับ authentication',
              userId: 'user2',
              userName: 'สมหญิง รักงาน',
              createdAt: new Date('2025-03-10T14:20:00').toISOString()
            }
          ],
          createdAt: new Date('2025-03-01').toISOString()
        },
        {
          id: 'cl4',
          text: 'สร้าง Product Management API',
          completed: false,
          comments: [],
          createdAt: new Date('2025-03-05').toISOString()
        }
      ],
      comments: [],
      createdAt: new Date('2025-03-01').toISOString(),
      updatedAt: new Date('2025-03-15').toISOString()
    },
    {
      id: 'task3',
      title: 'ออกแบบ UI/UX หน้าเว็บ',
      description: 'ออกแบบหน้าเว็บไซต์องค์กรให้ทันสมัยและใช้งานง่าย',
      status: 'inprogress',
      priority: 'medium',
      projectId: 'proj2',
      assignee: 'user3',
      manager: 'user1',
      dueDate: '2025-11-26',
      checklist: [],
      comments: [
        {
          id: 'comm2',
          text: 'กำลังทำ mockup หน้า Home ค่ะ',
          userId: 'user3',
          userName: 'วิชัย มานะดี',
          createdAt: new Date('2025-11-20T09:15:00').toISOString()
        }
      ],
      createdAt: new Date('2025-02-05').toISOString(),
      updatedAt: new Date('2025-11-20').toISOString()
    },
    {
      id: 'task4',
      title: 'พัฒนาระบบจัดการลูกค้า',
      description: 'สร้างฟีเจอร์จัดการข้อมูลลูกค้าในระบบ CRM',
      status: 'todo',
      priority: 'high',
      projectId: 'proj3',
      assignee: 'user1',
      manager: 'user3',
      dueDate: '2025-11-27',
      checklist: [],
      comments: [],
      createdAt: new Date('2025-03-05').toISOString(),
      updatedAt: new Date('2025-03-05').toISOString()
    },
    {
      id: 'task5',
      title: 'ทดสอบระบบบัญชี',
      description: 'ทดสอบฟีเจอร์ต่างๆ ของระบบบัญชีที่ปรับปรุงใหม่',
      status: 'todo',
      priority: 'medium',
      projectId: 'proj4',
      assignee: 'user4',
      manager: 'user2',
      dueDate: '2025-11-29',
      checklist: [],
      comments: [],
      createdAt: new Date('2025-05-01').toISOString(),
      updatedAt: new Date('2025-05-01').toISOString()
    },
    {
      id: 'task6',
      title: 'วางแผนการพัฒนา Mobile App',
      description: 'วางแผนและกำหนด requirements สำหรับ Mobile App',
      status: 'todo',
      priority: 'low',
      projectId: 'proj5',
      assignee: 'user3',
      manager: 'user1',
      dueDate: '2025-12-15',
      checklist: [],
      comments: [],
      createdAt: new Date('2025-04-02').toISOString(),
      updatedAt: new Date('2025-04-02').toISOString()
    },
    {
      id: 'task7',
      title: 'เขียนเอกสาร API Documentation',
      description: 'จัดทำเอกสารคู่มือการใช้งาน API',
      status: 'inprogress',
      priority: 'medium',
      projectId: 'proj1',
      assignee: 'user2',
      manager: 'user1',
      dueDate: '2025-12-05',
      checklist: [],
      comments: [],
      createdAt: new Date('2025-03-20').toISOString(),
      updatedAt: new Date('2025-11-15').toISOString()
    }
  ];
  
  localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
  
  // Create demo projects
  const projects = [
    {
      id: 'proj1',
      name: 'MA Backup VPN (Y69)',
      contractNumber: '',
      fiscalYear: '2569',
      projectStartDate: '2025-12-01',
      contractExpirationDate: '2026-09-30',
      status: 'inprogress',
      manager: 'user1',
      createdAt: new Date('2025-12-01').toISOString()
    },
    {
      id: 'proj2',
      name: 'MA Law (Y69)',
      contractNumber: '4/2569',
      fiscalYear: '2569',
      projectStartDate: '2025-10-01',
      contractExpirationDate: '2026-09-30',
      status: 'inprogress',
      manager: 'user2',
      createdAt: new Date('2025-10-01').toISOString()
    },
    {
      id: 'proj3',
      name: 'Monitoring',
      contractNumber: '103/2568',
      fiscalYear: '2568',
      projectStartDate: '2025-07-15',
      contractExpirationDate: '2026-05-10',
      status: 'inprogress',
      manager: 'user1',
      createdAt: new Date('2025-07-15').toISOString()
    },
    {
      id: 'proj4',
      name: 'MA Cyber Y68',
      contractNumber: '100/2568',
      fiscalYear: '2568',
      projectStartDate: '2025-06-01',
      contractExpirationDate: '2025-09-30',
      status: 'inprogress',
      manager: 'user1',
      createdAt: new Date('2025-06-01').toISOString()
    },
    {
      id: 'proj5',
      name: 'MA Opendata_Y68',
      contractNumber: '79/2568',
      fiscalYear: '2568',
      projectStartDate: '2025-02-01',
      contractExpirationDate: '2025-09-30',
      status: 'inprogress',
      manager: 'user3',
      createdAt: new Date('2025-02-01').toISOString()
    },
    {
      id: 'proj6',
      name: 'Ma Gisco_Y68',
      contractNumber: '73/2568',
      fiscalYear: '2568',
      projectStartDate: '2025-01-01',
      contractExpirationDate: '2025-09-30',
      status: 'inprogress',
      manager: 'user3',
      createdAt: new Date('2025-01-01').toISOString()
    },
    {
      id: 'proj7',
      name: 'Server VM',
      contractNumber: '101/2567',
      fiscalYear: '2568',
      projectStartDate: '2024-10-01',
      contractExpirationDate: '2025-02-27',
      status: 'done',
      manager: 'user1',
      createdAt: new Date('2024-10-01').toISOString()
    },
    {
      id: 'proj8',
      name: 'MA PTS_Y68',
      contractNumber: '48/2568',
      fiscalYear: '2568',
      projectStartDate: '2024-10-01',
      contractExpirationDate: '2025-09-30',
      status: 'inprogress',
      manager: 'user2',
      createdAt: new Date('2024-10-01').toISOString()
    },
    {
      id: 'proj9',
      name: 'MA Law_Y68',
      contractNumber: '17/2568',
      fiscalYear: '2568',
      projectStartDate: '2024-10-01',
      contractExpirationDate: '2025-09-30',
      status: 'inprogress',
      manager: 'user2',
      createdAt: new Date('2024-10-01').toISOString()
    },
    {
      id: 'proj10',
      name: 'Backup VPN',
      contractNumber: '70/2567',
      fiscalYear: '2567',
      projectStartDate: '2024-03-01',
      contractExpirationDate: '2024-10-26',
      status: 'done',
      manager: 'user1',
      createdAt: new Date('2024-03-01').toISOString()
    }
  ];
  
  localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
  
  // Initialize empty arrays
  localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify([]));
  localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify([]));
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify({
    theme: 'light',
    notifications: true
  }));
}

// ========== Authentication Functions ==========
function login(email, password) {
  const users = getUsers();
  const user = users.find(u => u.email === email && u.password === password);
  
  if (user) {
    // Remove password before storing
    const { password, ...userWithoutPassword } = user;
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(userWithoutPassword));
    
    // Log activity
    addLog('auth', 'เข้าสู่ระบบ', `${user.name} เข้าสู่ระบบ`);
    
    return true;
  }
  
  return false;
}

function logout() {
  const currentUser = getCurrentUser();
  if (currentUser) {
    addLog('auth', 'ออกจากระบบ', `${currentUser.name} ออกจากระบบ`);
  }
  
  localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  window.location.href = 'login.html';
}

function getCurrentUser() {
  const userStr = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
  return userStr ? JSON.parse(userStr) : null;
}

function getUsers() {
  const usersStr = localStorage.getItem(STORAGE_KEYS.USERS);
  return usersStr ? JSON.parse(usersStr) : [];
}

function getUserById(userId) {
  const users = getUsers();
  return users.find(u => u.id === userId);
}

// ========== Header Functions ==========
function initHeader() {
  const currentUser = getCurrentUser();
  if (!currentUser) return;
  
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  const settings = getSettings();
  const themeIcon = settings.theme === 'dark' ? '☀️' : '🌙';
  
  const header = document.querySelector('.header');
  if (!header) return;
  
  header.innerHTML = `
    <div class="header-container">
      <div class="header-left">
        <button class="mobile-menu-btn" onclick="toggleMobileMenu()">
          ☰
        </button>
        <a href="index.html" class="logo">
          <img src="https://crm.bigitcorp.co.th/images/logo-icon.png" alt="Logo">
          <span>BIGIT CRM</span>
        </a>
        <nav>
          <ul class="nav-menu" id="navMenu">
            <li><a href="index.html" class="nav-link ${currentPage === 'index.html' ? 'active' : ''}">แดชบอร์ด</a></li>
            <li><a href="tasks.html" class="nav-link ${currentPage === 'tasks.html' || currentPage === 'task-detail.html' ? 'active' : ''}">งาน</a></li>
            <li><a href="projects.html" class="nav-link ${currentPage === 'projects.html' ? 'active' : ''}">โปรเจกต์</a></li>
            <li><a href="notifications.html" class="nav-link ${currentPage === 'notifications.html' ? 'active' : ''}">แจ้งเตือน</a></li>
            <li><a href="logs.html" class="nav-link ${currentPage === 'logs.html' ? 'active' : ''}">บันทึก</a></li>
          </ul>
        </nav>
      </div>
      <div class="header-right">
        <button class="btn btn-outline btn-sm" onclick="toggleTheme()" title="เปลี่ยนธีม" style="min-width: 40px;">
          ${themeIcon}
        </button>
        <div class="profile-dropdown">
          <div class="profile-avatar" onclick="toggleProfileMenu()">
            ${currentUser.avatar}
          </div>
          <div class="dropdown-menu" id="profileMenu">
            <div class="dropdown-item" style="padding: var(--spacing-md); border-bottom: 1px solid var(--color-gray-200);">
              <strong>${currentUser.name}</strong><br>
              <small class="text-muted">${currentUser.email}</small>
            </div>
            <a href="settings.html" class="dropdown-item">⚙️ ตั้งค่า</a>
            <div class="dropdown-divider"></div>
            <a href="#" onclick="logout()" class="dropdown-item">🚪 ออกจากระบบ</a>
          </div>
        </div>
      </div>
    </div>
  `;
}

function toggleMobileMenu() {
  const navMenu = document.getElementById('navMenu');
  navMenu.classList.toggle('show');
}

function toggleProfileMenu() {
  const menu = document.getElementById('profileMenu');
  menu.classList.toggle('show');
}

// Close dropdowns when clicking outside
document.addEventListener('click', function(event) {
  // Profile Dropdown
  const profileDropdown = document.querySelector('.profile-dropdown');
  if (profileDropdown && !profileDropdown.contains(event.target)) {
    const menu = document.getElementById('profileMenu');
    if (menu) {
      menu.classList.remove('show');
    }
  }
  
  // Mobile Menu
  const navMenu = document.getElementById('navMenu');
  const mobileBtn = document.querySelector('.mobile-menu-btn');
  if (navMenu && mobileBtn && !navMenu.contains(event.target) && !mobileBtn.contains(event.target)) {
    navMenu.classList.remove('show');
  }
});

// ========== Theme Functions ==========
function applyTheme() {
  const settings = getSettings();
  document.documentElement.setAttribute('data-theme', settings.theme || 'light');
}

function toggleTheme() {
  const settings = getSettings();
  const newTheme = settings.theme === 'light' ? 'dark' : 'light';
  settings.theme = newTheme;
  saveSettings(settings);
  applyTheme();
  
  // Reload header to update theme button icon
  initHeader();
  
  addLog('settings', 'เปลี่ยนธีม', `เปลี่ยนเป็นโหมด ${newTheme === 'dark' ? 'มืด' : 'สว่าง'}`);
}

function getSettings() {
  const settingsStr = localStorage.getItem(STORAGE_KEYS.SETTINGS);
  return settingsStr ? JSON.parse(settingsStr) : { theme: 'light', notifications: true };
}

function saveSettings(settings) {
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
}

// ========== Logging Functions ==========
function addLog(type, action, description, metadata = {}) {
  const logs = getLogs();
  const currentUser = getCurrentUser();
  
  const log = {
    id: generateId('log'),
    type,
    action,
    description,
    metadata,
    userId: currentUser ? currentUser.id : null,
    userName: currentUser ? currentUser.name : 'ระบบ',
    timestamp: new Date().toISOString()
  };
  
  logs.unshift(log);
  
  // Keep only last 1000 logs
  if (logs.length > 1000) {
    logs.splice(1000);
  }
  
  localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(logs));
}

function getLogs() {
  const logsStr = localStorage.getItem(STORAGE_KEYS.LOGS);
  return logsStr ? JSON.parse(logsStr) : [];
}

// ========== Utility Functions ==========
function generateId(prefix = 'id') {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function formatDate(dateString) {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

function formatDateTime(dateString) {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function formatRelativeTime(dateString) {
  if (!dateString) return '-';
  
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffMins < 1) return 'เมื่อสักครู่';
  if (diffMins < 60) return `${diffMins} นาทีที่แล้ว`;
  if (diffHours < 24) return `${diffHours} ชั่วโมงที่แล้ว`;
  if (diffDays < 7) return `${diffDays} วันที่แล้ว`;
  
  return formatDate(dateString);
}

function showToast(message, type = 'info') {
  // Create toast element
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.style.cssText = `
    position: fixed;
    top: 80px;
    right: 20px;
    background: ${type === 'success' ? 'var(--color-success)' : type === 'error' ? 'var(--color-danger)' : 'var(--color-info)'};
    color: white;
    padding: var(--spacing-md) var(--spacing-lg);
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-lg);
    z-index: 9999;
    animation: slideIn 0.3s ease-out;
  `;
  toast.textContent = message;
  
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.style.animation = 'fadeOut 0.3s ease-out';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// ========== Modal Functions ==========
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
  }
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove('show');
    document.body.style.overflow = '';
  }
}

// Close modal when clicking outside
document.addEventListener('click', function(event) {
  if (event.target.classList.contains('modal')) {
    event.target.classList.remove('show');
    document.body.style.overflow = '';
  }
});

// ========== Email Simulation ==========
function sendEmail(to, subject, body) {
  // Simulate sending email by creating a notification
  const notification = {
    id: generateId('notif'),
    type: 'email',
    to,
    subject,
    body,
    read: false,
    deleted: false,
    createdAt: new Date().toISOString()
  };
  
  const notifications = getNotifications();
  notifications.unshift(notification);
  localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
  
  addLog('notification', 'ส่งอีเมล', `ส่งอีเมลถึง ${to}: ${subject}`);
  
  console.log('📧 Email Sent (Simulated):', { to, subject, body });
  return true;
}

function getNotifications() {
  const notifsStr = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
  return notifsStr ? JSON.parse(notifsStr) : [];
}

// ========== Check and Create Task Due Date Notifications ==========
function checkUpcomingTaskNotifications() {
  const tasks = getTasks ? getTasks() : [];
  const now = new Date();
  const threeDaysFromNow = new Date(now.getTime() + (3 * 24 * 60 * 60 * 1000));
  
  tasks.forEach(task => {
    if (!task.dueDate || task.status === 'done') return;
    
    const dueDate = new Date(task.dueDate);
    const diffDays = Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24));
    
    // Create notification for tasks due within 3 days
    if (diffDays >= 0 && diffDays <= 3) {
      const notifications = getNotifications();
      
      // Check if notification already exists for this task today
      const today = now.toDateString();
      const existingNotif = notifications.find(n => 
        n.metadata?.taskId === task.id && 
        new Date(n.createdAt).toDateString() === today &&
        n.type === 'task_due_soon'
      );
      
      if (!existingNotif) {
        const urgencyLevel = diffDays === 0 ? 'วันนี้' : diffDays === 1 ? 'พรุ่งนี้' : `อีก ${diffDays} วัน`;
        const notification = {
          id: generateId('notif'),
          type: 'task_due_soon',
          subject: `⚠️ งาน "${task.title}" ใกล้ครบกำหนด`,
          body: `งาน "${task.title}" จะครบกำหนดส่ง${urgencyLevel} (${formatDate(task.dueDate)}) กรุณาตรวจสอบความคืบหน้า`,
          read: false,
          deleted: false,
          metadata: { taskId: task.id, dueDate: task.dueDate },
          createdAt: new Date().toISOString()
        };
        
        notifications.unshift(notification);
        localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
      }
    }
  });
}


// ========== Data Management Functions ==========
function exportAllData() {
  const allData = {
    users: JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]'),
    tasks: JSON.parse(localStorage.getItem(STORAGE_KEYS.TASKS) || '[]'),
    projects: JSON.parse(localStorage.getItem(STORAGE_KEYS.PROJECTS) || '[]'),
    notifications: JSON.parse(localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS) || '[]'),
    logs: JSON.parse(localStorage.getItem(STORAGE_KEYS.LOGS) || '[]'),
    settings: JSON.parse(localStorage.getItem(STORAGE_KEYS.SETTINGS) || '{}'),
    exportedAt: new Date().toISOString(),
    version: '1.0.0'
  };
  
  const dataStr = JSON.stringify(allData, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `task-management-backup-${new Date().toISOString().split('T')[0]}.json`;
  link.click();
  
  URL.revokeObjectURL(url);
  
  addLog('export', 'ส่งออกข้อมูล', 'ส่งออกข้อมูลทั้งหมดเป็นไฟล์ JSON');
  showToast('ส่งออกข้อมูลเรียบร้อย', 'success');
}

function importData(file) {
  const reader = new FileReader();
  
  reader.onload = function(e) {
    try {
      const data = JSON.parse(e.target.result);
      
      // Validate data structure
      if (!data.users || !data.tasks || !data.projects) {
        showToast('ไฟล์ข้อมูลไม่ถูกต้อง', 'error');
        return;
      }
      
      // Confirm import
      if (!confirm('คุณต้องการนำเข้าข้อมูลใช่หรือไม่? ข้อมูลเดิมจะถูกแทนที่')) {
        return;
      }
      
      // Import all data
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(data.users));
      localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(data.tasks));
      localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(data.projects));
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(data.notifications || []));
      localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(data.logs || []));
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(data.settings || {}));
      
      addLog('import', 'นำเข้าข้อมูล', `นำเข้าข้อมูลจากไฟล์ (${data.exportedAt || 'ไม่ระบุวันที่'})`);
      showToast('นำเข้าข้อมูลเรียบร้อย กรุณารีเฟรชหน้าเว็บ', 'success');
      
      // Reload page after 2 seconds
      setTimeout(() => {
        window.location.reload();
      }, 2000);
      
    } catch (error) {
      console.error('Import error:', error);
      showToast('นำเข้าข้อมูลไม่สำเร็จ: ' + error.message, 'error');
    }
  };
  
  reader.readAsText(file);
}

function clearAllData() {
  if (!confirm('คุณแน่ใจหรือไม่ที่จะลบข้อมูลทั้งหมด? การกระทำนี้ไม่สามารถย้อนกลับได้')) {
    return;
  }
  
  if (!confirm('ยืนยันอีกครั้ง: ข้อมูลทั้งหมดจะถูกลบ!')) {
    return;
  }
  
  // Clear all data except current user session
  const currentUser = getCurrentUser();
  
  localStorage.removeItem(STORAGE_KEYS.TASKS);
  localStorage.removeItem(STORAGE_KEYS.PROJECTS);
  localStorage.removeItem(STORAGE_KEYS.NOTIFICATIONS);
  localStorage.removeItem(STORAGE_KEYS.LOGS);
  localStorage.removeItem(STORAGE_KEYS.USERS);
  
  addLog('settings', 'ล้างข้อมูล', 'ล้างข้อมูลทั้งหมดในระบบ');
  showToast('ล้างข้อมูลเรียบร้อย กรุณารีเฟรชหน้าเว็บ', 'success');
  
  // Reload after 1.5 seconds
  setTimeout(() => {
    window.location.reload();
  }, 1500);
}

function createMockupData() {
  if (!confirm('คุณต้องการสร้างข้อมูลตัวอย่างใช่หรือไม่? ข้อมูลเดิมจะถูกแทนที่')) {
    return;
  }
  
  // Clear existing data first
  localStorage.removeItem(STORAGE_KEYS.TASKS);
  localStorage.removeItem(STORAGE_KEYS.PROJECTS);
  localStorage.removeItem(STORAGE_KEYS.NOTIFICATIONS);
  localStorage.removeItem(STORAGE_KEYS.LOGS);
  localStorage.removeItem(STORAGE_KEYS.USERS);
  
  // Initialize demo data
  initializeDemoData();
  
  addLog('settings', 'สร้างข้อมูลตัวอย่าง', 'สร้างข้อมูลตัวอย่างใหม่');
  showToast('สร้างข้อมูลตัวอย่างเรียบร้อย กรุณารีเฟรชหน้าเว็บ', 'success');
  
  // Reload page
  setTimeout(() => {
    window.location.reload();
  }, 1500);
}


// ========== Initialize on page load ==========
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}

// ========== Loading Functions ==========
function createLoadingOverlay() {
  if (document.getElementById('loadingOverlay')) return;
  
  const overlay = document.createElement('div');
  overlay.id = 'loadingOverlay';
  overlay.className = 'loading-overlay';
  overlay.innerHTML = `
    <div class="loading-spinner"></div>
    <div class="loading-text" id="loadingText">กำลังโหลด...</div>
  `;
  
  document.body.appendChild(overlay);
}

function showLoading(message = 'กำลังโหลด...') {
  const overlay = document.getElementById('loadingOverlay');
  const text = document.getElementById('loadingText');
  
  if (!overlay) {
    createLoadingOverlay();
    return showLoading(message);
  }
  
  if (text) text.textContent = message;
  overlay.classList.add('show');
}

function hideLoading() {
  const overlay = document.getElementById('loadingOverlay');
  if (overlay) {
    overlay.classList.remove('show');
  }
}
