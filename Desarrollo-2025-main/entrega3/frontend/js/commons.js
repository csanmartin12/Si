

function apiFetch(url, options = {}) {
  const opts = {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    },
    ...options
  };
  if (opts.body && typeof opts.body !== "string") {
    opts.body = JSON.stringify(opts.body);
  }
  return fetch(url, opts);
}

async function cargarMenu() {
  const nav = document.querySelector("nav");
  if (!nav) return;

  try {
    const res = await fetch("/api/user/profile", { credentials: "include" });

    if (res.status === 401) {
      nav.innerHTML = nav.innerHTML; 
    } else {
      const user = await res.json();
      nav.innerHTML = `
        <a href="index.html">Inicio</a>
        <a href="perfil.html">Perfil (${user.username})</a>
        <a href="transacciones.html">Transacciones</a>
        <a href="ruleta.html">Ruleta</a>
        <a href="desarrolladores.html">Desarrolladores</a>
        <a href="historia.html">Reglas</a>
        <a href="#" id="logoutBtn">Salir</a>
      `;

      document.getElementById("logoutBtn").onclick = async () => {
        await apiFetch("/api/auth/logout", { method: "POST" });
        window.location.href = "login.html";
      };
    }
  } catch {
    console.warn("No se pudo cargar el menú dinámico");
  }
}

async function verificarSesion() {
  try {
    const res = await fetch("/api/user/profile", { credentials: "include" });
    if (res.status === 401) {
      window.location.href = "login.html";
      return null;
    }
    return res.json();
  } catch {
    window.location.href = "login.html";
    return null;
  }
}

window.apiFetch = apiFetch;
window.cargarMenu = cargarMenu;
window.verificarSesion = verificarSesion;
