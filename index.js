import express from "express";
import axios from "axios";
import cheerio from "cheerio";
import cors from "cors";

const app = express();
const PORT = 8080;

app.use(express.json());
app.use(cors());

async function fetchHTML(url) {
  try {
    const { data } = await axios.get(url);
    return data;
  } catch (error) {
    throw new Error(`Could not fetch HTML from ${url}: ${error}`);
  }
}

function extractMetadata(html) {
  const $ = cheerio.load(html);

  const title = $("title").text().trim();
  const description = $('meta[name="description"]').attr("content");
  const keywords = $('meta[name="keywords"]').attr("content");
  const favicon = $('link[rel="icon"]').attr("href");

  return { title, description, keywords, favicon };
}

app.get("/metadata", async (req, res) => {
  const { url } = req.query;
  if (!url) {
    return res.status(400).json({ error: "URL parameter is required" });
  }

  try {
    const html = await fetchHTML(url);
    const metadata = extractMetadata(html);
    res.json(metadata);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/ping", (req, res) => {
  res.send("Server is up and running!");
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
