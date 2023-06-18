const express = require('express')
const router = express.Router()
const AddFavourites = require('../Routes/AddFavourites')
const DelFavourites = require('../Routes/DelFavourites')
const {
    getAll, xofAllTime, getXInTime
} = require('../app/Controllers/AQIController')

router.get('/get/all', getAll)
router.get('/get/x-of-alltime', xofAllTime)
router.get('/get/x-in-time', getXInTime)
router.use('/add/fav', AddFavourites)
router.use('/del/fav', DelFavourites)

module.exports = router
