const tema = localStorage.getItem("tema") || "style1";

      if (tema === "style2") {
        document.write('<link rel="stylesheet" href="css/style2.css">');
      } else {
        document.write('<link rel="stylesheet" href="css/style1.css">');
      }