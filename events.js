// ============================================================================
// イベントハンドラー関数
// ============================================================================

// ============================================================================
// キーボードナビゲーション
// ============================================================================

function handleKeyNavigation(e) {
  if (showTitleScreen) return;
  const buttons = Array.from(commandPanelEl?.querySelectorAll('button:not([disabled])') || []);
  if (buttons.length === 0) return;

  if (e.key === 'ArrowDown' || e.key === 's') {
    e.preventDefault();
    focusedCommandIndex = (focusedCommandIndex + 1) % buttons.length;
    buttons[focusedCommandIndex].focus();
    if (typeof SE !== 'undefined') SE.select();
  } else if (e.key === 'ArrowUp' || e.key === 'w') {
    e.preventDefault();
    focusedCommandIndex = (focusedCommandIndex - 1 + buttons.length) % buttons.length;
    buttons[focusedCommandIndex].focus();
    if (typeof SE !== 'undefined') SE.select();
  } else if (e.key === 'Enter') {
    e.preventDefault();
    buttons[focusedCommandIndex]?.click();
  } else if (e.key === 'Escape') {
    e.preventDefault();
    const cancelBtn = commandPanelEl?.querySelector('.cancel-button');
    if (cancelBtn) cancelBtn.click();
    else handleCommand(null);
  }
}

function handleCommand(cmdId) {
  // モノローグタイマーをキャンセル（コマンド操作が優先）
  if (monologueTimer) { clearTimeout(monologueTimer); monologueTimer = null; }
  if (messageWindowEl) messageWindowEl.classList.remove('monologue-mode');

  if (isTyping) {
    clearInterval(typingTimer);
    displayedText = message;
    messageTextEl.textContent = displayedText;
    isTyping = false;
    updateCursor();
    return;
  }

  const scene = getScene();
  switch (cmdId) {
    case 'talk':
      if (scene.persons.length === 0) {
        showMessage("周りには誰もいない。");
      } else {
        mode = 'talking';
        updateCommandPanel();
      }
      break;
    case 'ask':
      if (scene.persons.length === 0) {
        showMessage("周りには誰もいない。");
      } else if (scene.persons.length === 1) {
        askTarget = scene.persons[0];
        activeCharacter = askTarget;
        expression = 'normal';
        updateCharacterLayer();
        mode = 'asking_keyword';
        updateCommandPanel();
      } else {
        mode = 'asking';
        updateCommandPanel();
      }
      break;
    case 'look':
      mode = 'investigating';
      showMessage("どこを調べようか？");
      updateCommandPanel();
      updateInvestigationLayer();
      break;
    case 'use':
      if (inventory.length === 0) {
        showMessage("持ち物がない。");
      } else {
        mode = 'using';
        showMessage("何を使う？");
        updateCommandPanel();
      }
      break;
    case 'move':
      mode = 'moving';
      updateCommandPanel();
      break;
    case 'item':
      mode = 'item';
      updateCommandPanel();
      break;
    case 'log':
      mode = 'log';
      updateCommandPanel();
      break;
    case 'save':
      mode = 'save';
      updateCommandPanel();
      break;
    case 'load':
      mode = 'load';
      updateCommandPanel();
      break;
    default:
      mode = 'menu';
      updateCommandPanel();
  }
}

function handleSpotClick(spot) {
  showMessage(spot.discovery);
  addToLog(`[${getScene().title}] ${spot.label}: ${spot.discovery}`);
  investigatedSpots.add(spot.id);

  if (spot.triggerEvent) {
    triggerEvent(spot.triggerEvent);
  }

  if (spot.item && !inventory.includes(spot.item)) {
    inventory.push(spot.item);
    showItemPopup(spot.item);
    showEffect('light');
    if (typeof SE !== 'undefined') SE.itemGet();
    // アイテム取得フラグ
    if (spot.item === 'shovel')        gameFlags.has_shovel        = true;
    if (spot.item === 'cross_key')     gameFlags.has_cross_key     = true;
    if (spot.item === 'defaced_photo') gameFlags.found_defaced_photo = true;
    if (spot.item === 'old_letter')    gameFlags.found_old_letter  = true;
    addToLog(`[アイテム取得] ${ITEMS[spot.item].name}を手に入れた。`);
  } else if (spot.important) {
    showEffect('glitch');
    if (typeof SE !== 'undefined') SE.important();
  } else {
    showEffect('light', 0.3);
    if (typeof SE !== 'undefined') SE.discover();
  }

  mode = 'menu';
  updateCommandPanel();
  updateInvestigationLayer();
}

function handleTalk(charId) {
  const char = CHARACTERS[charId];
  activeCharacter = charId;

  // dog: 選択肢システム（変更なし）
  if (charId === 'dog') {
    const choiceScript = char.scripts.find(s => s.isChoice);
    if (choiceScript) {
      showMessage(`${char.name} ${choiceScript.text}`);
      showChoiceButtons();
      return;
    }
  }

  // 順次進行: charTalkIndex で次に話すscriptを管理
  if (charTalkIndex[charId] === undefined) charTalkIndex[charId] = 0;
  let idx = charTalkIndex[charId];

  // requireFlag が未達成の script はスキップ
  while (idx < char.scripts.length) {
    const s = char.scripts[idx];
    if (!s.requireFlag || gameFlags[s.requireFlag]) break;
    idx++;
  }

  if (idx >= char.scripts.length) {
    showMessage(`${char.name} 「……もうお話しすることはございません。」`);
    expression = 'normal';
    updateCharacterLayer();
    mode = 'menu';
    updateCommandPanel();
    return;
  }

  const script = char.scripts[idx];
  charTalkIndex[charId] = idx + 1; // 次回はここから

  expression = script.emotion || 'normal';
  showMessage(`${char.name} ${script.text}`);
  addToLog(`[${char.name}] ${script.text}`);

  // メイドの自白チェック
  if (charId === 'maid' && script.requireFlag === 'found_body') {
    gameFlags.maid_confessed = true;
    addToLog("[自白] メイドが犯行を認めた。");
    checkMaidConfession();
  }

  updateCharacterLayer();
  mode = 'menu';
  updateCommandPanel();
}

// ============================================================================
// きく: キャラ選択 → キーワード選択 → 応答
// ============================================================================

function handleAskChar(charId) {
  askTarget = charId;
  activeCharacter = charId;
  expression = 'normal';
  updateCharacterLayer();
  mode = 'asking_keyword';
  updateCommandPanel();
}

function handleAskKeyword(keyword) {
  const char = CHARACTERS[askTarget];
  if (!char || !char.keywords || !char.keywords[keyword]) {
    showMessage(`${char ? char.name : '？'} 「……それについては何も。」`);
    mode = 'menu';
    updateCommandPanel();
    return;
  }

  const kwData = char.keywords[keyword];

  if (kwData.requireFlag && !gameFlags[kwData.requireFlag]) {
    showMessage(`${char.name} 「……それについては何も。」`);
    mode = 'menu';
    updateCommandPanel();
    return;
  }

  expression = kwData.emotion || 'normal';
  showMessage(`${char.name} ${kwData.text}`);
  if (kwData.triggerFlag)  gameFlags[kwData.triggerFlag] = true;
  if (kwData.triggerEvent) triggerEvent(kwData.triggerEvent);
  addToLog(`[${char.name}に聞いた: ${keyword}] ${kwData.text}`);
  updateCharacterLayer();
  mode = 'menu';
  updateCommandPanel();
}

// ============================================================================
// つかう: アイテム選択 → 対象選択 → 応答
// ============================================================================

function handleUseItem(itemId) {
  selectedUseItem = itemId;
  showMessage(`「${ITEMS[itemId].name}」を使う相手を選んでください。`);
  mode = 'using_target';
  updateCommandPanel();
}

function handleUseOnSpot(spot) {
  const item = selectedUseItem;
  selectedUseItem = null;

  if (spot.usableWith && spot.usableWith[item]) {
    const data = spot.usableWith[item];
    showMessage(data.text);
    showEffect('light');
    if (typeof SE !== 'undefined') SE.itemGet();
    if (data.triggerFlag)  gameFlags[data.triggerFlag] = true;
    if (data.triggerEvent) triggerEvent(data.triggerEvent);
    addToLog(`[つかう] ${ITEMS[item].name} × ${spot.label}: ${data.text}`);
  } else {
    showMessage(`「${spot.label}」には使えないようだ。`);
    if (typeof SE !== 'undefined') SE.select();
  }

  mode = 'menu';
  updateCommandPanel();
  updateInvestigationLayer();
}

function handleUseOnChar(charId) {
  const item = selectedUseItem;
  selectedUseItem = null;
  const char = CHARACTERS[charId];

  if (char.usableWith && char.usableWith[item]) {
    const data = char.usableWith[item];
    activeCharacter = charId;
    expression = data.emotion || 'normal';
    showMessage(`${char.name} ${data.text}`);
    showEffect('light');
    if (data.triggerFlag)  gameFlags[data.triggerFlag] = true;
    if (data.triggerEvent) triggerEvent(data.triggerEvent);
    addToLog(`[つかう] ${ITEMS[item].name} → ${char.name}: ${data.text}`);
    updateCharacterLayer();
  } else {
    showMessage(`${char.name} 「……？」`);
    if (typeof SE !== 'undefined') SE.select();
  }

  mode = 'menu';
  updateCommandPanel();
}

function showChoiceButtons() {
  const container = document.createElement('div');
  container.style.display = 'flex';
  container.style.flexDirection = 'column';
  container.style.gap = '8px';
  container.style.padding = '8px';
  
  const btn1 = document.createElement('button');
  btn1.className = 'talk-button';
  btn1.textContent = '1. なだめる';
  btn1.onclick = () => handleChoice(1);
  container.appendChild(btn1);
  
  const btn2 = document.createElement('button');
  btn2.className = 'talk-button';
  btn2.textContent = '2. 強行突破';
  btn2.onclick = () => handleChoice(2);
  container.appendChild(btn2);
  
  commandPanelEl.innerHTML = '';
  commandPanelEl.appendChild(container);
}

function handleChoice(choiceId) {
  if (currentSceneId === 'night' && choiceId === 2) {
    showEffect('glitch');
    showMessage("ドーベルマンに襲われた！ GAME OVER");
    setTimeout(() => location.reload(), 3000); // 失敗でリロード
  } else {
    showMessage("ドーベルマンは静かになった。");
    solvedMysteries++;
    mode = 'menu';
    updateCommandPanel();
  }
}

function handleMove(nextId) {
  if (typeof SE !== 'undefined') SE.move();
  // 白フラッシュ → 少し待ってからシーン切り替え
  showEffect('flash');
  setTimeout(() => {
    currentSceneId = nextId;
    mode = 'menu';
    updateScene();
  }, 300);
}

// ============================================================================
// イベント処理関数
// ============================================================================

function triggerEvent(eventId) {
  switch (eventId) {
    case 'cat_move':
      gameFlags.found_cat = true;
      break;
    case 'unlock_basement':
      gameFlags.basement_unlocked = true;
      break;
    case 'open_box':
      // 後方互換：直接調べた場合（cross_keyなし）
      gameFlags.box_opened = true;
      break;
    case 'open_box_with_key':
      // つかう経由: cross_key × 小箱
      gameFlags.box_opened = true;
      if (!inventory.includes('treasure_map')) {
        inventory.push('treasure_map');
        showItemPopup('treasure_map');
        showEffect('light');
        if (typeof SE !== 'undefined') SE.itemGet();
        addToLog("[アイテム取得] 古い紙切れを手に入れた。");
      }
      break;
    case 'dig_hole':
      if (inventory.includes('shovel')) {
        if (!inventory.includes('skeleton')) {
          inventory.push('skeleton');
          showItemPopup('skeleton');
          gameFlags.found_body = true;
          showEffect('glitch');
          showMessage("遺体を発見した！");
          addToLog("[重大発見] 庭に埋められていた遺体を発見した！");
          // エンディング判定
          checkEnding();
        }
      } else {
        showMessage("ショベルが必要だ。");
      }
      break;
  }
}
