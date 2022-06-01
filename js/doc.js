
var time = new Date();
var deltaTime = 0;

if(document.readyState === "complete" || document.readyState === "interactive") {
	setTimeout(Init,1);
} else {
	document.addEventListener("DOMContentLoaded", Init);
}

function Init(){
	time = new Date();
	Start();
	Loop();
}

function Loop() {
	deltaTime = (new Date() - time) / 1000;
	time = new Date();
	Update();
	requestAnimationFrame(Loop);
}

//------------------------ juego --------------------------

var sueloY = 22;
var velY = 0;
var impulso = 900;
var gravedad = 2500;

var pizzaPosX = 42;
var pizzaPosY = sueloY;

var sueloX = 0;
var velEscenario = 1280/3;
var gameVel = 1;
var puntuacion = 0;

var parado = false;
var saltando = false;

var tiempoHastaObstaculo = 2;
var tiempoObstaculoMin = 0.7;
var tiempoObstaculoMax = 1.8;
var obstaculoPosY = 16;
var obstaculos = [];

var tiempoHastaNube = 0.5;
var tiempoNubeMin = 0.7;
var tiempoNubeMax = 2.7;
var maxNubeY = 270;
var minNubeY = 100;
var nubes = [];
var velNube = 0.5;

var container;
var pizza;
var textoPuntuacion;
var suelo;
var gameOver;

function Start() {
	gameOver = document.querySelector(".gameOver");
	suelo = document.querySelector(".suelo");
	container = document.querySelector(".container");
	textoPuntuacion = document.querySelector(".puntuacion");
	pizza = document.querySelector(".pizza");
	document.addEventListener("keydown", handleKeyDown)
}

function Update(){

    if(parado) return;
    moverPizza();
	moverSuelo();
	moverPizza();
	decidirCrearObstaculos();
    decidirCrearNubes();
    moverObstaculos();
    moverNubes();
    detectarColision();
	velY -= gravedad * deltaTime;
}

function handleKeyDown(ev){
	if(ev.keyCode == 32){
		saltar();
	}
}

function saltar(){
	if(pizzaPosY === sueloY) {
		saltando = true;
		velY = impulso;
		pizza.classList.remove("pizzaCorriendo");
	}
}

function moverPizza(){
	pizzaPosY += velY * deltaTime;
	if(pizzaPosY < sueloY){
		tocarSuelo();
	}
	pizza.style.bottom = pizzaPosY+"px";
}

function tocarSuelo(){
	pizzaPosY = sueloY;
	velY = 0;
	if(saltando){
		pizza.classList.add("pizzaCorriendo");
	}
	saltando = false;
}

function moverSuelo(){
	sueloX += calcularDesplazamiento();
	suelo.style.left = -(sueloX % container.clientWidth) + "px";
}

function calcularDesplazamiento(){
	return velEscenario * deltaTime * gameVel;
}



function decidirCrearObstaculos() {
    tiempoHastaObstaculo -= deltaTime;
    if(tiempoHastaObstaculo <= 0) {
        crearObstaculo();
    }
}

function decidirCrearNubes() {
    tiempoHastaNube -= deltaTime;
    if(tiempoHastaNube <= 0) {
        crearNube();
    }
}

function crearObstaculo() {
    var obstaculo = document.createElement("div");
    container.appendChild(obstaculo);
    obstaculo.classList.add("pina");
    if(Math.random() > 0.5) obstaculo.classList.add("pina2");
    obstaculo.posX = container.clientWidth;
    obstaculo.style.left = container.clientWidth+"px";

    obstaculos.push(obstaculo);
    tiempoHastaObstaculo = tiempoObstaculoMin + Math.random() * (tiempoObstaculoMax-tiempoObstaculoMin) / gameVel;
}

function crearNube() {
    var nube = document.createElement("div");
    container.appendChild(nube);
    nube.classList.add("nube");
    nube.posX = container.clientWidth;
    nube.style.left = container.clientWidth+"px";
    nube.style.bottom = minNubeY + Math.random() * (maxNubeY-minNubeY)+"px";
    
    nubes.push(nube);
    tiempoHastaNube = tiempoNubeMin + Math.random() * (tiempoNubeMax-tiempoNubeMin) / gameVel;
}

function moverObstaculos() {
    for (var i = obstaculos.length - 1; i >= 0; i--) {
        if(obstaculos[i].posX < -obstaculos[i].clientWidth) {
            obstaculos[i].parentNode.removeChild(obstaculos[i]);
            obstaculos.splice(i, 1);
            ganarPuntos();
        }else{
            obstaculos[i].posX -= calcularDesplazamiento();
            obstaculos[i].style.left = obstaculos[i].posX+"px";
        }
    }
}

function moverNubes() {
    for (var i = nubes.length - 1; i >= 0; i--) {
        if(nubes[i].posX < -nubes[i].clientWidth) {
            nubes[i].parentNode.removeChild(nubes[i]);
            nubes.splice(i, 1);
        }else{
            nubes[i].posX -= calcularDesplazamiento() * velNube;
            nubes[i].style.left = nubes[i].posX+"px";
        }
    }
}

function ganarPuntos() {
    puntuacion++;
    textoPuntuacion.innerText = puntuacion;
    if(puntuacion == 5){
        gameVel = 1.5;
        container.classList.add("mediodia");
    }else if(puntuacion == 10) {
        gameVel = 2;
        container.classList.add("tarde");
    } else if(puntuacion == 20) {
        gameVel = 3;
        container.classList.add("noche");
    }
    suelo.style.animationDuration = (3/gameVel)+"s";
}

function GameOver() {
    estrellarse();
    gameOver.style.display = "block";
}

function estrellarse() {
    pizza.classList.remove("pizzaCorriendo");
    pizza.classList.add("pizzaEstrellado");
    parado = true;
}

function detectarColision() {
    for (var i = 0; i < obstaculos.length; i++) {
        if(obstaculos[i].posX > pizzaPosX + pizza.clientWidth) {
            break;
        }else{
            if(isCollision(pizza, obstaculos[i], 10, 30, 15, 20)) {
                GameOver();
            }
        }
    }
}

function isCollision(a, b, paddingTop, paddingRight, paddingBottom, paddingLeft) {
    var aRect = a.getBoundingClientRect();
    var bRect = b.getBoundingClientRect();

    return !(
        ((aRect.top + aRect.height - paddingBottom) < (bRect.top)) ||
        (aRect.top + paddingTop > (bRect.top + bRect.height)) ||
        ((aRect.left + aRect.width - paddingRight) < bRect.left) ||
        (aRect.left + paddingLeft > (bRect.left + bRect.width))
    );
}

