export function initZoomControls(wrapper, zoomInFn, zoomOutFn, resetZoomFn) {
    const zoomInBtn = wrapper.querySelector('.zoom-in-btn');
    const zoomOutBtn = wrapper.querySelector('.zoom-out-btn');
    const zoomResetBtn = wrapper.querySelector('.zoom-reset-btn'); // Added this
  
    if (!zoomInBtn || !zoomOutBtn || !zoomResetBtn) return;
  
    zoomInBtn.addEventListener('click', zoomInFn);
    zoomOutBtn.addEventListener('click', zoomOutFn);
    zoomResetBtn.addEventListener('click', resetZoomFn);
  }
  