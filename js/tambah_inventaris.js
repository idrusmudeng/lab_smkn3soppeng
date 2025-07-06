const form = document.getElementById("formTambahInventaris");
const resultMessage = document.getElementById("resultMessage");

// Ganti ini dengan URL Web Apps Anda
const scriptURL = "https://script.google.com/macros/s/AKfycbx3QrtXq3gxCgm46jTZTJjh5qjK1kw1ZQxqP0lc43ka6CKg5BkCG3UF9aEGzO7pDzR98Q/exec";

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  resultMessage.textContent = "Mengirim data...";
  resultMessage.style.color = "black";

  // Siapkan data dari form
  const formData = new FormData(form);
  formData.append("action", "tambahInventaris");

  // Ubah FormData jadi URLSearchParams agar POST form-urlencoded
  const params = new URLSearchParams();
  for (const pair of formData.entries()) {
    params.append(pair[0], pair[1]);
  }

  try {
    const response = await fetch(scriptURL, {
      method: "POST",
      body: params,
    });

    const data = await response.json();

    if (data.status === "success") {
      resultMessage.style.color = "green";
      resultMessage.textContent = data.message;
      form.reset();
    } else {
      resultMessage.style.color = "red";
      resultMessage.textContent = data.message || "Terjadi kesalahan.";
    }
  } catch (error) {
    resultMessage.style.color = "red";
    resultMessage.textContent = "Gagal mengirim data: " + error.message;
  }
});
