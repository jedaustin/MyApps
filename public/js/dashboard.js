// Dashboard JavaScript for URL management with categories support

const UNCATEGORIZED_FILTER_ID = '__UNCATEGORIZED__';

let urls = [];
let filteredUrls = [];
let categories = [];
let editingUrlId = null;
let searchTerm = '';
let availableCategoryFilterIds = [];
let selectedCategoryIds = new Set();

document.addEventListener('DOMContentLoaded', () => {
  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.addEventListener('input', handleSearch);
  }

  const categoryFiltersContainer = document.getElementById('categoryFilters');
  if (categoryFiltersContainer) {
    categoryFiltersContainer.addEventListener('change', handleCategoryFilterChange);
  }

  const manageCategoriesFromModalButton = document.getElementById('manageCategoriesFromModal');
  if (manageCategoriesFromModalButton) {
    manageCategoriesFromModalButton.addEventListener('click', handleManageCategoriesFromModal);
  }

  const addCategoryForm = document.getElementById('addCategoryForm');
  if (addCategoryForm) {
    addCategoryForm.addEventListener('submit', handleAddCategorySubmit);
  }

  const manageCategoriesList = document.getElementById('manageCategoriesList');
  if (manageCategoriesList) {
    manageCategoriesList.addEventListener('click', handleManageCategoriesListClick);
  }

  loadInitialData().catch(error => {
    console.error('Error during initial load:', error);
    showAlert('alertMessage', 'Failed to initialize dashboard data.', 'danger');
  });
});

async function loadInitialData() {
  await loadCategories();
  await loadUrls();
}

async function loadCategories() {
  try {
    const response = await fetch('/api/categories', {
      credentials: 'include'
    });

    if (response.ok) {
      const data = await response.json();
      categories = data
        .filter(Boolean)
        .sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base', numeric: true }));

      renderCategoryCheckboxes();
      renderManageCategoriesList();
      updateCategoriesCount();
    } else if (response.status === 401) {
      window.location.href = '/login';
    } else {
      showAlert('alertMessage', 'Failed to load categories. Please try again.', 'danger');
    }
  } catch (error) {
    console.error('Error loading categories:', error);
    showAlert('alertMessage', 'An error occurred while loading categories.', 'danger');
  }
}

async function loadUrls() {
  try {
    const response = await fetch('/api/urls', {
      credentials: 'include'
    });

    if (response.ok) {
      const data = await response.json();
      urls = data.map(url => {
        const categoriesForUrl = Array.isArray(url.categories)
          ? [...url.categories]
              .filter(Boolean)
              .sort((a, b) =>
                (a.name || '').localeCompare(b.name || '', undefined, { sensitivity: 'base', numeric: true })
              )
          : [];
        return {
          ...url,
          categories: categoriesForUrl
        };
      });

      renderCategoryFilters();
      applyFilter();
    } else if (response.status === 401) {
      window.location.href = '/login';
    } else {
      showAlert('alertMessage', 'Failed to load URLs. Please try again.', 'danger');
    }
  } catch (error) {
    console.error('Error loading URLs:', error);
    showAlert('alertMessage', 'An error occurred while loading URLs.', 'danger');
  }
}

function displayUrls() {
  const container = document.getElementById('urlsContainer');
  const emptyState = document.getElementById('emptyState');
  const emptyStateHeading = document.getElementById('emptyStateHeading');
  const emptyStateSubheading = document.getElementById('emptyStateSubheading');

  if (!container || !emptyState) {
    return;
  }

  const hasUrls = urls.length > 0;
  const hasFilteredResults = filteredUrls.length > 0;
  const isSearchActive = Boolean(searchTerm);
  const isCategoryFilterActive =
    availableCategoryFilterIds.length > 0 &&
    selectedCategoryIds.size > 0 &&
    selectedCategoryIds.size !== availableCategoryFilterIds.length;

  if (!hasFilteredResults) {
    container.style.display = 'none';
    emptyState.style.display = 'block';
    container.innerHTML = '';

    if (emptyStateHeading && emptyStateSubheading) {
      if ((isSearchActive || isCategoryFilterActive) && hasUrls) {
        emptyStateHeading.textContent = emptyStateHeading.dataset.searchText || 'No matching URLs';
        emptyStateSubheading.textContent =
          emptyStateSubheading.dataset.searchText || 'Try a different search or adjust your filters.';
      } else {
        emptyStateHeading.textContent = emptyStateHeading.dataset.defaultText || 'No URLs yet';
        emptyStateSubheading.textContent =
          emptyStateSubheading.dataset.defaultText || 'Click "Add URL" to create your first bookmark.';
      }
    }
    return;
  }

  container.style.display = 'block';
  emptyState.style.display = 'none';

  if (emptyStateHeading && emptyStateSubheading) {
    emptyStateHeading.textContent = emptyStateHeading.dataset.defaultText || 'No URLs yet';
    emptyStateSubheading.textContent =
      emptyStateSubheading.dataset.defaultText || 'Click "Add URL" to create your first bookmark.';
  }

  container.innerHTML = filteredUrls
    .map(
      (url, index) => `
    <div class="col-md-6 col-lg-4" style="animation-delay: ${index * 50}ms;">
      <div class="card url-card shadow-sm">
        <div class="card-body position-relative">
          ${
            url.pinned
              ? '<i class="fas fa-thumbtack text-primary position-absolute top-0 end-0 mt-2 me-3" title="Pinned"></i>'
              : ''
          }
          <h5 class="card-title">
            <i class="fas fa-link me-2"></i>
            <a href="javascript:void(0)" onclick="launchUrl('${url.url}')" class="text-decoration-none">
              ${escapeHtml(url.description)}
            </a>
          </h5>
          <p class="card-text text-muted small">
            <i class="fas fa-globe me-1"></i>${escapeHtml(url.url)}
          </p>
          ${renderUrlCategories(url)}
          <p class="card-text">
            <small class="text-muted">
              <i class="fas fa-clock me-1"></i>${formatDate(url.createdAt)}
            </small>
          </p>
          <div class="d-grid gap-2 mt-3">
            <a href="javascript:void(0)" onclick="launchUrl('${url.url}')" class="btn btn-primary btn-lg">
              <i class="fas fa-rocket me-2"></i>Launch
            </a>
            <div class="btn-group">
              <button class="btn btn-sm btn-outline-secondary w-100" onclick="togglePin('${url._id}')">
                <i class="fas fa-thumbtack me-1"></i>${url.pinned ? 'Unpin' : 'Pin'}
              </button>
              <button class="btn btn-sm btn-outline-secondary w-100" onclick="openEditModal('${url._id}')">
                <i class="fas fa-edit me-1"></i>Edit
              </button>
              <button class="btn btn-sm btn-outline-danger w-100" onclick="deleteUrl('${url._id}')">
                <i class="fas fa-trash me-1"></i>Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
    )
    .join('');
}

function renderUrlCategories(url) {
  if (!Array.isArray(url.categories) || url.categories.length === 0) {
    return '';
  }

  const badges = url.categories
    .map(
      category =>
        `<span class="badge rounded-pill bg-light text-dark border me-1 mb-1">${escapeHtml(category.name)}</span>`
    )
    .join('');

  return `<div class="mb-2">${badges}</div>`;
}

function handleSearch(event) {
  searchTerm = event.target.value.trim().toLowerCase();
  applyFilter();
}

function handleCategoryFilterChange(event) {
  const input = event.target;
  if (!input || !input.dataset.filterId) {
    return;
  }

  const filterId = input.dataset.filterId;

  if (filterId === '__all') {
    if (!input.checked) {
      input.checked = true;
      return;
    }

    selectedCategoryIds = new Set(availableCategoryFilterIds);
  } else {
    if (input.checked) {
      selectedCategoryIds.add(filterId);
    } else {
      selectedCategoryIds.delete(filterId);
    }

    if (selectedCategoryIds.size === 0) {
      selectedCategoryIds = new Set(availableCategoryFilterIds);
    }
  }

  renderCategoryFilters();
  applyFilter();
}

function applyFilter() {
  filteredUrls = urls.filter(url => {
    const matchesSearch = matchesSearchTerm(url, searchTerm);
    const matchesCategories = matchesCategoryFilters(url);
    return matchesSearch && matchesCategories;
  });

  displayUrls();
}

function matchesSearchTerm(url, term) {
  if (!term) {
    return true;
  }

  const description = (url.description || '').toLowerCase();
  const targetUrl = (url.url || '').toLowerCase();
  return description.includes(term) || targetUrl.includes(term);
}

function matchesCategoryFilters(url) {
  if (availableCategoryFilterIds.length === 0 || selectedCategoryIds.size === 0) {
    return true;
  }

  const categoryIdsForUrl = getUrlCategoryIds(url);
  if (categoryIdsForUrl.length === 0) {
    return selectedCategoryIds.has(UNCATEGORIZED_FILTER_ID);
  }

  return categoryIdsForUrl.some(id => selectedCategoryIds.has(id));
}

function getUrlCategoryIds(url) {
  if (!Array.isArray(url.categories)) {
    return [];
  }

  return url.categories.filter(cat => cat && cat._id).map(cat => cat._id);
}

function renderCategoryFilters() {
  const container = document.getElementById('categoryFilters');
  if (!container) {
    return;
  }

  const categoryUsage = new Map();
  let uncategorizedCount = 0;

  urls.forEach(url => {
    const categoriesForUrl = Array.isArray(url.categories) ? url.categories : [];
    if (categoriesForUrl.length === 0) {
      uncategorizedCount += 1;
      return;
    }

    categoriesForUrl.forEach(category => {
      if (!category || !category._id) {
        return;
      }
      const current = categoryUsage.get(category._id) || { name: category.name, count: 0 };
      current.name = category.name;
      current.count += 1;
      categoryUsage.set(category._id, current);
    });
  });

  const filters = Array.from(categoryUsage.entries())
    .map(([id, info]) => ({
      id,
      name: info.name,
      count: info.count
    }))
    .sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base', numeric: true }));

  if (uncategorizedCount > 0) {
    filters.push({
      id: UNCATEGORIZED_FILTER_ID,
      name: 'Uncategorized',
      count: uncategorizedCount
    });
  }

  availableCategoryFilterIds = filters.map(filter => filter.id);

  if (availableCategoryFilterIds.length === 0) {
    container.innerHTML = '<span class="badge bg-light text-muted border">No categories assigned yet.</span>';
    selectedCategoryIds.clear();
    return;
  }

  const preservedSelection = [...selectedCategoryIds].filter(id => availableCategoryFilterIds.includes(id));
  selectedCategoryIds = new Set(preservedSelection);

  if (selectedCategoryIds.size === 0) {
    selectedCategoryIds = new Set(availableCategoryFilterIds);
  }

  const allChecked = selectedCategoryIds.size === availableCategoryFilterIds.length;

  const filtersHtml = filters
    .map(
      filter => `
      <div class="form-check form-check-inline mb-0">
        <input
          class="form-check-input category-filter-input"
          type="checkbox"
          id="filter-${filter.id}"
          data-filter-id="${filter.id}"
          ${selectedCategoryIds.has(filter.id) ? 'checked' : ''}
        >
        <label class="form-check-label" for="filter-${filter.id}">
          ${escapeHtml(filter.name)} <span class="text-muted small">(${filter.count})</span>
        </label>
      </div>
    `
    )
    .join('');

  container.innerHTML = `
    <span class="text-muted small fw-semibold text-uppercase me-2">Categories:</span>
    <div class="form-check form-check-inline mb-0">
      <input
        class="form-check-input"
        type="checkbox"
        id="filter-all-categories"
        data-filter-id="__all"
        ${allChecked ? 'checked' : ''}
      >
      <label class="form-check-label" for="filter-all-categories">All</label>
    </div>
    ${filtersHtml}
  `;
}

function launchUrl(url) {
  window.open(url, 'weblauncher_tab');
}

function openAddModal() {
  editingUrlId = null;
  const modalTitle = document.getElementById('modalTitle');
  const urlForm = document.getElementById('urlForm');
  const urlIdInput = document.getElementById('urlId');
  clearContainer('modalAlert');

  if (modalTitle) {
    modalTitle.textContent = 'Add New URL';
  }

  if (urlForm) {
    urlForm.reset();
  }

  if (urlIdInput) {
    urlIdInput.value = '';
  }

  renderCategoryCheckboxes([]);
}

function openEditModal(urlId) {
  const url = urls.find(u => u._id === urlId);
  if (!url) return;

  editingUrlId = urlId;
  const modalTitle = document.getElementById('modalTitle');
  const urlIdInput = document.getElementById('urlId');
  const descriptionInput = document.getElementById('description');
  const urlInput = document.getElementById('url');
  clearContainer('modalAlert');

  if (modalTitle) {
    modalTitle.textContent = 'Edit URL';
  }
  if (urlIdInput) {
    urlIdInput.value = urlId;
  }
  if (descriptionInput) {
    descriptionInput.value = url.description;
  }
  if (urlInput) {
    urlInput.value = url.url;
  }

  renderCategoryCheckboxes(getUrlCategoryIds(url));
}

async function saveUrl() {
  const descriptionInput = document.getElementById('description');
  const urlInput = document.getElementById('url');

  const description = descriptionInput ? descriptionInput.value.trim() : '';
  const urlValue = urlInput ? urlInput.value.trim() : '';

  if (!description) {
    showAlert('modalAlert', 'Description is required', 'danger');
    return;
  }

  if (description.length > 500) {
    showAlert('modalAlert', 'Description cannot exceed 500 characters', 'danger');
    return;
  }

  if (!urlValue || !isValidURL(urlValue)) {
    showAlert('modalAlert', 'Please provide a valid URL', 'danger');
    return;
  }

  const selectedCategories = getSelectedCategoryIdsFromForm();
  const requestUrl = editingUrlId ? `/api/urls/${editingUrlId}` : '/api/urls';
  const method = editingUrlId ? 'PUT' : 'POST';
  const payload = { description, url: urlValue, categories: selectedCategories };

  try {
    const response = await fetch(requestUrl, {
      method,
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify(payload)
    });

    const data = await response.json().catch(() => ({}));

    if (response.ok) {
      const modalElement = document.getElementById('urlModal');
      const modalInstance = modalElement ? bootstrap.Modal.getInstance(modalElement) : null;
      modalInstance?.hide();

      await loadUrls();

      showAlert(
        'alertMessage',
        editingUrlId ? 'URL updated successfully!' : 'URL created successfully!',
        'success'
      );
    } else {
      const errorMsg = data.error || data.errors?.[0]?.msg || 'Failed to save URL';
      showAlert('modalAlert', errorMsg, 'danger');
    }
  } catch (error) {
    console.error('Error saving URL:', error);
    showAlert('modalAlert', 'An error occurred while saving the URL', 'danger');
  }
}

async function togglePin(urlId) {
  try {
    const response = await fetch(`/api/urls/${urlId}/pin`, {
      method: 'PUT',
      credentials: 'include'
    });

    if (response.ok) {
      await loadUrls();
      showAlert('alertMessage', 'Pin status updated!', 'success');
    } else {
      const data = await response.json();
      showAlert('alertMessage', data.error || 'Failed to update pin status', 'danger');
    }
  } catch (error) {
    console.error('Error toggling pin:', error);
    showAlert('alertMessage', 'An error occurred while updating the pin status', 'danger');
  }
}

async function deleteUrl(urlId) {
  if (!confirm('Are you sure you want to delete this URL?')) {
    return;
  }

  try {
    const response = await fetch(`/api/urls/${urlId}`, {
      method: 'DELETE',
      credentials: 'include'
    });

    if (response.ok || response.status === 204) {
      await loadUrls();
      showAlert('alertMessage', 'URL deleted successfully!', 'success');
    } else {
      const data = await response.json();
      showAlert('alertMessage', data.error || 'Failed to delete URL', 'danger');
    }
  } catch (error) {
    console.error('Error deleting URL:', error);
    showAlert('alertMessage', 'An error occurred while deleting the URL', 'danger');
  }
}

function openManageCategoriesModal() {
  resetManageCategoriesModalState();
  renderManageCategoriesList();
  const modalElement = document.getElementById('manageCategoriesModal');
  if (!modalElement) return;
  const modalInstance = bootstrap.Modal.getOrCreateInstance(modalElement);
  modalInstance.show();
}

function handleManageCategoriesFromModal() {
  const urlModalElement = document.getElementById('urlModal');
  const manageModalElement = document.getElementById('manageCategoriesModal');
  if (!manageModalElement) return;

  const showManageModal = () => {
    resetManageCategoriesModalState();
    renderManageCategoriesList();
    bootstrap.Modal.getOrCreateInstance(manageModalElement).show();
  };

  if (!urlModalElement) {
    showManageModal();
    return;
  }

  const urlModalInstance = bootstrap.Modal.getInstance(urlModalElement);
  if (!urlModalInstance) {
    showManageModal();
    return;
  }

  urlModalElement.addEventListener(
    'hidden.bs.modal',
    () => {
      showManageModal();
    },
    { once: true }
  );

  urlModalInstance.hide();
}

function handleAddCategorySubmit(event) {
  event.preventDefault();
  const input = document.getElementById('newCategoryName');
  if (!input) return;

  const name = input.value.trim();
  if (!name) {
    showAlert('categoriesModalAlert', 'Please enter a category name.', 'warning');
    return;
  }

  createCategory(name);
}

async function createCategory(name) {
  try {
    const response = await fetch('/api/categories', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({ name })
    });

    const data = await response.json().catch(() => ({}));

    if (response.ok) {
      categories.push(data);
      categories = categories
        .filter(Boolean)
        .sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base', numeric: true }));

      renderCategoryCheckboxes();
      renderManageCategoriesList();
      updateCategoriesCount();

      const input = document.getElementById('newCategoryName');
      if (input) {
        input.value = '';
        input.focus();
      }

      showAlert('categoriesModalAlert', `Category "${escapeHtml(data.name)}" added!`, 'success');
    } else {
      const errorMsg = data.error || data.errors?.[0]?.msg || 'Failed to create category';
      showAlert('categoriesModalAlert', errorMsg, 'danger');
    }
  } catch (error) {
    console.error('Error creating category:', error);
    showAlert('categoriesModalAlert', 'An error occurred while creating the category.', 'danger');
  }
}

function handleManageCategoriesListClick(event) {
  const actionButton = event.target.closest('button[data-action]');
  if (!actionButton) {
    return;
  }

  const listItem = actionButton.closest('[data-category-id]');
  if (!listItem) {
    return;
  }

  const categoryId = listItem.dataset.categoryId;
  const category = categories.find(cat => cat._id === categoryId);
  if (!category) {
    return;
  }

  const action = actionButton.dataset.action;
  if (action === 'rename') {
    promptRenameCategory(category);
  } else if (action === 'delete') {
    confirmDeleteCategory(category);
  }
}

function promptRenameCategory(category) {
  const newName = prompt('Rename category', category.name || '');
  if (newName === null) {
    return;
  }

  const trimmedName = newName.trim();
  if (!trimmedName) {
    showAlert('categoriesModalAlert', 'Category name cannot be empty.', 'warning');
    return;
  }

  renameCategory(category._id, trimmedName);
}

async function renameCategory(categoryId, name) {
  try {
    const response = await fetch(`/api/categories/${categoryId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({ name })
    });

    const data = await response.json().catch(() => ({}));

    if (response.ok) {
      categories = categories
        .map(cat => (cat._id === data._id ? data : cat))
        .filter(Boolean)
        .sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base', numeric: true }));

      urls = urls.map(url => ({
        ...url,
        categories: Array.isArray(url.categories)
          ? url.categories.map(cat => (cat && cat._id === data._id ? { ...cat, name: data.name } : cat))
          : []
      }));

      renderCategoryCheckboxes();
      renderManageCategoriesList();
      updateCategoriesCount();
      renderCategoryFilters();
      applyFilter();

      showAlert('categoriesModalAlert', `Category renamed to "${escapeHtml(data.name)}".`, 'success');
    } else {
      const errorMsg = data.error || data.errors?.[0]?.msg || 'Failed to rename category';
      showAlert('categoriesModalAlert', errorMsg, 'danger');
    }
  } catch (error) {
    console.error('Error renaming category:', error);
    showAlert('categoriesModalAlert', 'An error occurred while renaming the category.', 'danger');
  }
}

function confirmDeleteCategory(category) {
  const confirmed = confirm(
    `Delete category "${category.name}"?\n\nAny URLs tagged with this category will become uncategorized.`
  );
  if (!confirmed) {
    return;
  }

  deleteCategory(category._id);
}

async function deleteCategory(categoryId) {
  try {
    const response = await fetch(`/api/categories/${categoryId}`, {
      method: 'DELETE',
      credentials: 'include'
    });

    if (response.ok || response.status === 204) {
      categories = categories.filter(cat => cat._id !== categoryId);

      urls = urls.map(url => ({
        ...url,
        categories: Array.isArray(url.categories)
          ? url.categories.filter(cat => cat && cat._id !== categoryId)
          : []
      }));

      renderCategoryCheckboxes();
      renderManageCategoriesList();
      updateCategoriesCount();
      renderCategoryFilters();
      applyFilter();

      showAlert('categoriesModalAlert', 'Category deleted.', 'success');
    } else {
      const data = await response.json();
      const errorMsg = data.error || 'Failed to delete category';
      showAlert('categoriesModalAlert', errorMsg, 'danger');
    }
  } catch (error) {
    console.error('Error deleting category:', error);
    showAlert('categoriesModalAlert', 'An error occurred while deleting the category.', 'danger');
  }
}

function renderCategoryCheckboxes(preservedSelection) {
  const container = document.getElementById('categoryCheckboxes');
  if (!container) {
    return;
  }

  const currentSelection = Array.isArray(preservedSelection)
    ? preservedSelection
    : Array.from(container.querySelectorAll('input[type="checkbox"]:checked')).map(input => input.value);

  if (!categories.length) {
    container.innerHTML = `
      <div class="col-12">
        <span class="text-muted small">No categories available yet. Use Manage to add one.</span>
      </div>
    `;
    return;
  }

  const sortedCategories = [...categories].sort((a, b) =>
    a.name.localeCompare(b.name, undefined, { sensitivity: 'base', numeric: true })
  );

  container.innerHTML = sortedCategories
    .map(
      category => `
      <div class="col-12 col-sm-6">
        <div class="form-check">
          <input
            class="form-check-input"
            type="checkbox"
            value="${category._id}"
            id="url-category-${category._id}"
            ${currentSelection.includes(category._id) ? 'checked' : ''}
          >
          <label class="form-check-label" for="url-category-${category._id}">
            ${escapeHtml(category.name)}
          </label>
        </div>
      </div>
    `
    )
    .join('');
}

function getSelectedCategoryIdsFromForm() {
  return Array.from(document.querySelectorAll('#categoryCheckboxes input[type="checkbox"]:checked')).map(
    input => input.value
  );
}

function renderManageCategoriesList() {
  const listElement = document.getElementById('manageCategoriesList');
  if (!listElement) {
    return;
  }

  if (!categories.length) {
    listElement.innerHTML =
      '<li class="list-group-item text-muted text-center">No categories yet. Add one above.</li>';
    return;
  }

  const sortedCategories = [...categories].sort((a, b) =>
    a.name.localeCompare(b.name, undefined, { sensitivity: 'base', numeric: true })
  );

  listElement.innerHTML = sortedCategories
    .map(
      category => `
      <li class="list-group-item d-flex justify-content-between align-items-center" data-category-id="${category._id}">
        <div class="d-flex align-items-center">
          <i class="fas fa-tag text-muted me-2"></i>
          <span class="category-name">${escapeHtml(category.name)}</span>
        </div>
        <div class="btn-group btn-group-sm" role="group" aria-label="Manage ${escapeHtml(category.name)}">
          <button type="button" class="btn btn-outline-secondary" data-action="rename">
            <i class="fas fa-pen me-1"></i>Rename
          </button>
          <button type="button" class="btn btn-outline-danger" data-action="delete">
            <i class="fas fa-trash me-1"></i>Delete
          </button>
        </div>
      </li>
    `
    )
    .join('');
}

function updateCategoriesCount() {
  const countElement = document.getElementById('categoriesCount');
  if (!countElement) {
    return;
  }

  if (!categories.length) {
    countElement.textContent = 'No categories';
    return;
  }

  countElement.textContent = categories.length === 1 ? '1 category' : `${categories.length} categories`;
}

function resetManageCategoriesModalState() {
  clearContainer('categoriesModalAlert');
  const input = document.getElementById('newCategoryName');
  if (input) {
    input.value = '';
    input.focus();
  }
}

function clearContainer(containerId) {
  const container = document.getElementById(containerId);
  if (container) {
    container.innerHTML = '';
  }
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function isValidURL(string) {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}
