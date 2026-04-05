// ========================
// ADICIONAR PERÍCIA
// ========================

function addExpertise(data = null) {

  const div = document.createElement("div");
  div.className = "attack";

  div.innerHTML = `
    <table width="100%">
      <td class="list" width="40%">
        <input class="editable" style="text-align: left;" disabled 
        placeholder="Acrobacia" value="${data?.nome || ""}">
      </td>

      <td class="list" width="20%">
        <input class="editable" disabled 
        placeholder="1" value="${data?.treino || ""}">
      </td>

      <td class="list" width="20%">
        <input class="editable" disabled 
        placeholder="0" value="${data?.atributo || ""}">
      </td>

      <td class="listend" width="20%">
        <input class="editable" disabled 
        placeholder="0" value="${data?.outros || ""}">
      </td>
    </table>

    <button onclick="removeExpertise(this)">Remover</button>
  `;

  document.getElementById("attacks").appendChild(div);
  saveExpertises();
}

// ========================
// REMOVER
// ========================

function removeExpertise(btn){
  btn.parentElement.remove();
  saveExpertises();
}

// ========================
// SALVAR
// ========================

function saveExpertises(){

  const list=[];

  document.querySelectorAll("#attacks .attack").forEach(div=>{
    const inputs=div.querySelectorAll("input");

    list.push({
      nome: inputs[0].value,
      treino: inputs[1].value,
      atributo: inputs[2].value,
      outros: inputs[3].value
    });
  });

  localStorage.setItem(window.STORAGE_KEY + "_expertises", JSON.stringify(list));
}

// ========================
// CARREGAR
// ========================

function loadExpertises(){

  const data = localStorage.getItem(window.STORAGE_KEY + "_expertises");
  if(!data) return;

  const list = JSON.parse(data);

  document.getElementById("attacks").innerHTML="";

  list.forEach(e=>addExpertise(e));
}

// ========================
// AUTO SAVE
// ========================

document.addEventListener("input", e=>{
  if(e.target.closest("#attacks")){
    saveExpertises();
  }
});

// ========================
// AO ABRIR
// ========================

window.addEventListener("load", loadExpertises);
