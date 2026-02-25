export class ProceduralAudio {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private volume: number = 1.0;

  // Metro running sound state
  private metroHumOsc: OscillatorNode | null = null;
  private metroHumGain: GainNode | null = null;
  private isMetroRunning: boolean = false;

  private initContext() {
    if (!this.ctx) {
      this.ctx = new (
        window.AudioContext ||
        (
          window as typeof window & {
            webkitAudioContext: typeof AudioContext;
          }
        ).webkitAudioContext
      )();

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = this.volume;
      this.masterGain.connect(this.ctx.destination);
    }

    if (this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }

  public setVolume(v: number) {
    this.volume = v;
    if (this.masterGain) {
      this.masterGain.gain.value = Math.max(0, Math.min(1, v));
    }
  }

  public getVolume() {
    return this.volume;
  }

  /**
   * Cash Register Jingle: Soft ascending chord (C5, E5, G5)
   */
  public playCashRegister() {
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    const t = this.ctx.currentTime;
    const notes = [523.25, 659.25, 783.99]; // C5, E5, G5

    notes.forEach((freq, i) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = "sine";
      osc.frequency.value = freq;

      gain.gain.setValueAtTime(0, t + i * 0.1);
      gain.gain.linearRampToValueAtTime(0.3, t + i * 0.1 + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.01, t + i * 0.1 + 0.5);

      osc.connect(gain);
      gain.connect(this.masterGain!);

      osc.start(t + i * 0.1);
      osc.stop(t + i * 0.1 + 0.6);
    });
  }

  /**
   * Metro Arriving: Gentle downward sweep to mimic braking
   */
  public playStationArrival() {
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "triangle";
    osc.frequency.setValueAtTime(400, t);
    osc.frequency.exponentialRampToValueAtTime(100, t + 1.0);

    const filter = this.ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 800;

    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.2, t + 0.1);
    gain.gain.linearRampToValueAtTime(0, t + 1.2);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + 1.3);
  }

  /**
   * Door Chime: Soft ding-dong (E5 to C5)
   */
  public playDoorChime() {
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(659.25, t); // E5
    osc.frequency.setValueAtTime(523.25, t + 0.4); // C5

    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.4, t + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.1, t + 0.35);
    gain.gain.setValueAtTime(0, t + 0.4);
    gain.gain.linearRampToValueAtTime(0.4, t + 0.45);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 1.0);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + 1.1);
  }

  /**
   * Hover sfx for UI
   */
  public playUIHover() {
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(800, t);

    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.1, t + 0.02);
    gain.gain.linearRampToValueAtTime(0, t + 0.1);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + 0.15);
  }

  /**
   * Click sfx for UI
   */
  public playUIClick() {
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "square";
    osc.frequency.setValueAtTime(400, t);
    osc.frequency.exponentialRampToValueAtTime(200, t + 0.05);

    const filter = this.ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(1000, t);
    filter.frequency.exponentialRampToValueAtTime(200, t + 0.05);

    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.15, t + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.1);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + 0.15);
  }

  /**
   * Continuous metro running loop based on game speed/activity.
   */
  public updateMetroHum(activeTrainsCount: number, speedFactor: number) {
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    if (activeTrainsCount > 0 && speedFactor > 0) {
      if (!this.isMetroRunning || !this.metroHumOsc || !this.metroHumGain) {
        // Start hum
        this.isMetroRunning = true;
        this.metroHumOsc = this.ctx.createOscillator();
        this.metroHumGain = this.ctx.createGain();

        this.metroHumOsc.type = "triangle";

        // Lowpass filter to muffle it
        const filter = this.ctx.createBiquadFilter();
        filter.type = "lowpass";
        filter.frequency.value = 300;

        this.metroHumGain.gain.setValueAtTime(0, this.ctx.currentTime);

        this.metroHumOsc.connect(filter);
        filter.connect(this.metroHumGain);
        this.metroHumGain.connect(this.masterGain);

        this.metroHumOsc.start();
      }

      // Modulate based on speed and count
      const targetVolume = Math.min(0.2 + activeTrainsCount * 0.02, 0.4);
      const targetFreq = 50 + speedFactor * 20; // Base rumble

      this.metroHumGain.gain.setTargetAtTime(
        targetVolume,
        this.ctx.currentTime,
        0.5,
      );
      this.metroHumOsc.frequency.setTargetAtTime(
        targetFreq,
        this.ctx.currentTime,
        0.5,
      );
    } else {
      if (this.isMetroRunning && this.metroHumGain) {
        // Fade out
        this.metroHumGain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.5);

        // Schedule stop
        if (this.metroHumOsc) {
          const oscToStop = this.metroHumOsc;
          setTimeout(() => {
            try {
              oscToStop.stop();
            } catch {
              // Ignore stopped oscillator error
            }
          }, 2000);
        }

        this.isMetroRunning = false;
        this.metroHumOsc = null;
        this.metroHumGain = null;
      }
    }
  }
}
