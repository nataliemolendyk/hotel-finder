export default async function handler(req, res) {
  // Enable CORS so GitHub Pages can call this API
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Handle preflight OPTIONS request
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const { q } = req.query;

  if (!q) {
    return res.status(400).json({ error: "Missing location query" });
  }

  const apiKey = process.env.SEARCHAPI_KEY;

  try {
    const url = `https://www.searchapi.io/api/v1/google/hotels?engine=google_hotels&q=${encodeURIComponent(q)}&fields=*`;

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${apiKey}`
      }
    });

    const data = await response.json();

    const hotels = (data.properties || data.hotel_results || []).map(hotel => {
  const imagesArray = Array.isArray(hotel.images) ? hotel.images : [];
  return {
    ...hotel,
    images: imagesArray.map(img => ({
      url: img.original || img.thumbnail || ""
    })),
    image: imagesArray[0]?.original || imagesArray[0]?.thumbnail || ""
  };
});

    res.status(200).json({ hotels });
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to fetch hotels" });
  }
}

