let favorites = JSON.parse(localStorage.getItem("favorites") || "[]");
let currentHotels = [];
let currentQuery = "";

function showToast(msg) {
  const container = document.getElementById("toastContainer");
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = msg;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

function updateFavCount() {
  document.getElementById("favCount").textContent = favorites.length;
}

function toggleFavorite(hotel) {
  const exists = favorites.find(f => f.name === hotel.name);

  if (exists) {
    favorites = favorites.filter(f => f.name !== hotel.name);
    showToast("Removed from favorites");
  } else {
    favorites.push(hotel);
    showToast("Added to favorites");
  }

  localStorage.setItem("favorites", JSON.stringify(favorites));
  updateFavCount();
}

function openDetails(hotel) {
  const overlay = document.createElement("div");
  overlay.className = "modal-overlay";

  overlay.innerHTML = `
    <div class="modal-content">
      <button class="modal-close" onclick="this.parentElement.parentElement.remove()">×</button>

      <div class="modal-body">
        <img src="${hotel.images?.[0]?.url || hotel.images?.[0]?.thumbnail || hotel.image || hotel.thumbnail || ""}" class="modal-image" onerror="this.style.display='none'" />

        <div class="modal-info">
          <h2>${hotel.name}</h2>

          <div class="modal-meta">
            <span>★ ${hotel.rating || "N/A"}</span>
            <span>${hotel.price?.lowest_price || hotel.price || "N/A"}</span>
          </div>

          <div class="modal-address">
            <span class="modal-addr-icon">⌂</span>
            <span>${hotel.address || hotel.location || "Address not available"}</span>
          </div>

          <div class="modal-section">
            <h3>Room Types</h3>
            <ul class="modal-rooms-list">
              ${
                hotel.room_types
                  ? hotel.room_types
                      .map(
                        r => `
                <li class="modal-room-item">
                  <span class="room-type">${r.name}</span>
                  <span class="room-price">${r.price || "N/A"}</span>
                  <div class="room-features">${r.features?.join(", ") || ""}</div>
                </li>`
                      )
                      .join("")
                  : "<li>No room types listed</li>"
              }
            </ul>
          </div>

          <button class="modal-fav-btn" onclick='toggleFavorite(${JSON.stringify(
            hotel
          )})'>
            ♡ Add to Favorites
          </button>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);
}

function parsePrice(priceVal) {
  if (!priceVal) return NaN;
  const str = String(priceVal);
  const num = parseFloat(str.replace(/[^0-9.]/g, ""));
  return isNaN(num) ? NaN : num;
}

function applyFilters(hotels) {
  const minPriceEl = document.getElementById("filterMinPrice");
  const minPrice = minPriceEl ? parseFloat(minPriceEl.value) : NaN;
  const maxPrice = parseFloat(document.getElementById("filterMaxPrice").value);
  const minRating = parseFloat(document.getElementById("filterMinRating").value);
  const sort = document.getElementById("filterSort").value;

  let filtered = hotels.filter(h => {
    const p = parsePrice(h.price?.lowest_price || h.price);
    const r = parseFloat(h.rating);

    if (!isNaN(minPrice) && (isNaN(p) || p < minPrice)) return false;
    if (!isNaN(maxPrice) && (isNaN(p) || p > maxPrice)) return false;
    if (!isNaN(minRating) && (isNaN(r) || r < minRating)) return false;

    return true;
  });

  if (sort === "price-asc") {
    filtered.sort((a, b) => {
      const pa = parsePrice(a.price?.lowest_price || a.price);
      const pb = parsePrice(b.price?.lowest_price || b.price);
      return (isNaN(pa) ? Infinity : pa) - (isNaN(pb) ? Infinity : pb);
    });
  } else if (sort === "price-desc") {
    filtered.sort((a, b) => {
      const pa = parsePrice(a.price?.lowest_price || a.price);
      const pb = parsePrice(b.price?.lowest_price || b.price);
      return (isNaN(pb) ? -Infinity : pb) - (isNaN(pa) ? -Infinity : pa);
    });
  } else if (sort === "rating-desc") {
    filtered.sort((a, b) => {
      const ra = parseFloat(a.rating);
      const rb = parseFloat(b.rating);
      return (isNaN(rb) ? -Infinity : rb) - (isNaN(ra) ? -Infinity : ra);
    });
  }

  return filtered;
}

function renderHotels(hotels, container) {
  container.innerHTML = "";

  if (hotels.length === 0) {
    container.innerHTML = `
      <div class="results-header">
        <h2>No Results</h2>
      </div>
      <div class="empty-state">
        <div class="empty-icon">−</div>
        <p>No hotels match your filters. Try adjusting them.</p>
      </div>
    `;
    return;
  }

  const header = document.createElement("div");
  header.className = "results-header";
  header.innerHTML = `<h2>${hotels.length} hotel${hotels.length !== 1 ? "s" : ""} found</h2>`;
  container.appendChild(header);

  const list = document.createElement("div");
  list.className = "results-list";

  hotels.forEach(hotel => {
    const card = document.createElement("div");
    card.className = "hotel-card";

    // Pick the best available image: images[0].url > images[0].thumbnail > hotel.image > hotel.thumbnail
    const img =
      hotel.images?.[0]?.url ||
      hotel.images?.[0]?.thumbnail ||
      hotel.image ||
      hotel.thumbnail ||
      "";

    const name = hotel.name || hotel.hotel_name || "Unknown Hotel";
    const rating = hotel.rating || hotel.star_rating || "N/A";
    const price = hotel.price?.lowest_price || hotel.price || hotel.rate_per_night?.lowest || "N/A";
    const address = hotel.address || hotel.location || "Address not available";

    card.innerHTML = `
      <div class="hotel-image-wrapper">
        ${
          img
            ? `<img src="${img}" class="hotel-image" alt="${name}" onerror="this.parentElement.innerHTML='<div class=\\'hotel-image-placeholder\\'><span class=\\'placeholder-icon\\'></span></div>'" />`
            : `<div class="hotel-image-placeholder"><span class="placeholder-icon"></span></div>`
        }
        <button class="fav-btn" aria-label="Toggle favorite">♡</button>
      </div>

      <div class="hotel-card-body">
        <h3>${name}</h3>

        <div class="hotel-meta">
          <span class="meta-rating">★ ${rating}</span>
          <span class="meta-price">${price}</span>
        </div>

        <div class="hotel-details">
          <div class="detail-row">
            <span class="detail-icon">⌂</span>
            <span>${address}</span>
          </div>
        </div>

        <button class="view-details-btn">View Details</button>
      </div>
    `;

    card.querySelector(".view-details-btn").onclick = () => openDetails(hotel);
    card.querySelector(".fav-btn").onclick = () => toggleFavorite(hotel);

    list.appendChild(card);
  });

  container.appendChild(list);
}

function renderWithFilters(hotels, container) {
  currentHotels = hotels;
  const filtered = applyFilters(hotels);
  renderHotels(filtered, container);
}

function applyCurrentFilters() {
  const container = document.getElementById("results");
  const filtered = applyFilters(currentHotels);
  renderHotels(filtered, container);
}

async function searchHotels() {
  const query = document.getElementById("searchInput").value.trim();
  const container = document.getElementById("results");

  currentQuery = query;

  container.innerHTML = `
    <div class="loading-indicator">
      <div class="spinner"></div>
      <p>Loading hotels...</p>
    </div>
  `;

  // Try the real API via Vercel serverless function
  try {
    const res = await fetch(`/api/hotels?q=${encodeURIComponent(query)}`);
    const data = await res.json();

    // Handle various API response shapes
    const hotels = data.hotels || [];

    if (hotels.length > 0) {
      renderWithFilters(hotels, container);
      return;
    }
  } catch (err) {
    console.warn("API call failed:", err.message);
  }

  // Fallback to mock data
  const mockHotels = getMockHotels(query);
  if (mockHotels.length > 0) {
    renderWithFilters(mockHotels, container);
  } else {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">−</div>
        <p>No hotels found for "${query}".</p>
      </div>
    `;
  }
}

function getMockHotels(query) {
  const mockData = {
    "las vegas": [
      {
        name: "The Venetian Resort",
        rating: "4.5",
        price: { lowest_price: "$129" },
        address: "3355 S Las Vegas Blvd, Las Vegas, NV 89109",
        images: [{ url: "https://picsum.photos/seed/venetian/600/400" }],
        room_types: [
          { name: "Standard King", price: "$129", features: ["Free WiFi", "City View"] },
          { name: "Suite", price: "$249", features: ["Living Room", "Strip View"] }
        ]
      },
      {
        name: "Caesars Palace",
        rating: "4.3",
        price: { lowest_price: "$99" },
        address: "3570 S Las Vegas Blvd, Las Vegas, NV 89109",
        images: [{ url: "https://picsum.photos/seed/caesars-palace/600/400" }],
        room_types: [
          { name: "Standard Room", price: "$99", features: ["Free WiFi"] },
          { name: "Premium Suite", price: "$199", features: ["Strip View", "Jacuzzi"] }
        ]
      },
      {
        name: "ARIA Resort & Casino",
        rating: "4.6",
        price: { lowest_price: "$159" },
        address: "3730 S Las Vegas Blvd, Las Vegas, NV 89158",
        images: [{ url: "https://picsum.photos/seed/aria/600/400" }],
        room_types: [
          { name: "Deluxe King", price: "$159", features: ["City View", "Free WiFi"] },
          { name: "Corner Suite", price: "$299", features: ["Panoramic View", "Living Room"] }
        ]
      },
      {
        name: "The Cosmopolitan",
        rating: "4.4",
        price: { lowest_price: "$179" },
        address: "3708 S Las Vegas Blvd, Las Vegas, NV 89109",
        images: [{ url: "https://picsum.photos/seed/cosmopolitan/600/400" }],
        room_types: [
          { name: "Studio", price: "$179", features: ["Balcony", "Free WiFi"] },
          { name: "One Bedroom", price: "$279", features: ["Strip View", "Kitchen"] }
        ]
      },
      {
        name: "Wynn Las Vegas",
        rating: "4.7",
        price: { lowest_price: "$199" },
        address: "3131 S Las Vegas Blvd, Las Vegas, NV 89109",
        images: [{ url: "https://picsum.photos/seed/wynn/600/400" }],
        room_types: [
          { name: "Resort King", price: "$199", features: ["Garden View", "Free WiFi"] },
          { name: "Tower Suite", price: "$399", features: ["Panoramic View", "Butler Service"] }
        ]
      }
    ],
    "new york": [
      {
        name: "The Plaza Hotel",
        rating: "4.6",
        price: { lowest_price: "$349" },
        address: "768 5th Ave, New York, NY 10019",
        images: [{ url: "https://picsum.photos/seed/plaza/600/400" }],
        room_types: [
          { name: "Classic Room", price: "$349", features: ["City View", "Free WiFi"] },
          { name: "Suite", price: "$699", features: ["Central Park View", "Living Room"] }
        ]
      },
      {
        name: "The Ritz-Carlton New York",
        rating: "4.7",
        price: { lowest_price: "$499" },
        address: "50 Central Park S, New York, NY 10019",
        images: [{ url: "https://picsum.photos/seed/ritz-carlton-ny/600/400" }],
        room_types: [
          { name: "Deluxe Room", price: "$499", features: ["Park View", "Free WiFi"] },
          { name: "Executive Suite", price: "$899", features: ["Living Room", "Butler Service"] }
        ]
      },
      {
        name: "The Langham, New York",
        rating: "4.5",
        price: { lowest_price: "$279" },
        address: "400 5th Ave, New York, NY 10018",
        images: [{ url: "https://picsum.photos/seed/langham-ny/600/400" }],
        room_types: [
          { name: "Superior Room", price: "$279", features: ["City View", "Free WiFi"] },
          { name: "Junior Suite", price: "$459", features: ["Living Area", "Club Access"] }
        ]
      }
    ],
    "san francisco": [
      {
        name: "Fairmont San Francisco",
        rating: "4.4",
        price: { lowest_price: "$189" },
        address: "950 Mason St, San Francisco, CA 94108",
        images: [{ url: "https://picsum.photos/seed/fairmont-sf/600/400" }],
        room_types: [
          { name: "Classic Room", price: "$189", features: ["City View", "Free WiFi"] },
          { name: "Suite", price: "$349", features: ["Bay View", "Living Room"] }
        ]
      },
      {
        name: "Hotel Nikko San Francisco",
        rating: "4.3",
        price: { lowest_price: "$159" },
        address: "222 Mason St, San Francisco, CA 94102",
        images: [{ url: "https://picsum.photos/seed/nikko-sf/600/400" }],
        room_types: [
          { name: "Standard King", price: "$159", features: ["Free WiFi"] },
          { name: "Executive Suite", price: "$289", features: ["City View", "Club Access"] }
        ]
      },
      {
        name: "The Ritz-Carlton San Francisco",
        rating: "4.6",
        price: { lowest_price: "$299" },
        address: "600 Stockton St, San Francisco, CA 94108",
        images: [{ url: "https://picsum.photos/seed/ritz-carlton-sf/600/400" }],
        room_types: [
          { name: "Deluxe Room", price: "$299", features: ["City View", "Free WiFi"] },
          { name: "Club Suite", price: "$549", features: ["Club Lounge", "Living Room"] }
        ]
      }
    ],
    "miami": [
      {
        name: "Fontainebleau Miami Beach",
        rating: "4.5",
        price: { lowest_price: "$249" },
        address: "4441 Collins Ave, Miami Beach, FL 33140",
        images: [{ url: "https://picsum.photos/seed/fontainebleau/600/400" }],
        room_types: [
          { name: "Ocean View King", price: "$249", features: ["Ocean View", "Free WiFi"] },
          { name: "Suite", price: "$449", features: ["Ocean View", "Living Room", "Balcony"] }
        ]
      },
      {
        name: "The Setai Miami Beach",
        rating: "4.7",
        price: { lowest_price: "$399" },
        address: "2001 Collins Ave, Miami Beach, FL 33139",
        images: [{ url: "https://picsum.photos/seed/setai/600/400" }],
        room_types: [
          { name: "Ocean Suite", price: "$399", features: ["Ocean View", "Free WiFi"] },
          { name: "Penthouse", price: "$899", features: ["Panoramic View", "Butler Service"] }
        ]
      },
      {
        name: "Faena Hotel Miami Beach",
        rating: "4.4",
        price: { lowest_price: "$299" },
        address: "3201 Collins Ave, Miami Beach, FL 33140",
        images: [{ url: "https://picsum.photos/seed/faena/600/400" }],
        room_types: [
          { name: "Deluxe Room", price: "$299", features: ["Ocean View", "Free WiFi"] },
          { name: "Suite", price: "$599", features: ["Living Room", "Balcony"] }
        ]
      }
    ],
    "chicago": [
      {
        name: "The Peninsula Chicago",
        rating: "4.6",
        price: { lowest_price: "$299" },
        address: "108 E Superior St, Chicago, IL 60611",
        images: [{ url: "https://picsum.photos/seed/peninsula-chicago/600/400" }],
        room_types: [
          { name: "Deluxe King", price: "$299", features: ["City View", "Free WiFi"] },
          { name: "Suite", price: "$599", features: ["Lake View", "Living Room"] }
        ]
      },
      {
        name: "The Langham Chicago",
        rating: "4.5",
        price: { lowest_price: "$269" },
        address: "330 N Wabash Ave, Chicago, IL 60611",
        images: [{ url: "https://picsum.photos/seed/langham-chicago/600/400" }],
        room_types: [
          { name: "Superior Room", price: "$269", features: ["River View", "Free WiFi"] },
          { name: "Executive Suite", price: "$529", features: ["City View", "Club Access"] }
        ]
      },
      {
        name: "Four Seasons Chicago",
        rating: "4.7",
        price: { lowest_price: "$349" },
        address: "120 E Delaware Pl, Chicago, IL 60611",
        images: [{ url: "https://picsum.photos/seed/four-seasons-chicago/600/400" }],
        room_types: [
          { name: "Premier King", price: "$349", features: ["City View", "Free WiFi"] },
          { name: "Suite", price: "$699", features: ["Lake View", "Living Room"] }
        ]
      }
    ],
    "london": [
      {
        name: "The Savoy",
        rating: "4.7",
        price: { lowest_price: "£299" },
        address: "Strand, London WC2R 0EZ, UK",
        images: [{ url: "https://picsum.photos/seed/savoy/600/400" }],
        room_types: [
          { name: "Classic Room", price: "£299", features: ["City View", "Free WiFi"] },
          { name: "River Suite", price: "£699", features: ["Thames View", "Living Room"] }
        ]
      },
      {
        name: "The Ritz London",
        rating: "4.8",
        price: { lowest_price: "£399" },
        address: "150 Piccadilly, London W1J 9BR, UK",
        images: [{ url: "https://picsum.photos/seed/ritz-london/600/400" }],
        room_types: [
          { name: "Superior Room", price: "£399", features: ["City View", "Free WiFi"] },
          { name: "Suite", price: "£899", features: ["Living Room", "Butler Service"] }
        ]
      },
      {
        name: "The Dorchester",
        rating: "4.6",
        price: { lowest_price: "£349" },
        address: "53 Park Ln, London W1K 1QA, UK",
        images: [{ url: "https://picsum.photos/seed/dorchester/600/400" }],
        room_types: [
          { name: "Deluxe Room", price: "£349", features: ["Park View", "Free WiFi"] },
          { name: "Executive Suite", price: "£749", features: ["Living Room", "Club Access"] }
        ]
      }
    ],
    "paris": [
      {
        name: "Hôtel Ritz Paris",
        rating: "4.8",
        price: { lowest_price: "€499" },
        address: "15 Place Vendôme, 75001 Paris, France",
        images: [{ url: "https://picsum.photos/seed/ritz-paris/600/400" }],
        room_types: [
          { name: "Classic Room", price: "€499", features: ["City View", "Free WiFi"] },
          { name: "Suite", price: "€999", features: ["Place Vendôme View", "Living Room"] }
        ]
      },
      {
        name: "Le Meurice",
        rating: "4.7",
        price: { lowest_price: "€399" },
        address: "228 Rue de Rivoli, 75001 Paris, France",
        images: [{ url: "https://picsum.photos/seed/meurice/600/400" }],
        room_types: [
          { name: "Superior Room", price: "€399", features: ["City View", "Free WiFi"] },
          { name: "Suite", price: "€799", features: ["Tuileries View", "Living Room"] }
        ]
      },
      {
        name: "Four Seasons George V",
        rating: "4.9",
        price: { lowest_price: "€599" },
        address: "31 Av. George V, 75008 Paris, France",
        images: [{ url: "https://picsum.photos/seed/george-v/600/400" }],
        room_types: [
          { name: "Premier Room", price: "€599", features: ["City View", "Free WiFi"] },
          { name: "Suite", price: "€1,199", features: ["Eiffel Tower View", "Living Room"] }
        ]
      }
    ],
    "tokyo": [
      {
        name: "The Peninsula Tokyo",
        rating: "4.7",
        price: { lowest_price: "¥45,000" },
        address: "1-8-1 Yurakucho, Chiyoda City, Tokyo 100-0006, Japan",
        images: [{ url: "https://picsum.photos/seed/peninsula-tokyo/600/400" }],
        room_types: [
          { name: "Deluxe Room", price: "¥45,000", features: ["City View", "Free WiFi"] },
          { name: "Suite", price: "¥90,000", features: ["Imperial Garden View", "Living Room"] }
        ]
      },
      {
        name: "Aman Tokyo",
        rating: "4.9",
        price: { lowest_price: "¥80,000" },
        address: "1-5-6 Otemachi, Chiyoda City, Tokyo 100-0004, Japan",
        images: [{ url: "https://picsum.photos/seed/aman-tokyo/600/400" }],
        room_types: [
          { name: "Premier Room", price: "¥80,000", features: ["City View", "Free WiFi"] },
          { name: "Suite", price: "¥150,000", features: ["Panoramic View", "Living Room", "Japanese Bath"] }
        ]
      },
      {
        name: "Park Hyatt Tokyo",
        rating: "4.6",
        price: { lowest_price: "¥35,000" },
        address: "3-7-1-2 Nishi-Shinjuku, Shinjuku City, Tokyo 163-1055, Japan",
        images: [{ url: "https://picsum.photos/seed/park-hyatt-tokyo/600/400" }],
        room_types: [
          { name: "Standard King", price: "¥35,000", features: ["City View", "Free WiFi"] },
          { name: "Executive Suite", price: "¥75,000", features: ["Mt. Fuji View", "Club Access"] }
        ]
      }
    ]
  };

  const q = query ? query.toLowerCase().trim() : "";

  // If no search query, return ALL hotels from every city
  if (!q) {
    return Object.values(mockData).flat();
  }

  // Try to find a matching city key
  const matchedKey = Object.keys(mockData).find(k => q.includes(k) || k.includes(q));

  if (matchedKey) {
    return mockData[matchedKey];
  }

  // If no specific city match, search across ALL cities for hotels whose name/address matches
  const matchedHotels = [];
  for (const city of Object.keys(mockData)) {
    for (const hotel of mockData[city]) {
      const searchText = (hotel.name + " " + hotel.address).toLowerCase();
      if (searchText.includes(q)) {
        matchedHotels.push(hotel);
      }
    }
  }

  if (matchedHotels.length > 0) {
    return matchedHotels;
  }

  // If nothing matches, return ALL hotels
  return Object.values(mockData).flat();
}

document.getElementById("searchBtn").addEventListener("click", searchHotels);
document.getElementById("searchInput").addEventListener("keydown", e => {
  if (e.key === "Enter") searchHotels();
});

// Filter event listeners — re-apply filters on any change
const filterMinPrice = document.getElementById("filterMinPrice");
if (filterMinPrice) filterMinPrice.addEventListener("input", applyCurrentFilters);
document.getElementById("filterMaxPrice").addEventListener("input", applyCurrentFilters);
document.getElementById("filterMinRating").addEventListener("change", applyCurrentFilters);
document.getElementById("filterSort").addEventListener("change", applyCurrentFilters);
document.getElementById("clearFiltersBtn").addEventListener("click", () => {
  const minPriceEl = document.getElementById("filterMinPrice");
  if (minPriceEl) minPriceEl.value = "";
  document.getElementById("filterMaxPrice").value = "";
  document.getElementById("filterMinRating").value = "";
  document.getElementById("filterSort").value = "";
  applyCurrentFilters();
});

updateFavCount();

// Auto-load all hotels on page load
document.getElementById("searchInput").value = "";
searchHotels()
const res = await fetch(`/api/hotels?q=${encodeURIComponent(query)}`);
const data = await res.json();

console.log(data);
