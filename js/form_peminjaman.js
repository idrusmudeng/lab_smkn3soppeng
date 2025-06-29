const scriptURL = "https://script.google.com/macros/s/AKfycbx3QrtXq3gxCgm46jTZTJjh5qjK1kw1ZQxqP0lc43ka6CKg5BkCG3UF9aEGzO7pDzR98Q/exec";

document.getElementById("formPeminjaman").addEventListener("submit", function(e) {
  e.preventDefault();

  const form = e.target;
  const params = new URLSearchParams({
    action: "ajukanPeminjaman",
    tanggal_pengajuan: new Date().toISOString().split("T")[0],
    nama_peminjam: form.nama_peminjam.value.trim(),
    nama_barang: form.nama_barang.value.trim(),
    jumlah: form.jumlah.value.trim(),
    tanggal_pinjam: form.tanggal_pinjam.value,
    tanggal_kembali: form.tanggal_kembali.value
  });

  fetch(`${scriptURL}?${params.toString()}`)
    .then(res => res.json())
    .then(data => {
      const message = document.getElementById("message");
      if (data.status === "success") {
        message.style.color = "green";
        form.reset();
      } else {
        message.style.color = "red";
      }
      message.textContent = data.message;
    })
    .catch(error => {
      document.getElementById("message").textContent = "Terjadi kesalahan saat mengirim data.";
    });
});
