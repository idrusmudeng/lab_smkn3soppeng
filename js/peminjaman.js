const scriptURL = "https://script.google.com/macros/s/AKfycbx3QrtXq3gxCgm46jTZTJjh5qjK1kw1ZQxqP0lc43ka6CKg5BkCG3UF9aEGzO7pDzR98Q/exec";

document.addEventListener("DOMContentLoaded", () => {
  const nama = localStorage.getItem("username");
  if (!nama) {
    alert("Anda belum login.");
    window.location.href = "index.html";
    return;
  }

  document.getElementById("nama").value = nama;

  document.getElementById("formPeminjaman").addEventListener("submit", async (e) => {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);
    formData.append("action", "ajukanPeminjaman");

    try {
      const res = await fetch(scriptURL, {
        method: "POST",
        body: formData,
      });
      const result = await res.json();
      document.getElementById("status").innerText = result.message;
      if (result.status === "success") form.reset();
    } catch (err) {
      document.getElementById("status").innerText = "Gagal mengirim.";
      console.error(err);
    }
  });
});
