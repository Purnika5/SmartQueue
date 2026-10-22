export function playChime() {
  try {
    const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
    osc.frequency.setValueAtTime(880, audioCtx.currentTime + 0.15); // A5

    gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.6);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start();
    osc.stop(audioCtx.currentTime + 0.6);
  } catch {
    // AudioContext might be blocked until user interaction
  }
}

export function announceToken(tokenNumber: string, counterName: string, enabled = true) {
  if (!enabled) return;

  playChime();

  if ('speechSynthesis' in window) {
    setTimeout(() => {
      window.speechSynthesis.cancel();
      // Format token letters cleanly, e.g. "B 0 0 1"
      const formattedToken = tokenNumber.split('').join(' ');
      const text = `Token number ${formattedToken}, please proceed to ${counterName}`;
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.92;
      utterance.pitch = 1.05;
      utterance.lang = 'en-US';
      window.speechSynthesis.speak(utterance);
    }, 450);
  }
}
