// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE = `
  precision mediump float;
  attribute vec4 a_Position;
  attribute vec2 a_UV;
  varying vec2 v_UV; 
  uniform mat4 u_ModelMatrix; 
  uniform mat4 u_GlobalRotateMatrix;
  uniform mat4 u_ViewMatrix;
  uniform mat4 u_ProjectionMatrix;
  void main() {
    gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_GlobalRotateMatrix * u_ModelMatrix * a_Position; 
    v_UV = a_UV;

  }`

// Fragment shader program
var FSHADER_SOURCE = `
  precision mediump float;
  varying vec2 v_UV;
  uniform vec4 u_FragColor;
  uniform sampler2D u_Sampler0;
  uniform sampler2D u_Sampler1;
  uniform sampler2D u_Sampler2;
  uniform sampler2D u_Sampler3;
  uniform int u_whichTexture;
  void main() {
    if(u_whichTexture == -2){
      gl_FragColor = u_FragColor; // Use color

    } else if(u_whichTexture == -1){
      gl_FragColor = vec4(v_UV, 1.0, 1.0); // Use UV Debug color 
    
    } else if(u_whichTexture == 0){
      gl_FragColor = texture2D(u_Sampler0, v_UV); // use texture0

    } else if(u_whichTexture == 1){
      gl_FragColor = texture2D(u_Sampler1, v_UV);
    } else if(u_whichTexture == 2){
      gl_FragColor = texture2D(u_Sampler2, v_UV);
    } else if(u_whichTexture == 3){
      gl_FragColor = texture2D(u_Sampler3, v_UV);
    }
    else{
      gl_FragColor = vec4(1, .2, .2, 1); // Error, put Redish
    }
  }`

// Global Variables 
let canvas;
let gl;
let a_Position; 
let a_UV;
let u_FragColor; 
let u_Size;
let u_ModelMatrix;
let u_ProjectionMatrix;
let u_ViewMatrix;
let u_GlobalRotateMatrix;
let u_whichTexture;

function setupWebGL(){
  // Retrieve <canvas> element
  canvas = document.getElementById('webgl');

  // Get the rendering context for WebGL
  // gl = getWebGLContext(canvas);
  gl = canvas.getContext("webgl", {preserveDrawingBuffer: true}); // stops lagging on canvas
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }
  gl.enable(gl.DEPTH_TEST); 

}


function connectVariablesToGLSL(){
  // Initialize shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }

   // Get the storage location of a_Position
  a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return;
  }

  // Get the storage location of a_Position
  a_UV = gl.getAttribLocation(gl.program, 'a_UV');
  if(a_UV < 0) {
    console.log('Failed to get the storage location of a_UV');
    return;
  }

// Get the storage location of u_FragColor
  u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
  if (!u_FragColor) {
    console.log('Failed to get the storage location of u_FragColor');
    return;
  }

  // Get the storage location of u_ModelMatrix: 
  u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
  if (!u_ModelMatrix){
    console.log('Failed to get the storage location of u_ModelMatrix');
    return;
  }

  // Get the storage location of u_GlobalRotateMatrix
  u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, 'u_GlobalRotateMatrix');
  if(!u_GlobalRotateMatrix){
    console.log('Failed to get the storage location of u_GlobalRotateMatrix'); 
    return; 
  }
  
  // Get the storage location of u_GlobalRotateMatrix 
  u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix');
  if(!u_ViewMatrix){
    console.log('Failed to get the storage location of u_ViewMatrix');
    return;
  }

  // Get the storage location of u_GlobalRotateMatrix
  u_ProjectionMatrix = gl.getUniformLocation(gl.program, 'u_ProjectionMatrix');
  if(!u_ProjectionMatrix){
    console.log('Failed to get the storage location of u_ProjectionMatrix');
    return; 
  }

  // Get the storage location of u_GlobalRotateMatrix
  u_Sampler0 = gl.getUniformLocation(gl.program, 'u_Sampler0');
  if(!u_Sampler0){
    console.log('Failed to get the storage location of u_Sampler0');
    return;
  }

  u_Sampler1 = gl.getUniformLocation(gl.program, 'u_Sampler1');
  if(!u_Sampler1){
    console.log('Failed to get the storage location of u_Sampler1');
    return;
  }

  u_Sampler2 = gl.getUniformLocation(gl.program, 'u_Sampler2');
  if(!u_Sampler2){
    console.log('Failed to get the storage location of u_Sampler2');
    return;
  }
   u_Sampler3 = gl.getUniformLocation(gl.program, 'u_Sampler3');
  if(!u_Sampler3){
    console.log('Failed to get the storage location of u_Sampler3');
    return;
  }

  u_whichTexture = gl.getUniformLocation(gl.program, 'u_whichTexture');
  if(!u_whichTexture){
    console.log('Failed to get the storage location of u_whichTexture');
    return;
  }

  // Set an initial value for this matrix to identify 
  var identityM = new Matrix4(); 
  gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);

}


// Constants 
const POINT = 0; 
const TRIANGLE = 1; 
const CIRCLE = 2; 

// Globals related to UI Elements

let g_selectedColor = [1.0, 1.0, 1.0, 1.0]; 
let g_selectedSize = 5; 
let g_selectedType = POINT; 
let g_selectedSegment = 10;
let g_shapes = [];
let g_globalAngle = 0;
let g_yellowAngle = 45;
// let g_magentaAngle = 45;
// let g_yellowAnimation = false;
// let g_magentaAnimation = false;

let hair_Angle = 180; 
let hairAnimation = false;
let leftPupil_Angle = 180; 
let leftPupilAnimation = false;
let leftEye_Angle = 0;
let leftEyeAnimation = false; 
let rightEye_Angle = 0; 
let rightEyeAnimation = false;
let rightPupil_Angle = 180; 
let rightPupilAnimation = false;
let headAnimation = false; 
let head_Angle = 0; 

let rightTopArmAnimation = false;
let rightTopArm_Angle = 0; 
let rightElbowAnimation = false; 
let rightElbow_Angle = 0;
let leftElbowAnimation = false; 
let leftElbow_Angle = 0; 
let leftTopArmAnimation = false;
let leftTopArm_Angle = 0;

let leftLegAnimation = false; 
let leftLeg_Angle = 0;
let rightLegAnimation = false;
let rightLeg_Angle = 0;



// Set up actions for the HTML UI elements 
function addActionsForHtmlUI(){
  }
    
function initTextures() {
  var image0 = new Image();
  var image1 = new Image(); // Create the image object
  var image2 = new Image();
  var image3 = new Image();

  if(!image0 || !image1 || !image2 || !image3){
    console.log('Failed to create the image object'); 
    return false;
  }

  // Register the event handler to be called on loading an image
  image0.onload = function() {
    sendImageToTEXTURE(image0, 0);
    //sendImageToTEXTURE0(image1);
  }
  image1.onload = function(){
    sendImageToTEXTURE(image1, 1);
  }

  image2.onload = function(){
    sendImageToTEXTURE(image2, 2);
  }

  image3.onload = function(){
    sendImageToTEXTURE(image3, 3);
    renderAllShapes();
  }

  // Tell the browser to load an image
  image0.src = 'ground.jpg';
  image1.src = 'sky.jpg';
  image2.src = 'wall.jpg';
  image3.src = 'bush.jpg';

  // Add more textures later 

  return true;
}

function sendImageToTEXTURE(image, idx) {
  var texture = gl.createTexture(); // Create a texture object 
  if(!texture){
    console.log('Failed to create the texture object'); 
    return false;
  }

  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); // Flip the image's y axis

  if (idx == 0) {
    // Enable texture unit0
    gl.activeTexture(gl.TEXTURE0);    
  } else if (idx == 1) {
    gl.activeTexture(gl.TEXTURE1);
  } else if(idx == 2){
    gl.activeTexture(gl.TEXTURE2);
  } else if(idx ==3){
    gl.activeTexture(gl.TEXTURE3);
  }

  //Bind the texture object to the target
  gl.bindTexture(gl.TEXTURE_2D, texture);

  //Set the texture parameters 
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

  // Set the texture image
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);

  if (idx == 0) {
    // Enable texture unit0
    gl.uniform1i(u_Sampler0, 0);
  } else if (idx == 1) {
    gl.uniform1i(u_Sampler1, 1);
  } else if(idx == 2){
    gl.uniform1i(u_Sampler2, 2);
  } else if(idx == 3){
    gl.uniform1i(u_Sampler3, 3);
  }

  // gl.clear(gl.COLOR_BUFFER_BIT); // Clear <canvas> 
  // gl.drawArrays(gl.TRIANGLE_STRIP, 0, n); // Draw the rectangle 
  console.log('finished loadTexture');
}


function keydown(ev){
    if(ev.keyCode == 68){ // right arrow 
        g_camera.moveRight();
    } else if(ev.keyCode == 65){ // a arrow
      g_camera.moveLeft(); 
    } else if(ev.keyCode == 87){ // w arrow
        g_camera.moveForward();
    } else if(ev.keyCode == 83){ // s arrow
        g_camera.moveBackward();
    } else if(ev.keyCode == 81){ // q key
        g_camera.panLeft();
    } else if(ev.keyCode == 69){ // e key
        g_camera.panRight();
    } else if(ev.keyCode == 32){ // space bar
        canvas.addEventListener('mousedown', function(e) {
            // const coord = getCursorPosition(canvas, e);
            const coord = convertCoordinatesEventToGL(e);
            addBlock(g_camera.at.elements[0] + coord.x, g_camera.at.elements[1] + coord.y);
        });
    } else if(ev.keyCode == 8){ // back space
        deleteBlock();
    }
    renderAllShapes();
}

const g_camera = new Camera();
let projMat;
let viewMat;
let globalRotMat;

function initProjectionMatrix() {
  projMat = new Matrix4();
  projMat.setPerspective(60, 1*canvas.width/canvas.height, 1, 100);
  gl.uniformMatrix4fv(u_ProjectionMatrix, false, projMat.elements);
}

function updateViewMatrix() {
  viewMat.setLookAt(
    g_camera.eye.elements[0], g_camera.eye.elements[1], g_camera.eye.elements[2],
    g_camera.at.elements[0], g_camera.at.elements[1], g_camera.at.elements[2],
    g_camera.up.elements[0], g_camera.up.elements[1], g_camera.up.elements[2]);
}

function initViewMatrix() {
  viewMat = new Matrix4();
  updateViewMatrix();
}

function initGlobalRotationMatrix() {
  globalRotMat = new Matrix4();
}

function updateGlobalRotationMatrix() {
  globalRotMat.rotate(g_globalAngle, 0, 1, 0);
}

function renderAllShapes() {

  // Pass the projection matrix

  // Pass the view matrix
  updateViewMatrix();
  
  gl.uniformMatrix4fv(u_ViewMatrix, false, viewMat.elements);

   // Pass the matrix to u_ModelMatrix attribute: 
  updateGlobalRotationMatrix();
  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);

  // Clear canvas: 
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.clear(gl.COLOR_BUFFER_BIT);

  renderScene();
  renderCustomBlocks();
}

// BORDERS 
var g_horizontalMap = [
  [10,0,0,0,0,0,0,0],
  [10,0,0,0,0,0,0,0],
  [10,0,0,0,0,0,0,0],
  [10,0,0,0,0,0,0,0],
  [10,0,0,0,0,0,0,0],
  [10,0,0,0,0,0,0,0],
  [10,0,0,0,0,0,0,0],
  [10,0,0,0,0,0,0,0],
]; 

var g_verticalMap = [
    [10, 10, 10, 10, 10, 10, 10, 10],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
];

// 25 x 25 
var g_mazeMap = [
[10, 0, 0, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10],
[10, 0, 0, 0,   0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0, 10],
[10, 0, 0, 0,   0,  10, 10, 10, 0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0, 10],
[10, 0, 0, 10,  10, 10, 10, 10, 10, 10, 0,  0,  0,  10, 10, 10, 10, 0,  0,  0,  0,  0,  0,  0, 10],
[10, 0, 0, 10,  0,  0,  10, 0,  0,  0,  0,  0,  10, 0,  0,  0,  0,  0,  0,  10, 10, 10, 0,  0, 10],
[10, 0, 0, 10,  0,  0,  10, 0,  0,  0,  0,  0,  10, 0,  0,  0,  0,  0,  0,  0,  0,  10, 10, 10, 10],
[10, 0, 0, 10,  0,  0,  10, 0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  10],
[10, 0, 0, 10,  0,  0,  10, 0,  0,  0,  0, 10, 0, 0,  0,  0,  0,  10, 0, 0, 10, 0,  0,  0,  10],
[10, 0, 0, 10,  0,  0,  0,  0,  0,  10, 10, 10, 10, 0,  0,  0,  0,  0,  0,  10, 10, 0,  0,  0,  10],
[10, 0, 0, 0,   0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  10, 10, 0,  0,  0,  10],
[10, 0, 0, 10,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  10, 10, 0,  0,  0,  10],
[10, 0, 0, 10,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  10, 10, 10, 0,  0,  10],
[10, 0, 0, 10,  0,  0,  10, 0,  0,  0,  0, 0, 0, 0, 0, 0, 0, 10, 10, 10, 0,  0,  0,  0,  10],
[10, 0, 0, 10,  0,  0,  10, 0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  10, 0,  0,  10],
[10, 0, 0, 0,   0,  0,  0, 0,  0,  0,  0,  0,  0,  10, 10, 0, 10,  10, 10, 10, 0, 10, 0,   0,  10],
[10, 0, 0, 0,   0,  0,  0, 0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0, 10, 0,   0,  10],
[10, 0, 0, 10,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0, 10,  10, 10, 0,  0, 10, 0,   0,  10],
[10, 0, 0, 10,  0,  0,  10, 0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0, 10, 0,   0,  10],
[10, 0, 0, 10,  0,  0,  10, 10, 0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0, 10, 0,   0,  10],
[10, 0, 0, 10,  0,  0,  10, 10, 10, 0,  0,  0,  0,  0,  0,  0,  10, 0,  0,  0,  0, 10, 0,   0,  10],
[10, 0, 0, 10,  0,  0,  0,  0,  0,  0,  0,  0, 10,  0,  0,  0,  10, 0,  0,  0,  0,  0,  0,  0,  10],
[10, 0, 0, 10,  0,  0,  10, 0,  10, 0,  0,  0, 10,  0,  0,  0,  10, 0,  0,  0,  0,  0,  0,  0,  10],
[10, 0, 0, 10,  0,  0,  10, 10, 10, 0,  10, 0, 10,  0,  0,  0,  10, 10, 10, 10, 0,  0,  0,  10, 10],
[10, 0, 0, 10,  0,  0,  0,  0,  0,  0,  10, 10,10,  10, 0,  0,  10, 0,  0,  0,  0,  0,  0,  0,  10],
[0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
];
// Rows: Along Y axis 
// Columns: Along X Axis



function drawMap(){
  for(let x = 0; x < 8; x++){
    for(let y = 0; y < 8; y++){
      if(g_horizontalMap[x][y] == 10){
        var body = new Cube();
        body.color = [.64, .17, .17, 1];
        body.textureNum = 3;
        //body.matrix.translate(0,0,0);
        body.matrix.translate(39,1,-22);
        body.matrix.scale(12,25,1);
        body.matrix.translate(x-4, -.17, y-6);
        body.render();
      }
      if(g_verticalMap[x][y] == 10){
        var body = new Cube();
        body.color = [.64, 0, .17, 1];
        body.textureNum = 3;
        body.matrix.translate(-.5 , 1, 33);
        body.matrix.scale(1, 25 , 8);
        body.matrix.translate(x-4, -.17, y-6);
        body.render();
      }
    }
}
   for(let x = 0; x < 25; x++){
        for(let y = 0; y < 25; y++){
          if(g_mazeMap[x][y] == 10){
            var body = new Cube();
            body.color = [1, 0, 0, 1];
            body.textureNum = 2;
            body.matrix.translate(4.5, -.5, -7);
            body.matrix.scale(2,2,2);
            body.matrix.translate(x-4, -.17, y-6);
            body.render();
            }
        }
    }

}


function renderScene(){

  drawMap();

  // Draw the floor
  var floor = new Cube();
  floor.color = [0, .7, 0, 1];
  floor.textureNum = 0; 
  floor.matrix.scale(90, -1, 80);
  floor.matrix.translate(-.06, 0, -.3);
  floor.render();


  // Draw the sky
  var sky7 = new Cube();
  sky7.textureNum = 1; 
  sky7.matrix.translate(-10,-60,-29);
  sky7.matrix.scale(100,100,100);
  sky7.render();

    //Head: 
  var head = new Cube();
  head.color = [.84, .58, 0.43, 1.0];
  head.matrix.translate(-.23, .50, 0);
  head.matrix.scale(.5, .4, .2);
  head.matrix.rotate(head_Angle, 0, 1, 0);
  let headMatrixForHair = new Matrix4(head.matrix);
  let headMatrixForREye = new Matrix4(head.matrix);
  let headMatrixForLEye = new Matrix4(head.matrix);
  head.render();

  // Hair: 
  var hair = new Cube(); 
  hair.color = [1,1,0,1];
  hair.matrix = headMatrixForHair;
  hair.matrix.translate(0,1,0);
  hair.matrix.scale(1,.2,1);
  hair.render();

  // Left Eye: 
  var leftEye = new Cube(); 
  leftEye.color = [1,1,1,1];
  leftEye.matrix = headMatrixForLEye;
  leftEyeMatrix = new Matrix4(leftEye.matrix);
  leftEye.matrix.translate(.16, .6, -.02);
  leftEye.matrix.scale(.13, .15, .02);
  leftEye.matrix.rotate(leftEye_Angle, 0, 1, 0);
  leftEye.render();

  // // Left Pupil: 
  var leftPupil = new Cube(); 
  leftPupil.color = [0,0,0,1];
  leftPupil.matrix = leftEyeMatrix;
  leftPupil.matrix.translate(.17, .6, -.02);
  leftPupil.matrix.scale(.07,.15,.02);
  leftPupil.matrix.rotate(leftPupil_Angle, 0, 1, 0);
  leftPupil.render();

  // Right Eye:  
  var rightEye = new Cube(); 
  rightEye.color = [1,1,1,1];
  rightEye.matrix = headMatrixForREye;
  rightEye.matrix.translate(.7, .6, -.02);
  rightEye.matrix.scale(.13, .15, .02);
  rightEyeMatrix = new Matrix4(rightEye.matrix);
  rightEye.render();

  // // Right Pupil: 
  var rightPupil = new Cube(); 
  rightPupil.color = [0,0,0,1];
  rightPupil.matrix = rightEyeMatrix;
  rightPupil.matrix.translate(-.08, .025, -.02);
  rightPupil.matrix.scale(.5, 1, .02);
  rightPupil.matrix.rotate(rightPupil_Angle, 0, 1, 0);
  rightPupil.render();

  // Mouth: 
  var mouth = new Cube(); 
  mouth.color = [1,0,0,1];
  mouth.matrix.translate(-.03, .6, -.01);
  mouth.matrix.scale(.1, .01, .08);
  mouth.render();

  // Body:
  var body = new Cube(); 
  body.color = [1.0, 0.0, 0.0, 1.0];
  body.matrix.translate(-.26, -.2,-.01);
  //body.matrix.rotate(-5, 1, 0, 0);
  body.matrix.scale(.52,.70,.33);
  body.render();

  // Left Shirt Arm: 
  var leftShirtArm = new Cube();
  leftShirtArm.color = [1.0, 0, 0.0, 1.0];
  leftShirtArm.matrix.translate(-.54, .20, 0);
  leftShirtArm.matrix.scale(.30, .3, .35);
  leftShirtArm.render();

  // Left Top Arm: 
  var leftTopArm = new Cube();
  leftTopArm.color = [.84, .58, 0.43, 1.0];
  leftTopArm.matrix.setTranslate(0, 0, 0);
  leftTopArm.matrix.rotate(leftTopArm_Angle, 1, 0, 0);
  var leftTopArmMatrix = new Matrix4(leftTopArm.matrix);
  leftTopArm.matrix.translate(-.28, .25, .29);
  leftTopArm.matrix.scale(-.24, -.59, -.2);
  // leftTopArm.matrix.rotate(leftTopArm_Angle, 1, 0, 0);
  leftTopArm.render();

  // Left Elbow: 
  var leftElbow = new Cube(); 
  leftElbow.color = [.84, .58, 0.43, 1.0];
  leftElbow.matrix = leftTopArmMatrix;
  leftElbow.matrix.translate(-0.28, -.23, .09);
  leftElbow.matrix.rotate(leftElbow_Angle, 1,0,0);
  leftElbow.matrix.scale(-.24, -.2, -.38);
  leftElbow.render();

  // // Right Shirt Arm: 
  var rightShirtArm = new Cube();
  rightShirtArm.color = [1.0, 0, 0.0, 1.0];
  rightShirtArm.matrix.translate(.25, .2, 0);
  rightShirtArm.matrix.scale(.3, .3, .35);
  //rightShirtArm.matrix.rotate(rightShirt_Angle, 1,0,0);
  rightShirtArm.render();

  // Right Top Arm: 
  var rightTopArm = new Cube();
  rightTopArm.color = [.84, .58, 0.43, 1.0];
  rightTopArm.matrix.setTranslate(0, 0, 0);
  rightTopArm.matrix.rotate(rightTopArm_Angle, 1, 0, 0);
  var rightTopArmMatrix = new Matrix4(rightTopArm.matrix);
  rightTopArm.matrix.translate(.51, .33, .12);
  rightTopArm.matrix.scale(-.24, -.75, .2);
  rightTopArm.render();

  // Right Elbow: 
  var rightElbow = new Cube(); 
  rightElbow.color = [.84, .58, 0.43, 1.0];
  rightElbow.matrix = rightTopArmMatrix;
  rightElbow.matrix.translate(.51, -.23, .12);
  rightElbow.matrix.rotate(rightElbow_Angle, 1, 0, 0);
  rightElbow.matrix.scale(-.24, -.2, -.25);
  rightElbow.render();

  // Crotch: 
  var crotch = new Cube(); 
  crotch.color = [0,0,1,1];
  crotch.matrix.translate(-.25, -.45, 0);
  crotch.matrix.scale(.5, .4, .3);
  crotch.render();

  // Left Leg: 
  var leftLeg = new Cube();
  leftLeg.color = [0,0,1,1];
  leftLeg.matrix.translate(-.02, -.4, -.0005);
  leftLeg.matrix.scale(-.23, -.5, .2);
  leftLeg.matrix.rotate(leftLeg_Angle, 1,0,0);
  var leftLegMatrix = new Matrix4(leftLeg.matrix);
  leftLeg.render();

  //Right leg: 
  var rightLeg = new Cube();
  rightLeg.color = [0,0,1,1];
  rightLeg.matrix.translate(.25, -.4, -.0005);
  rightLeg.matrix.scale(-.23, -.5, .2);
  rightLeg.matrix.rotate(rightLeg_Angle, 1, 0, 0);
  rightLeg.render();
}

function click(ev) {
  // Draw the shape that is supposed to be in the canvas 
  renderAllShapes();
}


function convertCoordinatesEventToGL(ev){
  var x = ev.clientX; // x coordinate of a mouse pointer
  var y = ev.clientY; // y coordinate of a mouse pointer
  var rect = ev.target.getBoundingClientRect();

  x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
  y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);

  return {"x": x, "y": y};
  // return([x,y]);
}


// Set the text of a HTML element 
function sendTextToHTML(text, htmlID){
  var htmlElm = document.getElementById(htmlID);
  if(!htmlElm){
    console.log("Failed to get " + htmlID + " from HTML"); 
    return;
  }

  htmlElm.innerHTML = text; 
}

// Create a rotation matrix 
let rotationMatrix = new Matrix4(); 
rotationMatrix.setRotate(45, 0, 0, 1);
console.log(rotationMatrix.elements);

let customBlocks = [];

function renderCustomBlocks() {
    customBlocks.forEach(block => block.render());
}

function addBlock(x, y){
    console.log(x);
    console.log(y);
    var addCube = new Cube(); 
    addCube.textureNum = 2;
    addCube.matrix.translate(x,y, g_camera.at.elements[2]);
    addCube.scale = [1, 1, 1];
    customBlocks.push(addCube);
    addCube.render();
}

function deleteBlock(x,y){
    customBlocks = [];

}

function main() {
  // Set up canvas and gl variables
  setupWebGL();

  // Set up GLSL shader program and connect GLSL variables
  connectVariablesToGLSL();

  // Set up actions for the HTML UI elements 
  addActionsForHtmlUI();  

  // // Register function (event handler) to be called on a mouse press
  canvas.onmousedown = click;
  // // canvas.onmousemove = click; 
  // canvas.onmousemove = function(ev) { if(ev.buttons == 1) { click(ev) } };

  document.onkeydown = keydown; 
  
  initTextures();

  // Specify the color for clearing <canvas>
  gl.clearColor(0.09, 0.05, 0.10, 1.0);

  initProjectionMatrix();
  initViewMatrix();
  initGlobalRotationMatrix();

}




