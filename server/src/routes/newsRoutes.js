import express from 'express';
import axios from 'axios';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const apiKey = process.env.NEWS_API_KEY;
    if (!apiKey) {
      throw new Error("NEWS_API_KEY is not defined");
    }

    // Fetch from NewsAPI.org with strict agricultural focus
    const response = await axios.get('https://newsapi.org/v2/everything', {
      params: {
        apiKey: apiKey,
        // Using restrictive keywords and excluding unrelated complex financial/political terms
        q: "agriculture, farming",
        language: 'en',
        sortBy: 'publishedAt',
        pageSize: 20 // Fetch more to allow for filtering
      }
    });

    if (response.data.status !== 'ok') {
      throw new Error(response.data.message || "Failed to fetch news from NewsAPI.org");
    }

    const articles = response.data.articles || [];

    // Strict keyword set for secondary validation to ensure agricultural relevance
    const agKeywords = ["farm", "crop", "agriculture", "mandi", "harvest", "yield", "cultivation", "irrigation", "soil", "agri", "wheat", "rice", "tomato", "cotton", "onion", "farmer"];

    const newsData = articles
      .filter(article => {
        const content = (article.title + " " + (article.description || "")).toLowerCase();
        return agKeywords.some(keyword => content.includes(keyword));
      })
      .slice(0, 10) // Limit to top 10 most relevant news items
      .map((article) => {
        const text = (article.title + " " + (article.description || "")).toLowerCase();
        let impact = "neutral";

        if (text.includes("rise") || text.includes("gain") || text.includes("high") || text.includes("profit") || text.includes("increase") || text.includes("growth") || text.includes("incentive")) {
          impact = "positive";
        } else if (text.includes("fall") || text.includes("loss") || text.includes("low") || text.includes("drop") || text.includes("decrease") || text.includes("crisis") || text.includes("damage")) {
          impact = "negative";
        }

        return {
          title: article.title,
          time: article.publishedAt ? new Date(article.publishedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Today",
          impact: impact
        };
      });

    res.json({ news: newsData });

  } catch (err) {
    console.error('Error fetching market news from NewsAPI:', err.message);
    res.status(500).json({ error: 'Failed to fetch market news' });
  }
});

export default router;
