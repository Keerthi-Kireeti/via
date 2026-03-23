'use client';

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { PlacedCargo, BusLuggageBay, PackingResult } from '../lib/cargo-optimizer';

interface CargoBay3DProps {
  cargo: PlacedCargo[];
  bay: BusLuggageBay;
  packingResult: PackingResult;
  autoRotate?: boolean;
}

const CARGO_COLORS = [
  0xff6b6b, 0x4ecdc4, 0x45b7d1, 0xffa502, 0x95e1d3,
  0xf38181, 0xaa96da, 0xfcbad3, 0xa8d8ea, 0xff9aa2,
  0xc7dd76, 0xffeaae, 0xab68ff, 0x5dade2, 0xf8b88b,
];

export function Cargo3DVisualization({
  cargo,
  bay,
  packingResult,
  autoRotate = true,
}: CargoBay3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const cargoMeshesRef = useRef<THREE.Mesh[]>([]);
  const controlsRef = useRef({ x: 0, y: 0, isDragging: false });
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const raycasterRef = useRef(new THREE.Raycaster());
  const mouseRef = useRef(new THREE.Vector2());

  useEffect(() => {
    if (!containerRef.current) return;

    // Scene setup with fog for depth
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0f172a);
    scene.fog = new THREE.Fog(0x0f172a, 1000, 200);
    sceneRef.current = scene;

    // Camera setup
    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 10000);
    
    // Set camera based on bay dimensions
    const maxDim = Math.max(bay.length, bay.width, bay.height);
    camera.position.set(
      bay.width * 0.7,
      bay.height * 0.7,
      bay.length * 0.7
    );
    camera.lookAt(bay.width / 2, bay.height / 2, bay.length / 2);
    cameraRef.current = camera;

    // Renderer setup with better quality
    const canvas = document.createElement('canvas');
    const renderer = new THREE.WebGLRenderer({ 
      canvas,
      antialias: true,
      alpha: true,
      precision: 'highp',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowShadowMap;
    containerRef.current.appendChild(canvas);
    rendererRef.current = renderer;

    // Enhanced lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(150, 150, 150);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.far = 500;
    scene.add(directionalLight);

    // Add a point light for atmosphere
    const pointLight = new THREE.PointLight(0x00ffff, 0.3);
    pointLight.position.set(bay.width, bay.height, 0);
    scene.add(pointLight);

    // Draw luggage bay with gradient effect
    const bayGeometry = new THREE.BoxGeometry(bay.width, bay.height, bay.length);
    const bayEdges = new THREE.EdgesGeometry(bayGeometry);
    const bayLine = new THREE.LineSegments(
      bayEdges,
      new THREE.LineBasicMaterial({ 
        color: 0x00ffff,
        linewidth: 2,
        fog: false
      })
    );
    bayLine.position.set(bay.width / 2, bay.height / 2, bay.length / 2);
    scene.add(bayLine);

    // Semi-transparent bay background
    const bayMaterial = new THREE.MeshPhongMaterial({
      color: 0x1e293b,
      transparent: true,
      opacity: 0.05,
      side: THREE.BackSide,
    });
    const bayMesh = new THREE.Mesh(bayGeometry, bayMaterial);
    bayMesh.position.set(bay.width / 2, bay.height / 2, bay.length / 2);
    scene.add(bayMesh);

    // Draw cargo boxes
    const cargoMeshes: THREE.Mesh[] = [];

    cargo.forEach((item, index) => {
      const cargoGeometry = new THREE.BoxGeometry(
        item.width,
        item.height,
        item.length
      );

      const colorIndex = index % CARGO_COLORS.length;
      const cargoMaterial = new THREE.MeshPhongMaterial({
        color: CARGO_COLORS[colorIndex],
        emissive: 0x001a4d,
        shininess: 100,
        flatShading: false,
        side: THREE.FrontSide,
      });

      const cargoMesh = new THREE.Mesh(cargoGeometry, cargoMaterial);
      cargoMesh.userData = {
        cargoId: item.id,
        originalColor: CARGO_COLORS[colorIndex],
        originalEmissive: 0x001a4d,
        index,
      };

      // Position cargo
      cargoMesh.position.set(
        item.position.x + item.width / 2,
        item.position.y + item.height / 2,
        item.position.z + item.length / 2
      );

      cargoMesh.castShadow = true;
      cargoMesh.receiveShadow = true;

      // Add edges for clarity
      const edges = new THREE.EdgesGeometry(cargoGeometry);
      const lineSegments = new THREE.LineSegments(
        edges,
        new THREE.LineBasicMaterial({ 
          color: 0xffffff,
          linewidth: 1,
          fog: false
        })
      );
      cargoMesh.add(lineSegments);

      scene.add(cargoMesh);
      cargoMeshes.push(cargoMesh);
    });

    cargoMeshesRef.current = cargoMeshes;

    // Mouse interaction
    const onMouseMove = (event: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouseRef.current.x = ((event.clientX - rect.left) / width) * 2 - 1;
      mouseRef.current.y = -((event.clientY - rect.top) / height) * 2 + 1;

      // Handle dragging for rotation
      if (controlsRef.current.isDragging) {
        const deltaX = event.movementX * 0.01;
        const deltaY = event.movementY * 0.01;
        
        if (camera) {
          const pos = camera.position;
          const radius = Math.sqrt(pos.x ** 2 + pos.y ** 2 + pos.z ** 2);
          const theta = Math.atan2(pos.z, pos.x) - deltaX;
          const phi = Math.acos(pos.y / radius) + deltaY;
          const clampedPhi = Math.max(0.1, Math.min(Math.PI - 0.1, phi));
          
          camera.position.x = radius * Math.sin(clampedPhi) * Math.cos(theta);
          camera.position.y = radius * Math.cos(clampedPhi);
          camera.position.z = radius * Math.sin(clampedPhi) * Math.sin(theta);
          camera.lookAt(bay.width / 2, bay.height / 2, bay.length / 2);
        }
      }

      // Raycasting for hover effects
      raycasterRef.current.setFromCamera(mouseRef.current, camera);
      const intersects = raycasterRef.current.intersectObjects(cargoMeshes);

      cargoMeshes.forEach((mesh) => {
        (mesh.material as THREE.MeshPhongMaterial).emissive.setHex(
          mesh.userData.originalEmissive
        );
      });

      if (intersects.length > 0) {
        const hovered = intersects[0].object as THREE.Mesh;
        (hovered.material as THREE.MeshPhongMaterial).emissive.setHex(0x00d4ff);
        setHoveredId(hovered.userData.cargoId);
      } else {
        setHoveredId(null);
      }
    };

    const onMouseDown = () => {
      controlsRef.current.isDragging = true;
    };

    const onMouseUp = () => {
      controlsRef.current.isDragging = false;
    };

    renderer.domElement.addEventListener('mousemove', onMouseMove);
    renderer.domElement.addEventListener('mousedown', onMouseDown);
    renderer.domElement.addEventListener('mouseup', onMouseUp);
    renderer.domElement.addEventListener('mouseleave', onMouseUp);

    // Animation loop
    let animationFrameId: number;
    let time = 0;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      time += 0.016;

      // Auto-rotate if enabled and not dragging
      if (autoRotate && !controlsRef.current.isDragging) {
        const pos = camera.position;
        const radius = Math.sqrt(pos.x ** 2 + pos.y ** 2 + pos.z ** 2);
        const theta = Math.atan2(pos.z, pos.x) + 0.0005;
        const phi = Math.acos(pos.y / radius);
        
        camera.position.x = radius * Math.sin(phi) * Math.cos(theta);
        camera.position.z = radius * Math.sin(phi) * Math.sin(theta);
        camera.lookAt(bay.width / 2, bay.height / 2, bay.length / 2);
      }

      // Subtle animations for cargo
      cargoMeshes.forEach((mesh) => {
        const baseY = mesh.position.y;
        mesh.position.y = baseY + Math.sin(time * 1.5 + mesh.userData.index) * 0.5;
        mesh.rotation.x += 0.0005;
        mesh.rotation.y += 0.0008;
      });

      renderer.render(scene, camera);
    };

    animate();

    // Handle window resize
    const onWindowResize = () => {
      if (!containerRef.current) return;
      const newWidth = containerRef.current.clientWidth;
      const newHeight = containerRef.current.clientHeight;

      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };

    window.addEventListener('resize', onWindowResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', onWindowResize);
      renderer.domElement.removeEventListener('mousemove', onMouseMove);
      renderer.domElement.removeEventListener('mousedown', onMouseDown);
      renderer.domElement.removeEventListener('mouseup', onMouseUp);
      renderer.domElement.removeEventListener('mouseleave', onMouseUp);
      cancelAnimationFrame(animationFrameId);
      containerRef.current?.removeChild(canvas);
      bayGeometry.dispose();
      bayMaterial.dispose();
      cargoMeshes.forEach((mesh) => {
        (mesh.geometry as THREE.BufferGeometry).dispose();
        (mesh.material as THREE.Material).dispose();
      });
      renderer.dispose();
    };
  }, [cargo, bay, autoRotate]);

  return (
    <div 
      ref={containerRef} 
      className="w-full h-full rounded-xl cursor-grab active:cursor-grabbing"
      style={{ userSelect: 'none' }}
    />
  );
}

// Get proper references for cleanup - this is a simplified version
const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshPhongMaterial({ color: 0xff0000 });
