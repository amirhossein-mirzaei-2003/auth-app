import { startCountdown } from './timer.js';
import { login, logout } from './login.js';
import { signup } from './signup.js';
import { verifyCode } from './verify.js';
import { forgotPassword } from './forgotPassword.js';
import { resetPassword } from './resetPassword.js';

// Auto-start timer if on the verify page
document.addEventListener('DOMContentLoaded', () => {
  const timerElement = document.getElementById('timer');
  if (timerElement) {
    startCountdown();
  }
});

const loginForm = document.querySelector('.login--form');
const logoutBtn = document.querySelector('.logout');
const signupForm = document.querySelector('.signup--form');
const verifyForm = document.querySelector('.verify--form');
const forgotForm = document.querySelector('.forgot--form');
const resetForm = document.querySelector('.reset--form');

if (loginForm) {
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    login(email, password);
  });
}

if (logoutBtn) {
  logoutBtn.addEventListener('click', (e) => {
    e.preventDefault();
    logout();
  });
}

if (signupForm) {
  signupForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('name-signup').value;
    const email = document.getElementById('email-signup').value;
    const password = document.getElementById('password-signup').value;
    const passwordConfrim = document.getElementById('confirm-signup').value;
    signup(name, email, password, passwordConfrim);
  });
}

if (verifyForm) {
  verifyForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const code = document.getElementById('verify-code').value;
    verifyCode(code);
  });
}

if (forgotForm) {
  forgotForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('email-forgot').value;
    forgotPassword(email);
  });
}

if (resetForm) {
  resetForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const password = document.getElementById('password-reset').value;
    const passwordConfirm = document.getElementById('confirm-reset').value;
    resetPassword(password, passwordConfirm);
  });
}
