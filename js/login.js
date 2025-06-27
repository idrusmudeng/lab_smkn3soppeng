const scriptURL = "https://script.google.com/macros/s/AKfycbx3QrtXq3gxCgm46jTZTJjh5qjK1kw1ZQxqP0lc43ka6CKg5BkCG3UF9aEGzO7pDzR98Q/exec";

document.getElementById("loginForm").addEventListener("submit", async function (e) {
  e.preventDefault();

  const username = encodeURIComponent(document.getElementById("username").value.trim());
  const password = encodeURIComponent(document.getElementById("password").value.trim());

  const loginURL = `${scriptURL}?action=login&username=${username}&password=${password}`;
  console.log("Login request to:", loginURL);

  try {
    const res = await fetch(loginURL);
    const result = await res.json();
    console.log("Login result:", result);

    if (result.status === "success") {
      localStorage.setItem("username", username);
      localStorage.setItem("role", result.role);

      if (result.role === "guru") {
        window.location.href = "dashboard_guru.html";
      } else if (result.role === "petugas") {
        window.location.href = "dashboard_petugas.html";
      } else {
        document.getElementById("message").innerText = "Role tidak dikenali.";
      }
    } else {
      document.getElementById("message").innerText = result.message;
    }
  } catch (error) {
    console.error("Fetch error:", error);
    document.getElementById("message").innerText = "Gagal menghubungi server.";
  }
});
