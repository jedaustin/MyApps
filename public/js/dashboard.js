// Dashboard JavaScript for URL management

let urls = [];
let editingUrlId = null;

document.addEventListener('DOMContentLoaded', () => {
  loadUrls();
});

// Load all URLs
async function loadUrls() {
  try {
    const response = await fetch('/api/urls', {
      credentials: 'include'
    });

    if (response.ok) {
      const data = await response.json();
      urls = data;
      displayUrls();
    } else {
      if (response.status === 401) {
        window.location.href = '/login';
      } else {
        showAlert('alertMessage', 'Failed to load URLs. Please try again.', 'danger');
      }
    }
  } catch (error) {
    console.error('Error loading URLs:', error);
    showAlert('alertMessage', 'An error occurred while loading URLs.', 'danger');
  }
}

// Display URLs in the container
function displayUrls() {
  const container = document.getElementById('urlsContainer');
  const emptyState = document.getElementById('emptyState');

  if (urls.length === 0) {
    container.style.display = 'none';
    emptyState.style.display = 'block';
    return;
  }

  container.style.display = 'block';
  emptyState.style.display = 'none';

  container.innerHTML = urls.map((url, index) => `
    <div class="col-md-6 col-lg-4" style="animation-delay: ${index * 50}ms;">
      <div class="card url-card shadow-sm">
        <div class="card-body">
          <h5 class="card-title">
            <i class="fas fa-link me-2"></i>
            <a href="${url.url}" target="_blank" rel="noopener noreferrer" class="text-decoration-none">
              ${escapeHtml(url.description)}
            </a>
          </h5>
          <p class="card-text text-muted small">
            <i class="fas fa-globe me-1"></i>${escapeHtml(url.url)}
          </p>
          <p class="card-text">
            <small class="text-muted">
              <i class="fas fa-clock me-1"></i>${formatDate(url.createdAt)}
            </small>
          </p>
          <div class="d-grid gap-2 mt-3">
            <a href="${url.url}" target="_blank" rel="noopener noreferrer" class="btn btn-primary btn-lg">
              <i class="fas fa-rocket me-2"></i>Launch
            </a>
            <div class="btn-group">
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
  `).join('');
}

// Open modal for adding new URL
function openAddModal() {
  editingUrlId = null;
  document.getElementById('modalTitle').textContent = 'Add New URL';
  document.getElementById('urlForm').reset();
  document.getElementById('urlId').value = '';
  document.getElementById('modalAlert').innerHTML = '';
}

// Open modal for editing URL
function openEditModal(urlId) {
  const url = urls.find(u => u._id === urlId);
  if (!url) return;

  editingUrlId = urlId;
  document.getElementById('modalTitle').textContent = 'Edit URL';
  document.getElementById('urlId').value = urlId;
  document.getElementById('description').value = url.description;
  document.getElementById('url').value = url.url;
  document.getElementById('modalAlert').innerHTML = '';
}

// Save URL (create or update)
async function saveUrl() {
  const description = document.getElementById('description').value.trim();
  const urlValue = document.getElementById('url').value.trim();

  // Validation
  if (!description || description.length === 0) {
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

  const url = editingUrlId ? `/api/urls/${editingUrlId}` : '/api/urls';
  const method = editingUrlId ? 'PUT' : 'POST';
  const body = { description, url: urlValue };

  try {
    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify(body)
    });

    const data = await response.json();

    if (response.ok) {
      // Close modal
      const modal = bootstrap.Modal.getInstance(document.getElementById('urlModal'));
      modal.hide();

      // Reload URLs
      await loadUrls();

      // Show success message
      showAlert('alertMessage', editingUrlId ? 'URL updated successfully!' : 'URL created successfully!', 'success');
    } else {
      const errorMsg = data.error || data.errors?.[0]?.msg || 'Failed to save URL';
      showAlert('modalAlert', errorMsg, 'danger');
    }
  } catch (error) {
    console.error('Error saving URL:', error);
    showAlert('modalAlert', 'An error occurred while saving the URL', 'danger');
  }
}

// Delete URL
async function deleteUrl(urlId) {
  if (!confirm('Are you sure you want to delete this URL?')) {
    return;
  }

  try {
    const response = await fetch(`/api/urls/${urlId}`, {
      method: 'DELETE',
      credentials: 'include'
    });

    if (response.ok) {
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

// Helper function to escape HTML
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Helper function to validate URL
function isValidURL(string) {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}
