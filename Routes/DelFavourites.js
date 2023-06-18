const express = require('express')
const router = express.Router()
const {
    RemoveFavHour, RemoveFavDay, RemoveFavMonth
} = require('../app/Controllers/AQIController')
router.delete('/hour', RemoveFavHour)
router.delete('/day', RemoveFavDay)
router.delete('/month', RemoveFavMonth)

module.exports = router
