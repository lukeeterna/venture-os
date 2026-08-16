import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { DecalGeometry } from "three/addons/geometries/DecalGeometry.js";

const MAX_GRAPHICS = 12;
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const MODEL_URL = "./assets/kit.glb";

const DESIGNS = [
  ["solid","Tinta unita",0],
  ["vertical-stripes","Righe verticali",1],
  ["horizontal-stripes","Righe orizzontali",2],
  ["horizontal-band","Fascia orizzontale",3],
  ["diagonal-band","Banda diagonale",4],
  ["half-split","Metà campo",5],
  ["chevron","Chevron",6],
  ["side-panels","Pannelli laterali",7],
  ["contrast-shoulders","Spalle contrasto",8],
  ["center-band","Banda centrale",9],
  ["quarters","Quarti",10],
  ["pinstripes","Gessato",11]
].map(([id,name,code])=>({id,name,code}));

const PARTS = [
  {id:"body",label:"Corpo maglia"},
  {id:"sleeves",label:"Maniche"},
  {id:"collar",label:"Colletto"},
  {id:"shorts",label:"Pantaloncini"},
  {id:"socks",label:"Calze"}
];

const SURFACES = [
  {id:"shirt-front",label:"Maglia fronte",part:"body",face:"front"},
  {id:"shirt-back",label:"Maglia retro",part:"body",face:"back"},
  {id:"left-sleeve",label:"Manica sinistra",part:"sleeves",face:"left"},
  {id:"right-sleeve",label:"Manica destra",part:"sleeves",face:"right"},
  {id:"shorts-left",label:"Pantaloncino sinistro",part:"shorts",face:"front-left"},
  {id:"shorts-right",label:"Pantaloncino destro",part:"shorts",face:"front-right"},
  {id:"socks-left",label:"Calza sinistra",part:"socks",face:"front-left"},
  {id:"socks-right",label:"Calza destra",part:"socks",face:"front-right"}
];

const FONTS = {
  impact:{label:"Blocco",family:"Impact, Haettenschweiler, 'Arial Narrow Bold', sans-serif",weight:900},
  futura:{label:"Geometrico",family:"Futura, Avenir, 'Century Gothic', Arial, sans-serif",weight:800},
  copperplate:{label:"Inciso",family:"Copperplate, 'Copperplate Gothic Light', Georgia, serif",weight:700},
  menlo:{label:"Tecnico",family:"Menlo, Monaco, 'Courier New', monospace",weight:800},
  georgia:{label:"Classico",family:"Georgia, 'Times New Roman', serif",weight:800},
  condensed:{label:"Condensato",family:"'Arial Narrow', 'Helvetica Neue Condensed', Arial, sans-serif",weight:900},
  varsity:{label:"College",family:"Rockwell, 'Roboto Slab', 'Courier New', serif",weight:900},
  modern:{label:"Moderno",family:"Avenir Next, Montserrat, Arial, sans-serif",weight:800}
};

const state = {
  sport:"football",
  design:"solid",
  colors:{
    body:{primary:"#1e5bd6",secondary:"#ffffff"},
    sleeves:{primary:"#1e5bd6",secondary:"#ffffff"},
    collar:{primary:"#ffffff",secondary:"#1e5bd6"},
    shorts:{primary:"#ffffff",secondary:"#1e5bd6"},
    socks:{primary:"#1e5bd6",secondary:"#ffffff"}
  },
  personalization:{
    name:"ROSSI",number:"10",font:"impact",color:"#ffffff",frontNumberEnabled:false,
    backName:{surface:"shirt-back",x:50,y:27,scale:40,rotation:0},
    backNumber:{surface:"shirt-back",x:50,y:50,scale:48,rotation:0},
    frontNumber:{surface:"shirt-front",x:50,y:54,scale:24,rotation:0}
  },
  graphics:[]
};

const dom = Object.fromEntries([
  "scene-canvas","viewer-shell","loading-overlay","loading-title","loading-copy","view-badge",
  "status-dot","viewer-status","design-gallery","part-colors","player-name","player-number",
  "player-font","print-color","front-number-toggle","front-number-card","back-name-controls",
  "back-number-controls","front-number-controls","graphics-list","graphics-count","graphics-message",
  "add-sponsor","add-patch","add-badge","summary","payload","copy-payload","send-email","output-message"
].map(id=>[id,document.getElementById(id)]));

let renderer,scene,camera,controls,kitRoot,decalGroup;
let viewTween = null;
let nextGraphicId = 1;
let modelReady = false;

const partBoundsRoot = Object.fromEntries(PARTS.map(p=>[p.id,new THREE.Box3()]));
const partTargets = Object.fromEntries(PARTS.map(p=>[p.id,new Set()]));
const partMaterials = Object.fromEntries(PARTS.map(p=>[p.id,[]]));

function clamp(v,min,max){return Math.min(max,Math.max(min,v))}
function lerp(a,b,t){return a+(b-a)*t}
function designCode(){return DESIGNS.find(d=>d.id===state.design)?.code ?? 0}
function normalizedName(v){return String(v||"").toLocaleUpperCase("it-IT").replace(/[^A-ZÀ-ÖØ-Ý0-9' -]/g,"").replace(/\s+/g," ").slice(0,18)}
function normalizedNumber(v){return String(v||"").replace(/\D/g,"").slice(0,2)}
function safeColor(v,fallback="#ffffff"){return /^#[0-9a-f]{6}$/i.test(String(v))?String(v).toLowerCase():fallback}
function escapeHtml(v){return String(v).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}

function setStatus(text,kind=""){
  dom["viewer-status"].textContent=text;
  dom["status-dot"].className=kind;
}
function fatal(title,copy){
  dom["loading-title"].textContent=title;
  dom["loading-copy"].textContent=copy;
  dom["loading-overlay"].hidden=false;
  setStatus(title,"error");
}

function classifyPart(materialName="",meshName="",materialIndex=0){
  const n=`${materialName} ${meshName}`.toLowerCase();
  if(/sleeve|manic/.test(n)) return "sleeves";
  if(/collar|neck|collett/.test(n)) return "collar";
  if(/short|pantal/.test(n)) return "shorts";
  if(/sock|calz/.test(n)) return "socks";
  if(/body|torso|jersey|shirt|maglia/.test(n)) return "body";
  return ["body","sleeves","collar","shorts","socks"][clamp(materialIndex,0,4)] || "body";
}

function expandGroupBounds(box,geometry,group,objectToRoot){
  const pos=geometry.attributes.position;
  const idx=geometry.index;
  const start=group?.start ?? 0;
  const count=group?.count ?? (idx?idx.count:pos.count);
  const p=new THREE.Vector3();
  for(let i=start;i<start+count;i++){
    const vi=idx?idx.getX(i):i;
    p.fromBufferAttribute(pos,vi).applyMatrix4(objectToRoot);
    box.expandByPoint(p);
  }
}

const garmentVertexShader = `
uniform mat4 uObjectToRoot;
varying vec3 vRootPosition;
varying vec3 vWorldNormal;
varying vec3 vWorldPosition;
void main(){
  vRootPosition=(uObjectToRoot*vec4(position,1.0)).xyz;
  vec4 world=modelMatrix*vec4(position,1.0);
  vWorldPosition=world.xyz;
  vWorldNormal=normalize(mat3(modelMatrix)*normal);
  gl_Position=projectionMatrix*viewMatrix*world;
}`;

const garmentFragmentShader = `
uniform vec3 uPrimary;
uniform vec3 uSecondary;
uniform vec3 uBoundsMin;
uniform vec3 uBoundsSize;
uniform float uDesign;
varying vec3 vRootPosition;
varying vec3 vWorldNormal;
varying vec3 vWorldPosition;

float designMask(vec2 q){
  float r=0.0;
  if(uDesign<0.5) r=0.0;
  else if(uDesign<1.5) r=step(0.5,fract(q.x*8.0));
  else if(uDesign<2.5) r=step(0.5,fract(q.y*8.0));
  else if(uDesign<3.5) r=1.0-step(0.11,abs(q.y-0.52));
  else if(uDesign<4.5){float d=q.y-(0.88-q.x*0.76);r=1.0-step(0.115,abs(d));}
  else if(uDesign<5.5) r=step(0.5,q.x);
  else if(uDesign<6.5){float c=0.43+abs(q.x-0.5)*0.66;r=1.0-step(0.095,abs(q.y-c));}
  else if(uDesign<7.5) r=max(1.0-step(0.18,q.x),step(0.82,q.x));
  else if(uDesign<8.5){float outer=step(0.23,abs(q.x-0.5));float upper=step(0.67,q.y);r=outer*upper;}
  else if(uDesign<9.5) r=1.0-step(0.13,abs(q.x-0.5));
  else if(uDesign<10.5){float cx=floor(q.x*2.0);float cy=floor(q.y*2.0);r=mod(cx+cy,2.0);}
  else r=1.0-step(0.09,fract(q.x*12.0));
  return clamp(r,0.0,1.0);
}
void main(){
  vec3 s=max(uBoundsSize,vec3(0.0001));
  vec2 q=clamp((vRootPosition.xy-uBoundsMin.xy)/s.xy,0.0,1.0);
  vec3 base=mix(uPrimary,uSecondary,designMask(q));
  vec3 n=normalize(vWorldNormal);
  vec3 key=normalize(vec3(0.55,0.88,0.62));
  float diffuse=0.62+0.38*max(dot(n,key),0.0);
  vec3 viewDir=normalize(cameraPosition-vWorldPosition);
  float rim=pow(1.0-max(dot(n,viewDir),0.0),3.0)*0.10;
  float weave=1.0+0.018*sin(vRootPosition.x*90.0)*sin(vRootPosition.y*120.0);
  vec3 color=base*diffuse*weave+vec3(rim);
  gl_FragColor=vec4(color,1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}`;

function makeGarmentMaterial(part,bounds,objectToRoot){
  const size=bounds.getSize(new THREE.Vector3());
  const m=new THREE.ShaderMaterial({
    uniforms:{
      uPrimary:{value:new THREE.Color(state.colors[part].primary)},
      uSecondary:{value:new THREE.Color(state.colors[part].secondary)},
      uBoundsMin:{value:bounds.min.clone()},
      uBoundsSize:{value:size},
      uDesign:{value:designCode()},
      uObjectToRoot:{value:objectToRoot.clone()}
    },
    vertexShader:garmentVertexShader,
    fragmentShader:garmentFragmentShader,
    side:THREE.DoubleSide,
    toneMapped:true
  });
  m.name=`sportswear-${part}`;
  partMaterials[part].push(m);
  return m;
}

function applyGarmentMaterials(root){
  PARTS.forEach(p=>{partBoundsRoot[p.id].makeEmpty();partTargets[p.id].clear();partMaterials[p.id].length=0});
  root.updateMatrixWorld(true);
  const rootInverse=root.matrixWorld.clone().invert();
  const entries=[];

  root.traverse(obj=>{
    if(!obj.isMesh || !obj.geometry?.attributes?.position) return;
    if(!obj.geometry.attributes.normal) obj.geometry.computeVertexNormals();
    const originals=Array.isArray(obj.material)?obj.material:[obj.material];
    const groups=obj.geometry.groups.length?obj.geometry.groups:[{start:0,count:obj.geometry.index?obj.geometry.index.count:obj.geometry.attributes.position.count,materialIndex:0}];
    const objectToRoot=rootInverse.clone().multiply(obj.matrixWorld);
    const parts=new Set();
    groups.forEach(group=>{
      const mi=group.materialIndex||0;
      const original=originals[mi]||originals[0];
      const part=classifyPart(original?.name,obj.name,mi);
      expandGroupBounds(partBoundsRoot[part],obj.geometry,group,objectToRoot);
      parts.add(part);
    });
    parts.forEach(part=>partTargets[part].add(obj));
    entries.push({obj,originals,objectToRoot});
  });

  const fallback=new THREE.Box3().setFromObject(root);
  const inv=root.matrixWorld.clone().invert();
  fallback.applyMatrix4(inv);
  PARTS.forEach(p=>{if(partBoundsRoot[p.id].isEmpty()) partBoundsRoot[p.id].copy(fallback)});

  entries.forEach(({obj,originals,objectToRoot})=>{
    const replacements=originals.map((original,mi)=>{
      const part=classifyPart(original?.name,obj.name,mi);
      return makeGarmentMaterial(part,partBoundsRoot[part],objectToRoot);
    });
    obj.material=Array.isArray(obj.material)?replacements:replacements[0];
    obj.castShadow=true;
    obj.receiveShadow=true;
  });
}

function updateGarmentUniforms(){
  PARTS.forEach(p=>{
    for(const m of partMaterials[p.id]){
      m.uniforms.uPrimary.value.set(state.colors[p.id].primary);
      m.uniforms.uSecondary.value.set(state.colors[p.id].secondary);
      m.uniforms.uDesign.value=designCode();
    }
  });
  renderDesignPreviews();
  updateOutput();
}

function initThree(){
  renderer=new THREE.WebGLRenderer({canvas:dom["scene-canvas"],antialias:true,alpha:true,powerPreference:"high-performance"});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2));
  renderer.outputColorSpace=THREE.SRGBColorSpace;
  renderer.toneMapping=THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure=1.0;

  scene=new THREE.Scene();
  camera=new THREE.PerspectiveCamera(34,1,0.05,100);
  camera.position.set(0,0.25,9);

  controls=new OrbitControls(camera,renderer.domElement);
  controls.enableDamping=true;
  controls.dampingFactor=.075;
  controls.enablePan=false;
  controls.minDistance=4;
  controls.maxDistance=14;
  controls.minAzimuthAngle=-Infinity;
  controls.maxAzimuthAngle=Infinity;
  controls.target.set(0,0,0);

  scene.add(new THREE.HemisphereLight(0xeaf2ff,0x18202b,2.25));
  const key=new THREE.DirectionalLight(0xffffff,3.2);key.position.set(4,6,7);scene.add(key);
  const fill=new THREE.DirectionalLight(0x9bb9ff,1.65);fill.position.set(-5,2,-4);scene.add(fill);

  decalGroup=new THREE.Group();
  decalGroup.name="sportswear-decals";
  scene.add(decalGroup);

  resize();
  window.addEventListener("resize",resize);
  animate();
}

function normalizeKit(root){
  root.updateMatrixWorld(true);
  let box=new THREE.Box3().setFromObject(root);
  const size=box.getSize(new THREE.Vector3());
  if(!size.y) throw new Error("Modello GLB senza altezza valida.");
  const scale=5.9/size.y;
  root.scale.multiplyScalar(scale);
  root.updateMatrixWorld(true);
  box=new THREE.Box3().setFromObject(root);
  const center=box.getCenter(new THREE.Vector3());
  root.position.sub(center);
  root.updateMatrixWorld(true);

  const finalBox=new THREE.Box3().setFromObject(root);
  const finalSize=finalBox.getSize(new THREE.Vector3());
  const radius=finalSize.length()/2;
  const distance=clamp(radius/Math.sin(THREE.MathUtils.degToRad(camera.fov)/2)*.85,7,11);
  camera.position.set(0,0.2,distance);
  controls.minDistance=distance*.65;
  controls.maxDistance=distance*1.55;
  controls.target.set(0,0,0);
  controls.update();
}

function resize(){
  if(!renderer) return;
  const w=Math.max(1,dom["viewer-shell"].clientWidth);
  const h=Math.max(1,dom["viewer-shell"].clientHeight);
  renderer.setSize(w,h,false);
  camera.aspect=w/h;
  camera.updateProjectionMatrix();
}

function setView(name){
  const angles={front:0,right:90,back:180,left:-90};
  const labels={front:"Fronte",right:"Destra",back:"Retro",left:"Sinistra"};
  const deg=angles[name]??0;
  const radius=camera.position.distanceTo(controls.target);
  const a=THREE.MathUtils.degToRad(deg);
  viewTween=new THREE.Vector3(Math.sin(a)*radius,clamp(camera.position.y,-.5,.8),Math.cos(a)*radius);
  dom["view-badge"].textContent=labels[name]||"Vista";
  document.querySelectorAll("[data-view]").forEach(b=>b.classList.toggle("active",b.dataset.view===name));
}

function animate(){
  requestAnimationFrame(animate);
  if(viewTween){
    camera.position.lerp(viewTween,.14);
    if(camera.position.distanceTo(viewTween)<.012){camera.position.copy(viewTween);viewTween=null}
  }
  controls.update();
  renderer.render(scene,camera);
}

async function loadKit(){
  const loader=new GLTFLoader();
  const gltf=await new Promise((resolve,reject)=>loader.load(MODEL_URL,resolve,undefined,reject));
  kitRoot=gltf.scene;
  kitRoot.name="football-kit";
  scene.add(kitRoot);
  normalizeKit(kitRoot);
  applyGarmentMaterials(kitRoot);
  kitRoot.updateMatrixWorld(true);
  modelReady=true;
  rebuildDecals();
  dom["loading-overlay"].hidden=true;
  setStatus("Divisa 3D pronta — 360°","ready");
}

function rootBoxToWorld(rootBox){
  const result=new THREE.Box3();
  const corners=[];
  for(const x of [rootBox.min.x,rootBox.max.x])
    for(const y of [rootBox.min.y,rootBox.max.y])
      for(const z of [rootBox.min.z,rootBox.max.z])
        corners.push(new THREE.Vector3(x,y,z).applyMatrix4(kitRoot.matrixWorld));
  corners.forEach(p=>result.expandByPoint(p));
  return result;
}

function surfaceDef(id){return SURFACES.find(s=>s.id===id)||SURFACES[0]}

function surfaceFrame(id){
  const def=surfaceDef(id);
  const box=rootBoxToWorld(partBoundsRoot[def.part]);
  const size=box.getSize(new THREE.Vector3());
  const center=box.getCenter(new THREE.Vector3());
  const halfX=center.x;
  let xMin=box.min.x,xMax=box.max.x;
  if(def.face==="front-left"){xMax=halfX}
  if(def.face==="front-right"){xMin=halfX}
  return {def,box,size,center,xMin,xMax};
}

function placementToProjector(surface,xPct,yPct,rotationDeg){
  const f=surfaceFrame(surface);
  const tX=clamp(xPct,0,100)/100;
  const tY=clamp(yPct,0,100)/100;
  const eps=Math.max(.01,Math.min(f.size.x,f.size.y,f.size.z)*.01);
  let position,orientation,uSpan,vSpan,depth;

  if(f.def.face==="front" || f.def.face.startsWith("front-")){
    position=new THREE.Vector3(lerp(f.xMin,f.xMax,tX),lerp(f.box.max.y,f.box.min.y,tY),f.box.max.z+eps);
    orientation=new THREE.Euler(0,0,THREE.MathUtils.degToRad(rotationDeg));
    uSpan=f.xMax-f.xMin;vSpan=f.size.y;depth=f.size.z;
  }else if(f.def.face==="back"){
    position=new THREE.Vector3(lerp(f.xMin,f.xMax,tX),lerp(f.box.max.y,f.box.min.y,tY),f.box.min.z-eps);
    orientation=new THREE.Euler(0,Math.PI,THREE.MathUtils.degToRad(-rotationDeg));
    uSpan=f.xMax-f.xMin;vSpan=f.size.y;depth=f.size.z;
  }else if(f.def.face==="left"){
    position=new THREE.Vector3(f.box.min.x-eps,lerp(f.box.max.y,f.box.min.y,tY),lerp(f.box.max.z,f.box.min.z,tX));
    orientation=new THREE.Euler(0,-Math.PI/2,THREE.MathUtils.degToRad(rotationDeg));
    uSpan=f.size.z;vSpan=f.size.y;depth=f.size.x;
  }else{
    position=new THREE.Vector3(f.box.max.x+eps,lerp(f.box.max.y,f.box.min.y,tY),lerp(f.box.min.z,f.box.max.z,tX));
    orientation=new THREE.Euler(0,Math.PI/2,THREE.MathUtils.degToRad(rotationDeg));
    uSpan=f.size.z;vSpan=f.size.y;depth=f.size.x;
  }
  return {position,orientation,uSpan:Math.max(.1,uSpan),vSpan:Math.max(.1,vSpan),depth:Math.max(.1,depth),part:f.def.part};
}

function targetMeshForPart(part){
  const arr=[...partTargets[part]];
  if(arr.length) return arr[0];
  return [...partTargets.body][0]||null;
}

function disposeObject3D(obj){
  obj.traverse(child=>{
    child.geometry?.dispose?.();
    if(child.material){
      const mats=Array.isArray(child.material)?child.material:[child.material];
      mats.forEach(m=>{
        if(m.map?.userData?.ownedBySportswear) m.map.dispose();
        m.dispose?.();
      });
    }
  });
}

function clearDecals(){
  for(const child of [...decalGroup.children]){
    decalGroup.remove(child);
    disposeObject3D(child);
  }
}

function canvasTexture(canvas){
  const tex=new THREE.CanvasTexture(canvas);
  tex.colorSpace=THREE.SRGBColorSpace;
  tex.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());
  tex.userData.ownedBySportswear=true;
  return tex;
}

function contrast(hex){
  const c=new THREE.Color(safeColor(hex));
  const l=.299*c.r+.587*c.g+.114*c.b;
  return l>.55?"#111820":"#ffffff";
}

function textTexture(text,fontKey,color,kind){
  const canvas=document.createElement("canvas");
  canvas.width=kind==="number"?768:1536;
  canvas.height=kind==="number"?768:420;
  const ctx=canvas.getContext("2d");
  const font=FONTS[fontKey]||FONTS.impact;
  const size=kind==="number"?600:270;
  ctx.clearRect(0,0,canvas.width,canvas.height);
  ctx.textAlign="center";ctx.textBaseline="middle";ctx.lineJoin="round";
  ctx.font=`${font.weight} ${size}px ${font.family}`;
  ctx.strokeStyle=contrast(color);
  ctx.lineWidth=Math.max(8,size*.035);
  ctx.fillStyle=safeColor(color);
  const maxW=canvas.width*.92;
  ctx.strokeText(text,canvas.width/2,canvas.height/2,maxW);
  ctx.fillText(text,canvas.width/2,canvas.height/2,maxW);
  return {texture:canvasTexture(canvas),aspect:canvas.width/canvas.height};
}

function imageTexture(image){
  const tex=new THREE.Texture(image);
  tex.colorSpace=THREE.SRGBColorSpace;
  tex.needsUpdate=true;
  tex.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());
  tex.userData.ownedBySportswear=true;
  const w=image.naturalWidth||image.width||1,h=image.naturalHeight||image.height||1;
  return {texture:tex,aspect:w/h};
}

function addProjectedDecal({surface,x,y,scale,rotation,texture,aspect,opacity=1}){
  const frame=placementToProjector(surface,x,y,rotation);
  const target=targetMeshForPart(frame.part);
  if(!target) return false;
  target.updateMatrixWorld(true);

  const width=clamp(frame.uSpan*(scale/100),.12,frame.uSpan*.9);
  const height=clamp(width/Math.max(.18,aspect),.10,frame.vSpan*.72);
  const depth=clamp(frame.depth*.35,.10,.55);
  const size=new THREE.Vector3(width,height,depth);
  const geometry=new DecalGeometry(target,frame.position,frame.orientation,size);
  if(!geometry.attributes.position || geometry.attributes.position.count===0){
    geometry.dispose();
    return false;
  }
  const material=new THREE.MeshStandardMaterial({
    map:texture,transparent:true,opacity:clamp(opacity,0,1),alphaTest:.015,
    depthWrite:false,depthTest:true,roughness:.76,metalness:0,
    polygonOffset:true,polygonOffsetFactor:-4,side:THREE.FrontSide
  });
  const mesh=new THREE.Mesh(geometry,material);
  mesh.renderOrder=10;
  decalGroup.add(mesh);
  return true;
}

function rebuildDecals(){
  if(!modelReady){updateOutput();return;}
  clearDecals();
  const p=state.personalization;
  const failures=[];

  if(p.name){
    const t=textTexture(p.name,p.font,p.color,"name");
    if(!addProjectedDecal({...p.backName,texture:t.texture,aspect:t.aspect})) failures.push("nome retro");
  }
  if(p.number){
    const t=textTexture(p.number,p.font,p.color,"number");
    if(!addProjectedDecal({...p.backNumber,texture:t.texture,aspect:t.aspect})) failures.push("numero retro");
    if(p.frontNumberEnabled){
      const tf=textTexture(p.number,p.font,p.color,"number");
      if(!addProjectedDecal({...p.frontNumber,texture:tf.texture,aspect:tf.aspect})) failures.push("numero fronte");
    }
  }

  state.graphics.forEach(g=>{
    if(!g.image) return;
    const t=imageTexture(g.image);
    if(!addProjectedDecal({surface:g.surface,x:g.x,y:g.y,scale:g.scale,rotation:g.rotation,texture:t.texture,aspect:t.aspect,opacity:g.opacity})){
      failures.push(`${g.type} #${g.id}`);
    }
  });

  dom["graphics-message"].textContent=failures.length?`Non proiettati: ${failures.join(", ")}`:"";
  dom["graphics-message"].className=`message${failures.length?" error":""}`;
  updateOutput();
}

function drawPreview(canvas,design){
  const dpr=window.devicePixelRatio||1,w=120,h=40;
  canvas.width=w*dpr;canvas.height=h*dpr;
  const ctx=canvas.getContext("2d");ctx.setTransform(dpr,0,0,dpr,0,0);
  const p=state.colors.body.primary,s=state.colors.body.secondary;
  ctx.fillStyle=p;ctx.fillRect(0,0,w,h);ctx.fillStyle=s;ctx.strokeStyle=s;
  const id=design.id;
  if(id==="vertical-stripes"){for(let i=0;i<8;i+=2)ctx.fillRect(i*w/8,0,w/8,h)}
  else if(id==="horizontal-stripes"){for(let i=0;i<8;i+=2)ctx.fillRect(0,i*h/8,w,h/8)}
  else if(id==="horizontal-band")ctx.fillRect(0,h*.42,w,h*.2);
  else if(id==="diagonal-band"){ctx.lineWidth=10;ctx.beginPath();ctx.moveTo(-5,h);ctx.lineTo(w+5,0);ctx.stroke()}
  else if(id==="half-split")ctx.fillRect(w/2,0,w/2,h);
  else if(id==="chevron"){ctx.lineWidth=9;ctx.beginPath();ctx.moveTo(0,h*.32);ctx.lineTo(w/2,h*.7);ctx.lineTo(w,h*.32);ctx.stroke()}
  else if(id==="side-panels"){ctx.fillRect(0,0,w*.18,h);ctx.fillRect(w*.82,0,w*.18,h)}
  else if(id==="contrast-shoulders"){ctx.fillRect(0,0,w*.28,h*.45);ctx.fillRect(w*.72,0,w*.28,h*.45)}
  else if(id==="center-band")ctx.fillRect(w*.38,0,w*.24,h);
  else if(id==="quarters"){ctx.fillRect(w/2,0,w/2,h/2);ctx.fillRect(0,h/2,w/2,h/2)}
  else if(id==="pinstripes"){ctx.lineWidth=2;for(let x=6;x<w;x+=10){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,h);ctx.stroke()}}
}

function buildDesigns(){
  dom["design-gallery"].innerHTML="";
  for(const d of DESIGNS){
    const b=document.createElement("button");b.type="button";b.className="design-card";b.dataset.id=d.id;
    const c=document.createElement("canvas");c.className="design-swatch";
    const s=document.createElement("small");s.textContent=d.name;b.append(c,s);
    b.addEventListener("click",()=>{state.design=d.id;document.querySelectorAll(".design-card").forEach(x=>x.classList.toggle("active",x.dataset.id===d.id));updateGarmentUniforms()});
    dom["design-gallery"].appendChild(b);
  }
  renderDesignPreviews();
}

function renderDesignPreviews(){
  document.querySelectorAll(".design-card").forEach(b=>{
    b.classList.toggle("active",b.dataset.id===state.design);
    const d=DESIGNS.find(x=>x.id===b.dataset.id);drawPreview(b.querySelector("canvas"),d);
  });
}

function colorField(part,key,label){
  const wrap=document.createElement("label");wrap.className="color-field";
  const input=document.createElement("input");input.type="color";input.value=state.colors[part][key];
  const span=document.createElement("span");span.textContent=label;
  input.addEventListener("input",()=>{state.colors[part][key]=input.value.toLowerCase();updateGarmentUniforms()});
  wrap.append(input,span);return wrap;
}

function buildPartColors(){
  dom["part-colors"].innerHTML="";
  for(const p of PARTS){
    const card=document.createElement("div");card.className="part-card";
    const h=document.createElement("h3");h.textContent=p.label;
    const colors=document.createElement("div");colors.className="colors";
    colors.append(colorField(p.id,"primary","Primario"),colorField(p.id,"secondary","Secondario"));
    card.append(h,colors);dom["part-colors"].appendChild(card);
  }
}

function slider(container,id,label,min,max,value,onInput,suffix="%",full=false){
  const wrap=document.createElement("div");wrap.className=`slider${full?" full":""}`;
  const head=document.createElement("div");head.className="slider-head";
  const lab=document.createElement("label");lab.htmlFor=id;lab.textContent=label;
  const out=document.createElement("output");out.textContent=`${value}${suffix}`;
  const input=document.createElement("input");input.type="range";input.id=id;input.min=min;input.max=max;input.value=value;
  input.addEventListener("input",()=>{const v=Number(input.value);out.textContent=`${v}${suffix}`;onInput(v)});
  head.append(lab,out);wrap.append(head,input);container.appendChild(wrap);
}

function buildPersonalizationControls(){
  const p=state.personalization;
  const name=dom["back-name-controls"],num=dom["back-number-controls"],front=dom["front-number-controls"];
  name.innerHTML=num.innerHTML=front.innerHTML="";
  slider(name,"bn-x","Orizzontale",10,90,p.backName.x,v=>{p.backName.x=v;rebuildDecals()});
  slider(name,"bn-y","Verticale",8,62,p.backName.y,v=>{p.backName.y=v;rebuildDecals()});
  slider(name,"bn-s","Scala",15,70,p.backName.scale,v=>{p.backName.scale=v;rebuildDecals()}, "%", true);
  slider(name,"bn-r","Rotazione",-30,30,p.backName.rotation,v=>{p.backName.rotation=v;rebuildDecals()},"°",true);
  slider(num,"bnum-x","Orizzontale",10,90,p.backNumber.x,v=>{p.backNumber.x=v;rebuildDecals()});
  slider(num,"bnum-y","Verticale",20,82,p.backNumber.y,v=>{p.backNumber.y=v;rebuildDecals()});
  slider(num,"bnum-s","Scala",18,70,p.backNumber.scale,v=>{p.backNumber.scale=v;rebuildDecals()},"%",true);
  slider(num,"bnum-r","Rotazione",-30,30,p.backNumber.rotation,v=>{p.backNumber.rotation=v;rebuildDecals()},"°",true);
  slider(front,"fnum-x","Orizzontale",10,90,p.frontNumber.x,v=>{p.frontNumber.x=v;rebuildDecals()});
  slider(front,"fnum-y","Verticale",18,82,p.frontNumber.y,v=>{p.frontNumber.y=v;rebuildDecals()});
  slider(front,"fnum-s","Scala",10,50,p.frontNumber.scale,v=>{p.frontNumber.scale=v;rebuildDecals()},"%",true);
}

function addGraphic(type){
  if(state.graphics.length>=MAX_GRAPHICS) return;
  const defaults={
    sponsor:{surface:"shirt-front",x:50,y:46,scale:34},
    patch:{surface:"left-sleeve",x:50,y:48,scale:28},
    badge:{surface:"shirt-front",x:30,y:30,scale:18}
  }[type];
  state.graphics.push({id:nextGraphicId++,type,surface:defaults.surface,x:defaults.x,y:defaults.y,scale:defaults.scale,rotation:0,opacity:1,image:null,objectUrl:""});
  renderGraphics();
  updateOutput();
}

function removeGraphic(id){
  const i=state.graphics.findIndex(g=>g.id===id);
  if(i<0)return;
  const [g]=state.graphics.splice(i,1);
  if(g.objectUrl) URL.revokeObjectURL(g.objectUrl);
  renderGraphics();rebuildDecals();
}

function fieldSelect(label,options,value,onChange){
  const lab=document.createElement("label");lab.className="field";lab.textContent=label;
  const sel=document.createElement("select");
  for(const o of options){const opt=document.createElement("option");opt.value=o.value;opt.textContent=o.label;opt.selected=o.value===value;sel.appendChild(opt)}
  sel.addEventListener("change",()=>onChange(sel.value));lab.appendChild(sel);return lab;
}

function graphicSlider(grid,g,key,label,min,max,suffix="%",step=1){
  const c=document.createElement("div");c.className="slider";
  const head=document.createElement("div");head.className="slider-head";
  const l=document.createElement("span");l.textContent=label;
  const out=document.createElement("output");out.textContent=`${g[key]}${suffix}`;
  const input=document.createElement("input");input.type="range";input.min=min;input.max=max;input.step=step;input.value=g[key];
  input.addEventListener("input",()=>{g[key]=Number(input.value);out.textContent=`${g[key]}${suffix}`;rebuildDecals()});
  head.append(l,out);c.append(head,input);grid.appendChild(c);
}

function renderGraphics(){
  dom["graphics-list"].innerHTML="";
  const labels={sponsor:"Sponsor",patch:"Patch / scudetto",badge:"Badge"};
  for(const g of state.graphics){
    const card=document.createElement("div");card.className="graphic-card";
    const head=document.createElement("div");head.className="graphic-head";
    const title=document.createElement("strong");title.textContent=`${labels[g.type]} #${g.id}`;
    const rm=document.createElement("button");rm.type="button";rm.className="remove-btn";rm.textContent="Rimuovi";rm.addEventListener("click",()=>removeGraphic(g.id));
    head.append(title,rm);

    const grid=document.createElement("div");grid.className="graphic-grid";
    const fileLabel=document.createElement("label");fileLabel.className="field wide";fileLabel.textContent="Immagine";
    const file=document.createElement("input");file.type="file";file.accept="image/png,image/jpeg,image/webp,image/svg+xml";
    file.addEventListener("change",()=>{
      const f=file.files?.[0];if(!f)return;
      if(f.size>MAX_IMAGE_BYTES){dom["graphics-message"].textContent="Immagine oltre 5 MB.";dom["graphics-message"].className="message error";file.value="";return}
      if(g.objectUrl)URL.revokeObjectURL(g.objectUrl);
      g.objectUrl=URL.createObjectURL(f);
      const img=new Image();
      img.onload=()=>{g.image=img;renderGraphics();rebuildDecals()};
      img.onerror=()=>{dom["graphics-message"].textContent="Immagine non leggibile.";dom["graphics-message"].className="message error"};
      img.src=g.objectUrl;
    });
    fileLabel.appendChild(file);
    grid.appendChild(fileLabel);
    grid.appendChild(fieldSelect("Superficie",SURFACES.map(s=>({value:s.id,label:s.label})),g.surface,v=>{g.surface=v;rebuildDecals()}));
    const thumb=document.createElement("div");thumb.className="thumb";
    if(g.objectUrl){const im=document.createElement("img");im.src=g.objectUrl;im.alt="Anteprima";thumb.appendChild(im)}else thumb.textContent="Nessuna immagine";
    grid.appendChild(thumb);
    graphicSlider(grid,g,"x","Orizzontale",5,95);
    graphicSlider(grid,g,"y","Verticale",5,95);
    graphicSlider(grid,g,"scale","Scala",5,75);
    graphicSlider(grid,g,"rotation","Rotazione",-180,180,"°");
    graphicSlider(grid,g,"opacity","Opacità",0.15,1,"",0.05);

    card.append(head,grid);dom["graphics-list"].appendChild(card);
  }
  dom["graphics-count"].textContent=`${state.graphics.length} / ${MAX_GRAPHICS}`;
  const disabled=state.graphics.length>=MAX_GRAPHICS;
  dom["add-sponsor"].disabled=disabled;dom["add-patch"].disabled=disabled;dom["add-badge"].disabled=disabled;
}

function payload(){
  const p=state.personalization;
  return {
    v:1,
    sport:"football",
    design:state.design,
    colors:Object.fromEntries(PARTS.map(part=>[part.id,{primary:state.colors[part.id].primary,secondary:state.colors[part.id].secondary}])),
    personalization:{
      name:p.name,number:p.number,font:p.font,color:p.color,front_number_enabled:p.frontNumberEnabled,
      back_name:{surface:p.backName.surface,x:p.backName.x,y:p.backName.y,scale:p.backName.scale,rotation:p.backName.rotation},
      back_number:{surface:p.backNumber.surface,x:p.backNumber.x,y:p.backNumber.y,scale:p.backNumber.scale,rotation:p.backNumber.rotation},
      front_number:{surface:p.frontNumber.surface,x:p.frontNumber.x,y:p.frontNumber.y,scale:p.frontNumber.scale,rotation:p.frontNumber.rotation}
    },
    graphics:state.graphics.map(g=>({type:g.type,surface:g.surface,x:g.x,y:g.y,scale:g.scale,rotation:g.rotation,opacity:g.opacity,image_present:Boolean(g.image)}))
  };
}

function updateOutput(){
  const data=payload();window.__payload3d=data;
  dom.payload.value=JSON.stringify(data);
  const d=DESIGNS.find(x=>x.id===state.design)?.name||state.design;
  const graphicText=state.graphics.length?`${state.graphics.length} elementi grafici`:"nessuna patch/sponsor";
  dom.summary.innerHTML=`<strong>${escapeHtml(d)}</strong><br>Nome/numero: ${escapeHtml(state.personalization.name||"—")} ${escapeHtml(state.personalization.number||"—")} · ${escapeHtml(FONTS[state.personalization.font]?.label||state.personalization.font)}<br>${escapeHtml(graphicText)} · numero fronte ${state.personalization.frontNumberEnabled?"sì":"no"}`;
}

async function copyPayload(){
  const text=dom.payload.value;
  try{
    if(navigator.clipboard?.writeText) await navigator.clipboard.writeText(text);
    else{
      dom.payload.focus();dom.payload.select();
      if(!document.execCommand("copy")) throw new Error("copy fallita");
      dom.payload.setSelectionRange(0,0);
    }
    dom["output-message"].textContent="Copiato ✓";dom["output-message"].className="message ok";
  }catch(e){dom["output-message"].textContent="Copia non riuscita.";dom["output-message"].className="message error"}
}

function sendEmail(){
  const subject=encodeURIComponent("Richiesta preventivo kit personalizzato — [ATTIVITA]");
  const body=encodeURIComponent(`Buongiorno,\n\nvorrei richiedere un preventivo per questa configurazione:\n\n${dom.payload.value}\n\n[ATTIVITA]\n[EMAIL_ATTIVITA]\n[TEL]\n`);
  window.location.href=`mailto:[EMAIL_ATTIVITA]?subject=${subject}&body=${body}`;
}

function wireUi(){
  for(const [key,f] of Object.entries(FONTS)){const o=document.createElement("option");o.value=key;o.textContent=f.label;dom["player-font"].appendChild(o)}
  dom["player-font"].value=state.personalization.font;

  dom["player-name"].addEventListener("input",()=>{const v=normalizedName(dom["player-name"].value);dom["player-name"].value=v;state.personalization.name=v;rebuildDecals()});
  dom["player-number"].addEventListener("input",()=>{const v=normalizedNumber(dom["player-number"].value);dom["player-number"].value=v;state.personalization.number=v;rebuildDecals()});
  dom["player-font"].addEventListener("change",()=>{state.personalization.font=dom["player-font"].value;rebuildDecals()});
  dom["print-color"].addEventListener("input",()=>{state.personalization.color=safeColor(dom["print-color"].value);rebuildDecals()});
  dom["front-number-toggle"].addEventListener("change",()=>{state.personalization.frontNumberEnabled=dom["front-number-toggle"].checked;dom["front-number-card"].hidden=!state.personalization.frontNumberEnabled;rebuildDecals()});

  document.querySelectorAll("[data-view]").forEach(b=>b.addEventListener("click",()=>setView(b.dataset.view)));
  dom["add-sponsor"].addEventListener("click",()=>addGraphic("sponsor"));
  dom["add-patch"].addEventListener("click",()=>addGraphic("patch"));
  dom["add-badge"].addEventListener("click",()=>addGraphic("badge"));
  dom["copy-payload"].addEventListener("click",copyPayload);
  dom["send-email"].addEventListener("click",sendEmail);
}

async function main(){
  buildDesigns();
  buildPartColors();
  buildPersonalizationControls();
  renderGraphics();
  wireUi();
  updateOutput();
  initThree();
  try{await loadKit()}catch(err){console.error(err);fatal("Impossibile caricare il kit",String(err?.message||err))}
  window.__sportswear3d={state,setView,rebuildDecals,payload};
}
main();
