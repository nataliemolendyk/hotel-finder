import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
app.use(cors());

app.get("/api/hotels", async (req, res) => {
  const { q, check_in, check_out, api_key } = req.query;

  const url = `https://serpapi.com/search.json?engine=google_hotels&q=${q}&check_in_date=${check_in}&check_out_date=${check_out}&api_key=${api_key}`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch hotels" });
  }
});

app.listen(3000, () => console.log("Proxy running on port 3000"));
