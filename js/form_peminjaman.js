// js/form_peminjaman.js
const scriptURL = "https://script.google.com/macros/s/AKfycbx3QrtXq3gxCgm46jTZTJjh5qjK1kw1ZQxqP0lc43ka6CKg5BkCG3UF9aEGzO7pDzR98Q/exec";

let inventarisList = [];

// Ambil data inventaris saat halaman dimuat
document.addEventListener("DOMContentLoaded", () => {
  fetch(scriptURL + "?action=viewInventaris")
    .then((res) => res.json())
    .then((data) => {
      // Simpan semua data kecuali header
      inventarisList = data.slice(1);

      const header = data[0];
      const idIndex = header.indexOf("ID_BARANG");
      const namaIndex = header.indexOf("NAMA_BARANG");
      const merkIndex = header.indexOf("MERK_TIPE");
      const spekIndex = header.indexOf("SPESIFIKASI");
      const serialIndex = header.indexOf("SERIAL_NUMBER");
      const jumlahIndex = header.indexOf("JUMLAH");
      const kondisiIndex = header.indexOf("KONDISI");

      const select = document.getElementById("idBarang");
      inventarisList.forEach((row) => {
        const option = document.createElement("option");
        option.value = row[idIndex];
        option.textContent = `${row[idIndex]} - ${row[namaIndex]}`;
        select.appendChild(option);
      });

      // Simpan indeks untuk akses cepat saat change
      select.dataset.idIndex = idIndex;
      select.dataset.namaIndex = namaIndex;
      select.dataset.merkIndex = merkIndex;
      select.dataset.spekIndex = spekIndex;
      select.dataset.serialIndex = serialIndex;
      select.dataset.jumlahIndex = jumlahIndex;
      select.dataset.kondisiIndex = kondisiIndex;
    });

  document.getElementById("idBarang").addEventListener("change", tampilkanDetailBarang);
  document.getElementById("formPengajuan").addEventListener("submit", ajukanPeminjaman);
});

function tampilkanDetailBarang() {
  const id = document.getElementById("idBarang").value;
  const select = document.getElementById("idBarang");

  const idIndex = +select.dataset.idIndex;
  const namaIndex = +select.dataset.namaIndex;
  const merkIndex = +select.dataset.merkIndex;
  const spekIndex = +select.dataset.spekIndex;
  const serialIndex = +select.dataset.serialIndex;
  const jumlahIndex = +select.dataset.jumlahIndex;
  const kondisiIndex = +select.dataset.kondisiIndex;

  const row = inventarisList.find((r) => r[idIndex] === id);
  if (row) {
    document.getElementById("namaBarang").value = row[namaIndex] || "";
    document.getElementById("merkTipe").value = row[merkIndex] || "";
    document.getElementById("spesifikasi").value = row[spekIndex] || "";
    document.getElementById("serialNumber").value = row[serialIndex] || "";
    document.getElementById("jumlahTersedia").value = row[jumlahIndex] || "";
    document.getElementById("kondisi").value = row[kondisiIndex] || "";
  }
}

function ajukanPeminjaman(e) {
  e.preventDefault();

  const nama = document.getElementById("namaPeminjam").value.trim();
  const idBarang = document.getElementById("idBarang").value;
  const namaBarang = document.getElementById("namaBarang").value;
  const serial = document.getElementById("serialNumber").value;
  const jumlah = document.getElementById("jumlah").value;
  const tglPinjam = document.getElementById("tglPinjam").value;
  const tglKembali = document.getElementById("tglKembali").value;
  const tglPengajuan = new Date().toISOString().slice(0, 10);

  if (!nama || !idBarang || !namaBarang || !jumlah || !tglPinjam || !tglKembali) {
    alert("Mohon lengkapi semua field.");
    return;
  }

  const params = new URLSearchParams({
    action: "ajukanPeminjaman",
    tanggal_pengajuan: tglPengajuan,
    nama_peminjam: nama,
    ID_BARANG: idBarang,
    nama_barang: namaBarang,
    SERIAL_NUMBER: serial,
    jumlah: jumlah,
    tanggal_pinjam: tglPinjam,
    tanggal_kembali: tglKembali,
  });

  fetch(scriptURL + "?" + params.toString())
    .then((res) => res.json())
    .then((res) => {
      alert(res.message);
      if (res.status === "success") {
        document.getElementById("formPengajuan").reset();
        tampilkanDetailBarang(); // Kosongkan detail
      }
    })
    .catch(() => alert("Gagal menghubungi server."));
}
