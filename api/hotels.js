export default async function handler(req, res) {
  const { q } = req.query;

  if (!q) {
    return res.status(400).json({ error: "Missing location query" });
  }

  try {
    // Step 1: Get destination ID (city only)
    const locRes = await fetch(
      `https://booking-com.p.rapidapi.com/v1/hotels/locations?locale=en-us&name=${encodeURIComponent(q)}`,
      {
        headers: {
          "X-RapidAPI-Key": process.env.RAPIDAPI_KEY,
          "X-RapidAPI-Host": "booking-com.p.rapidapi.com"
        }
      }
    );

    const locData = await locRes.json();

    // Filter for city results only
    const city = locData.find(item => item.type === "city");

    if (!city) {
      return res.status(404).json({ error: "City not found" });
    }

    const destId = city.dest_id;

    // Step 2: Search hotels
    const hotelsRes = await fetch(
      `https://booking-com.p.rapidapi.com/v1/hotels/search?dest_id=${destId}&dest_type=city&locale=en-us&order_by=popularity`,
      {
        headers: {
          "X-RapidAPI-Key": process.env.RAPIDAPI_KEY,
          "X-RapidAPI-Host": "booking-com.p.rapidapi.com"
        }
      }
    );

    const hotelsData = await hotelsRes.json();

    res.status(200).json(hotelsData.result);

  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to fetch hotels" });
  }
}
