document.addEventListener("DOMContentLoaded", async () => {
  await actualizarSaldo();
  document.getElementById("formulario-deposito").addEventListener("submit", hacerDeposito);
  document.getElementById("formulario-retiro").addEventListener("submit", hacerRetiro);
});

async function actualizarSaldo() {
  const res = await fetch("/api/usuario/perfil", {
    method: "GET",
    credentials: "include"
  });

  if (!res.ok) return;

  const u = await res.json();
  document.getElementById("saldo-actual").textContent = u.saldo;
}

async function hacerDeposito(e) {
  e.preventDefault();

  const monto = Number(document.getElementById("monto-deposito").value);

  const res = await fetch("/api/usuario/deposito", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ monto })
  });

  const data = await res.json();
  if (!res.ok) {
    alert(data.error);
    return;
  }

  await actualizarSaldo();
}

async function hacerRetiro(e) {
  e.preventDefault();

  const monto = Number(document.getElementById("monto-retiro").value);

  const res = await fetch("/api/usuario/retiro", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ monto })
  });

  const data = await res.json();
  if (!res.ok) {
    alert(data.error);
    return;
  }

  await actualizarSaldo();
}
