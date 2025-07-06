const scriptURL = "https://script.google.com/macros/s/AKfycbx3QrtXq3gxCgm46jTZTJjh5qjK1kw1ZQxqP0lc43ka6CKg5BkCG3UF9aEGzO7pDzR98Q/exec";
const tabelContainer = document.getElementById("tabelInventaris");

document.addEventListener("DOMContentLoaded", () => {
  loadInventaris();
  cekNotifikasiPengajuan();
});

function loadInventaris() {
  fetch(`${scriptURL}?action=viewInventaris`)
    .then(res => res.json())
    .then(data => renderTabel(data))
    .catch(err => {
      tabelContainer.innerHTML = "<p style='color:red;'>Gagal memuat data.</p>";
      console.error(err);
    });
}

function renderTabel(data) {
  const header = data[0];
  const rows = data.slice(1);

  const table = document.createElement("table");
  const thead = document.createElement("thead");
  const trHead = document.createElement("tr");

  header.forEach(h => {
    const th = document.createElement("th");
    th.textContent = h;
    trHead.appendChild(th);
  });

  const aksiTh = document.createElement("th");
  aksiTh.textContent = "Aksi";
  trHead.appendChild(aksiTh);
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

    const tdAksi = document.createElement("td");
    tdAksi.classList.add("actions");

    const editBtn = document.createElement("button");
    editBtn.textContent = "Edit";
    editBtn.onclick = () => editData(i + 2, header, row);
    tdAksi.appendChild(editBtn);

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Hapus";
    deleteBtn.onclick = () => hapusData(i + 2);
    tdAksi.appendChild(deleteBtn);

    tr.appendChild(tdAksi);
    tbody.appendChild(tr);
  });

  table.appendChild(tbody);
  tabelContainer.innerHTML = "";
  tabelContainer.appendChild(table);
}

function editData(rowIndex, header, rowData) {
  const newData = {};
  for (let i = 0; i < header.length; i++) {
    const value = prompt(`Edit ${header[i]}:`, rowData[i]);
    if (value === null) return; // batal
    newData[header[i]] = value;
  }

  const formData = new URLSearchParams();
  formData.append("action", "updateInventaris");
  formData.append("row", rowIndex);
  header.forEach(h => formData.append(h, newData[h] || ""));

  fetch(scriptURL, {
    method: "POST",
    body: formData
  })
    .then(res => res.json())
    .then(res => {
      alert(res.message);
      loadInventaris();
    })
    .catch(err => alert("Gagal memperbarui data."));
}

function hapusData(rowIndex) {
  if (!confirm("Yakin ingin menghapus data ini?")) return;
  fetch(`${scriptURL}?action=hapusInventaris&row=${rowIndex}`)
    .then(res => res.json())
    .then(res => {
      alert(res.message);
      loadInventaris();
    })
    .catch(err => alert("Gagal menghapus data."));
}

function cekNotifikasiPengajuan() {
  fetch(`${scriptURL}?action=getPengajuan`)
    .then(res => res.json())
    .then(data => {
      const header = data[0];
      const rows = data.slice(1);
      const statusIndex = header.indexOf("STATUS");
      const adaMenunggu = rows.some(r => r[statusIndex] === "Menunggu Persetujuan");

      if (adaMenunggu) {
        document.getElementById("notifPeminjaman").style.display = "block";
      }
    })
    .catch(err => {
      console.warn("Tidak bisa memuat notifikasi peminjaman.");
    });
}
