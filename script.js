import { STLLoader } from 'https://cdn.jsdelivr.net/npm/three@0.161.0/examples/jsm/loaders/STLLoader.js';

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);

camera.position.z = 100;

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

const light = new THREE.DirectionalLight(
    0xffffff,
    2
);

light.position.set(10,10,10);
scene.add(light);

scene.add(new THREE.AmbientLight(
    0xffffff,
    1
));

let model;

const loader = new STLLoader();

loader.load(
    './models/model.stl',
    function(geometry){

        const material =
            new THREE.MeshPhongMaterial({
                color:0x66ccff
            });

        model = new THREE.Mesh(
            geometry,
            material
        );

        geometry.center();

        scene.add(model);
    }
);

function animate(){

    requestAnimationFrame(
        animate
    );

    renderer.render(
        scene,
        camera
    );
}

animate();

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

hands.onResults((results)=>{

    if(
        results.multiHandLandmarks &&
        results.multiHandLandmarks.length > 0
    ){

        const hand =
        results.multiHandLandmarks[0];

        const indexTip =
        hand[8];

        if(model){

            model.position.x =
                (indexTip.x - 0.5) * 100;

            model.position.y =
                -(indexTip.y - 0.5) * 100;
        }
    }
});

const cameraFeed =
new Camera(
    video,
    {
        onFrame: async()=>{
            await hands.send({
                image:video
            });
        },

        width:640,
        height:480
    }
);

cameraFeed.start();

window.addEventListener(
    "resize",
    ()=>{

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
