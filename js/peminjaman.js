const scriptURL = "https://script.google.com/macros/s/YOUR_DEPLOYED_GS_URL/exec";

document.getElementById("formPeminjaman").addEventListener("submit", async function(e) {
  e.preventDefault();

  const form = e.target;
  const formData = new FormData(form);
  const params = new URLSearchParams({ action: "peminjaman" });

  for (const [key, value] of formData.entries()) {
    params.append(key, value);
  }

  try {
    const res = await fetch(`${scriptURL}?${params.toString()}`);
    const result = await res.json();
    if (result.status === "success") {
      document.getElementById("pesan").innerText = "Data peminjaman berhasil dikirim.";
      form.reset();
    } else {
      document.getElementById("pesan").innerText = "Gagal: " + result.message;
    }
  } catch (err) {
    document.getElementById("pesan").innerText = "Kesalahan koneksi.";
    console.error(err);
  }
});
