// ============================================================================
// ログ機能
// ============================================================================

function addToLog(text) {
  const now = new Date();
  const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
  gameLog.push({
    time: timeStr,
    text: text
  });
  // ログが100件を超えたら古いものを削除
  if (gameLog.length > 100) {
    gameLog.shift();
  }
}

// ============================================================================
// セーブ/ロード機能
// ============================================================================

function saveGame() {
  const saveData = {
    currentSceneId,
    inventory,
    gameFlags,
    gameLog,
    investigatedSpots: Array.from(investigatedSpots),
    solvedMysteries,
    charTalkIndex,
    timestamp: new Date().toISOString()
  };
  
  try {
    localStorage.setItem('detective_game_save', JSON.stringify(saveData));
    return true;
  } catch (e) {
    console.error('セーブに失敗しました:', e);
    return false;
  }
}

function loadGameData() {
  try {
    const saved = localStorage.getItem('detective_game_save');
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('ロードに失敗しました:', e);
  }
  return null;
}

function loadGame() {
  const saveData = loadGameData();
  if (!saveData) {
    showMessage("セーブデータが見つかりません。");
    return false;
  }
  
  currentSceneId = saveData.currentSceneId || 'washitsu';
  inventory = saveData.inventory || ['police_badge'];
  gameFlags = saveData.gameFlags || {};
  gameLog = saveData.gameLog || [];
  investigatedSpots = new Set(saveData.investigatedSpots || []);
  solvedMysteries = saveData.solvedMysteries || 0;
  charTalkIndex = saveData.charTalkIndex || {};
  
  return true;
}
