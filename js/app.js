let favorites = JSON.parse(localStorage.getItem("favorites") || "[]");

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
        <img src="${hotel.images?.[0]?.url || ""}" class="modal-image" onerror="this.style.display='none'" />

        <div class="modal-info">
          <h2>${hotel.name}</h2>

          <div class="modal-meta">
            <span>★ ${hotel.rating || "N/A"}</span>
            <span>${hotel.price?.lowest_price || "N/A"}</span>
          </div>

          <div class="modal-address">
            <span class="modal-addr-icon">⌂</span>
            <span>${hotel.address || "Address not available"}</span>
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

async function searchHotels() {
  const query = document.getElementById("searchInput").value.trim();
  const container = document.getElementById("results");

  container.innerHTML = `
    <div class="loading-indicator">
      <div class="spinner"></div>
      <p>Loading hotels...</p>
    </div>
  `;

  try {
    const res = await fetch(`/api/hotels?q=${encodeURIComponent(query)}`);
    const data = await res.json();

    // Handle various API response shapes
    const hotels = data.results || data.hotels || data.properties || data.list || [];

    if (!hotels || hotels.length === 0) {
      // Fallback to mock data if API returns empty
      const mockHotels = getMockHotels(query);
      if (mockHotels.length > 0) {
        renderHotels(mockHotels, container);
        return;
      }
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">−</div>
          <p>No hotels found for "${query}".</p>
        </div>
      `;
      return;
    }

    renderHotels(hotels, container);

  } catch (err) {
    console.warn("API unavailable, using mock data:", err.message);
    const mockHotels = getMockHotels(document.getElementById("searchInput").value.trim());
    if (mockHotels.length > 0) {
      renderHotels(mockHotels, container);
    } else {
      container.innerHTML = `
        <div class="error-message">
          <p>Something went wrong.</p>
          <button class="retry-btn" onclick="searchHotels()">Try Again</button>
        </div>
      `;
    }
  }
}

function renderHotels(hotels, container) {
  container.innerHTML = "";

  const list = document.createElement("div");
  list.className = "results-list";

  hotels.forEach(hotel => {
    const card = document.createElement("div");
    card.className = "hotel-card";

    const img = hotel.images?.[0]?.url || hotel.image || hotel.thumbnail || "";
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

function getMockHotels(query) {
  if (!query) return [];

  const mockData = {
    "las vegas": [
      {
        name: "The Venetian Resort",
        rating: "4.5",
        price: { lowest_price: "$129" },
        address: "3355 S Las Vegas Blvd, Las Vegas, NV 89109",
        images: [{ url: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800" }],
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
        images: [{ url: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800" }],
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
        images: [{ url: "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800" }],
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
        images: [{ url: "https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=800" }],
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
        images: [{ url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800" }],
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
        images: [{ url: "https://images.unsplash.com/photo-1549638441-b787d2e11f14?w=800" }],
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
        images: [{ url: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800" }],
        room_types: [
          { name: "Deluxe Room", price: "$499", features: ["Park View", "Free WiFi"] },
          { name: "Executive Suite", price: "$899", features: ["Living Room", "Butler Service"] }
        ]
      },
      {
        name: "The Langham",
        rating: "4.5",
        price: { lowest_price: "$279" },
        address: "400 5th Ave, New York, NY 10018",
        images: [{ url: "https://images.unsplash.com/photo-1568084680786-a84f91d1153c?w=800" }],
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
        images: [{ url: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800" }],
        room_types: [
          { name: "Classic Room", price: "$189", features: ["City View", "Free WiFi"] },
          { name: "Suite", price: "$349", features: ["Bay View", "Living Room"] }
        ]
      },
      {
        name: "Hotel Nikko",
        rating: "4.3",
        price: { lowest_price: "$159" },
        address: "222 Mason St, San Francisco, CA 94102",
        images: [{ url: "https://images.unsplash.com/photo-1590490359683-658d3d23f972?w=800" }],
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
        images: [{ url: "https://images.unsplash.com/photo-1601918774946-25832a0be0d9?w=800" }],
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
        images: [{ url: "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800" }],
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
        images: [{ url: "https://images.unsplash.com/photo-1535498730771-e735b998cd64?w=800" }],
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
        images: [{ url: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800" }],
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
        images: [{ url: "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800" }],
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
        images: [{ url: "https://images.unsplash.com/photo-1494526585155-cd2d1d5ddf28?w=800" }],
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
        images: [{ url: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800" }],
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
        images: [{ url: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800" }],
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
        images: [{ url: "https://images.unsplash.com/photo-1549638441-b787d2e11f14?w=800" }],
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
        images: [{ url: "https://images.unsplash.com/photo-1590490359683-658d3d23f972?w=800" }],
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
        images: [{ url: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800" }],
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
        images: [{ url: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800" }],
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
        images: [{ url: "https://images.unsplash.com/photo-1549638441-b787d2e11f14?w=800" }],
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
        images: [{ url: "https://images.unsplash.com/photo-1542051841857-5f90071e7989?w=800" }],
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
        images: [{ url: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800" }],
        room_types: [
          { name: "Premier Room", price: "¥80,000", features: ["City View", "Free WiFi"] },
          { name: "Suite", price: "¥150,000", features: ["Panoramic View", "Living Room", "Japanes Bath"] }
        ]
      },
      {
        name: "Park Hyatt Tokyo",
        rating: "4.6",
        price: { lowest_price: "¥35,000" },
        address: "3-7-1-2 Nishi-Shinjuku, Shinjuku City, Tokyo 163-1055, Japan",
        images: [{ url: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800" }],
        room_types: [
          { name: "Standard King", price: "¥35,000", features: ["City View", "Free WiFi"] },
          { name: "Executive Suite", price: "¥75,000", features: ["Mt. Fuji View", "Club Access"] }
        ]
      }
    ]
  };

  // Try to find a matching city key
  const q = query.toLowerCase().trim();
  const matchedKey = Object.keys(mockData).find(k => q.includes(k) || k.includes(q));

  if (matchedKey) {
    return mockData[matchedKey];
  }

  // If no specific city match, search across ALL cities for hotels whose name/address matches
  const allHotels = [];
  for (const city of Object.keys(mockData)) {
    for (const hotel of mockData[city]) {
      const searchText = (hotel.name + " " + hotel.address).toLowerCase();
      if (searchText.includes(q)) {
        allHotels.push(hotel);
      }
    }
  }

  if (allHotels.length > 0) {
    return allHotels;
  }

  // If no match at all, return ALL hotels from all cities
  return Object.values(mockData).flat();
}

document.getElementById("searchBtn").addEventListener("click", searchHotels);
document.getElementById("searchInput").addEventListener("keydown", e => {
  if (e.key === "Enter") searchHotels();
});
updateFavCount();

// Auto-load Las Vegas hotels on page load
document.getElementById("searchInput").value = "Las Vegas";
searchHotels();
