export default async function handler(req, res) {
  const { q, check_in, check_out } = req.query;

  const params = new URLSearchParams({
    engine: "google_hotels",
    type: "lodging",
    hotel_id: "",
    q,
    check_in_date: check_in,
    check_out_date: check_out,
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
    res.status(500).json({ error: "Failed to fetch hotels" });
  }
}
