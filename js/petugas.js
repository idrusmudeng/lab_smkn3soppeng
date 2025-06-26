document.addEventListener("DOMContentLoaded", () => {
  const role = localStorage.getItem("role");
  if (role !== "petugas") {
    window.location.href = "index.html";
    return;
  }

  document.getElementById("crudArea").innerText = "Fitur CRUD akan dimuat di sini.";
});

function logout() {
  localStorage.clear();
  window.location.href = "index.html";
}
