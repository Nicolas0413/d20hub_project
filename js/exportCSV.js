function exportFichaCSV() {
  let rows = [["key", "value"]];

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    const value = localStorage.getItem(key);

    // ❌ ignora imagens (base64)
    if (
      key.toLowerCase().includes("image") ||
      key === "pfp" ||
      value.startsWith("data:image")
    ) continue;

    rows.push([key, value]);
  }

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
    const lines = reader.result.split("\n").slice(1);

    lines.forEach(line => {
      if (!line.trim()) return;

      const [key, ...rest] = line.split(",");
      const value = rest.join(",").replace(/^"|"$/g, "").replace(/""/g, '"');

      const cleanKey = key.replace(/^"|"$/g, "");

      // ❌ segurança extra
      if (cleanKey.toLowerCase().includes("image")) return;

      localStorage.setItem(cleanKey, value);
    });

    alert("Ficha importada com sucesso!");
    location.reload();
  };

  reader.readAsText(file);
});