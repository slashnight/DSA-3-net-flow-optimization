import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { DataCenterHub, TransmissionMode } from '../types';

interface Globe3DViewProps {
  hubs: DataCenterHub[];
  selectedHub: DataCenterHub | null;
  onSelectHub: (hub: DataCenterHub | null) => void;
  transmissionMode: TransmissionMode;
  autoRotate: boolean;
  onToggleAutoRotate: () => void;
  zoomLevel: number;
  rotationSpeed?: number;
  rotationDirection?: 'left' | 'right';
}

export const Globe3DView: React.FC<Globe3DViewProps> = ({
  hubs,
  selectedHub,
  onSelectHub,
  transmissionMode,
  autoRotate,
  zoomLevel,
  rotationSpeed = 1,
  rotationDirection = 'left',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const worldGroupRef = useRef<THREE.Group | null>(null);
  const animationFrameId = useRef<number | null>(null);

  // Refs for props to avoid tearing down the WebGL scene on state updates
  const hubsRef = useRef<DataCenterHub[]>(hubs);
  const transmissionModeRef = useRef<TransmissionMode>(transmissionMode);
  const autoRotateRef = useRef<boolean>(autoRotate);
  const zoomLevelRef = useRef<number>(zoomLevel);
  const rotationSpeedRef = useRef<number>(rotationSpeed);
  const rotationDirectionRef = useRef<'left' | 'right'>(rotationDirection);
  const onSelectHubRef = useRef<(hub: DataCenterHub | null) => void>(onSelectHub);

  // Interactive node meshes reference for raycasting
  const interactiveMeshesRef = useRef<THREE.Mesh[]>([]);
  const nodeObjectsRef = useRef<{ mesh: THREE.Mesh; ring: THREE.Mesh; hub: DataCenterHub }[]>([]);
  const rippleMeshRef = useRef<THREE.Mesh | null>(null);

  // Target rotation for smooth double-tap transition
  const targetQuaternionRef = useRef<THREE.Quaternion | null>(null);
  const isTransitioningRef = useRef<boolean>(false);

  const [hoveredHub, setHoveredHub] = useState<DataCenterHub | null>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [doubleTapFeedback, setDoubleTapFeedback] = useState<{ x: number; y: number; active: boolean }>({
    x: 0,
    y: 0,
    active: false,
  });

  // Keep refs synchronized without recreating Three.js scene
  useEffect(() => {
    hubsRef.current = hubs;
  }, [hubs]);

  useEffect(() => {
    transmissionModeRef.current = transmissionMode;
  }, [transmissionMode]);

  useEffect(() => {
    autoRotateRef.current = autoRotate;
  }, [autoRotate]);

  useEffect(() => {
    rotationSpeedRef.current = rotationSpeed;
  }, [rotationSpeed]);

  useEffect(() => {
    rotationDirectionRef.current = rotationDirection;
  }, [rotationDirection]);

  useEffect(() => {
    zoomLevelRef.current = zoomLevel;
    if (cameraRef.current) {
      const targetZ = 440 / Math.max(0.5, zoomLevel);
      cameraRef.current.position.z = targetZ;
    }
  }, [zoomLevel]);

  useEffect(() => {
    onSelectHubRef.current = onSelectHub;
  }, [onSelectHub]);

  // Convert lat/lon to 3D position on sphere
  const latLonToVector3 = useCallback((lat: number, lon: number, radius: number) => {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lon + 180) * (Math.PI / 180);
    return new THREE.Vector3(
      -radius * Math.sin(phi) * Math.cos(theta),
      radius * Math.cos(phi),
      radius * Math.sin(phi) * Math.sin(theta)
    );
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    let width = container.clientWidth || 800;
    let height = container.clientHeight || 600;

    // 1. Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 2000);
    camera.position.z = 440 / Math.max(0.5, zoomLevelRef.current);
    cameraRef.current = camera;

    // 3. Renderer - Create once
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 4. Lighting
    const ambientLight = new THREE.AmbientLight(0xd4e4fa, 0.75);
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xffffff, 1.5);
    mainLight.position.set(6, 4, 8);
    scene.add(mainLight);

    const blueFill = new THREE.PointLight(0x3b82f6, 1.2, 800);
    blueFill.position.set(-15, -10, -10);
    scene.add(blueFill);

    const cyanRim = new THREE.PointLight(0x4edea3, 0.9, 600);
    cyanRim.position.set(10, -8, 12);
    scene.add(cyanRim);

    // 5. World Group
    const worldGroup = new THREE.Group();
    scene.add(worldGroup);
    worldGroupRef.current = worldGroup;

    // Globe Radius
    const R = 155;

    // Texture Loader with cache
    const textureLoader = new THREE.TextureLoader();

    // 6. Earth Base Mesh
    const earthGeo = new THREE.SphereGeometry(R, 64, 64);
    const earthMat = new THREE.MeshPhongMaterial({
      color: 0x07192f,
      specular: 0x223344,
      shininess: 25,
      bumpScale: 2,
    });

    textureLoader.load(
      'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_atmos_2048.jpg',
      (tex) => {
        tex.generateMipmaps = true;
        earthMat.map = tex;
        earthMat.color.setHex(0xffffff);
        earthMat.needsUpdate = true;
      }
    );

    textureLoader.load(
      'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_specular_2048.jpg',
      (spec) => {
        earthMat.specularMap = spec;
        earthMat.needsUpdate = true;
      }
    );

    const earthMesh = new THREE.Mesh(earthGeo, earthMat);
    worldGroup.add(earthMesh);

    // 7. Grid Overlay
    const gridGeo = new THREE.SphereGeometry(R + 0.6, 36, 18);
    const gridMat = new THREE.MeshBasicMaterial({
      color: 0x3b82f6,
      wireframe: true,
      transparent: true,
      opacity: 0.15,
    });
    const gridMesh = new THREE.Mesh(gridGeo, gridMat);
    worldGroup.add(gridMesh);

    // 8. Clouds Layer
    const cloudGeo = new THREE.SphereGeometry(R + 2.2, 64, 64);
    const cloudMat = new THREE.MeshPhongMaterial({
      transparent: true,
      opacity: 0.28,
      blending: THREE.AdditiveBlending,
    });
    textureLoader.load(
      'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_clouds_1024.png',
      (cloudTex) => {
        cloudMat.map = cloudTex;
        cloudMat.needsUpdate = true;
      }
    );
    const cloudMesh = new THREE.Mesh(cloudGeo, cloudMat);
    worldGroup.add(cloudMesh);

    // 9. Atmosphere Glow Shader
    const glowGeo = new THREE.SphereGeometry(R + 18, 64, 64);
    const glowMat = new THREE.ShaderMaterial({
      uniforms: {
        glowColor: { value: new THREE.Color(0x3b82f6) },
        viewVector: { value: camera.position },
      },
      vertexShader: `
        uniform vec3 viewVector;
        varying float intensity;
        void main() {
          gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
          vec3 actual_normal = vec3(modelMatrix * vec4(normal, 0.0));
          intensity = pow( dot(normalize(viewVector), normalize(actual_normal)), 3.8 );
        }
      `,
      fragmentShader: `
        uniform vec3 glowColor;
        varying float intensity;
        void main() {
          gl_FragColor = vec4( glowColor, intensity * 0.7 );
        }
      `,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
      transparent: true,
    });
    const atmosphere = new THREE.Mesh(glowGeo, glowMat);
    scene.add(atmosphere);

    // 10. Ripple Effect Ring Mesh (for double tap)
    const rippleGeo = new THREE.RingGeometry(1, 4, 32);
    const rippleMat = new THREE.MeshBasicMaterial({
      color: 0x4edea3,
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide,
      depthTest: false,
    });
    const rippleMesh = new THREE.Mesh(rippleGeo, rippleMat);
    rippleMesh.visible = false;
    worldGroup.add(rippleMesh);
    rippleMeshRef.current = rippleMesh;

    // 11. Hub Nodes Group
    const nodesGroup = new THREE.Group();
    worldGroup.add(nodesGroup);

    const nodeObjects: { mesh: THREE.Mesh; ring: THREE.Mesh; hub: DataCenterHub }[] = [];
    const interactiveMeshes: THREE.Mesh[] = [];

    const currentHubs = hubsRef.current;
    currentHubs.forEach((hub) => {
      const pos = latLonToVector3(hub.lat, hub.lon, R + 1.2);

      let color = 0x4edea3; // Healthy green
      if (hub.status === 'warning') color = 0xdf7412; // Orange
      if (hub.status === 'critical') color = 0xffb4ab; // Error red

      // Core Node Dot
      const coreGeo = new THREE.SphereGeometry(3.4, 16, 16);
      const coreMat = new THREE.MeshBasicMaterial({ color });
      const coreMesh = new THREE.Mesh(coreGeo, coreMat);
      coreMesh.position.copy(pos);
      coreMesh.userData = { hubCode: hub.code };
      nodesGroup.add(coreMesh);
      interactiveMeshes.push(coreMesh);

      // Pulse Ring
      const ringGeo = new THREE.RingGeometry(4.5, 7.2, 32);
      const ringMat = new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity: 0.7,
        side: THREE.DoubleSide,
      });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.position.copy(pos);
      ringMesh.lookAt(new THREE.Vector3(0, 0, 0));
      nodesGroup.add(ringMesh);

      // Node Vertical Pin
      const pinGeo = new THREE.CylinderGeometry(0.6, 0.6, 6, 8);
      const pinMat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.6 });
      const pinMesh = new THREE.Mesh(pinGeo, pinMat);
      pinMesh.position.copy(latLonToVector3(hub.lat, hub.lon, R + 3));
      pinMesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), pos.clone().normalize());
      nodesGroup.add(pinMesh);

      nodeObjects.push({ mesh: coreMesh, ring: ringMesh, hub });
    });

    interactiveMeshesRef.current = interactiveMeshes;
    nodeObjectsRef.current = nodeObjects;

    // 12. Arcs and Packets
    const arcsGroup = new THREE.Group();
    worldGroup.add(arcsGroup);

    const arcFlows: {
      packet: THREE.Mesh;
      curve: THREE.QuadraticBezierCurve3;
      speed: number;
      progress: number;
    }[] = [];

    const createArc = (start: DataCenterHub, end: DataCenterHub, colorHex: number) => {
      const v1 = latLonToVector3(start.lat, start.lon, R + 1);
      const v2 = latLonToVector3(end.lat, end.lon, R + 1);
      const dist = v1.distanceTo(v2);

      const mid = new THREE.Vector3().addVectors(v1, v2).multiplyScalar(0.5);
      mid.normalize().multiplyScalar(R + Math.min(dist * 0.35, 90));

      const curve = new THREE.QuadraticBezierCurve3(v1, mid, v2);
      const points = curve.getPoints(60);
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const material = new THREE.LineBasicMaterial({
        color: colorHex,
        transparent: true,
        opacity: 0.45,
      });
      const line = new THREE.Line(geometry, material);
      arcsGroup.add(line);

      // Packet
      const pGeo = new THREE.SphereGeometry(1.8, 12, 12);
      const pMat = new THREE.MeshBasicMaterial({
        color: colorHex,
      });
      const packet = new THREE.Mesh(pGeo, pMat);
      arcsGroup.add(packet);

      arcFlows.push({
        packet,
        curve,
        speed: 0.0015 + Math.random() * 0.002,
        progress: Math.random(),
      });
    };

    if (currentHubs.length >= 7) {
      createArc(currentHubs[0], currentHubs[1], 0x4edea3); // US to EU
      createArc(currentHubs[1], currentHubs[2], 0xadc6ff); // EU to JP
      createArc(currentHubs[2], currentHubs[3], 0xffb4ab); // JP to SG
      createArc(currentHubs[3], currentHubs[4], 0x4edea3); // SG to AU
      createArc(currentHubs[4], currentHubs[5], 0xadc6ff); // AU to SA
      createArc(currentHubs[5], currentHubs[6], 0x4edea3); // SA to ME
      createArc(currentHubs[6], currentHubs[0], 0xadc6ff); // ME to US
      if (currentHubs[7]) {
        createArc(currentHubs[1], currentHubs[7], 0x4edea3);
        createArc(currentHubs[7], currentHubs[3], 0xadc6ff);
      }
    }

    // 13. Interaction handlers
    let isDragging = false;
    let prevMouse = { x: 0, y: 0 };
    let lastTapTime = 0;
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handleMouseDown = (e: MouseEvent) => {
      isDragging = true;
      isTransitioningRef.current = false;
      prevMouse = { x: e.clientX, y: e.clientY };
    };

    const handleMouseUp = () => {
      isDragging = false;
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const clientX = e.clientX - rect.left;
      const clientY = e.clientY - rect.top;

      setMousePos({ x: e.clientX, y: e.clientY });

      if (isDragging && worldGroupRef.current) {
        const deltaX = e.clientX - prevMouse.x;
        const deltaY = e.clientY - prevMouse.y;
        worldGroupRef.current.rotation.y += deltaX * 0.005;
        worldGroupRef.current.rotation.x += deltaY * 0.005;
        worldGroupRef.current.rotation.x = Math.max(
          -Math.PI / 2.1,
          Math.min(Math.PI / 2.1, worldGroupRef.current.rotation.x)
        );
      }
      prevMouse = { x: e.clientX, y: e.clientY };

      // Raycast for hover detection
      mouse.x = (clientX / width) * 2 - 1;
      mouse.y = -(clientY / height) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);

      const intersects = raycaster.intersectObjects(interactiveMeshesRef.current);
      if (intersects.length > 0) {
        const code = intersects[0].object.userData?.hubCode;
        const foundHub = hubsRef.current.find((h) => h.code === code);
        setHoveredHub(foundHub || null);
        container.style.cursor = 'pointer';
      } else {
        setHoveredHub(null);
        container.style.cursor = isDragging ? 'grabbing' : 'grab';
      }
    };

    const handleClick = () => {
      if (hoveredHub) {
        onSelectHubRef.current(hoveredHub);
      }
    };

    // TRIGGER MOVE IN SPECIFIC DIRECTION ON DOUBLE TAP / DOUBLE CLICK
    const triggerMoveToDirection = (clientX: number, clientY: number) => {
      if (!worldGroupRef.current || !cameraRef.current) return;

      const rect = container.getBoundingClientRect();
      const relativeX = clientX - rect.left;
      const relativeY = clientY - rect.top;

      mouse.x = (relativeX / width) * 2 - 1;
      mouse.y = -(relativeY / height) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);

      // Trigger visual feedback popup
      setDoubleTapFeedback({ x: clientX, y: clientY, active: true });
      setTimeout(() => {
        setDoubleTapFeedback((prev) => ({ ...prev, active: false }));
      }, 700);

      // Check if user clicked directly on the globe sphere
      const sphereIntersects = raycaster.intersectObject(earthMesh);

      if (sphereIntersects.length > 0) {
        const hit = sphereIntersects[0];
        const hitPoint = hit.point.clone(); // in world coordinates

        // Position and animate the 3D ripple ring at the hit point
        if (rippleMeshRef.current) {
          const localHit = worldGroupRef.current.worldToLocal(hitPoint.clone());
          rippleMeshRef.current.position.copy(localHit.clone().normalize().multiplyScalar(R + 2.5));
          rippleMeshRef.current.lookAt(new THREE.Vector3(0, 0, 0));
          rippleMeshRef.current.scale.set(1, 1, 1);
          (rippleMeshRef.current.material as THREE.MeshBasicMaterial).opacity = 1;
          rippleMeshRef.current.visible = true;
        }

        // Calculate rotation quaternion to smoothly bring hit point to face the camera (along +Z)
        const hitNormal = hitPoint.clone().normalize();
        const targetNormal = new THREE.Vector3(0, 0, 1);
        const deltaQuat = new THREE.Quaternion().setFromUnitVectors(hitNormal, targetNormal);

        const targetQuat = deltaQuat.clone().multiply(worldGroupRef.current.quaternion);
        targetQuaternionRef.current = targetQuat;
        isTransitioningRef.current = true;
      } else {
        // Double clicked off-center on the outer canvas: rotate towards that direction vector
        const dirVector = new THREE.Vector3(mouse.x, mouse.y, 0).normalize();
        const rotAxis = new THREE.Vector3(-dirVector.y, dirVector.x, 0).normalize();
        const stepQuat = new THREE.Quaternion().setFromAxisAngle(rotAxis, 0.7);

        targetQuaternionRef.current = stepQuat.multiply(worldGroupRef.current.quaternion);
        isTransitioningRef.current = true;
      }
    };

    const handleDblClick = (e: MouseEvent) => {
      triggerMoveToDirection(e.clientX, e.clientY);
    };

    // Touch support for double-tap on touch devices/tablets
    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        const touch = e.touches[0];
        const now = Date.now();
        if (now - lastTapTime < 350) {
          // Double tap detected!
          triggerMoveToDirection(touch.clientX, touch.clientY);
        }
        lastTapTime = now;
        isDragging = true;
        isTransitioningRef.current = false;
        prevMouse = { x: touch.clientX, y: touch.clientY };
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (isDragging && e.touches.length === 1 && worldGroupRef.current) {
        const touch = e.touches[0];
        const deltaX = touch.clientX - prevMouse.x;
        const deltaY = touch.clientY - prevMouse.y;
        worldGroupRef.current.rotation.y += deltaX * 0.005;
        worldGroupRef.current.rotation.x += deltaY * 0.005;
        worldGroupRef.current.rotation.x = Math.max(
          -Math.PI / 2.1,
          Math.min(Math.PI / 2.1, worldGroupRef.current.rotation.x)
        );
        prevMouse = { x: touch.clientX, y: touch.clientY };
      }
    };

    const handleTouchEnd = () => {
      isDragging = false;
    };

    container.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('click', handleClick);
    container.addEventListener('dblclick', handleDblClick);
    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchmove', handleTouchMove, { passive: true });
    container.addEventListener('touchend', handleTouchEnd, { passive: true });

    // 14. Smooth Animation Loop
    let rippleScale = 1;
    let rippleOpacity = 0;

    const animate = () => {
      animationFrameId.current = requestAnimationFrame(animate);
      const time = Date.now() * 0.003;

      // Handle smooth transition to target double-tap orientation
      if (isTransitioningRef.current && targetQuaternionRef.current && worldGroupRef.current) {
        worldGroupRef.current.quaternion.slerp(targetQuaternionRef.current, 0.08);

        // Check if close enough to target
        if (worldGroupRef.current.quaternion.angleTo(targetQuaternionRef.current) < 0.01) {
          worldGroupRef.current.quaternion.copy(targetQuaternionRef.current);
          isTransitioningRef.current = false;
          targetQuaternionRef.current = null;
        }
      } else if (autoRotateRef.current && worldGroupRef.current && !isDragging) {
        const dirMultiplier = rotationDirectionRef.current === 'right' ? -1 : 1;
        worldGroupRef.current.rotation.y += 0.0012 * rotationSpeedRef.current * dirMultiplier;
      }

      cloudMesh.rotation.y += 0.0016;

      // Animate ripple ring
      if (rippleMeshRef.current && rippleMeshRef.current.visible) {
        const mat = rippleMeshRef.current.material as THREE.MeshBasicMaterial;
        rippleScale += 0.35;
        mat.opacity = Math.max(0, mat.opacity - 0.035);
        rippleMeshRef.current.scale.set(rippleScale, rippleScale, 1);
        if (mat.opacity <= 0.01) {
          rippleMeshRef.current.visible = false;
          rippleScale = 1;
        }
      }

      // Live Pulse Rings update based on latest hubs state
      const liveHubs = hubsRef.current;
      nodeObjectsRef.current.forEach((n) => {
        const currentData = liveHubs.find((h) => h.code === n.hub.code) || n.hub;
        const pulse = 1 + Math.sin(time * 2.5 + currentData.load) * 0.22;
        n.mesh.scale.set(pulse, pulse, pulse);
        n.ring.scale.set(pulse * 1.35, pulse * 1.35, 1);
        (n.ring.material as THREE.MeshBasicMaterial).opacity = 0.8 - (pulse - 0.78) * 0.5;
      });

      // Flow Packets
      const isReverse = transmissionModeRef.current === 'receive';
      arcFlows.forEach((f) => {
        if (isReverse) {
          f.progress -= f.speed;
          if (f.progress < 0) f.progress = 1;
        } else {
          f.progress += f.speed;
          if (f.progress > 1) f.progress = 0;
        }
        f.packet.position.copy(f.curve.getPointAt(f.progress));
      });

      renderer.render(scene, camera);
    };

    animate();

    // 15. Resize Observer
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width: newWidth, height: newHeight } = entry.contentRect;
        if (newWidth > 0 && newHeight > 0 && cameraRef.current && rendererRef.current) {
          width = newWidth;
          height = newHeight;
          cameraRef.current.aspect = newWidth / newHeight;
          cameraRef.current.updateProjectionMatrix();
          rendererRef.current.setSize(newWidth, newHeight);
        }
      }
    });

    resizeObserver.observe(container);

    return () => {
      if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
      resizeObserver.disconnect();
      container.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('click', handleClick);
      container.removeEventListener('dblclick', handleDblClick);
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
      renderer.dispose();
    };
  }, [latLonToVector3]);

  return (
    <div className="relative w-full h-full select-none overflow-hidden" ref={containerRef}>
      {/* Visual Double Tap Pulse Feedback */}
      {doubleTapFeedback.active && (
        <div
          className="fixed pointer-events-none z-50 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center animate-ping"
          style={{ left: doubleTapFeedback.x, top: doubleTapFeedback.y }}
        >
          <div className="w-12 h-12 rounded-full border-2 border-[#4edea3] bg-[#4edea3]/20 shadow-[0_0_20px_#4edea3]" />
        </div>
      )}

      {/* Helper Tip Badge */}
      <div className="absolute top-4 right-4 z-20 pointer-events-none bg-[#122131]/80 backdrop-blur border border-[#424754]/70 rounded-md px-2.5 py-1 text-[10px] font-mono-data text-[#8c909f]">
        Tip: <span className="text-[#adc6ff]">Double-tap / double-click</span> anywhere to align globe in that direction
      </div>

      {/* Country / Hub Floating Tooltip on 3D Globe */}
      {hoveredHub && (
        <div
          className="fixed pointer-events-none z-50 bg-[#1c2b3c]/95 backdrop-blur border border-[#424754] rounded-lg p-2.5 shadow-2xl text-[11px] font-mono-data text-[#c2c6d6] -translate-x-1/2 -translate-y-full mb-3 min-w-[200px]"
          style={{ left: mousePos.x, top: mousePos.y }}
        >
          <div className="flex items-center justify-between border-b border-[#424754] pb-1.5 mb-1.5">
            <span className="font-bold text-[#adc6ff] text-[12px]">{hoveredHub.code}</span>
            <span
              className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${
                hoveredHub.status === 'healthy'
                  ? 'bg-[#003824] text-[#4edea3]'
                  : hoveredHub.status === 'warning'
                  ? 'bg-[#502400] text-[#ffb786]'
                  : 'bg-[#690005] text-[#ffb4ab]'
              }`}
            >
              {hoveredHub.status}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[10px]">
            <div>Location: <span className="text-[#d4e4fa] font-medium">{hoveredHub.country}</span></div>
            <div>Latency: <span className="text-[#adc6ff] font-medium">{hoveredHub.ping}ms</span></div>
            <div>Load: <span className={hoveredHub.load > 85 ? 'text-[#ffb4ab]' : 'text-[#4edea3]'}>{hoveredHub.load}%</span></div>
            <div>Datacenters: <span className="text-[#d4e4fa]">{hoveredHub.dcCount}</span></div>
            <div className="col-span-2 text-[9px] text-[#8c909f] mt-0.5">
              Coords: {hoveredHub.lat.toFixed(2)}°N, {hoveredHub.lon.toFixed(2)}°E • IP: {hoveredHub.ip}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

