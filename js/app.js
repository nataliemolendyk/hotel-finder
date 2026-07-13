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

    const hotels = data.results;
    container.innerHTML = "";

    if (!hotels || hotels.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">😕</div>
          <p>No hotels found.</p>
        </div>
      `;
      return;
    }

    const list = document.createElement("div");
    list.className = "results-list";

    hotels.forEach(hotel => {
      const card = document.createElement("div");
      card.className = "hotel-card";

      const img = hotel.images?.[0]?.url || "";
      const name = hotel.name || "Unknown Hotel";
      const rating = hotel.rating || "N/A";
      const price = hotel.price?.lowest_price || "N/A";
      const address = hotel.address || "Address not available";

      card.innerHTML = `
        <div class="hotel-image-wrapper">
          ${
            img
              ? `<img src="${img}" class="hotel-image" />`
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

  } catch (err) {
    container.innerHTML = `
      <div class="error-message">
        <p>Something went wrong.</p>
        <button class="retry-btn" onclick="searchHotels()">Try Again</button>
      </div>
    `;
  }
}

document.getElementById("searchBtn").addEventListener("click", searchHotels);
updateFavCount();
