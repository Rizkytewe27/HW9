const jwt = require('jsonwebtoken');
const SECRET_KEY = 'btspavedtheway';
const { Users, Movies } = require('../models');

//cek apakah user sudah login atau belum
const authentication = async(req, res, next) => {
  try{
    if(!req.headers.authentication) {
      throw { name: "Unauthenticated" }
    }

    const token = req.headers.authentication.split(" ")[1];
    const decoded = jwt.verify(token, SECRET_KEY);
    const foundUser = await Users.findOne({ where: { email: decoded.email }});

    if(foundUser) {
      req.loggedUser = {
        id: foundUser.id,
        email: foundUser.email,
        gender: foundUser.gender,
        role: foundUser.role
      }
      next();
    } else {
        throw { name: "Unauthenticated" }
    }
  } catch (err) {
      next(err);
  }
}

//cek setelah login
const authorization = async(req, res, next) => {
  try {
    const { id } = req.params;
    const foundMovie = await Movies.findOne({ where: { id }});

    if(foundMovie) {
      const loggedUser = req.loggedUser;
      if(foundMovie.user_id === loggedUser.id) {
        next();
      } else {
        throw { name: "Unauthorized" }
      }
    } else {
        throw { name: "ErrorNotFound" }
    }
  } catch (err) {
      next();
  }
}

module.exports = {
  authentication,
  authorization
}