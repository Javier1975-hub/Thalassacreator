
// Función para cargar opciones desde un JSON
async function cargarOpciones(url, nombreCampo = 'Nombre') {
    try {
        const response = await fetch(url);
        const datos = await response.json();
        return datos.map(obj => ({
            nombre: obj[nombreCampo] ?? obj[nombreCampo.toLowerCase()] ?? 'Sin nombre',
            coste: obj.Coste ?? 0,
            objeto: obj
        }));
    } catch (error) {
        console.error("Error al cargar", url, error);
        return [];
    }
}

// Función para crear un desplegable (opcionalmente múltiple)
function crearDesplegable(opciones, labelText, id, onChange, multiple = false) {
    const div = document.createElement('div');
    const label = document.createElement('label');
    label.innerText = labelText;
    div.appendChild(label);

    const select = document.createElement('select');
    select.id = id;
    if (multiple) select.multiple = true;

    const opcionDefault = document.createElement('option');
    opcionDefault.value = "";
    opcionDefault.innerText = "Seleccionar...";
    if (!multiple) select.appendChild(opcionDefault);

    opciones.forEach(op => {
        const option = document.createElement('option');
        option.value = op.nombre;
        option.innerText = `${op.nombre} (+${op.coste} pts)`;
        select.appendChild(option);
    });

    select.addEventListener('change', onChange);
    div.appendChild(select);
    return div;
}

// Simulación del flujo de pasos (deberás integrar con el resto del flujo)
async function iniciarFormulario() {
    const contenedor = document.getElementById("formulario");
    contenedor.innerHTML = "";

    // Paso 1: Tipo de barco
    const barcos = await cargarOpciones("datos/barcos.json");
    const paso1 = crearDesplegable(barcos, "Tipo de Barco:", "tipo-barco", (e) => {
        console.log("Barco seleccionado:", e.target.value);
    });
    contenedor.appendChild(paso1);

    // Paso 2: Nación
    const naciones = await cargarOpciones("datos/naciones.json");
    const paso2 = crearDesplegable(naciones, "Nación:", "nacion", (e) => {
        console.log("Nación seleccionada:", e.target.value);
    });
    contenedor.appendChild(paso2);

    // Paso 3: Experiencia
    const experiencia = await cargarOpciones("datos/experiencia.json");
    const paso3 = crearDesplegable(experiencia, "Experiencia:", "experiencia", (e) => {
        console.log("Experiencia seleccionada:", e.target.value);
    });
    contenedor.appendChild(paso3);

    // Paso 4: Mejora estructura (múltiple)
    const mejoraEstructura = await cargarOpciones("datos/mejora_estructura.json");
    const paso4 = crearDesplegable(mejoraEstructura, "Mejoras de Estructura:", "mejora-estructura", (e) => {
        console.log("Estructura seleccionada:", Array.from(e.target.selectedOptions).map(opt => opt.value));
    }, true);
    contenedor.appendChild(paso4);

    // Paso 5: Mejora proa
    const mejoraProa = await cargarOpciones("datos/mejora_proa.json");
    const paso5 = crearDesplegable(mejoraProa, "Mejoras de Proa:", "mejora-proa", (e) => {
        console.log("Proa seleccionada:", e.target.value);
    });
    contenedor.appendChild(paso5);

    // Paso 6: Tripulación (múltiple, aquí solo se muestra Atenas como ejemplo)
    const tripulacion = await cargarOpciones("datos/tripulacion_atenas.json");
    const paso6 = crearDesplegable(tripulacion, "Tripulación:", "tripulacion", (e) => {
        console.log("Tripulación seleccionada:", Array.from(e.target.selectedOptions).map(opt => opt.value));
    }, true);
    contenedor.appendChild(paso6);
}

window.onload = iniciarFormulario;



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

        doc.setLineWidth(0.1);
        doc.line(10, y, 200, y);
        y += 6;
    });

    doc.save("flota_thalassa.pdf");
}
