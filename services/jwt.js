// importar dependencias
const jwt = require("jwt-simple");
const moment = require("moment");

// crear una nueva funcion para generar tokens
const secret = "CLAVE_SECRETA_del_proyecto_DE_LA_RED_soCIAL_987987";

const createToken = (user) => {
  const payload = {
    id: user._id,
    name: user.name,
    surname: user.surmane,
    nick: user.nick,
    email: user.email,
    role: user.role,
    imagen: user.imagen,
    iat: moment().unix(),
    exp: moment().add(30, "days").unix,
  };
  // devolver jwt token codificado
  return jwt.encode(payload, secret);
};

module.exports = {
  createToken,
  secret
}

