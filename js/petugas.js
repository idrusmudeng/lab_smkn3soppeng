const scriptURL = "https://script.google.com/macros/s/AKfycbx3QrtXq3gxCgm46jTZTJjh5qjK1kw1ZQxqP0lc43ka6CKg5BkCG3UF9aEGzO7pDzR98Q/exec";
const headers = [
  "ID_BARANG", "NAMA_BARANG", "KATEGORI", "MERK_TIPE", "SPESIFIKASI", "JUMLAH", "SATUAN", "LOKASI",
  "TAHUN_PEROLEHAN", "KONDISI", "SERIAL_NUMBER", "FOTO", "KETERANGAN", "HARGA", "SUMBER_DANA", "TANGGAL_INVENTARISASI"
];

document.addEventListener("DOMContentLoaded", loadInventaris);

function loadInventaris() {
  fetch(scriptURL + "?action=viewInventaris")
    .then(res => res.json())
    .then(renderTabel)
    .catch(() => {
      document.getElementById("tabelInventaris").innerHTML = "Gagal memuat data.";
    });
}

function renderTabel(data) {
  const rows = data.slice(1); // tanpa header
  let html = `<table><thead><tr>${headers.map(h => `<th>${h}</th>`).join("")}<th>Aksi</th></tr></thead><tbody>`;

  rows.forEach((row, i) => {
    html += `<tr>${row.map(cell => `<td>${cell}</td>`).join("")}
      <td>
        <button onclick='editData(${i + 1}, ${JSON.stringify(row).replace(/'/g, "&apos;")})'>Edit</button>
        <button onclick='hapusData(${i + 1})'>Hapus</button>
      </td>
    </tr>`;
  });

  html += "</tbody></table>";
  document.getElementById("tabelInventaris").innerHTML = html;
}

document.getElementById("formTambah").addEventListener("submit", function (e) {
  e.preventDefault();
  const formData = new FormData(this);
  formData.append("action", "tambahInventaris");

  fetch(scriptURL, { method: "POST", body: formData })
    .then(res => res.json())
    .then(res => {
      alert(res.message);
      this.reset();
      loadInventaris();
    });
});

function hapusData(index) {
  if (confirm("Yakin ingin menghapus data ini?")) {
    fetch(`${scriptURL}?action=hapusInventaris&row=${index}`)
      .then(res => res.json())
      .then(res => {
        alert(res.message);
        loadInventaris();
      });
  }
}

function editData(index, row) {
  const form = document.getElementById("formEditData");
  form.innerHTML = `<input type="hidden" name="row" value="${index}">`;

  headers.forEach((h, i) => {
    const val = row[i] || "";
    form.innerHTML += `<input name="${h}" value="${val}" placeholder="${h}" required>`;
  });

  form.innerHTML += `
    <button type="submit">Simpan</button>
    <button type="button" onclick="batalEdit()">Batal</button>
  `;

  document.getElementById("formEdit").style.display = "block";

  form.onsubmit = function (e) {
    e.preventDefault();
    const formData = new FormData(form);
    formData.append("action", "updateInventaris");

    fetch(scriptURL, { method: "POST", body: formData })
      .then(res => res.json())
      .then(res => {
        alert(res.message);
        document.getElementById("formEdit").style.display = "none";
        loadInventaris();
      });
  };
}

function batalEdit() {
  document.getElementById("formEdit").style.display = "none";
}
