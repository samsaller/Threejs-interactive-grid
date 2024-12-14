import * as THREE from "three";
import init from "./init.js";
import TWEEN from "three/examples/jsm/libs/tween.module.js";

const { scene, canvas, sizes, camera, renderer, controls } = init();

camera.position.z = 10;

const group = new THREE.Group();
scene.add(group);
const geometries = [
    new THREE.BoxGeometry(1 * 0.75, 1 * 0.75, 1 * 0.75),
    new THREE.IcosahedronGeometry(0.5, 1),
    new THREE.CylinderGeometry(0.5 * 0.75, 0.5 * 0.75, 1 * 0.75, 16),
    new THREE.TorusKnotGeometry(0.4 * 0.9, 0.1, 64, 8, 2, 3),
    new THREE.SphereGeometry(0.5, 6, 2),
    new THREE.ConeGeometry(0.5, 1, 16, 1),
    new THREE.ConeGeometry(0.5, 1, 16, 1),
    new THREE.TorusGeometry(0.4, 0.18, 16, 16),
    new THREE.ConeGeometry(0.5, 1, 16, 1),
];

let activeIndex = null;

const resetActive = () => {
    group.children[activeIndex].material.color.set("gray");
    new TWEEN.Tween(group.children[activeIndex].position)
        .to(group.children[activeIndex].originalPosition, 1000)
        .easing(TWEEN.Easing.Exponential.Out)
        .start();
    activeIndex = null;
};

for (let i = 0; i < geometries.length; i += 3) {
    for (let j = 0; j < 3; j++) {
        const geometry = geometries[i + j];
        const material = new THREE.MeshBasicMaterial({
            color: "gray",
            wireframe: true,
        });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.index = i + j;

        const x = (j - 1) * 2;
        const y = (i / -3 + 1) * 2;

        mesh.originalPosition = new THREE.Vector3(x, y, 0);

        mesh.position.set(x, y, 0);
        group.add(mesh);
    }
}

const clock = new THREE.Clock();
var delta = null;
var elapsedTime = null;

const tick = () => {
    delta = clock.getDelta();
    elapsedTime = clock.getElapsedTime();

    if (activeIndex != null) {
        group.children[activeIndex].rotation.y += delta;
    }
    TWEEN.update();
    controls.update();
    renderer.render(scene, camera);
    window.requestAnimationFrame(tick);
};

tick();

const rayCaster = new THREE.Raycaster();
const handleClick = (e) => {
    const pointer = new THREE.Vector2();

    pointer.x = (e.clientX / sizes.width) * 2 - 1;
    pointer.y = -((e.clientY / sizes.height) * 2 - 1);

    rayCaster.setFromCamera(pointer, camera);
    const intersections = rayCaster.intersectObjects(group.children);
    if (activeIndex != null) {
        if(!intersections.length){
            console.log("reset")
            return resetActive();
        }else{
            resetActive()
        }
    }
    for (let i = 0; i < intersections.length; i++) {
        const intersection = intersections[i];
        intersection.object.material.color.set("green");

        activeIndex = intersection.object.index;

        new TWEEN.Tween(intersection.object.position)
            .to({ x: 0, y: 0, z: 7 }, 1000)
            .easing(TWEEN.Easing.Exponential.Out)
            .start();
        break
    }
};

window.addEventListener("click", handleClick);

window.addEventListener("resize", (e) => {
    sizes.width = window.innerWidth;
    sizes.height = window.innerHeight;

    camera.aspect = sizes.width / sizes.height;
    camera.updateProjectionMatrix();
    renderer.setSize(sizes.width, sizes.height);
});