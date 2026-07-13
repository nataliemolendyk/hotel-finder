/* -------------------------------------------------------
   Hotel Finder — Single File JS
   Pulls hotel data from Google Hotels API (SerpAPI)
   Works with your existing HTML + CSS exactly as-is
------------------------------------------------------- */

/* -------------------------------------------------------
   CONFIG (from config.js)
------------------------------------------------------- */
const CFG = window.HotelConfig;

/* -------------------------------------------------------
   STATE
------------------------------------------------------- */
const State = {
  hotels: [],
  favorites: new Set()
};

/* -------------------------------------------------------
   UTILITIES
------------------------------------------------------- */
const Utils = {
  normalize(text) {
    return (text || "").toString().toLowerCase();
  },

  formatPrice(value, currency = "USD") {
    if (value == null || isNaN(value)) return "Price on request";
    const symbol = currency === "USD" ? "$" : "";
    return `${symbol}${Number(value).toFixed(0)}`;
  },

  getBasePrice(hotel) {
    if (typeof hotel.price === "number") return hotel.price;

    if (Array.isArray(hotel.rooms)) {
      const prices = hotel.rooms
        .map(r => r.price)
        .filter(p => typeof p === "number");
      if (prices.length) return Math.min(...prices);
    }

    return null;
  },

  getRoomCount(hotel) {
    return Array.isArray(hotel.rooms) ? hotel.rooms.length : 0;
  },

  getImage(hotel) {
    return (
      hotel.image ||
      hotel.thumbnail ||
      (Array.isArray(hotel.images) && hotel.images[0]) ||
      ""
    );
  }
};

/* -------------------------------------------------------
   FAVORITES STORAGE
------------------------------------------------------- */
const FAVORITES_KEY = "hotel_favorites";

function loadFavorites() {
  try {
    const raw = localStorage.getItem(FAVORITES_KEY);
    if (!raw) return new Set();
    return new Set(JSON.parse(raw));
  } catch {
    return new Set();
  }
}

function saveFavorites() {
  localStorage.setItem(FAVORITES_KEY, JSON.stringify([...State.favorites]));
}

State.favorites = loadFavorites();

/* -------------------------------------------------------
   UI ELEMENTS
------------------------------------------------------- */
const UI = {
  results: document.getElementById("results"),
  resultCount: document.getElementById("result-count"),
  offlineBanner: document.getElementById("offline-banner"),
  loading: document.getElementById("loading-indicator"),
  error: document.getElementById("error-message"),
  errorText: document.getElementById("error-text"),
  empty: document.getElementById("empty-state"),
  emptyText: document.getElementById("empty-text"),
  clearFiltersBtn: document.getElementById("clear-filters-btn"),
  favoritesToggle: document.getElementById("favorites-toggle"),
  favCount: document.getElementById("fav-count"),
  favFilterGroup: document.querySelector(".filter-group-favs"),
  favFilter: document.getElementById("fav-filter"),
  airportFilter: document.getElementById("airport-filter"),
  modal: document.getElementById("detail-modal"),
  modalBody: document.getElementById("modal-body"),
  modalClose: document.getElementById("modal-close"),
  toastContainer: document.getElementById("toast-container")
};

/* -------------------------------------------------------
   UI HELPERS
------------------------------------------------------- */
function showLoading() {
  UI.loading.style.display = "flex";
  UI.error.style.display = "none";
  UI.empty.style.display = "none";
  UI.results.innerHTML = "";
}

function hideLoading() {
  UI.loading.style.display = "none";
}

function showError(msg) {
  hideLoading();
  UI.errorText.textContent = msg;
  UI.error.style.display = "flex";
  UI.results.innerHTML = "";
  UI.empty.style.display = "none";
}

function showEmpty(msg) {
  hideLoading();
  UI.emptyText.textContent = msg;
  UI.empty.style.display = "flex";
  UI.results.innerHTML = "";
  UI.error.style.display = "none";
}

function updateOfflineBanner() {
  UI.offlineBanner.style.display = navigator.onLine ? "none" : "flex";
}

function showToast(message) {
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = message;
  UI.toastContainer.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

function updateFavoritesUI() {
  const count = State.favorites.size;
  UI.favCount.textContent = count;
  UI.favFilterGroup.classList.toggle("visible", count > 0);
  UI.favoritesToggle.classList.toggle("active", count > 0);
}

/* -------------------------------------------------------
   FILTERS
------------------------------------------------------- */
function getFilteredHotels() {
  const hotels = State.hotels;

  const searchInput = document.getElementById("search-input");
  const airportFilter = document.getElementById("airport-filter");
  const priceMinInput = document.getElementById("price-min");
  const priceMaxInput = document.getElementById("price-max");
  const ratingFilter = document.getElementById("rating-filter");
  const sortBy = document.getElementById("sort-by");
  const favFilter = document.getElementById("fav-filter");

  const searchTerm = Utils.normalize(searchInput.value);
  const airportValue = airportFilter.value;
  const minPrice = parseFloat(priceMinInput.value);
  const maxPrice = parseFloat(priceMaxInput.value);
  const minRating = parseFloat(ratingFilter.value);
  const sortValue = sortBy.value;
  const favoritesOnly = favFilter.value === "favorites";

  let filtered = hotels.filter(hotel => {
    if (favoritesOnly && !State.favorites.has(hotel.id)) return false;

    if (airportValue !== "all" && hotel.airportCode !== airportValue) {
      return false;
    }

    if (searchTerm) {
      const name = Utils.normalize(hotel.name);
      const address = Utils.normalize(hotel.address);
      if (!name.includes(searchTerm) && !address.includes(searchTerm)) {
        return false;
      }
    }

    const basePrice = Utils.getBasePrice(hotel);
    if (!isNaN(minPrice) && basePrice != null && basePrice < minPrice) {
      return false;
    }
    if (!isNaN(maxPrice) && basePrice != null && basePrice > maxPrice) {
      return false;
    }

    if (!isNaN(minRating) && minRating > 0) {
      const rating = hotel.rating || 0;
      if (rating < minRating) return false;
    }

    return true;
  });

  switch (sortValue) {
    case "price-asc":
      filtered.sort(
        (a, b) =>
          (Utils.getBasePrice(a) || 0) - (Utils.getBasePrice(b) || 0)
      );
      break;

    case "price-desc":
      filtered.sort(
        (a, b) =>
          (Utils.getBasePrice(b) || 0) - (Utils.getBasePrice(a) || 0)
      );
      break;

    case "rating-desc":
      filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      break;

    default:
      filtered.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
  }

  return filtered;
}

/* -------------------------------------------------------
   RENDER HOTELS
------------------------------------------------------- */
function renderHotels(hotels) {
  if (!hotels.length) {
    showEmpty("No hotels found matching your criteria.");
    UI.resultCount.textContent = "0 results";
    return;
  }

  UI.error.style.display = "none";
  UI.empty.style.display = "none";

  UI.resultCount.textContent = `${hotels.length} result${hotels.length === 1 ? "" : "s"}`;

  UI.results.innerHTML = hotels
    .map(hotel => {
      const img = Utils.getImage(hotel);
      const basePrice = Utils.getBasePrice(hotel);
      const priceText = Utils.formatPrice(basePrice, hotel.currency);
      const ratingText = hotel.rating != null ? `Rating: ${hotel.rating.toFixed(1)}` : "";
      const roomCount = Utils.getRoomCount(hotel);
      const isFav = State.favorites.has(hotel.id);

      return `
        <article class="hotel-card" data-hotel-id="${hotel.id}">
          <div class="hotel-image-wrapper">
            <button class="fav-btn ${isFav ? "favorited" : ""}" data-hotel-id="${hotel.id}">
              ${isFav ? "♥" : "♡"}
            </button>
            ${
              img
                ? `<img src="${img}" alt="${hotel.name}" class="hotel-image" />`
                : `<div class="hotel-image-placeholder">🏨</div>`
            }
            <div class="hotel-image-overlay">
              <span class="hotel-airport-badge">${hotel.airportCode || ""}</span>
            </div>
          </div>
          <div class="hotel-card-body">
            <h3>${hotel.name || "Unnamed Hotel"}</h3>
            <div class="hotel-meta">
              <span>${ratingText}</span>
              <span>${priceText}/night</span>
            </div>
            <div class="hotel-details">
              <div class="detail-row">
                <span class="detail-icon">📍</span>
                <span>${hotel.address || "Address unavailable"}</span>
              </div>
              <div class="detail-row">
                <span class="detail-icon">🛏️</span>
                <span>${roomCount} room type${roomCount === 1 ? "" : "s"}</span>
              </div>
            </div>
            <button class="view-details-btn" data-hotel-id="${hotel.id}">
              View details
            </button>
          </div>
        </article>
      `;
    })
    .join("");

  // attach events
  UI.results.querySelectorAll(".fav-btn").forEach(btn => {
    btn.addEventListener("click", e => {
      e.stopPropagation();
      toggleFavorite(btn.dataset.hotelId);
    });
  });

  UI.results.querySelectorAll(".view-details-btn").forEach(btn => {
    btn.addEventListener("click", e => {
      e.stopPropagation();
      const id = btn.dataset.hotelId;
      const hotel = State.hotels.find(h => h.id === id);
      if (hotel) openModal(hotel);
    });
  });

  UI.results.querySelectorAll(".hotel-card").forEach(card => {
    card.addEventListener("click", e => {
      if (e.target.closest(".fav-btn")) return;
      if (e.target.closest(".view-details-btn")) return;
      const id = card.dataset.hotelId;
      const hotel = State.hotels.find(h => h.id === id);
      if (hotel) openModal(hotel);
    });
  });
}

/* -------------------------------------------------------
   FAVORITES
------------------------------------------------------- */
function toggleFavorite(id) {
  if (State.favorites.has(id)) {
    State.favorites.delete(id);
    showToast("Removed from favorites");
  } else {
    State.favorites.add(id);
    showToast("Added to favorites");
  }
  saveFavorites();
  updateFavoritesUI();
  renderHotels(getFilteredHotels());
}

/* -------------------------------------------------------
   MODAL
------------------------------------------------------- */
function openModal(hotel) {
  const img = Utils.getImage(hotel);
  const basePrice = Utils.getBasePrice(hotel);
  const priceText = Utils.formatPrice(basePrice, hotel.currency);
  const ratingText = hotel.rating != null ? `Rating: ${hotel.rating.toFixed(1)}` : "";
  const roomCount = Utils.getRoomCount(hotel);
  const isFav = State.favorites.has(hotel.id);

  const roomsHtml =
    Array.isArray(hotel.rooms) && hotel.rooms.length
      ? `
    <div class="modal-section">
      <h3>Room types (${roomCount})</h3>
      <ul class="modal-rooms-list">
        ${hotel.rooms
          .map(room => {
            const price = Utils.formatPrice(room.price, hotel.currency);
            const available =
              room.available === false ? "badge-unavailable" : "badge-available";
            const availableText =
              room.available === false ? "Not available" : "Available";
            const features = Array.isArray(room.features)
              ? room.features.join(" · ")
              : room.description || "";

            return `
              <li class="modal-room-item">
                <span class="room-type">${room.type || "Room"}</span>
                <span class="room-price">${price}<small>/night</small></span>
                <span class="room-badge ${available}">${availableText}</span>
                <span class="room-features">${features}</span>
              </li>
            `;
          })
          .join("")}
      </ul>
    </div>
  `
      : "";

  UI.modalBody.innerHTML = `
    <div class="modal-body">
      ${
        img
          ? `<img src="${img}" alt="${hotel.name}" class="modal-image" />`
          : ""
      }
      <div class="modal-info">
        <h2>${hotel.name || "Unnamed Hotel"}</h2>
        <div class="modal-meta">
          <span>${ratingText}</span>
          <span>${priceText}/night</span>
          <span>${hotel.airportCode || ""}</span>
        </div>
        <div class="modal-address">
          <span>📍</span>
          <span>${hotel.address || "Address unavailable"}</span>
        </div>
        ${roomsHtml}
        <button class="modal-fav-btn ${isFav ? "favorited" : ""}" data-hotel-id="${hotel.id}">
          ${isFav ? "♥ Remove from favorites" : "♡ Add to favorites"}
        </button>
      </div>
    </div>
  `;

  UI.modal.style.display = "flex";
  document.body.style.overflow = "hidden";

  const favBtn = UI.modalBody.querySelector(".modal-fav-btn");
  favBtn.addEventListener("click", () => {
    toggleFavorite(hotel.id);
    const nowFav = State.favorites.has(hotel.id);
    favBtn.classList.toggle("favorited", nowFav);
    favBtn.textContent = nowFav
      ? "♥ Remove from favorites"
      : "♡ Add to favorites";
  });
}

function closeModal() {
  UI.modal.style.display = "none";
  document.body.style.overflow = "";
}

UI.modalClose.addEventListener("click", closeModal);
UI.modal.addEventListener("click", e => {
  if (e.target === UI.modal) closeModal();
});
document.addEventListener("keydown", e => {
  if (e.key === "Escape") closeModal();
});

/* -------------------------------------------------------
   GOOGLE HOTELS API (SerpAPI)
------------------------------------------------------- */
async function fetchAirportHotels(airportCode, searchQuery) {
  const params = new URLSearchParams({
    engine: "google_hotels",
    q: searchQuery,
    check_in_date: CFG.CHECK_IN,
    check_out_date: CFG.CHECK_OUT,
    api_key: CFG.API_KEY,
    adults: 2,
    currency: "USD",
    gl: "us",
    hl: "en"
  });

  const url = `/api/hotels?q=${encodeURIComponent(searchQuery)}&check_in=${CFG.CHECK_IN}&check_out=${CFG.CHECK_OUT}&api_key=${CFG.API_KEY}`;
const res = await fetch(url);
const data = await res.json();

  const properties = data.properties || [];

  return properties.map(p => ({
    id: p.id || `${airportCode}-${Math.random().toString(36).slice(2)}`,
    name: p.name || "Unnamed Hotel",
    airportCode,
    address: p.address || p.nearby_places?.[0]?.name || "Address unavailable",
    rating: p.overall_rating || null,
    price: p.rate_per_night?.extracted_lowest || null,
    currency: "USD",
    image: p.images?.[0]?.original_image || p.thumbnail || "",
    rooms: (p.prices || []).map(pr => ({
      type: pr.source || pr.room_type || "Room",
      price: pr.rate_per_night?.extracted_lowest || null,
      available: true,
      description: pr.description || "",
      features: p.amenities || []
    }))
  }));
}

async function loadHotels() {
  showLoading();
  updateOfflineBanner();

  try {
    const all = [];

    for (const airport of CFG.AIRPORTS) {
      const hotels = await fetchAirportHotels(airport.airportCode, airport.search);
      all.push(...hotels);
    }

    State.hotels = all;
    hideLoading();
    populateAirportFilter();
    updateFavoritesUI();
    renderHotels(getFilteredHotels());
  } catch (err) {
    console.error(err);
    showError("Failed to load hotels from Google Hotels API.");
  }
}

function populateAirportFilter() {
  const select = UI.airportFilter;
  const codes = Array.from(
    new Set(State.hotels.map(h => h.airportCode).filter(Boolean))
  ).sort();

  select.innerHTML = `<option value="all">All Airports</option>`;
  codes.forEach(code => {
    const opt = document.createElement("option");
    opt.value = code;
    opt.textContent = code;
    select.appendChild(opt);
  });
}

/* -------------------------------------------------------
   EVENT LISTENERS
------------------------------------------------------- */
document.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.getElementById("search-input");
  const airportFilter = document.getElementById("airport-filter");
  const priceMinInput = document.getElementById("price-min");
  const priceMaxInput = document.getElementById("price-max");
  const ratingFilter = document.getElementById("rating-filter");
  const sortBy = document.getElementById("sort-by");
  const favFilter = document.getElementById("fav-filter");
  const retryBtn = document.getElementById("retry-btn");

  function applyFiltersAndRender() {
    renderHotels(getFilteredHotels());
  }

  searchInput.addEventListener("input", applyFiltersAndRender);
  airportFilter.addEventListener("change", applyFiltersAndRender);
  priceMinInput.addEventListener("input", applyFiltersAndRender);
  priceMaxInput.addEventListener("input", applyFiltersAndRender);
  ratingFilter.addEventListener("change", applyFiltersAndRender);
  sortBy.addEventListener("change", applyFiltersAndRender);
  favFilter.addEventListener("change", applyFiltersAndRender);

  UI.favoritesToggle.addEventListener("click", () => {
    if (favFilter.value === "favorites") {
      favFilter.value = "all";
    } else {
      favFilter.value = "favorites";
    }
    applyFiltersAndRender();
  });

  UI.clearFiltersBtn.addEventListener("click", () => {
    searchInput.value = "";
    airportFilter.value = "all";
    priceMinInput.value = "";
    priceMaxInput.value = "";
    ratingFilter.value = "0";
    sortBy.value = "name";
    favFilter.value = "all";
    applyFiltersAndRender();
  });

  retryBtn.addEventListener("click", loadHotels);

  window.addEventListener("online", updateOfflineBanner);
  window.addEventListener("offline", updateOfflineBanner);

  loadHotels();
});
