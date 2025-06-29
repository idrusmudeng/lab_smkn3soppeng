const scriptURL = "https://script.google.com/macros/s/AKfycbx3QrtXq3gxCgm46jTZTJjh5qjK1kw1ZQxqP0lc43ka6CKg5BkCG3UF9aEGzO7pDzR98Q/exec";

document.getElementById("formPengajuan").addEventListener("submit", function(e) {
  e.preventDefault();

  const namaPeminjam = document.getElementById("namaPeminjam").value;
  const namaBarang = document.getElementById("namaBarang").value;
  const jumlah = document.getElementById("jumlah").value;
  const tanggalPinjam = document.getElementById("tglPinjam").value;
  const tanggalKembali = document.getElementById("tglKembali").value;
  const tanggalPengajuan = new Date().toLocaleDateString("id-ID");

  const params = new URLSearchParams({
    action: "ajukanPeminjaman",
    nama_peminjam: namaPeminjam,
    nama_barang: namaBarang,
    jumlah: jumlah,
    tanggal_pinjam: tanggalPinjam,
    tanggal_kembali: tanggalKembali,
    tanggal_pengajuan: tanggalPengajuan
  });

  fetch(`${scriptURL}?${params}`)
    .then(res => res.json())
    .then(response => {
      const msg = document.getElementById("messagePengajuan");
      if (response.status === "success") {
        msg.style.color = "green";
        msg.textContent = "Pengajuan berhasil dikirim.";
        document.getElementById("formPengajuan").reset();
      } else {
        msg.style.color = "red";
        msg.textContent = "Gagal mengajukan: " + response.message;
      }
    })
    .catch(err => {
      document.getElementById("messagePengajuan").textContent = "Gagal terhubung ke server.";
      console.error(err);
    });
});
