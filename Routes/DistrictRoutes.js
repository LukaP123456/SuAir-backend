const express = require('express')
const router = express.Router()
const {
    getAll,
} = require('../app/Controllers/DistrictController')

router.get('/get/all', getAll)

module.exports = router
