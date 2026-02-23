function rollFromInputs() {
  const qtd = parseInt(document.getElementById("diceQtd").value);
  const faces = parseInt(document.getElementById("diceType").value);
  const bonus = parseInt(document.getElementById("diceBonus").value);

  if (isNaN(qtd) || isNaN(faces)) {
    alert("Valores inválidos");
    return;
  }

  rollDice(qtd, faces, bonus);
}

function rollDice(qtd, faces, bonus) {

  let total = 0;
  let rolls = [];

  for (let i = 0; i < qtd; i++) {
    const r = Math.floor(Math.random() * faces) + 1;
    rolls.push(r);
    total += r;
  }

  if (!isNaN(bonus)) total += bonus;

  showRollResult(qtd, faces, rolls, bonus, total);
}

function showRollResult(qtd, faces, rolls, bonus, total) {

  let maior = null;
  let menor = null;

  if (rolls.length > 1) {
    maior = Math.max(...rolls);
    menor = Math.min(...rolls);
  }

  let result = `${qtd}d${faces}`;

  if (bonus > 0) result += ` + ${bonus}`;
  if (bonus < 0) result += ` - ${Math.abs(bonus)}`;

  let text = `🎲 ${result}\n`;
  text += `Dados: [${rolls.join(", ")}]\n`;

  if (rolls.length > 1) {
    text += `Maior: ${maior}\n`;
    text += `Menor: ${menor}\n`;
  }

  text += `Total: ${total}`;

  document.getElementById("dice-result").innerText = text;
}