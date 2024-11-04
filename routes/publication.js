const express = require("express")
const router = express.Router()
const PublicationController = require("../controllers/publication.js")

// Definir rutas
router.get("/prueba-publication", PublicationController.pruebaPublication)

// Exportar ruta
module.exports = router