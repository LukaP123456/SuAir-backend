const express = require('express')
const router = express.Router()
const {
    getAll, xofAllTime, getXInTime, AddRemoveFavorite, search
} = require('../app/Controllers/AQIController')

router.get('/get/all', getAll)
router.get('/get/x-of-alltime', xofAllTime)
router.get('/get/x-in-time', getXInTime)
router.put('/:field', AddRemoveFavorite)
router.delete('/:field', AddRemoveFavorite)
router.use('/search', search)

module.exports = router
