//Accion de prueba
const pruebaPublication = async (req, res) =>{
    return res.status(200).send({
        message: "Mensaje enciado desde: controllers/publication.js"
    })
}

module.exports ={
    pruebaPublication
}