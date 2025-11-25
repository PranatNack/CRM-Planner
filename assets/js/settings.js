// ===========================================
// Settings Management Module
// ===========================================

// ========== Load Settings ==========
function loadSettingsPage() {
  const currentUser = getCurrentUser();
  if (!currentUser) return;
  
  const settings = getSettings();
  
  // Load user info
  document.getElementById('settingName').value = currentUser.name;
  document.getElementById('settingEmail').value = currentUser.email;
  
  // Load theme
  document.getElementById('settingTheme').value = settings.theme || 'light';
}

// ========== Save User Info ==========
function saveUserInfo() {
  const currentUser = getCurrentUser();
  if (!currentUser) return;
  
  const name = document.getElementById('settingName').value.trim();
  const email = document.getElementById('settingEmail').value.trim();
  
  if (!name || !email) {
    showToast('กรุณากรอกข้อมูลให้ครบถ้วน', 'error');
    return;
  }
  
  // Update user in users array
  const users = getUsers();
  const userIndex = users.findIndex(u => u.id === currentUser.id);
  
  if (userIndex !== -1) {
    users[userIndex].name = name;
    users[userIndex].email = email;
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    
    // Update current user session
    currentUser.name = name;
    currentUser.email = email;
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(currentUser));
    
    addLog('settings', 'อัพเดทข้อมูลผู้ใช้', `อัพเดทชื่อเป็น ${name}`);
    
    showToast('บันทึกข้อมูลเรียบร้อย', 'success');
    
    // Reload header
    initHeader();
  }
}

// ========== Change Theme ==========
function changeTheme() {
  const themeSelect = document.getElementById('settingTheme');
  const newTheme = themeSelect.value;
  
  const settings = getSettings();
  settings.theme = newTheme;
  saveSettings(settings);
  
  applyTheme();
  
  addLog('settings', 'เปลี่ยนธีม', `เปลี่ยนเป็นโหมด ${newTheme === 'dark' ? 'มืด' : 'สว่าง'}`);
  
  showToast('เปลี่ยนธีมเรียบร้อย', 'success');
}

// ========== Change Password ==========
function changePassword() {
  const currentPassword = document.getElementById('currentPassword').value;
  const newPassword = document.getElementById('newPassword').value;
  const confirmPassword = document.getElementById('confirmPassword').value;
  
  if (!currentPassword || !newPassword || !confirmPassword) {
    showToast('กรุณากรอกข้อมูลให้ครบถ้วน', 'error');
    return;
  }
  
  if (newPassword !== confirmPassword) {
    showToast('รหัสผ่านใหม่ไม่ตรงกัน', 'error');
    return;
  }
  
  if (newPassword.length < 6) {
    showToast('รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร', 'error');
    return;
  }
  
  const currentUser = getCurrentUser();
  const users = getUsers();
  const user = users.find(u => u.id === currentUser.id);
  
  if (!user) return;
  
  // Verify current password
  if (user.password !== currentPassword) {
    showToast('รหัสผ่านปัจจุบันไม่ถูกต้อง', 'error');
    return;
  }
  
  // Update password
  user.password = newPassword;
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  
  // Clear form
  document.getElementById('currentPassword').value = '';
  document.getElementById('newPassword').value = '';
  document.getElementById('confirmPassword').value = '';
  
  addLog('settings', 'เปลี่ยนรหัสผ่าน', 'เปลี่ยนรหัสผ่านเรียบร้อย');
  
  showToast('เปลี่ยนรหัสผ่านเรียบร้อย', 'success');
}

// ========== Initialize ==========
if (document.getElementById('settingName')) {
  loadSettingsPage();
}
