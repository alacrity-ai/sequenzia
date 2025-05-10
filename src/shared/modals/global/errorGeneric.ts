// src/global/errorGeneric.ts

export function showErrorModal(message: string): void {
    const modal = document.getElementById('error-modal');
    const content = document.getElementById('error-message-content');
    
    if (!modal || !content) {
      console.error('Error modal elements not found');
      return;
    }
    content.textContent = message;
    modal.classList.remove('hidden');
  }
  
  document.getElementById('error-close-btn')?.addEventListener('click', () => {
    document.getElementById('error-modal')?.classList.add('hidden');
});
