document.addEventListener("DOMContentLoaded", () => {
  const formContainer = document.getElementById("formulario");
  const flotaContainer = document.getElementById("lista-flota");
  const totalPuntosSpan = document.getElementById("total-puntos");

  let flota = [];
  let totalPuntos = 0;
  const datos = {};

  // Rutas a archivos
  const rutas = {
    barcos: "datos/barcos.json",
    naciones: "datos/naciones.json",
    experiencia: "datos/experiencia.json",
    estructura: "datos/mejora_estructura.json",
    proa: "datos/mejora_proa.json",
    navarca: "datos/navarca.json",
    tripulaciones: {
      atenas: "datos/tripulacion_atenas.json",
      esparta: "datos/tripulacion_esparta.json",
      corintio: "datos/tripulacion_corintio.json",
      creta: "datos/tripulacion_creta.json"
    }
  };

  async function cargarDatos() {
    for (let clave of ["barcos", "naciones", "experiencia", "estructura", "proa", "navarca"]) {
      const res = await fetch(rutas[clave]);
      datos[clave] = await res.json();
    }
    crearSelect("barco", "Tipo de barco", datos.barcos, pasoBarco);
  }

  function crearSelect(id, etiqueta, lista, callback) {
    const div = document.createElement("div");
    div.className = "campo";
    div.innerHTML = `<label for="${id}">${etiqueta}</label>`;
    const select = document.createElement("select");
    select.id = id;
    select.innerHTML = `<option value="">Selecciona...</option>`;
    lista.forEach(item => {
      const opt = document.createElement("option");
      opt.value = item.Nombre;
      opt.textContent = `${item.Nombre} (+${item.Coste} pts)`;
      opt.dataset.coste = item.Coste;
      select.appendChild(opt);
    });
    select.addEventListener("change", () => callback(select.value));
    div.appendChild(select);
    formContainer.appendChild(div);
  }

  function limpiarDesde(id) {
    let limpiar = false;
    [...formContainer.children].forEach(c => {
      if (c.querySelector(`#${id}`)) limpiar = true;
      if (limpiar) c.remove();
    });
  }

  function pasoBarco(valor) {
    limpiarDesde("barco");
    crearSelect("nacion", "Nación", datos.naciones, pasoNacion);
  }

  function pasoNacion(valor) {
    limpiarDesde("nacion");
    crearSelect("experiencia", "Experiencia", datos.experiencia, pasoExperiencia);
  }

  function pasoExperiencia(valor) {
    limpiarDesde("experiencia");
    crearSelect("estructura", "Mejora de estructura", datos.estructura, pasoEstructura);
  }

  function pasoEstructura(valor) {
    limpiarDesde("estructura");
    crearSelect("proa", "Mejora de proa", datos.proa, pasoProa);
  }

  function pasoProa(valor) {
    limpiarDesde("proa");
    crearSelect("navarca", "Tipo de navarca", datos.navarca, pasoNavarca);
  }

  function pasoNavarca(valor) {
    limpiarDesde("navarca");
    const selNacion = document.getElementById("nacion");
    if (!selNacion || !selNacion.value) return alert("Por favor selecciona una nación primero.");
    const clave = selNacion.value.toLowerCase();
    const ruta = rutas.tripulaciones[clave];
    if (!ruta) return alert(`No hay tripulación para: ${clave}`);
    fetch(ruta)
      .then(res => res.json())
      .then(triplista => {
        crearSelect("tripulacion", "Tripulación", triplista, pasoTripulacion);
      })
      .catch(() => alert("Error cargando tripulación"));
  }

  function pasoTripulacion(valor) {
    limpiarDesde("tripulacion");
    const div = document.createElement("div");
    div.className = "campo";
    const btn = document.createElement("button");
    btn.textContent = "Añadir barco a flota";
    btn.onclick = e => {
      e.preventDefault();
      agregarBarco();
    };
    div.appendChild(btn);
    formContainer.appendChild(div);
  }

  function agregarBarco() {
    const nombres = ["barco", "nacion", "experiencia", "estructura", "proa", "navarca", "tripulacion"];
    const valores = {};
    let suma = 0;
    for (let id of nombres) {
      const sel = document.getElementById(id);
      if (!sel || !sel.value) return alert(`Falta seleccionar: ${id}`);
      const opcion = sel.selectedOptions[0];
      suma += parseInt(opcion.dataset.coste || 0);
      valores[id] = sel.value;
    }
    flota.push({ ...valores, coste: suma });
    totalPuntos += suma;
    mostrarFlota();
    limpiarDesde("barco");
    crearSelect("barco", "Tipo de barco", datos.barcos, pasoBarco);
  }

  function mostrarFlota() {
    flotaContainer.innerHTML = "";
    flota.forEach((b, i) => {
      const div = document.createElement("div");
      div.className = "barco";
      div.innerHTML = `
        <strong>${b.barco}</strong> (${b.nacion}) - ${b.coste} pts
        <button onclick="eliminarBarco(${i})">🗑</button>`;
      flotaContainer.appendChild(div);
    });
    totalPuntosSpan.textContent = totalPuntos;
  }

  window.eliminarBarco = function(i) {
    totalPuntos -= flota[i].coste;
    flota.splice(i, 1);
    mostrarFlota();
  };

  // Inicialización
  cargarDatos();
});
