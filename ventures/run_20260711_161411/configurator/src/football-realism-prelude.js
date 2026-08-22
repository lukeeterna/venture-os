import * as THREE from "three";

if (!window.__footballRealismCaptureInstalled) {
  const sceneAdd = THREE.Scene.prototype.add;
  THREE.Scene.prototype.add = function (...objects) {
    const names = objects.map((object) => object?.name).filter(Boolean);
    if (names.includes("football-kit") || names.includes("customization-decals")) {
      window.__footballRealismScene = this;
    }
    return sceneAdd.apply(this, objects);
  };

  const capturePerspectiveCamera = (camera) => {
    if (camera?.isPerspectiveCamera) window.__footballRealismCamera = camera;
  };

  const cameraLookAt = THREE.PerspectiveCamera.prototype.lookAt;
  THREE.PerspectiveCamera.prototype.lookAt = function (...args) {
    capturePerspectiveCamera(this);
    return cameraLookAt.apply(this, args);
  };

  const cameraProjection = THREE.PerspectiveCamera.prototype.updateProjectionMatrix;
  THREE.PerspectiveCamera.prototype.updateProjectionMatrix = function (...args) {
    capturePerspectiveCamera(this);
    return cameraProjection.apply(this, args);
  };

  const rendererRender = THREE.WebGLRenderer.prototype.render;
  THREE.WebGLRenderer.prototype.render = function (renderScene, camera) {
    if (renderScene?.isScene && camera?.isPerspectiveCamera) {
      if (renderScene.getObjectByName?.("football-kit")) window.__footballRealismScene = renderScene;
      capturePerspectiveCamera(camera);
      window.__footballRealismRenderer = this;
    }
    return rendererRender.call(this, renderScene, camera);
  };

  window.__footballRealismCaptureInstalled = true;
}
