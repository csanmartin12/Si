document.addEventListener("DOMContentLoaded", async () => {
  cargarMenu();

  const user = await verificarSesion();
  if (!user) return;

  const contenedor = document.querySelectorAll("section.card p strong");

  if (contenedor.length >= 2) {
    contenedor[0].parentElement.innerHTML = `<strong>Usuario:</strong> ${user.username}`;
    contenedor[1].parentElement.innerHTML = `<strong>Correo:</strong> ${user.email}`;
  }


  const saldoStrong = document.querySelector(".grid strong");
  if (saldoStrong) {
    saldoStrong.textContent = `$${user.balance}`;
  }
});
