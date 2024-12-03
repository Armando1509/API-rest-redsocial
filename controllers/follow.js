const Follow = require("../models/follow");
const User = require("../models/user");

// Importar dependencias
const mongoosePaginate = require("mongoose-pagination")

//Accion de prueba
const pruebaFollow = async (req, res) => {
  return res.status(200).send({
    message: "Mensaje enciado desde: controllers/follow.js",
  });
};

// Accion de guardar un follow (accion seguir)

const save = async (req, res) => {
  //conseguir datos por body
  const params = req.body;
  //sacar el id del usuario identificado
  const identity = req.user;
  //crear objeto con modelo follow
  let userToFollow = new Follow({
    user: identity.id,
    followed: params.followed,
  });

  try {
    let followStores = await userToFollow.save();
    if (!followStores) {
      return res.status(400).send({
        status: "Error",
        message: "No se a podido seguir al usuario",
      });
    }
    return res.status(200).send({
      status: "Success",
      message: "Usuario seguido correctamente",
      identity: req.user,
      datos: params,
      followStores,
    });
  } catch (error) {
    return res.status(500).send({
      status: "Error",
      message: "Ponte a llorar",
    });
  }
};

// Accion de borrar un follow (accion dejar de seguir)
const unfollow = async (req, res) => {
  // Recoger el id del usuario identificado
  const userId = req.user.id;

  // Recoger el id del usuario que sigo y quiero dejar de seguir
  const followedId = req.params.id;

  // Encontrar las conincidencias y hacer el remove
  try {
    // Buscar la relación en la base de datos
    let followStore = await Follow.deleteOne({
      user: userId,
      followed: followedId,
    });

    // Si no existe la relación, devolver error
    if (!followStore) {
      return res.status(404).send({
        status: "Error",
        message: "No se encontró la relación de seguimiento",
      });
    }
    // Respuesta exitosa
    return res.status(200).send({
      status: "Success",
      message: "Has dejado de seguir al usuario correctamente",
      followedId,
      userId,
    });
  } catch (error) {
    console.error("Error en la operación unfollow:", error);
    return res.status(500).send({
      status: "Error",
      message: "Error al intentar dejar de seguir al usuario",
    });
  }
};

// Accion de listado de usuarios que estoy siguiendo

const following = async (req, res) => {
  // Sacar el id del usuario identificado
  const userId = req.user.id;

  // Comprobar si me llega el id por parametro en url
 if(req.params.id) userId = req.params.id

  // Comprobar si me llega la pagina, si no la default sera 1
  let page = 1

  if(req.params.page) page = req.params.page

  // Usuarios por pagina que quiero mostrar
  let itemsPerPage = 5

  // Find a follow, popular datos de los usuarios y paginar con moongose paginate
  let total = await Follow.countDocuments()
  let follows = await Follow.find({user: userId}).populate("user followed", "-password, -role, -__v").paginate(page, itemsPerPage)
  return res.status(200).send({
    status: "Success",
    message: "Listado de usuarios que estoy siguiendo",
    follows,
    total,
    pages: Math.ceil(total/itemsPerPage)
  });
};

// Accion de listado de usuarios que me estan siguiendo

const followers = async (req, res) => {
  return res.status(200).send({
    status: "Success",
    message: "Listado de usuarios que me siguen",
  });
};
module.exports = {
  pruebaFollow,
  save,
  unfollow,
  following,
  followers,
};
