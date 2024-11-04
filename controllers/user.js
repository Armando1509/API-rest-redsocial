

//Accion de prueba
const pruebaUser =  (req, res) =>{
    return res.status(200).send({
        message: "Mensaje enciado desde: controllers/user.js"
    })
}

module.exports ={
    pruebaUser
}