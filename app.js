let flota = [];
let datos = {};
let pasoActual = 0;
let barcoActual = {};
let seleccionActual = {};

// Archivos JSON a cargar
const archivos = {
  tipo_barco: "datos/barco.json",
  nacion: "datos/nacion.json",
  experiencia: "datos/experiencia.json",
  mejora_estructura: "datos/mejora_estructura.json",
  mejora_proa: "datos/mejora_proa.json",
  tripulaciones: {
    atenas: "datos/tripulacion_atenas.json",
    esparta: "datos/tripulacion_esparta.json",
    creta: "datos/tripulacion_creta.json",
    corintio: "datos/tripulacion_corintio.json",
  },
};

async function cargarDatos() {
  for (const clave in archivos) {
    if (clave === "tripulaciones") {
      datos[clave] = {};
      for (const nacion in archivos[clave]) {
        const res = await fetch(archivos[clave][nacion]);
        datos[clave][nacion] = await res.json();
      }
    } else {
      const res = await fetch(archivos[clave]);
      datos[clave] = await res.json();
    }
  }
  crearFormularioPaso1();
}

function crearFormularioPaso1() {
  pasoActual = 1;
  barcoActual = {};
  const contenedor = document.getElementById("formulario");
  contenedor.innerHTML = "<h2>1. Selecciona el tipo de barco</h2>";

  const select = document.createElement("select");
  select.innerHTML = `<option disabled selected>Seleccionar</option>`;
  datos.tipo_barco.forEach(b => {
    select.innerHTML += `<option value="${b.Nombre}">${b.Nombre} (${b.Coste} Coste)</option>`;
  });

  select.onchange = () => {
    const barcoSeleccionado = datos.tipo_barco.find(b => b.Nombre === select.value);
    barcoActual = {
      Tipo: barcoSeleccionado.Nombre,
      Coste: barcoSeleccionado.Coste,
      Datos: barcoSeleccionado,
    };
    crearFormularioPaso2();
  };

  contenedor.appendChild(select);
}

function crearFormularioPaso2() {
  pasoActual = 2;
  const contenedor = document.getElementById("formulario");
  contenedor.innerHTML = "<h2>2. Selecciona la nación</h2>";

  const select = document.createElement("select");
  select.innerHTML = `<option disabled selected>Seleccionar</option>`;
  datos.nacion.forEach(n => {
    select.innerHTML += `<option value="${n.Nombre}">${n.Nombre}</option>`;
  });

  select.onchange = () => {
    barcoActual.Nacion = select.value;
    crearFormularioPaso3();
  };

  contenedor.appendChild(select);
}

function crearFormularioPaso3() {
  pasoActual = 3;
  const contenedor = document.getElementById("formulario");
  contenedor.innerHTML = "<h2>3. Selecciona la experiencia</h2>";

  const select = document.createElement("select");
  select.innerHTML = `<option disabled selected>Seleccionar</option>`;
  datos.experiencia.forEach(exp => {
    select.innerHTML += `<option value="${exp.Nombre}">${exp.Nombre} (${exp.Coste} Coste)</option>`;
  });

  select.onchange = () => {
    const experiencia = datos.experiencia.find(e => e.Nombre === select.value);
    barcoActual.Experiencia = experiencia.Nombre;
    barcoActual.Coste += experiencia.Coste;
    crearFormularioPaso4();
  };

  contenedor.appendChild(select);
}

function crearFormularioPaso4() {
  pasoActual = 4;
  const contenedor = document.getElementById("formulario");
  contenedor.innerHTML = "<h2>4. Selecciona mejoras de estructura</h2>";

  const select = document.createElement("select");
  select.innerHTML = `<option disabled selected>Seleccionar</option>`;
  datos.mejora_estructura.forEach(m => {
    select.innerHTML += `<option value="${m.Nombre}">${m.Nombre} (${m.Coste} Coste)</option>`;
  });

  select.onchange = () => {
    const mejora = datos.mejora_estructura.find(m => m.Nombre === select.value);
    if (!barcoActual.Mejoras) barcoActual.Mejoras = [];
    barcoActual.Mejoras.push(mejora);
    barcoActual.Coste += mejora.Coste;
    crearFormularioPaso5();
  };

  contenedor.appendChild(select);
}

function crearFormularioPaso5() {
  pasoActual = 5;
  const contenedor = document.getElementById("formulario");
  contenedor.innerHTML = "<h2>5. Selecciona mejoras de proa</h2>";

  const select = document.createElement("select");
  select.innerHTML = `<option disabled selected>Seleccionar</option>`;
  datos.mejora_proa.forEach(m => {
    select.innerHTML += `<option value="${m.Nombre}">${m.Nombre} (${m.Coste} Coste)</option>`;
  });

  select.onchange = () => {
    const mejora = datos.mejora_proa.find(m => m.Nombre === select.value);
    if (!barcoActual.Mejoras) barcoActual.Mejoras = [];
    barcoActual.Mejoras.push(mejora);
    barcoActual.Coste += mejora.Coste;
    crearFormularioPaso6();
  };

  contenedor.appendChild(select);
}

function crearFormularioPaso6() {
  pasoActual = 6;
  const contenedor = document.getElementById("formulario");
  contenedor.innerHTML = "<h2>6. Selecciona la tripulación</h2>";

  const tripData = datos.tripulaciones[barcoActual.Nacion.toLowerCase()];
  const select = document.createElement("select");
  select.innerHTML = `<option disabled selected>Seleccionar</option>`;
  tripData.forEach(t => {
    select.innerHTML += `<option value="${t.Nombre}">${t.Nombre} (${t.Coste} Coste)</option>`;
  });

  select.onchange = () => {
    const trip = tripData.find(t => t.Nombre === select.value);
    barcoActual.Tripulacion = trip.Nombre;
    barcoActual.Coste += trip.Coste;
    barcoActual.Datos.Tripulacion = trip;
    flota.push(barcoActual);
    mostrarFlota();
    crearFormularioPaso1();
  };

  contenedor.appendChild(select);
}

function mostrarFlota() {
  const contenedor = document.getElementById("flota");
  contenedor.innerHTML = "<h2>Flota creada:</h2>";

  const lista = document.createElement("ul");
  flota.forEach((barco, i) => {
    const li = document.createElement("li");
    li.innerHTML = `
      ${i + 1}. ${barco.Tipo} - ${barco.Nacion} - ${barco.Experiencia} - ${barco.Tripulacion} - Coste: ${barco.Coste} 
      <button onclick="eliminarBarco(${i})">Eliminar</button>
    `;
    lista.appendChild(li);
  });

  contenedor.appendChild(lista);

  const total = flota.reduce((acc, b) => acc + b.Coste, 0);
  const totalP = document.createElement("p");
  totalP.textContent = `Coste total: ${total}`;
  contenedor.appendChild(totalP);
}

function eliminarBarco(index) {
  flota.splice(index, 1);
  mostrarFlota();
}

async function generarPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  let y = 10;

  doc.setFontSize(16);
  doc.text("Flota - ThalassaCreator", 10, y);
  y += 10;

  flota.forEach((barco, i) => {
    doc.setFontSize(14);
    doc.text(`${i + 1}. ${barco.Tipo} (${barco.Coste} pts)`, 10, y);
    y += 8;

    const detalles = {
      "Nación": barco.Nacion,
      "Experiencia": barco.Experiencia,
      "Tripulación": barco.Tripulacion,
    };

    if (barco.Mejoras) {
      barco.Mejoras.forEach((m, idx) => {
        detalles[`Mejora ${idx + 1}`] = m.Nombre;
      });
    }

    Object.entries(detalles).forEach(([k, v]) => {
      doc.setFontSize(11);
      doc.text(`- ${k}: ${v}`, 12, y);
      y += 6;
    });

    Object.entries(barco.Datos).forEach(([k, v]) => {
      if (typeof v === "string" || typeof v === "number") {
        doc.setFontSize(10);
        doc.text(`  ${k}: ${v}`, 14, y);
        y += 5;
      }
    });

    y += 4;
    if (y > 270) {
      doc.addPage();
      y = 10;
    }
  });

  const total = flota.reduce((acc, b) => acc + b.Coste, 0);
  doc.setFontSize(14);
  doc.text(`Total: ${total} pts`, 10, y + 5);
  doc.save("Flota_Thalassa.pdf");
}

cargarDatos();
