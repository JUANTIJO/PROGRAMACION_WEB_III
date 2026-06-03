const { Categoria, Producto } = require('../models');

// 1. POST /categorias - Registrar una nueva categoría
exports.createCategoria = async (req, res) => {
  try {
    const { nombre, descripcion } = req.body;
    const nuevaCategoria = await Categoria.create({ nombre, descripcion });
    res.status(201).json(nuevaCategoria);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 2. GET /categorias - Devolver todas las categorías
exports.getAllCategorias = async (req, res) => {
  try {
    const categorias = await Categoria.findAll();
    res.json(categorias);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 3. GET /categorias/:id - Devolver categoría por ID e incluir productos
exports.getCategoriaById = async (req, res) => {
  try {
    const { id } = req.params;
    const categoria = await Categoria.findByPk(id, {
      include: [{ model: Producto }]
    });
    if (!categoria) {
      return res.status(404).json({ message: 'Categoría no encontrada' });
    }
    res.json(categoria);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 4. PATCH /categorias/:id - Actualizar todos los datos
exports.updateCategoria = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion } = req.body;
    const categoria = await Categoria.findByPk(id);
    
    if (!categoria) {
      return res.status(404).json({ message: 'Categoría no encontrada' });
    }

    await categoria.update({ nombre, descripcion });
    res.json(categoria);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 5. DELETE /categorias/:id - Eliminar categoría y sus productos (Cascade)
exports.deleteCategoria = async (req, res) => {
  try {
    const { id } = req.params;
    const categoria = await Categoria.findByPk(id);
    
    if (!categoria) {
      return res.status(404).json({ message: 'Categoría no encontrada' });
    }

    // Al tener onDelete: 'CASCADE' definido en el modelo, 
    // Sequelize (o la DB) eliminará los productos asociados.
    await categoria.destroy();
    res.json({ message: 'Categoría y productos asociados eliminados correctamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
