const scriptURL = "https://script.google.com/macros/s/AKfycbx3QrtXq3gxCgm46jTZTJjh5qjK1kw1ZQxqP0lc43ka6CKg5BkCG3UF9aEGzO7pDzR98Q/exec";

const tabelContainer = document.getElementById("tabelInventaris");
const notifBox = document.getElementById("notifPeminjaman");
const logoutBtn = document.getElementById("btnLogout");

// Logout handler
logoutBtn.addEventListener("click", () => {
  localStorage.removeItem("isLoggedIn");
  window.location.href = "login.html";
});

// Ambil dan tampilkan data inventaris + notifikasi
document.addEventListener("DOMContentLoaded", () => {
  // Ambil data inventaris
  fetch(scriptURL + "?action=viewInventaris")
    .then((res) => res.json())
    .then((data) => {
      renderInventaris(data);
    })
    .catch(() => {
      tabelContainer.innerHTML = "Gagal memuat data.";
    });

  // Ambil notifikasi pengajuan
  fetch(scriptURL + "?action=getPengajuan")
    .then((res) => res.json())
    .then((data) => {
      const header = data[0];
      const statusIndex = header.indexOf("STATUS");
      const pendingCount = data.slice(1).filter(row => row[statusIndex] === "Menunggu Persetujuan").length;
      if (pendingCount > 0) {
        notifBox.innerHTML = `🔔 Terdapat <strong>${pendingCount}</strong> pengajuan menunggu persetujuan. <a href="approval.html">Lihat persetujuan &raquo;</a>`;
      } else {
        notifBox.textContent = "Tidak ada notifikasi saat ini.";
      }
    })
    .catch(() => {
      notifBox.textContent = "Gagal memuat notifikasi.";
    });
});

function renderInventaris(data) {
  if (!data || data.length < 2) {
    tabelContainer.innerHTML = "Data tidak tersedia.";
    return;
  }

  const header = data[0];
  const rows = data.slice(1);

  let html = "<table><thead><tr>";
  header.forEach(col => html += `<th>${col}</th>`);
  html += "<th>Aksi</th></tr></thead><tbody>";

  rows.forEach((row, index) => {
    html += "<tr>";
    row.forEach(cell => html += `<td>${cell}</td>`);
    html += `<td class='actions'>
      <button onclick="editRow(${index + 1})">Edit</button>
      <button onclick="hapusRow(${index + 1})">Hapus</button>
    </td></tr>`;
  });

  html += "</tbody></table>";
  tabelContainer.innerHTML = html;
}

function editRow(index) {
  alert("Fitur edit belum tersedia.");
}

function hapusRow(index) {
  if (confirm("Yakin ingin menghapus data ini?")) {
    fetch(scriptURL + "?action=hapusInventaris&row=" + index)
      .then((res) => res.json())
      .then((res) => {
        alert(res.message);
        location.reload();
      });
  }
}
