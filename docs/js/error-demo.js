// === Error Accumulation Demo ===

class ErrorDemo {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) return;
    this.setup();
  }

  setup() {
    this.container.innerHTML = `
      <div class="demo-controls">
        <button id="err-start">Start</button>
        <button id="err-pause">Pause</button>
        <button id="err-reset">Reset</button>
        <label>Speed: <input type="range" id="err-speed" min="1" max="20" value="5"></label>
        <label>Noise: <input type="range" id="err-noise" min="1" max="30" value="8"></label>
      </div>
      <div class="error-demo">
        <div class="error-track">
          <h5>Continuous Memory (ℝ)</h5>
          <canvas id="err-cont-canvas" width="340" height="180"></canvas>
          <div class="error-stats">
            <span>Steps: <strong id="err-cont-steps">0</strong></span>
            <span>Error: <strong id="err-cont-err">0.000</strong></span>
          </div>
        </div>
        <div class="error-track">
          <h5>Hierarchical Memory (T₂)</h5>
          <canvas id="err-hier-canvas" width="340" height="180"></canvas>
          <div class="error-stats">
            <span>Steps: <strong id="err-hier-steps">0</strong></span>
            <span>Error: <strong id="err-hier-err">No error</strong></span>
          </div>
        </div>
      </div>
    `;

    this.contCanvas = document.getElementById('err-cont-canvas');
    this.hierCanvas = document.getElementById('err-hier-canvas');
    this.contCtx = this.contCanvas.getContext('2d');
    this.hierCtx = this.hierCanvas.getContext('2d');

    this.running = false;
    this.paused = false;
    this.timer = null;

    // Continuous: target is center of canvas
    this.contTarget = 0;
    this.contValue = 0;
    this.contHistory = [];

    // Hierarchical: track cluster depth
    this.hierDepth = 3; // encoding depth
    this.hierState = '000'; // current state (first D digits)
    this.hierHistory = [];
    this.hierErrorCount = 0;

    this.stepCount = 0;
    this.maxHistory = 300;

    document.getElementById('err-start').addEventListener('click', () => this.start());
    document.getElementById('err-pause').addEventListener('click', () => this.pause());
    document.getElementById('err-reset').addEventListener('click', () => this.reset());
    document.getElementById('err-speed').addEventListener('input', (e) => {
      if (this.running && !this.paused) {
        clearInterval(this.timer);
        this.timer = setInterval(() => this.step(), 1000 / parseInt(e.target.value));
      }
    });

    this.drawBoth();
  }

  start() {
    if (this.running && !this.paused) return;
    this.running = true;
    this.paused = false;
    const speed = parseInt(document.getElementById('err-speed').value);
    this.timer = setInterval(() => this.step(), 1000 / speed);
  }

  pause() {
    this.paused = true;
    clearInterval(this.timer);
  }

  reset() {
    clearInterval(this.timer);
    this.running = false;
    this.paused = false;
    this.stepCount = 0;
    this.contValue = 0;
    this.contHistory = [];
    this.hierState = '000';
    this.hierHistory = [];
    this.hierErrorCount = 0;
    document.getElementById('err-cont-steps').textContent = '0';
    document.getElementById('err-cont-err').textContent = '0.000';
    document.getElementById('err-hier-steps').textContent = '0';
    document.getElementById('err-hier-err').textContent = 'No error';
    this.drawBoth();
  }

  step() {
    this.stepCount++;
    const noiseAmp = parseInt(document.getElementById('err-noise').value) / 50;

    // Continuous: random walk
    const contNoise = (Math.random() - 0.5) * 2 * noiseAmp;
    this.contValue += contNoise;
    this.contHistory.push(this.contValue);
    if (this.contHistory.length > this.maxHistory) this.contHistory.shift();

    // Hierarchical: threshold-based
    // A perturbation at depth k changes a digit at that depth
    // Small perturbations (deep) don't affect logical state
    const hierNoise = Math.random() * noiseAmp * 5; // scale to barrier heights
    const barrierD = Math.pow(2, -this.hierDepth); // barrier at encoding depth
    const barrierD1 = Math.pow(2, -(this.hierDepth - 1)); // barrier at depth D-1

    if (hierNoise > barrierD) {
      // Perturbation exceeds depth-D barrier - might change logical state
      if (hierNoise > barrierD1) {
        // Exceeds shallower barrier - definite logical error
        this.hierErrorCount++;
        this.hierState = this.hierState[0] === '0' ? '1' + this.hierState.slice(1) : '0' + this.hierState.slice(1);
      }
      // else: jitter within the cluster, no logical change
    }
    this.hierHistory.push(this.hierErrorCount);
    if (this.hierHistory.length > this.maxHistory) this.hierHistory.shift();

    // Update UI
    document.getElementById('err-cont-steps').textContent = this.stepCount;
    document.getElementById('err-cont-err').textContent = Math.abs(this.contValue).toFixed(3);
    document.getElementById('err-hier-steps').textContent = this.stepCount;
    document.getElementById('err-hier-err').textContent = this.hierErrorCount > 0
      ? `Error! (×${this.hierErrorCount})`
      : 'No error';

    this.drawBoth();
  }

  drawBoth() {
    this.drawTrack(this.contCtx, this.contHistory, 0, 'cont', '#f87171');
    this.drawTrack(this.hierCtx, this.hierHistory, 0, 'hier', '#4ade80');
  }

  drawTrack(ctx, history, target, type, color) {
    const w = ctx.canvas.width;
    const h = ctx.canvas.height;
    ctx.clearRect(0, 0, w, h);

    // Background
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.fillRect(0, 0, w, h);

    // Center line (target)
    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 6]);
    ctx.beginPath();
    ctx.moveTo(0, h / 2);
    ctx.lineTo(w, h / 2);
    ctx.stroke();
    ctx.setLineDash([]);

    // Threshold lines for hierarchical
    if (type === 'hier') {
      ctx.strokeStyle = 'rgba(74,222,128,0.15)';
      ctx.lineWidth = 1;
      ctx.setLineDash([2, 4]);
      for (let t = 0.5; t < 3; t += 0.5) {
        const yUp = h / 2 - t * 30;
        const yDown = h / 2 + t * 30;
        if (yUp > 0) {
          ctx.beginPath(); ctx.moveTo(0, yUp); ctx.lineTo(w, yUp); ctx.stroke();
        }
        if (yDown < h) {
          ctx.beginPath(); ctx.moveTo(0, yDown); ctx.lineTo(w, yDown); ctx.stroke();
        }
      }
      ctx.setLineDash([]);
    }

    if (history.length < 2) return;

    // Draw path
    const xScale = w / this.maxHistory;
    const yScale = type === 'cont' ? 30 : 30;

    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    ctx.beginPath();

    for (let i = 0; i < history.length; i++) {
      const x = i * xScale;
      const val = history[i];
      const y = type === 'cont'
        ? h / 2 - val * yScale
        : h / 2 - Math.min(val, 3) * 25;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Error markers for hierarchical
    if (type === 'hier' && history.length > 0) {
      const lastVal = history[history.length - 1];
      if (lastVal > 0) {
        const x = (history.length - 1) * xScale;
        const y = h / 2 - Math.min(lastVal, 3) * 25;
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('error-demo-container')) {
    window.errorDemo = new ErrorDemo('error-demo-container');
  }
});
