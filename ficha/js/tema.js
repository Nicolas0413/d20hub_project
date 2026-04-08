function trocarTema() {
  const atual = localStorage.getItem("tema") || "style1";
  const novo = atual === "style1" ? "style2" : "style1";

  localStorage.setItem("tema", novo);

  // recarrega a página já com o tema certo
  location.reload();
}