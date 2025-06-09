
// Variables globales
let flota = [];
let datos = {};
let pasoActual = 0;
let barcoActual = {};
let esNaveInsignia = false;

const rutas = {
    barco: "datos/barcos.json",
    nacion: "datos/naciones.json",
    experiencia: "datos/experiencia.json",
    mejora_estructura: "datos/mejora_estructura.json",
    mejora_proa: "datos/mejora_proa.json",
    navarca: "datos/navarca.json",
    tripulaciones: {
        atenas: "datos/tripulacion_atenas.json",
        corintio: "datos/tripulacion_corintio.json",
        creta: "datos/tripulacion_creta.json",
        esparta: "datos/tripulacion_esparta.json"
    }
};

// Cargar todos los datos al inicio
async function cargarDatos() {
    for (let clave in rutas) {
        if (clave === "tripulaciones") {
            datos[clave] = {};
            for (let nacion in rutas.tripulaciones) {
                datos[clave][nacion] = await fetch(rutas.tripulaciones[nacion]).then(r => r.json());
            }
        } else {
            datos[clave] = await fetch(rutas[clave]).then(r => r.json());
        }
    }
    crearFormularioPaso0();
}

function crearFormularioPaso0() {
    const contenedor = document.getElementById("formulario");
    contenedor.innerHTML = `
        <h2>Añadir barco a la flota</h2>
        <label><input type="checkbox" id="naveInsignia"> ¿Es nave insignia?</label><br><br>
        <button onclick="crearFormularioPaso1()">Comenzar</button>
    `;
}

function crearFormularioPaso1() {
    esNaveInsignia = document.getElementById("naveInsignia").checked;
    pasoActual = 1;
    const contenedor = document.getElementById("formulario");
    contenedor.innerHTML = generarSelect("Tipo de Barco", "tipoBarco", datos.barco, "nombre") +
        '<button onclick="crearFormularioPaso2()">Siguiente</button>';
}

function crearFormularioPaso2() {
    barcoActual.tipo = obtenerSeleccion("tipoBarco", datos.barco);
    pasoActual = 2;
    const contenedor = document.getElementById("formulario");
    contenedor.innerHTML = generarSelect("Nación", "nacion", datos.nacion, "nombre") +
        '<button onclick="crearFormularioPaso3()">Siguiente</button>';
}

function crearFormularioPaso3() {
    barcoActual.nacion = obtenerSeleccion("nacion", datos.nacion);
    pasoActual = 3;
    const contenedor = document.getElementById("formulario");
    contenedor.innerHTML = generarSelect("Experiencia", "experiencia", datos.experiencia, "nombre") +
        '<button onclick="crearFormularioPaso4()">Siguiente</button>';
}

function crearFormularioPaso4() {
    barcoActual.experiencia = obtenerSeleccion("experiencia", datos.experiencia);
    pasoActual = 4;
    const contenedor = document.getElementById("formulario");
    contenedor.innerHTML = generarSelectMultiple("Mejoras de estructura", "mejora_estructura", datos.mejora_estructura, "nombre") +
        '<button onclick="crearFormularioPaso5()">Siguiente</button>';
}

function crearFormularioPaso5() {
    barcoActual.mejoras_estructura = obtenerMultipleSeleccion("mejora_estructura", datos.mejora_estructura);
    pasoActual = 5;
    const contenedor = document.getElementById("formulario");
    contenedor.innerHTML = generarSelect("Mejora de proa", "mejora_proa", datos.mejora_proa, "nombre") +
        '<button onclick="crearFormularioPaso6()">Siguiente</button>';
}

function crearFormularioPaso6() {
    barcoActual.mejoras_proa = obtenerSeleccion("mejora_proa", datos.mejora_proa);
    pasoActual = 6;
    const nacion = barcoActual.nacion.toLowerCase();
    const tripData = datos.tripulaciones[nacion] || [];
    const contenedor = document.getElementById("formulario");
    contenedor.innerHTML = generarSelectMultiple("Tripulación (máx. 3)", "tripulacion", tripData, "nombre", 3) +
        (esNaveInsignia ? generarSelect("Tipo de Navarca", "navarca", datos.navarca, "nombre") : "") +
        '<button onclick="finalizarBarco()">Finalizar barco</button>';
}

function finalizarBarco() {
    barcoActual.tripulacion = obtenerMultipleSeleccion("tripulacion", datos.tripulaciones[barcoActual.nacion.toLowerCase()], 3);
    if (esNaveInsignia) {
        barcoActual.navarca = obtenerSeleccion("navarca", datos.navarca);
    }
    flota.push(barcoActual);
    barcoActual = {};
    esNaveInsignia = false;
    actualizarResumen();
    crearFormularioPaso0();
}

function generarSelect(label, id, opciones, campoTexto = "nombre") {
    return `
        <label>${label}</label><br>
        <select id="${id}">
            <option value="">Seleccionar</option>
            ${opciones.map(o => `<option value="${o[campoTexto]}">${o[campoTexto]} (${o.Coste || o.coste || 0})</option>`).join("")}
        </select><br><br>`;
}

function generarSelectMultiple(label, id, opciones, campoTexto = "nombre", max = 10) {
    return `
        <label>${label}</label><br>
        <select id="${id}" multiple size="5">
            ${opciones.map(o => `<option value="${o[campoTexto]}">${o[campoTexto]} (${o.Coste || o.coste || 0})</option>`).join("")}
        </select><br><br>`;
}

function obtenerSeleccion(id, lista) {
    const val = document.getElementById(id)?.value;
    return val || "";
}

function obtenerMultipleSeleccion(id, lista, max = 10) {
    const opciones = document.getElementById(id);
    const seleccionados = [];
    for (let option of opciones.selectedOptions) {
        if (seleccionados.length < max) {
            seleccionados.push(option.value);
        }
    }
    return seleccionados;
}

function actualizarResumen() {
    const resumen = document.getElementById("resumen");
    resumen.innerHTML = "<h3>Resumen de Flota</h3>";
    flota.forEach((barco, i) => {
        resumen.innerHTML += `
        <div style="border:1px solid #999; margin:5px; padding:5px;">
            <strong>Barco ${i + 1}</strong><br>
            Tipo: ${barco.tipo}<br>
            Nación: ${barco.nacion}<br>
            Experiencia: ${barco.experiencia}<br>
            Estructura: ${barco.mejoras_estructura.join(", ")}<br>
            Proa: ${barco.mejoras_proa}<br>
            Tripulación: ${barco.tripulacion.join(", ")}<br>
            ${barco.navarca ? "Navarca: " + barco.navarca : ""}
        </div>`;
    });
}

function generarPDF(flota) {
    const doc = new jsPDF();
    let y = 10;

    doc.setFontSize(18);
    doc.text("Flota creada - ThalassaCreator", 10, y);
    y += 10;

    flota.forEach((barco, idx) => {
        doc.setFontSize(14);
        doc.text(`Barco ${idx + 1}: ${barco.tipo}`, 10, y);
        y += 8;

        doc.setFontSize(12);
        doc.text(`Nación: ${barco.nacion}`, 10, y); y += 6;
        doc.text(`Experiencia: ${barco.experiencia}`, 10, y); y += 6;

        if (barco.mejoras_estructura?.length) {
            doc.text("Mejoras de Estructura:", 10, y); y += 6;
            barco.mejoras_estructura.forEach(m => {
                doc.text(`- ${m}`, 12, y); y += 5;
            });
        }

        if (barco.mejoras_proa) {
            doc.text("Mejora de Proa:", 10, y); y += 6;
            doc.text(`- ${barco.mejoras_proa}`, 12, y); y += 5;
        }

        if (barco.tripulacion?.length) {
            doc.text("Tripulación:", 10, y); y += 6;
            barco.tripulacion.forEach(t => {
                doc.text(`- ${t}`, 12, y); y += 5;
            });
        }

        if (barco.navarca) {
            doc.text(`Navarca: ${barco.navarca}`, 10, y); y += 6;
        }

        doc.setLineWidth(0.1);
        doc.line(10, y, 200, y);
        y += 6;
    });

    doc.save("flota_thalassa.pdf");
}

// Cargar datos al iniciar
document.addEventListener("DOMContentLoaded", cargarDatos);
