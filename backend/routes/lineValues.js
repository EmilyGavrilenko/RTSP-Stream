const express = require('express');
const router = express.Router();
const { fetchLineValues } = require('../services/supabaseService');

router.get('/', async (req, res) => {
  try {
    const data = await fetchLineValues();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch line values' });
  }
});

module.exports = router; 