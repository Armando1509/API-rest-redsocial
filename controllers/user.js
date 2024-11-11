// Importar dependencias y modulos
const User = require("../models/user");
const bcrypt = require("bcrypt");

//Accion de prueba
const pruebaUser = (req, res) => {
  return res.status(200).send({
    message: "Mensaje enciado desde: controllers/user.js",
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
    // comprobar su contraseña
    // Devolver Token
    // Devolver Datos del usuario

    return res.status(200).send({
        status: "Success",
        message: "Accion login"
    })
}

module.exports = {
  pruebaUser,
  register,
  login
};
