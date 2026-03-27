/**Desestructuración de arrays en JS 
 *  Tomar los dos primeros elementos de un arreglo y almacenarlos en dos variables mediante desestructuración. 
 */
function ejercicio6() {
let arreglo = [10, 20, 30, 40, 50];
let [primero, segundo] = arreglo;
console.log("Arreglo: ["+arreglo+"]");
console.log("Primer elemento: "+primero);
console.log("Segundo elemento: "+segundo); 
}
