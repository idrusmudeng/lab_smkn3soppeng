const scriptURL = "https://script.google.com/macros/s/AKfycb.../exec"; // Ganti dengan URL Web App kamu

document.getElementById("loginForm").addEventListener("submit", async function(e) {
  e.preventDefault();
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  const res = await fetch(scriptURL, {
    method: "POST",
    body: JSON.stringify({ username, password }),
    headers: { "Content-Type": "application/json" }
  });

  const result = await res.json();
  if (result.status === "success") {
    // Simpan role untuk halaman berikutnya (opsional pakai localStorage)
    localStorage.setItem("username", username);
    localStorage.setItem("role", result.role);

    // Redirect sesuai role
    if (result.role === "guru") {
      window.location.href = "dashboard_guru.html";
    } else if (result.role === "petugas") {
      window.location.href = "dashboard_petugas.html";
    }
  } else {
    document.getElementById("message").innerText = result.message;
  }
});
