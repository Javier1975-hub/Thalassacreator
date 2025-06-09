
document.addEventListener("DOMContentLoaded", () => {
    const datosRuta = "datos/";
    const flota = [];
    const resumenDiv = document.getElementById("resumen");
    const formularioDiv = document.getElementById("formulario");
    const totalPuntosSpan = document.getElementById("totalPuntos");

    let totalPuntos = 0;
    let esNaveInsignia = false;

    const campos = [
        { nombre: "Tipo de Barco", archivo: "barcos.json", multiple: false },
        { nombre: "Nación", archivo: "naciones.json", multiple: false },
        { nombre: "Experiencia", archivo: "experiencia.json", multiple: false },
        { nombre: "Mejora de Estructura", archivo: "mejora_estructura.json", multiple: true },
        { nombre: "Mejora de Proa", archivo: "mejora_proa.json", multiple: false },
    ];

    const cargarJSON = async (archivo) => {
        const response = await fetch(`${datosRuta}${archivo}`);
        if (!response.ok) throw new Error(`Error al cargar ${archivo}`);
        return response.json();
    };

    const normalizar = (obj, key) => {
        const keys = Object.keys(obj);
        const found = keys.find(k => k.toLowerCase() === key.toLowerCase());
        return obj[found];
    };

    const crearSelect = (nombre, opciones, multiple = false) => {
        const div = document.createElement("div");
        const label = document.createElement("label");
        label.textContent = nombre;
        const select = document.createElement("select");
        select.name = nombre;
        select.multiple = multiple;
        select.innerHTML = "<option disabled selected>Seleccionar</option>";
        opciones.forEach(opt => {
            const option = document.createElement("option");
            option.value = normalizar(opt, "Nombre");
            option.textContent = `${normalizar(opt, "Nombre")} (${normalizar(opt, "Coste")} pts)`;
            option.dataset.coste = normalizar(opt, "Coste");
            div.appendChild(option);
        });
        div.appendChild(label);
        div.appendChild(select);
        formularioDiv.appendChild(div);
        return select;
    };

    const crearFormulario = async () => {
        formularioDiv.innerHTML = "";
        const selects = {};

        for (const campo of campos) {
            const data = await cargarJSON(campo.archivo);
            selects[campo.nombre] = crearSelect(campo.nombre, data, campo.multiple);
        }

        // Tripulación basada en la nación seleccionada
        selects["Nación"].addEventListener("change", async () => {
            const seleccion = selects["Nación"].value.toLowerCase();
            const tripData = await cargarJSON(`tripulacion_${seleccion}.json`);
            if (selects["Tripulación"]) {
                selects["Tripulación"].parentElement.remove();
            }
            selects["Tripulación"] = crearSelect("Tripulación", tripData, true);
        });

        // Opción para marcar como nave insignia
        const navarcaDiv = document.createElement("div");
        const navarcaCheckbox = document.createElement("input");
        navarcaCheckbox.type = "checkbox";
        navarcaCheckbox.id = "insignia";
        const navarcaLabel = document.createElement("label");
        navarcaLabel.htmlFor = "insignia";
        navarcaLabel.textContent = "Marcar como nave insignia";
        navarcaDiv.appendChild(navarcaCheckbox);
        navarcaDiv.appendChild(navarcaLabel);
        formularioDiv.appendChild(navarcaDiv);

        // Botón de agregar barco
        const boton = document.createElement("button");
        boton.textContent = "Añadir Barco";
        boton.addEventListener("click", async () => {
            const barco = {};
            let costeTotal = 0;

            for (const key in selects) {
                const sel = selects[key];
                if (sel.multiple) {
                    barco[key] = Array.from(sel.selectedOptions).map(opt => opt.value);
                    costeTotal += Array.from(sel.selectedOptions).reduce((acc, opt) => acc + parseInt(opt.dataset.coste), 0);
                } else {
                    barco[key] = sel.value;
                    const opt = sel.selectedOptions[0];
                    if (opt) costeTotal += parseInt(opt.dataset.coste || 0);
                }
            }

            // Navarca
            if (navarcaCheckbox.checked && barco["Tipo de Barco"]) {
                const navarcaData = await cargarJSON("navarca.json");
                barco["Navarca"] = normalizar(navarcaData[0], "Nombre");
                costeTotal += parseInt(normalizar(navarcaData[0], "Coste"));
            }

            barco["Coste"] = costeTotal;
            flota.push(barco);
            totalPuntos += costeTotal;
            totalPuntosSpan.textContent = totalPuntos;
            actualizarResumen();
        });

        formularioDiv.appendChild(boton);
    };

    const actualizarResumen = () => {
        resumenDiv.innerHTML = "<h3>Flota Actual</h3>";
        flota.forEach((barco, index) => {
            const div = document.createElement("div");
            div.classList.add("resumen-barco");
            div.innerHTML = `
                <strong>Barco ${index + 1}:</strong><br>
                Tipo: ${barco["Tipo de Barco"]}<br>
                Nación: ${barco["Nación"]}<br>
                Experiencia: ${barco["Experiencia"]}<br>
                Estructura: ${(barco["Mejora de Estructura"] || []).join(", ")}<br>
                Proa: ${barco["Mejora de Proa"]}<br>
                Tripulación: ${(barco["Tripulación"] || []).join(", ")}<br>
                ${barco["Navarca"] ? "Navarca: " + barco["Navarca"] + "<br>" : ""}
                <em>Coste: ${barco["Coste"]} pts</em>
            `;
            resumenDiv.appendChild(div);
        });
    };

    crearFormulario();
});
