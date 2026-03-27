/**
 * Proporcione un ejemplo para convertir una promesa en un callback.  
 */
function ejercicio14() {
    function promesaEjemplo() {
  return new Promise((resolve) => {
    setTimeout(() => resolve("Datos de promesa"), 1000);
  });
}

function promesaACallback(callback) {
  promesaEjemplo().then((resultado) => {
    callback(null, resultado);
  }).catch((error) => {
    callback(error, null);
  });
}

promesaACallback((err, data) => {
  if (err) console.error(err);
  else console.log(data);
});
}