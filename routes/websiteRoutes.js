const express = require('express');

const {
    authenticateWebsite
} = require('../controllers/websiteController');

const router = express.Router();

// Authenticate website
router.post('/authenticate-website', authenticateWebsite);


module.exports = router;