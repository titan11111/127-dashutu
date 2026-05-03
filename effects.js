// ============================================================================
// エフェクト・ポップアップ関数
// ============================================================================

function showEffect(type, intensity = 1) {
  const effectLayer = document.getElementById('effectLayer');
  if (!effectLayer) return;
  
  const effect = document.createElement('div');
  
  if (type === 'light') {
    effect.className = 'effect-light';
    effect.style.opacity = intensity;
  } else if (type === 'glitch') {
    effect.className = 'effect-glitch';
  } else if (type === 'flash') {
    effect.className = 'effect-flash';
  }

  effectLayer.appendChild(effect);

  const durations = { glitch: 500, flash: 600, light: 800 };
  setTimeout(() => {
    if (effect.parentNode) {
      effect.parentNode.removeChild(effect);
    }
  }, durations[type] || 800);
}

function showItemPopup(itemId) {
  const item = ITEMS[itemId];
  if (!item) return;
  
  const popup = document.getElementById('itemPopup');
  const image = document.getElementById('itemPopupImage');
  const name = document.getElementById('itemPopupName');
  const description = document.getElementById('itemPopupDescription');
  
  image.src = item.image;
  image.alt = item.name;
  name.textContent = `GET! ${item.name}`;
  description.textContent = item.description;
  
  popup.classList.add('show');
}

function closeItemPopup() {
  const popup = document.getElementById('itemPopup');
  popup.classList.remove('show');
}

// グローバルスコープに公開（HTMLから呼び出すため）
window.closeItemPopup = closeItemPopup;
