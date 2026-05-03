// ============================================================================
// Web Audio API 8bit サウンドシステム
// ============================================================================

const AudioCtx = window.AudioContext || window.webkitAudioContext;
let audioCtx = null;
let masterGain = null;
let bgmGain = null;
let bgmSchedulerId = null;
let bgmStep = 0;
let bgmNextTime = 0;
let audioEnabled = false;

function initAudio() {
  if (audioCtx) return;
  try {
    audioCtx = new AudioCtx();
    masterGain = audioCtx.createGain();
    masterGain.gain.value = 0.6;
    masterGain.connect(audioCtx.destination);
    bgmGain = audioCtx.createGain();
    bgmGain.gain.value = 0.3;
    bgmGain.connect(masterGain);
    audioEnabled = true;
    startBGM();
  } catch(e) {
    console.warn('Audio init failed:', e);
  }
}

// ユーザー操作後に初期化（ブラウザ制限回避）
document.addEventListener('click',    () => { if (!audioCtx) initAudio(); }, { once: true });
document.addEventListener('touchend', () => { if (!audioCtx) initAudio(); }, { once: true });
document.addEventListener('keydown',  () => { if (!audioCtx) initAudio(); }, { once: true });

// ============================================================================
// 低レベル：単音再生
// ============================================================================

function playNote(freq, type, duration, vol, delay = 0) {
  if (!audioEnabled || !audioCtx) return;
  const t = audioCtx.currentTime + delay;
  const osc  = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0, t);
  gain.gain.linearRampToValueAtTime(vol, t + 0.005);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);
  osc.connect(gain);
  gain.connect(masterGain);
  osc.start(t);
  osc.stop(t + duration + 0.02);
}

// ============================================================================
// SE（効果音）
// ============================================================================

const SE = {
  // タイピング音（3文字に1回呼ぶこと）
  typing() {
    if (!audioEnabled || !audioCtx) return;
    const freqs = [330, 370, 392, 440, 494];
    playNote(freqs[Math.floor(Math.random() * freqs.length)], 'square', 0.04, 0.035);
  },

  // 通常調査発見音
  discover() {
    [[523, 0, 0.14], [659, 0.12, 0.14], [784, 0.24, 0.18]]
      .forEach(([f, d, dur]) => playNote(f, 'square', dur, 0.1, d));
  },

  // 重要発見音（ドラマチックスティング）
  important() {
    playNote(110, 'sawtooth', 0.25, 0.15, 0.00);
    playNote(880, 'square',   0.12, 0.12, 0.05);
    playNote(1047,'square',   0.10, 0.10, 0.18);
    playNote(880, 'square',   0.10, 0.08, 0.30);
  },

  // アイテム取得ファンファーレ
  itemGet() {
    const m = [
      [523, 0.00, 0.12], [659, 0.12, 0.12], [784, 0.24, 0.12],
      [1047,0.36, 0.22], [784, 0.58, 0.10], [1047,0.68, 0.38]
    ];
    m.forEach(([f, d, dur]) => playNote(f, 'square', dur, 0.14, d));
  },

  // シーン移動音
  move() {
    if (!audioEnabled || !audioCtx) return;
    const osc  = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(200, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(600, audioCtx.currentTime + 0.15);
    gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.2);
    osc.connect(gain); gain.connect(masterGain);
    osc.start(); osc.stop(audioCtx.currentTime + 0.22);
  },

  // コマンド選択音
  select() {
    playNote(660, 'square', 0.07, 0.08);
  },

  // ゲームオーバー音
  gameover() {
    [[440,0.00,0.2],[370,0.22,0.2],[311,0.44,0.2],[220,0.66,0.55]]
      .forEach(([f, d, dur]) => playNote(f, 'square', dur, 0.13, d));
  },

  // エンディングファンファーレ（BGMを止めてから呼ぶ）
  ending() {
    stopBGM();
    const m = [
      [523, 0.0, 0.14], [659, 0.14, 0.14], [784, 0.28, 0.14],
      [1047,0.42, 0.28],[784, 0.72, 0.10], [880, 0.82, 0.10],
      [1047,0.92, 0.60],[784, 1.56, 0.14], [880, 1.70, 0.14],
      [1047,1.84, 0.14],[1175,1.98, 0.60],[1047,2.60, 0.14],
      [1175,2.74, 0.14],[1319,2.88, 0.90],
    ];
    m.forEach(([f, d, dur]) => playNote(f, 'square', dur, 0.16, d));
  }
};

// ============================================================================
// BGM（ルックアヘッドスケジューラー方式）
// ============================================================================

// Am ペンタトニック雰囲気の16ステップパターン
const BGM_BASS = [
  110, 0,   110,  0,   138,  0,   110,  0,
  110, 0,   138,  165, 110,  0,   0,    138,
];
const BGM_MEL = [
  0,   0,   440,  0,   0,    0,   493,  0,
  0,   523, 0,    0,   440,  0,   0,    0,
];
const BGM_STEP_DUR = 0.28; // 秒/ステップ

function scheduleBGMBeat() {
  if (!audioEnabled || !audioCtx) return;
  while (bgmNextTime < audioCtx.currentTime + 0.15) {
    const idx = bgmStep % BGM_BASS.length;
    const delay = bgmNextTime - audioCtx.currentTime;

    if (BGM_BASS[idx] > 0) {
      playNote(BGM_BASS[idx], 'square', BGM_STEP_DUR * 0.65, 0.045, delay);
    }
    if (BGM_MEL[idx] > 0) {
      playNote(BGM_MEL[idx], 'triangle', BGM_STEP_DUR * 1.4, 0.025, delay);
    }
    bgmStep++;
    bgmNextTime += BGM_STEP_DUR;
  }
}

function startBGM() {
  if (!audioEnabled || bgmSchedulerId) return;
  bgmStep = 0;
  bgmNextTime = audioCtx.currentTime + 0.1;
  scheduleBGMBeat();
  bgmSchedulerId = setInterval(scheduleBGMBeat, 50);
}

function stopBGM() {
  if (bgmSchedulerId) {
    clearInterval(bgmSchedulerId);
    bgmSchedulerId = null;
  }
}
