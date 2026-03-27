/**
 *  Proporcione un ejemplo para convertir un callback en una promesa.
 */
function ejercicio15() {
   function callbackEjemplo(callback) {
  setTimeout(() => {
    callback(null, "Datos del callback");
  }, 1000);
}

function callbackAPromesa() {
  return new Promise((resolve, reject) => {
    callbackEjemplo((error, data) => {
      if (error) reject(error);
      else resolve(data);
    });
  });
}

callbackAPromesa().then((data) => console.log(data));
}
