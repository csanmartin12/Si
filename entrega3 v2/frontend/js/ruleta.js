let apuestas = [];
let saldoUsuario = 0;
let apuestaActual = null;

document.addEventListener("DOMContentLoaded", async () => {
  await cargarSaldo();
  cargarNumeros();
  inicializarDocenas();
  inicializarColumnas();
});

async function cargarSaldo() {
  const res = await fetch("/api/usuario/perfil", {
    method: "GET",
    credentials: "include"
  });

  if (!res.ok) return;

  const u = await res.json();
  saldoUsuario = u.saldo;
  document.getElementById("saldoActual").textContent = saldoUsuario;
}

function cargarNumeros() {
  const grid = document.getElementById("numeros-grid");
  for (let i = 0; i <= 36; i++) {
    const n = document.createElement("div");
    n.classList.add("numero");
    n.textContent = i;
    n.onclick = () => abrirModal("numero", i);
    grid.appendChild(n);
  }
}

function inicializarDocenas() {
  document.querySelectorAll("[data-type='dozen']").forEach(b => {
    b.addEventListener("click", () => {
      abrirModal("docena", Number(b.dataset.value));
    });
  });
}

function inicializarColumnas() {
  document.querySelectorAll("[data-type='column']").forEach(b => {
    b.addEventListener("click", () => {
      abrirModal("columna", Number(b.dataset.value));
    });
  });
}

function abrirModal(tipo, valor = null) {
  apuestaActual = { tipo, valor };
  document.getElementById("tipoApuesta").textContent =
    valor !== null ? `${tipo} (${valor})` : tipo;
  document.getElementById("saldoModal").textContent = saldoUsuario;
  document.getElementById("modalApuesta").style.display = "flex";
}

function cerrarModal() {
  document.getElementById("modalApuesta").style.display = "none";
}

function confirmarApuesta() {
  const monto = Number(document.getElementById("montoApuesta").value);
  if (!monto || monto <= 0) return;
  if (monto > saldoUsuario) return;

  apuestas.push({
    tipo: apuestaActual.tipo,
    valor: apuestaActual.valor,
    monto
  });

  saldoUsuario -= monto;
  document.getElementById("saldoActual").textContent = saldoUsuario;

  const fila = document.createElement("tr");
  fila.innerHTML = `<td>${apuestaActual.tipo}</td><td>$${monto}</td><td>—</td>`;
  document.getElementById("tablaApuestas").appendChild(fila);

  cerrarModal();
}

async function girarRuleta() {
  if (apuestas.length === 0) return;

  const res = await fetch("/api/juego/giro", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ apuestas })
  });

  const data = await res.json();
  if (!res.ok) {
    alert(data.error);
    return;
  }

  document.getElementById("numeroGanador").textContent = data.numeroGanador;
  saldoUsuario = data.saldo;
  document.getElementById("saldoActual").textContent = saldoUsuario;

  const filas = document.getElementById("tablaApuestas").children;
  data.apuestas.forEach((ap, i) => {
    filas[i].children[2].textContent = ap.gano ? "Ganó" : "Perdió";
  });

  apuestas = [];
}
