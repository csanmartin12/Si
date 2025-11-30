document.addEventListener("DOMContentLoaded", () => {
  cargarMenu();

  const forms = document.querySelectorAll("form");
  if (forms.length < 2) return;

  const inputUsuario = forms[0].querySelector("input");
  const inputPass = forms[1].querySelector("input");

  const boton = document.querySelector("main button");

  boton.addEventListener("click", async (e) => {
    e.preventDefault();

    const payload = {
      username: inputUsuario.value,
      password: inputPass.value
    };

    const res = await apiFetch("/api/auth/login", {
      method: "POST",
      body: payload
    });
    const data = await res.json();

    if (!res.ok) {
      alert(data.error || "Credenciales incorrectas");
      return;
    }

    alert("Login correcto");
    window.location.href = "perfil.html";
  });
});
