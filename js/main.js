let currentShip = {};
let fleet = [];
let totalPoints = 0;

function startNewShip() {
  currentShip = { type: '', nationality: '', mastery: '', options: [], points: 0 };
  nextTab(1);
}

function nextTab(tabNum) {
  hideAllTabs();
  document.getElementById('tab' + tabNum).classList.add('active');
}

function prevTab(tabNum) {
  hideAllTabs();
  document.getElementById('tab' + tabNum).classList.add('active');
}

function hideAllTabs() {
  document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
}

function selectType(type) {
  currentShip.type = type;
}
function selectNationality(nat) {
  currentShip.nationality = nat;
}
function selectMastery(mastery) {
  currentShip.mastery = mastery;
}

function addShip() {
  currentShip.options = [];
  if (document.getElementById('option1').checked) currentShip.options.push('Armamento Especial');
  if (document.getElementById('option2').checked) currentShip.options.push('Velas Mejoradas');

  let points = 0;
  if (currentShip.type === 'Galeón') points += 10;
  if (currentShip.type === 'Fragata') points += 8;
  if (currentShip.mastery === 'Veterano') points += 5;
  points += currentShip.options.length * 2;

  currentShip.points = points;
  fleet.push({...currentShip});
  totalPoints += points;

  updateFleetList();
  hideAllTabs();
}

function updateFleetList() {
  const list = document.getElementById('fleetList');
  list.innerHTML = '';
  fleet.forEach((ship, index) => {
    const li = document.createElement('li');
    li.textContent = `🚢 ${ship.type} (${ship.nationality}) - Maestría: ${ship.mastery} - Opciones: ${ship.options.join(', ') || 'Ninguna'} - Puntos: ${ship.points}`;
    list.appendChild(li);
  });
  document.getElementById('totalPoints').textContent = totalPoints;
}

async function generatePDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  doc.setFontSize(16);
  doc.text("⚓ Flota Final - Thalassacreator", 10, 20);
  doc.setFontSize(12);
  let y = 30;
  fleet.forEach((ship, idx) => {
    doc.text(`${idx + 1}. ${ship.type} (${ship.nationality}) - Maestría: ${ship.mastery}`, 10, y);
    y += 6;
    doc.text(`   Opciones: ${ship.options.join(', ') || 'Ninguna'} - Puntos: ${ship.points}`, 10, y);
    y += 8;
    if (y > 270) {
      doc.addPage();
      y = 20;
    }
  });

  doc.text(`Total de puntos: ${totalPoints}`, 10, y + 4);
  doc.save("flota_thalassacreator.pdf");
}
