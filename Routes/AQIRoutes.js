const express = require('express')
const router = express.Router()
const {
    getAll, xofAllTime, getXInTime
} = require('../app/Controllers/AQIController')

router.get('/get/all', getAll)
router.get('/get/x-of-alltime', xofAllTime)
router.get('/get/x-in-time', getXInTime)

module.exports = router
