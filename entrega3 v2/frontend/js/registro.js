document.getElementById("form-registro").addEventListener("submit", async (e) => {
  e.preventDefault();

  const body = {
    nombreUsuario: document.getElementById("reg-usuario").value.trim(),
    nombreCompleto: document.getElementById("reg-nombre-completo").value.trim(),
    correo: document.getElementById("reg-correo").value.trim(),
    fechaNacimiento: document.getElementById("reg-fecha").value.trim(),
    contrasena: document.getElementById("reg-pass").value.trim()
  };

  const res = await fetch("/api/auth/registro", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });

  const data = await res.json();
  if (!res.ok) {
    alert(data.error);
    return;
  }

  alert("Registro exitoso");
  window.location.href = "login.html";
});
