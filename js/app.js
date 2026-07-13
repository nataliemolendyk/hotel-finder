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
        <img src="${hotel.images?.[0]?.url || ""}" class="modal-image" />

        <div class="modal-info">
          <h2>${hotel.name}</h2>

          <div class="modal-meta">
            <span>⭐ ${hotel.rating || "N/A"}</span>
            <span>💵 ${hotel.price?.lowest_price || "N/A"}</span>
          </div>

          <div class="modal-address">
            <span>📍</span>
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
            ❤️ Add to Favorites
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
          <div class="empty-icon">😕</div>
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
            ? `<img src="${img}" class="hotel-image" alt="${name}" />`
            : `<div class="hotel-image-placeholder">🏨</div>`
        }
        <button class="fav-btn">❤️</button>
      </div>

      <div class="hotel-card-body">
        <h3>${name}</h3>

        <div class="hotel-meta">
          <span>⭐ ${rating}</span>
          <span>💵 ${price}</span>
        </div>

        <div class="hotel-details">
          <div class="detail-row">
            <span class="detail-icon">📍</span>
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
        images: [{ url: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600" }],
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
        images: [{ url: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=600" }],
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
        images: [{ url: "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=600" }],
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
        images: [{ url: "https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=600" }],
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
        images: [{ url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600" }],
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
        images: [{ url: "https://images.unsplash.com/photo-1549638441-b787d2e11f14?w=600" }],
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
        images: [{ url: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=600" }],
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
        images: [{ url: "https://images.unsplash.com/photo-1568084680786-a84f91d1153c?w=600" }],
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
        images: [{ url: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600" }],
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
        images: [{ url: "https://images.unsplash.com/photo-1590490359683-658d3d23f972?w=600" }],
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
        images: [{ url: "https://images.unsplash.com/photo-1601918774946-25832a0be0d9?w=600" }],
        room_types: [
          { name: "Deluxe Room", price: "$299", features: ["City View", "Free WiFi"] },
          { name: "Club Suite", price: "$549", features: ["Club Lounge", "Living Room"] }
        ]
      }
    ]
  };

  const key = Object.keys(mockData).find(k => query.toLowerCase().includes(k));
  return key ? mockData[key] : [];
}

document.getElementById("searchBtn").addEventListener("click", searchHotels);
document.getElementById("searchInput").addEventListener("keydown", e => {
  if (e.key === "Enter") searchHotels();
});
updateFavCount();

// Auto-load Las Vegas hotels on page load
document.getElementById("searchInput").value = "Las Vegas";
searchHotels();
