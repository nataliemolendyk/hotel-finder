// ─── UI / Rendering ────────────────────────────────────────────────────
/* global HotelFinder, isFavorited, toggleFavorite, formatPrice,
          extractImageUrl, getRoomPrice, getLowestRoomPrice, getRoomFeatures */
const HF = window.HotelFinder;
const $ = HF.elements;

// ─── Show / Hide Helpers ───────────────────────────────────────────────
function showLoading() {
  $.loadingIndicator.style.display = 'flex';
  $.results.innerHTML = '';
  $.errorMessage.style.display = 'none';
  $.emptyState.style.display = 'none';
}

function hideLoading() {
  $.loadingIndicator.style.display = 'none';
}

function showError(msg) {
  hideLoading();
  $.results.innerHTML = '';
  $.emptyState.style.display = 'none';
  $.errorText.innerHTML = msg || '⚠️ Something went wrong while loading hotels.<br/><small>Check your API token or try again later.</small>';
  $.errorMessage.style.display = 'flex';
}

function hideError() {
  $.errorMessage.style.display = 'none';
}

function showEmptyState(msg) {
  hideLoading();
  $.results.innerHTML = '';
  $.errorMessage.style.display = 'none';
  $.emptyText.textContent = msg || 'No hotels found matching your criteria.';
  $.emptyState.style.display = 'flex';
}

function hideEmptyState() {
  $.emptyState.style.display = 'none';
}

// ─── Offline Detection ─────────────────────────────────────────────────
function updateOnlineStatus() {
  if (navigator.onLine) {
    $.offlineBanner.style.display = 'none';
  } else {
    $.offlineBanner.style.display = 'flex';
  }
}

window.addEventListener('online', updateOnlineStatus);
window.addEventListener('offline', updateOnlineStatus);

// ─── Render Hotel Cards ────────────────────────────────────────────────
function renderHotels(hotels) {
  hideEmptyState();
  hideError();

  if (!hotels.length) {
    showEmptyState('No hotels match your filters. Try adjusting your search criteria.');
    $.resultCount.textContent = '0 results';
    return;
  }

  $.resultCount.textContent = `${hotels.length} result${hotels.length !== 1 ? 's' : ''}`;

  $.results.innerHTML = hotels
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
  document.querySelectorAll('.fav-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleFavorite(btn.dataset.hotelId);
    });
  });

  document.querySelectorAll('.view-details-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = btn.dataset.hotelId;
      const hotel = HF.allHotels.find((h) => h.id === id);
      if (hotel) openDetailModal(hotel);
    });
  });

  document.querySelectorAll('.hotel-card').forEach((card) => {
    card.addEventListener('click', (e) => {
      if (e.target.closest('.fav-btn')) return;
      if (e.target.closest('.view-details-btn')) return;
      const id = card.dataset.hotelId;
      const hotel = HF.allHotels.find((h) => h.id === id);
      if (hotel) openDetailModal(hotel);
    });
  });
}

// ─── Detail Modal ──────────────────────────────────────────────────────
function openDetailModal(hotel) {
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

  $.modalBody.innerHTML = `
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

  $.modalBody.querySelector('.modal-fav-btn')?.addEventListener('click', (e) => {
    toggleFavorite(e.currentTarget.dataset.hotelId);
    const id = e.currentTarget.dataset.hotelId;
    e.currentTarget.classList.toggle('favorited', isFavorited(id));
    e.currentTarget.innerHTML = isFavorited(id) ? '♥ Remove from Favorites' : '♡ Add to Favorites';
  });

  $.modal.style.display = 'flex';
  document.body.style.overflow = 'hidden';
}

function closeDetailModal() {
  $.modal.style.display = 'none';
  document.body.style.overflow = '';
}

$.modalClose.addEventListener('click', closeDetailModal);
$.modal.addEventListener('click', (e) => {
  if (e.target === $.modal) closeDetailModal();
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeDetailModal();
});