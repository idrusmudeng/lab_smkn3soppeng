const scriptURL = "https://script.google.com/macros/s/AKfycbx3QrtXq3gxCgm46jTZTJjh5qjK1kw1ZQxqP0lc43ka6CKg5BkCG3UF9aEGzO7pDzR98Q/exec";

let originalData = [];

document.addEventListener("DOMContentLoaded", () => {
  const role = localStorage.getItem("role");
  if (role !== "guru") {
    window.location.href = "index.html";
    return;
  }

  fetchInventaris();

  // Tambahkan event listener untuk filter
  document.getElementById("filterKategori").addEventListener("change", applyFilter);
  document.getElementById("filterLokasi").addEventListener("change", applyFilter);
  document.getElementById("searchInput").addEventListener("input", applyFilter);
});

function logout() {
  localStorage.clear();
  window.location.href = "index.html";
}

function fetchInventaris() {
  fetch(`${scriptURL}?action=viewInventaris`)
    .then(res => res.json())
    .then(data => {
      originalData = data;
      populateFilterOptions(data);
      renderTable(data);
    })
    .catch(err => {
      console.error("Gagal ambil data:", err);
      document.getElementById("tabelInventaris").innerText = "Gagal memuat data.";
    });
}

function populateFilterOptions(data) {
  const kategoriSet = new Set();
  const lokasiSet = new Set();

  for (let i = 1; i < data.length; i++) {
    kategoriSet.add(data[i][2]); // KATEGORI
    lokasiSet.add(data[i][7]);   // LOKASI
  }

  const kategoriSelect = document.getElementById("filterKategori");
  const lokasiSelect = document.getElementById("filterLokasi");

  kategoriSet.forEach(kat => {
    const option = document.createElement("option");
    option.value = kat;
    option.textContent = kat;
    kategoriSelect.appendChild(option);
  });

  lokasiSet.forEach(loc => {
    const option = document.createElement("option");
    option.value = loc;
    option.textContent = loc;
    lokasiSelect.appendChild(option);
  });
}

function applyFilter() {
  const kategori = document.getElementById("filterKategori").value.toLowerCase();
  const lokasi = document.getElementById("filterLokasi").value.toLowerCase();
  const keyword = document.getElementById("searchInput").value.toLowerCase();

  const filtered = originalData.filter((row, index) => {
    if (index === 0) return true;

    const cocokKategori = !kategori || row[2].toLowerCase().includes(kategori);
    const cocokLokasi = !lokasi || row[7].toLowerCase().includes(lokasi);
    const cocokKeyword = !keyword || row.some(cell => String(cell).toLowerCase().includes(keyword));

    return cocokKategori && cocokLokasi && cocokKeyword;
  });

  renderTable(filtered);
}

function renderTable(data) {
  const container = document.getElementById("tabelInventaris");

  if (!data || data.length <= 1) {
    container.innerHTML = "Tidak ada data.";
    return;
  }

  // Ambil header & batasi kolom sampai "KETERANGAN" (indeks ke-12)
  let html = "<table><thead><tr>";
  for (let j = 0; j <= 12; j++) {
    html += `<th>${data[0][j]}</th>`;
  }
  html += "</tr></thead><tbody>";

  for (let i = 1; i < data.length; i++) {
    html += "<tr>";
    for (let j = 0; j <= 12; j++) {
      html += `<td>${data[i][j]}</td>`;
    }
    html += "</tr>";
  }

  html += "</tbody></table>";
  container.innerHTML = html;
}
