import { startCountdown } from './timer.js';

// Auto-start timer if on the verify page
document.addEventListener('DOMContentLoaded', () => {
  const timerElement = document.getElementById('timer');
  if (timerElement) {
    startCountdown();
  }
});
