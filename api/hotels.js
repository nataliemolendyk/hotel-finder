export default async function handler(req, res) {
  const { q, check_in, check_out, api_key } = req.query;

  const params = new URLSearchParams({
    engine: "google_hotels",
    q,
    check_in_date: check_in,
    check_out_date: check_out,
    api_key,
    adults: 2,
    currency: "USD",
    gl: "us",
    hl: "en"
  });

  const url = `https://serpapi.com/search.json?${params.toString()}`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch hotels" });
  }
}
