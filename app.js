
// Función para normalizar claves a minúsculas
function normalizarClaves(obj) {
  const nuevo = {};
  for (let clave in obj) {
    nuevo[clave.toLowerCase()] = obj[clave];
  }
  return nuevo;
}

let flota = [];
let totalCoste = 0;

function actualizarCosteTotal() {
  const totalElement = document.getElementById("totalCoste");
  totalElement.textContent = `Coste total: ${totalCoste} pts`;
}

function cargarDatos(url, callback) {
  fetch(url)
    .then(res => res.json())
    .then(data => {
      callback(data.map(normalizarClaves));
    })
    .catch(error => {
      console.error("Error al cargar datos desde", url, error);
    });
}

function crearOpcion(select, item) {
  const option = document.createElement("option");
  option.value = JSON.stringify(item);
  option.text = `${item.nombre} (${item.coste} pts)`;
  select.appendChild(option);
}

function crearFormularioPaso1() {
  const contenedor = document.getElementById("formulario");
  contenedor.innerHTML = "";
  const select = document.createElement("select");
  select.id = "tipoBarco";
  select.innerHTML = "<option selected disabled>Seleccionar tipo de barco</option>";
  cargarDatos("datos/barco.json", data => {
    data.forEach(item => crearOpcion(select, item));
  });
  contenedor.appendChild(select);

  select.addEventListener("change", crearFormularioPaso2);
}

function crearFormularioPaso2() {
  const barco = JSON.parse(this.value);
  flota.push({ barco });
  const contenedor = document.getElementById("formulario");
  const select = document.createElement("select");
  select.id = "nacion";
  select.innerHTML = "<option selected disabled>Seleccionar nación</option>";
  cargarDatos("datos/nacion.json", data => {
    data.forEach(item => crearOpcion(select, item));
  });
  contenedor.appendChild(select);

  select.addEventListener("change", crearFormularioPaso3);
}

function crearFormularioPaso3() {
  const nacion = JSON.parse(this.value);
  flota[flota.length - 1].nacion = nacion;
  const contenedor = document.getElementById("formulario");
  const select = document.createElement("select");
  select.id = "experiencia";
  select.innerHTML = "<option selected disabled>Seleccionar experiencia</option>";
  cargarDatos("datos/experiencia.json", data => {
    data.forEach(item => crearOpcion(select, item));
  });
  contenedor.appendChild(select);

  select.addEventListener("change", crearFormularioPaso4);
}

function crearFormularioPaso4() {
  const experiencia = JSON.parse(this.value);
  flota[flota.length - 1].experiencia = experiencia;
  const contenedor = document.getElementById("formulario");

  const select1 = document.createElement("select");
  select1.id = "estructura";
  select1.innerHTML = "<option selected disabled>Seleccionar mejora de estructura</option>";
  cargarDatos("datos/mejora_estructura.json", data => {
    data.forEach(item => crearOpcion(select1, item));
  });

  const select2 = document.createElement("select");
  select2.id = "proa";
  select2.innerHTML = "<option selected disabled>Seleccionar mejora de proa</option>";
  cargarDatos("datos/mejora_proa.json", data => {
    data.forEach(item => crearOpcion(select2, item));
  });

  contenedor.appendChild(select1);
  contenedor.appendChild(select2);

  select2.addEventListener("change", crearFormularioPaso5);
}

function crearFormularioPaso5() {
  const estructura = JSON.parse(document.getElementById("estructura").value);
  const proa = JSON.parse(this.value);
  flota[flota.length - 1].estructura = estructura;
  flota[flota.length - 1].proa = proa;

  const nacion = flota[flota.length - 1].nacion.nombre.toLowerCase();
  const url = `datos/tripulacion_${nacion}.json`;

  const contenedor = document.getElementById("formulario");
  const select = document.createElement("select");
  select.id = "tripulacion";
  select.innerHTML = "<option selected disabled>Seleccionar tripulación</option>";
  cargarDatos(url, data => {
    data.forEach(item => crearOpcion(select, item));
  });
  contenedor.appendChild(select);

  select.addEventListener("change", finalizarBarco);
}

function finalizarBarco() {
  const tripulacion = JSON.parse(this.value);
  flota[flota.length - 1].tripulacion = tripulacion;

  const barcoActual = flota[flota.length - 1];
  const sumaCostes = Object.values(barcoActual)
    .map(obj => obj.coste || 0)
    .reduce((acc, val) => acc + val, 0);
  barcoActual.total = sumaCostes;
  totalCoste += sumaCostes;

  actualizarCosteTotal();
  mostrarBarcos();
  crearFormularioPaso1(); // Para añadir otro barco
}

function mostrarBarcos() {
  const lista = document.getElementById("listaBarcos");
  lista.innerHTML = "";
  flota.forEach((barco, index) => {
    const div = document.createElement("div");
    div.innerHTML = `
      <h3>Barco ${index + 1} - Total: ${barco.total} pts</h3>
      <ul>
        ${Object.entries(barco).map(([clave, valor]) => {
          if (typeof valor === "object") {
            return `<li><strong>${clave}:</strong> ${valor.nombre} (${valor.coste} pts)</li>`;
          }
          return "";
        }).join("")}
      </ul>
    `;
    lista.appendChild(div);
  });
}

window.onload = crearFormularioPaso1;
