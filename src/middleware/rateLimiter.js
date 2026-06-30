const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
    windowMS: 15 * 60 * 1000,
    max: 10,
    message: {
        success: false,
        message: "Too many requests, try again later"
    }
});

module.exports = limiter;