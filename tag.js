(function() {
  //Crear dinámicamente el contenedor del banner
  var newDiv = document.createElement('div');
  var targetDiv = document.querySelector('#chatFalse');
  newDiv.setAttribute('id', 'banner');
  newDiv.setAttribute('class', 'banner');
  targetDiv?.parentNode?.insertBefore(newDiv, targetDiv);

  //Insertar estilos CSS directamente en el <head>
  var style = document.createElement('style');
  style.innerHTML = `
    .banner {
      position: relative;
      width: 100%;
      max-width: 1440px;
      margin: 0 auto;
      overflow: hidden;
      text-align: left;
      color: white;
      min-height: 300px;
      display: flex;
      justify-content: center;
      align-items: center;
      background: #333;
    }
    .banner img { width: 100%; height: auto; display: block; }
    .banner p { color: white; font-size: 1.5rem; font-weight: bold; text-align: center; }
    .contenido {
      position: absolute;
      top: 20%;
      right: 8%;
      max-width: 35%;
    }
    .contenido h1 {
      font-size: 2.5rem;
      font-weight: 800;
      margin: 0 0 20px;
      line-height: 1.2;
      text-transform: uppercase;
    }
    .contenido p {
      font-size: 1.3rem;
      font-weight: 400;
      margin: 0 0 25px;
      line-height: 1.5;
    }
    .cta {
      display: inline-block;
      padding: 14px 32px;
      background: #fff;
      color: #e30613;
      font-weight: 400;
      font-size: 1.1rem;
      border-radius: 4px;
      text-decoration: none;
      transition: all 0.3s ease;
    }
    .cta:hover {
      background: #e30613;
      color: #fff;
    }
    .cinta {
      position: absolute;
      bottom: 0;
      width: 100%;
      background: #000;
      color: #fff;
      text-align: center;
      font-size: 1rem;
      font-weight: bold;
      padding: 10px;
    }
    .banner.desktop .contenido {
      top: 15%;
      right: 10%;
      max-width: 40%;
      text-align: left;
    }
    .banner.desktop .contenido h1 {
      font-size: 3rem;
      font-weight: 800;
      margin: 0 0 30px;
    }
    .banner.desktop .contenido p {
      font-size: 1.4rem;
      font-weight: 600;
      margin: 0 0 80px;
    }
    .banner.desktop .cta {
      font-size: 1.2rem;
      padding: 9px 70px;
      margin: 0px 270px 0px;
      display: inline-block;
      text-align: center;
      white-space: nowrap;
    }
    @media (min-height: 768px) {
      .banner.movil .contenido {
        top: 5%;
        left: 5%;
        right: 5%;
        max-width: 90%;
        text-align: center;
      }
      .banner.movil .contenido h1 {
        font-size: 4rem;
        font-weight: 700;
        margin: 60px 0px 20px;
      }
      .banner.movil .contenido p {
        font-size: 2.2rem;
        font-weight: bold;
        text-align: center;
        margin: 0 0 20px;
      }
      .banner.movil .cta {
        font-size: 2.8rem;
        margin-top: 340px;
        padding: 20px 150px;
      }
      .banner.movil .cinta {
        font-size: 2rem;
      }
    }
  `;
  document.head.appendChild(style);

  // 📄 3. URL del CSV publicado desde Google Sheets
  const baseUrl = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQ7s2i7Ntt_hHKjayaDy58Joj8HO1deKznbBXfFiWMchrEfhIQc_RM-y8lWATAVlI36ya-5iiXGG1BY/pub?output=csv";

  // 🔄 4. Convertir CSV en array de objetos
  function csvToJson(csv) {
    const rows = csv.trim().split("\n");
    rows.shift();
    return rows
      .filter(r => r.trim() !== "")
      .map(row => {
        const cols = row.match(/(".*?"|[^",]+)(?=\s*,|\s*$)/g) || [];
        return {
          imagenDesktop: cols[1]?.replace(/"/g, "") || "",
          imagenMobile: cols[2]?.replace(/"/g, "") || "",
          titulo: cols[3]?.replace(/"/g, "") || "",
          condicion: cols[4]?.replace(/"/g, "") || "",
          boton: cols[5]?.replace(/"/g, "") || "",
          ligaboton: cols[6]?.replace(/"/g, "") || "",
          cta: cols[7]?.replace(/"/g, "") || "",
          cinta: cols[8]?.replace(/"/g, "") || "",
          cintaOnOff: (cols[9] || "").toLowerCase().trim(),
          ligacinta: cols[10]?.replace(/"/g, "") || "",
          onoff: (cols[11] || "").toLowerCase().trim()
        };
      });
  }

  // 🖼️ 5. Mostrar el banner en el DOM
  function mostrarBanner(b) {
    if (!b) return;
    const mostrarCinta = b.cinta && b.cintaOnOff === "on";
    const html = `
      <img class="desktop" src="${b.imagenDesktop}" alt="banner desktop">
      <img class="movil" src="${b.imagenMobile}" alt="banner móvil">
      <div class="contenido">
        <h1>${b.titulo}</h1>
        <p>${b.condicion}</p>
        <a href="${b.ligaboton || b.cta}" target="_blank" class="cta">${b.boton}</a>
      </div>
      ${mostrarCinta ? `<div class="cinta">${b.ligacinta ? `<a href="${b.ligacinta}" target="_blank" style="color:white;">${b.cinta}</a>` : b.cinta}</div>` : ""}
    `;
    document.getElementById("banner").innerHTML = html;
    aplicarResponsive();
    window.addEventListener("resize", aplicarResponsive);
  }

  // 📱 6. Adaptar el banner según el alto de pantalla
  function aplicarResponsive() {
    const alto = window.innerHeight;
    const banner = document.getElementById("banner");
    const desktop = banner?.querySelector(".desktop");
    const movil = banner?.querySelector(".movil");
    if (!desktop || !movil) return;
    if (alto <= 768) {
      movil.style.display = "none";
      desktop.style.display = "block";
      banner.classList.remove("movil");
      banner.classList.add("desktop");
    } else {
      desktop.style.display = "none";
      movil.style.display = "block";
      banner.classList.remove("desktop");
      banner.classList.add("movil");
    }
  }

  // 🚀 7. Cargar el CSV y mostrar el banner
  fetch(`${baseUrl}&t=${Date.now()}`)
    .then(res => res.text())
    .then(csv => {
      const data = csvToJson(csv);
      const activos = data.filter(b => b.onoff === "on");
      if (activos.length === 0) {
        document.getElementById("banner").innerHTML = "<p>No hay banners disponibles.</p>";
        return;
      }
      const seleccionado = activos[Math.floor(Math.random() * activos.length)];
      mostrarBanner(seleccionado);
    })
    .catch(err => {
      console.error("Error cargando el banner:", err);
      document.getElementById("banner").innerHTML = "<p>Error al cargar banner</p>";
    });
})();
