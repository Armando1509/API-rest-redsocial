const express = require("express")
const router = express.Router()
const PublicationController = require("../controllers/publication.js")
const check = require("../middlewares/auth.js")
// Definir rutas
router.get("/prueba-publication", PublicationController.pruebaPublication)
router.post("/save", check.auth, PublicationController.save)
router.get("/one/:id",check.auth, PublicationController.one)
// Exportar ruta
module.exports = router