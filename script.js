
document.addEventListener("DOMContentLoaded", () => {
  const totalPuntosSpan = document.getElementById("total-puntos");
  const listaFlota = document.getElementById("lista-flota");
  const exportarBtn = document.getElementById("exportar-pdf");

  let totalPuntos = 0;
  let flota = [];

  exportarBtn.addEventListener("click", () => {
    const doc = new window.jspdf.jsPDF();
    doc.text("Flota Thalassa", 10, 10);
    flota.forEach((barco, i) => {
      doc.text(`${i + 1}. ${barco.nombre} (${barco.puntos} pts)`, 10, 20 + i * 10);
    });
    doc.text(`Total de puntos: ${totalPuntos}`, 10, 20 + flota.length * 10);
    doc.save("flota_thalassa.pdf");
  });

  function añadirBarcoDemo() {
    const barco = { nombre: "Trirreme Ateniense", puntos: 45 };
    flota.push(barco);
    totalPuntos += barco.puntos;
    actualizarVista();
  }

  function actualizarVista() {
    listaFlota.innerHTML = "";
    flota.forEach((b, i) => {
      const li = document.createElement("li");
      li.textContent = `${b.nombre} (${b.puntos} pts)`;
      listaFlota.appendChild(li);
    });
    totalPuntosSpan.textContent = totalPuntos;
  }

  // Inicialización
  añadirBarcoDemo();
});
