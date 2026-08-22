import * as THREE from "three";

if (!window.__footballRealismCaptureInstalled) {
  const sceneAdd = THREE.Scene.prototype.add;
  THREE.Scene.prototype.add = function (...objects) {
    window.__footballRealismScene = this;
    return sceneAdd.apply(this, objects);
  };

  const rendererRender = THREE.WebGLRenderer.prototype.render;
  THREE.WebGLRenderer.prototype.render = function (renderScene, camera) {
    if (renderScene?.isScene && camera?.isPerspectiveCamera) {
      window.__footballRealismScene = renderScene;
      window.__footballRealismCamera = camera;
      window.__footballRealismRenderer = this;
    }
    return rendererRender.call(this, renderScene, camera);
  };

  window.__footballRealismCaptureInstalled = true;
}
