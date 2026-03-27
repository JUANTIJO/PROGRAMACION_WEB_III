/**
 * Proporcione un ejemplo concreto donde el anidamiento de promesas se puede 
reescribir mejor con async/await haciendo el código más limpio y mantenible.
 */
function ejercicio13() {
   function tarea1() {
  return new Promise((resolve) => setTimeout(() => resolve("Tarea 1"), 1000));
}

tarea1().then((res) => {
  console.log(res);
  return new Promise((resolve) => setTimeout(() => resolve("Tarea 2"), 1000));
}).then((res) => console.log(res));


async function ejecutar() {
  let res1 = await tarea1();
  console.log(res1);
  let res2 = await new Promise((resolve) => setTimeout(() => resolve("Tarea 2"), 1000));
  console.log(res2);
}

ejecutar();
}