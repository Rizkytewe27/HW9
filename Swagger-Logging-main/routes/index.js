const express = require('express');
const router = express.Router();
const { Users, Movies } = require('../models');
const bcrypt = require('bcryptjs');
const salt = bcrypt.genSaltSync(10);
const jwt = require('jsonwebtoken');
const SECRET_KEY = 'btspavedtheway';

const { authentication, authorization } = require("../middlewares/auth");

// Endpoint untuk registrasi pengguna
router.post('/register', async (req, res, next) => {
  const { email, gender, password, role } = req.body;
  const hashPassword = bcrypt.hashSync(password, salt);
  const createdUser = await Users.create({
    email,
    gender,
    password: hashPassword,
    role
  }, { returning: true });

  res.status(201).json(createdUser);
});

// Endpoint untuk login pengguna
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const foundUser = await Users.findOne({ where: { email } });
    
    if (foundUser) {
      const comparePassword = bcrypt.compareSync(password, foundUser.password)

      if(comparePassword) {
        const accessToken = jwt.sign({
          email: foundUser.email,
          gender: foundUser.gender,
          role: foundUser.role
        }, SECRET_KEY);

        res.status(200).json({
          message: "Login Sucessfully",
          email: foundUser.email,
          gender: foundUser.gender,
          role: foundUser.role,
          accessToken
        })
      } else {
          throw { name: "InvalidCredentials" }
      }
    } else {
        throw { name: "InvalidCredentials" }
    }
  } catch (err) {
    next(err);
  }
});

router.use(authentication);

router.get("/users", async (req, res, next) => {
  try {
    const page = req.query.page || 1; 
    const limit = req.query.limit || 10;

    // Pastikan bahwa page dan limit adalah angka
    const pageAsNumber = +page; 
    const limitAsNumber = +limit; 

    if (isNaN(pageAsNumber) || isNaN(limitAsNumber) || pageAsNumber <= 0 || limitAsNumber <= 0) {
      throw { message: "Invalid page or limit. Please provide valid numbers." };
    }

    const offset = (pageAsNumber - 1) * limitAsNumber;

    const users = await Users.findAll({
      offset,
      limit: limitAsNumber,
    });

    res.status(200).json({
      message: "Users fetched successfully",
      data: users,
    });
  } catch (err) {
    next(err);
  }
});

router.post("/movies", async(req, res, next) => {
  try {
    const { title, genres, year } = req.body;
    const { id } = req.loggedUser
    const movie = await Movies.create({
      title,
      genres,
      year,
      user_id: id
    }, {returning: true})

    res.status(201).json({
      message: "Movie created successfully",
      data: movie
    })
  } catch(err) {
      next(err)
  }
})

// List semua movie
router.get("/movies", async(req, res, next) => {
  try {
    const page = req.query.page || 1;  
    const limit = req.query.limit || 10;  
    const offset = (page - 1) * limit;
    const movies = await Movies.findAll({ offset, limit });

    res.status(200).json({
      message: "Movies fetched successfully",
      data: movies,
    });

  } catch(err) {
      next(err)
  }
})

// Get detail movie by ID
router.get("/movies/:id", async(req, res, next) => {
  try {
    const { id } = req.params;
    const foundMovie = await Movies.findOne({ where: { id }, include: { model: Users }})

    if(foundMovie) {
      res.status(200).json(foundMovie)
    } else {
        throw { name: "ErrorNotFound" }
      }
  }catch (err) {
    next(err);
  }
})

// Update Movie by ID
router.put("/movies/:id", authorization, async(req, res, next) => {
  try {
    const { id } = req.params;
    const { title, genres, year } = req.body;
    const foundMovie = await Movies.findOne({ where: { id }});

    if(foundMovie) {
      const updatedMovie = await foundMovie.update({
        title: title || foundMovie.title,
        genres: genres || foundMovie.genres,
        year: year || foundMovie.year,
      }, { returning: true })

      res.status(200).json({
        message: "Movie updated successfully",
        data: updatedMovie
      })
    } else {
        throw {name: "ErrorNotFound"}
    }
  } catch(err) {
      next(err);
  }
})

router.delete("/movies/:id", authorization, async (req, res, next) => {
  try {
    const { id } = req.params;
    const foundMovie = await Movies.findOne({ where: { id }})

    if(foundMovie) {
      await foundMovie.destroy()

      res.status(200).json({
        message: "Movie deleted successfully"
      })
    } else {
        throw { name: "ErrorNotFound" }
    }
  } catch(err) {
      next(err);
  }
})

module.exports = router;