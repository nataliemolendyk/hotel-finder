export default async function handler(req, res) {
  const { q, check_in, check_out } = req.query;

  function normalizeDate(date) {
    return new Date(date).toISOString().split("T")[0];
  }

  const searchQuery = q ? `hotels in ${q}` : "";

  const params = new URLSearchParams({
    engine: "google_hotels",
    type: "lodging",
    q: searchQuery,
    check_in_date: normalizeDate(check_in),
    check_out_date: normalizeDate(check_out),
    api_key: process.env.SERPAPI_KEY,
    adults: 2,
    currency: "USD",
    gl: "us",
    hl: "en"
  });

  const url = `https://serpapi.com/hotels.json?${params.toString()}`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    res.status(200).json(data);
  } catch (err) {
    console.log("🔥 BACKEND ERROR:", err.message);
    console.log("🔥 FULL ERROR:", err);
    res.status(500).json({ error: err.message || "Failed to fetch hotels" });
  }
}
