export function startCountdown(duration = 5 * 60, elementId = 'timer') {
  const timerElement = document.getElementById(elementId);
  if (!timerElement) return;

  let timeLeft = duration;

  const interval = setInterval(() => {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    timerElement.textContent = `You have ${minutes}:${seconds
      .toString()
      .padStart(2, '0')} minutes remaining.`;

    if (timeLeft <= 0) {
      clearInterval(interval);
      timerElement.textContent = 'Verification code expired. Please try again.';
    }

    timeLeft--;
  }, 1000);
}
