// Nota: Si este controlador requiere persistencia, importar pool desde ../../config/database

// Asistente IA con respuestas predefinidas
const RESPUESTAS_IA = {
  tristeza: [
    "Entiendo que hoy te sientes triste. Es completamente normal tener dias dificiles. Recuerda que no estas solo/a, hay personas que te aman y Dios esta contigo. Toma un respiro profundo y date permiso de sentir.",
    "La tristeza es parte de nuestra humanidad. Cada lagrima que lloras es valida. Hoy te invito a hacer algo pequeno que te traiga alegria: una cancion, una llamada a un ser querido, o simplemente mirar al cielo.",
    "En los momentos de tristeza, la fuerza que necesitas ya esta dentro de ti. Has superado dias dificiles antes, y este tambien pasara. Te acompano en este momento."
  ],
  miedo: [
    "El miedo es una senal de que algo importa. Es valiente reconocer lo que sientes. Respira hondo, el peligro suele ser menor de lo que parece. Estas mas fuerte de lo que crees.",
    "Cuando el miedo aparece, recuerda: no tienes que enfrentar esto solo/a. Habla con alguien de confianza, ya sea un familiar, amigo, o tu medico.",
    "El coraje no es la ausencia de miedo, sino seguir adelante a pesar de el. Eres valiente. Un paso a la vez."
  ],
  dolor: [
    "Siento mucho que estes con dolor. Recuerda tomar tu medicacion segun las indicaciones del medico y descansar. Si el dolor es muy fuerte, no dudes en contactar a tu doctor.",
    "El cuerpo habla cuando necesita atencion. Cuida bien de ti hoy: hidratate, descansa y permite que quienes te rodean te ayuden.",
    "Tu bienestar es lo mas importante. No minimices tu dolor, comunicate con tu equipo medico si sientes que algo no esta bien."
  ],
  alegria: [
    "Que hermoso saber que hoy te sientes bien! Esos momentos de alegria son un regalo. Aprovechalos al maximo y comparte esa luz con quienes te rodean.",
    "La alegria que sientes hoy es tuya y mereces cada momento de ella. Sigue adelante con esa energia positiva!",
    "Celebrar los momentos buenos es igual de importante que superar los dificiles. Hoy es un buen dia!"
  ],
  general: [
    "Hola, estoy aqui para acompanarte. Puedes contarme como te sientes y te dare el apoyo que necesitas.",
    "Cada dia es una nueva oportunidad. Cuida de ti mismo/a con amor y paciencia. Estoy aqui si necesitas hablar.",
    "Recuerda: pequenos pasos tambien son progreso. No te compares con nadie, cada proceso de salud es unico."
  ]
};

const detectarCategoria = (mensaje) => {
  const texto = mensaje.toLowerCase();
  if (/trist|llor|deprim|mal|pena|solo|soledad/.test(texto)) return "tristeza";
  if (/miedo|asust|nervi|ansied|preocup|temor/.test(texto)) return "miedo";
  if (/dolor|duele|duelo|sufr|mal/.test(texto)) return "dolor";
  if (/bien|feliz|alegr|mejor|content|animad/.test(texto)) return "alegria";
  return "general";
};

const responder = (req, res) => {
  const { mensaje } = req.body;
  if (!mensaje) return res.status(400).json({ error: "Mensaje requerido" });
  const categoria = detectarCategoria(mensaje);
  const opciones = RESPUESTAS_IA[categoria];
  const respuesta = opciones[Math.floor(Math.random() * opciones.length)];
  res.json({ categoria, respuesta, timestamp: new Date().toISOString() });
};

module.exports = { responder };
