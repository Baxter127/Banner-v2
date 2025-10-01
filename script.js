const baseUrl = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQ7s2i7Ntt_hHKjayaDy58Joj8HO1deKznbBXfFiWMchrEfhIQc_RM-y8lWATAVlI36ya-5iiXGG1BY/pub?output=csv";

// Parsear CSV
function csvToJson(csv) {
    const rows = csv.trim().split("\n");
    rows.shift();
    return rows.filter(r => r.trim() !== "").map(row => {
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
            ligacinta: cols[9]?.replace(/"/g, "") || "",
            onoff: (cols[10] || "").toLowerCase().trim()
        };
    });
}

// Mostrar banner
function mostrarBanner(bannerSeleccionado) {
    const banner = document.getElementById("banner");
    if (!bannerSeleccionado) return;

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
            bannerSeleccionado.cinta
                ? `<div class="cinta">
                    ${
                        bannerSeleccionado.ligacinta
                        ? `<a href="${bannerSeleccionado.ligacinta}" target="_blank" style="color:white; text-decoration:none;">${bannerSeleccionado.cinta}</a>`
                        : bannerSeleccionado.cinta
                    }
                  </div>`
                : ""
        }
    `;

    // 🔹 Ajustar visibilidad según ancho
    aplicarResponsive();
}

function aplicarResponsive() {
    const alto = window.innerHeight;
    const banner = document.getElementById("banner");
    const desktop = banner.querySelector(".desktop");
    const movil = banner.querySelector(".movil");

    if (!desktop || !movil) return;

    if (alto <= 768) {
        // Mostrar desktop
        movil.style.display = "none";
        desktop.style.display = "block";

        banner.classList.remove("movil");
        banner.classList.add("desktop");
    } else {
        // Mostrar móvil
        desktop.style.display = "none";
        movil.style.display = "block";

        banner.classList.remove("desktop");
        banner.classList.add("movil");
    }
}

// Cargar banners desde Google Sheets
async function cargarBanner() {
    try {
        const csvUrl = `${baseUrl}&t=${Date.now()}`; // evitar cache
        const res = await fetch(csvUrl);
        const csvData = await res.text();
        const data = csvToJson(csvData);

        const activos = data.filter(b => b.onoff === "on");
        if (activos.length === 0) {
            document.getElementById("banner").innerHTML = "<p>No hay banners disponibles.</p>";
            return;
        }

        const seleccionado = activos[Math.floor(Math.random() * activos.length)];
        mostrarBanner(seleccionado);

        // Escuchar cambios de tamaño
        window.addEventListener("resize", aplicarResponsive);

    } catch (err) {
        console.error("Error cargando el banner:", err);
        document.getElementById("banner").innerHTML = "<p>Error al cargar banner</p>";
    }
}

// Ejecutar al cargar la página
document.addEventListener("DOMContentLoaded", cargarBanner);
window.addEventListener("resize", aplicarResponsive);
window.addEventListener("load", aplicarResponsive);




