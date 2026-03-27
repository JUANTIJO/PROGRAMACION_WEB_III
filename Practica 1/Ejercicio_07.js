/**
 * 
 */
function ejercicio7() {
let arreglo = [10, 20, 30, 40, 50];
let [primero, segundo, ...resto] = arreglo;

console.log("Arreglo: ",arreglo);
console.log("Primer elemento: ",primero); 
console.log("Segundo elemento: ",segundo); 
console.log("Resto de elementos: ",resto);   
}
