// ============================================================================
// ゲーム状態管理
// ============================================================================

let currentSceneId = 'washitsu';
let mode = 'menu';
let message = '';
let displayedText = '';
let inventory = ['police_badge'];
let activeCharacter = null;
let expression = 'normal';
let isTyping = false;
let typingTimer = null;
let showTitleScreen = true;
let solvedMysteries = 0;
let gameFlags = {};
let gameLog = [];
let investigatedSpots = new Set();

// Phase 1: 会話順次進行 / きく / つかう
let charTalkIndex = {};   // { charId: number } 各キャラの次に話すscriptインデックス
let selectedUseItem = null; // つかうコマンドで選択中のアイテムID
let askTarget = null;       // きくコマンドで選択中のキャラID

// Phase 2: モノローグ
let monologueTimer = null;  // シーン入室モノローグの遅延タイマー

// ============================================================================
// DOM要素の取得
// ============================================================================

// DOM要素の取得はDOMContentLoaded後に実行
let sceneTitleEl, bgImageEl, characterLayerEl, investigationLayerEl, messageTextEl, messageWindowEl, commandPanelEl;

function initDOMElements() {
  sceneTitleEl = document.getElementById('sceneTitle');
  bgImageEl = document.getElementById('bgImage');
  characterLayerEl = document.getElementById('characterLayer');
  investigationLayerEl = document.getElementById('investigationLayer');
  messageTextEl = document.getElementById('messageText');
  messageWindowEl = document.getElementById('messageWindow');
  commandPanelEl = document.getElementById('commandPanel');
  
  // DOM要素が取得できなかった場合のエラーチェック
  if (!sceneTitleEl || !bgImageEl || !characterLayerEl || !investigationLayerEl || 
      !messageTextEl || !messageWindowEl || !commandPanelEl) {
    console.error('DOM要素の取得に失敗しました');
    return false;
  }
  return true;
}

// DOMContentLoaded時に初期化
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initDOMElements);
} else {
  // 既に読み込み済みの場合
  initDOMElements();
}
