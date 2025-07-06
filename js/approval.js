const scriptURL = "https://script.google.com/macros/s/AKfycbx3QrtXq3gxCgm46jTZTJjh5qjK1kw1ZQxqP0lc43ka6CKg5BkCG3UF9aEGzO7pDzR98Q/exec";

document.addEventListener("DOMContentLoaded", () => {
  fetchDataPengajuan();

  const modal = document.getElementById("modalPengembalian");
  const modalClose = document.getElementById("modalClose");
  modalClose.onclick = () => {
    modal.classList.remove("flex");
  };

  const form = document.getElementById("formPengembalian");
  form.onsubmit = function (e) {
    e.preventDefault();
    prosesPengembalian();
  };
});

let currentRowIndex = null;

function fetchDataPengajuan() {
  fetch(`${scriptURL}?action=getPengajuan`)
    .then(res => res.json())
    .then(data => renderTabelPengajuan(data))
    .catch(err => {
      console.error("Gagal mengambil data:", err);
      document.getElementById("tabelPengajuan").textContent = "Gagal memuat data.";
    });
}

function renderTabelPengajuan(data) {
  const container = document.getElementById("tabelPengajuan");
  container.innerHTML = "";

  if (!data || data.length < 2) {
    container.textContent = "Data tidak tersedia.";
    return;
  }

  const table = document.createElement("table");
  const header = data[0];
  const rows = data.slice(1);

  const thead = document.createElement("thead");
  const trHead = document.createElement("tr");
  header.forEach(head => {
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
    row.forEach(cell => {
      const td = document.createElement("td");
      td.textContent = cell;
      tr.appendChild(td);
    });

    const aksiCell = document.createElement("td");

    if (row[12] === "Menunggu Persetujuan") {
      const setujuiBtn = document.createElement("button");
      setujuiBtn.textContent = "Setujui";
      setujuiBtn.className = "btn-approve";
      setujuiBtn.onclick = () => prosesPersetujuan(i + 2, "Disetujui");

      const tolakBtn = document.createElement("button");
      tolakBtn.textContent = "Tolak";
      tolakBtn.className = "btn-reject";
      tolakBtn.onclick = () => prosesPersetujuan(i + 2, "Ditolak");

      aksiCell.appendChild(setujuiBtn);
      aksiCell.appendChild(tolakBtn);
    } else if (row[12] === "Disetujui") {
      const kembaliBtn = document.createElement("button");
      kembaliBtn.textContent = "Proses Pengembalian";
      kembaliBtn.className = "btn-return";
      kembaliBtn.onclick = () => tampilkanFormPengembalian(i + 2, row);
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
  const keterangan = prompt("Masukkan keterangan (opsional):", "");
  if (keterangan === null) return;

  fetch(scriptURL, {
    method: "POST",
    body: new URLSearchParams({
      action: "updateStatus",
      row: rowIndex,
      status: status,
      keterangan: keterangan,
    }),
  })
  .then(res => res.json())
  .then(res => {
    alert(res.message);
    fetchDataPengajuan();
  })
  .catch(err => alert("Terjadi kesalahan: " + err.message));
}

function tampilkanFormPengembalian(rowIndex, rowData) {
  currentRowIndex = rowIndex;

  const modal = document.getElementById("modalPengembalian");
  modal.classList.add("flex");

  document.getElementById("returnIdBarang").value = rowData[2];       // ID_BARANG
  document.getElementById("returnNamaBarang").value = rowData[3];     // NAMA_BARANG
  document.getElementById("returnSerialNumber").value = rowData[6];   // SERIAL_NUMBER

  document.getElementById("returnJumlah").value = "";
  document.getElementById("returnJumlah").max = rowData[8];           // JUMLAH_DIPINJAM as max
  document.getElementById("returnKondisi").value = "";
  document.getElementById("returnKeterangan").value = "";
}

function prosesPengembalian() {
  const jumlah = parseInt(document.getElementById("returnJumlah").value);
  const kondisi = document.getElementById("returnKondisi").value;
  const keterangan = document.getElementById("returnKeterangan").value.trim();

  if (!jumlah || jumlah < 1) {
    return alert("Jumlah dikembalikan harus diisi dan minimal 1.");
  }
  if (!kondisi) {
    return alert("Kondisi pengembalian harus dipilih.");
  }

  fetch(scriptURL, {
    method: "POST",
    body: new URLSearchParams({
      action: "prosesPengembalian",
      row: currentRowIndex,
      jumlah_dikembalikan: jumlah,
      kondisi_pengembalian: kondisi,
      keterangan_pengembalian: keterangan,
    }),
  })
  .then(res => res.json())
  .then(res => {
    alert(res.message);
    if (res.status === "success") {
      document.getElementById("modalPengembalian").classList.remove("flex");
      fetchDataPengajuan();
    }
  })
  .catch(err => alert("Gagal memproses pengembalian: " + err.message));
}
