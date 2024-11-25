// Importar modulos
const User = require("../models/user");
// Importar dependencias
const bcrypt = require("bcrypt");
// Importar servicios
const jwt = require("../services/jwt")

//Accion de prueba
const pruebaUser = (req, res) => {
  return res.status(200).send({
    message: "Mensaje enciado desde: controllers/user.js",
    user: req.user,
  });
};

const register = async (req, res) => {
  // Recoger datos de la peticion
  let params = req.body;
  // Comprobar que llegan bien los datos + validacion
  if (!params.name || !params.email || !params.password || !params.nick) {
    return res.status(400).json({
      status: "Error",
      message: "Faltan datos por enviar",
    });
  }

  // Normalizar datos antes de la búsqueda
  params.email = params.email.toLowerCase().trim();
  params.nick = params.nick.toLowerCase().trim();

  // Control de usuarios duplicados
  try {
    const users = await User.find({
      $or: [
        { email: params.email},
        { nick: params.nick},
      ],
    });
    if (users && users.length >= 1) {
      return res.status(200).json({
        status: "Error",
        message: "El usuarios ya existe",
      });
    } else {
      // Cifrar contraseña
      let pwd = await bcrypt.hash(params.password, 10);
      params.password = pwd;
      // Crear objeto de usuario
      let user_to_save = new User(params);
      // Guardar en BD 
    const userStored = await user_to_save.save()
    // Devolver el resultado
    return res.status(201).json({
        status: "Success",
        message: "Usuario registrado correctamente",
        user: userStored
    })
    }
  } catch (error) {
    return res
      .status(500)
      .json({ status: "Error", message: "Error en la comprobacion" });
  }
};

const login  = async (req, res) => {
    // Recoger parametros del body
    let params =  req.body
    // Buscar en la bbdd si existe
    try {
        let user = await User.findOne({email: params.email})
        if(!user) return res.status(404).send({
            status: "Error",
            message: "No existe el usuario"
        })
        // comprobar su contraseña
        if(!params.password){
          return res.status(401).send({status:"Error",message: "Introduce contraseña"})
        } 
        let pwt = bcrypt.compareSync(params.password, user.password)
        if(!pwt){
            return res.status(400).send({
                status: "Error",
                message: "No te has identificado correctamente"
            })
        }
    // Devolver Token
   const token = jwt.createToken(user)
    // Devolver Datos del usuario

    return res.status(200).send({
        status: "Success",
        message: "Accion login",
        user: {
            id: user._id,
            name: user.name,
            nick: user.nick
        },
        token
        

    })
    } catch (error) {
        
    }
   
}

module.exports = {
  pruebaUser,
  register,
  login
};
