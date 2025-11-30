// backend/utils/payments.js

/**
 * Calcula el pago de una apuesta en ruleta europea.
 * @param {Object} bet - Apuesta
 * @param {String} bet.type - "single" | "dozen" | "column"
 * @param {Number} bet.value - número o índice de docena/columna
 * @param {Number} bet.amount - monto apostado
 * @param {Number} winningNumber - número ganador (0-36)
 * @returns {Object} { won, payoutMultiplier, profit }
 */
function evaluateBet(bet, winningNumber) {
  const { type, value, amount } = bet;
  let won = false;
  let payoutMultiplier = 0;

  if (type === "single") {
    
    if (winningNumber === value) {
      won = true;
      payoutMultiplier = 35;
    }
  } else if (type === "dozen") {
    
    let from = 0;
    let to = 0;
    if (value === 1) {
      from = 1;
      to = 12;
    } else if (value === 2) {
      from = 13;
      to = 24;
    } else if (value === 3) {
      from = 25;
      to = 36;
    }
    if (winningNumber >= from && winningNumber <= to) {
      won = true;
      payoutMultiplier = 2;
    }
  } else if (type === "column") {
    
    if (winningNumber !== 0 && winningNumber % 3 === (value - 1)) {
      won = true;
      payoutMultiplier = 2;
    }
  }

  const profit = won ? amount * payoutMultiplier : -amount;

  return { won, payoutMultiplier, profit };
}


function evaluateBets(bets, winningNumber) {
  let netChange = 0;
  const detailed = bets.map((bet) => {
    const result = evaluateBet(bet, winningNumber);
    netChange += result.profit;
    return { ...bet, ...result };
  });

  return { netChange, detailed };
}

module.exports = {
  evaluateBet,
  evaluateBets
};
