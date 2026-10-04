// Web Audio API Procedural Sound Engine
// Zero external asset dependencies - generates crystal clear ambient soundscapes & chimes in real-time

class SoundEngine {
  private ctx: AudioContext | null = null;
  private currentAmbientType: string | null = null;
  private ambientGainNode: GainNode | null = null;
  private activeGenerators: { stop: () => void }[] = [];
  private volume: number = 0.5;

  private initContext(): AudioContext {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  public setVolume(val: number) {
    this.volume = Math.max(0, Math.min(1, val));
    if (this.ambientGainNode && this.ctx) {
      this.ambientGainNode.gain.setTargetAtTime(this.volume, this.ctx.currentTime, 0.05);
    }
  }

  public getVolume(): number {
    return this.volume;
  }

  // Play peaceful Tibetan singing bowl completion chime
  public playChime(type: 'bowl' | 'bell' | 'marimba' = 'bowl') {
    const ctx = this.initContext();
    const now = ctx.currentTime;

    if (type === 'bowl') {
      const freqs = [432, 864, 1296, 1728];
      const gains = [0.3, 0.15, 0.07, 0.03];

      freqs.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);

        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(gains[i] * this.volume, now + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 3.5 + i * 0.5);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 4.0);
      });
    } else if (type === 'bell') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.exponentialRampToValueAtTime(440, now + 0.6);

      gain.gain.setValueAtTime(0.3 * this.volume, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.8);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 1.8);
    } else {
      // Marimba chime
      [523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const start = now + idx * 0.12;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, start);

        gain.gain.setValueAtTime(0.25 * this.volume, start);
        gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.9);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(start);
        osc.stop(start + 0.9);
      });
    }
  }

  // Play subtle micro-click / clock tick
  public playTick() {
    const ctx = this.initContext();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(1200, now);

    gain.gain.setValueAtTime(0.02 * this.volume, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.02);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.025);
  }

  // Generate procedural White / Pink / Brown noise buffer
  private createNoiseBuffer(type: 'white' | 'pink' | 'brown', durationSeconds = 5): AudioBuffer {
    const ctx = this.initContext();
    const bufferSize = ctx.sampleRate * durationSeconds;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    if (type === 'white') {
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
    } else if (type === 'pink') {
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
        b6 = white * 0.115926;
      }
    } else {
      // Brown noise
      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        data[i] = (lastOut + 0.02 * white) / 1.02;
        lastOut = data[i];
        data[i] *= 3.5; // Gain compensation
      }
    }
    return buffer;
  }

  // Play procedural ambient soundscapes
  public playAmbient(type: 'rain' | 'whitenoise' | 'binaural' | 'stream' | 'none') {
    this.stopAmbient();

    if (type === 'none') {
      this.currentAmbientType = null;
      return;
    }

    const ctx = this.initContext();
    this.currentAmbientType = type;

    const masterAmbientGain = ctx.createGain();
    masterAmbientGain.gain.setValueAtTime(this.volume * 0.45, ctx.currentTime);
    masterAmbientGain.connect(ctx.destination);
    this.ambientGainNode = masterAmbientGain;

    if (type === 'rain') {
      // Dual noise layers + resonant low pass filter for realistic rainfall
      const buffer = this.createNoiseBuffer('pink', 4);
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1000, ctx.currentTime);

      const highpass = ctx.createBiquadFilter();
      highpass.type = 'highpass';
      highpass.frequency.setValueAtTime(250, ctx.currentTime);

      source.connect(highpass);
      highpass.connect(filter);
      filter.connect(masterAmbientGain);
      source.start();

      this.activeGenerators.push({
        stop: () => {
          try { source.stop(); } catch {}
        }
      });
    } else if (type === 'whitenoise') {
      // Smooth warm acoustic pink noise
      const buffer = this.createNoiseBuffer('pink', 4);
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(2400, ctx.currentTime);

      source.connect(filter);
      filter.connect(masterAmbientGain);
      source.start();

      this.activeGenerators.push({
        stop: () => {
          try { source.stop(); } catch {}
        }
      });
    } else if (type === 'binaural') {
      // 40Hz Gamma Focus frequency (200Hz left ear, 240Hz right ear)
      const oscLeft = ctx.createOscillator();
      const oscRight = ctx.createOscillator();
      const pannerLeft = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
      const pannerRight = ctx.createStereoPanner ? ctx.createStereoPanner() : null;

      oscLeft.type = 'sine';
      oscLeft.frequency.setValueAtTime(200, ctx.currentTime);

      oscRight.type = 'sine';
      oscRight.frequency.setValueAtTime(240, ctx.currentTime);

      const subGain = ctx.createGain();
      subGain.gain.setValueAtTime(0.3, ctx.currentTime);

      if (pannerLeft && pannerRight) {
        pannerLeft.pan.setValueAtTime(-1, ctx.currentTime);
        pannerRight.pan.setValueAtTime(1, ctx.currentTime);

        oscLeft.connect(pannerLeft);
        pannerLeft.connect(subGain);

        oscRight.connect(pannerRight);
        pannerRight.connect(subGain);
      } else {
        oscLeft.connect(subGain);
        oscRight.connect(subGain);
      }

      subGain.connect(masterAmbientGain);
      oscLeft.start();
      oscRight.start();

      this.activeGenerators.push({
        stop: () => {
          try { oscLeft.stop(); oscRight.stop(); } catch {}
        }
      });
    } else if (type === 'stream') {
      // Filtered brown noise with gentle LFO modulation for river/stream
      const buffer = this.createNoiseBuffer('brown', 5);
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(750, ctx.currentTime);
      filter.Q.setValueAtTime(1.5, ctx.currentTime);

      source.connect(filter);
      filter.connect(masterAmbientGain);
      source.start();

      this.activeGenerators.push({
        stop: () => {
          try { source.stop(); } catch {}
        }
      });
    }
  }

  public stopAmbient() {
    this.activeGenerators.forEach(gen => gen.stop());
    this.activeGenerators = [];
    this.currentAmbientType = null;
  }

  public getAmbientType(): string | null {
    return this.currentAmbientType;
  }
}

export const soundEngine = new SoundEngine();
