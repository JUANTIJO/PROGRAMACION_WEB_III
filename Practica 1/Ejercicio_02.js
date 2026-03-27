/** invertir el orden de las palabras*/
function ejercicio2() {
function invertirFrase(frase) {
  // Dividimos la frase en palabras, invertimos el array y unimos
  return frase.split(" ").reverse().join(" ");
}
let original="Hola mundo desde JavaScript";
let cad = invertirFrase(original);

console.log("Frase original: "+original);
console.log("Frase invertida: "+cad);
}