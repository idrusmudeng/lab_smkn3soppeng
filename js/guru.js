const scriptURL = "https://script.google.com/macros/s/AKfycbx3QrtXq3gxCgm46jTZTJjh5qjK1kw1ZQxqP0lc43ka6CKg5BkCG3UF9aEGzO7pDzR98Q/exec";

document.addEventListener("DOMContentLoaded", () => {
  const role = localStorage.getItem("role");
  if (role !== "guru") {
    alert("Anda bukan guru. Akses ditolak.");
    window.location.href = "index.html";
    return;
  }

  document.getElementById("logoutBtn").addEventListener("click", logout);
  document.getElementById("formPengajuan").addEventListener("submit", ajukanPeminjaman);

  loadInventaris();
});

function logout() {
  localStorage.clear();
  window.location.href = "index.html";
}

function loadInventaris() {
  fetch(scriptURL + "?action=viewInventaris")
    .then(res => res.json())
    .then(data => {
      const container = document.getElementById("tabelInventaris");
      if (!data || data.length === 0) {
        container.innerHTML = "Tidak ada data inventaris.";
        return;
      }

      // Buat tabel inventaris, tampilkan sampai kolom KETERANGAN saja (index 12)
      let html = "<table border='1' style='border-collapse: collapse; width: 100%;'>";
      html += "<thead><tr>";

      // Header kolom sampai index 12
      for (let i = 0; i <= 12; i++) {
        html += `<th>${data[0][i]}</th>`;
      }
      html += "</tr></thead><tbody>";

      for (let i = 1; i < data.length; i++) {
        html += "<tr>";
        for (let j = 0; j <= 12; j++) {
          html += `<td>${data[i][j] || ""}</td>`;
        }
        html += "</tr>";
      }

      html += "</tbody></table>";
      container.innerHTML = html;
    })
    .catch(() => {
      document.getElementById("tabelInventaris").innerHTML = "Gagal memuat data inventaris.";
    });
}

function ajukanPeminjaman(e) {
  e.preventDefault();

  const namaPeminjam = document.getElementById("namaPeminjam").value.trim();
  const namaBarang = document.getElementById("namaBarang").value.trim();
  const jumlah = document.getElementById("jumlah").value.trim();
  const tanggalPinjam = document.getElementById("tglPinjam").value;
  const tanggalKembali = document.getElementById("tglKembali").value;

  if (!namaPeminjam || !namaBarang || !jumlah || !tanggalPinjam || !tanggalKembali) {
    alert("Semua field harus diisi.");
    return;
  }

  const tanggalPengajuan = new Date().toISOString().slice(0, 10);

  const params = new URLSearchParams({
    action: "ajukanPeminjaman",
    tanggal_pengajuan: tanggalPengajuan,
    nama_peminjam: namaPeminjam,
    nama_barang: namaBarang,
    jumlah: jumlah,
    tanggal_pinjam: tanggalPinjam,
    tanggal_kembali: tanggalKembali
  });

  fetch(scriptURL + "?" + params.toString())
    .then(res => res.json())
    .then(result => {
      const msg = document.getElementById("messagePengajuan");
      if (result.status === "success") {
        msg.style.color = "green";
        msg.textContent = result.message;
        e.target.reset();
      } else {
        msg.style.color = "red";
        msg.textContent = result.message || "Gagal mengajukan peminjaman.";
      }
    })
    .catch(() => {
      alert("Gagal menghubungi server.");
    });
}
