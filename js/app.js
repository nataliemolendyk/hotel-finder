const CFG = window.HotelConfig;

async function fetchAirportHotels(airportCode, searchQuery) {
  const url = `/api/hotels?q=${encodeURIComponent(searchQuery)}&check_in=${CFG.CHECK_IN}&check_out=${CFG.CHECK_OUT}`;
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
  document.getElementById("loading-indicator").style.display = "flex";

  try {
    const all = [];

    for (const airport of CFG.AIRPORTS) {
      const hotels = await fetchAirportHotels(airport.airportCode, airport.search);
      all.push(...hotels);
    }

    window.State = { hotels: all };
    renderHotels(all);
  } catch (err) {
    document.getElementById("error-message").style.display = "flex";
  }

  document.getElementById("loading-indicator").style.display = "none";
}

function renderHotels(hotels) {
  const results = document.getElementById("results");

  if (!hotels.length) {
    document.getElementById("empty-state").style.display = "flex";
    return;
  }

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
