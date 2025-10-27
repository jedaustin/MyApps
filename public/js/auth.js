/**
 * Handles the registration form submission.
 */
function handleRegistration() {
  const form = document.getElementById('register-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const errorAlert = document.getElementById('error-alert');
    const submitButton = form.querySelector('button[type="submit"]');
    const spinner = submitButton.querySelector('.spinner-border');

    // Reset UI
    errorAlert.classList.add('d-none');
    spinner.classList.remove('d-none');
    submitButton.disabled = true;

    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    try {
      const response = await fetch('/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        // Handle validation errors or other issues
        const errorMessage = result.errors ? result.errors.map(err => err.msg).join(', ') : result.error;
        errorAlert.textContent = errorMessage || 'An unknown error occurred.';
        errorAlert.classList.remove('d-none');
      } else {
        // Successful registration, redirect to dashboard
        window.location.href = '/dashboard';
      }
    } catch (error) {
      console.error('Registration fetch error:', error);
      errorAlert.textContent = 'A network error occurred. Please try again.';
      errorAlert.classList.remove('d-none');
    } finally {
      // Re-enable button and hide spinner
      spinner.classList.add('d-none');
      submitButton.disabled = false;
    }
  });
}

/**
 * Handles the login form submission.
 */
function handleLogin() {
  const form = document.getElementById('login-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const errorAlert = document.getElementById('error-alert');
    const submitButton = form.querySelector('button[type="submit"]');
    const spinner = submitButton.querySelector('.spinner-border');

    // Reset UI
    errorAlert.classList.add('d-none');
    spinner.classList.remove('d-none');
    submitButton.disabled = true;

    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    try {
      const response = await fetch('/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        window.location.href = '/dashboard';
      } else {
        const result = await response.json();
        errorAlert.textContent = result.error || 'Invalid username or password.';
        errorAlert.classList.remove('d-none');
      }
    } catch (error) {
      errorAlert.textContent = 'A network error occurred. Please try again.';
      errorAlert.classList.remove('d-none');
    } finally {
      spinner.classList.add('d-none');
      submitButton.disabled = false;
    }
  });
}