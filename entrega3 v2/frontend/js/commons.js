async function hacerPeticion(url, opciones = {}) {
  const opcionesCompletas = {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(opciones.headers || {})
    },
    ...opciones
  };

  if (opcionesCompletas.body && typeof opcionesCompletas.body !== "string") {
    opcionesCompletas.body = JSON.stringify(opcionesCompletas.body);
  }

  return fetch(url, opcionesCompletas);
}


async function verificarSesion() {
  try {
    const res = await fetch("/api/usuario/perfil", {
      method: "GET",
      credentials: "include",
    });

    if (!res.ok) return null;

    return await res.json();
  } catch {
    return null;
  }
}

async function protegerRuta() {
  const datos = await verificarSesion();
  if (!datos) {
    window.location.href = "login.html";
  }
}


async function obtenerUsuarioActual() {
  try {
    const respuesta = await hacerPeticion("/api/user/profile");
    
    if (respuesta.ok) {
      const datos = await respuesta.json();
      return datos.usuario;
    }
    
    return null;
  } catch (error) {
    console.error("Error obteniendo usuario:", error);
    return null;
  }
}


async function cargarMenu() {
  const nav = document.querySelector("nav");
  if (!nav) return;

  const usuario = await obtenerUsuarioActual();

  if (usuario) {
    //Sesión iniciada =  Mostrar menú completo
    nav.innerHTML = `
      <a href="index.html">Inicio</a>
      <a href="perfil.html">Perfil</a>
      <a href="transacciones.html">Transacciones</a>
      <a href="ruleta.html">Ruleta</a>
      <a href="desarrolladores.html">Desarrolladores</a>
      <a href="historia.html">Reglas</a>
      <span style="color: #fbbf24; margin-left: 1rem;">👤 ${usuario.nombreUsuario}</span>
      <a href="#" id="botonCerrarSesion" style="color: #ff6b6b;">Salir</a>
    `;

  
    const botonLogout = document.getElementById("botonCerrarSesion");
    if (botonLogout) {
      botonLogout.addEventListener("click", async (e) => {
        e.preventDefault();
        await cerrarSesion();
      });
    }
  } else {
    // Sesión no iniciada =  Menú simple
    nav.innerHTML = `
      <a href="index.html">Inicio</a>
      <a href="registro.html">Crear cuenta</a>
      <a href="login.html">Iniciar sesión</a>
      <a href="desarrolladores.html">Desarrolladores</a>
      <a href="historia.html">Reglas</a>
    `;
  }
}


async function cerrarSesion() {
  await fetch("/api/auth/logout", {
    method: "POST",
    credentials: "include",
  });
  window.location.href = "login.html";
}


function mostrarError(mensaje, contenedor) {
  if (!contenedor) {
    contenedor = document.body;
  }

  const errorDiv = document.createElement("div");
  errorDiv.className = "mensaje-error";
  errorDiv.textContent = mensaje;
  errorDiv.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #ff4444;
    color: white;
    padding: 1rem 1.5rem;
    border-radius: 8px;
    box-shadow: 0 4px 6px rgba(0,0,0,0.3);
    z-index: 9999;
    animation: slideIn 0.3s ease-out;
  `;

  contenedor.appendChild(errorDiv);

  setTimeout(() => {
    errorDiv.style.animation = "slideOut 0.3s ease-out";
    setTimeout(() => errorDiv.remove(), 300);
  }, 4000);
}

function mostrarExito(mensaje, contenedor) {
  if (!contenedor) {
    contenedor = document.body;
  }

  const exitoDiv = document.createElement("div");
  exitoDiv.className = "mensaje-exito";
  exitoDiv.textContent = mensaje;
  exitoDiv.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #00c851;
    color: white;
    padding: 1rem 1.5rem;
    border-radius: 8px;
    box-shadow: 0 4px 6px rgba(0,0,0,0.3);
    z-index: 9999;
    animation: slideIn 0.3s ease-out;
  `;

  contenedor.appendChild(exitoDiv);

  setTimeout(() => {
    exitoDiv.style.animation = "slideOut 0.3s ease-out";
    setTimeout(() => exitoDiv.remove(), 300);
  }, 4000);
}

document.addEventListener("DOMContentLoaded", () => {
  cargarMenu();
});


const estilo = document.createElement("style");
estilo.textContent = `
  @keyframes slideIn {
    from {
      transform: translateX(400px);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }

  @keyframes slideOut {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(400px);
      opacity: 0;
    }
  }
`;
document.head.appendChild(estilo);


window.hacerPeticion = hacerPeticion;
window.verificarSesion = verificarSesion;
window.obtenerUsuarioActual = obtenerUsuarioActual;
window.cargarMenu = cargarMenu;
window.cerrarSesion = cerrarSesion;
window.mostrarError = mostrarError;
window.mostrarExito = mostrarExito;