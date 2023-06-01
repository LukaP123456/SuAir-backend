const express = require('express')
const router = express.Router()
const {
    getAll, xofAllTime, getWorstInMonth
} = require('../app/Controllers/AQIController')

router.get('/get/all', getAll)
router.get('/get/x-of-alltime', xofAllTime)
router.get('/get/pollut-in-month', getWorstInMonth)

module.exports = router
