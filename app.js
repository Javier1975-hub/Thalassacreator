let datos = {};
let flota = [];
let puntosTotales = 0;

// Cargar datos desde los JSON
async function cargarDatos() {
  const archivos = [
    "datos/barco.json",
    "datos/nacion.json",
    "datos/experiencia.json",
    "datos/mejora_estructura.json",
    "datos/mejora_proa.json",
    "datos/navarca.json",
    "datos/tripulacion_atenas.json",
    "datos/tripulacion_corintio.json",
    "datos/tripulacion_creta.json",
    "datos/tripulacion_esparta.json"
  ];

  for (let archivo of archivos) {
    const clave = archivo.split("/")[1].replace(".json", "");
    const respuesta = await fetch(archivo);
    datos[clave] = await respuesta.json();
  }
  crearFormularioPaso1();
}

// Paso 1: Seleccionar tipo de barco
function crearFormularioPaso1() {
  const contenedor = document.getElementById("formulario");
  contenedor.innerHTML = crearSelect("Tipo de barco", datos.barco);
  document.getElementById("Tipo de barco").addEventListener("change", crearFormularioPaso2);
}

// Paso 2: Nación
function crearFormularioPaso2() {
  const contenedor = document.getElementById("formulario");
  contenedor.innerHTML += crearSelect("Nación", datos.nacion);
  document.getElementById("Nación").addEventListener("change", crearFormularioPaso3);
}

// Paso 3: Experiencia
function crearFormularioPaso3() {
  const contenedor = document.getElementById("formulario");
  contenedor.innerHTML += crearSelect("Experiencia", datos.experiencia);
  document.getElementById("Experiencia").addEventListener("change", crearFormularioPaso4);
}

// Paso 4: Mejora estructura
function crearFormularioPaso4() {
  const contenedor = document.getElementById("formulario");
  contenedor.innerHTML += crearSelect("Mejora estructura", datos.mejora_estructura);
  document.getElementById("Mejora estructura").addEventListener("change", crearFormularioPaso5);
}

// Paso 5: Mejora proa
function crearFormularioPaso5() {
  const contenedor = document.getElementById("formulario");
  contenedor.innerHTML += crearSelect("Mejora proa", datos.mejora_proa);
  document.getElementById("Mejora proa").addEventListener("change", crearFormularioPaso6);
}

// Paso 6: Tripulación y navarca
function crearFormularioPaso6() {
  const nacion = document.getElementById("Nación").value.toLowerCase();
  const tripKey = `tripulacion_${nacion}`;
  const trip = datos[tripKey] || [];
  const contenedor = document.getElementById("formulario");

  contenedor.innerHTML += crearSelect("Tripulación", trip);
  contenedor.innerHTML += crearSelect("Navarca", datos.navarca);

  const boton = document.createElement("button");
  boton.textContent = "Añadir Barco";
  boton.onclick = añadirBarco;
  contenedor.appendChild(boton);
}

function crearSelect(tipo, opciones) {
  let html = `<label>${tipo}</label><select id="${tipo}"><option disabled selected>Seleccionar</option>`;
  opciones.forEach(op => {
    html += `<option value="${op.Nombre}">${op.Nombre} (${op.Coste} pts)</option>`;
  });
  html += `</select><br>`;
  return html;
}

function añadirBarco() {
  const campos = [
    "Tipo de barco",
    "Nación",
    "Experiencia",
    "Mejora estructura",
    "Mejora proa",
    "Tripulación",
    "Navarca"
  ];

  campos.forEach(campo => {
    const valor = document.getElementById(campo).value;
    let datosLista = datos[campo.toLowerCase().replace(" ", "_")];
    if (campo === "Tripulación") {
      const nacion = document.getElementById("Nación").value.toLowerCase();
      datosLista = datos[`tripulacion_${nacion}`];
    }
    const item = datosLista.find(e => e.Nombre === valor);
    flota.push({ Tipo: campo, Nombre: item.Nombre, Coste: parseInt(item.Coste) || 0 });
    puntosTotales += parseInt(item.Coste) || 0;
  });

  actualizarResumen();
  document.getElementById("formulario").innerHTML = "";
  crearFormularioPaso1();
}

function actualizarResumen() {
  const resumen = document.getElementById("resumen");
  resumen.innerHTML = "<h3>Flota:</h3>";
  flota.forEach((item, i) => {
    resumen.innerHTML += `<div>${item.Tipo}: ${item.Nombre} (${item.Coste} pts) <button onclick="eliminar(${i})">❌</button></div>`;
  });
  resumen.innerHTML += `<p><strong>Coste total: ${puntosTotales} pts</strong></p>`;
}

function eliminar(index) {
  puntosTotales -= flota[index].Coste;
  flota.splice(index, 1);
  actualizarResumen();
}

// GENERAR PDF CON BORDES
document.getElementById("guardar").addEventListener("click", () => {
  const doc = new jsPDF();
  let y = 10;
  let barcosAgrupados = [];
  let barcoActual = null;

  flota.forEach((item) => {
    if (item.Tipo === "Tipo de barco") {
      barcoActual = {
        Nombre: item.Nombre,
        CosteTotal: item.Coste || 0,
        Componentes: [{ Tipo: item.Tipo, Nombre: item.Nombre, Coste: item.Coste }]
      };
      barcosAgrupados.push(barcoActual);
    } else if (barcoActual) {
      barcoActual.CosteTotal += item.Coste || 0;
      barcoActual.Componentes.push({ Tipo: item.Tipo, Nombre: item.Nombre, Coste: item.Coste });
    }
  });

  barcosAgrupados.forEach((barco, index) => {
    doc.setFontSize(12);
    doc.text(`Barco ${index + 1}: ${barco.Nombre}`, 10, y);
    y += 6;

    doc.setFontSize(10);
    doc.rect(10, y, 190, 8);
    doc.text("Tipo", 12, y + 6);
    doc.text("Nombre", 70, y + 6);
    doc.text("Coste", 170, y + 6);
    y += 8;

    barco.Componentes.forEach((comp) => {
      doc.rect(10, y, 190, 8);
      doc.text(comp.Tipo, 12, y + 6);
      doc.text(comp.Nombre, 70, y + 6);
      doc.text(`${comp.Coste ?? 0}`, 170, y + 6);
      y += 8;
    });

    doc.setFont("helvetica", "bold");
    doc.rect(10, y, 190, 8);
    doc.text(`Coste total del barco: ${barco.CosteTotal} pts`, 12, y + 6);
    doc.setFont("helvetica", "normal");
    y += 12;

    if (y > 270) {
      doc.addPage();
      y = 10;
    }
  });

  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text(`Coste total de la flota: ${puntosTotales} pts`, 10, y);
  doc.save("flota.pdf");
});

// Iniciar
cargarDatos();
