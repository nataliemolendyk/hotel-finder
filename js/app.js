async function searchHotels() {
  const query = document.getElementById("searchInput").value;

  const res = await fetch(`/api/hotels?q=${encodeURIComponent(query)}`);
  const data = await res.json();

  const container = document.getElementById("results");
  container.innerHTML = "";

  if (!data.hotels || data.hotels.length === 0) {
    container.innerHTML = "<p>No hotels found.</p>";
    return;
  }

  data.hotels.forEach(hotel => {
    const card = document.createElement("div");
    card.className = "hotel-card";

    const img = hotel.images?.[0]?.url || "";
    const name = hotel.name || "Unknown Hotel";
    const rating = hotel.rating || "N/A";
    const price = hotel.price?.lowest_price || "N/A";
    const address = hotel.address || "Address not available";

    const roomTypes = hotel.room_types
      ? hotel.room_types.map(r => `<li>${r.name}</li>`).join("")
      : "<li>No room types listed</li>";

    const amenities = hotel.amenities
      ? hotel.amenities.map(a => `<li>${a}</li>`).join("")
      : "<li>No amenities listed</li>";

    card.innerHTML = `
      <img src="${img}" class="hotel-img" />
      <h2>${name}</h2>
      <p><strong>Rating:</strong> ${rating}</p>
      <p><strong>Price:</strong> ${price}</p>
      <p><strong>Address:</strong> ${address}</p>

      <h3>Room Types</h3>
      <ul>${roomTypes}</ul>

      <h3>Amenities</h3>
      <ul>${amenities}</ul>
    `;

    container.appendChild(card);
  });
}

document.getElementById("searchBtn").addEventListener("click", searchHotels);
