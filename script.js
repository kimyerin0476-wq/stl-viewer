import * as THREE from "https://unpkg.com/three@0.161.0/build/three.module.js";

import { STLLoader } from "https://unpkg.com/three@0.161.0/examples/jsm/loaders/STLLoader.js?module";

import { OrbitControls } from "https://unpkg.com/three@0.161.0/examples/jsm/controls/OrbitControls.js?module";

const scene = new THREE.Scene();

scene.background = new THREE.Color(0x87ceeb);

const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth/window.innerHeight,
    0.1,
    2000
);

camera.position.set(0,0,200);

const renderer = new THREE.WebGLRenderer({
    antialias:true
});

renderer.setSize(
    window.innerWidth,
    window.innerHeight
);

document
.getElementById("viewer")
.appendChild(renderer.domElement);

const controls =
new OrbitControls(
    camera,
    renderer.domElement
);

controls.enableDamping = true;

const ambient =
new THREE.AmbientLight(
    0xffffff,
    2
);

scene.add(ambient);

const directional =
new THREE.DirectionalLight(
    0xffffff,
    3
);

directional.position.set(
    100,
    100,
    100
);

scene.add(directional);

let shark;

const loader =
new STLLoader();

loader.load(
    "./models/Shark.stl",

    function(geometry){

        geometry.center();

        const material =
        new THREE.MeshPhongMaterial({
            color:0x4aa3ff,
            shininess:100
        });

        shark =
        new THREE.Mesh(
            geometry,
            material
        );

        shark.scale.set(
            0.05,
            0.05,
            0.05
        );

        scene.add(shark);
    }
);

const video =
document.getElementById("video");

const hands =
new Hands({

    locateFile:(file)=>{
        return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
    }
});

hands.setOptions({

    maxNumHands:1,

    modelComplexity:1,

    minDetectionConfidence:0.7,

    minTrackingConfidence:0.7
});

let scaleValue = 0.05;

hands.onResults((results)=>{

    if(
        !results.multiHandLandmarks ||
        results.multiHandLandmarks.length===0
    ){
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

    if(shark){

        shark.position.x =
        (index.x-0.5)*150;

        shark.position.y =
        -(index.y-0.5)*150;

        const dx =
        thumb.x-index.x;

        const dy =
        thumb.y-index.y;

        const distance =
        Math.sqrt(
            dx*dx+dy*dy
        );

        scaleValue =
        THREE.MathUtils.clamp(
            distance*0.5,
            0.02,
            0.3
        );

        shark.scale.set(
            scaleValue,
            scaleValue,
            scaleValue
        );

        const fingersUp =
        Math.abs(index.y-middle.y)<0.05;

        if(fingersUp){

            shark.rotation.y += 0.05;
        }
    }
});

const webcam =
new Camera(video,{

    onFrame:async()=>{

        await hands.send({
            image:video
        });
    },

    width:640,
    height:480
});

webcam.start();

let swimTime = 0;

function animate(){

    requestAnimationFrame(
        animate
    );

    controls.update();

    if(shark){

        swimTime += 0.03;

        shark.position.z =
        Math.sin(swimTime)*10;

        shark.rotation.z =
        Math.sin(swimTime)*0.1;
    }

    renderer.render(
        scene,
        camera
    );
}

animate();

window.addEventListener(
    "resize",
    ()=>{

        camera.aspect =
        window.innerWidth/
        window.innerHeight;

        camera.updateProjectionMatrix();

        renderer.setSize(
            window.innerWidth,
            window.innerHeight
        );
    }
);
