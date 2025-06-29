const scriptURL = "https://script.google.com/macros/s/AKfycbx3QrtXq3gxCgm46jTZTJjh5qjK1kw1ZQxqP0lc43ka6CKg5BkCG3UF9aEGzO7pDzR98Q/exec";

document.getElementById("loginForm").addEventListener("submit", async function (e) {
  e.preventDefault();

  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();
  const messageEl = document.getElementById("message");
  messageEl.textContent = "";

  if (!username || !password) {
    messageEl.textContent = "Username dan password harus diisi.";
    return;
  }

  try {
    const res = await fetch(scriptURL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });

    if (!res.ok) throw new Error("Server error: " + res.status);

    const result = await res.json();

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
  } catch (err) {
    messageEl.textContent = "Gagal menghubungi server.";
    console.error(err);
  }
});
