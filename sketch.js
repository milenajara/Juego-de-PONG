let pelota;
let raquetaJugador;
let raquetaComputadora;
let puntosJugador = 0;
let puntosComputadora = 0;
let fondo; // Variable para la imagen de fondo
let imagenRaquetaJugador; // Variable para la imagen de la raqueta del jugador
let imagenRaquetaComputadora; // Variable para la imagen de la raqueta de la computadora
let imagenPelota; // Variable para la imagen de la pelota
let sonidoBounce; // Variable para el sonido de rebote

function preload() {
    fondo = loadImage('imagen/fondo1.png'); // Cargar la imagen antes de que se inicie el juego
    imagenRaquetaJugador = loadImage('imagen/barra1.png'); // Cargar la imagen de la raqueta del jugador
    imagenRaquetaComputadora = loadImage('imagen/barra2.png'); // Cargar la imagen de la raqueta de la computadora
    imagenPelota = loadImage('imagen/bola.png'); // Cargar la imagen de la pelota
    sonidoBounce = loadSound('sonido/bounce.wav'); // Cargar el sonido de rebote
}

function setup() {
    createCanvas(800, 400);
    pelota = new Pelota();
    raquetaJugador = new Raqueta(false); // La raqueta del jugador estará a la derecha
    raquetaComputadora = new Raqueta(true); // La raqueta de la computadora estará a la izquierda
    sonidoBounce.setVolume(0.5); // Ajustar el volumen del sonido
}

function draw() {
    background(0);
    image(fondo, 0, 0, width, height); // Dibujar la imagen de fondo
    
    // Dibuja los marcos superior e inferior
    dibujarMarcos();
    
    // Muestra el puntaje
    mostrarPuntaje();
    
    pelota.mostrar();
    pelota.mover();
    raquetaJugador.mostrar();
    raquetaComputadora.mostrar();
    
    raquetaJugador.controlar(); // Controla la raqueta del jugador con teclas
    raquetaComputadora.controlar(pelota); // Control de la raqueta de la computadora
    
    pelota.verificarColision(raquetaJugador);
    pelota.verificarColision(raquetaComputadora);
}

function dibujarMarcos() {
    fill(255);
    rect(0, 0, width, 10); // Marco superior
    rect(0, height - 10, width, 10); // Marco inferior
}

function mostrarPuntaje() {
    textSize(32);
    fill(255);
    textAlign(CENTER, TOP);
    text(`Jugador: ${puntosJugador}   Computadora: ${puntosComputadora}`, width / 2, 20);
}

function narrarPuntaje() {
    const mensaje = `Jugador ${puntosJugador} Computadora ${puntosComputadora}.`;
    const utterance = new SpeechSynthesisUtterance(mensaje);
    window.speechSynthesis.speak(utterance);
}

class Pelota {
    constructor() {
        this.x = width / 2;
        this.y = height / 2;
        this.diametro = 20;
        this.velocidadX = 5 * (Math.random() > 0.5 ? 1 : -1);
        this.velocidadY = 5 * (Math.random() > 0.5 ? 1 : -1);
        this.anguloRotacion = 0; // Ángulo de rotación inicial
    }

    mostrar() {
        // Guardar el estado de la transformación
        push();
        translate(this.x, this.y); // Mover el origen al centro de la pelota
        rotate(this.anguloRotacion); // Aplicar rotación
        image(imagenPelota, -this.diametro / 2, -this.diametro / 2, this.diametro, this.diametro); // Usar la imagen de la pelota
        pop(); // Restaurar el estado de la transformación
    }

    mover() {
        this.x += this.velocidadX;
        this.y += this.velocidadY;

        // Actualizar el ángulo de rotación basado en la velocidad
        this.anguloRotacion += (Math.abs(this.velocidadX) + Math.abs(this.velocidadY)) * 0.05; // Aumentar el efecto de rotación

        // Colisión con el marco superior e inferior
        if (this.y - this.diametro / 2 < 10) { // Marco superior
            this.y = 10 + this.diametro / 2; // Asegura que no salga del marco
            this.velocidadY *= -1; // Invertir dirección vertical
        } else if (this.y + this.diametro / 2 > height - 10) { // Marco inferior
            this.y = height - 10 - this.diametro / 2;
            this.velocidadY *= -1;
        }

        // Actualizar el puntaje y reiniciar la posición si sale del lado izquierdo o derecho
        if (this.x < 0) {
            puntosJugador++; // Punto para el jugador
            narrarPuntaje(); // Narrar el puntaje
            this.reiniciar();
        } else if (this.x > width) {
            puntosComputadora++; // Punto para la computadora
            narrarPuntaje(); // Narrar el puntaje
            this.reiniciar();
        }
    }

    reiniciar() {
        this.x = width / 2;
        this.y = height / 2;
        this.velocidadX *= -1; // Cambia la dirección
        this.velocidadY = 5 * (Math.random() > 0.5 ? 1 : -1); // Reinicia velocidad Y
        this.anguloRotacion = 0; // Reiniciar el ángulo de rotación
    }

    verificarColision(raqueta) {
        if (this.x - this.diametro / 2 < raqueta.x + raqueta.ancho &&
            this.x + this.diametro / 2 > raqueta.x &&
            this.y + this.diametro / 2 > raqueta.y &&
            this.y - this.diametro / 2 < raqueta.y + raqueta.alto) {
            
            // Cambiar dirección y ajustar la posición de la pelota
            this.velocidadX *= -1;

            // Reproducir sonido de rebote
            sonidoBounce.play();

            // Determinar el offset de la colisión
            let offset = (this.y - (raqueta.y + raqueta.alto / 2)) / (raqueta.alto / 2);
            
            // Ajustar la velocidad Y dependiendo del lugar donde golpea
            if (Math.abs(offset) < 0.2) {
                // Centro de la raqueta
                this.velocidadY = 5 * (Math.random() > 0.5 ? 1 : -1); // Mantener ángulo más estable
            } else {
                // Extremos de la raqueta
                let anguloAjuste = map(offset, -1, 1, -1.5, 1.5); // Ajuste del ángulo
                this.velocidadY = 5 * anguloAjuste; // Cambiar la velocidad Y dependiendo del ajuste
            }

            // Asegura que la pelota se mueva fuera de la raqueta después de la colisión
            if (raqueta.esComputadora) {
                this.x = raqueta.x + raqueta.ancho + this.diametro / 2; // Aleja la pelota a la derecha de la raqueta de la computadora
            } else {
                this.x = raqueta.x - this.diametro / 2; // Aleja la pelota a la izquierda de la raqueta del jugador
            }
        }
    }
}

class Raqueta {
    constructor(esComputadora) {
        this.ancho = 10;
        this.alto = 80;
        this.esComputadora = esComputadora;
        const margen = 20; // Margen desde el borde del lienzo
        this.x = esComputadora ? margen : width - this.ancho - margen; // Raqueta de la computadora a la izquierda con margen, la del jugador a la derecha con margen
        this.y = height / 2 - this.alto / 2; // Inicialmente en el centro vertical
    }

    mostrar() {
        if (this.esComputadora) {
            image(imagenRaquetaComputadora, this.x, this.y, this.ancho, this.alto); // Dibujar la imagen de la raqueta de la computadora
        } else {
            image(imagenRaquetaJugador, this.x, this.y, this.ancho, this.alto); // Dibujar la imagen de la raqueta del jugador
        }
    }

    controlar(pelota) {
        if (this.esComputadora) {
            // Movimiento de la raqueta de la computadora siguiendo la pelota
            if (this.y + this.alto / 2 < pelota.y && this.y + this.alto < height - 10) {
                this.y += 3;
            } else if (this.y + this.alto / 2 > pelota.y && this.y > 10) {
                this.y -= 3;
            }
        } else {
            // Control del jugador con las teclas 'Y' y 'X'
            if (keyIsDown(89) && this.y > 10) { // Tecla 'Y' para subir
                this.y -= 5;
            }
            if (keyIsDown(88) && this.y < height - this.alto - 10) { // Tecla 'X' para bajar
                this.y += 5;
            }
        }
    }
}
