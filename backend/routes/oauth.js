const express = require('express');
const router = express.Router();
const oauthController = require('../controllers/oauthController');

// OAuth Callback
router.post('/callback', oauthController.oauthCallback);

// OAuth Link Account
router.post('/link', oauthController.linkOAuthAccount);

// OAuth Unlink
router.delete('/unlink/:provider', oauthController.unlinkOAuthAccount);

module.exports = router;