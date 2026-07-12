// ─── Filtering & Sorting ───────────────────────────────────────────────
/* global HotelFinder, isFavorited, getRoomPrice, getRoomFeatures, renderHotels */
const HF = window.HotelFinder;
const $ = HF.elements;

// ─── Filter Hotels ─────────────────────────────────────────────────────
function getFilteredHotels() {
  const searchTerm = $.searchInput.value.toLowerCase().trim();
  const airportValue = $.airportFilter.value;
  const minPrice = parseFloat($.priceMin.value);
  const maxPrice = parseFloat($.priceMax.value);
  const minRating = parseFloat($.ratingFilter.value);
  const sortValue = $.sortBy.value;
  const favoritesOnly = $.favFilter.value === 'favorites';

  let filtered = HF.allHotels.filter((hotel) => {
    if (favoritesOnly && !isFavorited(hotel.id)) return false;

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

    if (airportValue !== 'all' && hotel.airportCode !== airportValue) {
      return false;
    }

    const price = getRoomPrice(hotel.rooms?.[0]) || hotel.price || hotel.pricePerNight;
    if (price != null) {
      if (!isNaN(minPrice) && price < minPrice) return false;
      if (!isNaN(maxPrice) && price > maxPrice) return false;
    }

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
}

function applyFilters() {
  const filtered = getFilteredHotels();
  renderHotels(filtered);
}

// ─── Clear Filters ─────────────────────────────────────────────────────
function clearFilters() {
  $.searchInput.value = '';
  $.airportFilter.value = 'all';
  $.priceMin.value = '';
  $.priceMax.value = '';
  $.ratingFilter.value = '0';
  $.sortBy.value = 'name';
  $.favFilter.value = 'all';
  applyFilters();
}

$.clearFiltersBtn.addEventListener('click', clearFilters);

// ─── Populate Airport Dropdown ─────────────────────────────────────────
function populateAirportFilter(hotels) {
  $.airportFilter.innerHTML = '<option value="all">All Airports</option>';
  const codes = [...new Set(hotels.map((h) => h.airportCode).filter(Boolean))].sort();
  codes.forEach((code) => {
    const option = document.createElement('option');
    option.value = code;
    option.textContent = code;
    $.airportFilter.appendChild(option);
  });
}