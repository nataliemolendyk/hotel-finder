document.addEventListener('DOMContentLoaded', () => {
  const resultsContainer = document.getElementById('results');
  const loadingIndicator = document.getElementById('loading-indicator');
  const errorMessage = document.getElementById('error-message');
  const errorText = document.getElementById('error-text');
  const retryBtn = document.getElementById('retry-btn');
  const resultCount = document.getElementById('result-count');
  const emptyState = document.getElementById('empty-state');
  const emptyText = document.getElementById('empty-text');
  const clearFiltersBtn = document.getElementById('clear-filters-btn');
  const offlineBanner = document.getElementById('offline-banner');

  // ─── Filter Elements ──────────────────────────────────────────────────
  const searchInput = document.getElementById('search-input');
  const airportFilter = document.getElementById('airport-filter');
  const priceMin = document.getElementById('price-min');
  const priceMax = document.getElementById('price-max');
  const ratingFilter = document.getElementById('rating-filter');
  const sortBy = document.getElementById('sort-by');
  const favFilter = document.getElementById('fav-filter');
  const favFilterGroup = document.querySelector('.filter-group-favs');

  // ─── Modal Elements ───────────────────────────────────────────────────
  const modal = document.getElementById('detail-modal');
  const modalBody = document.getElementById('modal-body');
  const modalClose = document.getElementById('modal-close');

  // ─── Favorites Elements ───────────────────────────────────────────────
  const favoritesToggle = document.getElementById('favorites-toggle');
  const favCount = document.getElementById('fav-count');

  // ─── Toast Container ──────────────────────────────────────────────────
  const toastContainer = document.getElementById('toast-container');

  let allHotels = [];
  let favorites = loadFavorites();

  // ═════════════════════════════════════════════════════════════════════
  //  FAVORITES (localStorage)
  // ═════════════════════════════════════════════════════════════════════

  function loadFavorites() {
    try {
      return JSON.parse(localStorage.getItem('hotelFinder_favorites')) || [];
    } catch {
      return [];
    }
  }

  function saveFavorites() {
    localStorage.setItem('hotelFinder_favorites', JSON.stringify(favorites));
  }

  function isFavorited(hotelId) {
    return favorites.includes(hotelId);
  }

  function toggleFavorite(hotelId) {
    if (isFavorited(hotelId)) {
      favorites = favorites.filter((id) => id !== hotelId);
      showToast('♡ Removed from favorites');
    } else {
      favorites.push(hotelId);
      showToast('♥ Added to favorites');
    }
    saveFavorites();
    updateFavCount();
    updateFavButtonStates();
    // Re-render if "Favorites Only" is active
    if (favFilter.value === 'favorites') applyFilters();
  }

  function updateFavCount() {
    favCount.textContent = favorites.length;
    favoritesToggle.classList.toggle('active', favorites.length > 0);
    favFilterGroup.classList.toggle('visible', favorites.length > 0);
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

  // ═════════════════════════════════════════════════════════════════════
  //  TOAST NOTIFICATIONS
  // ═════════════════════════════════════════════════════════════════════

  function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    toastContainer.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  }

  // ═════════════════════════════════════════════════════════════════════
  //  OFFLINE DETECTION
  // ═════════════════════════════════════════════════════════════════════

  function updateOnlineStatus() {
    if (navigator.onLine) {
      offlineBanner.style.display = 'none';
    } else {
      offlineBanner.style.display = 'flex';
    }
  }

  window.addEventListener('online', updateOnlineStatus);
  window.addEventListener('offline', updateOnlineStatus);

  // ═════════════════════════════════════════════════════════════════════
  //  SHOW / HIDE HELPERS
  // ═════════════════════════════════════════════════════════════════════

  const showLoading = () => {
    loadingIndicator.style.display = 'flex';
    resultsContainer.innerHTML = '';
    errorMessage.style.display = 'none';
    emptyState.style.display = 'none';
  };

  const hideLoading = () => {
    loadingIndicator.style.display = 'none';
  };

  const showError = (msg) => {
    hideLoading();
    resultsContainer.innerHTML = '';
    emptyState.style.display = 'none';
    errorText.innerHTML = msg || '⚠️ Something went wrong while loading hotels.<br/><small>Check your API token or try again later.</small>';
    errorMessage.style.display = 'flex';
  };

  const hideError = () => {
    errorMessage.style.display = 'none';
  };

  const showEmptyState = (msg) => {
    hideLoading();
    resultsContainer.innerHTML = '';
    errorMessage.style.display = 'none';
    emptyText.textContent = msg || 'No hotels found matching your criteria.';
    emptyState.style.display = 'flex';
  };

  const hideEmptyState = () => {
    emptyState.style.display = 'none';
  };

  // ═════════════════════════════════════════════════════════════════════
  //  EXTRACT IMAGE URL (handles API array formats)
  // ═════════════════════════════════════════════════════════════════════

  const extractImageUrl = (hotel) => {
    if (hotel.image) return hotel.image;
    if (hotel.mainPhoto) {
      if (Array.isArray(hotel.mainPhoto)) {
        const first = hotel.mainPhoto[0];
        if (first?.url) return first.url;
        if (typeof first === 'string') return first;
      } else if (hotel.mainPhoto?.url) {
        return hotel.mainPhoto.url;
      }
    }
    if (hotel.images && hotel.images.length > 0) {
      const first = hotel.images[0];
      if (first?.url) return first.url;
      if (first?.mainUrl) return first.mainUrl;
      if (typeof first === 'string') return first;
    }
    if (hotel.photo) {
      if (Array.isArray(hotel.photo)) {
        const first = hotel.photo[0];
        if (first?.url) return first.url;
        if (first?.main?.url) return first.main.url;
        if (typeof first === 'string') return first;
      } else if (hotel.photo?.main?.url) {
        return hotel.photo.main.url;
      }
    }
    if (hotel.photos && hotel.photos.length > 0) {
      const first = hotel.photos[0];
      if (first?.url) return first.url;
      if (first?.mainUrl) return first.mainUrl;
      if (typeof first === 'string') return first;
      // Booking.com often uses: { url_max, url_640, url_square60, etc }
      if (first?.url_max) return first.url_max;
      if (first?.url_640) return first.url_640;
      if (first?.url_square60) return first.url_square60;
    }
    if (hotel.pictures && hotel.pictures.length > 0) {
      const first = hotel.pictures[0];
      if (first?.url) return first.url;
      if (typeof first === 'string') return first;
    }
    // Booking.com sometimes uses: hotel.images[0].url_max or hotel.images[0].url_640
    if (hotel.images && hotel.images.length > 0) {
      const first = hotel.images[0];
      if (first?.url_max) return first.url_max;
      if (first?.url_640) return first.url_640;
    }
    return '';
  };

  // ═════════════════════════════════════════════════════════════════════
  //  PRICE / RATING FORMATTING HELPERS
  // ═════════════════════════════════════════════════════════════════════

  // Real scraped prices often come back with long floating-point tails
  // (e.g. 380.82509999999996). Round to at most 2 decimals, but don't
  // pad whole numbers with a trailing ".00".
  const formatPrice = (price) => {
    if (price == null || isNaN(price)) return null;
    const rounded = Math.round(price * 100) / 100;
    return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(2);
  };

  // Local mock data uses a 0–5 star rating. Real Booking-scraped hotels use
  // a 0–10 guest score (and always carry a `ratingLabel` like "Excellent" —
  // that's our signal for which scale we're looking at). Normalize to a
  // 0–5 scale so filtering/sorting behaves consistently across both sources,
  // since a fetch can mix live results for some airports with local
  // fallback results for others.
  const getNormalizedRating = (hotel) => {
  if (hotel.rating == null || isNaN(hotel.rating)) return null;
  return hotel.rating;
};

  // Lowest nightly price across a hotel's room list, falling back to the
  // hotel-level price fields when there's no rooms array (or none of the
  // rooms carry a price of their own).
  const getLowestRoomPrice = (hotel) => {
    const roomPrices = (hotel.rooms || [])
      .map((r) => getRoomPrice(r))
      .filter((p) => p != null && !isNaN(p));
    if (roomPrices.length > 0) return Math.min(...roomPrices);
    const fallback = hotel.price ?? hotel.pricePerNight;
    return fallback != null && !isNaN(fallback) ? fallback : null;
  };

  // A room's own price, handling two different data shapes:
  //  - Local mock data (hotels.json): a flat `price` field directly on the room.
  //  - Live Booking-scraper data: no flat price — instead an `options` array,
  //    one entry per rate plan/cancellation policy, each with its own `price`.
  //    We take the cheapest option as "the" price for that room type.
  const getRoomPrice = (room) => {
    if (!room) return null;
    if (room.price != null && !isNaN(room.price)) return room.price;
    if (Array.isArray(room.options) && room.options.length > 0) {
      const optionPrices = room.options
        .map((o) => o.price)
        .filter((p) => p != null && !isNaN(p));
      if (optionPrices.length > 0) return Math.min(...optionPrices);
    }
    return null;
  };

  // A room's feature/amenity list, handling both `features` (local mock data)
  // and `facilities` (live Booking-scraper data).
  const getRoomFeatures = (room) => {
    if (!room) return [];
    return (room.features || room.facilities || []).filter(Boolean);
  };

  // ═════════════════════════════════════════════════════════════════════
  //  RENDER HOTEL CARDS
  // ═════════════════════════════════════════════════════════════════════

  const renderHotels = (hotels) => {
    hideEmptyState();
    hideError();

    if (!hotels.length) {
      showEmptyState('No hotels match your filters. Try adjusting your search criteria.');
      resultCount.textContent = '0 results';
      return;
    }

    resultCount.textContent = `${hotels.length} result${hotels.length !== 1 ? 's' : ''}`;

    resultsContainer.innerHTML = hotels
      .map((hotel) => {
        const nightlyPrice = getRoomPrice(hotel.rooms?.[0]) || hotel.price || hotel.pricePerNight;
        const currencySymbol = hotel.currency || '$';
        const priceDisplay = nightlyPrice
          ? `${currencySymbol}${formatPrice(nightlyPrice)}`
          : 'Price on request';
        const ratingDisplay = hotel.rating
          ? `⭐ ${hotel.rating}${hotel.ratingLabel ? ' · ' + hotel.ratingLabel : ''}`
          : '';
        const addressDisplay = hotel.address?.full || hotel.address?.street || hotel.address || 'Address unavailable';
        const apiImageUrl = extractImageUrl(hotel);
        const isFav = isFavorited(hotel.id);

        const roomCount = hotel.rooms?.length || 0;
        const lowestPrice = getLowestRoomPrice(hotel);
        const roomSummaryText = roomCount > 0
          ? `${roomCount} ${roomCount === 1 ? 'room type' : 'room types'}${lowestPrice != null ? ` from ${currencySymbol}${formatPrice(lowestPrice)}` : ''}`
          : '';

        return `
          <article class="hotel-card" data-hotel-id="${hotel.id}">
            <div class="hotel-image-wrapper">
              <button class="fav-btn ${isFav ? 'favorited' : ''}" data-hotel-id="${hotel.id}" aria-label="Toggle favorite">${isFav ? '♥' : '♡'}</button>
              ${apiImageUrl ? `<img src="${apiImageUrl}" alt="${hotel.name}" class="hotel-image" loading="lazy" />` : `<div class="hotel-image-placeholder">🏨</div>`}
              <div class="hotel-image-overlay">
                <span class="hotel-airport-badge">${hotel.airportCode}</span>
              </div>
            </div>
            <div class="hotel-card-body">
              <h3>${hotel.name}</h3>
              <div class="hotel-meta">
                <span>${ratingDisplay}</span>
                <span>${priceDisplay}/night</span>
              </div>
              <div class="hotel-details">
                <div class="detail-row">
                  <span class="detail-icon">📍</span>
                  <span>${addressDisplay}</span>
                </div>
              </div>
              ${roomSummaryText ? `
                <div class="room-summary">
                  <span class="rooms-count-badge">${roomSummaryText}</span>
                </div>
              ` : ''}
              <button class="view-details-btn" data-hotel-id="${hotel.id}">View Details →</button>
            </div>
          </article>
        `;
      })
      .join('');

    // ─── Attach event listeners ──────────────────────
    // Favorite buttons
    document.querySelectorAll('.fav-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleFavorite(btn.dataset.hotelId);
      });
    });

    // View Details buttons
    document.querySelectorAll('.view-details-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.dataset.hotelId;
        const hotel = allHotels.find((h) => h.id === id);
        if (hotel) openDetailModal(hotel);
      });
    });

    // Click on card (except favorite button) opens detail
    document.querySelectorAll('.hotel-card').forEach((card) => {
      card.addEventListener('click', (e) => {
        if (e.target.closest('.fav-btn')) return;
        if (e.target.closest('.view-details-btn')) return;
        const id = card.dataset.hotelId;
        const hotel = allHotels.find((h) => h.id === id);
        if (hotel) openDetailModal(hotel);
      });
    });
  };

  // ═════════════════════════════════════════════════════════════════════
  //  DETAIL MODAL
  // ═════════════════════════════════════════════════════════════════════

  const openDetailModal = (hotel) => {
    const nightlyPrice = getRoomPrice(hotel.rooms?.[0]) || hotel.price || hotel.pricePerNight;
    const currencySymbol = hotel.currency || '$';
    const priceDisplay = nightlyPrice ? `${currencySymbol}${formatPrice(nightlyPrice)}` : 'Price on request';
    const ratingDisplay = hotel.rating ? `⭐ ${hotel.rating}${hotel.ratingLabel ? ' · ' + hotel.ratingLabel : ''}` : '';
    const addressDisplay = hotel.address?.full || hotel.address?.street || hotel.address || 'Address unavailable';
    const apiImageUrl = extractImageUrl(hotel);
    const isFav = isFavorited(hotel.id);

    const roomsHtml = hotel.rooms && hotel.rooms.length > 0
      ? `<div class="modal-section">
          <h3>Room Options (${hotel.rooms.length})</h3>
          <ul class="modal-rooms-list">
            ${hotel.rooms.map((room) => {
              const roomPrice = getRoomPrice(room);
              const priceText = roomPrice != null ? formatPrice(roomPrice) : null;
              return `
              <li class="modal-room-item">
                <span class="room-type">${room.type || room.roomType || 'Room'}</span>
                <span class="room-price">${priceText ? `${currencySymbol}${priceText}` : 'Price on request'}<small>/night</small></span>
                <span class="room-badge ${room.available === false ? 'badge-unavailable' : 'badge-available'}">${room.available === false ? '✗ Sold Out' : '✓ Available'}</span>
                <span class="room-features">${getRoomFeatures(room).join(' · ')}</span>
              </li>
            `;
            }).join('')}
          </ul>
        </div>`
      : '';

    const featuresHtml = hotel.roomOfferings || getRoomFeatures(hotel.rooms?.[0]).length
      ? `<div class="modal-section">
          <h3>Highlights</h3>
          <p>${hotel.roomOfferings || getRoomFeatures(hotel.rooms?.[0]).join(', ')}</p>
        </div>`
      : '';

    modalBody.innerHTML = `
      ${apiImageUrl ? `<img src="${apiImageUrl}" alt="${hotel.name}" class="modal-image" />` : ''}
      <div class="modal-info">
        <h2>${hotel.name}</h2>
        <div class="modal-meta">
          <span>${ratingDisplay}</span>
          <span>From ${priceDisplay}/night</span>
          <span class="hotel-airport-badge">${hotel.airportCode}</span>
        </div>
        <div class="modal-address">📍 ${addressDisplay}</div>
        ${featuresHtml}
        ${roomsHtml}
        <button class="modal-fav-btn ${isFav ? 'favorited' : ''}" data-hotel-id="${hotel.id}">
          ${isFav ? '♥ Remove from Favorites' : '♡ Add to Favorites'}
        </button>
      </div>
    `;

    // Attach modal favorite button
    modalBody.querySelector('.modal-fav-btn')?.addEventListener('click', (e) => {
      toggleFavorite(e.currentTarget.dataset.hotelId);
      // Update the modal button state
      const id = e.currentTarget.dataset.hotelId;
      e.currentTarget.classList.toggle('favorited', isFavorited(id));
      e.currentTarget.innerHTML = isFavorited(id) ? '♥ Remove from Favorites' : '♡ Add to Favorites';
    });

    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
  };

  const closeDetailModal = () => {
    modal.style.display = 'none';
    document.body.style.overflow = '';
  };

  modalClose.addEventListener('click', closeDetailModal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeDetailModal();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeDetailModal();
  });

  // ═════════════════════════════════════════════════════════════════════
  //  FILTERING & SORTING
  // ═════════════════════════════════════════════════════════════════════

  const getFilteredHotels = () => {
    const searchTerm = searchInput.value.toLowerCase().trim();
    const airportValue = airportFilter.value;
    const minPrice = parseFloat(priceMin.value);
    const maxPrice = parseFloat(priceMax.value);
    const minRating = parseFloat(ratingFilter.value);
    const sortValue = sortBy.value;
    const favoritesOnly = favFilter.value === 'favorites';

    let filtered = allHotels.filter((hotel) => {
      // Favorites filter
      if (favoritesOnly && !isFavorited(hotel.id)) return false;

      // Text search - search name AND room features
      if (searchTerm) {
        const hotelName = hotel.name.toLowerCase();
        const allFeatures = (hotel.rooms || [])
          .flatMap((r) => getRoomFeatures(r))
          .join(' ')
          .toLowerCase();
        const roomOfferings = (hotel.roomOfferings || '').toLowerCase();
        if (!hotelName.includes(searchTerm) && !allFeatures.includes(searchTerm) && !roomOfferings.includes(searchTerm)) {
          return false;
        }
      }

      // Airport filter
      if (airportValue !== 'all' && hotel.airportCode !== airportValue) {
        return false;
      }

      // Price range
      const price = getRoomPrice(hotel.rooms?.[0]) || hotel.price || hotel.pricePerNight;
      if (price != null) {
        if (!isNaN(minPrice) && price < minPrice) return false;
        if (!isNaN(maxPrice) && price > maxPrice) return false;
      }

      // Rating filter (normalized to a 0–5 scale — see getNormalizedRating)
      const rating = hotel.rating;
      if (minRating > 0 && (rating == null || rating < minRating)) {
        return false;
      }

      return true;
    });

    // Sort
    switch (sortValue) {
      case 'price-asc':
        filtered.sort((a, b) => {
          const pa = getRoomPrice(a.rooms?.[0]) || a.price || a.pricePerNight || 0;
          const pb = getRoomPrice(b.rooms?.[0]) || b.price || b.pricePerNight || 0;
          return pa - pb;
        });
        break;
      case 'price-desc':
        filtered.sort((a, b) => {
          const pa = getRoomPrice(a.rooms?.[0]) || a.price || a.pricePerNight || 0;
          const pb = getRoomPrice(b.rooms?.[0]) || b.price || b.pricePerNight || 0;
          return pb - pa;
        });
        break;
      case 'rating-desc':
        filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case 'name':
      default:
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
    }

    return filtered;
  };

  const applyFilters = () => {
    const filtered = getFilteredHotels();
    renderHotels(filtered);
  };

  // ═════════════════════════════════════════════════════════════════════
  //  CLEAR FILTERS
  // ═════════════════════════════════════════════════════════════════════

  const clearFilters = () => {
    searchInput.value = '';
    airportFilter.value = 'all';
    priceMin.value = '';
    priceMax.value = '';
    ratingFilter.value = '0';
    sortBy.value = 'name';
    favFilter.value = 'all';
    applyFilters();
  };

  clearFiltersBtn.addEventListener('click', clearFilters);

  // ═════════════════════════════════════════════════════════════════════
  //  POPULATE AIRPORT DROPDOWN
  // ═════════════════════════════════════════════════════════════════════

  const populateAirportFilter = (hotels) => {
    // Keep the "All Airports" option
    airportFilter.innerHTML = '<option value="all">All Airports</option>';
    const codes = [...new Set(hotels.map((h) => h.airportCode).filter(Boolean))].sort();
    codes.forEach((code) => {
      const option = document.createElement('option');
      option.value = code;
      option.textContent = code;
      airportFilter.appendChild(option);
    });
  };

  // ═════════════════════════════════════════════════════════════════════
  //  LOAD LOCAL hotels.json
  // ═════════════════════════════════════════════════════════════════════

  const loadLocalHotels = () => {
    console.log('⏳ Loading local hotels.json');
    return fetch('./hotels.json')
      .then((response) => {
        if (!response.ok) throw new Error(`Status ${response.status}`);
        return response.json();
      });
  };

  // ═════════════════════════════════════════════════════════════════════
  //  MAIN FETCH
  // ═════════════════════════════════════════════════════════════════════

  const fetchHotels = () => {
    showLoading();
    hideError();
    updateOnlineStatus();

    // If offline, go straight to local data
    if (!navigator.onLine) {
      console.log('📡 Offline — loading local data');
      loadLocalHotels()
        .then((hotels) => {
          hideLoading();
          processHotels(hotels);
        })
        .catch((err) => {
          showError('📡 You are offline and no cached data is available.');
        });
      return;
    }

    // ─── Fetch one airport's hotels from Apify ──────────────────────────
    // NOTE: uses `run-sync-get-dataset-items`, which returns the dataset rows
    // (the hotel array) directly — `run-sync` would only return the Actor
    // RUN's metadata, not the scraped hotels.
    // Each SEARCH_CONFIGS entry represents one airport/city. The actor itself
    // has no notion of "airport" — we tag every result with `airportCode`
    // ourselves so the existing Airport filter/badges have something to show.
    const fetchHotelsForAirport = (searchConfig) => {
      const { airportCode, ...apifyInput } = searchConfig;
      return fetch(`https://api.apify.com/v2/acts/voyager~booking-scraper/run-sync-get-dataset-items?token=${APIFY_API_KEY}&timeoutSecs=60`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(apifyInput),
      })
        .then((response) => {
          if (response.status === 429) throw new Error('rate_limited');
          if (!response.ok) throw new Error(`API error: ${response.status} ${response.statusText}`);
          return response.json();
        })
        .then((data) => (Array.isArray(data) ? data : []))
        .then((hotels) => hotels.map((hotel) => ({ ...hotel, airportCode })))
        .catch((err) => {
          if (err.message === 'rate_limited') {
            console.warn(`⏳ Rate limited for ${airportCode} — using local data for this airport`);
            showToast(`⏳ Rate limit reached for ${airportCode} — using local data`);
          } else {
            console.warn(`⚠️ API call failed for ${airportCode}, falling back to local data for this airport:`, err);
          }
          // Only this airport falls back — the others still get live results
          return loadLocalHotels().then((local) => local.filter((h) => h.airportCode === airportCode));
        });
    };

    const loadingText = loadingIndicator.querySelector('p');
    let completedAirports = 0;
    const updateLoadingProgress = () => {
      completedAirports++;
      if (loadingText) {
        loadingText.textContent = `Loading hotels… (${completedAirports}/${SEARCH_CONFIGS.length} airports)`;
      }
    };

    const fetchPromise = (APIFY_API_KEY && APIFY_API_KEY !== 'YOUR_API_TOKEN_HERE')
      ? Promise.all(
          SEARCH_CONFIGS.map((config) =>
            fetchHotelsForAirport(config).then((hotels) => {
              updateLoadingProgress();
              return hotels;
            })
          )
        ).then((resultsPerAirport) => resultsPerAirport.flat())
      : loadLocalHotels();

    return fetchPromise
      .then((hotels) => {
        hideLoading();
        if (loadingText) loadingText.textContent = 'Loading hotels…'; // reset for next time
        console.log('✅ Hotel data received:', hotels);
        console.log(`📦 Received ${hotels.length} hotels across ${SEARCH_CONFIGS.length} airports`);
        processHotels(hotels);
      })
      .catch((error) => {
        hideLoading();
        console.error('❌ Failed to load hotels:', error);
        showError('⚠️ Failed to load hotels.<br/><small>Make sure your API token is set in <code>config.js</code> or try again later.</small>');
      });
  };

  const processHotels = (hotels) => {
    // Log each hotel's key fields for inspection
    hotels.forEach((hotel, i) => {
      console.log(`  ${i + 1}. ${hotel.name}`);
      console.log(`     Price: ${hotel.pricePerNight ? `$${hotel.pricePerNight}` : hotel.currency ? `${hotel.currency}${hotel.price}` : 'N/A'}, Rating: ${hotel.rating}`);
      console.log(`     Address: ${hotel.address?.full || hotel.address}`);
      console.log(`     Image fields:`, Object.keys(hotel).filter(k => k.toLowerCase().includes('image') || k.toLowerCase().includes('photo') || k.toLowerCase().includes('picture')));
      // Log the full image/photo objects to see their structure
      if (hotel.photos) console.log(`     photos[0]:`, JSON.stringify(hotel.photos[0]).slice(0, 300));
      if (hotel.images) console.log(`     images[0]:`, JSON.stringify(hotel.images[0]).slice(0, 300));
      if (hotel.mainPhoto) console.log(`     mainPhoto:`, JSON.stringify(hotel.mainPhoto).slice(0, 300));
    });

    // If API returned data without images, merge local hotel images into the results
    const hasImages = hotels.some(h => {
      if (h.image) return true;
      if (h.mainPhoto && (h.mainPhoto?.url || (Array.isArray(h.mainPhoto) && h.mainPhoto.length > 0))) return true;
      if (h.images && h.images.length > 0) return true;
      if (h.photos && h.photos.length > 0) return true;
      if (h.pictures && h.pictures.length > 0) return true;
      if (h.photo && (h.photo?.main?.url || (Array.isArray(h.photo) && h.photo.length > 0))) return true;
      return false;
    });

    if (!hasImages) {
      console.log('🖼️ API data has no images — merging local hotel images...');
      return loadLocalHotels().then((localHotels) => {
        const merged = hotels.map((apiHotel) => {
          const match = localHotels.find(
            (local) => local.name.toLowerCase() === apiHotel.name.toLowerCase()
          );
          if (match && match.image) {
            return { ...apiHotel, image: match.image };
          }
          return apiHotel;
        });
        finishSetup(merged);
      });
    }

    finishSetup(hotels);
  };

  const finishSetup = (hotels) => {
    // Real Apify-scraped hotels have no `id` field (only the local mock data does),
    // but favorites/DOM tracking rely on `hotel.id` everywhere — assign a stable
    // one here, scoped per airport so it stays consistent across re-renders of
    // the same fetched batch.
    allHotels = hotels.map((hotel, i) => ({
      ...hotel,
      id: String(hotel.id ?? `${hotel.airportCode || 'hotel'}-${i}`),
    }));

    populateAirportFilter(allHotels);
    updateFavCount();
    applyFilters();
  };

  // ═════════════════════════════════════════════════════════════════════
  //  EVENT LISTENERS
  // ═════════════════════════════════════════════════════════════════════

  searchInput.addEventListener('input', applyFilters);
  airportFilter.addEventListener('change', applyFilters);
  priceMin.addEventListener('input', applyFilters);
  priceMax.addEventListener('input', applyFilters);
  ratingFilter.addEventListener('change', applyFilters);
  sortBy.addEventListener('change', applyFilters);
  favFilter.addEventListener('change', applyFilters);

  // Favorites toggle button
  favoritesToggle.addEventListener('click', () => {
    if (favFilter.value === 'favorites') {
      favFilter.value = 'all';
      favoritesToggle.classList.remove('active');
    } else {
      favFilter.value = 'favorites';
    }
    applyFilters();
  });

  retryBtn.addEventListener('click', fetchHotels);

  // ═════════════════════════════════════════════════════════════════════
  //  KICK OFF
  // ═════════════════════════════════════════════════════════════════════

  fetchHotels();
});