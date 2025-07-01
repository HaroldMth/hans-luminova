// Device fingerprinting utility for frontend
export function generateDeviceFingerprint(): string {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  // Canvas fingerprinting
  if (ctx) {
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillText('Device fingerprint test', 2, 2);
  }
  const canvasFingerprint = canvas.toDataURL();
  
  // Screen and browser info
  const screenInfo = `${screen.width}x${screen.height}x${screen.colorDepth}`;
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const language = navigator.language;
  const platform = navigator.platform;
  const userAgent = navigator.userAgent;
  const cookieEnabled = navigator.cookieEnabled;
  const doNotTrack = navigator.doNotTrack;
  
  // WebGL fingerprinting
  let webglFingerprint = '';
  try {
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (gl) {
      const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
      if (debugInfo) {
        webglFingerprint = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) + 
                          gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
      }
    }
  } catch (e) {
    // WebGL not supported
  }
  
  // Audio context fingerprinting
  let audioFingerprint = '';
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const analyser = audioContext.createAnalyser();
    const gainNode = audioContext.createGain();
    
    oscillator.type = 'triangle';
    oscillator.frequency.value = 10000;
    gainNode.gain.value = 0.05;
    
    oscillator.connect(analyser);
    analyser.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.start(0);
    
    const frequencyData = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(frequencyData);
    
    audioFingerprint = Array.from(frequencyData).slice(0, 30).join(',');
    
    oscillator.stop();
    audioContext.close();
  } catch (e) {
    // Audio context not supported
  }
  
  // Combine all fingerprints
  const combinedFingerprint = [
    canvasFingerprint,
    screenInfo,
    timezone,
    language,
    platform,
    userAgent,
    cookieEnabled,
    doNotTrack,
    webglFingerprint,
    audioFingerprint
  ].join('|');
  
  // Create hash
  return btoa(combinedFingerprint).replace(/[^a-zA-Z0-9]/g, '').substring(0, 32);
}

// Store fingerprint in localStorage for persistence
export function getStoredDeviceFingerprint(): string {
  const stored = localStorage.getItem('deviceFingerprint');
  if (stored) {
    return stored;
  }
  
  const fingerprint = generateDeviceFingerprint();
  localStorage.setItem('deviceFingerprint', fingerprint);
  return fingerprint;
}