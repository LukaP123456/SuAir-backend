const express = require('express')
const router = express.Router()
const {
    getAll, xofAllTime, getXInTime, AddRemoveFavorite, search
} = require('../app/Controllers/AQIController')

router.get('/get/all', getAll)
router.get('/get/x-of-alltime', xofAllTime)
router.get('/get/x-in-time', getXInTime)
// router.get('/search', search)
//router.use and not router.delete or .put because I need this route to be both a delete and put route and.
router.put('/:field', AddRemoveFavorite)
router.delete('/:field', AddRemoveFavorite)
router.use('/search', search)

module.exports = router
