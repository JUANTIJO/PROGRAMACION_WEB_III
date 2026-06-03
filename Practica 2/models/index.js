const sequelize = require('../config/db');
const Categoria = require('./Categoria');
const Producto = require('./Producto');

// Relaciones
Categoria.hasMany(Producto, { 
  foreignKey: 'categoriaId',
  onDelete: 'CASCADE' // Punto 5: Eliminar productos automáticamente
});
Producto.belongsTo(Categoria, { 
  foreignKey: 'categoriaId' 
});

module.exports = {
  sequelize,
  Categoria,
  Producto
};
