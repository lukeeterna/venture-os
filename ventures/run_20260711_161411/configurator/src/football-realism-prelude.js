import * as THREE from "three";

if (!window.__footballRealismCaptureInstalled) {
  const sceneAdd = THREE.Scene.prototype.add;
  THREE.Scene.prototype.add = function (...objects) {
    window.__footballRealismScene = this;
    return sceneAdd.apply(this, objects);
  };
  window.__footballRealismCaptureInstalled = true;
}
