// URL del archivo CSV publicado desde Google Sheets
const baseUrl = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQ7s2i7Ntt_hHKjayaDy58Joj8HO1deKznbBXfFiWMchrEfhIQc_RM-y8lWATAVlI36ya-5iiXGG1BY/pub?output=csv";

// Función para convertir el contenido CSV en un array de objetos JavaScript
function csvToJson(csv) {
  const rows = csv.trim().split("\n"); // Divide el CSV en filas
  rows.shift(); // Elimina la primera fila (encabezados)

  return rows
    .filter(r => r.trim() !== "") // Elimina filas vacías
    .map(row => {
      // Divide cada fila en columnas, respetando comillas
      const cols = row.match(/(".*?"|[^",]+)(?=\s*,|\s*$)/g) || [];

      // Retorna un objeto con los datos del banner
      return {
        imagenDesktop: cols[1]?.replace(/"/g, "") || "",     // Imagen para escritorio
        imagenMobile: cols[2]?.replace(/"/g, "") || "",      // Imagen para móvil
        titulo: cols[3]?.replace(/"/g, "") || "",            // Título del banner
        condicion: cols[4]?.replace(/"/g, "") || "",         // Condición o subtítulo
        boton: cols[5]?.replace(/"/g, "") || "",             // Texto del botón
        ligaboton: cols[6]?.replace(/"/g, "") || "",         // Enlace del botón
        cta: cols[7]?.replace(/"/g, "") || "",               // Enlace alternativo
        cinta: cols[8]?.replace(/"/g, "") || "",             // Texto de la cinta
        cintaOnOff: (cols[9] || "").toLowerCase().trim(),    // Celda J: controla si se muestra la cinta
        ligacinta: cols[10]?.replace(/"/g, "") || "",        // Enlace de la cinta
        onoff: (cols[11] || "").toLowerCase().trim()         // Celda L: controla si el banner está activo
      };
    });
}

// 🖼️ Función para mostrar el banner seleccionado en el DOM
function mostrarBanner(bannerSeleccionado) {
  const banner = document.getElementById("banner");
  if (!bannerSeleccionado) return;

  // Verifica si la cinta debe mostrarse (texto presente y celda J en "on")
  const mostrarCinta = bannerSeleccionado.cinta && bannerSeleccionado.cintaOnOff === "on";

  // Inserta el HTML del banner en el contenedor
  banner.innerHTML = `
    <img class="desktop" src="${bannerSeleccionado.imagenDesktop}" alt="banner desktop">
    <img class="movil" src="${bannerSeleccionado.imagenMobile}" alt="banner móvil">
    <div class="contenido">
      <h1>${bannerSeleccionado.titulo}</h1>
      <p>${bannerSeleccionado.condicion}</p>
      <a href="${bannerSeleccionado.ligaboton || bannerSeleccionado.cta}" target="_blank" class="cta">
        ${bannerSeleccionado.boton}
      </a>
    </div>
    ${mostrarCinta ? `
      <div class="cinta">
        ${bannerSeleccionado.ligacinta ? 
          `<a href="${bannerSeleccionado.ligacinta}" target="_blank" style="color:white; text-decoration:none;">${bannerSeleccionado.cinta}</a>` 
          : bannerSeleccionado.cinta}
      </div>
    ` : ""}
  `;

  // Aplica la lógica responsive para mostrar la imagen adecuada
  aplicarResponsive();
}

// 📱 Función para adaptar el banner según el alto de la pantalla
function aplicarResponsive() {
  const alto = window.innerHeight;
  const banner = document.getElementById("banner");
  const desktop = banner.querySelector(".desktop");
  const movil = banner.querySelector(".movil");
  if (!desktop || !movil) return;

  // Si el alto es menor o igual a 768px, se muestra la versión desktop
  if (alto <= 768) {
    movil.style.display = "none";
    desktop.style.display = "block";
    banner.classList.remove("movil");
    banner.classList.add("desktop");
  } else {
    // Si el alto es mayor, se muestra la versión móvil
    desktop.style.display = "none";
    movil.style.display = "block";
    banner.classList.remove("desktop");
    banner.classList.add("movil");
  }
}

// 🚀 Función principal para cargar los banners desde Google Sheets
async function cargarBanner() {
  try {
    const csvUrl = `${baseUrl}&t=${Date.now()}`; // Agrega timestamp para evitar caché
    const res = await fetch(csvUrl);             // Solicita el CSV
    const csvData = await res.text();            // Obtiene el texto plano
    const data = csvToJson(csvData);             // Convierte a JSON

    // Filtra los banners activos (celda L = "on")
    const activos = data.filter(b => b.onoff === "on");

    // Si no hay banners activos, muestra mensaje
    if (activos.length === 0) {
      document.getElementById("banner").innerHTML = "<p>No hay banners disponibles.</p>";
      return;
    }

    // Selecciona uno aleatoriamente
    const seleccionado = activos[Math.floor(Math.random() * activos.length)];
    mostrarBanner(seleccionado); // Muestra el banner

    // Escucha cambios de tamaño para aplicar responsive
    window.addEventListener("resize", aplicarResponsive);
  } catch (err) {
    // Si hay error, muestra mensaje en consola y en pantalla
    console.error("Error cargando el banner:", err);
    document.getElementById("banner").innerHTML = "<p>Error al cargar banner</p>";
  }
}

// 🧭 Ejecuta la carga del banner al iniciar la página
document.addEventListener("DOMContentLoaded", cargarBanner);
window.addEventListener("resize", aplicarResponsive);
window.addEventListener("load", aplicarResponsive);
