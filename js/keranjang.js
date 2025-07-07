const scriptURL = "https://script.google.com/macros/s/AKfycbx3QrtXq3gxCgm46jTZTJjh5qjK1kw1ZQxqP0lc43ka6CKg5BkCG3UF9aEGzO7pDzR98Q/exec";

let inventarisList = [];
let keranjang = [];

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
  document.getElementById("btnTambahKeranjang").addEventListener("click", tambahKeKeranjang);
  document.getElementById("formPengajuan").addEventListener("submit", ajukanSemuaPeminjaman);
  
  renderKeranjang();
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
  } else {
    // Kosongkan jika tidak ketemu
    document.getElementById("namaBarang").value = "";
    document.getElementById("merkTipe").value = "";
    document.getElementById("spesifikasi").value = "";
    document.getElementById("serialNumber").value = "";
    document.getElementById("jumlahTersedia").value = "";
    document.getElementById("kondisi").value = "";
  }
}

function tambahKeKeranjang() {
  const nama = document.getElementById("namaPeminjam").value.trim();
  const idBarang = document.getElementById("idBarang").value;
  const namaBarang = document.getElementById("namaBarang").value;
  const merkTipe = document.getElementById("merkTipe").value;
  const spesifikasi = document.getElementById("spesifikasi").value;
  const serial = document.getElementById("serialNumber").value;
  const jumlahTersedia = parseInt(document.getElementById("jumlahTersedia").value || "0");
  const kondisi = document.getElementById("kondisi").value;
  const jumlah = parseInt(document.getElementById("jumlah").value || "0");
  const tglPinjam = document.getElementById("tglPinjam").value;
  const tglKembali = document.getElementById("tglKembali").value;

  // Validasi
  if (!nama || !idBarang || !namaBarang || !jumlah || !tglPinjam || !tglKembali) {
    alert("Mohon lengkapi semua field.");
    return;
  }
  if (jumlahTersedia <= 0) {
    alert("Stok barang kosong. Tidak bisa dipinjam.");
    return;
  }
  if (jumlah > jumlahTersedia) {
    alert(`Jumlah dipinjam melebihi stok tersedia (${jumlahTersedia}).`);
    return;
  }

  // Cek apakah sudah ada di keranjang (ID dan tanggal sama)
  const sudahAda = keranjang.findIndex(item => 
    item.ID_BARANG === idBarang && item.tglPinjam === tglPinjam && item.tglKembali === tglKembali
  );
  if (sudahAda >= 0) {
    alert("Barang ini dengan tanggal pinjam/kembali yang sama sudah ada di keranjang.");
    return;
  }

  keranjang.push({
    nama_peminjam: nama,
    ID_BARANG: idBarang,
    nama_barang: namaBarang,
    MERK_TIPE: merkTipe,
    SPESIFIKASI: spesifikasi,
    SERIAL_NUMBER: serial,
    jumlah_tersedia: jumlahTersedia,
    jumlah_dipinjam: jumlah,
    KONDISI: kondisi,
    tglPinjam,
    tglKembali
  });

  renderKeranjang();
  resetFormInputBarang();
}

function resetFormInputBarang() {
  // Hanya reset input barang, nama peminjam tetap
  document.getElementById("idBarang").value = "";
  document.getElementById("namaBarang").value = "";
  document.getElementById("merkTipe").value = "";
  document.getElementById("spesifikasi").value = "";
  document.getElementById("serialNumber").value = "";
  document.getElementById("jumlahTersedia").value = "";
  document.getElementById("kondisi").value = "";
  document.getElementById("jumlah").value = "";
  document.getElementById("tglPinjam").value = "";
  document.getElementById("tglKembali").value = "";
}

function renderKeranjang() {
  const container = document.getElementById("keranjangContainer");
  if (!container) return;

  if (keranjang.length === 0) {
    container.innerHTML = "<p>Keranjang kosong.</p>";
    return;
  }

  let html = `<table border="1" style="border-collapse: collapse; width: 100%; margin-top: 1rem;">
    <thead>
      <tr>
        <th>ID Barang</th><th>Nama Barang</th><th>Jumlah Dipinjam</th><th>Tgl Pinjam</th><th>Tgl Kembali</th><th>Aksi</th>
      </tr>
    </thead><tbody>`;

  keranjang.forEach((item, index) => {
    html += `<tr>
      <td>${item.ID_BARANG}</td>
      <td>${item.nama_barang}</td>
      <td>${item.jumlah_dipinjam}</td>
      <td>${item.tglPinjam}</td>
      <td>${item.tglKembali}</td>
      <td><button type="button" onclick="hapusDariKeranjang(${index})">Hapus</button></td>
    </tr>`;
  });

  html += "</tbody></table>";

  container.innerHTML = html;
}

function hapusDariKeranjang(index) {
  keranjang.splice(index, 1);
  renderKeranjang();
}

function ajukanSemuaPeminjaman(e) {
  e.preventDefault();
  if (keranjang.length === 0) {
    alert("Keranjang masih kosong, silakan tambahkan barang terlebih dahulu.");
    return;
  }

  const tglPengajuan = new Date().toISOString().slice(0, 10);

  // Kirim satu-satu ke backend
  let promises = [];
  keranjang.forEach(item => {
    const params = new URLSearchParams({
      action: "ajukanPeminjaman",
      tanggal_pengajuan: tglPengajuan,
      nama_peminjam: item.nama_peminjam,
      ID_BARANG: item.ID_BARANG,
      nama_barang: item.nama_barang,
      MERK_TIPE: item.MERK_TIPE,
      SPESIFIKASI: item.SPESIFIKASI,
      SERIAL_NUMBER: item.SERIAL_NUMBER,
      jumlah_tersedia: item.jumlah_tersedia,
      jumlah_dipinjam: item.jumlah_dipinjam,
      KONDISI: item.KONDISI,
      tanggal_pinjam: item.tglPinjam,
      tanggal_kembali: item.tglKembali,
    });

    promises.push(fetch(scriptURL, {
      method: "POST",
      body: params,
    }).then(res => res.json()));
  });

  Promise.all(promises)
    .then(results => {
      const errors = results.filter(r => r.status === "error");
      if (errors.length > 0) {
        alert("Beberapa pengajuan gagal diproses:\n" + errors.map(e => e.message).join("\n"));
      } else {
        alert("Semua pengajuan berhasil disimpan.");
        keranjang = [];
        renderKeranjang();
        document.getElementById("formPengajuan").reset();
      }
    })
    .catch(() => {
      alert("Gagal menghubungi server.");
    });
}
