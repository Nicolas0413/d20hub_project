
/*let edit = false;*/
window.edit = false;

function toggleEdit() {
  edit = !edit;

  document.querySelectorAll(".editable").forEach(i => {
    i.disabled = !edit;
  });

  const icon = document.querySelector("#editBtn i");
  const sheet = document.querySelector(".sheet");

  if (edit) {
    icon.className = "bi bi-check-lg";
    sheet.classList.add("editing");
  } else {
    icon.className = "bi bi-pencil-square";
    sheet.classList.remove("editing");
  }
}
/*
/* ===========================
   IMAGEM DA FICHA (index)
=========================== 

document.getElementById("imageInput").addEventListener("change", function () {
  const file = this.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    charImage.src = reader.result;
    localStorage.setItem("pfp", reader.result);
  };
  reader.readAsDataURL(file);
});

document.getElementById("detailImageInput").addEventListener("change", function () {
  const file = this.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    detailImage.src = reader.result;
    localStorage.setItem("detailImage", reader.result);
  };
  reader.readAsDataURL(file);
});

/* ===========================
   IMAGEM DETALHES
=========================== 

const detailInput = document.getElementById("detailImageInput");
const detailImage = document.getElementById("detailImage");

if (detailInput && detailImage) {
  detailInput.addEventListener("change", function () {
    const file = this.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = e => detailImage.src = e.target.result;
    reader.readAsDataURL(file);
  });

  detailImage.addEventListener("click", function () {
    if (!edit) return;
    detailInput.click();
  });
}

*/