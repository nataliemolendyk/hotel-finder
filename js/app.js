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
