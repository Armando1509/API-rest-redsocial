// Importar modulos
const User = require("../models/user");
// Importar dependencias
const bcrypt = require("bcrypt");
const mongoosePagination = require("mongoose-pagination");
const fs = require("fs");
const path = require("path");
// Importar servicios
const jwt = require("../services/jwt");
const user = require("../models/user");
const followService = require("../services/followService");

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
      $or: [{ email: params.email }, { nick: params.nick }],
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
      const userStored = await user_to_save.save();
      // Devolver el resultado
      return res.status(201).json({
        status: "Success",
        message: "Usuario registrado correctamente",
        user: userStored,
      });
    }
  } catch (error) {
    return res
      .status(500)
      .json({ status: "Error", message: "Error en la comprobacion" });
  }
};

const login = async (req, res) => {
  // Recoger parametros del body
  let params = req.body;
  // Buscar en la bbdd si existe
  try {
    let user = await User.findOne({ email: params.email });
    if (!user)
      return res.status(404).send({
        status: "Error",
        message: "No existe el usuario",
      });
    // comprobar su contraseña
    if (!params.password) {
      return res
        .status(401)
        .send({ status: "Error", message: "Introduce contraseña" });
    }
    let pwt = bcrypt.compareSync(params.password, user.password);
    if (!pwt) {
      return res.status(400).send({
        status: "Error",
        message: "No te has identificado correctamente",
      });
    }
    // Devolver Token
    const token = jwt.createToken(user);
    // Devolver Datos del usuario

    return res.status(200).send({
      status: "Success",
      message: "Accion login",
      user: {
        id: user._id,
        name: user.name,
        nick: user.nick,
      },
      token,
    });
  } catch (error) {}
};

const profile = async (req, res) => {
  // Recibir el parametro del id  de usuario por la url
  const id = req.params.id;

  // Consulta para sacar datos del usuario
  try {
    const userProfile = await User.findById(id).select({
      password: 0,
      role: 0,
    });

    if (!userProfile) {
      return res.status(404).send({
        error: "error",
        message: "El usuario no exite o hay un error",
      });
    }
    // Info de seguimiento
    const followInfo = await followService.followThisUser(req.user.id, id);
    // Devolver el resultado
    return res.status(200).send({
      status: "Success",
      user: userProfile,
      following: followInfo.following,
      follower: followInfo.follower,
    });
  } catch (error) {
    return res.status(404).send({ error: "error", message: "no hay conexion" });
  }
};

const list = async (req, res) => {
  // Controlar en que pagina estamos
  let page = 1;
  if (req.params.page) {
    page = req.params.page;
  }
  page = parseInt(page);
  // Consulta con mongoose paginate
  try {
    let itemsPerPage = 5;
    let total = await User.countDocuments(); // Esto es para sacar el total de usuarios que encontro para la pagination
    let users = await User.find().sort("_id").paginate(page, itemsPerPage);
    if (!users) {
      return res.status(404).send({
        status: "Error",
        message: "No hay usuarios disponibles",
      });
    }
    // Sacar un array de los ids de los usuarios que me siguen y lo que sigue el usuario identificado
    let followUserIds = await followService.followUserIds(req.user.id);
    return res.status(200).send({
      status: "Success",
      message: "Ruta de listado de usuarios",
      page,
      users,
      itemsPerPage,
      total,
      pages: Math.ceil(total / itemsPerPage),
      user_followings: followUserIds.following,
      user_follow_me: followUserIds.followers
    });
  } catch (error) {
    return res.status(500).send({
      status: "Success",
      message: "Todo esta mal",
      page,
    });
  }
};

const update = async (req, res) => {
  // Recoger info del usuario a actualizar
  let userIdentity = req.user;
  let userToUpdate = req.body;
  // Eliminar campos sobrantes
  delete userToUpdate.iat;
  delete userToUpdate.exp;
  delete userToUpdate.role;
  delete userToUpdate.image;
  // Comprobar si el usuario ya existe
  try {
    const users = await User.find({
      $or: [{ email: userToUpdate.email }, { nick: userToUpdate.nick }],
    });
    let userIsset = false;
    users.forEach((user) => {
      if (user && user._id != userIdentity.id) userIsset = true;
    });
    if (userIsset) {
      return res.status(400).json({
        status: "Error",
        message: "El usuarios ya existe",
      });
    }
    // Cifrar contraseña
    if (userToUpdate.password) {
      let pwd = await bcrypt.hash(userToUpdate.password, 10);
      userToUpdate.password = pwd;
    }
    //Busca y actualiza
    let userUpdated = await User.findByIdAndUpdate(
      userIdentity.id,
      userToUpdate,
      { new: true }
    );

    if (!userUpdated) {
      return res.status(400).json({
        status: "Error",
        message: "Error al actualizar usuario",
      });
    }
    // Devolver respuesta
    return res.status(200).send({
      status: "Success",
      message: "Metodo de actualiza usuario",
      user: userToUpdate,
    });
  } catch (error) {
    return res.status(500).json({
      status: "Error",
      message: "Ni de pedo esta jalando",
    });
  }
};

const upload = async (req, res) => {
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
    let imageUpdate = await User.findByIdAndUpdate(
      req.user.id,
      { image: req.file.filename },
      { new: true }
    );
    if (!imageUpdate) {
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
      user: imageUpdate,
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

const avatar = async (req, res) => {
  // Sacar el parametro de la url
  const file = req.params.file;
  // Montar el path real de la imagen
  const filePath = path.resolve(__dirname, "../uploads/avatars", file);
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
  pruebaUser,
  register,
  login,
  profile,
  list,
  update,
  upload,
  avatar,
};
