const express = require("express")
const router = express.Router()
const UserController = require("../controllers/user.js")
const auth = require("../middlewares/auth.js")

// Definir rutas
router.get("/prueba-usuario", auth.auth, UserController.pruebaUser)
router.post("/register", UserController.register)
router.post("/login", UserController.login)

// Exportar ruta
module.exports = router