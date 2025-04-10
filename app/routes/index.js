const express = require('express');
const router = express.Router();
const logger = require('../utils/logger');

router.get('/', (req, res) => {
    logger.info('Received GET request on /');
    res.render('index',{WIKI_LINK:process.env.WIKI_LINK})
});

module.exports = router;