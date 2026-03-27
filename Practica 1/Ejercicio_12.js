/**
 * Proporcione un ejemplo concreto donde el anidamiento de callbacks se puede 
reescribir mejor con async/await haciendo el código más limpio y mantenible.
 */
function ejercicio12() {
setTimeout(() => {
  console.log("Primer callback");
  setTimeout(() => {
    console.log("Segundo callback");
  }, 1000);
}, 1000);

function esperar(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function ejecutar() {
  await esperar(1000);
  console.log("Primer await");
  await esperar(1000);
  console.log("Segundo await");
}

ejecutar();
}