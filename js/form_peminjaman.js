// js/form_peminjaman.js
const scriptURL = "https://script.google.com/macros/s/AKfycbx3QrtXq3gxCgm46jTZTJjh5qjK1kw1ZQxqP0lc43ka6CKg5BkCG3UF9aEGzO7pDzR98Q/exec";

let inventarisList = [];

// Ambil data inventaris saat halaman dimuat
document.addEventListener("DOMContentLoaded", () => {
  fetch(scriptURL + "?action=viewInventaris")
    .then((res) => res.json())
    .then((data) => {
      const header = data[0];
      const body = data.slice(1);
      
      const idIndex = header.indexOf("ID_BARANG");
      const namaIndex = header.indexOf("NAMA_BARANG");
      const merkIndex = header.indexOf("MERK_TIPE");
      const spekIndex = header.indexOf("SPESIFIKASI");
      const serialIndex = header.indexOf("SERIAL_NUMBER");
      const jumlahIndex = header.indexOf("JUMLAH");
      const kondisiIndex = header.indexOf("KONDISI");

      inventarisList = body.map(row => ({
        ID_BARANG: row[idIndex],
        NAMA_BARANG: row[namaIndex],
        MERK_TIPE: row[merkIndex],
        SPESIFIKASI: row[spekIndex],
        SERIAL_NUMBER: row[serialIndex],
        JUMLAH: row[jumlahIndex],
        KONDISI: row[kondisiIndex]
      }));

      const datalist = document.getElementById("listBarang");
      inventarisList.forEach(item => {
        const option = document.createElement("option");
        option.value = item.ID_BARANG;
        datalist.appendChild(option);
      });
    });

  document.getElementById("idBarang").addEventListener("input", tampilkanDetailBarang);
  document.getElementById("formPengajuan").addEventListener("submit", ajukanPeminjaman);
});

function tampilkanDetailBarang() {
  const id = document.getElementById("idBarang").value;
  const detail = inventarisList.find(item => item.ID_BARANG === id);
  if (detail) {
    document.getElementById("namaBarang").value = detail.NAMA_BARANG || "";
    document.getElementById("merkTipe").value = detail.MERK_TIPE || "";
    document.getElementById("spesifikasi").value = detail.SPESIFIKASI || "";
    document.getElementById("serialNumber").value = detail.SERIAL_NUMBER || "";
    document.getElementById("jumlahTersedia").value = detail.JUMLAH || "";
    document.getElementById("kondisi").value = detail.KONDISI || "";
  }
}

function ajukanPeminjaman(e) {
  e.preventDefault();

  const nama = document.getElementById("namaPeminjam").value.trim();
  const idBarang = document.getElementById("idBarang").value;
  const namaBarang = document.getElementById("namaBarang").value;
  const merkTipe = document.getElementById("merkTipe").value;
  const spesifikasi = document.getElementById("spesifikasi").value;
  const serial = document.getElementById("serialNumber").value;
  const jumlahTersedia = document.getElementById("jumlahTersedia").value;
  const kondisi = document.getElementById("kondisi").value;
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
    MERK_TIPE: merkTipe,
    SPESIFIKASI: spesifikasi,
    SERIAL_NUMBER: serial,
    jumlah_tersedia: jumlahTersedia,
    jumlah: jumlah,
    KONDISI: kondisi,
    tanggal_pinjam: tglPinjam,
    tanggal_kembali: tglKembali,
  });

  fetch(scriptURL + "?" + params.toString())
    .then((res) => res.json())
    .then((res) => {
      alert(res.message);
      if (res.status === "success") {
        document.getElementById("formPengajuan").reset();
      }
    })
    .catch(() => alert("Gagal menghubungi server."));
}
