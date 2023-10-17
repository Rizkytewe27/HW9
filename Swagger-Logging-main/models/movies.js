'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Movies extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Movies.belongsTo(models.Users, {foreignKey: "user_id"})
    }
  }
  Movies.init({
    title: DataTypes.STRING,
    genres: DataTypes.STRING,
    user_id: DataTypes.INTEGER,
    year: DataTypes.STRING,
  }, {
    sequelize,
    modelName: 'Movies',
    tableName: 'Movies'
  });
  return Movies;
};