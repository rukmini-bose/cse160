// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE = `
  attribute vec4 a_Position;
  uniform mat4 u_ModelMatrix; 
  uniform mat4 u_GlobalRotateMatrix;
  void main() {
    gl_Position = u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
  }`

// Fragment shader program
var FSHADER_SOURCE = `
  precision mediump float;
  uniform vec4 u_FragColor;
  void main() {
    gl_FragColor = u_FragColor;
  }`

// Global Variables 
let canvas;
let gl;
let a_Position; 
let u_FragColor; 
let u_Size;
let u_ModelMatrix;
let u_GlobalRotateMatrix;

function setupWebGL(){
  // Retrieve <canvas> element
  canvas = document.getElementById('webgl');

  // Get the rendering context for WebGL
  // gl = getWebGLContext(canvas);
  gl = canvas.getContext("webgl", {preserveDrawingBuffer: false}); // stops lagging on canvas
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

  u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, 'u_GlobalRotateMatrix');
  if(!u_GlobalRotateMatrix){
    console.log('Failed to get the storage location of u_GlobalRotateMatrix'); 
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

// let leftShoeAnimation = true; 
// let leftShoe_Angle = 0; 

// let rightShoeAnimation = true; 
// let rightShoe_Angle = 0; 

// let rightShirtAnimation = true; 
// let rightShirt_Angle = 0;




// Set up actions for the HTML UI elements 
function addActionsForHtmlUI(){

    // Button Events: 

    document.getElementById('animationLeftArmOffButton').onclick = function(){
      leftTopArmAnimation=false;
    };

    document.getElementById('animationLeftArmOnButton').onclick = function(){
      leftTopArmAnimation=true; 
    };

    document.getElementById('animationLeftElbowOnButton').onclick = function(){ 
      leftElbowAnimation = true;
    };

    document.getElementById('animationLeftElbowOffButton').onclick = function(){
      leftElbowAnimation = false;
    };

    document.getElementById('animationRightElbowOnButton').onclick = function(){ 
      rightElbowAnimation = true;
    };

    document.getElementById('animationRightArmOffButton').onclick = function(){
      rightTopArmAnimation=false;
    };

    document.getElementById('animationRightArmOnButton').onclick = function(){
      rightTopArmAnimation=true; 
    };
    document.getElementById('animationRightElbowOffButton').onclick = function(){
      rightElbowAnimation = false;
    };

    document.getElementById('animationLegOnButton').onclick = function(){ 
      leftLegAnimation = true; 
      rightLegAnimation = true;
    };

    document.getElementById('animationLegOffButton').onclick = function(){
      leftLegAnimation = false;
      rightLegAnimation = false;
    };

    document.getElementById('armSlide').addEventListener('mousemove', function(){
        leftTopArm_Angle = this.value; renderAllShapes();
        //leftElbow_Angle = this.value; renderAllShapes();
    });

    document.getElementById('elbowSlide').addEventListener('mousemove', function(){
        //leftTopArm_Angle = this.value; renderAllShapes();
        leftElbow_Angle = this.value; renderAllShapes();
    });

    // Size Slider Events: 
    document.getElementById('horizontalAngleSlide')
      .addEventListener('mousemove', function() {
          g_globalAngle = this.value;
          renderAllShapes(); 
        });

    document.getElementById('animationOn').onclick = function(){
          headAnimation = true; 
          hairAnimation = true;
          leftPupilAnimation = true; 
          leftEyeAnimation = true; 
          leftTopArmAnimation = true;
          leftElbowAnimation = true; 
          leftLegAnimation = true; 
          rightTopArmAnimation = true; 
          rightElbowAnimation = true;
          rightLegAnimation = true 
        };

    document.getElementById('animationOff').onclick = function(){
          headAnimation = false; 
          hairAnimation = false;
          leftPupilAnimation = false; 
          leftEyeAnimation = false; 
          leftTopArmAnimation = false;
          leftElbowAnimation = false; 
          leftLegAnimation = false; 
          rightTopArmAnimation = false; 
          rightElbowAnimation = false; 
          rightLegAnimation = false;
        };
  }
    


function main() {
  // Set up canvas and gl variables
  setupWebGL();

  // Set up GLSL shader program and connect GLSL variables
  connectVariablesToGLSL();

  // Set up actions for the HTML UI elements 
  addActionsForHtmlUI();
  
  // Register function (event handler) to be called on a mouse press
  canvas.onmousedown = click;
  // canvas.onmousemove = click; 
  canvas.onmousemove = function(ev) { if(ev.buttons == 1) { click(ev) } };

  // Specify the color for clearing <canvas>
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  // Clear <canvas>
  //gl.clear(gl.COLOR_BUFFER_BIT);
  //renderAllShapes();
  requestAnimationFrame(tick);
}

var g_startTime = performance.now()/1000.0; 
var g_seconds = performance.now()/1000.0-g_startTime; 


// Called by browser repeatedly whenever its time 
function tick(){
  // Save the current time
  g_seconds = performance.now()/1000.0-g_startTime;
  //console.log(g_seconds);

  //Update animation angles:
  updateAnimationAngles();

  // Draw Everything: 
  renderAllShapes();

  // Tell the browser to update again when it has time 
  requestAnimationFrame(tick);
}

// Update the angles of everything if currently animated 
function updateAnimationAngles(){

  if(headAnimation){
    head_Angle = (-10+10*(Math.sin(3*g_seconds)));
  }

  if(leftLegAnimation){
    leftLeg_Angle = (20* (Math.cos(1.5*g_seconds)));
  }
  if(rightLegAnimation){
    // rightLeg_Angle = (-20 + 45 * Math.abs(Math.cos(1.5*g_seconds)));
    rightLeg_Angle = (-20* (Math.cos(1.5*g_seconds)));
  }


  if(leftTopArmAnimation){
    leftTopArm_Angle = (-20+ 20 * (Math.abs(Math.sin(3*g_seconds))));
  }
  if(leftElbowAnimation){
    leftElbow_Angle = ( -10 + 50 * (Math.sin(2*g_seconds)));
  }

  if(rightTopArmAnimation){
    rightTopArm_Angle = (-20+ 20 * (Math.abs(Math.cos(3*g_seconds))));
  }

  if(rightElbowAnimation){
    //rightElbow_Angle = (-90 * (Math.abs(Math.sin(3*g_seconds))));
    rightElbow_Angle = ( -10 - 50 * (Math.sin(2*g_seconds)));
  }
}

function renderAllShapes() {


   // Pass the matrix to u_ModelMatrix attribute: 
  var globalRotMat = new Matrix4().rotate(g_globalAngle, 0, 1, 0);
  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);


  // Clear canvas: 
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.clear(gl.COLOR_BUFFER_BIT);

  renderScene();


}

function renderScene(){
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

  return([x,y]);
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















