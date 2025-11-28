// ============================
//  transacciones.js
//  Lógica de depósitos y retiros simulados
//  CIT2008 - Entrega 2
// ============================

// ----------- 1. CARGA INICIAL -----------
document.addEventListener("DOMContentLoaded", () => {
    cargarSaldo();
    configurarFormularios();
});

// ----------- 2. LOCAL STORAGE UTILS -----------
function obtenerSaldo() {
    return parseInt(localStorage.getItem("saldo")) || 0;
}

function guardarSaldo(nuevoSaldo) {
    localStorage.setItem("saldo", nuevoSaldo);
}

function obtenerHistorial() {
    const data = localStorage.getItem("historialTransacciones");
    return data ? JSON.parse(data) : [];
}

function guardarHistorial(historial) {
    localStorage.setItem("historialTransacciones", JSON.stringify(historial));
}

// ----------- 3. VALIDACIONES -----------

function validarDeposito(nombre, tarjeta, fecha, cvv, monto) {
    if (!nombre || !tarjeta || !fecha || !cvv || !monto) {
        mostrarFeedback("Todos los campos son obligatorios", false);
        return false;
    }

    const tarjetaValida = /^\d{16}$/.test(tarjeta);
    const fechaValida = /^\d{2}\/\d{2}$/.test(fecha);
    const cvvValido = /^\d{3}$/.test(cvv);
    const montoValido = Number.isInteger(Number(monto)) && Number(monto) > 0;

    if (!tarjetaValida) return mostrarFeedback("Número de tarjeta inválido", false);
    if (!fechaValida) return mostrarFeedback("Formato de fecha inválido (MM/AA)", false);
    if (!cvvValido) return mostrarFeedback("CVV inválido", false);
    if (!montoValido) return mostrarFeedback("Monto debe ser un número entero positivo", false);

    return true;
}

function validarRetiro(nombre, cuenta, banco, monto) {
    if (!nombre || !cuenta || !banco || !monto) {
        mostrarFeedback("Todos los campos son obligatorios", false);
        return false;
    }

    const cuentaValida = /^\d{6,20}$/.test(cuenta);
    const montoValido = Number.isInteger(Number(monto)) && Number(monto) > 0;

    if (!cuentaValida) return mostrarFeedback("Número de cuenta inválido", false);
    if (!montoValido) return mostrarFeedback("Monto debe ser un número entero positivo", false);

    const saldo = obtenerSaldo();
    if (Number(monto) > saldo) {
        return mostrarFeedback("Saldo insuficiente para el retiro", false);
    }

    return true;
}

// ----------- 4. MODALES DE CONFIRMACIÓN -----------

function mostrarModalConfirmacion(tipo, datos, onConfirm) {
    const modal = document.createElement("div");
    modal.className = "modal";

    modal.innerHTML = `
        <div class="modal-content">
            <h2>Confirmar ${tipo}</h2>
            <p>Monto: $${datos.monto}</p>
            <div class="modal-actions">
                <button id="confirmarBtn">Confirmar</button>
                <button id="cancelarBtn">Cancelar</button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    modal.style.display = "flex";

    document.getElementById("cancelarBtn").addEventListener("click", () => modal.remove());
    document.getElementById("confirmarBtn").addEventListener("click", () => {
        onConfirm();
        modal.remove();
    });
}

// ----------- 5. PROCESAMIENTO DE FORMULARIOS -----------

function configurarFormularios() {
    const formDeposito = document.getElementById("formDeposito");
    const formRetiro = document.getElementById("formRetiro");

    if (formDeposito) {
        formDeposito.addEventListener("submit", e => {
            e.preventDefault();

            const nombre = formDeposito.nombre.value.trim();
            const tarjeta = formDeposito.tarjeta.value.trim();
            const fecha = formDeposito.fecha.value.trim();
            const cvv = formDeposito.cvv.value.trim();
            const monto = formDeposito.monto.value.trim();

            if (validarDeposito(nombre, tarjeta, fecha, cvv, monto)) {
                mostrarModalConfirmacion("depósito", { monto }, () => {
                    procesarDeposito(Number(monto));
                });
            }
        });
    }

    if (formRetiro) {
        formRetiro.addEventListener("submit", e => {
            e.preventDefault();

            const nombre = formRetiro.nombre.value.trim();
            const cuenta = formRetiro.cuenta.value.trim();
            const banco = formRetiro.banco.value.trim();
            const monto = formRetiro.monto.value.trim();

            if (validarRetiro(nombre, cuenta, banco, monto)) {
                mostrarModalConfirmacion("retiro", { monto }, () => {
                    procesarRetiro(Number(monto));
                });
            }
        });
    }
}

function procesarDeposito(monto) {
    const saldoActual = obtenerSaldo();
    const nuevoSaldo = saldoActual + monto;
    guardarSaldo(nuevoSaldo);

    agregarTransaccion("Depósito", monto);
    mostrarFeedback("Depósito exitoso", true);
    actualizarSaldoUI(nuevoSaldo);
}

function procesarRetiro(monto) {
    const saldoActual = obtenerSaldo();
    const nuevoSaldo = saldoActual - monto;
    guardarSaldo(nuevoSaldo);

    agregarTransaccion("Retiro", monto);
    mostrarFeedback("Retiro exitoso", true);
    actualizarSaldoUI(nuevoSaldo);
}

// ----------- 6. INTERFAZ E HISTORIAL -----------

function agregarTransaccion(tipo, monto) {
    const historial = obtenerHistorial();
    const fecha = new Date().toLocaleString("es-CL");
    historial.unshift({ tipo, monto, fecha });
    guardarHistorial(historial);
    actualizarHistorialUI(historial);
}

function cargarSaldo() {
    const saldo = obtenerSaldo();
    actualizarSaldoUI(saldo);
    actualizarHistorialUI(obtenerHistorial());
}

function actualizarSaldoUI(saldo) {
    const saldoElemento = document.getElementById("saldoActual");
    if (saldoElemento) {
        saldoElemento.textContent = `$${saldo}`;
    }
}

function actualizarHistorialUI(historial) {
    const contenedor = document.getElementById("historialTransacciones");
    if (!contenedor) return;

    contenedor.innerHTML = "";
    historial.forEach(item => {
        const fila = document.createElement("li");
        fila.textContent = `${item.fecha} — ${item.tipo}: $${item.monto}`;
        contenedor.appendChild(fila);
    });
}

function mostrarFeedback(mensaje, exito = true) {
    const div = document.createElement("div");
    div.className = `feedback ${exito ? "exito" : "error"}`;
    div.textContent = mensaje;
    document.body.appendChild(div);

    setTimeout(() => div.remove(), 2500);
    return false;
}

