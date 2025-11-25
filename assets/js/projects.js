// ===========================================
// Projects Management Module
// ===========================================

let currentEditingProject = null;

// ========== Project CRUD Functions ==========
function getProjects() {
  const projectsStr = localStorage.getItem(STORAGE_KEYS.PROJECTS);
  return projectsStr ? JSON.parse(projectsStr) : [];
}

function getProjectById(projectId) {
  const projects = getProjects();
  return projects.find(p => p.id === projectId);
}

function saveProjects(projects) {
  localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
}

function createProject(projectData) {
  const projects = getProjects();
  const newProject = {
    id: generateId('proj'),
    name: projectData.name,
    description: projectData.description || '',
    contractNumber: projectData.contractNumber || '',
    fiscalYear: projectData.fiscalYear || '',
    projectStartDate: projectData.projectStartDate || null,
    contractExpirationDate: projectData.contractExpirationDate || null,
    owner: projectData.owner || null,
    manager: projectData.manager || null,
    status: projectData.status || 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  projects.push(newProject);
  saveProjects(projects);
  
  addLog('project', 'สร้างโปรเจกต์', `สร้างโปรเจกต์: ${newProject.name}`, { projectId: newProject.id });
  
  return newProject;
}

function updateProject(projectId, updates) {
  const projects = getProjects();
  const projectIndex = projects.findIndex(p => p.id === projectId);
  
  if (projectIndex === -1) return null;
  
  projects[projectIndex] = {
    ...projects[projectIndex],
    ...updates,
    updatedAt: new Date().toISOString()
  };
  
  saveProjects(projects);
  
  addLog('project', 'แก้ไขโปรเจกต์', `แก้ไขโปรเจกต์: ${projects[projectIndex].name}`, { projectId, updates });
  
  return projects[projectIndex];
}

function deleteProject(projectId) {
  const projects = getProjects();
  const project = projects.find(p => p.id === projectId);
  
  if (!project) return false;
  
  // Check if project has tasks
  const tasks = getTasks();
  const projectTasks = tasks.filter(t => t.projectId === projectId);
  
  if (projectTasks.length > 0) {
    showToast(`ไม่สามารถลบโปรเจกต์ได้ เนื่องจากมีงาน ${projectTasks.length} รายการอยู่`, 'error');
    return false;
  }
  
  const filteredProjects = projects.filter(p => p.id !== projectId);
  saveProjects(filteredProjects);
  
  addLog('project', 'ลบโปรเจกต์', `ลบโปรเจกต์: ${project.name}`, { projectId });
  
  return true;
}

// ========== Render Functions ==========
function renderProjectsTable() {
  const tbody = document.getElementById('projectsTableBody');
  if (!tbody) return;
  
  const projects = getProjects();
  const tasks = getTasks();
  
  if (projects.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="10" class="text-center text-muted" style="padding: var(--spacing-xl);">
          ไม่มีโปรเจกต์ กรุณาสร้างโปรเจกต์ใหม่
        </td>
      </tr>
    `;
    return;
  }
  
  tbody.innerHTML = projects.map(project => {
    const manager = getUserById(project.manager);
    const projectTasks = tasks.filter(t => t.projectId === project.id);
    
    // Status toggle switch HTML with clear UI indicators
    const statusMap = {
      todo: { label: 'ยังไม่เริ่ม', class: 'badge-todo', color: '#6b7280', icon: '⏸️' },
      inprogress: { label: 'ดำเนินการ', class: 'badge-inprogress', color: '#3b82f6', icon: '▶️' },
      done: { label: 'เสร็จสิ้น', class: 'badge-done', color: '#10b981', icon: '✓' }
    };
    
    const currentStatus = statusMap[project.status] || statusMap.inprogress;
    
    return `
      <tr style="border-bottom: 1px solid var(--color-gray-200);">
        <td style="padding: var(--spacing-md); border: 1px solid var(--color-gray-200); text-align: left;"><strong>${project.name}</strong></td>
        <td style="padding: var(--spacing-md); border: 1px solid var(--color-gray-200); text-align: center;">${project.contractNumber || '-'}</td>
        <td style="padding: var(--spacing-md); border: 1px solid var(--color-gray-200); text-align: center;">${project.fiscalYear || '-'}</td>
        <td style="padding: var(--spacing-md); border: 1px solid var(--color-gray-200); text-align: center;">${project.projectStartDate ? formatDate(project.projectStartDate) : '-'}</td>
        <td style="padding: var(--spacing-md); border: 1px solid var(--color-gray-200); text-align: center;">${project.contractExpirationDate ? formatDate(project.contractExpirationDate) : '-'}</td>
        <td style="padding: var(--spacing-md); border: 1px solid var(--color-gray-200); text-align: center;">${manager ? manager.name : '-'}</td>
        <td style="padding: var(--spacing-md); border: 1px solid var(--color-gray-200); text-align: center;">
          <div style="position: relative; display: flex; justify-content: center;">
            <button 
              class="badge ${currentStatus.class}" 
              onclick="toggleProjectStatus('${project.id}', '${project.status}')"
              title="คลิกเพื่อเปลี่ยนสถานะ"
              style="
                cursor: pointer; 
                border: 2px solid transparent;
                transition: all 0.2s ease;
                padding: var(--spacing-xs) var(--spacing-md);
                font-weight: 600;
                display: inline-flex;
                align-items: center;
                gap: 6px;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
              "
              onmouseover="this.style.transform='scale(1.05)'; this.style.boxShadow='0 4px 8px rgba(0,0,0,0.15)'; this.style.borderColor='currentColor';"
              onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='0 2px 4px rgba(0,0,0,0.1)'; this.style.borderColor='transparent';">
              <span>${currentStatus.icon}</span>
              <span>${currentStatus.label}</span>
              <span style="opacity: 0.7; font-size: 0.7em;">🔄</span>
            </button>
          </div>
        </td>
        <td style="padding: var(--spacing-md); border: 1px solid var(--color-gray-200); text-align: center;"><strong>${projectTasks.length}</strong></td>
        <td style="padding: var(--spacing-md); border: 1px solid var(--color-gray-200); text-align: center;">
          <button class="btn btn-sm btn-outline" onclick="viewProjectTasks('${project.id}')">
            🔍 ดูงาน
          </button>
        </td>
        <td style="padding: var(--spacing-md); border: 1px solid var(--color-gray-200); text-align: center;">
          <div style="display: flex; gap: var(--spacing-sm); justify-content: center;">
            <button class="btn btn-sm btn-primary" onclick="openEditProjectModal('${project.id}')">
              แก้ไข
            </button>
            <button class="btn btn-sm btn-danger" onclick="confirmDeleteProject('${project.id}')">
              ลบ
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

// ========== Modal Functions ==========
function openCreateProjectModal() {
  currentEditingProject = null;
  const modal = document.getElementById('projectModal');
  if (!modal) return;
  
  document.getElementById('projectModalTitle').textContent = 'สร้างโปรเจกต์ใหม่';
  document.getElementById('projectForm').reset();
  
  loadProjectUsersDropdown();
  
  openModal('projectModal');
}

function openEditProjectModal(projectId) {
  const project = getProjectById(projectId);
  if (!project) return;
  
  currentEditingProject = project;
  
  document.getElementById('projectModalTitle').textContent = 'แก้ไขโปรเจกต์';
  document.getElementById('projectName').value = project.name;
  document.getElementById('projectDescription').value = project.description || '';
  document.getElementById('projectContractNumber').value = project.contractNumber || '';
  document.getElementById('projectFiscalYear').value = project.fiscalYear || '';
  document.getElementById('projectStartDate').value = project.projectStartDate || '';
  document.getElementById('projectExpirationDate').value = project.contractExpirationDate || '';
  document.getElementById('projectStatus').value = project.status;
  
  loadProjectUsersDropdown(project.owner, project.manager);
  
  openModal('projectModal');
}

function saveProject() {
  const name = document.getElementById('projectName').value.trim();
  const description = document.getElementById('projectDescription').value.trim();
  const contractNumber = document.getElementById('projectContractNumber').value.trim();
  const fiscalYear = document.getElementById('projectFiscalYear').value.trim();
  const projectStartDate = document.getElementById('projectStartDate').value;
  const contractExpirationDate = document.getElementById('projectExpirationDate').value;
  const status = document.getElementById('projectStatus').value;
  const owner = document.getElementById('projectOwner').value;
  const manager = document.getElementById('projectManager').value;
  
  if (!name) {
    showToast('กรุณาระบุชื่อโปรเจกต์', 'error');
    return;
  }
  
  const projectData = {
    name,
    description,
    contractNumber,
    fiscalYear,
    projectStartDate: projectStartDate || null,
    contractExpirationDate: contractExpirationDate || null,
    status,
    owner: owner || null,
    manager: manager || null
  };
  
  if (currentEditingProject) {
    updateProject(currentEditingProject.id, projectData);
    showToast('แก้ไขโปรเจกต์เรียบร้อย', 'success');
  } else {
    createProject(projectData);
    showToast('สร้างโปรเจกต์เรียบร้อย', 'success');
  }
  
  closeModal('projectModal');
  renderProjectsTable();
}

function confirmDeleteProject(projectId) {
  if (confirm('คุณแน่ใจหรือไม่ที่จะลบโปรเจกต์นี้?')) {
    if (deleteProject(projectId)) {
      showToast('ลบโปรเจกต์เรียบร้อย', 'success');
      renderProjectsTable();
    }
  }
}

function viewProjectTasks(projectId) {
  window.location.href = `tasks.html?project=${projectId}`;
}

// ========== Helper Functions ==========
function loadProjectUsersDropdown(selectedOwner = null, selectedManager = null) {
  const ownerSelect = document.getElementById('projectOwner');
  const managerSelect = document.getElementById('projectManager');
  
  const users = getUsers();
  const userOptions = users.map(u => `
    <option value="${u.id}">${u.name}</option>
  `).join('');
  
  if (ownerSelect) {
    ownerSelect.innerHTML = '<option value="">-- ไม่ระบุเจ้าของ --</option>' + userOptions;
    if (selectedOwner) {
      ownerSelect.value = selectedOwner;
    }
  }
  
  if (managerSelect) {
    managerSelect.innerHTML = '<option value="">-- ไม่ระบุผู้จัดการ --</option>' + userOptions;
    if (selectedManager) {
      managerSelect.value = selectedManager;
    }
  }
}

// ========== Toggle Project Status ==========
function toggleProjectStatus(projectId, currentStatus) {
  // Status cycle: todo → inprogress → done → todo
  const statusCycle = {
    'todo': 'inprogress',
    'inprogress': 'done',
    'done': 'todo'
  };
  
  const newStatus = statusCycle[currentStatus] || 'inprogress';
  
  updateProject(projectId, { status: newStatus });
  
  const statusLabels = {
    'todo': 'ยังไม่เริ่ม',
    'inprogress': 'ดำเนินการ',
    'done': 'เสร็จสิ้น'
  };
  
  showToast(`เปลี่ยนสถานะเป็น: ${statusLabels[newStatus]}`, 'success');
  renderProjectsTable();
}

// ========== Search and Sort Functions ==========
let currentSortColumn = null;
let currentSortDirection = 'asc';

function filterAndSortProjects() {
  const searchTerm = document.getElementById('projectSearchInput').value.toLowerCase();
  const sortOption = document.getElementById('projectSortSelect').value;
  
  // Show/hide clear button
  const clearBtn = document.getElementById('clearSearchBtn');
  if (clearBtn) {
    clearBtn.style.display = searchTerm ? 'block' : 'none';
  }
  
  let projects = getProjects();
  const tasks = getTasks();
  
  // Filter by search term
  if (searchTerm) {
    projects = projects.filter(project => {
      const manager = getUserById(project.manager);
      const managerName = manager ? manager.name.toLowerCase() : '';
      
      return (
        project.name.toLowerCase().includes(searchTerm) ||
        (project.contractNumber && project.contractNumber.toLowerCase().includes(searchTerm)) ||
        (project.fiscalYear && project.fiscalYear.toLowerCase().includes(searchTerm)) ||
        managerName.includes(searchTerm) ||
        (project.description && project.description.toLowerCase().includes(searchTerm))
      );
    });
  }
  
  // Sort projects
  if (sortOption === 'newest') {
    projects.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  } else if (sortOption === 'oldest') {
    projects.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  } else if (sortOption === 'name-asc') {
    projects.sort((a, b) => a.name.localeCompare(b.name, 'th'));
  } else if (sortOption === 'name-desc') {
    projects.sort((a, b) => b.name.localeCompare(a.name, 'th'));
  }
  
  // Render filtered and sorted projects
  renderFilteredProjects(projects, tasks);
}

function sortByColumn(column) {
  // Toggle sort direction if same column
  if (currentSortColumn === column) {
    currentSortDirection = currentSortDirection === 'asc' ? 'desc' : 'asc';
  } else {
    currentSortColumn = column;
    currentSortDirection = 'asc';
  }
  
  let projects = getProjects();
  const tasks = getTasks();
  
  // Apply search filter first
  const searchTerm = document.getElementById('projectSearchInput')?.value.toLowerCase() || '';
  if (searchTerm) {
    projects = projects.filter(project => {
      const manager = getUserById(project.manager);
      const managerName = manager ? manager.name.toLowerCase() : '';
      
      return (
        project.name.toLowerCase().includes(searchTerm) ||
        (project.contractNumber && project.contractNumber.toLowerCase().includes(searchTerm)) ||
        (project.fiscalYear && project.fiscalYear.toLowerCase().includes(searchTerm)) ||
        managerName.includes(searchTerm)
      );
    });
  }
  
  // Sort by column
  projects.sort((a, b) => {
    let aValue, bValue;
    
    switch(column) {
      case 'name':
        aValue = a.name;
        bValue = b.name;
        return currentSortDirection === 'asc' 
          ? aValue.localeCompare(bValue, 'th')
          : bValue.localeCompare(aValue, 'th');
          
      case 'contract':
        aValue = a.contractNumber || '';
        bValue = b.contractNumber || '';
        return currentSortDirection === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
          
      case 'fiscal':
        aValue = a.fiscalYear || '';
        bValue = b.fiscalYear || '';
        return currentSortDirection === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
          
      case 'startDate':
        aValue = a.projectStartDate || '';
        bValue = b.projectStartDate || '';
        return currentSortDirection === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
          
      case 'endDate':
        aValue = a.contractExpirationDate || '';
        bValue = b.contractExpirationDate || '';
        return currentSortDirection === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
          
      case 'manager':
        const managerA = getUserById(a.manager);
        const managerB = getUserById(b.manager);
        aValue = managerA ? managerA.name : '';
        bValue = managerB ? managerB.name : '';
        return currentSortDirection === 'asc'
          ? aValue.localeCompare(bValue, 'th')
          : bValue.localeCompare(aValue, 'th');
          
      case 'taskCount':
        const tasksA = tasks.filter(t => t.projectId === a.id).length;
        const tasksB = tasks.filter(t => t.projectId === b.id).length;
        return currentSortDirection === 'asc'
          ? tasksA - tasksB
          : tasksB - tasksA;
          
      default:
        return 0;
    }
  });
  
  // Update sort indicators
  updateSortIndicators(column);
  
  // Render sorted projects
  renderFilteredProjects(projects, tasks);
}

function updateSortIndicators(activeColumn) {
  // Clear all indicators
  const columns = ['name', 'contract', 'fiscal', 'startDate', 'endDate', 'manager', 'taskCount'];
  columns.forEach(col => {
    const indicator = document.getElementById(`sort-${col}`);
    if (indicator) {
      indicator.textContent = '';
    }
  });
  
  // Set active indicator
  const activeIndicator = document.getElementById(`sort-${activeColumn}`);
  if (activeIndicator) {
    activeIndicator.textContent = currentSortDirection === 'asc' ? '▲' : '▼';
    activeIndicator.style.fontSize = '0.8em';
    activeIndicator.style.marginLeft = '4px';
  }
}

function renderFilteredProjects(projects, tasks) {
  const tbody = document.getElementById('projectsTableBody');
  if (!tbody) return;
  
  if (projects.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="10" class="text-center text-muted" style="padding: var(--spacing-xl); border: 1px solid var(--color-gray-200);">
          ไม่พบโปรเจกต์ที่ตรงกับเกณฑ์การค้นหา
        </td>
      </tr>
    `;
    return;
  }
  
  tbody.innerHTML = projects.map(project => {
    const manager = getUserById(project.manager);
    const projectTasks = tasks.filter(t => t.projectId === project.id);
    
    const statusMap = {
      todo: { label: 'ยังไม่เริ่ม', class: 'badge-todo', color: '#6b7280', icon: '⏸️' },
      inprogress: { label: 'ดำเนินการ', class: 'badge-inprogress', color: '#3b82f6', icon: '▶️' },
      done: { label: 'เสร็จสิ้น', class: 'badge-done', color: '#10b981', icon: '✓' }
    };
    
    const currentStatus = statusMap[project.status] || statusMap.inprogress;
    
    return `
      <tr style="border-bottom: 1px solid var(--color-gray-200);">
        <td style="padding: var(--spacing-md); border: 1px solid var(--color-gray-200); text-align: left;"><strong>${project.name}</strong></td>
        <td style="padding: var(--spacing-md); border: 1px solid var(--color-gray-200); text-align: center;">${project.contractNumber || '-'}</td>
        <td style="padding: var(--spacing-md); border: 1px solid var(--color-gray-200); text-align: center;">${project.fiscalYear || '-'}</td>
        <td style="padding: var(--spacing-md); border: 1px solid var(--color-gray-200); text-align: center;">${project.projectStartDate ? formatDate(project.projectStartDate) : '-'}</td>
        <td style="padding: var(--spacing-md); border: 1px solid var(--color-gray-200); text-align: center;">${project.contractExpirationDate ? formatDate(project.contractExpirationDate) : '-'}</td>
        <td style="padding: var(--spacing-md); border: 1px solid var(--color-gray-200); text-align: center;">${manager ? manager.name : '-'}</td>
        <td style="padding: var(--spacing-md); border: 1px solid var(--color-gray-200); text-align: center;">
          <div style="position: relative; display: flex; justify-content: center;">
            <button 
              class="badge ${currentStatus.class}" 
              onclick="toggleProjectStatus('${project.id}', '${project.status}')"
              title="คลิกเพื่อเปลี่ยนสถานะ"
              style="
                cursor: pointer; 
                border: 2px solid transparent;
                transition: all 0.2s ease;
                padding: var(--spacing-xs) var(--spacing-md);
                font-weight: 600;
                display: inline-flex;
                align-items: center;
                gap: 6px;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
              "
              onmouseover="this.style.transform='scale(1.05)'; this.style.boxShadow='0 4px 8px rgba(0,0,0,0.15)'; this.style.borderColor='currentColor';"
              onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='0 2px 4px rgba(0,0,0,0.1)'; this.style.borderColor='transparent';">
              <span>${currentStatus.icon}</span>
              <span>${currentStatus.label}</span>
              <span style="opacity: 0.7; font-size: 0.7em;">🔄</span>
            </button>
          </div>
        </td>
        <td style="padding: var(--spacing-md); border: 1px solid var(--color-gray-200); text-align: center;"><strong>${projectTasks.length}</strong></td>
        <td style="padding: var(--spacing-md); border: 1px solid var(--color-gray-200); text-align: center;">
          <button class="btn btn-sm btn-outline" onclick="viewProjectTasks('${project.id}')">
            🔍 ดูงาน
          </button>
        </td>
        <td style="padding: var(--spacing-md); border: 1px solid var(--color-gray-200); text-align: center;">
          <div style="display: flex; gap: var(--spacing-sm); justify-content: center;">
            <button class="btn btn-sm btn-primary" onclick="openEditProjectModal('${project.id}')">
              แก้ไข
            </button>
            <button class="btn btn-sm btn-danger" onclick="confirmDeleteProject('${project.id}')">
              ลบ
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

function clearSearch() {
  document.getElementById('projectSearchInput').value = '';
  filterAndSortProjects();
}

// ========== Initialize ==========
if (document.getElementById('projectsTableBody')) {
  renderProjectsTable();
}
