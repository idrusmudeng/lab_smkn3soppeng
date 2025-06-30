// js/form_peminjaman.js
const scriptURL = "https://script.google.com/macros/s/AKfycbx3QrtXq3gxCgm46jTZTJjh5qjK1kw1ZQxqP0lc43ka6CKg5BkCG3UF9aEGzO7pDzR98Q/exec";

let inventarisList = [];

document.addEventListener("DOMContentLoaded", () => {
  fetch(scriptURL + "?action=viewInventaris")
    .then(res => res.json())
    .then(data => {
      if (!data || data.length < 2) return;

      const header = data[0];
      const rows = data.slice(1);
      inventarisList = rows;

      const idIndex = header.indexOf("ID_BARANG");
      const namaIndex = header.indexOf("NAMA_BARANG");
      const merkIndex = header.indexOf("MERK_TIPE");
      const spekIndex = header.indexOf("SPESIFIKASI");
      const serialIndex = header.indexOf("SERIAL_NUMBER");
      const jumlahIndex = header.indexOf("JUMLAH");
      const kondisiIndex = header.indexOf("KONDISI");

      const datalist = document.getElementById("ListBarang");

      rows.forEach(row => {
        const option = document.createElement("option");
        option.value = row[idIndex];
        option.dataset.nama = row[namaIndex];
        option.dataset.merk = row[merkIndex];
        option.dataset.spek = row[spekIndex];
        option.dataset.serial = row[serialIndex];
        option.dataset.jumlah = row[jumlahIndex];
        option.dataset.kondisi = row[kondisiIndex];
        datalist.appendChild(option);
      });

      // simpan indeks untuk referensi cepat
      document.getElementById("idBarang").dataset.indexes = JSON.stringify({
        id: idIndex,
        nama: namaIndex,
        merk: merkIndex,
        spek: spekIndex,
        serial: serialIndex,
        jumlah: jumlahIndex,
        kondisi: kondisiIndex
      });
    });

  document.getElementById("idBarang").addEventListener("input", tampilkanDetailBarang);
  document.getElementById("formPengajuan").addEventListener("submit", ajukanPeminjaman);
});

function tampilkanDetailBarang() {
  const id = document.getElementById("idBarang").value.trim();
  const detail = inventarisList.find(row => row[0] === id);

  if (detail) {
    document.getElementById("namaBarang").value = detail[1] || "";
    document.getElementById("merkTipe").value = detail[3] || "";
    document.getElementById("spesifikasi").value = detail[4] || "";
    document.getElementById("serialNumber").value = detail[10] || "";
    document.getElementById("jumlahTersedia").value = detail[5] || "";
    document.getElementById("kondisi").value = detail[9] || "";
  } else {
    // kosongkan kalau tidak ditemukan
    ["namaBarang", "merkTipe", "spesifikasi", "serialNumber", "jumlahTersedia", "kondisi"]
      .forEach(id => document.getElementById(id).value = "");
  }
}

function ajukanPeminjaman(e) {
  e.preventDefault();

  const nama = document.getElementById("namaPeminjam").value.trim();
  const idBarang = document.getElementById("idBarang").value.trim();
  const namaBarang = document.getElementById("namaBarang").value.trim();
  const serial = document.getElementById("serialNumber").value.trim();
  const jumlah = document.getElementById("jumlah").value.trim();
  const tglPinjam = document.getElementById("tglPinjam").value;
  const tglKembali = document.getElementById("tglKembali").value;
  const tglPengajuan = new Date().toISOString().slice(0, 10);

  if (!nama || !idBarang || !namaBarang || !jumlah || !tglPinjam || !tglKembali) {
    alert("Semua field wajib diisi.");
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
    .then(res => res.json())
    .then(res => {
      alert(res.message);
      if (res.status === "success") {
        document.getElementById("formPengajuan").reset();
        tampilkanDetailBarang(); // kosongkan detail
      }
    })
    .catch(() => alert("Gagal menghubungi server."));
}
