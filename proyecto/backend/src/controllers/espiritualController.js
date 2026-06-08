const pool = require("../config/database");

const obtenerVersiculo = async (req, res) => {
  const { categoria } = req.query;
  try {
    let query = "SELECT * FROM versiculos WHERE activo = TRUE";
    const params = [];
    if (categoria) {
      query += " AND categoria = $1";
      params.push(categoria);
    }
    query += " ORDER BY RANDOM() LIMIT 1";
    const r = await pool.query(query, params);
    if (!r.rows.length) return res.status(404).json({ error: "No se encontraron versiculos" });
    res.json({ versiculo: r.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const listarCategorias = async (req, res) => {
  const categorias = [
    { valor: "tristeza", etiqueta: "Para la tristeza", emoji: "😢" },
    { valor: "esperanza", etiqueta: "Esperanza", emoji: "🌟" },
    { valor: "fortaleza", etiqueta: "Fortaleza", emoji: "💪" },
    { valor: "sanidad", etiqueta: "Sanidad", emoji: "🙏" },
    { valor: "paz", etiqueta: "Paz", emoji: "☮️" },
    { valor: "general", etiqueta: "General", emoji: "✝️" }
  ];
  res.json({ categorias });
};

module.exports = { obtenerVersiculo, listarCategorias };
