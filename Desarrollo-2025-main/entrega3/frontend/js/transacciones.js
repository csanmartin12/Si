document.addEventListener("DOMContentLoaded", async () => {
  cargarMenu();

  const user = await verificarSesion();
  if (!user) return;

  const forms = document.querySelectorAll("form");
  if (forms.length < 2) return;

  const formDep = forms[0];
  const formRet = forms[1];

  // DEPÓSITO
  formDep.addEventListener("submit", async (e) => {
    e.preventDefault();
    const monto = Number(formDep.querySelector("input").value);

    if (!monto || monto <= 0) {
      alert("Monto inválido");
      return;
    }

    const res = await apiFetch("/api/user/deposit", {
      method: "POST",
      body: { amount: monto }
    });
    const data = await res.json();

    if (!res.ok) {
      alert(data.error || "Error en depósito");
      return;
    }

    alert("Depósito realizado: Nuevo saldo $" + data.balance);
  });

  // RETIRO
  formRet.addEventListener("submit", async (e) => {
    e.preventDefault();
    const monto = Number(formRet.querySelector("input").value);

    if (!monto || monto <= 0) {
      alert("Monto inválido");
      return;
    }

    const res = await apiFetch("/api/user/withdraw", {
      method: "POST",
      body: { amount: monto }
    });
    const data = await res.json();

    if (!res.ok) {
      alert(data.error || "Error en retiro");
      return;
    }

    alert("Retiro realizado: Nuevo saldo $" + data.balance);
  });
});
