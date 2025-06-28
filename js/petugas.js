const scriptURL = "https://script.google.com/macros/s/AKfycbxjcD5D0vufLdZhyfnmKcf63POSPWX0uIaQRc1dz-YTGo4NoXqeaBe2lBaSaT4YLFZF7g/exec";

// Cek role
const role = localStorage.getItem("role");
const username = localStorage.getItem("username");

if (role !== "petugas") {
  alert("Akses ditolak. Anda bukan petugas.");
  window.location.href = "index.html";
}

// Tampilkan nama pengguna
document.getElementById("username").innerText = username;

// Logout
document.getElementById("logout").addEventListener("click", function () {
  localStorage.clear();
  window.location.href = "index.html";
});

// Ambil data inventaris
async function loadInventaris() {
  try {
    const res = await fetch(`${scriptURL}?action=viewInventaris`);
    const data = await res.json();
    console.log("Inventaris:", data);
    renderTable(data);
  } catch (error) {
    document.getElementById("table-container").innerText = "Gagal memuat data.";
    console.error("Error:", error);
  }
}

// Render tabel
function renderTable(data) {
  if (!data || data.length === 0) {
    document.getElementById("table-container").innerText = "Data kosong.";
    return;
  }

  const headers = data[0];
  let html = "<table><thead><tr>";
  headers.forEach(header => html += `<th>${header}</th>`);
  html += "</tr></thead><tbody>";

  for (let i = 1; i < data.length; i++) {
    html += "<tr>";
    data[i].forEach(cell => html += `<td>${cell}</td>`);
    html += "</tr>";
  }

  html += "</tbody></table>";
  document.getElementById("table-container").innerHTML = html;
}

// Jalankan saat halaman dimuat
loadInventaris();
