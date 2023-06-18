const express = require('express')
const router = express.Router()
const {
    AddFavHour, AddFavDay, AddFavMonth
} = require('../app/Controllers/AQIController')
router.put('/hour', AddFavHour)
router.put('/day', AddFavDay)
router.put('/month', AddFavMonth)

module.exports = router
