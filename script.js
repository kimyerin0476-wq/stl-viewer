import * as THREE from "https://unpkg.com/three@0.161.0/build/three.module.js";
import { STLLoader } from "https://unpkg.com/three@0.161.0/examples/jsm/loaders/STLLoader.js";

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb);

const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    5000
);

camera.position.z = 150;

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

let model = null;

const loader =
new STLLoader();

document
.getElementById("stlUpload")
.addEventListener(
    "change",
    (event)=>{

        const file =
        event.target.files[0];

        if(!file) return;

        const reader =
        new FileReader();

        reader.onload =
        function(e){

            try{

                const geometry =
                loader.parse(
                    e.target.result
                );

                geometry.center();

                if(model){

                    scene.remove(model);
                }

                model =
                new THREE.Mesh(

                    geometry,

                    new THREE.MeshPhongMaterial({

                        color:0x4aa3ff,

                        shininess:100
                    })
                );

                const box =
                new THREE.Box3()
                .setFromObject(model);

                const size =
                box.getSize(
                    new THREE.Vector3()
                );

                const maxDim =
                Math.max(
                    size.x,
                    size.y,
                    size.z
                );

                const scale =
                50 / maxDim;

                model.scale.set(
                    scale,
                    scale,
                    scale
                );

                scene.add(model);

            }catch(error){

                console.error(error);

                alert(
                    "STL 파일 로드 실패"
                );
            }
        };

        reader.readAsArrayBuffer(
            file
        );
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

hands.onResults((results)=>{

    if(
        !results.multiHandLandmarks ||
        results.multiHandLandmarks.length===0
    ){
        return;
    }

    const hand =
    results.multiHandLandmarks[0];

    const index =
    hand[8];

    if(model){

        model.position.x =
        (index.x - 0.5) * 100;

        model.position.y =
        -(index.y - 0.5) * 100;
    }
});

const webcam =
new Camera(
    video,
    {
        onFrame:async()=>{

            await hands.send({
                image:video
            });
        },

        width:640,
        height:480
    }
);

webcam.start();

function animate(){

    requestAnimationFrame(
        animate
    );

    if(model){

        model.rotation.y += 0.005;
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
        window.innerWidth /
        window.innerHeight;

        camera.updateProjectionMatrix();

        renderer.setSize(
            window.innerWidth,
            window.innerHeight
        );
    }
);
