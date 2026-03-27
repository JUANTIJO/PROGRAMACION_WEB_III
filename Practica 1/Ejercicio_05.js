/** */
function ejercicio5() {
function esPalindromo(cadena) {
  let texto = cadena.toLowerCase().replace(/\s/g, ""); // quitamos espacios y mayúsculas
  let invertido = texto.split("").reverse().join("");
  return texto === invertido;
}

let band = esPalindromo("reconocer");
console.log("reconocer: "+band); // true

band = esPalindromo("desresponsabilizado");
console.log("desresponsabilizado: "+band); // false
}