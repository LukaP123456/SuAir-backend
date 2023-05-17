const express = require('express')
const router = express.Router()
const {
    logout,
} = require('../app/Controllers/ProtectedAuthRouter')

router.post('/logout', logout)

module.exports = router
