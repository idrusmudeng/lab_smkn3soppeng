const scriptURL = "https://script.google.com/macros/s/AKfycbx3QrtXq3gxCgm46jTZTJjh5qjK1kw1ZQxqP0lc43ka6CKg5BkCG3UF9aEGzO7pDzR98Q/exec";

let inventarisList = [];

document.addEventListener("DOMContentLoaded", () => {
  fetch(scriptURL + "?action=viewInventaris")
    .then(res => res.json())
    .then(data => {
      inventarisList = data.slice(1); // Tanpa header
      const header = data[0];

      const idIndex = header.indexOf("ID_BARANG");
      const namaIndex = header.indexOf("NAMA_BARANG");
      const merkIndex = header.indexOf("MERK_TIPE");
      const spekIndex = header.indexOf("SPESIFIKASI");
      const serialIndex = header.indexOf("SERIAL_NUMBER");
      const jumlahIndex = header.indexOf("JUMLAH");
      const kondisiIndex = header.indexOf("KONDISI");

      const select = document.getElementById("idBarang");
      inventarisList.forEach(row => {
        const option = document.createElement("option");
        option.value = row[idIndex];
        option.textContent = `${row[idIndex]} - ${row[namaIndex]}`;
        select.appendChild(option);
      });

      // Simpan indeks ke element
      select.dataset.index = JSON.stringify({
        idIndex, namaIndex, merkIndex, spekIndex, serialIndex, jumlahIndex, kondisiIndex
      });

      select.addEventListener("change", () => {
        const id = select.value;
        const idx = JSON.parse(select.dataset.index);
        const row = inventarisList.find(r => r[idx.idIndex] === id);
        if (row) {
          document.getElementById("namaBarang").value = row[idx.namaIndex] || "";
          document.getElementById("merkTipe").value = row[idx.merkIndex] || "";
          document.getElementById("spesifikasi").value = row[idx.spekIndex] || "";
          document.getElementById("serialNumber").value = row[idx.serialIndex] || "";
          document.getElementById("jumlahTersedia").value = row[idx.jumlahIndex] || "";
          document.getElementById("kondisi").value = row[idx.kondisiIndex] || "";
        }
      });
    });

  document.getElementById("formPengajuan").addEventListener("submit", ajukanPeminjaman);
});

function ajukanPeminjaman(e) {
  e.preventDefault();

  const nama = document.getElementById("namaPeminjam").value.trim();
  const idBarang = document.getElementById("idBarang").value;
  const namaBarang = document.getElementById("namaBarang").value;
  const merk = document.getElementById("merkTipe").value;
  const spek = document.getElementById("spesifikasi").value;
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
    NAMA_BARANG: namaBarang,
    MERK_TIPE: merk,
    SPESIFIKASI: spek,
    SERIAL_NUMBER: serial,
    JUMLAH_TERSEDIA: jumlahTersedia,
    JUMLAH_DIPINJAM: jumlah,
    KONDISI: kondisi,
    tanggal_pinjam: tglPinjam,
    tanggal_kembali: tglKembali
  });

  fetch(scriptURL + "?" + params.toString())
    .then(res => res.json())
    .then(res => {
      alert(res.message);
      if (res.status === "success") {
        document.getElementById("formPengajuan").reset();
      }
    })
    .catch(() => alert("Gagal menghubungi server."));
}
