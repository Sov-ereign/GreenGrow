import express from 'express';
import axios from 'axios';
const router = express.Router();

router.get('/prices', async (req, res) => {
  try {
    const response = await axios.get(
      'https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070',
      {
        params: {
          'api-key': process.env.DATA_GOV_API_KEY,
          format: 'json',
          limit: 20
        }
      }
    );
    res.json(response.data);
  } catch (err) {
    console.error('Error fetching mandi prices:', err.message);
    res.status(500).json({ error: 'Failed to fetch mandi prices' });
  }
});

export default router;
