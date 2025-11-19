// ===============================
// CONFIGURACIÓN DE DESTINO
// ===============================
const destino = { lat: 20.1694792062661, lon: -99.26764637231827 };

// ===============================
// REFERENCIAS DEL DOM
// ===============================
const btnMiUbicacion = document.getElementById("btnMiUbicacion");
const btnRutaManual = document.getElementById("btnRutaManual");
const inputDireccion = document.getElementById("direccionManual");

// ===============================
// CREAR MAPA LEAFLET
// ===============================
const map = L.map("map").setView([destino.lat, destino.lon], 17);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
  attribution: "© OpenStreetMap"
}).addTo(map);

// Marcador del destino
const marcadorDestino = L.marker([destino.lat, destino.lon])
  .addTo(map)
  .bindPopup("<b>Purificadora Quivaldi</b><br>Valle del Mezquital, Hidalgo.")
  .openPopup();

// Variable para la ruta
let ruta;

// ===============================
// FUNCIÓN PARA MOSTRAR RUTA
// ===============================
function mostrarRuta(latOrigen, lonOrigen) {
  if (ruta) map.removeLayer(ruta);

  const url = `https://router.project-osrm.org/route/v1/driving/${lonOrigen},${latOrigen};${destino.lon},${destino.lat}?overview=full&geometries=geojson`;

  fetch(url)
    .then(res => res.json())
    .then(data => {
      if (data.routes && data.routes.length > 0) {
        ruta = L.geoJSON(data.routes[0].geometry, { color: "#0dcaf0", weight: 5 }).addTo(map);
        const bounds = L.geoJSON(data.routes[0].geometry).getBounds();
        map.fitBounds(bounds);
      } else {
        alert("No se pudo calcular la ruta.");
      }
    })
    .catch(() => alert("Error al obtener la ruta."));
}

// ===============================
// BOTÓN UBICACIÓN ACTUAL
// ===============================
btnMiUbicacion.addEventListener("click", () => {
  if ("geolocation" in navigator) {
    btnMiUbicacion.disabled = true;
    btnMiUbicacion.textContent = "Obteniendo ubicación...";

    navigator.geolocation.getCurrentPosition(
      pos => {
        mostrarRuta(pos.coords.latitude, pos.coords.longitude);
        btnMiUbicacion.textContent = "Ruta desde mi ubicación";
        btnMiUbicacion.disabled = false;
      },
      () => {
        alert("No se pudo obtener tu ubicación.");
        btnMiUbicacion.textContent = "Ruta desde mi ubicación";
        btnMiUbicacion.disabled = false;
      }
    );
  } else {
    alert("Tu navegador no soporta geolocalización.");
  }
});

// ===============================
// BOTÓN DIRECCIÓN MANUAL
// ===============================
btnRutaManual.addEventListener("click", async () => {
  const direccion = inputDireccion.value.trim();
  if (!direccion) return alert("Ingresa una dirección o ciudad.");

  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(direccion)}`);
    const data = await res.json();
    if (!data.length) return alert("No se encontró la dirección.");

    mostrarRuta(data[0].lat, data[0].lon);
  } catch {
    alert("Error al buscar la dirección.");
  }
});
