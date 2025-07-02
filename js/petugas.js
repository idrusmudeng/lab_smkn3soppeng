const scriptURL = "https://script.google.com/macros/s/AKfycbx3QrtXq3gxCgm46jTZTJjh5qjK1kw1ZQxqP0lc43ka6CKg5BkCG3UF9aEGzO7pDzR98Q/exec";

const headers = [
  "ID_BARANG", "NAMA_BARANG", "KATEGORI", "MERK_TIPE", "SPESIFIKASI", "JUMLAH", "SATUAN", "LOKASI",
  "TAHUN_PEROLEHAN", "KONDISI", "SERIAL_NUMBER", "FOTO", "KETERANGAN", "HARGA", "SUMBER_DANA", "TANGGAL_INVENTARISASI"
];

const tabelContainer = document.getElementById("tabelInventaris");
const notifBox = document.getElementById("notifPeminjaman");
const logoutBtn = document.getElementById("btnLogout");

// Logout handler
logoutBtn.addEventListener("click", () => {
  localStorage.removeItem("isLoggedIn");
  window.location.href = "login.html";
});

document.addEventListener("DOMContentLoaded", () => {
  loadInventaris();
  loadNotifikasi();
});

function loadInventaris() {
  fetch(scriptURL + "?action=viewInventaris")
    .then(res => res.json())
    .then(data => renderTabel(data))
    .catch(() => {
      tabelContainer.innerHTML = "Gagal memuat data.";
    });
}

function renderTabel(data) {
  tabelContainer.innerHTML = ""; // clear dulu agar tidak dobel

  if (!data || data.length < 2) {
    tabelContainer.innerHTML = "Data tidak tersedia.";
    return;
  }

  const rows = data.slice(1); // data tanpa header

  let html = `<table><thead><tr>${headers.map(h => `<th>${h}</th>`).join("")}<th>Aksi</th></tr></thead><tbody>`;

  rows.forEach((row, i) => {
    const sheetRow = i + 2; // baris sheet = index + 2 (karena baris 1 header)
    html += `<tr>${row.map(cell => `<td>${cell}</td>`).join("")}
      <td>
        <button onclick='editData(${sheetRow}, ${JSON.stringify(row).replace(/'/g, "&apos;")})'>Edit</button>
        <button onclick='hapusData(${sheetRow})'>Hapus</button>
      </td>
    </tr>`;
  });

  html += "</tbody></table>";
  tabelContainer.innerHTML = html;
}

function loadNotifikasi() {
  fetch(scriptURL + "?action=getPengajuan")
    .then(res => res.json())
    .then(data => {
      const header = data[0];
      const statusIndex = header.indexOf("STATUS");
      const pendingCount = data.slice(1).filter(row => row[statusIndex] === "Menunggu Persetujuan").length;
      notifBox.innerHTML = pendingCount > 0
        ? `🔔 Terdapat <strong>${pendingCount}</strong> pengajuan menunggu persetujuan. <a href="approval.html">Lihat persetujuan &raquo;</a>`
        : "Tidak ada notifikasi saat ini.";
    })
    .catch(() => {
      notifBox.textContent = "Gagal memuat notifikasi.";
    });
}

function hapusData(sheetRow) {
  if (confirm("Yakin ingin menghapus data ini?")) {
    fetch(`${scriptURL}?action=hapusInventaris&row=${sheetRow}`)
      .then(res => res.json())
      .then(res => {
        alert(res.message);
        loadInventaris();
      });
  }
}

function editData(sheetRow, row) {
  const form = document.getElementById("formEditData");
  const formContainer = document.getElementById("formEdit");

  form.innerHTML = `<input type="hidden" name="row" value="${sheetRow}">`;

  headers.forEach((h, i) => {
    const val = row[i] || "";
    form.innerHTML += `<label>${h}<input name="${h}" value="${val}" required></label>`;
  });

  form.innerHTML += `
    <button type="submit" class="btn-primary">Simpan</button>
    <button type="button" onclick="batalEdit()">Batal</button>
  `;

  formContainer.style.display = "block";

  form.onsubmit = function (e) {
    e.preventDefault();
    const formData = new FormData(form);
    formData.append("action", "updateInventaris");

    fetch(scriptURL, { method: "POST", body: formData })
      .then(res => res.json())
      .then(res => {
        alert(res.message);
        formContainer.style.display = "none";
        loadInventaris();
      });
  };
}

function batalEdit() {
  document.getElementById("formEdit").style.display = "none";
}
