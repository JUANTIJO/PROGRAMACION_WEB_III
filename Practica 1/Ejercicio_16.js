/**
 * Proporcione un ejemplo para migrar una función con promesas a async/await. 
 */
function ejercicio16() {
    function obtenerUsuario() {
  return new Promise((resolve) => {
    setTimeout(() => resolve({ id: 1, nombre: "Ana" }), 1000);
  });
}

function obtenerEdad(usuario) {
  return new Promise((resolve) => {
    setTimeout(() => resolve({ ...usuario, edad: 25 }), 1000);
  });
}

obtenerUsuario()
  .then((usuario) => obtenerEdad(usuario))
  .then((completo) => console.log(completo));
}