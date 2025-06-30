const scriptURL = "https://script.google.com/macros/s/AKfycbx3QrtXq3gxCgm46jTZTJjh5qjK1kw1ZQxqP0lc43ka6CKg5BkCG3UF9aEGzO7pDzR98Q/exec";

document.addEventListener("DOMContentLoaded", () => {
  const role = localStorage.getItem("role");

  if (role !== "guru") {
    alert("Anda bukan guru. Akses ditolak.");
    window.location.href = "index.html";
    return;
  }

  document.getElementById("logoutBtn").addEventListener("click", logout);
  loadInventaris(); // Hanya muat data inventaris
});

function logout() {
  localStorage.clear();
  window.location.href = "index.html";
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

      let html = "<table border='1' style='border-collapse: collapse; width: 100%;'>";
      html += "<thead><tr>";

      // Tampilkan header kolom sampai kolom KETERANGAN (index ke-12)
      for (let i = 0; i <= 12; i++) {
        html += `<th>${data[0][i]}</th>`;
      }

      html += "</tr></thead><tbody>";

      for (let i = 1; i < data.length; i++) {
        html += "<tr>";
        for (let j = 0; j <= 12; j++) {
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
