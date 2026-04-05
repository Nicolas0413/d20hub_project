function updateBar(type) { 
  const a = Number(document.getElementById(type + "Atual").value); 
  const m = Number(document.getElementById(type + "Max").value); 

  const bar = document.getElementById(type + "Bar"); 

  if (!m || m <= 0) { 
    bar.style.width = "0%"; 
    return; 
  } 

  const percent = Math.max(0, Math.min(100, (a / m) * 100)); 
  bar.style.width = percent + "%"; 
  } 
  
  function loadStorage() { 
    document.querySelectorAll("[data-save]").forEach(el => { 
      const key = el.dataset.save; 
      const value = localStorage.getItem(key); 
      
      if (value !== null) { 
        if (el.type === "checkbox") { 
          el.checked = value === "true"; 
        } else { 
          el.value = value; 
        } 
      } 
    }); 
    
    // 🔥 ATUALIZA AS BARRAS DEPOIS de restaurar os valores 
    
    updateBar("pv"); 
    updateBar("det"); } 
    
    window.addEventListener("load", loadStorage);