const CFG = window.HotelConfig;

async function fetchAirportHotels(airportCode, searchQuery) {
  const url = `https://hotel-finder-steel.vercel.app/api/hotels?q=${encodeURIComponent(searchQuery)}&check_in=${CFG.CHECK_IN}&check_out=${CFG.CHECK_OUT}`;
  const res = await fetch(url);
  const data = await res.json();

  const properties = data.properties || [];

  return properties.map(p => ({
    id: p.id || `${airportCode}-${Math.random().toString(36).slice(2)}`,
    name: p.name || "Unnamed Hotel",
    airportCode,
    address: p.address || p.nearby_places?.[0]?.name || "Address unavailable",

    // ⭐ SAFE DEFAULTS
    rating: p.overall_rating ?? 0,
    price: p.rate_per_night?.extracted_lowest ?? 0,

    currency: "USD",
    image: p.images?.[0]?.original_image || p.thumbnail || "",
    rooms: (p.prices || []).map(pr => ({
      type: pr.source || pr.room_type || "Room",
      price: pr.rate_per_night?.extracted_lowest ?? 0,
      available: true,
      description: pr.description || "",
      features: p.amenities || []
    }))
  }));
}

async function loadHotels() {
  document.getElementById("loading-indicator").style.display = "flex";

  try {
    const all = [];

    for (const airport of CFG.AIRPORTS) {
      const hotels = await fetchAirportHotels(airport.airportCode, airport.search);
      all.push(...hotels);
    }

    window.State = { hotels: all };
    const filtered = applyFilters(all);
    renderHotels(filtered);
  } catch (err) {
    document.getElementById("error-message").style.display = "flex";
  }

  document.getElementById("loading-indicator").style.display = "none";
}

function applyFilters(hotels) {
  const searchText = document.getElementById("search-input").value.toLowerCase();
  const airport = document.getElementById("airport-filter").value;
  const minPrice = Number(document.getElementById("price-min").value) || 0;
  const maxPrice = Number(document.getElementById("price-max").value) || Infinity;
  const minRating = Number(document.getElementById("rating-filter").value) || 0;
  const favFilter = document.getElementById("fav-filter").value;
  const sortBy = document.getElementById("sort-by").value;

  let filtered = hotels.filter(h => {
    if (airport !== "all" && h.airportCode !== airport) return false;
    if (searchText && !h.name.toLowerCase().includes(searchText)) return false;
    if (h.price < minPrice) return false;
    if (h.price > maxPrice) return false;
    if (h.rating < minRating) return false;
    if (favFilter === "favorites" && !window.Favorites?.includes(h.id)) return false;
    return true;
  });

  filtered.sort((a, b) => {
    switch (sortBy) {
      case "name": return a.name.localeCompare(b.name);
      case "price-asc": return a.price - b.price;
      case "price-desc": return b.price - a.price;
      case "rating-desc": return b.rating - a.rating;
      default: return 0;
    }
  });

  return filtered;
}

function renderHotels(hotels) {
  const results = document.getElementById("results");

  if (!hotels.length) {
    document.getElementById("empty-state").style.display = "flex";
    return;
  }

  document.getElementById("empty-state").style.display = "none";

  results.innerHTML = hotels
    .map(h => {
      const price = h.price ? `$${h.price}` : "Price unavailable";
      const rating = h.rating ? h.rating.toFixed(1) : "No rating";

      return `
        <article class="hotel-card">
          <img src="${h.image}" class="hotel-image" alt="${h.name}">
          <h3>${h.name}</h3>
          <p>${h.address}</p>
          <p>Rating: ${rating}</p>
          <p>${price}/night</p>
        </article>
      `;
    })
    .join("");
}

document.addEventListener("DOMContentLoaded", loadHotels);

// ⭐ LIVE FILTER UPDATES
["search-input", "airport-filter", "price-min", "price-max", "rating-filter", "fav-filter", "sort-by"]
  .forEach(id => {
    document.getElementById(id).addEventListener("input", () => {
      const filtered = applyFilters(window.State.hotels);
      renderHotels(filtered);
    });
  });
