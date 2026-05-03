// ============================================================================
// ユーティリティ関数
// ============================================================================

function getScene() {
  return SCENES[currentSceneId];
}

function typeMessage(text, onComplete) {
  if (!messageTextEl) return;
  if (typingTimer) clearInterval(typingTimer);
  isTyping = true;
  displayedText = '';
  let i = 0;
  let typeCount = 0;
  typingTimer = setInterval(() => {
    displayedText += text.charAt(i);
    messageTextEl.textContent = displayedText;
    i++;
    typeCount++;
    // 3文字ごとにタイピング音
    if (typeCount % 3 === 0 && typeof SE !== 'undefined') SE.typing();
    if (i >= text.length) {
      clearInterval(typingTimer);
      isTyping = false;
      typeCount = 0;
      updateCursor();
      if (onComplete) onComplete();
    }
  }, 40);
}

function showMessage(text) {
  message = text;
  typeMessage(text);
}

// モノローグ表示（主人公の内面語り）
function showMonologue(text) {
  if (!messageTextEl || !messageWindowEl) return;
  if (monologueTimer) { clearTimeout(monologueTimer); monologueTimer = null; }
  messageWindowEl.classList.add('monologue-mode');
  message = `——${text}`;
  typeMessage(message, () => {
    // 少し経ったら通常スタイルに戻す
    monologueTimer = setTimeout(() => {
      if (messageWindowEl) messageWindowEl.classList.remove('monologue-mode');
    }, 2000);
  });
}

function updateCursor() {
  if (!messageTextEl) return;
  const existing = messageTextEl.querySelector('.cursor-blink');
  if (existing) existing.remove();
  if (!isTyping) {
    const cursor = document.createElement('span');
    cursor.className = 'cursor-blink';
    messageTextEl.appendChild(cursor);
  }
}

// ============================================================================
// シーン管理関数
// ============================================================================

function updateScene() {
  if (!sceneTitleEl || !bgImageEl) return;
  const scene = getScene();
  if (!scene) return;

  // 既存モノローグタイマーをキャンセル
  if (monologueTimer) { clearTimeout(monologueTimer); monologueTimer = null; }
  if (messageWindowEl) messageWindowEl.classList.remove('monologue-mode');

  sceneTitleEl.textContent = scene.title;
  bgImageEl.src = scene.bg;
  bgImageEl.alt = scene.title;
  activeCharacter = null;
  updateCharacterLayer();
  updateCommandPanel();

  if (scene.monologue) {
    // シーン説明 → 完了後800ms → モノローグ
    const sceneId = scene.id;
    message = scene.description;
    typeMessage(scene.description, () => {
      monologueTimer = setTimeout(() => {
        if (currentSceneId === sceneId) showMonologue(scene.monologue);
      }, 800);
    });
  } else {
    showMessage(scene.description);
  }
}

function updateCharacterLayer() {
  if (!characterLayerEl) return;
  characterLayerEl.innerHTML = '';

  const gameWindow = document.querySelector('.game-window');
  const msgLabel   = document.querySelector('.message-label');

  if (activeCharacter) {
    const char = CHARACTERS[activeCharacter];
    if (!char) return;

    // 背景暗転 + キャラ下配置
    if (gameWindow) gameWindow.classList.add('dialogue-active');

    // メッセージラベルにキャラ名を表示
    if (msgLabel) {
      msgLabel.textContent = char.name;
      msgLabel.classList.add('char-name');
    }

    const img = document.createElement('img');
    img.className = 'character-image';
    img.src = char.expressions[expression] || char.expressions['normal'];
    img.alt = activeCharacter;
    characterLayerEl.appendChild(img);
  } else {
    // キャラなし: 通常状態に戻す
    if (gameWindow) gameWindow.classList.remove('dialogue-active');
    if (msgLabel) {
      msgLabel.textContent = 'System Message';
      msgLabel.classList.remove('char-name');
    }
  }
}
