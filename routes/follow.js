const express = require("express")
const router = express.Router()
const FollowController = require("../controllers/follow.js")

// Definir rutas
router.get("/prueba-follow", FollowController.pruebaFollow)

// Exportar ruta
module.exports = router