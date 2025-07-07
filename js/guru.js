const scriptURL = "https://script.google.com/macros/s/AKfycbx3QrtXq3gxCgm46jTZTJjh5qjK1kw1ZQxqP0lc43ka6CKg5BkCG3UF9aEGzO7pDzR98Q/exec";

let inventarisData = [];
let keranjang = [];

document.addEventListener("DOMContentLoaded", () => {
  const role = localStorage.getItem("role");
  if (role !== "guru") {
    alert("Anda bukan guru. Akses ditolak.");
    window.location.href = "index.html";
    return;
  }

  document.getElementById("logoutBtn").addEventListener("click", logout);
  document.getElementById("ajukanKeranjangBtn").addEventListener("click", ajukanKeranjang);

  loadInventaris();
  renderKeranjang();
});

function logout() {
  localStorage.clear();
  window.location.href = "index.html";
}

function loadInventaris() {
  fetch(scriptURL + "?action=viewInventaris")
    .then(res => res.json())
    .then(data => {
      if (!data || data.length < 2) {
        document.getElementById("tabelInventaris").innerHTML = "Tidak ada data inventaris.";
        return;
      }
      inventarisData = data;
      renderInventarisTable();
    })
    .catch(() => {
      document.getElementById("tabelInventaris").innerHTML = "Gagal memuat data inventaris.";
    });
}

function renderInventarisTable() {
  const header = inventarisData[0];
  const body = inventarisData.slice(1);

  const columnsToShow = [
    "ID_BARANG",
    "NAMA_BARANG",
    "KATEGORI",
    "MERK_TIPE",
    "SPESIFIKASI",
    "JUMLAH",
    "KONDISI"
  ];

  // Cari indeks kolom
  const indices = columnsToShow.map(col => header.indexOf(col));

  let html = '<table border="1" style="width:100%; border-collapse: collapse;">';
  html += "<thead><tr>";
  columnsToShow.forEach(col => {
    html += `<th>${col.replace(/_/g, " ")}</th>`;
  });
  html += "<th>Aksi</th></tr></thead><tbody>";

  body.forEach((row, idx) => {
    html += "<tr>";
    indices.forEach(i => {
      html += `<td>${i !== -1 ? (row[i] || "") : ""}</td>`;
    });

    // Tombol tambah ke keranjang
    html += `<td><button class="btn-add-keranjang" data-index="${idx}">Tambah</button></td>`;
    html += "</tr>";
  });

  html += "</tbody></table>";
  document.getElementById("tabelInventaris").innerHTML = html;

  // Event listener tombol tambah ke keranjang
  document.querySelectorAll(".btn-add-keranjang").forEach(btn => {
    btn.addEventListener("click", () => {
      const idx = parseInt(btn.dataset.index);
      tambahKeKeranjang(idx);
    });
  });
}

function tambahKeKeranjang(idx) {
  const barang = inventarisData[idx + 1]; // +1 karena inventarisData[0] = header
  if (!barang) return;

  const header = inventarisData[0];
  const idIndex = header.indexOf("ID_BARANG");
  const namaIndex = header.indexOf("NAMA_BARANG");
  const jumlahIndex = header.indexOf("JUMLAH");

  const idBarang = barang[idIndex];
  const namaBarang = barang[namaIndex];
  const stok = parseInt(barang[jumlahIndex]) || 0;

  // Cek apakah sudah di keranjang
  const ada = keranjang.find(item => item.ID_BARANG === idBarang);
  if (ada) {
    alert("Barang sudah ada di keranjang.");
    return;
  }

  if (stok <= 0) {
    alert("Stok barang kosong, tidak bisa ditambahkan.");
    return;
  }

  // Default jumlah pinjam 1
  keranjang.push({
    ID_BARANG: idBarang,
    NAMA_BARANG: namaBarang,
    JUMLAH_DIPINJAM: 1,
    STOK: stok
  });

  renderKeranjang();
}

function renderKeranjang() {
  const tbody = document.querySelector("#keranjangTable tbody");
  tbody.innerHTML = "";

  if (keranjang.length === 0) {
    tbody.innerHTML = "<tr><td colspan='4' style='text-align:center;'>Keranjang kosong</td></tr>";
    return;
  }

  keranjang.forEach((item, idx) => {
    tbody.innerHTML += `
      <tr>
        <td>${item.ID_BARANG}</td>
        <td>${item.NAMA_BARANG}</td>
        <td>
          <input type="number" min="1" max="${item.STOK}" value="${item.JUMLAH_DIPINJAM}" data-idx="${idx}" class="input-jumlah" />
          / ${item.STOK}
        </td>
        <td><button class="btn-hapus-keranjang" data-idx="${idx}">Hapus</button></td>
      </tr>
    `;
  });

  // Event listener input jumlah
  document.querySelectorAll(".input-jumlah").forEach(input => {
    input.addEventListener("change", e => {
      const idx = parseInt(e.target.dataset.idx);
      let val = parseInt(e.target.value);
      if (isNaN(val) || val < 1) val = 1;
      if (val > keranjang[idx].STOK) val = keranjang[idx].STOK;
      keranjang[idx].JUMLAH_DIPINJAM = val;
      e.target.value = val;
    });
  });

  // Event listener tombol hapus
  document.querySelectorAll(".btn-hapus-keranjang").forEach(btn => {
    btn.addEventListener("click", () => {
      const idx = parseInt(btn.dataset.idx);
      keranjang.splice(idx, 1);
      renderKeranjang();
    });
  });
}

function ajukanKeranjang() {
  if (keranjang.length === 0) {
    alert("Keranjang kosong, silakan pilih barang terlebih dahulu.");
    return;
  }

  const namaPeminjam = prompt("Masukkan nama peminjam:");
  if (!namaPeminjam || namaPeminjam.trim() === "") {
    alert("Nama peminjam harus diisi.");
    return;
  }

  const today = new Date().toISOString().slice(0, 10);
  const promises = [];

  keranjang.forEach(item => {
    const params = new URLSearchParams({
      action: "ajukanPeminjaman",
      tanggal_pengajuan: today,
      nama_peminjam: namaPeminjam.trim(),
      ID_BARANG: item.ID_BARANG,
      nama_barang: item.NAMA_BARANG,
      MERK_TIPE: "",         // Optional, bisa dikosongkan atau diambil dari inventarisData
      SPESIFIKASI: "",
      SERIAL_NUMBER: "",
      jumlah_tersedia: item.STOK,
      jumlah_dipinjam: item.JUMLAH_DIPINJAM,
      KONDISI: "",
      tanggal_pinjam: today,
      tanggal_kembali: today,
    });

    promises.push(
      fetch(scriptURL, {
        method: "POST",
        body: params
      }).then(res => res.json())
    );
  });

  Promise.all(promises).then(results => {
    let allSuccess = results.every(r => r.status === "success");
    if (allSuccess) {
      alert("Semua pengajuan berhasil disimpan.");
      keranjang = [];
      renderKeranjang();
      loadInventaris();
    } else {
      alert("Ada pengajuan yang gagal diproses.");
    }
  }).catch(() => {
    alert("Gagal mengirim pengajuan ke server.");
  });
}
