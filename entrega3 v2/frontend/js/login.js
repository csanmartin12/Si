document.getElementById("form-login").addEventListener("submit", async (e) => {
  e.preventDefault();

  const body = {
    nombreUsuario: document.getElementById("login-usuario").value.trim(),
    contrasena: document.getElementById("login-pass").value.trim()
  };

  const res = await fetch("/api/auth/login", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });

  const data = await res.json();
  if (!res.ok) {
    alert(data.error);
    return;
  }

  window.location.href = "perfil.html";
});
