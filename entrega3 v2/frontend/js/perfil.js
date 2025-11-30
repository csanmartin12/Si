document.addEventListener("DOMContentLoaded", cargarPerfil);

async function cargarPerfil() {
  const res = await fetch("/api/usuario/perfil", {
    method: "GET",
    credentials: "include"
  });

  if (!res.ok) {
    window.location.href = "login.html";
    return;
  }

  const u = await res.json();

  document.getElementById("dato-nombre-usuario").textContent = u.nombreUsuario;
  document.getElementById("dato-nombre-completo").textContent = u.nombreCompleto;
  document.getElementById("dato-email").textContent = u.correo;
  document.getElementById("dato-fecha-nacimiento").textContent = new Date(u.fechaNacimiento).toLocaleDateString("es-CL");
  document.getElementById("dato-saldo").textContent = "$" + u.saldo;
}
