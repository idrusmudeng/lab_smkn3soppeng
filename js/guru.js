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
document.getElementById("formPeminjaman").addEventListener("submit", async function(e) {
  e.preventDefault();

  const nama_peminjam = document.getElementById("nama_peminjam").value;
  const nama_barang = document.getElementById("nama_barang").value;
  const jumlah = document.getElementById("jumlah").value;
  const tanggal_pinjam = document.getElementById("tanggal_pinjam").value;
  const tanggal_kembali = document.getElementById("tanggal_kembali").value;

  const url = `${scriptURL}?action=ajukanPeminjaman` +
              `&tanggal_pengajuan=${encodeURIComponent(new Date().toISOString())}` +
              `&nama_peminjam=${encodeURIComponent(nama_peminjam)}` +
              `&nama_barang=${encodeURIComponent(nama_barang)}` +
              `&jumlah=${encodeURIComponent(jumlah)}` +
              `&tanggal_pinjam=${encodeURIComponent(tanggal_pinjam)}` +
              `&tanggal_kembali=${encodeURIComponent(tanggal_kembali)}`;

  try {
    const res = await fetch(url);
    const result = await res.json();

    if (result.status === "success") {
      document.getElementById("pesanPeminjaman").innerText = "Pengajuan berhasil dikirim.";
      e.target.reset();
    } else {
      document.getElementById("pesanPeminjaman").innerText = "Gagal: " + result.message;
    }
  } catch (err) {
    console.error("Error:", err);
    document.getElementById("pesanPeminjaman").innerText = "Gagal mengirim pengajuan.";
  }
});
