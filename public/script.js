let alternatives = [];
let criteria = [];

document.addEventListener('DOMContentLoaded', () => {
  loadFromFile();
});

function addAlternative() {
  const alternativeName = prompt('Masukkan nama alternatif:');
  if (alternativeName) {
    alternatives.push(alternativeName);
    saveToFile();
    renderAlternatives();
    renderWeights();
  }
}

function addCriteria() {
  const criteriaName = prompt('Masukkan nama kriteria:');
  if (criteriaName) {
    criteria.push(criteriaName);
    saveToFile();
    renderCriteria();
    renderWeights();
  }
}

function renderAlternatives() {
  const alternativesDiv = document.getElementById('alternatives');
  alternativesDiv.innerHTML = '';
  alternatives.forEach((alternative, index) => {
    const div = document.createElement('div');
    div.className = 'input-group mb-2';
    div.innerHTML = `
      <input type="text" class="form-control" value="${alternative}" readonly>
      <div class="input-group-append">
        <button class="btn btn-danger" onclick="removeAlternative(${index})">Hapus</button>
      </div>
    `;
    alternativesDiv.appendChild(div);
  });
}

function removeAlternative(index) {
  alternatives.splice(index, 1);
  saveToFile();
  renderAlternatives();
  renderWeights();
}

function renderCriteria() {
  const criteriaDiv = document.getElementById('criteria');
  criteriaDiv.innerHTML = '';
  criteria.forEach((criterion, index) => {
    const div = document.createElement('div');
    div.className = 'input-group mb-2';
    div.innerHTML = `
      <input type="text" class="form-control" value="${criterion}" readonly>
      <div class="input-group-append">
        <button class="btn btn-danger" onclick="removeCriteria(${index})">Hapus</button>
      </div>
    `;
    criteriaDiv.appendChild(div);
  });
}

function removeCriteria(index) {
  criteria.splice(index, 1);
  saveToFile();
  renderCriteria();
  renderWeights();
}

function renderWeights() {
  const weightsDiv = document.getElementById('weights');
  weightsDiv.innerHTML = '';

  if (alternatives.length > 0 && criteria.length > 0) {
    const table = document.createElement('table');
    table.className = 'table table-bordered';

    let headerRow = '<tr><th>Alternatif</th>';
    criteria.forEach((criterion) => {
      headerRow += `<th>${criterion}</th>`;
    });
    headerRow += '</tr>';
    table.innerHTML = headerRow;

    alternatives.forEach((alternative) => {
      let row = `<tr><td>${alternative}</td>`;
      criteria.forEach((criterion) => {
        row += `<td><input type="number" class="form-control weight-input" placeholder="0"></td>`;
      });
      row += '</tr>';
      table.innerHTML += row;
    });

    weightsDiv.appendChild(table);

    const typeSelects = document.createElement('div');
    typeSelects.className = 'form-group';
    criteria.forEach((criterion, index) => {
      const div = document.createElement('div');
      div.className = 'form-group mb-2';
      div.innerHTML = `
        <label>${criterion} Tipe:</label>
        <select class="form-control type-select" data-index="${index}">
          <option value="benefit">Benefit</option>
          <option value="cost">Cost</option>
        </select>
      `;
      typeSelects.appendChild(div);
    });
    weightsDiv.appendChild(typeSelects);
  }
}

function calculatePromethee() {
  const weightInputs = document.querySelectorAll('.weight-input');
  const typeSelects = document.querySelectorAll('.type-select');
  if (weightInputs.length === 0 || typeSelects.length === 0) return;

  const weights = [];
  const types = [];
  for (let i = 0; i < alternatives.length; i++) {
    const row = [];
    for (let j = 0; j < criteria.length; j++) {
      row.push(parseFloat(weightInputs[i * criteria.length + j].value) || 0);
    }
    weights.push(row);
  }

  typeSelects.forEach((select) => {
    types.push(select.value);
  });

  const results = promethee(weights, types);
  displayResults(results);
}

function promethee(weights, types) {
  const numAlternatives = alternatives.length;
  const numCriteria = criteria.length;

  // Menghitung nilai indeks preferensi multikriteria
  const preferenceMatrix = Array.from({ length: numAlternatives }, () =>
    Array(numAlternatives).fill(0)
  );

  for (let i = 0; i < numAlternatives; i++) {
    for (let j = 0; j < numAlternatives; j++) {
      if (i !== j) {
        let preference = 0;
        for (let k = 0; k < numCriteria; k++) {
          const diff = weights[i][k] - weights[j][k];
          const normalizedDiff = types[k] === 'cost' ? -diff : diff;
          if (normalizedDiff > 0) {
            preference += 1; // Nilai preferensi 1 untuk setiap kriteria
          }
        }
        preferenceMatrix[i][j] = preference / numCriteria;
      }
    }
  }

  // Perhitungan Leaving Flow, Entering Flow, dan Net Flow
  const leavingFlow = preferenceMatrix.map((row) =>
    row.reduce((acc, val) => acc + val, 0) / (numAlternatives - 1)
  );
  const enteringFlow = Array(numAlternatives).fill(0);
  for (let j = 0; j < numAlternatives; j++) {
    for (let i = 0; i < numAlternatives; i++) {
      enteringFlow[j] += preferenceMatrix[i][j];
    }
    enteringFlow[j] /= numAlternatives - 1;
  }
  const netFlow = leavingFlow.map((lf, i) => lf - enteringFlow[i]);

  // Penampilan ranking berdasarkan hasil net flow
  const rankedAlternatives = alternatives.map((alternative, index) => ({
    alternative,
    netFlow: netFlow[index],
  }));

  rankedAlternatives.sort((a, b) => b.netFlow - a.netFlow);

  return rankedAlternatives;
}

function displayResults(results) {
  const resultsDiv = document.getElementById('results');
  resultsDiv.innerHTML = '';

  const table = document.createElement('table');
  table.className = 'table table-bordered';

  table.innerHTML = `
    <thead>
      <tr>
        <th>Peringkat</th>
        <th>Alternatif</th>
        <th>Net Flow</th>
      </tr>
    </thead>
  `;

  const tbody = document.createElement('tbody');
  results.forEach((result, index) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${index + 1}</td>
      <td>${result.alternative}</td>
      <td>${result.netFlow.toFixed(2)}</td>
    `;
    tbody.appendChild(row);
  });
  table.appendChild(tbody);

  resultsDiv.appendChild(table);
}

function saveToFile() {
  fetch('/data', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ alternatives, criteria }),
  }).then((response) => {
    if (!response.ok) {
      alert('Gagal menyimpan data!');
    }
  });
}

function loadFromFile() {
  fetch('/data')
    .then((response) => response.json())
    .then((data) => {
      alternatives = data.alternatives;
      criteria = data.criteria;
      renderAlternatives();
      renderCriteria();
      renderWeights();
    })
    .catch((error) => {
      console.error('Error loading data:', error);
    });
}
