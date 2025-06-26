const scriptURL = "https://script.google.com/macros/s/AKfycb.../exec"; // URL Web App kamu

document.addEventListener("DOMContentLoaded", () => {
  const role = localStorage.getItem("role");
  if (role !== "guru") {
    window.location.href = "index.html";
    return;
  }

  fetchInventaris();
});

function logout() {
  localStorage.clear();
  window.location.href = "index.html";
}

function fetchInventaris() {
  fetch(scriptURL + "?action=viewInventaris")
    .then(res => res.json())
    .then(data => {
      const container = document.getElementById("tabelInventaris");
      if (data.length === 0) {
        container.innerHTML = "Tidak ada data.";
        return;
      }

      let html = "<table border='1'><tr>";
      data[0].forEach(h => html += `<th>${h}</th>`);
      html += "</tr>";

      for (let i = 1; i < data.length; i++) {
        html += "<tr>";
        data[i].forEach(cell => html += `<td>${cell}</td>`);
        html += "</tr>";
      }

      html += "</table>";
      container.innerHTML = html;
    });
}
