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
        __v: 0
    })
    if(!userPublication){
        return res.status(404).send({
            status: "Error",
            message: "La publicacion no existe"
        })
    }
    return res.status(200).send({
      status: "Success",
      message: "Funcionando",
      id,
      userPublication
    });
  } catch (error) {
    return res.status(500).send({
      status: "Error",
      message: "Ponte a llorar",
    });
  }
};

// Eliminar publicaciones

module.exports = {
  pruebaPublication,
  save,
  one,
};
