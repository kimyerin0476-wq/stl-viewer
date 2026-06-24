import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.161.0/build/three.module.js";
import { STLLoader } from "https://cdn.jsdelivr.net/npm/three@0.161.0/examples/jsm/loaders/STLLoader.js";
import { OrbitControls } from "https://cdn.jsdelivr.net/npm/three@0.161.0/examples/jsm/controls/OrbitControls.js";

// Scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb);

// Camera
const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    2000
);

camera.position.set(0, 0, 200);

// Renderer
const renderer = new THREE.WebGLRenderer({
    antialias: true
});

renderer.setSize(
    window.innerWidth,
    window.innerHeight
);

document
    .getElementById("viewer")
    .appendChild(renderer.domElement);

// Orbit Controls
const controls = new OrbitControls(
    camera,
    renderer.domElement
);

controls.enableDamping = true;

// Light
const ambientLight = new THREE.AmbientLight(
    0xffffff,
    2
);

scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(
    0xffffff,
    3
);

directionalLight.position.set(
    100,
    100,
    100
);

scene.add(directionalLight);

// STL Model
let model = null;

const loader = new STLLoader();

loader.load(
    "./models/MolView-bas-print_NIH3D.stl",

    function (geometry) {

        geometry.center();

        const material =
            new THREE.MeshPhongMaterial({
                color: 0x4aa3ff,
                shininess: 100
            });

        model = new THREE.Mesh(
            geometry,
            material
        );

        model.scale.set(
            0.5,
            0.5,
            0.5
        );

        scene.add(model);

        console.log("STL Loaded Successfully");
    },

    undefined,

    function (error) {
        console.error(error);
    }
);

// Webcam
const video =
    document.getElementById("video");

// MediaPipe Hands
const hands = new Hands({

    locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
    }
});

hands.setOptions({

    maxNumHands: 1,
    modelComplexity: 1,
    minDetectionConfidence: 0.7,
    minTrackingConfidence: 0.7
});

let scaleValue = 0.5;

hands.onResults((results) => {

    if (
        !results.multiHandLandmarks ||
        results.multiHandLandmarks.length === 0
    ) {
        return;
    }

    const hand =
        results.multiHandLandmarks[0];

    const thumb =
        hand[4];

    const index =
        hand[8];

    const middle =
        hand[12];

    if (model) {

        // Move
        model.position.x =
            (index.x - 0.5) * 150;

        model.position.y =
            -(index.y - 0.5) * 150;

        // Scale
        const dx =
            thumb.x - index.x;

        const dy =
            thumb.y - index.y;

        const distance =
            Math.sqrt(
                dx * dx +
                dy * dy
            );

        scaleValue =
            THREE.MathUtils.clamp(
                distance,
                0.2,
                2
            );

        model.scale.set(
            scaleValue,
            scaleValue,
            scaleValue
        );

        // Rotate
        const twoFingerMode =
            Math.abs(
                index.y - middle.y
            ) < 0.05;

        if (twoFingerMode) {

            model.rotation.y += 0.05;
        }
    }
});

// Camera Feed
const webcam =
    new Camera(video, {

        onFrame: async () => {

            await hands.send({
                image: video
            });
        },

        width: 640,
        height: 480
    });

webcam.start();

// Animation
let t = 0;

function animate() {

    requestAnimationFrame(
        animate
    );

    controls.update();

    if (model) {

        t += 0.03;

        model.position.z =
            Math.sin(t) * 10;

        model.rotation.z =
            Math.sin(t) * 0.1;
    }

    renderer.render(
        scene,
        camera
    );
}

animate();

// Resize
window.addEventListener(
    "resize",
    () => {

        camera.aspect =
            window.innerWidth /
            window.innerHeight;

        camera.updateProjectionMatrix();

        renderer.setSize(
            window.innerWidth,
            window.innerHeight
        );
    }
);
