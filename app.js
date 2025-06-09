// Elementos DOM
const formContainer = document.getElementById('formulario');
const flotaContainer = document.getElementById('flota');
const puntosTotales = document.getElementById('puntosTotales');

let flota = [];
let totalPuntos = 0;
let datos = {};

// Cargar todos los archivos JSON
const archivos = {
    barcos: 'datos/barcos.json',
    naciones: 'datos/naciones.json',
    experiencia: 'datos/experiencia.json',
    mejoras_proa: 'datos/mejoras_proa.json',
    mejoras_estructura: 'datos/mejoras_estructura.json',
    navarca: 'datos/navarca.json',
    tripulaciones: {
        atenas: 'datos/tripulacion_atenas.json',
        esparta: 'datos/tripulacion_esparta.json',
        corintio: 'datos/tripulacion_corintio.json',
        creta: 'datos/tripulacion_creta.json'
    }
};

async function cargarDatos() {
    for (let [clave, ruta] of Object.entries(archivos)) {
        if (clave === "tripulaciones") continue;
        const res = await fetch(ruta);
        datos[clave] = await res.json();
    }
    crearFormularioPaso1();
}

function crearSelect(opciones, id, label, siguientePaso) {
    const div = document.createElement('div');
    div.className = 'campo';
    div.innerHTML = `<label for="${id}">${label}</label>`;
    const select = document.createElement('select');
    select.id = id;
    select.innerHTML = `<option value="">Seleccione...</option>`;
    opciones.forEach(op => {
        select.innerHTML += `<option value="${op.nombre}">${op.nombre} (+${op.puntos || 0} pts)</option>`;
    });
    select.addEventListener('change', () => siguientePaso(select.value));
    div.appendChild(select);
    formContainer.appendChild(div);
}

function limpiarFormularioDesde(id) {
    let limpiar = false;
    [...formContainer.children].forEach(child => {
        if (child.querySelector(`#${id}`)) limpiar = true;
        if (limpiar) child.remove();
    });
}

function crearFormularioPaso1() {
    crearSelect(datos.barcos, 'barco', 'Tipo de barco', crearFormularioPaso2);
}

function crearFormularioPaso2(barco) {
    limpiarFormularioDesde('barco');
    crearSelect(datos.naciones, 'nacion', 'Nación', crearFormularioPaso3);
}

function crearFormularioPaso3(nacion) {
    limpiarFormularioDesde('nacion');
    crearSelect(datos.experiencia, 'experiencia', 'Experiencia', crearFormularioPaso4);
}

function crearFormularioPaso4(exp) {
    limpiarFormularioDesde('experiencia');
    crearSelect(datos.mejoras_estructura, 'estructura', 'Mejoras de estructura', crearFormularioPaso5);
}

function crearFormularioPaso5(estructura) {
    limpiarFormularioDesde('estructura');
    crearSelect(datos.mejoras_proa, 'proa', 'Mejoras de proa', crearFormularioPaso6);
}

function crearFormularioPaso6(proa) {
    limpiarFormularioDesde('proa');
    const nacionSelect = document.getElementById('nacion');
if (!nacionSelect) {
    alert("Debe seleccionar una nación antes de continuar.");
    return;
}
const nacion = nacionSelect.value.toLowerCase();

    const ruta = archivos.tripulaciones[nacion];
    if (!ruta) return alert("No hay tripulación para esa nación.");
    fetch(ruta)
        .then(res => res.json())
        .then(tripulacion => {
            crearSelect(tripulacion, 'tripulacion', 'Tripulación', crearFormularioPaso7);
        });
}

function crearFormularioPaso7() {
    const div = document.createElement('div');
    div.className = 'campo';
    const btn = document.createElement('button');
    btn.innerText = 'Añadir barco a flota';
    btn.onclick = (e) => {
        e.preventDefault();
        añadirBarcoAFlota();
    };
    div.appendChild(btn);
    formContainer.appendChild(div);
}

function añadirBarcoAFlota() {
    const barco = document.getElementById('barco').value;
    const nacion = document.getElementById('nacion').value;
    const experiencia = document.getElementById('experiencia').value;
    const estructura = document.getElementById('estructura').value;
    const proa = document.getElementById('proa').value;
    const tripulacion = document.getElementById('tripulacion').value;

    const getPuntos = (lista, nombre) => lista.find(i => i.nombre === nombre)?.puntos || 0;

    const puntos = 
        getPuntos(datos.barcos, barco) +
        getPuntos(datos.naciones, nacion) +
        getPuntos(datos.experiencia, experiencia) +
        getPuntos(datos.mejoras_estructura, estructura) +
        getPuntos(datos.mejoras_proa, proa);

    fetch(archivos.tripulaciones[nacion.toLowerCase()])
        .then(res => res.json())
        .then(tripList => {
            const trip = tripList.find(i => i.nombre === tripulacion);
            const puntosTripulacion = trip?.puntos || 0;

            const entrada = {
                barco,
                nacion,
                experiencia,
                estructura,
                proa,
                tripulacion,
                puntos: puntos + puntosTripulacion
            };

            flota.push(entrada);
            totalPuntos += entrada.puntos;
            actualizarFlota();
            limpiarFormularioDesde('barco');
            crearFormularioPaso1();
        });
}

function actualizarFlota() {
    flotaContainer.innerHTML = '';
    flota.forEach((barco, i) => {
        const div = document.createElement('div');
        div.className = 'barco';
        div.innerHTML = `
            <strong>${barco.barco}</strong> (${barco.nacion}) - ${barco.puntos} pts
            <button onclick="eliminarBarco(${i})">🗑</button>
        `;
        flotaContainer.appendChild(div);
    });
    puntosTotales.innerText = totalPuntos;
}

function eliminarBarco(index) {
    totalPuntos -= flota[index].puntos;
    flota.splice(index, 1);
    actualizarFlota();
}

// Iniciar
cargarDatos();
