import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { MeshSurfaceSampler } from 'three/examples/jsm/math/MeshSurfaceSampler.js';
import * as THREE from 'three'
import vertexShader from './shader/vertexShader.glsl'
import fragmentShader from './shader/fragmentShader.glsl'
import gsap from 'gsap'

class Model {
    constructor(obj) {
        // console.log(obj);
        this.name = obj.name;
        this.file = obj.file;
        this.scene = obj.scene;
        this.color1 = obj.color1;
        this.color2 = obj.color2;
        this.background = obj.background;
        this.placeOnLoad = obj.placeOnLoad;
        this.loader = new GLTFLoader();
        this.dracoLoader = new DRACOLoader();
        this.dracoLoader.setDecoderPath('./draco/');
        this.loader.setDRACOLoader(this.dracoLoader);

        this.isActive = false;

        this.init();
    }

    init() {
        this.geometries = []; // Initialize geometries array
        this.points = [];     // Initialize points array to store created Points
    
        this.loader.load(this.file, (response) => {
            console.log(response.scene.children[0]);
    
            this.mesh = response.scene.children[0];
    
            this.material = new THREE.MeshBasicMaterial({
                color: 'red',
                wireframe: true
            });
    
            this.particlesMaterial = new THREE.ShaderMaterial({
                uniforms: {
                    uColor1: {value : new THREE.Color(this.color1)},
                    uColor2: {value : new THREE.Color(this.color2)},
                    uTime: {value : 0},
                    uScale: {value : 0}
                },
                vertexShader: vertexShader,
                fragmentShader: fragmentShader,
                transparent: true,
                depthTest: false,
                depthWrite: false,
                blending: THREE.AdditiveBlending
            });
    
            // Handle group or single mesh
            if (this.mesh instanceof THREE.Group) {
                this.mesh.traverse((child) => {
                    if (child.isMesh) {
                        this.createParticlesFromMesh(child);
                    }
                });
            } else {
                this.createParticlesFromMesh(this.mesh);
            }
    
            // Add the created points if placeOnLoad is true
            this.createPoints()
            if (this.placeOnLoad) {
                this.add();
            }
        });
    }
    
    createParticlesFromMesh(mesh) {
        // Ensure the mesh has geometry
        if (!mesh.geometry) return;
    
        const sampler = new MeshSurfaceSampler(mesh).build();
        const numberOfParticles = 20000; // Adjust as needed
        const particlesPosition = new Float32Array(numberOfParticles * 3);
        const particlesPositionRandomness = new Float32Array(numberOfParticles * 3);
    
        // Sample positions from the mesh surface
        for (let i = 0; i < numberOfParticles; i++) {
            const newPosition = new THREE.Vector3();
            sampler.sample(newPosition);
            particlesPosition.set([newPosition.x, newPosition.y, newPosition.z], i * 3);

            particlesPositionRandomness.set([Math.random() * 2 -1, Math.random() * 2 -1, Math.random() * 2 -1], i * 3)
        }
    
        // Create BufferGeometry for the particles
        const particlesGeometry = new THREE.BufferGeometry();
        particlesGeometry.setAttribute('position', new THREE.BufferAttribute(particlesPosition, 3));
        particlesGeometry.setAttribute('aRandom', new THREE.BufferAttribute(particlesPositionRandomness, 3));
    
        // Store the geometry and create Points
        this.geometries.push(particlesGeometry);
    }
    
    
    createPoints() {
        this.geometries.forEach((geometry) => {
            const points = new THREE.Points(geometry, this.particlesMaterial);
            this.points.push(points); // Store each Points instance
        });
    }
    
    add() {
        this.points.forEach((points) => {
            this.scene.add(points); // Add all Points to the scene
        });

        
        gsap.to(this.particlesMaterial.uniforms.uScale, {
            value: 1,
            duration: 0.8,
            delay: 0.3,
            ease: 'power3.out'
        })

        gsap.to('body', {
            background: this.background
        })

      

        this.isActive = true;

    }
    
    remove() {
        gsap.to(this.particlesMaterial.uniforms.uScale, {
            value: 0,
            duration: 0.5,
            ease: 'power3.out',
            onComplete: () => {
                this.points.forEach((points) => {
                    this.scene.remove(points); // Remove all Points from the scene
                });
        
                this.isActive = false;
            }
        })
    }
    
}

export default Model;