// ─── Shared HotelFinder namespace ──────────────────────────────────────
window.HotelFinder = window.HotelFinder || {};

const HF = window.HotelFinder;

// ─── DOM Element Cache ─────────────────────────────────────────────────
HF.$ = (id) => document.getElementById(id);
HF.$$ = (sel) => document.querySelectorAll(sel);
HF.qs = (sel) => document.querySelector(sel);

HF.elements = {
  results: HF.$('results'),
  loadingIndicator: HF.$('loading-indicator'),
  errorMessage: HF.$('error-message'),
  errorText: HF.$('error-text'),
  retryBtn: HF.$('retry-btn'),
  resultCount: HF.$('result-count'),
  emptyState: HF.$('empty-state'),
  emptyText: HF.$('empty-text'),
  clearFiltersBtn: HF.$('clear-filters-btn'),
  offlineBanner: HF.$('offline-banner'),

  // Filters
  searchInput: HF.$('search-input'),
  airportFilter: HF.$('airport-filter'),
  priceMin: HF.$('price-min'),
  priceMax: HF.$('price-max'),
  ratingFilter: HF.$('rating-filter'),
  sortBy: HF.$('sort-by'),
  favFilter: HF.$('fav-filter'),
  favFilterGroup: HF.qs('.filter-group-favs'),

  // Modal
  modal: HF.$('detail-modal'),
  modalBody: HF.$('modal-body'),
  modalClose: HF.$('modal-close'),

  // Favorites
  favoritesToggle: HF.$('favorites-toggle'),
  favCount: HF.$('fav-count'),

  // Toast
  toastContainer: HF.$('toast-container'),
};

// ─── Shared Data ───────────────────────────────────────────────────────
HF.allHotels = [];
HF.favorites = [];
