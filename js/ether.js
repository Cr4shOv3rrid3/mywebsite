"use strict";

const { PI, cos, sin, abs, sqrt, pow, floor, round, random, atan2 } = Math;
const HALF_PI = 0.5 * PI;
const TAU = 2 * PI;
const TO_RAD = PI / 180;
const rand = n => n * random();
const randIn = (min, max) => rand(max - min) + min;
const randRange = n => n - rand(2 * n);
const fadeIn = (t, m) => t / m;
const fadeOut = (t, m) => (m - t) / m;
const fadeInOut = (t, m) => {
	let hm = 0.5 * m;
	return abs((t + hm) % m - hm) / (hm);
};
const dist = (x1, y1, x2, y2) => sqrt(pow(x2 - x1, 2) + pow(y2 - y1, 2));
const angle = (x1, y1, x2, y2) => atan2(y2 - y1, x2 - x1);
const lerp = (n1, n2, speed) => (1 - speed) * n1 + speed * n2;

const particleCount = 1000;
const spawnRadius = 100;
const noiseSteps = 6;

let canvas;
let ctx;
let center;
let tick;
let simplex;
let positions;
let velocities;
let lifeSpans;
let sizes;
let hues;
let speeds;

function setup() {
	tick = 0;
	center = [];
	createCanvas();
	createParticles();
	draw();
}

function createParticles() {
	simplex = new SimplexNoise();
	positions = new Float32Array(particleCount * 2);
	velocities = new Float32Array(particleCount * 2);
	lifeSpans = new Float32Array(particleCount * 2);
	speeds = new Float32Array(particleCount);
	hues = new Float32Array(particleCount);
	sizes = new Float32Array(particleCount);
	
	let i;
	
	for (i = 0; i < particleCount * 2; i += 2) {
		initParticle(i);
	}
}

function initParticle(i) {
	let iy, ih, rd, rt, cx, sy, x, y, s, rv, vx, vy, t, h, si, l, ttl;
	
	iy = i + 1;
	ih = 0.5 * i | 0;
	rd = rand(spawnRadius);
	rt = rand(TAU);
	cx = cos(rt);
	sy = sin(rt);
	x = center[0] + cx * rd;
	y = center[1] + sy * rd;
	rv = randIn(0.1, 1);
	s = randIn(1, 8);
	vx = rv * cx * 0.1;
	vy = rv * sy * 0.1;
	si = randIn(0.1, 1);
	h = randIn(160,260);
	l = 0;
	ttl = randIn(50, 200);
	
	positions[i] = x;
	positions[iy] = y;
	velocities[i] = vx;
	velocities[iy] = vy;
	hues[ih] = h;
	sizes[ih] = si;
	speeds[ih] = s;
	lifeSpans[i] = l;
	lifeSpans[iy] = ttl;
}

function drawParticle(i) {
	let iy, ih, x, y, n, tx, ty, s, vx, vy, h, si, l, dl, ttl, c;

	iy = i + 1;
	ih = 0.5 * i | 0;
	x = positions[i];
	y = positions[iy];
	n = simplex.noise3D(x * 0.0025, y * 0.0025, tick * 0.0005) * TAU;
	vx = lerp(velocities[i], cos(n * noiseSteps), 0.05);
	vy = lerp(velocities[iy], sin(n * noiseSteps), 0.05);
	s = speeds[ih];
	tx = x + vx * s;
	ty = y + vy * s;
	h = hues[ih];
	si = sizes[ih];
	l = lifeSpans[i];
	ttl = lifeSpans[iy];
	dl = fadeInOut(l, ttl);
	c = `hsla(${h},50%,60%,${dl})`;

	l++;
	
	ctx.a.save();
	ctx.a.lineWidth = dl * si + 1;
	ctx.a.strokeStyle = c;
	ctx.a.beginPath();
	ctx.a.moveTo(x, y);
	ctx.a.lineTo(tx, ty);
	ctx.a.stroke();
	ctx.a.closePath();
	ctx.a.restore();

	positions[i] = tx;
	positions[iy] = ty;
	velocities[i] = vx;
	velocities[iy] = vy;
	lifeSpans[i] = l;

	(checkBounds(x, y) || l > ttl) && initParticle(i);
}

function checkBounds(x, y) {
	return(
		x > canvas.a.width ||
		x < 0 ||
		y > canvas.a.height ||
		y < 0
	);
}

function createCanvas() {
	canvas = {
		a: document.createElement("canvas"),
		b: document.createElement("canvas")
	};
	canvas.b.style = `
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
	`;
	document.body.appendChild(canvas.b);
	ctx = {
		a: canvas.a.getContext("2d"),
		b: canvas.b.getContext("2d")
	};
	resize();
}

function resize() {
	const { innerWidth, innerHeight } = window;
	
	canvas.a.width = canvas.b.width = innerWidth;
	canvas.a.height = canvas.b.height = innerHeight;
	center[0] = 0.5 * innerWidth;
	center[1] = 0.5 * innerHeight;
}

function draw() {
	tick++;
	ctx.a.clearRect(0,0,canvas.a.width,canvas.a.height);
	
	ctx.b.fillStyle = 'rgba(0,0,0,0.1)';
	ctx.b.fillRect(0,0,canvas.b.width,canvas.b.height);
	
	let i;
	
	for (i = 0; i < particleCount * 2; i += 2) {
		drawParticle(i);
	}
	
	ctx.b.save();
	ctx.b.filter = 'blur(8px)';
	ctx.b.globalCompositeOperation = 'lighten';
	ctx.b.drawImage(canvas.a, 0, 0);
	ctx.b.restore();
	
	ctx.b.save();
	ctx.b.globalCompositeOperation = 'lighter';
	ctx.b.drawImage(canvas.a, 0, 0);
	ctx.b.restore();
	
	window.requestAnimationFrame(draw);
}

window.addEventListener("load", setup);
window.addEventListener("resize", resize);
