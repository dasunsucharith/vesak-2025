import * as THREE from "https://unpkg.com/three@0.164.1/build/three.module.js";

/********** Constants **********/
const roomSize = 8; // Half‑length of one side (total room width = 16)
const wallH = 3.5; // Wall height in metres
const wallW = roomSize * 2; // Wall width exactly spans the room
const clampPad = 0.4; // How close the camera can get to a wall

/********** Scene Setup **********/
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0a0f1e);

const camera = new THREE.PerspectiveCamera(
	75,
	window.innerWidth / window.innerHeight,
	0.1,
	100
);
camera.position.set(0, 1.6, 0); // spawn dead‑centre, eye‑level

const renderer = new THREE.WebGLRenderer({
	canvas: document.getElementById("bg"),
	antialias: true,
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

/********** Lighting & Floor **********/
scene.add(new THREE.HemisphereLight(0xffffff, 0x444444, 1));
const pt = new THREE.PointLight(0xfff4cc, 1, 20);
pt.position.set(0, 4, 0);
scene.add(pt);

const floor = new THREE.Mesh(
	new THREE.PlaneGeometry(roomSize * 2, roomSize * 2),
	new THREE.MeshStandardMaterial({ color: 0x228b22 })
);
floor.rotation.x = -Math.PI / 2;
scene.add(floor);

/********** Gallery Walls **********/
const loader = new THREE.TextureLoader();
const stages = [
	{ file: "birth.jpg", label: "Birth" },
	{ file: "enlightenment.jpg", label: "Enlightenment" },
	{ file: "firstsermon.jpg", label: "First Sermon" },
	{ file: "parinirvana.jpg", label: "Parinirvana" },
];

const wallTextures = [
    "wall_texture_1.jpg", // Replace with your actual texture filenames
    "wall_texture_2.jpg",
    "wall_texture_3.jpg",
    "wall_texture_4.jpg"
];

stages.forEach((s, i) => {
    const tex = loader.load(`assets/${wallTextures[i]}`); // Use wall texture
    const wall = new THREE.Mesh(
        new THREE.PlaneGeometry(wallW, wallH),
        new THREE.MeshBasicMaterial({ map: tex, side: THREE.DoubleSide })
    );
    const cfg = [
        { x: 0, z: -roomSize, ry: 0 }, // North
        { x: roomSize, z: 0, ry: -Math.PI / 2 }, // East
        { x: 0, z: roomSize, ry: Math.PI }, // South
        { x: -roomSize, z: 0, ry: Math.PI / 2 }, // West
    ][i];
    wall.position.set(cfg.x, wallH / 2, cfg.z);
    wall.rotation.y = cfg.ry;
    scene.add(wall);
});

/********** Movement **********/
const keys = {};
window.addEventListener("keydown", (e) => {
	keys[e.code] = true;
	document
		.getElementById("ambient")
		.play()
		.catch(() => {});
});
window.addEventListener("keyup", (e) => {
	keys[e.code] = false;
});

function moveForward(dist) {
	const dir = new THREE.Vector3();
	camera.getWorldDirection(dir);
	camera.position.addScaledVector(dir, dist);
	// Keep inside the room
	camera.position.x = THREE.MathUtils.clamp(
		camera.position.x,
		-roomSize + clampPad,
		roomSize - clampPad
	);
	camera.position.z = THREE.MathUtils.clamp(
		camera.position.z,
		-roomSize + clampPad,
		roomSize - clampPad
	);
}

function animate() {
	requestAnimationFrame(animate);
	const speed = 0.05;
	if (keys["ArrowUp"] || keys["KeyW"]) moveForward(speed);
	if (keys["ArrowDown"] || keys["KeyS"]) moveForward(-speed);
	if (keys["ArrowLeft"] || keys["KeyA"]) camera.rotation.y += 0.03;
	if (keys["ArrowRight"] || keys["KeyD"]) camera.rotation.y -= 0.03;
	renderer.render(scene, camera);
}
animate();

/********** Resize Handling **********/
window.addEventListener("resize", () => {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize(window.innerWidth, window.innerHeight);
});
