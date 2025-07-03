const scriptURL = "https://script.google.com/macros/s/AKfycbx3QrtXq3gxCgm46jTZTJjh5qjK1kw1ZQxqP0lc43ka6CKg5BkCG3UF9aEGzO7pDzR98Q/exec";

document.addEventListener("DOMContentLoaded", () => {
  fetch(scriptURL + "?action=getPengajuan")
    .then(res => res.json())
    .then(data => {
      const container = document.getElementById("tabelPengajuan");
      if (!data || data.length <= 1) {
        container.innerHTML = "Tidak ada pengajuan.";
        return;
      }

      let html = "<table border='1'><tr>";
      const headers = data[0].concat("Tindakan");
      headers.forEach(h => html += `<th>${h}</th>`);
      html += "</tr>";

      for (let i = 1; i < data.length; i++) {
        const row = data[i];
        html += "<tr>";
        row.forEach(cell => html += `<td>${cell}</td>`);

        if (row[12] === "Menunggu Persetujuan") {
          html += `<td>
            <button onclick="setujui(${i + 1})">Setujui</button>
            <button onclick="tolak(${i + 1})">Tolak</button>
          </td>`;
        } else {
          html += "<td>-</td>";
        }

        html += "</tr>";
      }

      html += "</table>";
      container.innerHTML = html;
    });
});

function setujui(row) {
  updateStatus(row, "Disetujui");
}
function tolak(row) {
  updateStatus(row, "Ditolak");
}

function updateStatus(row, status) {
  fetch(`${scriptURL}?action=updateStatus&row=${row}&status=${status}`)
    .then(res => res.json())
    .then(data => {
      alert(data.message);
      location.reload();
    });
}
