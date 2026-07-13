export default async function handler(req, res) {
  const { q } = req.query;

  if (!q) {
    return res.status(400).json({ error: "Missing location query" });
  }

  const apiKey = process.env.GOOGLE_PLACES_KEY;

  // Convert city name → coordinates
  const geoUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(q)}&key=${apiKey}`;

  try {
    const geoRes = await fetch(geoUrl);
    const geoData = await geoRes.json();

    if (!geoData.results.length) {
      return res.status(404).json({ error: "Location not found" });
    }

    const { lat, lng } = geoData.results[0].geometry.location;

    // Search for hotels near the coordinates
    const placesUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=5000&type=lodging&key=${apiKey}`;

    const placesRes = await fetch(placesUrl);
    const placesData = await placesRes.json();

    res.status(200).json(placesData.results);

  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to fetch hotels" });
  }
}
