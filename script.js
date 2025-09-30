// URL base de Google Sheets (archivo publicado en formato CSV)
const baseUrl = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQ7s2i7Ntt_hHKjayaDy58Joj8HO1deKznbBXfFiWMchrEfhIQc_RM-y8lWATAVlI36ya-5iiXGG1BY/pub?output=csv";

// ------------------------------
// Función para convertir CSV a JSON
// ------------------------------
function csvToJson(csv) {
    const rows = csv.trim().split("\n"); // separa el CSV en filas
    rows.shift(); // elimina la primera fila (encabezados)
    return rows.filter(r => r.trim() !== "").map(row => {
        // divide cada fila en columnas, respetando comillas
        const cols = row.match(/(".*?"|[^",]+)(?=\s*,|\s*$)/g) || [];
        return {
            imagenDesktop: cols[1]?.replace(/"/g, "") || "", // URL imagen desktop
            imagenMobile: cols[2]?.replace(/"/g, "") || "",  // URL imagen móvil
            titulo: cols[3]?.replace(/"/g, "") || "",        // título del banner
            condicion: cols[4]?.replace(/"/g, "") || "",     // texto secundario
            boton: cols[5]?.replace(/"/g, "") || "",         // texto del botón
            ligaboton: cols[6]?.replace(/"/g, "") || "",     // link del botón
            cta: cols[7]?.replace(/"/g, "") || "",           // CTA alternativo
            cinta: cols[8]?.replace(/"/g, "") || "",         // texto de la cinta inferior
            ligacinta: cols[9]?.replace(/"/g, "") || "",     // link de la cinta
            onoff: (cols[10] || "").toLowerCase().trim()     // estado ON/OFF
        };
    });
}

// ------------------------------
// Función para mostrar un banner en el DOM
// ------------------------------
function mostrarBanner(bannerSeleccionado) {
    const banner = document.getElementById("banner"); // contenedor principal
    if (!bannerSeleccionado) return; // si no hay banner, salir

    // Inserta el HTML dinámico del banner
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
        ${
            // Si existe texto en la cinta, lo agrega
            bannerSeleccionado.cinta
                ? `<div class="cinta">
                    ${
                        // Si la cinta tiene link, lo envuelve en <a>
                        bannerSeleccionado.ligacinta
                        ? `<a href="${bannerSeleccionado.ligacinta}" target="_blank" style="color:white; text-decoration:none;">${bannerSeleccionado.cinta}</a>`
                        : bannerSeleccionado.cinta
                    }
                  </div>`
                : ""
        }
    `;

    // Ajusta visibilidad según tamaño de pantalla
    aplicarResponsive();
}

// ------------------------------
// Función para alternar entre versión desktop y móvil
// ------------------------------
function aplicarResponsive() {
    const alto = window.innerHeight; // mide la altura de la ventana
    const banner = document.getElementById("banner");
    const desktop = banner.querySelector(".desktop"); // imagen desktop
    const movil = banner.querySelector(".movil");     // imagen móvil

    if (!desktop || !movil) return; // si no existen imágenes, salir

    // Condición de cambio (usa altura en lugar de ancho)
    if (alto <= 768) {
        // Mostrar versión desktop
        movil.style.display = "none";
        desktop.style.display = "block";

        banner.classList.remove("movil");
        banner.classList.add("desktop");
    } else {
        // Mostrar versión móvil
        desktop.style.display = "none";
        movil.style.display = "block";

        banner.classList.remove("desktop");
        banner.classList.add("movil");
    }
}

// ------------------------------
// Función para cargar banners desde Google Sheets
// ------------------------------
async function cargarBanner() {
    try {
        const csvUrl = `${baseUrl}&t=${Date.now()}`; // agrega timestamp para evitar caché
        const res = await fetch(csvUrl); // obtiene el CSV
        const csvData = await res.text(); // lo convierte a texto
        const data = csvToJson(csvData);  // lo parsea a JSON

        // Filtra solo los banners activos (on)
        const activos = data.filter(b => b.onoff === "on");
        if (activos.length === 0) {
            document.getElementById("banner").innerHTML = "<p>No hay banners disponibles.</p>";
            return;
        }

        // Selecciona un banner aleatorio de los activos
        const seleccionado = activos[Math.floor(Math.random() * activos.length)];
        mostrarBanner(seleccionado);

        // Escucha cambios de tamaño de ventana para re-aplicar responsive
        window.addEventListener("resize", aplicarResponsive);

    } catch (err) {
        // Manejo de errores en la carga
        console.error("Error cargando el banner:", err);
        document.getElementById("banner").innerHTML = "<p>Error al cargar banner</p>";
    }
}

// ------------------------------
// Ejecutar funciones al cargar la página
// ------------------------------
document.addEventListener("DOMContentLoaded", cargarBanner); // carga inicial
window.addEventListener("resize", aplicarResponsive);         // al redimensionar
window.addEventListener("load", aplicarResponsive);           // al terminar de cargar
