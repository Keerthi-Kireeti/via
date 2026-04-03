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
  const controlsRef = useRef({ x: 0, y: 0, isDragging: false, isMovingCargo: false, activeCargoMesh: null as THREE.Mesh | null });
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const raycasterRef = useRef(new THREE.Raycaster());
  const mouseRef = useRef(new THREE.Vector2());
  const lightsRef = useRef<{ ambient?: THREE.AmbientLight; bayLine?: THREE.LineSegments; bayFloor?: THREE.Mesh; cargoMeshes?: THREE.Mesh[] }>({});

  useEffect(() => {
    if (!containerRef.current) return;

    // Detect theme (dark/light)
    const isDarkMode = document.documentElement.classList.contains('dark') || 
                       window.matchMedia('(prefers-color-scheme: dark)').matches;

    // Scene setup - No fog for maximum clarity
    const scene = new THREE.Scene();
    scene.background = isDarkMode ? new THREE.Color(0x0f172a) : new THREE.Color(0xf8fafc);
    sceneRef.current = scene;

    // Camera setup
    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;
    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 10000); // Slightly narrower FOV for less distortion
    
    // Set camera based on bay dimensions
    camera.position.set(
      bay.width * 1.5,
      bay.height * 1.5,
      bay.length * 1.5
    );
    camera.lookAt(bay.width / 2, bay.height / 2, bay.length / 2);
    cameraRef.current = camera;

    // Renderer setup with high quality
    const canvas = document.createElement('canvas');
    const renderer = new THREE.WebGLRenderer({ 
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
      precision: 'highp',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    containerRef.current.appendChild(canvas);
    rendererRef.current = renderer;

    // Enhanced lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, isDarkMode ? 0.6 : 0.8);
    scene.add(ambientLight);
    lightsRef.current.ambient = ambientLight;

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
    directionalLight.position.set(200, 300, 200);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.far = 2000;
    scene.add(directionalLight);

    // Add a point light for vibrant colors
    const pointLight = new THREE.PointLight(0x00ffff, 0.5);
    pointLight.position.set(bay.width, bay.height, 0);
    scene.add(pointLight);

    // Draw luggage bay
    const bayGeometry = new THREE.BoxGeometry(bay.width, bay.height, bay.length);
    const bayEdges = new THREE.EdgesGeometry(bayGeometry);
    const bayLine = new THREE.LineSegments(
      bayEdges,
      new THREE.LineBasicMaterial({ 
        color: isDarkMode ? 0x00ffff : 0x0ea5e9,
        transparent: true,
        opacity: 0.4,
      })
    );
    bayLine.position.set(bay.width / 2, bay.height / 2, bay.length / 2);
    scene.add(bayLine);
    lightsRef.current.bayLine = bayLine;

    // Semi-transparent bay floor (receive shadows)
    const bayFloorGeometry = new THREE.PlaneGeometry(bay.width, bay.length);
    const bayFloorMaterial = new THREE.MeshPhongMaterial({
      color: isDarkMode ? 0x1e293b : 0xe2e8f0,
      transparent: true,
      opacity: 0.1,
      side: THREE.DoubleSide,
    });
    const bayFloor = new THREE.Mesh(bayFloorGeometry, bayFloorMaterial);
    bayFloor.rotation.x = -Math.PI / 2;
    bayFloor.position.set(bay.width / 2, 0, bay.length / 2);
    bayFloor.receiveShadow = true;
    scene.add(bayFloor);
    lightsRef.current.bayFloor = bayFloor;

    // Use shared geometries and materials for cargo
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
      const cargoMaterial = new THREE.MeshPhongMaterial({
        color: CARGO_COLORS[colorIndex],
        emissive: isDarkMode ? 0x001a4d : 0x000000,
        emissiveIntensity: 0.1,
        shininess: 60,
        specular: 0x444444,
        side: THREE.FrontSide,
      });

      const cargoMesh = new THREE.Mesh(cargoGeometry, cargoMaterial);
      cargoMesh.userData = {
        cargoId: item.id,
        originalColor: CARGO_COLORS[colorIndex],
        originalEmissive: isDarkMode ? 0x001a4d : 0x000000,
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
          color: isDarkMode ? 0xffffff : 0x000000,
          transparent: true,
          opacity: 0.2,
        })
      );
      cargoMesh.add(lineSegments);

      scene.add(cargoMesh);
      cargoMeshes.push(cargoMesh);
    });

    cargoMeshesRef.current = cargoMeshes;
    lightsRef.current.cargoMeshes = cargoMeshes;

    // Plane for dragging cargo
    const dragPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(10000, 10000),
      new THREE.MeshBasicMaterial({ visible: false })
    );
    scene.add(dragPlane);

    // Interaction state for touch
    let lastTouchX = 0;
    let lastTouchY = 0;

    // Mouse/Touch interaction
    const onMouseMove = (event: MouseEvent | TouchEvent) => {
      if (!rendererRef.current || !cameraRef.current) return;

      const rect = rendererRef.current.domElement.getBoundingClientRect();
      let clientX, clientY, movementX, movementY;

      if ('touches' in event) {
        if (event.touches.length === 0) return;
        clientX = event.touches[0].clientX;
        clientY = event.touches[0].clientY;
        movementX = clientX - lastTouchX;
        movementY = clientY - lastTouchY;
        lastTouchX = clientX;
        lastTouchY = clientY;
      } else {
        clientX = event.clientX;
        clientY = event.clientY;
        movementX = event.movementX;
        movementY = event.movementY;
      }

      mouseRef.current.x = ((clientX - rect.left) / width) * 2 - 1;
      mouseRef.current.y = -((clientY - rect.top) / height) * 2 + 1;

      // Handle dragging for rotation
      if (controlsRef.current.isDragging && !('ctrlKey' in event && event.ctrlKey)) {
        const deltaX = movementX * 0.008; 
        const deltaY = movementY * 0.008;
        
        const pos = cameraRef.current.position;
        const radius = Math.sqrt(pos.x ** 2 + pos.y ** 2 + pos.z ** 2);
        const theta = Math.atan2(pos.z, pos.x) - deltaX;
        const phi = Math.acos(pos.y / radius) + deltaY;
        const clampedPhi = Math.max(0.1, Math.min(Math.PI - 0.1, phi));
        
        cameraRef.current.position.x = radius * Math.sin(clampedPhi) * Math.cos(theta);
        cameraRef.current.position.y = radius * Math.cos(clampedPhi);
        cameraRef.current.position.z = radius * Math.sin(clampedPhi) * Math.sin(theta);
        cameraRef.current.lookAt(bay.width / 2, bay.height / 2, bay.length / 2);
      }

      // Handle Cargo Movement (Ctrl + Drag)
      if (controlsRef.current.isMovingCargo && controlsRef.current.activeCargoMesh) {
        raycasterRef.current.setFromCamera(mouseRef.current, cameraRef.current);
        const intersects = raycasterRef.current.intersectObject(dragPlane);
        
        if (intersects.length > 0) {
          const point = intersects[0].point;
          controlsRef.current.activeCargoMesh.position.copy(point);
        }
      }

      // Raycasting
      if (!controlsRef.current.isDragging && !controlsRef.current.isMovingCargo) {
        raycasterRef.current.setFromCamera(mouseRef.current, cameraRef.current);
        const intersects = raycasterRef.current.intersectObjects(cargoMeshes);

        cargoMeshes.forEach((mesh) => {
          const mat = mesh.material as THREE.MeshPhongMaterial;
          if (mat && mat.emissive) {
            mat.emissive.setHex(mesh.userData.originalEmissive);
          }
        });

        if (intersects.length > 0) {
          const hovered = intersects[0].object as THREE.Mesh;
          const mat = hovered.material as THREE.MeshPhongMaterial;
          if (mat && mat.emissive) {
            mat.emissive.setHex(0x00d4ff);
            setHoveredId(hovered.userData.cargoId);
          }
        } else {
          setHoveredId(null);
        }
      }
    };

    const onMouseDown = (event: MouseEvent | TouchEvent) => {
      if (!cameraRef.current) return;

      let clientX, clientY;
      if ('touches' in event) {
        if (event.touches.length === 0) return;
        clientX = event.touches[0].clientX;
        clientY = event.touches[0].clientY;
        lastTouchX = clientX;
        lastTouchY = clientY;
      } else {
        clientX = event.clientX;
        clientY = event.clientY;
      }

      if ('ctrlKey' in event && event.ctrlKey) {
        raycasterRef.current.setFromCamera(mouseRef.current, cameraRef.current);
        const intersects = raycasterRef.current.intersectObjects(cargoMeshes);
        
        if (intersects.length > 0) {
          controlsRef.current.isMovingCargo = true;
          controlsRef.current.activeCargoMesh = intersects[0].object as THREE.Mesh;
          
          // Align drag plane to face camera and pass through the object
          dragPlane.position.copy(controlsRef.current.activeCargoMesh.position);
          dragPlane.lookAt(cameraRef.current.position);
          
          containerRef.current?.classList.add('cursor-move');
        }
      } else {
        controlsRef.current.isDragging = true;
      }
    };

    const onMouseUp = () => {
      controlsRef.current.isDragging = false;
      controlsRef.current.isMovingCargo = false;
      controlsRef.current.activeCargoMesh = null;
      containerRef.current?.classList.remove('cursor-move');
    };

    // Zoom interaction (Wheel)
    const onWheel = (event: WheelEvent) => {
      if (!cameraRef.current) return;
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) return;
      
      // Only prevent default if scrolling over the canvas
      event.preventDefault();

      const pos = cameraRef.current.position;
      const radius = Math.sqrt(pos.x ** 2 + pos.y ** 2 + pos.z ** 2);
      
      // Calculate new radius with zoom factor
      const zoomFactor = 1.1;
      let newRadius = event.deltaY > 0 ? radius * zoomFactor : radius / zoomFactor;
      
      // Clamp zoom limits based on bay size
      const minRadius = Math.max(bay.width, bay.height, bay.length) * 0.5;
      const maxRadius = Math.max(bay.width, bay.height, bay.length) * 5;
      newRadius = Math.max(minRadius, Math.min(maxRadius, newRadius));
      
      const ratio = newRadius / radius;
      cameraRef.current.position.x *= ratio;
      cameraRef.current.position.y *= ratio;
      cameraRef.current.position.z *= ratio;
      cameraRef.current.lookAt(bay.width / 2, bay.height / 2, bay.length / 2);
    };

    renderer.domElement.addEventListener('mousemove', onMouseMove);
    renderer.domElement.addEventListener('mousedown', onMouseDown);
    renderer.domElement.addEventListener('mouseup', onMouseUp);
    renderer.domElement.addEventListener('mouseleave', onMouseUp);
    renderer.domElement.addEventListener('touchstart', onMouseDown, { passive: false });
    renderer.domElement.addEventListener('touchmove', onMouseMove, { passive: false });
    renderer.domElement.addEventListener('touchend', onMouseUp);
    renderer.domElement.addEventListener('wheel', onWheel, { passive: false });

    // Animation loop
    let animationFrameId: number;
    let time = 0;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      time += 0.016;

      // Auto-rotate if enabled and not dragging - slightly faster
      if (autoRotate && !controlsRef.current.isDragging && !controlsRef.current.isMovingCargo) {
        const pos = camera.position;
        const radius = Math.sqrt(pos.x ** 2 + pos.y ** 2 + pos.z ** 2);
        const theta = Math.atan2(pos.z, pos.x) + 0.0015; // Faster auto-rotate
        const phi = Math.acos(pos.y / radius);
        
        camera.position.x = radius * Math.sin(phi) * Math.cos(theta);
        camera.position.z = radius * Math.sin(phi) * Math.sin(theta);
        camera.lookAt(bay.width / 2, bay.height / 2, bay.length / 2);
      }

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
      if (rendererRef.current) {
        rendererRef.current.domElement.removeEventListener('mousemove', onMouseMove);
        rendererRef.current.domElement.removeEventListener('mousedown', onMouseDown);
        rendererRef.current.domElement.removeEventListener('mouseup', onMouseUp);
        rendererRef.current.domElement.removeEventListener('mouseleave', onMouseUp);
        rendererRef.current.domElement.removeEventListener('wheel', onWheel);
      }
      cancelAnimationFrame(animationFrameId);
      containerRef.current?.removeChild(canvas);
      bayGeometry.dispose();
      bayLine.geometry.dispose();
      (bayLine.material as THREE.Material).dispose();
      bayFloorGeometry.dispose();
      bayFloorMaterial.dispose();
      cargoGeometryCache.forEach(geo => geo.dispose());
      cargoMeshes.forEach((mesh) => {
        if (mesh.material) (mesh.material as THREE.Material).dispose();
        if (mesh.geometry) (mesh.geometry as THREE.BufferGeometry).dispose();
      });
      if (rendererRef.current) rendererRef.current.dispose();
    };
  }, [cargo, bay, autoRotate]);

  // Handle theme changes
  useEffect(() => {
    const updateSceneTheme = () => {
      if (!sceneRef.current || !lightsRef.current.ambient) return;

      const isDarkMode = document.documentElement.classList.contains('dark');

      // Update scene background
      sceneRef.current.background = isDarkMode
        ? new THREE.Color(0x0f172a)
        : new THREE.Color(0xf8fafc);

      // Update ambient light intensity
      lightsRef.current.ambient.intensity = isDarkMode ? 0.6 : 0.8;

      // Update bay line color
      if (lightsRef.current.bayLine) {
        const material = lightsRef.current.bayLine.material as THREE.LineBasicMaterial;
        if (material) {
          material.color.setHex(isDarkMode ? 0x00ffff : 0x0ea5e9);
        }
      }

      // Update bay floor color
      if (lightsRef.current.bayFloor) {
        const material = lightsRef.current.bayFloor.material as THREE.MeshPhongMaterial;
        if (material) {
          material.color.setHex(isDarkMode ? 0x1e293b : 0xe2e8f0);
        }
      }

      // Update cargo meshes and their edges
      if (lightsRef.current.cargoMeshes) {
        lightsRef.current.cargoMeshes.forEach((mesh) => {
          const material = mesh.material as THREE.MeshPhongMaterial;
          if (material) {
            material.emissive.setHex(isDarkMode ? 0x001a4d : 0x000000);
          }

          // Update edge colors
          mesh.children.forEach((child: THREE.Object3D) => {
            if (child instanceof THREE.LineSegments) {
              const lineMaterial = child.material as THREE.LineBasicMaterial;
              if (lineMaterial) {
                lineMaterial.color.setHex(isDarkMode ? 0xffffff : 0x000000);
              }
            }
          });
        });
      }
    };

    // Check for theme changes periodically and via MutationObserver
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
          updateSceneTheme();
        }
      });
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => {
      observer.disconnect();
    };
  }, []);

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
