export default async function handler(req, res) {
  const { q } = req.query;

  if (!q) {
    return res.status(400).json({ error: "Missing location query" });
  }

  const apiKey = process.env.SEARCHAPI_KEY;

  try {
    const url = `https://www.searchapi.io/api/v1/google/hotels?engine=google_hotels&q=${encodeURIComponent(q)}`;

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${apiKey}`
      }
    });

    const data = await response.json();
    const hotels = (data.properties || data.hotel_results || []).map(hotel => ({
  ...hotel,
  image: hotel.image || ""
}));

res.status(200).json({
  hotels
});
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to fetch hotels" });
  }
}
