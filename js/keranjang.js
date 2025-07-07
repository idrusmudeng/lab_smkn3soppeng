const scriptURL = "https://script.google.com/macros/s/AKfycbx3QrtXq3gxCgm46jTZTJjh5qjK1kw1ZQxqP0lc43ka6CKg5BkCG3UF9aEGzO7pDzR98Q/exec";

let inventarisList = [];
let keranjang = JSON.parse(localStorage.getItem("keranjang")) || [];

// Simpan keranjang ke localStorage
function simpanKeranjang() {
  localStorage.setItem("keranjang", JSON.stringify(keranjang));
}

// Render tabel inventaris
function renderInventaris() {
  const tbody = document.querySelector("#inventarisTable tbody");
  tbody.innerHTML = "";

  inventarisList.forEach(item => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${item.ID_BARANG}</td>
      <td>${item.NAMA_BARANG}</td>
      <td>${item.MERK_TIPE}</td>
      <td>${item.SPESIFIKASI}</td>
      <td>${item.JUMLAH}</td>
      <td>${item.KONDISI}</td>
      <td><button class="btn-add" data-id="${item.ID_BARANG}">Tambah ke Keranjang</button></td>
    `;
    tbody.appendChild(tr);
  });
}

// Render tabel keranjang
function renderKeranjang() {
  const tbody = document.querySelector("#keranjangTable tbody");
  tbody.innerHTML = "";

  if (keranjang.length === 0) {
    tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;">Keranjang kosong</td></tr>`;
    return;
  }

  keranjang.forEach(item => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${item.ID_BARANG}</td>
      <td>${item.NAMA_BARANG}</td>
      <td>
        <input type="number" min="1" max="${item.JUMLAH}" value="${item.jumlahDipinjam}" data-id="${item.ID_BARANG}" class="jumlahInput" style="width:70px;" />
      </td>
      <td><button class="btn-remove" data-id="${item.ID_BARANG}">Hapus</button></td>
    `;
    tbody.appendChild(tr);
  });
}

// Tambah barang ke keranjang
function tambahKeranjang(idBarang) {
  const item = inventarisList.find(i => i.ID_BARANG === idBarang);
  if (!item) return alert("Barang tidak ditemukan.");

  // Cek sudah ada di keranjang
  const index = keranjang.findIndex(k => k.ID_BARANG === idBarang);
  if (index > -1) {
    if (keranjang[index].jumlahDipinjam + 1 > item.JUMLAH) {
      return alert("Jumlah melebihi stok tersedia.");
    }
    keranjang[index].jumlahDipinjam++;
  } else {
    if (item.JUMLAH < 1) return alert("Stok barang kosong.");
    keranjang.push({
      ID_BARANG: item.ID_BARANG,
      NAMA_BARANG: item.NAMA_BARANG,
      JUMLAH: item.JUMLAH,
      jumlahDipinjam: 1
    });
  }
  simpanKeranjang();
  renderKeranjang();
}

// Hapus barang dari keranjang
function hapusKeranjang(idBarang) {
  keranjang = keranjang.filter(k => k.ID_BARANG !== idBarang);
  simpanKeranjang();
  renderKeranjang();
}

// Update jumlah barang di keranjang
function updateJumlah(idBarang, jumlahBaru) {
  const item = inventarisList.find(i => i.ID_BARANG === idBarang);
  if (!item) return alert("Barang tidak ditemukan.");

  if (jumlahBaru < 1) {
    alert("Jumlah minimal 1.");
    renderKeranjang();
    return;
  }

  if (jumlahBaru > item.JUMLAH) {
    alert("Jumlah melebihi stok tersedia.");
    renderKeranjang();
    return;
  }

  const keranjangItem = keranjang.find(k => k.ID_BARANG === idBarang);
  if (keranjangItem) {
    keranjangItem.jumlahDipinjam = jumlahBaru;
    simpanKeranjang();
  }
}

// Submit seluruh keranjang ke server sekaligus
function ajukanSemua() {
  const namaPeminjam = prompt("Masukkan nama Anda sebagai peminjam:");
  if (!namaPeminjam) return alert("Nama peminjam wajib diisi.");

  if (keranjang.length === 0) {
    return alert("Keranjang masih kosong.");
  }

  // Validasi jumlah stok sebelum submit
  for (const item of keranjang) {
    if (item.jumlahDipinjam > item.JUMLAH) {
      return alert(`Jumlah peminjaman "${item.NAMA_BARANG}" melebihi stok tersedia.`);
    }
  }

  // Proses submit satu per satu secara berurutan
  const promises = keranjang.map(item => {
    const params = new URLSearchParams({
      action: "ajukanPeminjaman",
      tanggal_pengajuan: new Date().toISOString().slice(0,10),
      nama_peminjam: namaPeminjam,
      ID_BARANG: item.ID_BARANG,
      nama_barang: item.NAMA_BARANG,
      MERK_TIPE: "", // bisa ditambah jika perlu
      SPESIFIKASI: "",
      SERIAL_NUMBER: "",
      jumlah_tersedia: item.JUMLAH,
      jumlah_dipinjam: item.jumlahDipinjam,
      KONDISI: "",
      tanggal_pinjam: "", // bisa ditambah form tgl pinjam jika ingin detail
      tanggal_kembali: ""
    });

    return fetch(scriptURL, {
      method: "POST",
      body: params
    }).then(res => res.json());
  });

  Promise.all(promises).then(results => {
    let sukses = 0;
    let gagal = 0;

    results.forEach(r => {
      if (r.status === "success") sukses++;
      else gagal++;
    });

    if (sukses > 0) {
      alert(`Berhasil mengajukan ${sukses} barang.`);
      keranjang = [];
      simpanKeranjang();
      renderKeranjang();
      loadInventaris();
    }

    if (gagal > 0) alert(`${gagal} pengajuan gagal. Coba lagi.`);
  });
}

// Load data inventaris dari server
function loadInventaris() {
  fetch(scriptURL + "?action=viewInventaris")
    .then(res => res.json())
    .then(data => {
      const header = data[0];
      const body = data.slice(1);

      const idIndex = header.indexOf("ID_BARANG");
      const namaIndex = header.indexOf("NAMA_BARANG");
      const merkIndex = header.indexOf("MERK_TIPE");
      const spekIndex = header.indexOf("SPESIFIKASI");
      const jumlahIndex = header.indexOf("JUMLAH");
      const kondisiIndex = header.indexOf("KONDISI");

      inventarisList = body.map(row => ({
        ID_BARANG: row[idIndex],
        NAMA_BARANG: row[namaIndex],
        MERK_TIPE: row[merkIndex],
        SPESIFIKASI: row[spekIndex],
        JUMLAH: row[jumlahIndex],
        KONDISI: row[kondisiIndex]
      }));

      renderInventaris();
      renderKeranjang();
    });
}

document.addEventListener("DOMContentLoaded", () => {
  loadInventaris();

  // Event delegation untuk tombol tambah dan hapus
  document.querySelector("#inventarisTable tbody").addEventListener("click", e => {
    if (e.target.classList.contains("btn-add")) {
      tambahKeranjang(e.target.dataset.id);
    }
  });

  document.querySelector("#keranjangTable tbody").addEventListener("click", e => {
    if (e.target.classList.contains("btn-remove")) {
      hapusKeranjang(e.target.dataset.id);
    }
  });

  // Event change untuk input jumlah
  document.querySelector("#keranjangTable tbody").addEventListener("change", e => {
    if (e.target.classList.contains("jumlahInput")) {
      const idBarang = e.target.dataset.id;
      const jumlahBaru = parseInt(e.target.value);
      updateJumlah(idBarang, jumlahBaru);
    }
  });

  document.getElementById("ajukanBtn").addEventListener("click", ajukanSemua);

  document.getElementById("logoutBtn").addEventListener("click", () => {
    localStorage.clear();
    window.location.href = "index.html";
  });
});
