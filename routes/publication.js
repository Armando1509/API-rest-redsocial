const express = require("express")
const router = express.Router()
const multer = require("multer")
const path = require("path")
const PublicationController = require("../controllers/publication.js")
const check = require("../middlewares/auth.js")

// configuracion de subida
const storage = multer.diskStorage({
    destination: (req, file, cb) =>{
        cb(null, path.resolve(__dirname, "../uploads/publications"))
    },
    filename: (req, file, cb) =>{
        cb(null, "pub-"+Date.now()+"-"+file.originalname)
    }
})

const uploads = multer({storage})
// Definir rutas
router.get("/prueba-publication", PublicationController.pruebaPublication)
router.post("/save", check.auth, PublicationController.save)
router.get("/one/:id",check.auth, PublicationController.one)
router.delete("/remove/:id", check.auth, PublicationController.remove)
router.get("/user/:id/:page?", check.auth, PublicationController.user)
router.post("/upload/:id", [check.auth, uploads.single("file0")], PublicationController.upload)
router.get("/media/:file", check.auth, PublicationController.media)
router.get("/feed/:page?", check.auth, PublicationController.feed)

// Exportar ruta
module.exports = router