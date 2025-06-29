const scriptURL = "https://script.google.com/macros/s/AKfycbx3QrtXq3gxCgm46jTZTJjh5qjK1kw1ZQxqP0lc43ka6CKg5BkCG3UF9aEGzO7pDzR98Q/exec";

document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();
  const messageEl = document.getElementById("message");

  messageEl.textContent = "";

  if (!username || !password) {
    messageEl.textContent = "Username dan password harus diisi.";
    return;
  }

  const url = `${scriptURL}?action=login&username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`;

  try {
    const response = await fetch(url);
    const result = await response.json();

    if (result.status === "success") {
      localStorage.setItem("username", username);
      localStorage.setItem("role", result.role);

      if (result.role === "guru") {
        window.location.href = "dashboard_guru.html";
      } else if (result.role === "petugas") {
        window.location.href = "dashboard_petugas.html";
      } else {
        messageEl.textContent = "Role tidak dikenali.";
      }
    } else {
      messageEl.textContent = result.message || "Login gagal.";
    }
  } catch (error) {
    messageEl.textContent = "Gagal menghubungi server.";
    console.error(error);
  }
});
