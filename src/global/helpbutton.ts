export function setupHelpButton(): void {
    const helpBtn = document.getElementById('footer-help-btn');
    if (helpBtn) {
      helpBtn.addEventListener('click', () => {
        window.open('https://github.com/alacrity-ai/sequenzia', '_blank');
      });
    }
  }
  