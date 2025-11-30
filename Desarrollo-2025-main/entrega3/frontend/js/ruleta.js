let saldoActual = 0;
let apuestas = []; 
let ultimoNumero = "-";



document.addEventListener("DOMContentLoaded", async () => {
    await verificarSesionYCargarSaldo();
    generarNumeros();
});




async function verificarSesionYCargarSaldo() {
    try {
        const res = await fetch("/api/user/profile", { credentials: "include" });
        if (res.status === 401) {
            window.location.href = "/login.html";
            return;
        }

        const data = await res.json();
        saldoActual = data.balance;
        document.getElementById("saldoActual").textContent = saldoActual;
    } catch (err) {
        console.error(err);
        alert("Error cargando usuario");
    }
}




function generarNumeros() {
    const cont = document.getElementById("numerosGrid");
    cont.innerHTML = "";

    for (let i = 0; i <= 36; i++) {
        const btn = document.createElement("div");
        btn.className = "numero-casilla";
        btn.textContent = i;
        btn.dataset.type = "single";
        btn.dataset.value = i;
        btn.onclick = () => hacerApuestaNumero(i);
        cont.appendChild(btn);
    }
}


let apuestaPendiente = null;

function hacerApuesta(tipo) {

    apuestaPendiente = tipo;
    abrirModal(tipo);
}

function hacerApuestaNumero(num) {
    apuestaPendiente = { type: "single", value: num };
    abrirModal(`Número ${num}`);
}

function abrirModal(tipo) {
    document.getElementById("tipoApuesta").textContent = tipo;
    document.getElementById("saldoModal").textContent = saldoActual;
    document.getElementById("montoApuesta").value = "";
    document.getElementById("modalApuesta").style.display = "block";
}

function cerrarModal() {
    document.getElementById("modalApuesta").style.display = "none";
}



function confirmarApuesta() {
    const monto = Number(document.getElementById("montoApuesta").value);

    if (isNaN(monto) || monto <= 0) {
        alert("Monto inválido");
        return;
    }


    if (apuestaPendiente.type === "single") {
        
        apuestas.push({
            type: "single",
            value: apuestaPendiente.value,
            amount: monto
        });

    } else {
        // ROJO, NEGRO, PAR, IMPAR, BAJO, ALTO
        const numeros = convertirApuestasMultiples(apuestaPendiente);

        numeros.forEach(num => {
            apuestas.push({
                type: "single",
                value: num,
                amount: monto
            });
        });
    }

    cerrarModal();
    actualizarTablaApuestas();
}




function convertirApuestasMultiples(tipo) {
    const rojo = [1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36];
    const negro = [2,4,6,8,10,11,13,15,17,20,22,24,26,28,29,31,33,35];

    switch(tipo) {
        case "rojo": return rojo;
        case "negro": return negro;
        case "par": return Array.from({length:18},(_,i)=>(i+1)*2);
        case "impar": return Array.from({length:18},(_,i)=>i*2+1);
        case "bajo": return Array.from({length:18},(_,i)=>i+1);      // 1–18
        case "alto": return Array.from({length:18},(_,i)=>i+19);     // 19–36
        default: return [];
    }
}



function actualizarTablaApuestas() {
    const tbody = document.getElementById("tablaApuestas");
    tbody.innerHTML = "";

    apuestas.forEach((ap, i) => {
        const tr = document.createElement("tr");

        const tdTipo = document.createElement("td");
        tdTipo.textContent = ap.type === "single" ? `Número ${ap.value}` : ap.type;

        const tdMonto = document.createElement("td");
        tdMonto.textContent = `$${ap.amount}`;

        const tdDel = document.createElement("td");
        tdDel.innerHTML = `<button onclick="eliminarApuesta(${i})">X</button>`;

        tr.appendChild(tdTipo);
        tr.appendChild(tdMonto);
        tr.appendChild(tdDel);
        tbody.appendChild(tr);
    });
}

function eliminarApuesta(i) {
    apuestas.splice(i, 1);
    actualizarTablaApuestas();
}




async function girarRuleta() {
    if (apuestas.length === 0) {
        alert("Debe hacer al menos una apuesta");
        return;
    }

    try {
       
        let res = await fetch("/api/game/bet", {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ bets: apuestas })
        });

        let data = await res.json();
        if (!res.ok) {
            alert(data.error || "Error validando apuestas");
            return;
        }


        res = await fetch("/api/game/spin", {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ bets: apuestas })
        });

        data = await res.json();
        if (!res.ok) {
            alert(data.error || "Error en el giro");
            return;
        }

        ultimoNumero = data.winningNumber;

        animarRuleta(data.winningNumber);
        mostrarResultadoModal(data);
        actualizarHistorial(data.winningNumber);
        actualizarSaldo(data.balance);

        apuestas = [];
        actualizarTablaApuestas();

    } catch(err) {
        console.error(err);
        alert("Error comunicándose con el servidor");
    }
}


function animarRuleta(numeroGanador) {
    const ruleta = document.getElementById("ruleta");


    const gradosPorNumero = 360 / 37;
    const vueltasExtra = 5;
    const angulo = (vueltasExtra * 360) + (gradosPorNumero * numeroGanador);

    ruleta.style.transition = "transform 3s ease-out";
    ruleta.style.transform = `rotate(${angulo}deg)`;

    setTimeout(() => {
        document.getElementById("numeroGanador").textContent = numeroGanador;
    }, 3000);
}




function actualizarSaldo(nuevoSaldo) {
    saldoActual = nuevoSaldo;
    document.getElementById("saldoActual").textContent = nuevoSaldo;
}

function actualizarHistorial(num) {
    const pill = document.getElementById("historialPills");
    pill.textContent = `${num}`;
}




function mostrarResultadoModal(data) {
    const modal = document.getElementById("modalResultado");

    document.getElementById("tituloResultado").textContent =
        `Número ganador: ${data.winningNumber}`;

    let txt = "";
    txt += `Balance final: $${data.balance}\n`;
    txt += `Ganancia Neta: ${data.netChange >= 0 ? "+" : ""}${data.netChange}`;

    document.getElementById("mensajeResultado").textContent = txt;

    modal.style.display = "block";
}

function cerrarModalResultado() {
    document.getElementById("modalResultado").style.display = "none";
}
