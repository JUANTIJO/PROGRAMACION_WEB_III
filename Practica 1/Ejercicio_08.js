/**
 * Realizar un código para ejecutar una función callback después 2 segundos. 
 */
// Ejercicio 8: Callback con setTimeout
function ejercicio8() {
function ejecutarCallback(callback) {
  setTimeout(() => {
    callback("Han pasado 2 segundos");
  }, 2000);
}

ejecutarCallback((mensaje) => {
  console.log(mensaje);
});
}


