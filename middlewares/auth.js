// importar modulos
const jwt = require("jwt-simple");
const moment = require("moment");

// importar clave secreta
const libjwt = require("../services/jwt.js");
const secret = libjwt.secret;

// Middlewares de autenticacion
exports.auth = async (req, res, next) => {
   
  
  // Comprobar si me llega la cabecera de auth
  if (!req.headers.authorization) {
    return res.status(403).send({
      status: "error",
      message: "La peticion no tiene la cabecera de autenticacion",
    });
  }


  // Limpiar el token
  let token = req.headers.authorization.replace(/["']+/g);

  // Decodificar el token

  try {
    let payload = await jwt.decode(token, secret);

    if (payload.exp <= moment().unix()) {
      return res.status(401).send({
        status: "error",
        message: "Token expirado",
        error,
      });
    }
    // agragar datos de usuario a request
    req.user = payload;
  } catch (error) {
    return res.status(404).send({
      status: "error",
      message: "Token invalido",
      error,
    });
  }

  // pasar a ejecucion de accion
  next();
};
