document.addEventListener('DOMContentLoaded', () => {
  const resultsContainer = document.getElementById('results');
  const airportHeading = document.getElementById('airport-heading');

  // ─── Helper: Render hotel cards on the page ─────────────────────────────
  const renderHotels = (hotels) => {
    resultsContainer.innerHTML = hotels
      .map((hotel) => {
        // Handle both API format and local JSON format
        const nightlyPrice = hotel.rooms?.[0]?.price || hotel.price || hotel.pricePerNight;
        const currencySymbol = hotel.currency || '$';
        const priceDisplay = nightlyPrice
          ? `${currencySymbol}${nightlyPrice}`
          : 'Price on request';
        const ratingDisplay = hotel.rating
          ? `⭐ ${hotel.rating}${hotel.ratingLabel ? ' · ' + hotel.ratingLabel : ''}`
          : '';
        const addressDisplay = hotel.address?.full || hotel.address?.street || hotel.address || 'Address unavailable';
        const roomFeatures = hotel.rooms?.[0]?.features?.join(', ') || hotel.roomOfferings || '';
        const imageUrl = hotel.image || '';
        const bookingUrl = hotel.url || '#';

        return `
          <article class="hotel-card">
            ${imageUrl ? `<img src="${imageUrl}" alt="${hotel.name}" class="hotel-image" />` : ''}
            <div class="hotel-card-body">
              <h3>${hotel.name}</h3>
              <div class="hotel-meta">
                <span>${ratingDisplay}</span>
                <span>${priceDisplay}/night</span>
              </div>
              <div class="hotel-details">
                <div><strong>Address:</strong> ${addressDisplay}</div>
                ${roomFeatures ? `<div><strong>Features:</strong> ${roomFeatures}</div>` : ''}
                ${hotel.stars ? `<div><strong>Stars:</strong> ${'★'.repeat(hotel.stars)}</div>` : ''}
                ${hotel.reviews ? `<div><strong>Reviews:</strong> ${hotel.reviews} reviews</div>` : ''}
              </div>
              <a href="${bookingUrl}" target="_blank" class="book-btn" rel="noopener">Book Now →</a>
            </div>
          </article>
        `;
      })
      .join('');
  };

  // ─── 1. Load local hotels.json (fallback) ──────────────────────────────
  const loadLocalHotels = () => {
    console.log('⏳ Loading local hotels.json');
    return fetch('./hotels.json')
      .then((response) => {
        if (!response.ok) throw new Error(`Status ${response.status}`);
        return response.json();
      })
      .then((data) => data.filter((h) => h.airportCode === 'SFO'));
  };

  console.log('⏳ Starting hotel fetch…');

  // Try API first if configured, otherwise go straight to local data
  const fetchPromise = (APIFY_API_KEY && APIFY_API_KEY !== 'YOUR_API_TOKEN_HERE')
    ? fetch(`https://api.apify.com/v2/acts/voyager~booking-scraper/run-sync?token=${APIFY_API_KEY}&timeoutSecs=60`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(SEARCH_CONFIG),
      })
        .then((response) => {
          if (!response.ok) throw new Error(`API error: ${response.status} ${response.statusText}`);
          return response.json();
        })
        .then((data) => data?.data?.output || data || [])
        .catch((err) => {
          console.warn('⚠️ API call failed, falling back to local hotels.json:', err);
          return loadLocalHotels();
        })
    : loadLocalHotels();

  fetchPromise
    .then((hotels) => {
      // ─── 2. console.log the response to understand the JSON structure ──
      console.log('✅ Hotel data received:', hotels);

      // Log each hotel's key fields so we can inspect the structure
      console.log(`📦 Received ${hotels.length} hotels:`);
      hotels.forEach((hotel, i) => {
        console.log(`  ${i + 1}. ${hotel.name}`);
        console.log(`     Price: ${hotel.pricePerNight ? `$${hotel.pricePerNight}` : hotel.currency ? `${hotel.currency}${hotel.price}` : 'N/A'}, Rating: ${hotel.rating}`);
        console.log(`     Address: ${hotel.address?.full || hotel.address}`);
        console.log(`     URL: ${hotel.url || 'N/A'}`);
      });

      airportHeading.textContent = `Hotels in ${SEARCH_CONFIG.search || 'San Francisco'}`;
      renderHotels(hotels);
    })
    .catch((error) => {
      console.error('❌ Failed to load hotels:', error);
      resultsContainer.innerHTML = `
        <p class="empty-state">
          Unable to load hotel data.<br />
          <small>Make sure your API token is set in <code>config.js</code>.</small>
        </p>`;
    });
});
