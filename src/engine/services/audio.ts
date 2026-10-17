class SoundManager {
  private ctx: AudioContext | null = null;
  private masterVolume: number = 0.8;
  private sfxVolume: number = 0.8;
  private ambientVolume: number = 0.5;

  constructor() {
    if (typeof window !== 'undefined') {
      const savedMaster = localStorage.getItem('faith_tribe_master_volume') ?? localStorage.getItem('agape_master_volume');
      if (savedMaster !== null) this.masterVolume = parseFloat(savedMaster);

      const savedSfx = localStorage.getItem('faith_tribe_sfx_volume') ?? localStorage.getItem('agape_sfx_volume');
      if (savedSfx !== null) this.sfxVolume = parseFloat(savedSfx);

      const savedAmbient = localStorage.getItem('faith_tribe_ambient_volume') ?? localStorage.getItem('agape_ambient_volume');
      if (savedAmbient !== null) this.ambientVolume = parseFloat(savedAmbient);
    }
  }

  setMasterVolume(val: number) {
    this.masterVolume = Math.max(0, Math.min(1, val));
    if (typeof window !== 'undefined') {
      localStorage.setItem('faith_tribe_master_volume', String(this.masterVolume));
    }
  }

  getMasterVolume(): number {
    return this.masterVolume;
  }

  setSfxVolume(val: number) {
    this.sfxVolume = Math.max(0, Math.min(1, val));
    if (typeof window !== 'undefined') {
      localStorage.setItem('faith_tribe_sfx_volume', String(this.sfxVolume));
    }
  }

  getSfxVolume(): number {
    return this.sfxVolume;
  }

  setAmbientVolume(val: number) {
    this.ambientVolume = Math.max(0, Math.min(1, val));
    if (typeof window !== 'undefined') {
      localStorage.setItem('faith_tribe_ambient_volume', String(this.ambientVolume));
    }
  }

  getAmbientVolume(): number {
    return this.ambientVolume;
  }

  private getEffectiveGain(baseGain: number): number {
    return baseGain * this.masterVolume * this.sfxVolume;
  }

  private initCtx() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  playTick(enabled: boolean = true) {
    if (!enabled || this.masterVolume <= 0 || this.sfxVolume <= 0) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, this.ctx.currentTime);
      const effective = this.getEffectiveGain(0.08);
      gain.gain.setValueAtTime(effective, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.05);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.06);
    } catch {
      // AudioContext unavailable
    }
  }

  playChime(enabled: boolean = true) {
    if (!enabled || this.masterVolume <= 0 || this.sfxVolume <= 0) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      [523.25, 659.25, 783.99].forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);
        const effective = this.getEffectiveGain(0.12);
        gain.gain.setValueAtTime(effective, now + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.08 + 0.4);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 0.45);
      });
    } catch {
      // AudioContext unavailable
    }
  }

  playBuzzer(enabled: boolean = true) {
    if (!enabled || this.masterVolume <= 0 || this.sfxVolume <= 0) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.exponentialRampToValueAtTime(80, now + 0.35);
      const effective = this.getEffectiveGain(0.15);
      gain.gain.setValueAtTime(effective, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.36);
    } catch {
      // AudioContext unavailable
    }
  }
}

export const soundManager = new SoundManager();
