// =======================
// ADICIONAR ATAQUE
// =======================

function addAttack(data = null) {
  const div = document.createElement("div");
  div.className = "attack";

  div.innerHTML = `
    <table width="100%">
      <td class="atk" width="111.68">
        <input class="editable" disabled placeholder="Machado" value="${data?.nome || ""}">
      </td>

      <td class="atk" width="111.68">
        <input class="editable" disabled placeholder="1d8" value="${data?.dano || ""}">
      </td>

      <td class="atk2" width="111.68">
        <input class="editable" disabled placeholder="19x2" value="${data?.critico || ""}">
      </td>
    </table>

    <button onclick="removeAttack(this)">Remover</button>
  `;

  document.getElementById("attacks").appendChild(div);
  saveAttacks();
}

// =======================
// REMOVER
// =======================

function removeAttack(btn){
  btn.parentElement.remove();
  saveAttacks();
}

// =======================
// SALVAR
// =======================

function saveAttacks(){
  const attacks=[];

  document.querySelectorAll(".attack").forEach(atk=>{
    const inputs=atk.querySelectorAll("input");

    attacks.push({
      nome: inputs[0].value,
      dano: inputs[1].value,
      critico: inputs[2].value
    });
  });

  localStorage.setItem(window.STORAGE_KEY + "_attacks", JSON.stringify(attacks));
}

// =======================
// CARREGAR
// =======================

function loadAttacks(){
  const data = localStorage.getItem(window.STORAGE_KEY + "_attacks");
  if(!data) return;

  const attacks = JSON.parse(data);
  document.getElementById("attacks").innerHTML="";

  attacks.forEach(atk=>addAttack(atk));
}

// =======================
// AUTO SAVE AO DIGITAR
// =======================

document.addEventListener("input", e=>{
  if(e.target.closest(".attack")){
    saveAttacks();
  }
});

// =======================
// CARREGAR AO ABRIR
// =======================

window.addEventListener("load", loadAttacks);
