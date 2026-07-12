// ─── Entry Point ───────────────────────────────────────────────────────
// All logic lives in js/*.js modules loaded via <script> tags.
// This file wires up event listeners and kicks off the app.

document.addEventListener('DOMContentLoaded', () => {
  const $ = HotelFinder.elements;

  // ─── Filter Events ─────────────────────────────────────────────────
  $.searchInput.addEventListener('input', applyFilters);
  $.airportFilter.addEventListener('change', applyFilters);
  $.priceMin.addEventListener('input', applyFilters);
  $.priceMax.addEventListener('input', applyFilters);
  $.ratingFilter.addEventListener('change', applyFilters);
  $.sortBy.addEventListener('change', applyFilters);
  $.favFilter.addEventListener('change', applyFilters);

  // ─── Favorites Toggle ──────────────────────────────────────────────
  $.favoritesToggle.addEventListener('click', () => {
    if ($.favFilter.value === 'favorites') {
      $.favFilter.value = 'all';
      $.favoritesToggle.classList.remove('active');
    } else {
      $.favFilter.value = 'favorites';
    }
    applyFilters();
  });

  // ─── Retry ─────────────────────────────────────────────────────────
  $.retryBtn.addEventListener('click', fetchHotels);

  // ─── Kick Off ──────────────────────────────────────────────────────
  fetchHotels();
});