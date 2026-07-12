// ─── Favorites (localStorage) ──────────────────────────────────────────
/* global HotelFinder */
const HF = window.HotelFinder;

function loadFavorites() {
  try {
    return JSON.parse(localStorage.getItem('hotelFinder_favorites')) || [];
  } catch {
    return [];
  }
}

function saveFavorites() {
  localStorage.setItem('hotelFinder_favorites', JSON.stringify(HF.favorites));
}

function isFavorited(hotelId) {
  return HF.favorites.includes(hotelId);
}

function toggleFavorite(hotelId) {
  if (isFavorited(hotelId)) {
    HF.favorites = HF.favorites.filter((id) => id !== hotelId);
    showToast('♡ Removed from favorites');
  } else {
    HF.favorites.push(hotelId);
    showToast('♥ Added to favorites');
  }
  saveFavorites();
  updateFavCount();
  updateFavButtonStates();
  // Re-render if "Favorites Only" is active
  if (HF.elements.favFilter.value === 'favorites') applyFilters();
}

function updateFavCount() {
  HF.elements.favCount.textContent = HF.favorites.length;
  HF.elements.favoritesToggle.classList.toggle('active', HF.favorites.length > 0);
  HF.elements.favFilterGroup.classList.toggle('visible', HF.favorites.length > 0);
}

function updateFavButtonStates() {
  document.querySelectorAll('.fav-btn').forEach((btn) => {
    const id = btn.dataset.hotelId;
    btn.classList.toggle('favorited', isFavorited(id));
    btn.textContent = isFavorited(id) ? '♥' : '♡';
  });
  document.querySelectorAll('.modal-fav-btn').forEach((btn) => {
    const id = btn.dataset.hotelId;
    btn.classList.toggle('favorited', isFavorited(id));
    btn.innerHTML = isFavorited(id) ? '♥ Remove from Favorites' : '♡ Add to Favorites';
  });
}

// Init
HF.favorites = loadFavorites();
