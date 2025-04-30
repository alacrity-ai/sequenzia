// src/global/whatsnew.ts

import { getAssetPath } from './assetHelpers.js';

// ====== Metadata (update these in PRs) ======
export const WHATS_NEW_VERSION = 'v0.0.7';
export const WHATS_NEW_DATE = 'April 29, 2025';

// ====== Content ======
export const WHATS_NEW_CONTENT: string[] = [
  "✨ New Features",
  "- 🎹 Added support for WebAudioFont (1000+ new instruments)",
  "- 📥 Added MIDI export and import functionality",
  "- ⚙️ Introduced display customization in Userconfig (note styles, grid color schemes)",
  "- 🎞️ Added animated notes during playback and editing",
  "- 📐 Adjustable sequencer height per track",

  "🐞 Known Issues",
  "- 🚫 Scaling groups of notes not functional",

  "🛣️ Roadmap",
  "- 🔊 Upcoming: velocity support and per-note volume control",
  "- 🧠 Upcoming: AI-assisted generation and extension tools",
];

// ====== Handlers ======

// Inject content + show modal
export function showWhatsNewModal(): void {
    const modal = document.getElementById('whats-new-modal');
    const listContainer = modal?.querySelector('ul');
    const metadataContainer = document.getElementById('whats-new-metadata');
    const logoImg = modal?.querySelector('img') as HTMLImageElement | null; // target the logo inside modal
  
    if (modal && listContainer && metadataContainer) {
      // Clear existing list (but not the metadata div)
      listContainer.innerHTML = '';
  
      // Update metadata contents
      metadataContainer.textContent = `${WHATS_NEW_VERSION} — Updated ${WHATS_NEW_DATE}`;
  
      // Dynamically set the logo src path
      if (logoImg) {
        logoImg.src = getAssetPath('static/logo.png');
      }
  
      let currentSectionUl: HTMLUListElement | null = null;
  
      for (const item of WHATS_NEW_CONTENT) {
        if (item.startsWith("✨") || item.startsWith("🐞") || item.startsWith("🛣️")) {
          const sectionTitle = document.createElement('li');
          sectionTitle.textContent = item;
          sectionTitle.classList.add('font-bold', 'mt-6', 'text-lg');
          listContainer.appendChild(sectionTitle);
  
          currentSectionUl = document.createElement('ul');
          currentSectionUl.classList.add('list-disc', 'list-inside', 'ml-6', 'mt-2', 'space-y-1');
          listContainer.appendChild(currentSectionUl);
        } else if (currentSectionUl) {
          const li = document.createElement('li');
          li.textContent = item.replace(/^- /, '');
          currentSectionUl.appendChild(li);
        }
      }
  
      modal.classList.remove('hidden');
    }
}  

// Hide with fade
export function hideWhatsNewModal(): void {
  const modal = document.getElementById('whats-new-modal');
  if (modal) {
    modal.style.opacity = '0';
    modal.style.transition = 'opacity 0.4s ease-out';
    setTimeout(() => {
      modal.classList.add('hidden');
      modal.style.opacity = '1';
    }, 400);
  }
}

// Attach click listener to close button
document.getElementById('whats-new-close-btn')?.addEventListener('click', hideWhatsNewModal);

// Attach listener to "What's New" sidebar button
export function setupWhatsNewButton(): void {
  document.getElementById('footer-whats-new-btn')?.addEventListener('click', showWhatsNewModal);
}
