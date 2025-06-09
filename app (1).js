
// Este es el contenido base adaptado del app.js corregido.
// Se asume que este script se enlaza en index.html después del DOM estar listo.

const datos = {
    barcos: [],
    experiencia: [],
    mejora_estructura: [],
    mejora_proa: [],
    naciones: [],
    navarca: [],
    tripulaciones: {
        atenas: [],
        corintio: [],
        creta: [],
        esparta: []
    }
};

// Normaliza los campos para que podamos acceder a 'Nombre' o 'nombre' sin errores
function normalizarEntrada(obj) {
    const nuevo = {};
    for (const key in obj) {
        nuevo[key.toLowerCase()] = obj[key];
    }
    return nuevo;
}

async function cargarDatos() {
    const archivos = {
        barcos: "datos/barcos.json",
        experiencia: "datos/experiencia.json",
        mejora_estructura: "datos/mejora_estructura.json",
        mejora_proa: "datos/mejora_proa.json",
        naciones: "datos/naciones.json",
        navarca: "datos/navarca.json",
        tripulacion_atenas: "datos/tripulacion_atenas.json",
        tripulacion_corintio: "datos/tripulacion_corintio.json",
        tripulacion_creta: "datos/tripulacion_creta.json",
        tripulacion_esparta: "datos/tripulacion_esparta.json"
    };

    for (const [clave, ruta] of Object.entries(archivos)) {
        try {
            const response = await fetch(ruta);
            if (!response.ok) throw new Error(`No se pudo cargar ${ruta}`);
            const json = await response.json();
            const normalizado = json.map(normalizarEntrada);

            if (clave.startsWith("tripulacion_")) {
                const nombre = clave.split("_")[1];
                datos.tripulaciones[nombre] = normalizado;
            } else {
                datos[clave] = normalizado;
            }
        } catch (error) {
            console.error("Error cargando", clave, error);
        }
    }

    iniciarFormulario(); // Llamar una vez se han cargado los datos
}

function iniciarFormulario() {
    console.log("Datos cargados correctamente:", datos);
    // Aquí puedes continuar con el renderizado del primer paso: tipo de barco
    // usar datos.barcos, datos.naciones, etc.
}

document.addEventListener("DOMContentLoaded", cargarDatos);
