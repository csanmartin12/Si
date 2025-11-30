document.addEventListener("DOMContentLoaded", () => {
  cargarMenu();

  const inputs = document.querySelectorAll("input");
  const btn = document.querySelector("button");

  if (!inputs.length || !btn) return;

  btn.addEventListener("click", async () => {
    const [
      nombreCompleto,
      rut,
      usuario,
      correo,
      pass1,
      pass2,
      fechaNacimiento
    ] = inputs;

    if (pass1.value !== pass2.value) {
      alert("Las contraseñas no coinciden");
      return;
    }

    const payload = {
      fullName: nombreCompleto.value,
      email: correo.value,
      username: usuario.value,
      password: pass1.value,
      birthDate: fechaNacimiento.value
    };

    try {
      const res = await apiFetch("/api/auth/register", {
        method: "POST",
        body: payload
      });
      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Error en registro");
        return;
      }

      alert("Registro exitoso. Redirigiendo…");
      window.location.href = "perfil.html";

    } catch (err) {
      alert("Error al conectar con el servidor");
    }
  });
});
