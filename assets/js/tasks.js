// ===========================================
// Tasks Management Module
// ===========================================

let currentEditingTask = null;
let draggedTask = null;

// ========== Task CRUD Functions ==========
function getTasks() {
  const tasksStr = localStorage.getItem(STORAGE_KEYS.TASKS);
  return tasksStr ? JSON.parse(tasksStr) : [];
}

function getTaskById(taskId) {
  const tasks = getTasks();
  return tasks.find(t => t.id === taskId);
}

function saveTasks(tasks) {
  localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
}

function createTask(taskData) {
  const tasks = getTasks();
  const newTask = {
    id: generateId('task'),
    title: taskData.title,
    description: taskData.description || '',
    status: taskData.status || 'todo',
    priority: taskData.priority || 'medium',
    projectId: taskData.projectId || null,
    assignee: taskData.assignee || null,
    manager: taskData.manager || null,
    dueDate: taskData.dueDate || null,
    checklist: [],
    comments: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  tasks.push(newTask);
  saveTasks(tasks);
  
  addLog('task', 'สร้างงาน', `สร้างงาน: ${newTask.title}`, { taskId: newTask.id });
  
  return newTask;
}

function updateTask(taskId, updates) {
  const tasks = getTasks();
  const taskIndex = tasks.findIndex(t => t.id === taskId);
  
  if (taskIndex === -1) return null;
  
  tasks[taskIndex] = {
    ...tasks[taskIndex],
    ...updates,
    updatedAt: new Date().toISOString()
  };
  
  saveTasks(tasks);
  
  addLog('task', 'แก้ไขงาน', `แก้ไขงาน: ${tasks[taskIndex].title}`, { taskId, updates });
  
  return tasks[taskIndex];
}

function deleteTask(taskId) {
  const tasks = getTasks();
  const task = tasks.find(t => t.id === taskId);
  
  if (!task) return false;
  
  const filteredTasks = tasks.filter(t => t.id !== taskId);
  saveTasks(filteredTasks);
  
  addLog('task', 'ลบงาน', `ลบงาน: ${task.title}`, { taskId });
  
  return true;
}

// ========== Checklist Functions ==========
function addChecklistItem(taskId, itemText) {
  const task = getTaskById(taskId);
  if (!task) return null;
  
  const checklistItem = {
    id: generateId('checklist'),
    text: itemText,
    completed: false,
    comments: [],
    createdAt: new Date().toISOString()
  };
  
  task.checklist.push(checklistItem);
  updateTask(taskId, { checklist: task.checklist });
  
  addLog('checklist', 'เพิ่มรายการ', `เพิ่มรายการในงาน: ${task.title}`, { taskId, itemText });
  
  return checklistItem;
}

function toggleChecklistItem(taskId, itemId) {
  const task = getTaskById(taskId);
  if (!task) return null;
  
  const item = task.checklist.find(i => i.id === itemId);
  if (!item) return null;
  
  item.completed = !item.completed;
  updateTask(taskId, { checklist: task.checklist });
  
  addLog('checklist', item.completed ? 'ทำเสร็จ' : 'ยกเลิกทำเสร็จ', `รายการ: ${item.text}`, { taskId, itemId });
  
  return item;
}

function updateChecklistItem(taskId, itemId, newText) {
  const task = getTaskById(taskId);
  if (!task) return null;
  
  const item = task.checklist.find(i => i.id === itemId);
  if (!item) return null;
  
  item.text = newText;
  updateTask(taskId, { checklist: task.checklist });
  
  addLog('checklist', 'แก้ไขรายการ', `แก้ไขรายการในงาน: ${task.title}`, { taskId, itemId, newText });
  
  return item;
}

function deleteChecklistItem(taskId, itemId) {
  const task = getTaskById(taskId);
  if (!task) return false;
  
  task.checklist = task.checklist.filter(i => i.id !== itemId);
  updateTask(taskId, { checklist: task.checklist });
  
  addLog('checklist', 'ลบรายการ', `ลบรายการในงาน: ${task.title}`, { taskId, itemId });
  
  return true;
}

// ========== Comment Functions ==========
function addTaskComment(taskId, commentText) {
  const task = getTaskById(taskId);
  if (!task) return null;
  
  const currentUser = getCurrentUser();
  const comment = {
    id: generateId('comment'),
    text: commentText,
    userId: currentUser.id,
    userName: currentUser.name,
    createdAt: new Date().toISOString()
  };
  
  task.comments.push(comment);
  updateTask(taskId, { comments: task.comments });
  
  addLog('comment', 'เพิ่มความคิดเห็น', `เพิ่มความคิดเห็นในงาน: ${task.title}`, { taskId, commentText });
  
  return comment;
}

function addChecklistComment(taskId, itemId, commentText) {
  const task = getTaskById(taskId);
  if (!task) return null;
  
  const item = task.checklist.find(i => i.id === itemId);
  if (!item) return null;
  
  const currentUser = getCurrentUser();
  const comment = {
    id: generateId('comment'),
    text: commentText,
    userId: currentUser.id,
    userName: currentUser.name,
    createdAt: new Date().toISOString()
  };
  
  item.comments.push(comment);
  updateTask(taskId, { checklist: task.checklist });
  
  addLog('comment', 'เพิ่มความคิดเห็น', `เพิ่มความคิดเห็นในรายการ checklist`, { taskId, itemId, commentText });
  
  return comment;
}

// ========== Kanban Board Functions ==========
function renderKanbanBoard(filters = {}) {
  const kanbanBoard = document.getElementById('kanbanBoard');
  if (!kanbanBoard) return;
  
  let tasks = getTasks();
  
  // Apply filters
  if (filters.search) {
    const searchLower = filters.search.toLowerCase();
    tasks = tasks.filter(t => 
      t.title.toLowerCase().includes(searchLower) ||
      (t.description && t.description.toLowerCase().includes(searchLower))
    );
  }
  
  if (filters.projectId) {
    tasks = tasks.filter(t => t.projectId === filters.projectId);
  }
  
  if (filters.priority) {
    tasks = tasks.filter(t => t.priority === filters.priority);
  }
  
  if (filters.assignee) {
    tasks = tasks.filter(t => t.assignee === filters.assignee);
  }
  
  // Group tasks by status
  const todoTasks = tasks.filter(t => t.status === 'todo');
  const inProgressTasks = tasks.filter(t => t.status === 'inprogress');
  const doneTasks = tasks.filter(t => t.status === 'done');
  
  kanbanBoard.innerHTML = `
    <div class="kanban-column" data-status="todo">
      <div class="kanban-header">
        <div class="kanban-title">
          📋 ต้องทำ
          <span class="kanban-count">${todoTasks.length}</span>
        </div>
      </div>
      <div class="kanban-tasks" id="todoTasks">
        ${todoTasks.map(task => renderTaskCard(task)).join('')}
      </div>
    </div>
    
    <div class="kanban-column" data-status="inprogress">
      <div class="kanban-header">
        <div class="kanban-title">
          ⚡ กำลังทำ
          <span class="kanban-count">${inProgressTasks.length}</span>
        </div>
      </div>
      <div class="kanban-tasks" id="inprogressTasks">
        ${inProgressTasks.map(task => renderTaskCard(task)).join('')}
      </div>
    </div>
    
    <div class="kanban-column" data-status="done">
      <div class="kanban-header">
        <div class="kanban-title">
          ✅ เสร็จแล้ว
          <span class="kanban-count">${doneTasks.length}</span>
        </div>
      </div>
      <div class="kanban-tasks" id="doneTasks">
        ${doneTasks.map(task => renderTaskCard(task)).join('')}
      </div>
    </div>
  `;
  
  // Initialize drag and drop
  initDragAndDrop();
}

function renderTaskCard(task) {
  const project = task.projectId ? getProjectById(task.projectId) : null;
  const assignee = task.assignee ? getUserById(task.assignee) : null;
  
  const priorityColors = {
    low: 'priority-low',
    medium: 'priority-medium',
    high: 'priority-high'
  };
  
  const priorityLabels = {
    low: 'ต่ำ',
    medium: 'ปานกลาง',
    high: 'สูง'
  };
  
  const completedChecklist = task.checklist.filter(i => i.completed).length;
  const totalChecklist = task.checklist.length;
  
  return `
    <div class="task-card priority-${task.priority}" 
         draggable="true" 
         data-task-id="${task.id}"
         ondragstart="handleDragStart(event)"
         ondragend="handleDragEnd(event)"
         onclick="openTaskDetailPopup('${task.id}')"
         style="cursor: pointer;">
      <div class="task-card-header">
        <div class="task-card-title">${task.title}</div>
        <span class="badge badge-${priorityColors[task.priority]}">
          ${priorityLabels[task.priority]}
        </span>
      </div>
      
      ${task.description ? `
        <div class="task-card-body">
          ${task.description.substring(0, 100)}${task.description.length > 100 ? '...' : ''}
        </div>
      ` : ''}
      
      <div class="task-card-footer">
        <div class="task-meta">
          ${project ? `📁 ${project.name}` : ''}
          ${assignee ? `👤 ${assignee.name}` : ''}
          ${task.dueDate ? `📅 ${formatDate(task.dueDate)}` : ''}
        </div>
        ${totalChecklist > 0 ? `
          <div class="task-meta">
            ✓ ${completedChecklist}/${totalChecklist}
          </div>
        ` : ''}
      </div>
    </div>
  `;
}

// ========== Drag and Drop ==========
function initDragAndDrop() {
  const columns = document.querySelectorAll('.kanban-tasks');
  
  columns.forEach(column => {
    column.addEventListener('dragover', handleDragOver);
    column.addEventListener('drop', handleDrop);
  });
}

function handleDragStart(event) {
  draggedTask = event.target;
  event.target.classList.add('dragging');
  event.dataTransfer.effectAllowed = 'move';
  event.dataTransfer.setData('text/html', event.target.innerHTML);
}

function handleDragEnd(event) {
  event.target.classList.remove('dragging');
  draggedTask = null;
}

function handleDragOver(event) {
  if (event.preventDefault) {
    event.preventDefault();
  }
  event.dataTransfer.dropEffect = 'move';
  return false;
}

function handleDrop(event) {
  if (event.stopPropagation) {
    event.stopPropagation();
  }
  
  if (!draggedTask) return false;
  
  const taskId = draggedTask.dataset.taskId;
  const newStatus = event.currentTarget.parentElement.dataset.status;
  
  updateTask(taskId, { status: newStatus });
  
  const filters = getActiveFilters();
  renderKanbanBoard(filters);
  
  showToast('เปลี่ยนสถานะงานเรียบร้อย', 'success');
  
  return false;
}

// ========== Task Modal Functions ==========
function openCreateTaskModal() {
  currentEditingTask = null;
  const modal = document.getElementById('taskModal');
  if (!modal) return;
  
  document.getElementById('taskModalTitle').textContent = 'สร้างงานใหม่';
  document.getElementById('taskForm').reset();
  
  loadProjectsDropdown();
  loadUsersDropdown();
  
  openModal('taskModal');
}

function openEditTaskModal(taskId) {
  const task = getTaskById(taskId);
  if (!task) return;
  
  currentEditingTask = task;
  
  document.getElementById('taskModalTitle').textContent = 'แก้ไขงาน';
  document.getElementById('taskTitle').value = task.title;
  document.getElementById('taskDescription').value = task.description;
  document.getElementById('taskStatus').value = task.status;
  document.getElementById('taskPriority').value = task.priority;
  document.getElementById('taskDueDate').value = task.dueDate || '';
  
  loadProjectsDropdown(task.projectId);
  loadUsersDropdown(task.assignee, task.manager);
  
  openModal('taskModal');
}

function saveTask() {
  const title = document.getElementById('taskTitle').value.trim();
  const description = document.getElementById('taskDescription').value.trim();
  const status = document.getElementById('taskStatus').value;
  const priority = document.getElementById('taskPriority').value;
  const dueDate = document.getElementById('taskDueDate').value;
  const projectId = document.getElementById('taskProject').value;
  const assignee = document.getElementById('taskAssignee').value;
  const manager = document.getElementById('taskManager').value;
  
  if (!title) {
    showToast('กรุณาระบุชื่องาน', 'error');
    return;
  }
  
  const taskData = {
    title,
    description,
    status,
    priority,
    dueDate,
    projectId: projectId || null,
    assignee: assignee || null,
    manager: manager || null
  };
  
  if (currentEditingTask) {
    updateTask(currentEditingTask.id, taskData);
    showToast('แก้ไขงานเรียบร้อย', 'success');
  } else {
    createTask(taskData);
    showToast('สร้างงานเรียบร้อย', 'success');
  }
  
  closeModal('taskModal');
  
  const filters = getActiveFilters();
  renderKanbanBoard(filters);
}

function confirmDeleteTask(taskId) {
  if (confirm('คุณแน่ใจหรือไม่ที่จะลบงานนี้?')) {
    deleteTask(taskId);
    showToast('ลบงานเรียบร้อย', 'success');
    
    const filters = getActiveFilters();
    renderKanbanBoard(filters);
  }
}

function viewTaskDetail(taskId) {
  window.location.href = `task-detail.html?id=${taskId}`;
}

// ========== Helper Functions ==========
function loadProjectsDropdown(selectedId = null) {
  const select = document.getElementById('taskProject');
  if (!select) return;
  
  const projects = getProjects();
  
  select.innerHTML = '<option value="">-- ไม่ระบุโปรเจกต์ --</option>' +
    projects.map(p => `
      <option value="${p.id}" ${p.id === selectedId ? 'selected' : ''}>
        ${p.name}
      </option>
    `).join('');
}

function loadUsersDropdown(selectedAssignee = null, selectedManager = null) {
  const assigneeSelect = document.getElementById('taskAssignee');
  const managerSelect = document.getElementById('taskManager');
  
  const users = getUsers();
  const userOptions = users.map(u => `
    <option value="${u.id}">${u.name}</option>
  `).join('');
  
  if (assigneeSelect) {
    assigneeSelect.innerHTML = '<option value="">-- ไม่ระบุผู้รับผิดชอบ --</option>' + userOptions;
    if (selectedAssignee) {
      assigneeSelect.value = selectedAssignee;
    }
  }
  
  if (managerSelect) {
    managerSelect.innerHTML = '<option value="">-- ไม่ระบุผู้จัดการ --</option>' + userOptions;
    if (selectedManager) {
      managerSelect.value = selectedManager;
    }
  }
}

function getActiveFilters() {
  const filters = {};
  
  const searchInput = document.getElementById('searchTasks');
  if (searchInput) filters.search = searchInput.value;
  
  const projectFilter = document.getElementById('filterProject');
  if (projectFilter) filters.projectId = projectFilter.value;
  
  const priorityFilter = document.getElementById('filterPriority');
  if (priorityFilter) filters.priority = priorityFilter.value;
  
  const assigneeFilter = document.getElementById('filterAssignee');
  if (assigneeFilter) filters.assignee = assigneeFilter.value;
  
  return filters;
}

function applyFilters() {
  const filters = getActiveFilters();
  renderKanbanBoard(filters);
}

// ========== Task Detail Popup ==========
function openTaskDetailPopup(taskId) {
  const task = getTaskById(taskId);
  if (!task) return;

  const project = task.projectId ? getProjectById(task.projectId) : null;
  const assignee = task.assignee ? getUserById(task.assignee) : null;
  const manager = task.manager ? getUserById(task.manager) : null;

  const statusBadges = {
    todo: '<span class="badge badge-todo">ต้องทำ</span>',
    inprogress: '<span class="badge badge-inprogress">กำลังทำ</span>',
    done: '<span class="badge badge-done">เสร็จแล้ว</span>'
  };

  const priorityBadges = {
    low: '<span class="badge badge-priority-low">ต่ำ</span>',
    medium: '<span class="badge badge-priority-medium">ปานกลาง</span>',
    high: '<span class="badge badge-priority-high">สูง</span>'
  };

  const completedChecklist = task.checklist.filter(i => i.completed).length;
  const totalChecklist = task.checklist.length;

  // Create popup modal content
  const popupContent = `
    <div class="modal-content" style="max-width: 900px;">
      <div class="modal-header">
        <h2 class="modal-title">${task.title}</h2>
        <button class="modal-close" onclick="closeTaskDetailPopup()">&times;</button>
      </div>
      <div class="modal-body">
        <!-- Status and Priority -->
        <div style="display: flex; gap: var(--spacing-sm); margin-bottom: var(--spacing-lg);">
          ${statusBadges[task.status]}
          ${priorityBadges[task.priority]}
        </div>

        <!-- Task Info Grid -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: var(--spacing-lg); margin-bottom: var(--spacing-xl); padding: var(--spacing-lg); background: var(--color-gray-50); border-radius: var(--radius-md);">
          ${project ? `
            <div>
              <div class="text-muted" style="font-size: 0.875rem; margin-bottom: var(--spacing-xs);">📁 โปรเจกต์</div>
              <div><strong>${project.name}</strong></div>
            </div>
          ` : ''}
          ${assignee ? `
            <div>
              <div class="text-muted" style="font-size: 0.875rem; margin-bottom: var(--spacing-xs);">👤 ผู้รับผิดชอบ</div>
              <div><strong>${assignee.name}</strong></div>
            </div>
          ` : ''}
          ${manager ? `
            <div>
              <div class="text-muted" style="font-size: 0.875rem; margin-bottom: var(--spacing-xs);">👔 ผู้จัดการ</div>
              <div><strong>${manager.name}</strong></div>
            </div>
          ` : ''}
          ${task.dueDate ? `
            <div>
              <div class="text-muted" style="font-size: 0.875rem; margin-bottom: var(--spacing-xs);">📅 กำหนดส่ง</div>
              <div><strong>${formatDate(task.dueDate)}</strong></div>
            </div>
          ` : ''}
        </div>

        <!-- Description -->
        ${task.description ? `
          <div style="margin-bottom: var(--spacing-xl);">
            <h3 style="font-size: 1.125rem; margin-bottom: var(--spacing-md);">📄 รายละเอียด</h3>
            <p style="white-space: pre-wrap; line-height: 1.6;">${task.description}</p>
          </div>
        ` : ''}

        <!-- Checklist -->
        ${totalChecklist > 0 ? `
          <div style="margin-bottom: var(--spacing-xl);">
            <h3 style="font-size: 1.125rem; margin-bottom: var(--spacing-md);">
              ☑️ รายการตรวจสอบ 
              <span class="badge badge-${completedChecklist === totalChecklist ? 'done' : 'inprogress'}">${completedChecklist}/${totalChecklist}</span>
            </h3>
            ${renderChecklistForPopup(task)}
          </div>
        ` : ''}

        <!-- Comments -->
        <div>
          <h3 style="font-size: 1.125rem; margin-bottom: var(--spacing-md);">💬 ความคิดเห็น (${task.comments.length})</h3>
          ${renderCommentsForPopup(task)}
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" onclick="closeTaskDetailPopup()">ปิด</button>
        <button class="btn btn-primary" onclick="viewTaskDetail('${task.id}')">ดูรายละเอียดเต็ม</button>
      </div>
    </div>
  `;

  // Create or update popup
  let popup = document.getElementById('taskDetailPopup');
  if (!popup) {
    popup = document.createElement('div');
    popup.id = 'taskDetailPopup';
    popup.className = 'modal';
    document.body.appendChild(popup);
  }

  popup.innerHTML = popupContent;
  popup.classList.add('show');
  document.body.style.overflow = 'hidden';
}

function closeTaskDetailPopup() {
  const popup = document.getElementById('taskDetailPopup');
  if (popup) {
    popup.classList.remove('show');
    document.body.style.overflow = '';
  }
}

function renderChecklistForPopup(task) {
  if (!task.checklist || task.checklist.length === 0) {
    return '<p class="text-muted">ยังไม่มีรายการตรวจสอบ</p>';
  }

  return task.checklist.map(item => `
    <div style="display: flex; align-items: flex-start; gap: var(--spacing-sm); padding: var(--spacing-sm); margin-bottom: var(--spacing-sm); background: var(--color-white); border-radius: var(--radius-md);">
      <input type="checkbox" ${item.completed ? 'checked' : ''} disabled style="margin-top: 4px;">
      <div style="flex: 1;">
        <div style="${item.completed ? 'text-decoration: line-through; color: var(--color-gray-500);' : ''}">${item.text}</div>
        ${item.comments && item.comments.length > 0 ? `
          <div style="margin-top: var(--spacing-sm); padding-left: var(--spacing-md); border-left: 2px solid var(--color-gray-200);">
            ${item.comments.map(comment => `
              <div style="font-size: 0.875rem; margin-top: var(--spacing-xs);">
                <strong>${comment.userName}</strong>
                <span class="text-muted"> • ${formatDateTime(comment.createdAt)}</span><br>
                ${comment.text}
              </div>
            `).join('')}
          </div>
        ` : ''}
      </div>
    </div>
  `).join('');
}

function renderCommentsForPopup(task) {
  if (!task.comments || task.comments.length === 0) {
    return '<p class="text-muted">ยังไม่มีความคิดเห็น</p>';
  }

  return task.comments.map(comment => `
    <div style="padding: var(--spacing-md); margin-bottom: var(--spacing-sm); background: var(--color-gray-50); border-radius: var(--radius-md);">
      <div style="font-weight: 600; margin-bottom: var(--spacing-xs);">${comment.userName}</div>
      <div style="color: var(--color-gray-700); margin-bottom: var(--spacing-xs);">${comment.text}</div>
      <div style="font-size: 0.75rem; color: var(--color-gray-500);">📅 ${formatDateTime(comment.createdAt)}</div>
    </div>
  `).join('');
}

