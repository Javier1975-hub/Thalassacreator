
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

let flota = [];
let puntosTotales = 0;

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

    iniciarFormulario();
}

function iniciarFormulario() {
    const contenedor = document.getElementById("formulario");
    contenedor.innerHTML = "";

    const select = document.createElement("select");
    select.id = "tipoBarco";
    select.innerHTML = "<option>Seleccionar tipo de barco</option>";
    datos.barcos.forEach(barco => {
        const option = document.createElement("option");
        option.value = barco.nombre;
        option.textContent = `${barco.nombre} (${barco.coste} Coste)`;
        select.appendChild(option);
    });

    select.addEventListener("change", () => seleccionarNacion(select.value));
    contenedor.appendChild(document.createElement("h2")).textContent = "Tipo de Barco";
    contenedor.appendChild(select);
}

function seleccionarNacion(barcoSeleccionado) {
    const contenedor = document.getElementById("formulario");
    contenedor.innerHTML = "";

    const barco = datos.barcos.find(b => b.nombre === barcoSeleccionado);
    const div = document.createElement("div");
    div.innerHTML = `<h2>${barco.nombre}</h2><p>Coste: ${barco.coste}</p>`;

    const select = document.createElement("select");
    select.innerHTML = "<option>Seleccionar nación</option>";
    datos.naciones.forEach(n => {
        const option = document.createElement("option");
        option.value = n.nombre.toLowerCase();
        option.textContent = n.nombre;
        select.appendChild(option);
    });

    select.addEventListener("change", () => seleccionarExperiencia(barco, select.value));
    contenedor.appendChild(div);
    contenedor.appendChild(document.createElement("h2")).textContent = "Nación";
    contenedor.appendChild(select);
}

function seleccionarExperiencia(barco, nacion) {
    const contenedor = document.getElementById("formulario");
    const select = document.createElement("select");
    select.innerHTML = "<option>Seleccionar experiencia</option>";
    datos.experiencia.forEach(e => {
        const option = document.createElement("option");
        option.value = e.nombre;
        option.textContent = `${e.nombre} (${e.coste} Coste)`;
        select.appendChild(option);
    });

    select.addEventListener("change", () => seleccionarOpciones(barco, nacion, select.value));
    contenedor.appendChild(document.createElement("h2")).textContent = "Experiencia";
    contenedor.appendChild(select);
}

function seleccionarOpciones(barco, nacion, experienciaNombre) {
    const contenedor = document.getElementById("formulario");

    const estructuraSelect = document.createElement("select");
    estructuraSelect.innerHTML = "<option>Seleccionar mejora de estructura</option>";
    datos.mejora_estructura.forEach(m => {
        const option = document.createElement("option");
        option.value = m.nombre;
        option.textContent = `${m.nombre} (${m.coste} Coste)`;
        estructuraSelect.appendChild(option);
    });

    const proaSelect = document.createElement("select");
    proaSelect.innerHTML = "<option>Seleccionar mejora de proa</option>";
    datos.mejora_proa.forEach(m => {
        const option = document.createElement("option");
        option.value = m.nombre;
        option.textContent = `${m.nombre} (${m.coste} Coste)`;
        proaSelect.appendChild(option);
    });

    const boton = document.createElement("button");
    boton.textContent = "Añadir a flota";
    boton.onclick = () => {
        const experiencia = datos.experiencia.find(e => e.nombre === experienciaNombre);
        const estructura = datos.mejora_estructura.find(e => e.nombre === estructuraSelect.value);
        const proa = datos.mejora_proa.find(e => e.nombre === proaSelect.value);
        const tripulacion = datos.tripulaciones[nacion]?.[0] || { nombre: "Desconocida", coste: 0 };

        const total = barco.coste + experiencia.coste + estructura.coste + proa.coste + tripulacion.coste;
        puntosTotales += total;

        flota.push({
            barco: barco.nombre,
            nacion,
            experiencia: experiencia.nombre,
            estructura: estructura.nombre,
            proa: proa.nombre,
            tripulacion: tripulacion.nombre,
            coste: total
        });

        alert("Barco añadido a la flota. Total puntos: " + puntosTotales);
        iniciarFormulario();
    };

    contenedor.appendChild(document.createElement("h2")).textContent = "Opciones de Estructura";
    contenedor.appendChild(estructuraSelect);
    contenedor.appendChild(document.createElement("h2")).textContent = "Opciones de Proa";
    contenedor.appendChild(proaSelect);
    contenedor.appendChild(boton);
}

document.addEventListener("DOMContentLoaded", cargarDatos);
