const scriptURL = "https://script.google.com/macros/s/AKfycbx3QrtXq3gxCgm46jTZTJjh5qjK1kw1ZQxqP0lc43ka6CKg5BkCG3UF9aEGzO7pDzR98Q/exec";

document.addEventListener("DOMContentLoaded", () => {
  const role = localStorage.getItem("role");
  if (role !== "guru") {
    window.location.href = "index.html";
    return;
  }

  fetchInventaris();
});

function logout() {
  localStorage.clear();
  window.location.href = "index.html";
}

let originalData = [];

function fetchInventaris() {
  fetch(scriptURL + "?action=viewInventaris")
    .then(res => res.json())
    .then(data => {
      originalData = data;
      populateDropdowns(data);
      renderTable(data);
    })
    .catch(err => {
      document.getElementById("tabelInventaris").innerText = "Gagal memuat data.";
      console.error(err);
    });
}

function populateDropdowns(data) {
  const kategoriSet = new Set();
  const lokasiSet = new Set();

  for (let i = 1; i < data.length; i++) {
    kategoriSet.add(data[i][2]); // KATEGORI
    lokasiSet.add(data[i][7]);   // LOKASI
  }

  const kategoriDropdown = document.getElementById("filterKategori");
  const lokasiDropdown = document.getElementById("filterLokasi");

  kategoriSet.forEach(k => {
    const opt = document.createElement("option");
    opt.value = k;
    opt.textContent = k;
    kategoriDropdown.appendChild(opt);
  });

  lokasiSet.forEach(l => {
    const opt = document.createElement("option");
    opt.value = l;
    opt.textContent = l;
    lokasiDropdown.appendChild(opt);
  });

  kategoriDropdown.addEventListener("change", applyFilter);
  lokasiDropdown.addEventListener("change", applyFilter);
}

function applyFilter() {
  const kategori = document.getElementById("filterKategori").value;
  const lokasi = document.getElementById("filterLokasi").value;

  const filtered = originalData.filter((row, index) => {
    if (index === 0) return true;
    const cocokKategori = kategori === "" || row[2] === kategori;
    const cocokLokasi = lokasi === "" || row[7] === lokasi;
    return cocokKategori && cocokLokasi;
  });

  renderTable(filtered);
}

function renderTable(data) {
  const container = document.getElementById("tabelInventaris");
  if (!data || data.length === 0) {
    container.innerHTML = "Data kosong.";
    return;
  }

  let html = "<table><thead><tr>";
  data[0].slice(0, 13).forEach(h => html += `<th>${h}</th>`);
  html += "</tr></thead><tbody>";

  for (let i = 1; i < data.length; i++) {
    html += "<tr>";
    data[i].slice(0, 13).forEach(cell => html += `<td>${cell}</td>`);
    html += "</tr>";
  }

  html += "</tbody></table>";
  container.innerHTML = html;
}
