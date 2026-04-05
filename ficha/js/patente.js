const patenteLimits = {
  recruta:   { itemI: 2, itemII: 0, itemIII: 0, itemIV: 0 },
  operador:  { itemI: 3, itemII: 1, itemIII: 0, itemIV: 0 },
  agente:    { itemI: 3, itemII: 2, itemIII: 1, itemIV: 0 },
  oficial:   { itemI: 3, itemII: 3, itemIII: 2, itemIV: 1 },
  elite:     { itemI: 3, itemII: 3, itemIII: 3, itemIV: 2 }
};

function updateInventoryLimits() {
  const patente = document.getElementById("patenteSelect").value;
  const limits = patenteLimits[patente];

  document.getElementById("limit-itemI").innerText = limits.itemI;
  document.getElementById("limit-itemII").innerText = limits.itemII;
  document.getElementById("limit-itemIII").innerText = limits.itemIII;
  document.getElementById("limit-itemIV").innerText = limits.itemIV;
}

function countItems(type) {
  return document.querySelectorAll(`.item[data-type="${type}"]`).length;
}

function canAdd(type) {
  const patente = document.getElementById("patenteSelect").value;
  const max = patenteLimits[patente][type];
  return countItems(type) < max;
}

updateInventoryLimits();

window.onload = function() {
  
  updateInventoryLimits();
  
};