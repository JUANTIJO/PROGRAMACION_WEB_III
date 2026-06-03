const express = require('express');
const { sequelize, Categoria, Producto } = require('./models');
const categoriaRoutes = require('./routes/categoriaRoutes');

const app = express();
app.use(express.json());

// Rutas
app.use('/categorias', categoriaRoutes);

const PORT = 3000;

// Sincronizar Base de Datos e Iniciar Servidor
sequelize.sync({ force: true }).then(async () => {
  console.log('Base de datos sincronizada.');

  // iniciales según el requerimiento
  await Categoria.bulkCreate([
    { nombre: 'Electrónica', descripcion: 'Dispositivos electrónicos y gadgets' },
    { nombre: 'Oficina', descripcion: 'Material y accesorios de oficina' }
  ]);

  // Agregar un producto de ejemplo para probar el punto 3 y 5
  const cat = await Categoria.findOne({ where: { nombre: 'Electrónica' } });
  await Producto.create({ nombre: 'Laptop', precio: 1200, categoriaId: cat.id });

  app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
  });
});
