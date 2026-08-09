// Support routes (contact form)
const express = require('express');
const router = express.Router();
const { sendContactMessage } = require('../controllers/supportController');

// Public contact endpoint
router.post('/contact', sendContactMessage);

module.exports = router;
