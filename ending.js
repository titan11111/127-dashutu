// ============================================================================
// エンディング処理
// ============================================================================

function checkEnding() {
  if (gameFlags.found_body) {
    setTimeout(() => {
      showMessage("骸骨を発見した。1952年——あの手紙の年だ。玄関のメイドに話を聞くべきだ。");
      addToLog("[手がかり] 骸骨の発見と手紙・写真がつながった。");
    }, 2000);
  }
}

function checkMaidConfession() {
  if (gameFlags.found_body && gameFlags.maid_confessed) {
    setTimeout(() => {
      showEnding();
    }, 2500);
  }
}

function showEnding() {
  addToLog("[エンディング] 事件解決！");
  if (typeof SE !== 'undefined') SE.ending();

  const screen = document.getElementById('endingScreen');
  if (!screen) {
    // フォールバック（ending screen HTML がない場合）
    showMessage("--- CASE CLOSED ---\n\n事件は解決した。");
    return;
  }

  screen.style.display = 'flex';

  // CASE CLOSED テキストを1文字ずつ表示
  const titleEl = document.getElementById('endingTitle');
  if (titleEl) {
    titleEl.textContent = '';
    const titleText = 'CASE CLOSED';
    let ti = 0;
    const typeTitle = () => {
      if (ti < titleText.length) {
        titleEl.textContent += titleText[ti];
        ti++;
        setTimeout(typeTitle, 80);
      }
    };
    setTimeout(typeTitle, 400);
  }

  // 本文を遅延タイプアウト
  const storyEl = document.getElementById('endingStory');
  if (storyEl) {
    const storyLines = [
      "メイドの自白により、事件の全容が明らかになった。",
      "",
      "1952年——当時の主は、メイドの兄を殺し庭に埋めた。",
      "メイドは書斎の手紙でその事実を知り、",
      "長年の怒りが爆発した。",
      "",
      "主は和室で命を絶たれた。",
      "凶器は証拠品として押収されている。",
      "",
      "「あなたは…正しい探偵です」",
    ];
    const fullStory = storyLines.join('\n');
    storyEl.textContent = '';
    let si = 0;
    const typeStory = () => {
      if (si < fullStory.length) {
        storyEl.textContent = fullStory.substring(0, si + 1);
        si++;
        setTimeout(typeStory, si % 3 === 0 ? 35 : 20);
      } else {
        showEndingStats();
      }
    };
    setTimeout(typeStory, 1800); // CASE CLOSEDアニメ後に開始
  }
}

function showEndingStats() {
  const statsEl = document.getElementById('endingStats');
  if (statsEl) {
    const totalSpots = Object.values(SCENES).reduce((sum, s) => sum + s.spots.length, 0);
    statsEl.innerHTML =
      `EVIDENCE COLLECTED: <span style="color:#fbbf24">${inventory.length}</span> &nbsp;/&nbsp; ` +
      `LOCATIONS INVESTIGATED: <span style="color:#fbbf24">${investigatedSpots.size}</span> / ${totalSpots}`;
  }
  setTimeout(() => {
    const restartBtn = document.getElementById('endingRestart');
    if (restartBtn) restartBtn.style.display = 'inline-block';
  }, 1200);
}
