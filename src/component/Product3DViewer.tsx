import React from "react";
import { Canvas } from "@react-three/fiber";
import { Center, OrbitControls, useGLTF } from "@react-three/drei";
import { CharmPlacement, Vector3Tuple } from "../services/designService";

type ModelProps = {
  url: string;
  position?: Vector3Tuple;
  rotation?: Vector3Tuple;
  scale?: Vector3Tuple;
};

const GLTFModel: React.FC<ModelProps> = ({
  url,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = [1, 1, 1],
}) => {
  const { scene } = useGLTF(url);
  const clonedScene = React.useMemo(() => scene.clone(), [scene]);

  return (
    <primitive object={clonedScene} position={position} rotation={rotation} scale={scale} />
  );
};

interface Product3DViewerProps {
  baseModel: string;
  charms?: CharmPlacement[];
  backgroundColor?: string;
}

const Product3DViewer: React.FC<Product3DViewerProps> = ({
  baseModel,
  charms = [],
  backgroundColor = "#0f111a",
}) => {
  React.useEffect(() => {
    if (baseModel) {
      useGLTF.preload(baseModel);
    }

    charms.forEach((charm) => {
      if (charm.modelPath) {
        useGLTF.preload(charm.modelPath);
      }
    });
  }, [baseModel, charms]);

  return (
    <div className="design-viewer-frame">
      <Canvas camera={{ position: [0, 1.4, 4], fov: 45 }} style={{ width: "100%", height: "100%" }}>
        <color attach="background" args={[backgroundColor]} />
        <ambientLight intensity={0.7} />
        <directionalLight position={[4, 6, 5]} intensity={1} />

        <React.Suspense
          fallback={
            <mesh>
              <boxGeometry args={[1, 1, 1]} />
              <meshStandardMaterial color="#2f343f" />
            </mesh>
          }
        >
          <Center>
            <GLTFModel url={baseModel} scale={[1.5, 1.5, 1.5]} />
          </Center>

          {charms.map((charm) => (
            <GLTFModel
              key={charm.id}
              url={charm.modelPath}
              position={charm.position}
              rotation={charm.rotation}
              scale={charm.scale}
            />
          ))}
        </React.Suspense>

        <OrbitControls enableDamping />
      </Canvas>
    </div>
  );
};

export default Product3DViewer;
