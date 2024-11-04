const express = require("express")
const router = express.Router()
const UserController = require("../controllers/user.js")

// Definir rutas
router.get("/prueba-usuario", UserController.pruebaUser)

// Exportar ruta
module.exports = router