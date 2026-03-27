/** */
function ejercicio4() {
function mayorYMenor(numeros) {
  let mayor = numeros[0];
  let menor = numeros[0];

  for (let num of numeros) {
    if (num > mayor) mayor = num;
    if (num < menor) menor = num;
  }

  return { mayor, menor };
}

let obj = mayorYMenor([3, 1, 5, 4, 2,10,8,46,11,0,9,-1,-2,-4,100,45,67,89,23,56]);
console.log("Arreglo: "+[3, 1, 5, 4, 2,10,8,46,11,0,9,-1,-2,-4,100,45,67,89,23,56]);
console.log(obj);
}