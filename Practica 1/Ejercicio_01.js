/** contar vocales de un texto */
function ejercicio1() {
function contarVocales(texto) {
  // Inicializamos un objeto con las vocales en 0
  const vocales = {
    a: 0,
    e: 0,
    i: 0,
    o: 0,
    u: 0
  };

  // Recorremos cada caracter del texto
  for (let letra of texto.toLowerCase()) {
    if (vocales[letra] !== undefined) {
      vocales[letra]++;
    }
  }
  return vocales;
}
let frase="Electroencefalografista";
let obj = contarVocales(frase);
console.log("Frase: "+frase);
console.log("Vocales: ",obj);
}