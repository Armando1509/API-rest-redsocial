const Publication = require("../models/publication");

//Accion de prueba
const pruebaPublication = async (req, res) => {
  return res.status(200).send({
    message: "Mensaje enciado desde: controllers/publication.js",
  });
};

// Guardar publicacion
const save = async (req, res) => {
  //conseguir los datos por body
  const params = req.body;

  //
  if (!params.text)
    return res
      .status(400)
      .send({ status: "Error", message: "no hay texto para guardar" });
  // sacar el id del usuario identificado
  const identity = req.user;

  // Crear el objeto con el modelo Publication
  let publicationToUser = new Publication({
    user: identity.id,
    text: params.text,
  });

  try {
    let publicationStore = await publicationToUser.save();
    if (!publicationStore) {
      return res.status(400).send({
        status: "Error",
        message: "No se a guardado publicacion",
      });
    }

    return res.status(200).send({
      status: "success",
      message: "Publicacion guardada",
      params,
      identity: req.user,
      publicationStore,
    });
  } catch (error) {
    return res.status(500).send({
      status: "Error",
      message: "Ponte a llorar",
    });
  }
};

// Sacar una publicacion

const one = async (req, res) => {
  // Traer el id de la publicacion por params
  let id = req.params.id;
  try {
    const userPublication = await Publication.findById(id).select({
      create_at: 0,
      __v: 0,
    });
    if (!userPublication) {
      return res.status(404).send({
        status: "Error",
        message: "La publicacion no existe",
      });
    }
    return res.status(200).send({
      status: "Success",
      message: "Funcionando",
      id,
      publication: userPublication,
    });
  } catch (error) {
    return res.status(500).send({
      status: "Error",
      message: "Ponte a llorar",
    });
  }
};

// Eliminar publicaciones

const remove = async (req, res) => {
  // traer al usuario
  let userId = req.user.id;
  // Traer el Id por params
  let publicationId = req.params.id;

  try {
    let removePublication = await Publication.deleteOne({
      user: req.user.id, // esto es para que solo el usuario identificado borre sus propias publicaciones
      _id: publicationId,
    });
    if (!removePublication) {
      return res.status(404).send({
        status: "Error",
        message: "No se a podido eliminar la publicacion",
      });
    }
    return res.status(200).send({
      status: "Success",
      message: "Publicacion eliminada",
      publicationId,
      userId,
      removePublication,
    });
  } catch (error) {
    return res.status(500).send({
      status: "Error",
      message: "Ponte a llorar",
    });
  }
};

// Listar las publicaciones de un usuario

const user = async (req, res) => {
  // Traer el id
  const userId = req.params.id;
  // La paginacio
  let page = 1;
  if (req.params.page) page = req.params.page;
  let itemsPerPage = 5;
  try {
    let total = await Publication.countDocuments();
    let publications = await Publication.find({ user: userId })
    .sort("-create_at")
    .populate("user", "-create_at -__v -password")
    .paginate(page, itemsPerPage);
    if(publications.length <= 0){
      return res.status(404).send({
        status: "Error",
        message: "No hay publicaciones para mostrar",
      });
    }
    return res.status(200).send({
      status: "Success",
      message: "Aqui tienes la lista de publicaciones",
      total,
      pages: Math.ceil(total / itemsPerPage),
      publications,
    });
  } catch (error) {
    return res.status(500).send({
      status: "Error",
      message: "Ponte a llorar",
    });
  }
};

module.exports = {
  pruebaPublication,
  save,
  one,
  remove,
  user,
};
