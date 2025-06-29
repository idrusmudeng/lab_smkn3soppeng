const scriptURL = "https://script.google.com/macros/s/AKfycbx3QrtXq3gxCgm46jTZTJjh5qjK1kw1ZQxqP0lc43ka6CKg5BkCG3UF9aEGzO7pDzR98Q/exec";

document.addEventListener("DOMContentLoaded", () => {
  const role = localStorage.getItem("role");
  if (role !== "guru") {
    window.location.href = "index.html";
    return;
  }

  fetchInventaris();
  loadPengajuan();
});

function logout() {
  localStorage.clear();
  window.location.href = "index.html";
}

function fetchInventaris() {
  fetch(scriptURL + "?action=viewInventaris")
    .then(res => res.json())
    .then(data => {
      const container = document.getElementById("tabelInventaris");
      if (!data || data.length === 0) {
        container.innerHTML = "Tidak ada data.";
        return;
      }

      const maxCol = 13; // Batasi sampai kolom KETERANGAN
      let html = "<table border='1'><tr>";
      data[0].slice(0, maxCol).forEach(h => html += `<th>${h}</th>`);
      html += "</tr>";

      for (let i = 1; i < data.length; i++) {
        html += "<tr>";
        data[i].slice(0, maxCol).forEach(cell => html += `<td>${cell}</td>`);
        html += "</tr>";
      }

      html += "</table>";
      container.innerHTML = html;
    });
}

// Load riwayat pengajuan peminjaman khusus user
function loadPengajuan() {
  const username = localStorage.getItem("username");
  fetch(scriptURL + "?action=viewPengajuan")
    .then(res => res.json())
    .then(data => {
      const container = document.getElementById("tabelPengajuan");
      if (!data || data.length === 0) {
        container.innerHTML = "Belum ada pengajuan.";
        return;
      }
      
      // Filter hanya pengajuan milik user ini
      const userPengajuan = data.filter(row => row[1] === username);

      let html = "<table border='1'><tr><th>Tanggal Pengajuan</th><th>Nama Barang</th><th>Jumlah</th><th>Tanggal Pinjam</th><th>Tanggal Kembali</th><th>Status</th><th>Keterangan</th></tr>";
      userPengajuan.forEach(row => {
        html += `<tr>
          <td>${row[0]}</td>
          <td>${row[2]}</td>
          <td>${row[3]}</td>
          <td>${row[4]}</td>
          <td>${row[5]}</td>
          <td>${row[6]}</td>
          <td>${row[7]}</td>
        </tr>`;
      });
      html += "</table>";
      container.innerHTML = html;
    });
}

// Event listener untuk form pengajuan peminjaman
document.getElementById("formPengajuan").addEventListener("submit", function(e) {
  e.preventDefault();

  const tanggal_pengajuan = new Date().toLocaleDateString();
  const nama_peminjam = localStorage.getItem("username");
  const nama_barang = e.target.nama_barang.value;
  const jumlah = e.target.jumlah.value;
  const tanggal_pinjam = e.target.tanggal_pinjam.value;
  const tanggal_kembali = e.target.tanggal_kembali.value;

  const params = new URLSearchParams({
    action: "ajukanPeminjaman",
    tanggal_pengajuan,
    nama_peminjam,
    nama_barang,
    jumlah,
    tanggal_pinjam,
    tanggal_kembali
  });

  fetch(scriptURL + "?" + params.toString())
    .then(res => res.json())
    .then(result => {
      alert(result.message);
      if (result.status === "success") {
        e.target.reset();
        loadPengajuan();
      }
    })
    .catch(() => alert("Gagal mengirim pengajuan."));
});
