const scriptURL = "https://script.google.com/macros/s/AKfycbx3QrtXq3gxCgm46jTZTJjh5qjK1kw1ZQxqP0lc43ka6CKg5BkCG3UF9aEGzO7pDzR98Q/exec";

document.addEventListener("DOMContentLoaded", () => {
  const role = localStorage.getItem("role");

  if (role !== "guru") {
    alert("Anda bukan guru. Akses ditolak.");
    window.location.href = "index.html";
    return;
  }

  document.getElementById("logoutBtn").addEventListener("click", logout);
  document.getElementById("ajukanBtn").addEventListener("click", ajukanPeminjaman);
  loadInventaris();
  renderKeranjang();
});

// Logout function
function logout() {
  localStorage.clear();
  window.location.href = "index.html";
}

// Keranjang disimpan di localStorage
function getKeranjang() {
  return JSON.parse(localStorage.getItem("keranjangPeminjaman") || "[]");
}

function saveKeranjang(keranjang) {
  localStorage.setItem("keranjangPeminjaman", JSON.stringify(keranjang));
}

// Render tabel inventaris dengan tombol Tambah ke keranjang
function loadInventaris() {
  fetch(scriptURL + "?action=viewInventaris")
    .then(res => res.json())
    .then(data => {
      const container = document.getElementById("tabelInventaris");

      if (!data || data.length === 0) {
        container.innerHTML = "Tidak ada data inventaris.";
        return;
      }

      let html = "<table border='1' style='border-collapse: collapse; width: 100%;'>";
      html += "<thead><tr>";

      // Tampilkan header kolom sampai kolom KETERANGAN (index ke-12)
      for (let i = 0; i <= 12; i++) {
        html += `<th>${data[0][i]}</th>`;
      }
      html += "<th>Aksi</th>"; // kolom aksi
      html += "</tr></thead><tbody>";

      for (let i = 1; i < data.length; i++) {
        html += "<tr>";
        for (let j = 0; j <= 12; j++) {
          html += `<td>${data[i][j] || ""}</td>`;
        }
        // Tombol tambah dengan data atribut
        const idBarang = data[i][0];
        const namaBarang = data[i][1];
        const merkTipe = data[i][3];
        const spesifikasi = data[i][4];
        const jumlah = parseInt(data[i][6]) || 0;
        const kondisi = data[i][9];

        html += `<td><button onclick="tambahKeKeranjang('${idBarang}', '${namaBarang}', ${jumlah}, '${kondisi}', '${merkTipe}', '${spesifikasi}')">Tambah</button></td>`;
        html += "</tr>";
      }

      html += "</tbody></table>";
      container.innerHTML = html;
    })
    .catch(() => {
      document.getElementById("tabelInventaris").innerHTML = "Gagal memuat data inventaris.";
    });
}

// Fungsi tambah barang ke keranjang
function tambahKeKeranjang(idBarang, namaBarang, stokTersedia, kondisi, merkTipe, spesifikasi) {
  let keranjang = getKeranjang();

  // Cek apakah barang sudah ada di keranjang
  const index = keranjang.findIndex(item => item.ID_BARANG === idBarang);

  if (index !== -1) {
    // Jika sudah ada, tambah jumlah pinjam, tapi tidak boleh lebih dari stok
    if (keranjang[index].jumlahPinjam >= stokTersedia) {
      alert("Jumlah pinjam sudah mencapai stok maksimal.");
      return;
    }
    keranjang[index].jumlahPinjam += 1;
  } else {
    // Baru, tambah barang dengan jumlah 1
    keranjang.push({
      ID_BARANG: idBarang,
      namaBarang,
      jumlahPinjam: 1,
      kondisi,
      merkTipe,
      spesifikasi
    });
  }

  saveKeranjang(keranjang);
  renderKeranjang();
}

// Render isi keranjang peminjaman
function renderKeranjang() {
  const keranjang = getKeranjang();
  const tbody = document.querySelector("#tabelKeranjang tbody");
  if (!tbody) return;

  if (keranjang.length === 0) {
    tbody.innerHTML = "<tr><td colspan='4' style='text-align:center;'>Keranjang kosong</td></tr>";
    return;
  }

  let html = "";
  keranjang.forEach((item, idx) => {
    html += `<tr>
      <td>${item.ID_BARANG}</td>
      <td>${item.namaBarang}</td>
      <td>
        <input type="number" min="1" max="100" value="${item.jumlahPinjam}" style="width:60px" onchange="updateJumlah(${idx}, this.value)">
      </td>
      <td>
        <button onclick="hapusDariKeranjang(${idx})">Hapus</button>
      </td>
    </tr>`;
  });

  tbody.innerHTML = html;
}

// Update jumlah pinjam di keranjang
function updateJumlah(index, value) {
  let keranjang = getKeranjang();
  value = parseInt(value);
  if (isNaN(value) || value < 1) {
    alert("Jumlah minimal 1");
    renderKeranjang();
    return;
  }
  // Pastikan tidak melebihi stok (bisa dikembangkan dengan cek stok)
  keranjang[index].jumlahPinjam = value;
  saveKeranjang(keranjang);
  renderKeranjang();
}

// Hapus item dari keranjang
function hapusDariKeranjang(index) {
  let keranjang = getKeranjang();
  keranjang.splice(index, 1);
  saveKeranjang(keranjang);
  renderKeranjang();
}

// Ajukan peminjaman ke server
function ajukanPeminjaman() {
  const keranjang = getKeranjang();
  if (keranjang.length === 0) {
    alert("Keranjang peminjaman kosong.");
    return;
  }

  const namaPeminjam = prompt("Masukkan nama Anda (peminjam):");
  if (!namaPeminjam) {
    alert("Nama peminjam wajib diisi.");
    return;
  }

  // Kirim data satu per satu ke server
  let promises = keranjang.map(item => {
    // Ambil tanggal hari ini & tanggal kembali (misalnya +7 hari)
    const tanggalPengajuan = new Date().toISOString().split('T')[0];
    const tanggalPinjam = tanggalPengajuan;
    const tanggalKembali = new Date(Date.now() + 7*24*60*60*1000).toISOString().split('T')[0];

    const params = new URLSearchParams({
      action: "ajukanPeminjaman",
      tanggal_pengajuan: tanggalPengajuan,
      nama_peminjam: namaPeminjam,
      ID_BARANG: item.ID_BARANG,
      nama_barang: item.namaBarang,
      MERK_TIPE: item.merkTipe,
      SPESIFIKASI: item.spesifikasi,
      SERIAL_NUMBER: "",  // Bisa diisi jika perlu
      jumlah_tersedia: "9999", // Untuk validasi stok, bisa dikembangkan fetch stok asli
      jumlah_dipinjam: item.jumlahPinjam.toString(),
      KONDISI: item.kondisi,
      tanggal_pinjam: tanggalPinjam,
      tanggal_kembali: tanggalKembali
    });

    return fetch(scriptURL, {
      method: "POST",
      body: params
    }).then(res => res.json());
  });

  Promise.all(promises)
    .then(results => {
      let gagal = results.filter(r => r.status === "error");
      if (gagal.length > 0) {
        alert("Ada item yang gagal diajukan: " + gagal.map(g => g.message).join(", "));
      } else {
        alert("Peminjaman berhasil diajukan.");
        localStorage.removeItem("keranjangPeminjaman");
        renderKeranjang();
      }
    })
    .catch(() => alert("Gagal mengajukan peminjaman. Silakan coba lagi."));
}
