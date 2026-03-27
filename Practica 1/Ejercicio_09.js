/**
 * Crear una promesa que devuelva un mensaje de éxito después de 3 segundos.
 */
// Ejercicio 9: Promesa con setTimeout
function ejercicio9() {
function promesaExitosa() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve("Operación exitosa después de 3 segundos");
    }, 3000);
  });
}

promesaExitosa().then((mensaje) => {
  console.log(mensaje);
});
}
