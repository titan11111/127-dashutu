// ============================================================================
// タイトル画面処理
// ============================================================================

let titleScreenEl, titlePromptEl;

function startGame() {
  if (titleScreenEl) {
    titleScreenEl.classList.add('hidden');
  }
  showTitleScreen = false;
  // ゲーム開始ログ
  addToLog("[ゲーム開始] 探偵として事件の調査を開始した。");
  updateScene();
}

function setupTitleScreen() {
  titleScreenEl = document.getElementById('titleScreen');
  titlePromptEl = document.getElementById('titlePrompt');

  // タイトル画面をクリック/タップでゲーム開始
  if (titleScreenEl) {
    titleScreenEl.addEventListener('click', startGame);
    titleScreenEl.addEventListener('touchend', (e) => {
      e.preventDefault();
      startGame();
    });
  }

  // キーボード操作（タイトル開始 + ゲーム中ナビ）
  document.addEventListener('keydown', (e) => {
    if (showTitleScreen && (e.key === 'Enter' || e.key === ' ')) {
      startGame();
    } else if (!showTitleScreen) {
      handleKeyNavigation(e);
    }
  });
}

// ============================================================================
// レイアウト調整関数
// ============================================================================

function setViewportHeight() {
  const vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--vh', `${vh}px`);
}

function adjustLayout() {
  const container = document.querySelector('.container');
  const header = document.querySelector('.header');
  const footer = document.querySelector('.footer');
  const uiPanel = document.querySelector('.ui-panel');
  const gameWindow = document.querySelector('.game-window');
  
  if (!container || !header || !footer || !uiPanel || !gameWindow) return;
  
  // コンテナの利用可能な高さを取得
  const containerHeight = container.offsetHeight;
  const headerHeight = header.offsetHeight;
  const footerHeight = footer.offsetHeight;
  const uiPanelHeight = uiPanel.offsetHeight;
  const gap = 4; // gap between sections
  
  // ゲームウィンドウの利用可能な高さを計算
  const availableHeight = containerHeight - headerHeight - footerHeight - uiPanelHeight - (gap * 3);
  
  if (window.innerWidth >= 768) {
    // デスクトップ: アスペクト比を維持（CSSで制御）
    gameWindow.style.maxHeight = '';
  } else {
    // モバイル/タブレット: 利用可能な高さを適用
    if (availableHeight > 0) {
      gameWindow.style.maxHeight = `${availableHeight}px`;
    }
  }
}

// ============================================================================
// イベントリスナー
// ============================================================================

function setupEventListeners() {
  if (messageWindowEl) {
    messageWindowEl.addEventListener('click', () => {
      if (isTyping) {
        handleCommand(null);
      }
    });

    // iOS touch event support
    messageWindowEl.addEventListener('touchend', (e) => {
      e.preventDefault();
      if (isTyping) {
        handleCommand(null);
      }
    });
  }

  // アイテムポップアップの外側をクリックで閉じる
  document.addEventListener('click', (e) => {
    const popup = document.getElementById('itemPopup');
    if (popup && popup.classList.contains('show') && !popup.contains(e.target)) {
      closeItemPopup();
    }
  });

  // Prevent iOS double-tap zoom
  let lastTouchEnd = 0;
  document.addEventListener('touchend', (e) => {
    const now = Date.now();
    if (now - lastTouchEnd <= 300) {
      e.preventDefault();
    }
    lastTouchEnd = now;
  }, false);

  // Prevent iOS pull-to-refresh
  document.addEventListener('touchmove', (e) => {
    if (e.touches.length > 1) {
      e.preventDefault();
    }
  }, { passive: false });
}

// ============================================================================
// 初期化
// ============================================================================

function initGame() {
  // DOM要素が初期化されているか確認
  if (!sceneTitleEl || !bgImageEl || !messageWindowEl || !commandPanelEl) {
    console.error('DOM要素が初期化されていません');
    return;
  }

  // タイトル画面の設定
  setupTitleScreen();

  // イベントリスナーの設定
  setupEventListeners();

  // セーブデータの自動ロード（オプション）
  // コメントアウトを外すと、ページ読み込み時に自動でロードされます
  // if (loadGameData()) {
  //   loadGame();
  //   updateScene();
  // }

  setViewportHeight();
  adjustLayout();

  window.addEventListener('resize', () => {
    setViewportHeight();
    setTimeout(adjustLayout, 100);
  });

  window.addEventListener('orientationchange', () => {
    setTimeout(() => {
      setViewportHeight();
      adjustLayout();
    }, 200);
  });

  if (!showTitleScreen) {
    updateScene();
  }

  // レイアウト調整を再度実行（画像読み込み後）
  window.addEventListener('load', () => {
    setTimeout(adjustLayout, 100);
  });

  // 画像読み込み後にレイアウト調整
  if (bgImageEl) {
    bgImageEl.addEventListener('load', adjustLayout);
  }
}

// DOM要素の初期化を待ってからゲームを初期化
function initialize() {
  // DOM要素の初期化
  if (typeof initDOMElements === 'function') {
    if (initDOMElements()) {
      initGame();
    } else {
      console.error('DOM要素の初期化に失敗しました');
    }
  } else {
    console.error('initDOMElements関数が見つかりません');
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initialize);
} else {
  // 既に読み込み済みの場合
  setTimeout(initialize, 10);
}