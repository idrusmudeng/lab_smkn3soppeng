const scriptURL = "https://script.google.com/macros/s/AKfycbx3QrtXq3gxCgm46jTZTJjh5qjK1kw1ZQxqP0lc43ka6CKg5BkCG3UF9aEGzO7pDzR98Q/exec";

document.addEventListener("DOMContentLoaded", () => {
  const role = localStorage.getItem("role");
  if (role !== "petugas") {
    window.location.href = "index.html";
    return;
  }

  fetchPengajuan();
});

function logout() {
  localStorage.clear();
  window.location.href = "index.html";
}

// Fungsi fetch data pengajuan dari Google Sheets
function fetchPengajuan() {
  fetch(scriptURL + "?action=viewPengajuan")
    .then(res => res.json())
    .then(data => {
      const container = document.getElementById("tabelPengajuan");
      if (!data || data.length === 0) {
        container.innerHTML = "Belum ada pengajuan.";
        return;
      }

      // Tampilkan header tabel
      let html = `<table border="1" style="width:100%; border-collapse: collapse;">
                    <tr>
                      <th>Tanggal Pengajuan</th>
                      <th>Nama Peminjam</th>
                      <th>Nama Barang</th>
                      <th>Jumlah</th>
                      <th>Tanggal Pinjam</th>
                      <th>Tanggal Kembali</th>
                      <th>Status</th>
                      <th>Keterangan</th>
                      <th>Aksi</th>
                    </tr>`;

      // Loop data pengajuan mulai dari baris ke-1 (baris 0 = header)
      for (let i = 1; i < data.length; i++) {
        const row = data[i];
        const status = row[6];
        const keterangan = row[7] || "";

        // Tombol approve / reject hanya muncul jika status 'Menunggu Persetujuan'
        let aksi = "";
        if (status === "Menunggu Persetujuan") {
          aksi = `
            <button onclick="updateStatus(${i}, 'Disetujui')">Setujui</button>
            <button onclick="updateStatus(${i}, 'Ditolak')">Tolak</button>
          `;
        } else {
          aksi = "-";
        }

        html += `<tr>
          <td>${row[0]}</td>
          <td>${row[1]}</td>
          <td>${row[2]}</td>
          <td>${row[3]}</td>
          <td>${row[4]}</td>
          <td>${row[5]}</td>
          <td>${status}</td>
          <td>${keterangan}</td>
          <td>${aksi}</td>
        </tr>`;
      }

      html += "</table>";
      container.innerHTML = html;
    })
    .catch(() => {
      document.getElementById("tabelPengajuan").innerHTML = "Gagal memuat data pengajuan.";
    });
}

// Fungsi update status pengajuan (disetujui/ditolak)
function updateStatus(rowIndex, status) {
  let keterangan = "";
  if (status === "Ditolak") {
    keterangan = prompt("Masukkan keterangan penolakan (opsional):", "");
    if (keterangan === null) {
      // User batal input
      return;
    }
  }

  // Kirim update ke backend
  const params = new URLSearchParams({
    action: "updatePengajuan",
    rowIndex: rowIndex,
    status: status,
    keterangan: keterangan
  });

  fetch(scriptURL + "?" + params.toString())
    .then(res => res.json())
    .then(result => {
      alert(result.message);
      if (result.status === "success") {
        fetchPengajuan();  // refresh data setelah update
      }
    })
    .catch(() => {
      alert("Gagal update status pengajuan.");
    });
}
