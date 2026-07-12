// ─── Data Fetching ─────────────────────────────────────────────────────
/* global HotelFinder, APIFY_API_KEY, SEARCH_CONFIGS, showLoading, hideLoading,
          showError, showToast, updateOnlineStatus, processHotels */
const HF = window.HotelFinder;

// ─── Load Local hotels.json ────────────────────────────────────────────
function loadLocalHotels() {
  console.log('⏳ Loading local hotels.json');
  return fetch('./hotels.json')
    .then((response) => {
      if (!response.ok) throw new Error(`Status ${response.status}`);
      return response.json();
    });
}

// ─── Main Fetch ────────────────────────────────────────────────────────
function fetchHotels() {
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
      .catch(() => {
        showError('📡 You are offline and no cached data is available.');
      });
    return;
  }

  // ─── Fetch one airport's hotels from Apify ──────────────────────────
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
        return loadLocalHotels().then((local) => local.filter((h) => h.airportCode === airportCode));
      });
  };

  const loadingText = HF.elements.loadingIndicator.querySelector('p');
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
      if (loadingText) loadingText.textContent = 'Loading hotels…';
      console.log('✅ Hotel data received:', hotels);
      console.log(`📦 Received ${hotels.length} hotels across ${SEARCH_CONFIGS.length} airports`);
      processHotels(hotels);
    })
    .catch((error) => {
      hideLoading();
      console.error('❌ Failed to load hotels:', error);
      showError('⚠️ Failed to load hotels.<br/><small>Make sure your API token is set in <code>config.js</code> or try again later.</small>');
    });
}

// ─── Process & Merge ───────────────────────────────────────────────────
function processHotels(hotels) {
  hotels.forEach((hotel, i) => {
    console.log(`  ${i + 1}. ${hotel.name}`);
    console.log(`     Price: ${hotel.pricePerNight ? `$${hotel.pricePerNight}` : hotel.currency ? `${hotel.currency}${hotel.price}` : 'N/A'}, Rating: ${hotel.rating}`);
    console.log(`     Address: ${hotel.address?.full || hotel.address}`);
    console.log(`     Image fields:`, Object.keys(hotel).filter(k => k.toLowerCase().includes('image') || k.toLowerCase().includes('photo') || k.toLowerCase().includes('picture')));
    if (hotel.photos) console.log(`     photos[0]:`, JSON.stringify(hotel.photos[0]).slice(0, 300));
    if (hotel.images) console.log(`     images[0]:`, JSON.stringify(hotel.images[0]).slice(0, 300));
    if (hotel.mainPhoto) console.log(`     mainPhoto:`, JSON.stringify(hotel.mainPhoto).slice(0, 300));
  });

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
}

// ─── Finish Setup ──────────────────────────────────────────────────────
function finishSetup(hotels) {
  HF.allHotels = hotels.map((hotel, i) => ({
    ...hotel,
    id: String(hotel.id ?? `${hotel.airportCode || 'hotel'}-${i}`),
  }));

  populateAirportFilter(HF.allHotels);
  updateFavCount();
  applyFilters();
}