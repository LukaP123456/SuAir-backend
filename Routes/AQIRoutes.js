const express = require('express')
const router = express.Router()
const {
    getAll,
} = require('../app/Controllers/AQIController')

router.get('/get/all', getAll)

module.exports = router
