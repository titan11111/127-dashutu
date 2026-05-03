// ============================================================================
// UI更新関数
// ============================================================================

let focusedCommandIndex = 0;

function updateCommandPanel() {
  if (!commandPanelEl) return;
  commandPanelEl.innerHTML = '';
  focusedCommandIndex = 0;

  if (mode === 'menu') {
    COMMANDS.forEach(cmd => {
      const btn = document.createElement('button');
      btn.className = 'command-button';
      btn.innerHTML = `
        <span>${cmd.label}</span>
        <span class="command-arrow">▶</span>
      `;
      btn.onclick = () => handleCommand(cmd.id);
      commandPanelEl.appendChild(btn);
    });
  } else if (mode === 'asking') {
    // きく: シーンに複数人いる場合のキャラ選択
    const scene = getScene();
    const container = document.createElement('div');
    container.style.cssText = 'display:flex;flex-direction:column;gap:4px;height:100%';

    scene.persons.forEach(pid => {
      const char = CHARACTERS[pid];
      if (!char || !char.keywords) return;
      const btn = document.createElement('button');
      btn.className = 'talk-button';
      btn.textContent = char.name;
      btn.onclick = () => handleAskChar(pid);
      container.appendChild(btn);
    });

    const cancelBtn = document.createElement('button');
    cancelBtn.className = 'cancel-button';
    cancelBtn.textContent = 'CANCEL';
    cancelBtn.style.marginTop = 'auto';
    cancelBtn.onclick = () => { mode = 'menu'; updateCommandPanel(); };
    container.appendChild(cancelBtn);
    commandPanelEl.appendChild(container);

  } else if (mode === 'asking_keyword') {
    // きく: キーワード一覧
    const char = CHARACTERS[askTarget];
    const container = document.createElement('div');
    container.style.cssText = 'display:flex;flex-direction:column;gap:4px;height:100%;overflow-y:auto';

    if (char && char.keywords) {
      Object.keys(char.keywords).forEach(keyword => {
        const btn = document.createElement('button');
        btn.className = 'talk-button';
        btn.textContent = `▶ ${keyword}`;
        btn.onclick = () => handleAskKeyword(keyword);
        container.appendChild(btn);
      });
    }

    const cancelBtn = document.createElement('button');
    cancelBtn.className = 'cancel-button';
    cancelBtn.textContent = 'CANCEL';
    cancelBtn.style.marginTop = 'auto';
    cancelBtn.onclick = () => { mode = 'menu'; updateCommandPanel(); };
    container.appendChild(cancelBtn);
    commandPanelEl.appendChild(container);

  } else if (mode === 'using') {
    // つかう: インベントリからアイテム選択
    const container = document.createElement('div');
    container.className = 'item-list';

    inventory.forEach(itemId => {
      const item = ITEMS[itemId];
      if (!item) return;
      const entry = document.createElement('div');
      entry.className = 'item-entry';
      entry.style.cursor = 'pointer';

      const img = document.createElement('img');
      img.className = 'item-entry-image';
      img.src = item.image;
      img.alt = item.name;

      const info = document.createElement('div');
      info.className = 'item-entry-info';
      const name = document.createElement('div');
      name.className = 'item-entry-name';
      name.textContent = item.name;
      info.appendChild(name);

      entry.appendChild(img);
      entry.appendChild(info);
      entry.onclick = () => handleUseItem(itemId);
      container.appendChild(entry);
    });

    const closeBtn = document.createElement('button');
    closeBtn.className = 'cancel-button';
    closeBtn.textContent = 'CANCEL';
    closeBtn.style.marginTop = 'auto';
    closeBtn.onclick = () => { mode = 'menu'; updateCommandPanel(); };
    container.appendChild(closeBtn);
    commandPanelEl.appendChild(container);

  } else if (mode === 'using_target') {
    // つかう: 対象選択（スポット + キャラ）
    const scene = getScene();
    const container = document.createElement('div');
    container.style.cssText = 'display:flex;flex-direction:column;gap:4px;height:100%;overflow-y:auto';

    scene.spots.forEach(spot => {
      const btn = document.createElement('button');
      btn.className = 'move-button';
      const titleRow = document.createElement('div');
      titleRow.className = 'move-btn-title';
      titleRow.textContent = `▶ ${spot.label}`;
      btn.appendChild(titleRow);
      btn.onclick = () => handleUseOnSpot(spot);
      container.appendChild(btn);
    });

    scene.persons.forEach(pid => {
      const btn = document.createElement('button');
      btn.className = 'move-button';
      const titleRow = document.createElement('div');
      titleRow.className = 'move-btn-title';
      titleRow.textContent = `▶ [人物] ${CHARACTERS[pid].name}`;
      btn.appendChild(titleRow);
      btn.onclick = () => handleUseOnChar(pid);
      container.appendChild(btn);
    });

    const cancelBtn = document.createElement('button');
    cancelBtn.className = 'cancel-button';
    cancelBtn.textContent = 'CANCEL';
    cancelBtn.style.marginTop = 'auto';
    cancelBtn.onclick = () => {
      selectedUseItem = null;
      mode = 'menu';
      updateCommandPanel();
    };
    container.appendChild(cancelBtn);
    commandPanelEl.appendChild(container);

  } else if (mode === 'talking') {
    const scene = getScene();
    const container = document.createElement('div');
    container.style.display = 'flex';
    container.style.flexDirection = 'column';
    container.style.gap = '4px';
    container.style.height = '100%';

    scene.persons.forEach(pid => {
      const btn = document.createElement('button');
      btn.className = 'talk-button';
      btn.textContent = CHARACTERS[pid].name;
      btn.onclick = () => handleTalk(pid);
      container.appendChild(btn);
    });

    const cancelBtn = document.createElement('button');
    cancelBtn.className = 'cancel-button';
    cancelBtn.textContent = 'CANCEL';
    cancelBtn.style.marginTop = 'auto';
    cancelBtn.onclick = () => {
      mode = 'menu';
      updateCommandPanel();
    };
    container.appendChild(cancelBtn);
    commandPanelEl.appendChild(container);
  } else if (mode === 'moving') {
    const scene = getScene();
    const container = document.createElement('div');
    container.style.display = 'flex';
    container.style.flexDirection = 'column';
    container.style.gap = '4px';
    container.style.height = '100%';

    scene.exits.forEach(eid => {
      if (eid === 'catacombs' && !gameFlags.basement_unlocked) return;

      const btn = document.createElement('button');
      btn.className = 'move-button';

      const titleRow = document.createElement('div');
      titleRow.className = 'move-btn-title';
      titleRow.textContent = `▶ ${SCENES[eid].title}`;

      const descRow = document.createElement('div');
      descRow.className = 'move-btn-desc';
      const rawDesc = SCENES[eid].description;
      descRow.textContent = rawDesc.length > 30 ? rawDesc.substring(0, 30) + '…' : rawDesc;

      btn.appendChild(titleRow);
      btn.appendChild(descRow);
      btn.onclick = () => handleMove(eid);
      container.appendChild(btn);
    });

    const cancelBtn = document.createElement('button');
    cancelBtn.className = 'cancel-button';
    cancelBtn.textContent = 'CANCEL';
    cancelBtn.style.marginTop = 'auto';
    cancelBtn.onclick = () => {
      mode = 'menu';
      updateCommandPanel();
    };
    container.appendChild(cancelBtn);
    commandPanelEl.appendChild(container);
  } else if (mode === 'item') {
    const container = document.createElement('div');
    container.className = 'item-list';

    inventory.forEach(itemId => {
      const item = ITEMS[itemId];
      if (!item) return;
      
      const entry = document.createElement('div');
      entry.className = 'item-entry';
      
      const img = document.createElement('img');
      img.className = 'item-entry-image';
      img.src = item.image;
      img.alt = item.name;
      
      const info = document.createElement('div');
      info.className = 'item-entry-info';
      
      const name = document.createElement('div');
      name.className = 'item-entry-name';
      name.textContent = item.name;
      
      const desc = document.createElement('div');
      desc.className = 'item-entry-description';
      desc.textContent = item.description;
      
      info.appendChild(name);
      info.appendChild(desc);
      entry.appendChild(img);
      entry.appendChild(info);
      
      // クリックで詳細表示
      entry.style.cursor = 'pointer';
      entry.onclick = () => showItemPopup(itemId);
      
      container.appendChild(entry);
    });

    const closeBtn = document.createElement('button');
    closeBtn.className = 'cancel-button';
    closeBtn.textContent = 'CLOSE';
    closeBtn.style.marginTop = 'auto';
    closeBtn.onclick = () => {
      mode = 'menu';
      updateCommandPanel();
    };
    container.appendChild(closeBtn);
    commandPanelEl.appendChild(container);
  } else if (mode === 'investigating') {
    const container = document.createElement('div');
    container.className = 'investigating-panel';
    const text = document.createElement('div');
    text.className = 'investigating-text';
    text.textContent = 'INVESTIGATING...';
    container.appendChild(text);
    const exitBtn = document.createElement('button');
    exitBtn.className = 'exit-look-button';
    exitBtn.textContent = 'EXIT LOOK';
    exitBtn.onclick = () => {
      mode = 'menu';
      updateCommandPanel();
      updateInvestigationLayer();
    };
    container.appendChild(exitBtn);
    commandPanelEl.appendChild(container);
  } else if (mode === 'log') {
    const container = document.createElement('div');
    container.className = 'item-list';
    container.style.maxHeight = '100%';
    container.style.overflowY = 'auto';

    if (gameLog.length === 0) {
      const emptyMsg = document.createElement('div');
      emptyMsg.className = 'item-entry';
      emptyMsg.textContent = 'ログはまだありません。';
      emptyMsg.style.color = '#71717a';
      container.appendChild(emptyMsg);
    } else {
      gameLog.forEach((log, index) => {
        const entry = document.createElement('div');
        entry.className = 'item-entry';
        entry.style.flexDirection = 'column';
        entry.style.alignItems = 'flex-start';
        entry.style.gap = '4px';
        
        const time = document.createElement('div');
        time.style.fontSize = '8px';
        time.style.color = '#71717a';
        time.textContent = log.time || '';
        
        const content = document.createElement('div');
        content.style.fontSize = '10px';
        content.style.color = '#e0e7ff';
        content.textContent = log.text;
        
        entry.appendChild(time);
        entry.appendChild(content);
        container.appendChild(entry);
      });
    }

    const closeBtn = document.createElement('button');
    closeBtn.className = 'cancel-button';
    closeBtn.textContent = 'CLOSE';
    closeBtn.style.marginTop = 'auto';
    closeBtn.onclick = () => {
      mode = 'menu';
      updateCommandPanel();
    };
    container.appendChild(closeBtn);
    commandPanelEl.appendChild(container);
  } else if (mode === 'save') {
    const container = document.createElement('div');
    container.style.display = 'flex';
    container.style.flexDirection = 'column';
    container.style.gap = '8px';
    container.style.padding = '8px';
    container.style.height = '100%';
    container.style.justifyContent = 'center';
    container.style.alignItems = 'center';

    const saveBtn = document.createElement('button');
    saveBtn.className = 'talk-button';
    saveBtn.textContent = 'セーブする';
    saveBtn.onclick = () => {
      saveGame();
      showMessage("ゲームをセーブしました。");
      mode = 'menu';
      updateCommandPanel();
    };
    container.appendChild(saveBtn);

    const cancelBtn = document.createElement('button');
    cancelBtn.className = 'cancel-button';
    cancelBtn.textContent = 'CANCEL';
    cancelBtn.onclick = () => {
      mode = 'menu';
      updateCommandPanel();
    };
    container.appendChild(cancelBtn);
    commandPanelEl.appendChild(container);
  } else if (mode === 'load') {
    const container = document.createElement('div');
    container.style.display = 'flex';
    container.style.flexDirection = 'column';
    container.style.gap = '8px';
    container.style.padding = '8px';
    container.style.height = '100%';
    container.style.justifyContent = 'center';
    container.style.alignItems = 'center';

    const savedData = loadGameData();
    if (savedData) {
      const loadBtn = document.createElement('button');
      loadBtn.className = 'talk-button';
      loadBtn.textContent = 'ロードする';
      loadBtn.onclick = () => {
        loadGame();
        showMessage("ゲームをロードしました。");
        mode = 'menu';
        updateCommandPanel();
        updateScene();
      };
      container.appendChild(loadBtn);
    } else {
      const noData = document.createElement('div');
      noData.className = 'item-entry';
      noData.textContent = 'セーブデータがありません。';
      noData.style.color = '#71717a';
      container.appendChild(noData);
    }

    const cancelBtn = document.createElement('button');
    cancelBtn.className = 'cancel-button';
    cancelBtn.textContent = 'CANCEL';
    cancelBtn.onclick = () => {
      mode = 'menu';
      updateCommandPanel();
    };
    container.appendChild(cancelBtn);
    commandPanelEl.appendChild(container);
  }
}

function updateInvestigationLayer() {
  if (!investigationLayerEl) return;
  investigationLayerEl.innerHTML = '';
  if (mode === 'investigating') {
    const scene = getScene();
    scene.spots.forEach(spot => {
      // 条件チェック
      if (spot.condition && !gameFlags[spot.condition]) {
        return; // 条件を満たしていない場合は表示しない
      }
      
      const isInvestigated = investigatedSpots.has(spot.id);

      const btn = document.createElement('button');
      btn.className = 'spot-button' + (isInvestigated ? ' spot-investigated' : '');
      btn.style.top = spot.top;
      btn.style.left = spot.left;
      btn.style.width = spot.width;
      btn.style.height = spot.height;

      const label = document.createElement('div');
      label.className = 'spot-label';
      label.textContent = isInvestigated ? `✓ ${spot.label}` : spot.label;
      btn.appendChild(label);

      if (isInvestigated) {
        const check = document.createElement('div');
        check.className = 'spot-check';
        check.textContent = '✓';
        btn.appendChild(check);
      }

      btn.onclick = () => handleSpotClick(spot);
      investigationLayerEl.appendChild(btn);
    });
  }
}
