const express = require('express');
const auth = require('../middleware/auth');
const authController = require('../controllers/authController');

const router = express.Router();

router.post('/signup',authController.createUser);

router.post('/login',authController.checkmail);

module.exports = router;