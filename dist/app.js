import * as THREE from './assets/three.module.js';
import {GLTFLoader} from './assets/GLTFLoader.js';
import {DRACOLoader} from './assets/DRACOLoader.js';
import {vertexShader,fragmentShader} from './assets/ribbon-shaders.js';
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
let paused=reduced;
const motion=document.querySelector('#motion');motion.textContent=paused?'▶':'Ⅱ';motion.addEventListener('click',()=>{paused=!paused;motion.textContent=paused?'▶':'Ⅱ';motion.setAttribute('aria-label',paused?'Play animation':'Pause animation')});
const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting)e.target.classList.add('visible')}),{threshold:.08});document.querySelectorAll('.reveal').forEach(el=>observer.observe(el));
function metadata(){document.querySelector('#time').textContent=new Date().toLocaleTimeString('en-US',{timeZone:'America/New_York'});document.querySelector('#dimensions').textContent=`${innerWidth} × ${innerHeight}`}metadata();setInterval(metadata,1000);document.querySelector('#year').textContent=new Date().getFullYear();
const navObserver=new IntersectionObserver(entries=>{for(const e of entries)if(e.isIntersecting){document.querySelectorAll('nav a').forEach(a=>a.classList.toggle('active',a.getAttribute('href')==='#'+e.target.id))}},{rootMargin:'-15% 0px -45% 0px'});['index','about','work','contact'].forEach(id=>navObserver.observe(document.getElementById(id)));
const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
const smooth=(a,b,v)=>{const t=clamp((v-a)/(b-a));return t*t*(3-2*t)};
const story=document.querySelector('.intro-story'),about=document.querySelector('#about'),sceneElement=document.querySelector('.scene');
function scrollTransition(){const y=scrollY,h=innerHeight;const end=story.offsetHeight-h;const fade=smooth(h*.4,h*1.8,y);sceneElement.style.setProperty('--shade',String(fade*.88+smooth(end-h*.4,end,y)*.12));document.querySelector('.hero-title').style.opacity=1-smooth(0,h*.6,y);document.querySelector('.scene-note').style.opacity=(1-smooth(0,h*.5,y))*.65;document.querySelector('.ruler').style.opacity=(1-smooth(h*.3,h*.8,y))*.35;const appearance=smooth(h*.45,h*1.15,y);about.style.opacity=appearance;about.style.transform=`translateY(${(1-appearance)*50}px)`;sceneElement.style.visibility=y>story.offsetHeight?'hidden':'visible';}
addEventListener('scroll',scrollTransition,{passive:true});addEventListener('resize',scrollTransition);scrollTransition();
try{
 const canvas=document.querySelector('#hero');
 const renderer=new THREE.WebGLRenderer({canvas,antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.outputColorSpace=THREE.SRGBColorSpace;
 const scene=new THREE.Scene();scene.background=new THREE.Color('#0353B7');
 const camera=new THREE.OrthographicCamera(-1,1,1,-1,.01,200);camera.position.set(12,6,12);camera.lookAt(0,0,0);
 const group=new THREE.Group();scene.add(group);group.rotation.y=reduced?0:-Math.PI;
 const plane=new THREE.Mesh(new THREE.PlaneGeometry(300,300),new THREE.MeshBasicMaterial({color:'#0353B7'}));plane.rotation.x=-Math.PI/2;plane.position.y=-27;scene.add(plane);
 const grid=new THREE.GridHelper(250,50,0xffffff,0xffffff);grid.position.set(-10,-20,-10);grid.material.transparent=true;grid.material.opacity=.05;scene.add(grid);
 const matTexture=new THREE.TextureLoader().load('./assets/cutting-mat.svg');matTexture.colorSpace=THREE.SRGBColorSpace;
 const mat=new THREE.Mesh(new THREE.PlaneGeometry(90,90),new THREE.MeshBasicMaterial({map:matTexture,transparent:true,opacity:.1,depthWrite:false}));mat.position.set(-47.4,-20.5,-36);mat.rotation.set(-Math.PI/2,0,Math.PI/2);scene.add(mat);
 function label(text,position,rotation=0,width=24){const c=document.createElement('canvas');c.width=1536;c.height=192;const ctx=c.getContext('2d');ctx.font=`${1536*.75/width}px monospace`;ctx.fillStyle='#C4C9D4';text.split('\n').forEach((line,i)=>ctx.fillText(line,10,48+i*58));const mesh=new THREE.Mesh(new THREE.PlaneGeometry(width,width/8),new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(c),transparent:true,depthWrite:false}));mesh.position.set(...position);mesh.rotation.set(-Math.PI/2,0,rotation);scene.add(mesh);return {ctx,c,mesh}}
 label('commit: meet-popat / portfolio-2026',[-45,-20,-65.5]);
 label('x0: 0.00000\ny0: 0.00000\nz0: 0.00000',[-52,-20,-32.5],Math.PI/2,12);
 label('x1: 0.00000\ny1: 0.00000\nz1: 0.00000',[-52,-20,-38],Math.PI/2,12);
 label('x2: 0.00000\ny2: 0.00000\nz2: 0.00000',[-47,-20,-32.5],Math.PI/2,12);
 label('camera:\n-0.33983690\n 0.78539816',[-22,-20,-40],Math.PI/2,12);
 const targetA=new THREE.WebGLRenderTarget(1,1,{type:THREE.HalfFloatType});const targetB=targetA.clone(),finalTarget=targetA.clone();
 const materials=Array.from({length:3},()=>new THREE.ShaderMaterial({vertexShader,fragmentShader,uniforms:{uSceneTex:{value:null},uTransparent:{value:0},uRefractPower:{value:0},winResolution:{value:new THREE.Vector2()},uLight:{value:new THREE.Vector3(0,5,0)}}}));
 const draco=new DRACOLoader().setDecoderPath('./assets/draco/');const loader=new GLTFLoader().setDRACOLoader(draco);
 const gltf=await loader.loadAsync('./assets/m-logo.glb');const nodes=['M','M001','M002'].map(name=>gltf.scene.getObjectByName(name));
 if(nodes.some(n=>!n))throw new Error('Original M geometry missing');
 const destinations=[[7,3.75,7],[-5,-2.75,-5],[2.5,1.375,2.5]],starts=[[5,-20,5],[-5,-10,-5],[-7,-15,-8]];
 const meshes=nodes.map((n,i)=>{const m=new THREE.Mesh(n.geometry,materials[i]);m.scale.setScalar(4.8);m.position.set(...(reduced?destinations[i]:starts[i]));group.add(m);return m});
 const postScene=new THREE.Scene(),postCamera=new THREE.OrthographicCamera(-1,1,1,-1,0,1);
 const post=new THREE.ShaderMaterial({depthTest:false,depthWrite:false,uniforms:{map:{value:finalTarget.texture},time:{value:0},pixel:{value:new THREE.Vector2()}},vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}',fragmentShader:`uniform sampler2D map;uniform float time;uniform vec2 pixel;varying vec2 vUv;
 float random(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453);}
 void main(){vec2 uv=vUv;float line=step(mod(-time,5.)*.5-.005,uv.y)*step(uv.y,mod(-time,5.)*.5+.005);uv+=line*.01;vec3 col=texture2D(map,uv).rgb;vec3 glow=vec3(0.);for(int x=-2;x<=2;x++){for(int y=-2;y<=2;y++){vec3 c=texture2D(map,uv+vec2(float(x),float(y))*pixel*3.).rgb;glow+=max(c-vec3(.35),vec3(0.))/25.;}}col+=glow*.95;vec2 v=(vUv-.5)*.75;col=mix(col,vec3(0.),dot(v,v)*.4);col=pow(max(col,vec3(0.)),vec3(1./2.2));col*=1.-.56*smoothstep(.15,.72,length(vUv-.5));col=col*1.12-random(uv+time*.01)*.02;gl_FragColor=vec4(col,1.);}`});postScene.add(new THREE.Mesh(new THREE.PlaneGeometry(2,2),post));
 let pointer=0,time=0,last=0,elapsed=0,rotation=0;const controller=document.querySelector('#scene-controller');
 controller?.addEventListener('input',()=>{rotation=(Number(controller.value)-.5)*Math.PI*4});
 addEventListener('pointermove',e=>{pointer=(e.clientX/innerWidth-.5)*2});
 function resize(){const w=canvas.clientWidth,h=canvas.clientHeight;renderer.setSize(w,h,false);camera.left=-w/60;camera.right=w/60;camera.top=h/60;camera.bottom=-h/60;camera.updateProjectionMatrix();group.scale.setScalar(Math.max(Math.min(1.25*w/h,1.15),.75));const d=renderer.getPixelRatio();[targetA,targetB,finalTarget].forEach(t=>t.setSize(w*d,h*d));materials.forEach(m=>m.uniforms.winResolution.value.set(w*d,h*d));post.uniforms.pixel.value.set(1/(w*d),1/(h*d))}resize();addEventListener('resize',resize);
 function frame(now){requestAnimationFrame(frame);const dt=Math.min((now-last)/1000,.05);last=now;if(!paused){time+=dt;elapsed+=dt;}const damping=1-Math.exp(-dt*3);if(!paused){group.rotation.y+=(rotation-group.rotation.y)*(1-Math.exp(-dt*2));meshes.forEach((m,i)=>{m.position.lerp(new THREE.Vector3(...destinations[i]),1-Math.exp(-dt*2.4));const r=group.rotation.y;m.rotation.set(i===1?-r:r,i===2?-r:0,0)});group.position.y=Math.sin(time)*.85;group.rotation.x=Math.cos(time)/80;group.rotation.z=Math.sin(time)/80;const intro=reduced?0:-Math.PI/3*Math.exp(-elapsed*1.8);camera.position.lerp(new THREE.Vector3(12-12*Math.sin(intro)+pointer*1.75,6-15*Math.sin(intro),12*Math.cos(intro)-pointer*1.75),damping);camera.lookAt(0,0,0);}
 if(scrollY>story.offsetHeight)return;post.uniforms.time.value=time;
 meshes.forEach(m=>m.visible=false);renderer.setRenderTarget(targetB);renderer.render(scene,camera);
 meshes.forEach((m,i)=>{m.visible=true;const u=materials[i].uniforms;u.uSceneTex.value=targetB.texture;u.uRefractPower.value=.9;u.uTransparent.value=.05*(innerWidth<innerHeight?2:1);materials[i].side=THREE.BackSide});renderer.setRenderTarget(targetA);renderer.render(scene,camera);
 meshes.forEach((m,i)=>{const u=materials[i].uniforms;u.uSceneTex.value=targetA.texture;u.uRefractPower.value=.7;u.uTransparent.value=.05*(innerWidth<innerHeight?2:1);materials[i].side=THREE.FrontSide});renderer.setRenderTarget(finalTarget);renderer.render(scene,camera);renderer.setRenderTarget(null);renderer.render(postScene,postCamera);
 }requestAnimationFrame(frame);
}catch(error){console.error('3D scene unavailable',error);motion.hidden=true;document.querySelector('.scene').classList.add('scene-error');}
