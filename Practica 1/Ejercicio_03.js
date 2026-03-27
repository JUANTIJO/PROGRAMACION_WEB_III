/** */
function ejercicio3() {
function separarParesImpares(numeros) {
  let pares = [];
  let impares = [];

  for (let num of numeros) {
    if (num % 2 === 0) {
      pares.push(num);
    } else {
      impares.push(num);
    }
  }

  return { pares, impares };
}

let obj = separarParesImpares([1, 2, 3, 4, 5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20]);
console.log("Arreglo: "+[1, 2, 3, 4, 5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20]); 
console.log(obj);
}