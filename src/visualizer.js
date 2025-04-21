// js/visualizer.js

export function startWaveformVisualizer(analyserNode, canvas) {
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;

  // time-domain buffer
  const timeData = new Uint8Array(analyserNode.fftSize);
  // frequency-domain buffer
  const freqData = new Uint8Array(analyserNode.frequencyBinCount);

  // off-screen for spectrogram history
  const specCanvas = document.createElement('canvas');
  specCanvas.width  = W;
  specCanvas.height = H;
  const specCtx = specCanvas.getContext('2d');

  let mode = 'frequency'; // default

  function drawWaveform() {
    analyserNode.getByteTimeDomainData(timeData);
    ctx.fillStyle   = '#000';
    ctx.fillRect(0, 0, W, H);
    ctx.lineWidth   = 2;
    ctx.strokeStyle = '#00ffcc';
    ctx.beginPath();

    const sliceW = W / timeData.length;
    let x = 0;
    for (let i = 0; i < timeData.length; i++) {
      const v = timeData[i] / 128.0;
      const y = v * H / 2;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      x += sliceW;
    }
    ctx.lineTo(W, H / 2);
    ctx.stroke();
  }

  function drawFrequencyBars() {
    analyserNode.getByteFrequencyData(freqData);
    
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, W, H);
    
    // For debugging - draw edge markers
    ctx.fillStyle = 'rgba(255,255,255,0.2)';
    ctx.fillRect(0, 0, 1, H);      // Left edge
    ctx.fillRect(W-1, 0, 1, H);    // Right edge
    
    const barCount = 128;
    const spacing = 2;
    
    // Pre-calculate all bar positions to ensure we use the full width
    const positions = [];
    
    for (let i = 0; i < barCount; i++) {
      // Position each bar using the full width
      positions.push(i * W / (barCount - 1));
    }
    
    // Make sure the last position is exactly at the canvas width
    positions[positions.length - 1] = W - 1;
    
    // Now draw each bar
    for (let i = 0; i < barCount; i++) {
      const x = positions[i];
      
      // Calculate next position (or end of canvas for last bar)
      const nextX = (i < barCount - 1) ? positions[i + 1] : W;
      
      // Calculate bar width with spacing
      const barWidth = Math.max(1, (nextX - x) - spacing);
      
      // Use logarithmic scaling for frequency bin selection
      const minFreq = 20;
      const maxFreq = 20000;
      const logPosition = i / (barCount - 1);
      const freq = minFreq * Math.pow(maxFreq / minFreq, logPosition);
      
      const nyquist = 22050;
      const dataIndex = Math.min(freqData.length - 1, 
                               Math.floor(freq / nyquist * freqData.length));
      
      const v = freqData[dataIndex] / 255;
      const h = Math.max(1, v * H);
      
      // Color based on frequency
      const hue = 240 - (logPosition * 240);
      ctx.fillStyle = `hsl(${hue}, ${80 + v * 20}%, ${40 + v * 40}%)`;
      
      // Draw the bar
      ctx.fillRect(x, H - h, barWidth, h);
    }
  }

  function drawSpectrogram() {
    analyserNode.getByteFrequencyData(freqData);
    
    // IMPORTANT: Make sure the off-screen canvas background is properly initialized
    // This happens only once when the visualization first starts
    if (!specCanvas.initialized) {
      specCtx.fillStyle = '#000';
      specCtx.fillRect(0, 0, W, H);
      specCanvas.initialized = true;
    }
    
    // Shift existing content left
    specCtx.drawImage(specCanvas, -1, 0);
    
    // Clear the rightmost column with BLACK (not transparent)
    specCtx.fillStyle = '#000';
    specCtx.fillRect(W - 1, 0, 1, H);
    
    // Apply logarithmic frequency scaling
    const frequencyBands = 128;
    const minFreq = 20;
    const maxFreq = 20000;
    
    // Draw newest column
    for (let i = 0; i < frequencyBands; i++) {
      // Map to logarithmic frequency scale
      const logPos = i / (frequencyBands - 1);
      const freq = minFreq * Math.pow(maxFreq / minFreq, logPos);
      
      // Map to frequency data index
      const nyquist = 22050;
      const dataIndex = Math.min(freqData.length - 1, 
                                Math.floor(freq / nyquist * freqData.length));
      
      // Get amplitude value
      const amplitude = freqData[dataIndex] / 255;
      
      // Calculate y position (invert so lower frequencies at bottom)
      const y = H - 1 - Math.floor(i * H / frequencyBands);
      
      // Only draw if signal is strong enough
      if (amplitude < 0.05) continue;
      
      // Create colors based on frequency and amplitude
      const r = Math.floor(amplitude * 255);
      const g = Math.floor(amplitude * (255 - (logPos * 200)));
      const b = Math.floor(amplitude * (100 + (logPos * 155)));
      
      // Draw pixel
      specCtx.fillStyle = `rgb(${r}, ${g}, ${b})`;
      specCtx.fillRect(W - 1, y, 1, 1);
    }
    
    // Clear main canvas with BLACK
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, W, H);
    
    // Draw the spectrogram onto main canvas
    ctx.drawImage(specCanvas, 0, 0);
  }

  function tick() {
    requestAnimationFrame(tick);
    switch (mode) {
      case 'frequency':
        drawFrequencyBars();
        break;
      case 'spectrogram':
        drawSpectrogram();
        break;
      case 'waveform':
      default:
        drawWaveform();
    }
  }
  tick();

  return {
    /** 
     * Switch to one of 'waveform' | 'frequency' | 'spectrogram'.
     * Clears previous visuals so no artifacts remain.
     */
    setMode(newMode) {
      if (!['waveform', 'frequency', 'spectrogram'].includes(newMode)) return;
      mode = newMode;
      // clear main canvas immediately
      ctx.clearRect(0, 0, W, H);
      // reset history if switching to spectrogram
      if (mode === 'spectrogram') {
        specCtx.clearRect(0, 0, W, H);
      }
    }
  };
}
