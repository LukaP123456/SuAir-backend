const express = require('express')
const router = express.Router()
const {
    JWTlogin, JWTverify, JWTregister,
} = require('../app/Controllers/AuthController')

router.post('/register', JWTregister)
router.post('/login', JWTlogin)
router.post('/verify/:id/:token', JWTverify)

module.exports = router
