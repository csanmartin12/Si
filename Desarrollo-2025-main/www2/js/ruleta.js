var saldo = 1000;
var apuestas = {};
var girando = false;
var apuestaActual = '';
var historialNumeros = [];
var historialApuestas = [];

var numerosRojos = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];

cargarDatos();
generarNumerosGrid();

function cargarDatos() {
    var saldoGuardado = localStorage.getItem('saldo');
    if (saldoGuardado) {
        saldo = parseInt(saldoGuardado);
    }
    actualizarSaldo();

    var historialGuardado = localStorage.getItem('historialNumeros');
    if (historialGuardado) {
        historialNumeros = JSON.parse(historialGuardado);
        mostrarHistorial();
    }

    var apuestasGuardadas = localStorage.getItem('historialApuestas');
    if (apuestasGuardadas) {
        historialApuestas = JSON.parse(apuestasGuardadas);
        mostrarTablaApuestas();
    }
}

function guardarDatos() {
    localStorage.setItem('saldo', saldo);
    localStorage.setItem('historialNumeros', JSON.stringify(historialNumeros));
    localStorage.setItem('historialApuestas', JSON.stringify(historialApuestas));
}

function actualizarSaldo() {
    document.getElementById('saldoActual').textContent = saldo;
}

function hacerApuesta(tipo) {
    if (girando) {
        alert('Espere a que termine el giro');
        return;
    }
    
    apuestaActual = tipo;
    var tipoTexto = tipo.indexOf('numero_') === 0 ? 'NÚMERO ' + tipo.split('_')[1] : tipo.toUpperCase();
    document.getElementById('tipoApuesta').textContent = tipoTexto;
    document.getElementById('saldoModal').textContent = saldo;
    document.getElementById('montoApuesta').value = '';
    document.getElementById('modalApuesta').style.display = 'block';
}

function cerrarModal() {
    document.getElementById('modalApuesta').style.display = 'none';
}

function confirmarApuesta() {
    var monto = parseInt(document.getElementById('montoApuesta').value);

    if (!monto || monto <= 0) {
        alert('Ingrese un monto válido.');
        return;
    }

    var totalApuestas = 0;
    for (var tipo in apuestas) {
        totalApuestas = totalApuestas + apuestas[tipo];
    }

    if (totalApuestas + monto > saldo) {
        alert('No tiene saldo suficiente.');
        return;
    }

    apuestas[apuestaActual] = monto;
    cerrarModal();
    marcarApuesta(apuestaActual);
}

function marcarApuesta(tipo) {
    var casillas = document.querySelectorAll('.table-apuestas td');
    for (var i = 0; i < casillas.length; i++) {
        var texto = casillas[i].textContent.toLowerCase();
        if (texto === tipo || 
            (tipo === 'bajo' && texto === '1-18') || 
            (tipo === 'alto' && texto === '19-36')) {
            casillas[i].classList.add('casilla-apuesta');
        }
    }

    if (tipo.indexOf('numero_') === 0) {
        var numero = parseInt(tipo.split('_')[1]);
        var botones = document.querySelectorAll('.numero-btn');
        for (var i = 0; i < botones.length; i++) {
            if (parseInt(botones[i].textContent) === numero) {
                botones[i].classList.add('apuesta-activa');
            }
        }
    }
}

function limpiarMarcas() {
    var casillas = document.querySelectorAll('.table-apuestas td');
    for (var i = 0; i < casillas.length; i++) {
        casillas[i].classList.remove('casilla-apuesta');
    }
    
    var botones = document.querySelectorAll('.numero-btn');
    for (var i = 0; i < botones.length; i++) {
        botones[i].classList.remove('apuesta-activa');
    }
}

function girarRuleta() {
    if (Object.keys(apuestas).length === 0) {
        alert('Debe hacer al menos una apuesta');
        return;
    }

    girando = true;
    document.getElementById('btnGirar').disabled = true;
    var numeroGanador = Math.floor(Math.random() * 37);

    var ruleta = document.getElementById('ruleta');
    ruleta.classList.add('girando');
    var vueltas = Math.floor(Math.random() * 5) + 8;
    var grados = vueltas * 360;

    setTimeout(function() {
        ruleta.classList.remove('girando');
        ruleta.style.transform = 'rotate(' + grados + 'deg)';
        mostrarResultado(numeroGanador);
    }, 3000);
}

function mostrarResultado(numero) {
    document.getElementById('numeroGanador').textContent = numero;

    historialNumeros.unshift(numero);
    if (historialNumeros.length > 10) {
        historialNumeros.pop();
    }
    mostrarHistorial();

    var ganancias = 0;
    var mensaje = 'Número ganador: ' + numero + '\n\n';

    for (var tipo in apuestas) {
        var monto = apuestas[tipo];
        var gano = false;
        var multiplicador = 2;
        var nombreApuesta = tipo.toUpperCase();

        if (tipo.indexOf('numero_') === 0) {
            var numeroApuesta = parseInt(tipo.split('_')[1]);
            if (numero === numeroApuesta) {
                gano = true;
                multiplicador = 36;
                nombreApuesta = 'NÚMERO ' + numeroApuesta;
            }
        } else if (numero === 0) {
            gano = false;
        } else if (tipo === 'rojo' && numerosRojos.indexOf(numero) !== -1) {
            gano = true;
        } else if (tipo === 'negro' && numerosRojos.indexOf(numero) === -1) {
            gano = true;
        } else if (tipo === 'par' && numero % 2 === 0) {
            gano = true;
        } else if (tipo === 'impar' && numero % 2 !== 0) {
            gano = true;
        } else if (tipo === 'bajo' && numero >= 1 && numero <= 18) {
            gano = true;
        } else if (tipo === 'alto' && numero >= 19 && numero <= 36) {
            gano = true;
        }

        if (gano) {
            ganancias = ganancias + (monto * multiplicador);
            mensaje = mensaje + nombreApuesta + ': ¡GANASTE! +$' + (monto * (multiplicador - 1)) + '\n';
        } else {
            mensaje = mensaje + nombreApuesta + ': Perdiste -$' + monto + '\n';
        }
    }

    var totalApostado = 0;
    for (var tipo in apuestas) {
        totalApostado = totalApostado + apuestas[tipo];
    }

    saldo = saldo - totalApostado + ganancias;
    actualizarSaldo();

    historialApuestas.unshift({
        tipo: Object.keys(apuestas).join(', '),
        monto: totalApostado,
        resultado: ganancias > totalApostado ? 'Gana' : 'Pierde'
    });
    if (historialApuestas.length > 10) {
        historialApuestas.pop();
    }
    mostrarTablaApuestas();
    guardarDatos();

    document.getElementById('tituloResultado').textContent = ganancias > totalApostado ? '¡FELICIDADES! 🎉' : 'Suerte la próxima 😔';
    document.getElementById('tituloResultado').style.color = ganancias > totalApostado ? '#00ff00' : '#ff0000';
    document.getElementById('mensajeResultado').innerHTML = mensaje.replace(/\n/g, '<br>');
    document.getElementById('modalResultado').style.display = 'block';
}

function cerrarModalResultado() {
    document.getElementById('modalResultado').style.display = 'none';
    apuestas = {};
    girando = false;
    document.getElementById('btnGirar').disabled = false;
    document.getElementById('numeroGanador').textContent = '-';
    document.getElementById('ruleta').style.transform = 'rotate(0deg)';
    document.getElementById('ruleta').classList.remove('girando');
    limpiarMarcas();
}

function mostrarHistorial() {
    var html = '';
    for (var i = 0; i < historialNumeros.length; i++) {
        var num = historialNumeros[i];
        var color = num === 0 ? 'green' : (numerosRojos.indexOf(num) !== -1 ? 'red' : 'black');
        html = html + '<span class="pill ' + color + '">' + num + '</span>';
    }
    var elemento = document.getElementById('historialPills');
    if (elemento) {
        elemento.innerHTML = html;
    }
}

function mostrarTablaApuestas() {
    var tabla = document.getElementById('tablaApuestas');
    tabla.innerHTML = '';
    for (var i = 0; i < historialApuestas.length; i++) {
        var apuesta = historialApuestas[i];
        tabla.innerHTML = tabla.innerHTML + '<tr><td>' + apuesta.tipo + '</td><td>$' + apuesta.monto + '</td><td>' + apuesta.resultado + '</td></tr>';
    }
}

function generarNumerosGrid() {
    var grid = document.getElementById('numerosGrid');
    var html = '<button class="numero-btn numero-verde" onclick="hacerApuesta(\'numero_0\')">0</button>';
    
    for (var i = 1; i <= 36; i++) {
        var esRojo = numerosRojos.indexOf(i) !== -1;
        var clase = esRojo ? 'numero-rojo' : 'numero-negro';
        html = html + '<button class="numero-btn ' + clase + '" onclick="hacerApuesta(\'numero_' + i + '\')">' + i + '</button>';
    }
    
    grid.innerHTML = html;
}