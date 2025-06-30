// js/dashboard_petugas.js
const scriptURL = "https://script.google.com/macros/s/AKfycbx3QrtXq3gxCgm46jTZTJjh5qjK1kw1ZQxqP0lc43ka6CKg5BkCG3UF9aEGzO7pDzR98Q/exec";

document.addEventListener("DOMContentLoaded", () => {
  cekNotifikasi();
  loadInventaris();
});

function cekNotifikasi() {
  fetch(scriptURL + "?action=getPengajuan")
    .then((res) => res.json())
    .then((data) => {
      const header = data[0];
      const statusIndex = header.indexOf("STATUS");
      const pending = data.slice(1).some(row => row[statusIndex] === "Menunggu Persetujuan");
      if (pending) {
        document.getElementById("notifikasi").style.display = "block";
      }
    });
}

function loadInventaris() {
  fetch(scriptURL + "?action=viewInventaris")
    .then(res => res.json())
    .then(data => {
      const container = document.getElementById("tabelInventaris");
      if (!data || data.length === 0) {
        container.innerHTML = "Tidak ada data inventaris.";
        return;
      }

      let html = "<table><thead><tr>";
      data[0].forEach(header => {
        html += `<th>${header}</th>`;
      });
      html += "</tr></thead><tbody>";

      for (let i = 1; i < data.length; i++) {
        html += "<tr>";
        for (let j = 0; j < data[i].length; j++) {
          html += `<td>${data[i][j] || ""}</td>`;
        }
        html += "</tr>";
      }

      html += "</tbody></table>";
      container.innerHTML = html;
    })
    .catch(() => {
      document.getElementById("tabelInventaris").innerHTML = "Gagal memuat data inventaris.";
    });
}
