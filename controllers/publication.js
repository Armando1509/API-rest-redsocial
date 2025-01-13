// Importar modulos
const fs = require("fs")
const path = require("path")

// Importar modelos
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
const upload = async (req, res) => {
  let publicationId = req.params.id
  // Recoger el fichero de imagen y comprobar si existe
  if (!req.file) {
    return res.status(404).send({
      status: "Error",
      message: "Peticion no incluye la imagen",
    });
  }
  // Conseguir el nombre del archivo
  let image = req.file.originalname;

  // Sacar la estension del archivo
  const imageSplit = image.split(".");
  const extension = imageSplit[1];
  // comprobar la extension
  if (
    extension != "png" &&
    extension != "jpg" &&
    extension != "jpeg" &&
    extension != "gif"
  ) {
    //Borrar Archivo subido
    const filePath = req.file.path;
    const fileDelete = fs.unlinkSync(filePath);
    // Devolver respues negativa
    return res.status(400).send({
      status: "Error",
      message: "Extension del fichero invalida",
    });
  }
  try {
    let publicationUpdate = await Publication.findByIdAndUpdate(
      {"user": req.user.id, "_id": publicationId},
      { file: req.file.filename },
      { new: true }
    );
    if (!publicationUpdate) {
      return res.status(400).json({
        status: "Error",
        message: "No hay imagen para actualizar",
        user: req.user,
        file: req.file,
      });
    }
    return res.status(200).json({
      status: "Success",
      message: "Prueba jalando",
      publication: publicationUpdate,
      file: req.file,
    });
  } catch (error) {
    return res.status(400).json({
      status: "Error",
      message: "No Funciona ponte a llorar",
      user: req.user,
      file: req.file,
    });
  }
};

// Devolver archivos multimedia
const media = async (req, res) => {
  // Sacar el parametro de la url
  const file = req.params.file;
  // Montar el path real de la imagen
  const filePath = path.resolve(__dirname, "../uploads/publications", file);
  // Comprobar si existe
  fs.stat(filePath, (error) => {
    if (error) {
      return res
        .status(404)
        .send({ status: "error", message: "No existe la imagen" });
    }
    // devolver un file
    return res.sendFile(filePath);
  });
};

module.exports = {
  pruebaPublication,
  save,
  one,
  remove,
  user,
  upload,
  media
};
