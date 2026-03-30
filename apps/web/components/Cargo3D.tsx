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

    // Renderer setup with better performance
    const canvas = document.createElement('canvas');
    const renderer = new THREE.WebGLRenderer({ 
      canvas,
      antialias: false, // Disabled for performance
      alpha: true,
      powerPreference: 'high-performance',
      precision: 'lowp', // Reduced precision for speed
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(1); // Force 1 for speed, avoid high DPI lag
    renderer.shadowMap.enabled = false; // Disable shadows for massive speed boost
    containerRef.current.appendChild(canvas);
    rendererRef.current = renderer;

    // Enhanced lighting - simplified
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
    directionalLight.position.set(100, 100, 100);
    scene.add(directionalLight);

    // Add a point light for atmosphere - simplified
    const pointLight = new THREE.PointLight(0x00ffff, 0.2);
    pointLight.position.set(bay.width, bay.height, 0);
    scene.add(pointLight);

    // Draw luggage bay with simplified effect
    const bayGeometry = new THREE.BoxGeometry(bay.width, bay.height, bay.length);
    const bayEdges = new THREE.EdgesGeometry(bayGeometry);
    const bayLine = new THREE.LineSegments(
      bayEdges,
      new THREE.LineBasicMaterial({ 
        color: 0x00ffff,
        transparent: true,
        opacity: 0.5,
        fog: false
      })
    );
    bayLine.position.set(bay.width / 2, bay.height / 2, bay.length / 2);
    scene.add(bayLine);

    // Semi-transparent bay background - simplified
    const bayMaterial = new THREE.MeshBasicMaterial({
      color: 0x1e293b,
      transparent: true,
      opacity: 0.05,
      side: THREE.BackSide,
    });
    const bayMesh = new THREE.Mesh(bayGeometry, bayMaterial);
    bayMesh.position.set(bay.width / 2, bay.height / 2, bay.length / 2);
    scene.add(bayMesh);

    // Use shared geometries and materials for cargo to save memory
    const cargoGeometryCache = new Map<string, THREE.BoxGeometry>();
    const cargoMeshes: THREE.Mesh[] = [];

    cargo.forEach((item, index) => {
      const geoKey = `${item.width}-${item.height}-${item.length}`;
      let cargoGeometry = cargoGeometryCache.get(geoKey);
      if (!cargoGeometry) {
        cargoGeometry = new THREE.BoxGeometry(item.width, item.height, item.length);
        cargoGeometryCache.set(geoKey, cargoGeometry);
      }

      const colorIndex = index % CARGO_COLORS.length;
      const cargoMaterial = new THREE.MeshLambertMaterial({ // Lighter than Phong
        color: CARGO_COLORS[colorIndex],
        emissive: 0x001a4d,
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

      // Add edges for clarity - simplified
      const edges = new THREE.EdgesGeometry(cargoGeometry);
      const lineSegments = new THREE.LineSegments(
        edges,
        new THREE.LineBasicMaterial({ 
          color: 0xffffff,
          transparent: true,
          opacity: 0.3,
          fog: false
        })
      );
      cargoMesh.add(lineSegments);

      scene.add(cargoMesh);
      cargoMeshes.push(cargoMesh);
    });

    cargoMeshesRef.current = cargoMeshes;

    // Mouse interaction - throttled/simplified
    const onMouseMove = (event: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouseRef.current.x = ((event.clientX - rect.left) / width) * 2 - 1;
      mouseRef.current.y = -((event.clientY - rect.top) / height) * 2 + 1;

      // Handle dragging for rotation
      if (controlsRef.current.isDragging) {
        const deltaX = event.movementX * 0.015; // Faster rotation
        const deltaY = event.movementY * 0.015;
        
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

      // Raycasting - only if not dragging
      if (!controlsRef.current.isDragging) {
        raycasterRef.current.setFromCamera(mouseRef.current, camera);
        const intersects = raycasterRef.current.intersectObjects(cargoMeshes);

        cargoMeshes.forEach((mesh) => {
          (mesh.material as THREE.MeshLambertMaterial).emissive.setHex(
            mesh.userData.originalEmissive
          );
        });

        if (intersects.length > 0) {
          const hovered = intersects[0].object as THREE.Mesh;
          (hovered.material as THREE.MeshLambertMaterial).emissive.setHex(0x00d4ff);
          setHoveredId(hovered.userData.cargoId);
        } else {
          setHoveredId(null);
        }
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

      // Auto-rotate if enabled and not dragging - DISABLED as per user request
      /*
      if (autoRotate && !controlsRef.current.isDragging) {
        const pos = camera.position;
        const radius = Math.sqrt(pos.x ** 2 + pos.y ** 2 + pos.z ** 2);
        const theta = Math.atan2(pos.z, pos.x) + 0.0015; // Faster auto-rotate
        const phi = Math.acos(pos.y / radius);
        
        camera.position.x = radius * Math.sin(phi) * Math.cos(theta);
        camera.position.z = radius * Math.sin(phi) * Math.sin(theta);
        camera.lookAt(bay.width / 2, bay.height / 2, bay.length / 2);
      }
      */

      // Smooth subtle animations for cargo - DISABLED as per user request
      /*
      cargoMeshes.forEach((mesh) => {
        mesh.position.y += Math.sin(time * 2.0 + mesh.userData.index) * 0.05; 
        mesh.rotation.x += 0.001;
        mesh.rotation.y += 0.0015;
      });
      */

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
      cargoGeometryCache.forEach(geo => geo.dispose());
      cargoMeshes.forEach((mesh) => {
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
