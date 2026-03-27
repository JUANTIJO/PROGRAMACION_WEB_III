/**
 * Proporcione un ejemplo concreto de encadenamiento de promesas.
 */
// Ejercicio 11: Encadenamiento de promesas
function ejercicio11() {
function paso1() {
  return new Promise((resolve) => {
    setTimeout(() => resolve("Paso 1 listo"), 1000);
  });
}

function paso2(mensaje) {
  return new Promise((resolve) => {
    setTimeout(() => resolve(mensaje + " -> Paso 2 listo"), 1000);
  });
}

paso1()
  .then((res) => paso2(res))
  .then((final) => console.log(final));
}