function exportFichaCSV() {
  const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  let rows = [["key", "value"]];

  for (const key in data) {
    const value = data[key];

    // ❌ ignora imagens (base64)
    if (
      key.toLowerCase().includes("image") ||
      key === "pfp" ||
      value.startsWith("data:image")
    ) continue;

    rows.push([key, value]);
  }


  // Adicionar dados dinâmicos (ataques, habilidades, etc.)
  const attacks = localStorage.getItem(STORAGE_KEY + '_attacks');
  if (attacks) rows.push(['attacks', attacks]);

  const habilidades = localStorage.getItem(STORAGE_KEY + '_habilidades');
  if (habilidades) rows.push(['habilidades', habilidades]);

  const inventario = localStorage.getItem(STORAGE_KEY + '_inventario');
  if (inventario) rows.push(['inventario', inventario]);

  const expertises = localStorage.getItem(STORAGE_KEY + '_expertises');
  if (expertises) rows.push(['expertises', expertises]);

  const csv = rows
    .map(r =>
      r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(",")
    )
    .join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "ficha_rpg.csv";
  a.click();

  URL.revokeObjectURL(url);
}

document.getElementById("importCSV")?.addEventListener("change", function () {
  const file = this.files[0];
  if (!file) return;

  const reader = new FileReader();

  reader.onload = () => {
    const importedData = {};
    const lines = reader.result.split("\n").slice(1);

    lines.forEach(line => {
      if (!line.trim()) return;

      const [key, ...rest] = line.split(",");
      const value = rest.join(",").replace(/^"|"$/g, "").replace(/""/g, '"');

      const cleanKey = key.replace(/^"|"$/g, "");

      // ❌ segurança extra
      if (cleanKey.toLowerCase().includes("image")) return;

      if (cleanKey === 'attacks') {
        localStorage.setItem(STORAGE_KEY + '_attacks', value);
      } else if (cleanKey === 'habilidades') {
        localStorage.setItem(STORAGE_KEY + '_habilidades', value);
      } else if (cleanKey === 'inventario') {
        localStorage.setItem(STORAGE_KEY + '_inventario', value);
      } else if (cleanKey === 'expertises') {
        localStorage.setItem(STORAGE_KEY + '_expertises', value);
      } else {
        importedData[cleanKey] = value;
      }
    });

    // Salva apenas na chave da ficha atual
    localStorage.setItem(STORAGE_KEY, JSON.stringify(importedData));

    alert("Ficha importada com sucesso!");
    location.reload();
  };

  reader.readAsText(file);
});