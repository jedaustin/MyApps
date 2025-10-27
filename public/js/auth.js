// Authentication JavaScript

document.addEventListener('DOMContentLoaded', () => {
  // Login form
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', handleLogin);
  }

  // Register form
  const registerForm = document.getElementById('registerForm');
  if (registerForm) {
    registerForm.addEventListener('submit', handleRegister);
  }
});

async function handleLogin(e) {
  e.preventDefault();

  const form = e.target;
  if (!form.checkValidity()) {
    form.classList.add('was-validated');
    return;
  }

  const formData = {
    username: document.getElementById('username').value,
    password: document.getElementById('password').value
  };

  try {
    const response = await fetch('/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify(formData)
    });

    const data = await response.json();

    if (response.ok) {
      showAlert('alertMessage', 'Login successful! Redirecting...', 'success');
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 1000);
    } else {
      showAlert('alertMessage', data.error || 'Login failed. Please try again.', 'danger');
    }
  } catch (error) {
    console.error('Login error:', error);
    showAlert('alertMessage', 'An error occurred during login. Please try again.', 'danger');
  }
}

async function handleRegister(e) {
  e.preventDefault();

  const form = e.target;
  if (!form.checkValidity()) {
    form.classList.add('was-validated');
    return;
  }

  const formData = {
    name: document.getElementById('name').value,
    username: document.getElementById('username').value.toLowerCase(),
    password: document.getElementById('password').value
  };

  try {
    const response = await fetch('/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify(formData)
    });

    const data = await response.json();

    if (response.ok) {
      showAlert('alertMessage', 'Registration successful! Redirecting...', 'success');
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 1000);
    } else {
      const errorMsg = data.error || data.errors?.[0]?.msg || 'Registration failed. Please try again.';
      showAlert('alertMessage', errorMsg, 'danger');
    }
  } catch (error) {
    console.error('Registration error:', error);
    showAlert('alertMessage', 'An error occurred during registration. Please try again.', 'danger');
  }
}

// Show alert helper function
function showAlert(containerId, message, type = 'danger') {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = `
    <div class="alert alert-${type} alert-dismissible fade show" role="alert">
      ${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    </div>
  `;
}

