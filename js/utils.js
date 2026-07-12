// ─── Utility Functions ─────────────────────────────────────────────────
/* global HotelFinder */
const HF = window.HotelFinder;

// ─── Toast Notifications ───────────────────────────────────────────────
function showToast(message) {
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  HF.elements.toastContainer.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

// ─── Extract Image URL (handles API array formats) ─────────────────────
function extractImageUrl(hotel) {
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
    if (first?.url_max) return first.url_max;
    if (first?.url_640) return first.url_640;
    if (first?.url_square60) return first.url_square60;
  }
  if (hotel.pictures && hotel.pictures.length > 0) {
    const first = hotel.pictures[0];
    if (first?.url) return first.url;
    if (typeof first === 'string') return first;
  }
  if (hotel.images && hotel.images.length > 0) {
    const first = hotel.images[0];
    if (first?.url_max) return first.url_max;
    if (first?.url_640) return first.url_640;
  }
  return '';
}

// ─── Price Formatting ──────────────────────────────────────────────────
function formatPrice(price) {
  if (price == null || isNaN(price)) return null;
  const rounded = Math.round(price * 100) / 100;
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(2);
}

// ─── Rating Normalization ──────────────────────────────────────────────
function getNormalizedRating(hotel) {
  if (hotel.rating == null || isNaN(hotel.rating)) return null;
  return hotel.rating;
}

// ─── Lowest Room Price ─────────────────────────────────────────────────
function getLowestRoomPrice(hotel) {
  const roomPrices = (hotel.rooms || [])
    .map((r) => getRoomPrice(r))
    .filter((p) => p != null && !isNaN(p));
  if (roomPrices.length > 0) return Math.min(...roomPrices);
  const fallback = hotel.price ?? hotel.pricePerNight;
  return fallback != null && !isNaN(fallback) ? fallback : null;
}

// ─── Room Price (handles local + Booking data shapes) ──────────────────
function getRoomPrice(room) {
  if (!room) return null;
  if (room.price != null && !isNaN(room.price)) return room.price;
  if (Array.isArray(room.options) && room.options.length > 0) {
    const optionPrices = room.options
      .map((o) => o.price)
      .filter((p) => p != null && !isNaN(p));
    if (optionPrices.length > 0) return Math.min(...optionPrices);
  }
  return null;
}

// ─── Room Features (handles local + Booking data shapes) ───────────────
function getRoomFeatures(room) {
  if (!room) return [];
  return (room.features || room.facilities || []).filter(Boolean);
}
