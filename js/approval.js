// === approval.js (Versi Terbaru dengan Pengembalian) ===

document.addEventListener("DOMContentLoaded", function () {
  fetchDataPengajuan();
});

function fetchDataPengajuan() {
  fetch("https://script.google.com/macros/s/AKfycbx3QrtXq3gxCgm46jTZTJjh5qjK1kw1ZQxqP0lc43ka6CKg5BkCG3UF9aEGzO7pDzR98Q/exec?action=getPengajuan")
    .then((res) => res.json())
    .then((data) => renderTabelPengajuan(data))
    .catch((err) => console.error("Gagal mengambil data:", err));
}

function renderTabelPengajuan(data) {
  const container = document.getElementById("tabelPengajuan");
  container.innerHTML = "";

  const table = document.createElement("table");
  const header = data[0];
  const rows = data.slice(1);

  const thead = document.createElement("thead");
  const trHead = document.createElement("tr");
  header.forEach((head) => {
    const th = document.createElement("th");
    th.textContent = head;
    trHead.appendChild(th);
  });
  trHead.innerHTML += "<th>Aksi</th>";
  thead.appendChild(trHead);
  table.appendChild(thead);

  const tbody = document.createElement("tbody");

  rows.forEach((row, i) => {
    const tr = document.createElement("tr");
    row.forEach((cell) => {
      const td = document.createElement("td");
      td.textContent = cell;
      tr.appendChild(td);
    });

    const aksiCell = document.createElement("td");

    if (row[12] === "Menunggu Persetujuan") {
      const setujuiBtn = document.createElement("button");
      setujuiBtn.textContent = "Setujui";
      setujuiBtn.className = "btn-primary";
      setujuiBtn.onclick = () => prosesPersetujuan(i + 2, "Disetujui");

      const tolakBtn = document.createElement("button");
      tolakBtn.textContent = "Tolak";
      tolakBtn.className = "logout";
      tolakBtn.onclick = () => prosesPersetujuan(i + 2, "Ditolak");

      aksiCell.appendChild(setujuiBtn);
      aksiCell.appendChild(tolakBtn);
    } else if (row[12] === "Disetujui") {
      const kembaliBtn = document.createElement("button");
      kembaliBtn.textContent = "Proses Pengembalian";
      kembaliBtn.className = "btn-primary";
      kembaliBtn.onclick = () => tampilkanFormPengembalian(i + 2);
      aksiCell.appendChild(kembaliBtn);
    } else {
      aksiCell.textContent = "-";
    }

    tr.appendChild(aksiCell);
    tbody.appendChild(tr);
  });

  table.appendChild(tbody);
  container.appendChild(table);
}

function prosesPersetujuan(rowIndex, status) {
  const keterangan = prompt("Masukkan keterangan:", "");
  if (keterangan === null) return;

  fetch("https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec", {
    method: "POST",
    body: new URLSearchParams({
      action: "updateStatus",
      row: rowIndex,
      status: status,
      keterangan: keterangan,
    }),
  })
    .then((res) => res.json())
    .then((res) => {
      alert(res.message);
      fetchDataPengajuan();
    })
    .catch((err) => alert("Terjadi kesalahan: " + err.message));
}

function tampilkanFormPengembalian(rowIndex) {
  const jumlah = prompt("Jumlah yang dikembalikan:", "1");
  if (!jumlah || isNaN(jumlah)) return alert("Masukkan angka yang valid.");

  const kondisi = prompt("Kondisi saat dikembalikan (Baik/Rusak Ringan/Rusak Berat):", "Baik");
  if (!kondisi) return alert("Kondisi wajib diisi.");

  fetch("https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec", {
    method: "POST",
    body: new URLSearchParams({
      action: "prosesPengembalian",
      row: rowIndex,
      jumlah_dikembalikan: jumlah,
      kondisi: kondisi,
    }),
  })
    .then((res) => res.json())
    .then((res) => {
      alert(res.message);
      fetchDataPengajuan();
    })
    .catch((err) => alert("Gagal memproses pengembalian: " + err.message));
}
