const scriptURL = "https://script.google.com/macros/s/AKfycbx3QrtXq3gxCgm46jTZTJjh5qjK1kw1ZQxqP0lc43ka6CKg5BkCG3UF9aEGzO7pDzR98Q/exec";

document.getElementById("formPeminjaman").addEventListener("submit", async function (e) {
  e.preventDefault();
  const form = e.target;
  const formData = new FormData(form);

  const tanggalPengajuan = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  const params = new URLSearchParams();
  params.append("action", "ajukanPeminjaman");
  params.append("tanggal_pengajuan", tanggalPengajuan);
  params.append("nama_peminjam", formData.get("nama_peminjam"));
  params.append("nama_barang", formData.get("nama_barang"));
  params.append("jumlah", formData.get("jumlah"));
  params.append("tanggal_pinjam", formData.get("tanggal_pinjam"));
  params.append("tanggal_kembali", formData.get("tanggal_kembali"));

  try {
    const res = await fetch(`${scriptURL}?${params.toString()}`);
    const result = await res.json();
    const pesan = document.getElementById("pesan");

    if (result.status === "success") {
      pesan.textContent = "Peminjaman berhasil diajukan!";
      pesan.className = "success";
      form.reset();
    } else {
      pesan.textContent = "Gagal: " + result.message;
      pesan.className = "error";
    }
  } catch (err) {
    document.getElementById("pesan").textContent = "Gagal mengirim data.";
    document.getElementById("pesan").className = "error";
    console.error(err);
  }
});
