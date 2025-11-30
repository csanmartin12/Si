const numerosRojos = [
  1, 3, 5, 7, 9, 12, 14, 16,
  18, 19, 21, 23, 25, 27, 30, 32, 34, 36,
];

function esRojo(n) {
  return numerosRojos.includes(n);
}

function evaluarApuesta(apuesta, numeroGanador) {
  const { tipo, valor, monto } = apuesta;
  let gano = false;
  let factorPago = 0;

  switch (tipo) {
    case "rojo":
      gano = esRojo(numeroGanador);
      factorPago = 1;
      break;
    case "negro":
      gano = !esRojo(numeroGanador) && numeroGanador !== 0;
      factorPago = 1;
      break;
    case "par":
      gano = numeroGanador !== 0 && numeroGanador % 2 === 0;
      factorPago = 1;
      break;
    case "impar":
      gano = numeroGanador % 2 !== 0;
      factorPago = 1;
      break;
    case "bajo": // 1-18
      gano = numeroGanador >= 1 && numeroGanador <= 18;
      factorPago = 1;
      break;
    case "alto": // 19-36
      gano = numeroGanador >= 19 && numeroGanador <= 36;
      factorPago = 1;
      break;
    case "numero":
      gano = numeroGanador === valor;
      factorPago = 35;
      break;
    case "docena":
      if (valor === 1) gano = numeroGanador >= 1 && numeroGanador <= 12;
      if (valor === 2) gano = numeroGanador >= 13 && numeroGanador <= 24;
      if (valor === 3) gano = numeroGanador >= 25 && numeroGanador <= 36;
      factorPago = 2;
      break;
    case "columna":
      if (valor === 1) gano = numeroGanador % 3 === 1;
      if (valor === 2) gano = numeroGanador % 3 === 2;
      if (valor === 3) gano = numeroGanador !== 0 && numeroGanador % 3 === 0;
      factorPago = 2;
      break;
    default:
      gano = false;
      factorPago = 0;
  }

  const pago = gano ? monto * (factorPago + 1) : 0;
  const cambioNeto = pago - monto;

  return { gana: gano, pago, cambioNeto };
}

function evaluarApuestas(listaApuestas, numeroGanador) {
  let cambioNetoTotal = 0;
  const detalles = listaApuestas.map((ap) => {
    const resultado = evaluarApuesta(ap, numeroGanador);
    cambioNetoTotal += resultado.cambioNeto;
    return {
      tipo: ap.tipo,
      valor: ap.valor ?? null,
      monto: ap.monto,
      gano: resultado.gana,
      pago: resultado.pago,
      cambioNeto: resultado.cambioNeto,
    };
  });

  return { cambioNetoTotal, detalles };
}

module.exports = {
  evaluarApuesta,
  evaluarApuestas,
};
