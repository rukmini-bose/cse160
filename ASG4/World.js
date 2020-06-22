// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE = `
  precision mediump float;
  attribute vec4 a_Position;
  attribute vec2 a_UV;
  attribute vec3 a_Normal;
  varying vec2 v_UV; 
  varying vec3 v_Normal;
  varying vec4 v_VertPos;
  uniform mat4 u_ModelMatrix; 
  uniform mat4 u_GlobalRotateMatrix;
  uniform mat4 u_ViewMatrix;
  uniform mat4 u_ProjectionMatrix;

  void main() {
    gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_GlobalRotateMatrix * u_ModelMatrix * a_Position; 
    v_UV = a_UV;
    v_Normal = a_Normal; 
    v_VertPos = u_ModelMatrix * a_Position;

  }`

// Fragment shader program
var FSHADER_SOURCE = `
  precision mediump float;
  varying vec2 v_UV;
  varying vec3 v_Normal; 
  uniform vec4 u_FragColor;
  uniform sampler2D u_Sampler0;
  uniform sampler2D u_Sampler1;
  uniform sampler2D u_Sampler2;
  uniform sampler2D u_Sampler3;
  uniform sampler2D u_Sampler4;
  uniform sampler2D u_Sampler5;
  uniform int u_whichTexture;
  uniform vec3 u_lightPos; 
  uniform vec3 u_cameraPos;
  varying vec4 v_VertPos; 
  uniform bool u_lightOn;

  uniform vec3 u_lightPos2;  
  uniform bool u_SpotOn; 


  void main() {
    if(u_whichTexture == -3){
      gl_FragColor = vec4((v_Normal + 1.0)/ 2.0, 1.0);      // Use Normal 
    } else if(u_whichTexture == -2){
      gl_FragColor = u_FragColor;                           // Use color
    } else if (u_whichTexture == -1){
      gl_FragColor = vec4(v_UV, 1.0, 1.0);                  // Use UV Debug color 
    } else if(u_whichTexture == 0){
      gl_FragColor = texture2D(u_Sampler0, v_UV);           // ground
    } else if(u_whichTexture == 1){
      gl_FragColor = texture2D(u_Sampler1, v_UV);           // sky
    } else if(u_whichTexture == 2){
      gl_FragColor = texture2D(u_Sampler2, v_UV);           // wall
    } else if(u_whichTexture == 3){
      gl_FragColor = texture2D(u_Sampler3, v_UV);           // bush
    } else if(u_whichTexture == 4){
        gl_FragColor = texture2D(u_Sampler4, v_UV);         // fire
    } else if(u_whichTexture == 5){
        gl_FragColor = texture2D(u_Sampler5, v_UV);         // skin 
    } else{
      gl_FragColor = vec4(1, .2, .2, 1);                    // Error, put Redish
    }
    
   // vec3 lightVector = u_lightPos - vec3(v_VertPos);

    vec3 lightVector = vec3(v_VertPos) - u_lightPos; 
    vec3 spotVector = u_lightPos2 - vec3(v_VertPos); 
    
    float r = length(lightVector);
    float r2 = length(spotVector); 

    // // Red/Green Distance Visualization
    // if(r < 1.0 ){
    //   gl_FragColor = vec4(1,0,0,1);
    // } else if(r < 2.0 ){
    //   gl_FragColor = vec4(0, 1, 0, 1);
    // }

    // Light Falloff Visualization 1/r^2
    // gl_FragColor = vec4(vec3(gl_FragColor)/(r*r),1);

    // N dot L
    vec3 L = normalize(lightVector);
    vec3 N = normalize(v_Normal); 
    float nDotL = max(dot(N,L), 0.0);


    vec3 L2 = normalize(spotVector);
    vec3 N2 = normalize(v_Normal); 
    float nDotL2 = max(dot(-N2,L2), 0.0); // spotCosineCutOff 

    vec3 normalized = normalize(vec3(spotVector - u_lightPos2));
    float theta = acos(dot(normalized, vec3(0,1,0))) -  3.14159265359/2.0;



//     // Reflection
    vec3 R = reflect(-L,N);
    //vec3 R2 = reflect(-L2, N2); 

//     // eye 
    vec3 E = normalize(u_cameraPos - vec3(v_VertPos));


//     // Specular 
    float specular = pow(max(dot(E,R), 0.0), 10.0);
    //float specular2 = pow(max(dot(E,R2), 0.0), 5.0);

    // Diffuse
    vec3 diffuse = vec3(gl_FragColor) * nDotL * .7; 
    vec3 diffuse2 = vec3(gl_FragColor) * nDotL * .6;

    // ambient
    vec3 ambient = vec3(gl_FragColor) * .3; // light
    vec3 ambient2 = vec3(gl_FragColor) * .5;  // spotlight
    vec3 ambient3 = vec3(gl_FragColor) * .7; // both light and spotlight




    if (u_lightOn) {
      if(u_SpotOn && abs(theta) < 0.5) {
        gl_FragColor = vec4(specular  + diffuse + diffuse2 + ambient3, 1);    
      }  else{
        gl_FragColor = vec4(specular + diffuse + ambient, 1);
      }
    } else if (u_SpotOn ) {
        if(abs(theta) < 0.5){
          gl_FragColor = vec4(diffuse2 + ambient2, 1);
        } 
        // else{
        //     gl_FragColor = vec4(diffuse2 + ambient, 1);
        // }

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
let a_Normal;
let u_lightPos;
let u_lightPos2; 
let u_cameraPos;
let u_lightOn;
let u_SpotOn;

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

  // Get the storage location of a_Normal; 
  a_Normal = gl.getAttribLocation(gl.program, 'a_Normal');
  if(a_Normal < 0){
      console.log('Failed to get the storage location of a_Normal');
      return;
  }

  // Get the storage location of u_FragColor
  u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
  if (!u_FragColor) {
    console.log('Failed to get the storage location of u_FragColor');
    return;
  }

  // Get the storage location of u_lightPos
  u_lightPos = gl.getUniformLocation(gl.program, 'u_lightPos');
  if (!u_lightPos) {
    console.log('Failed to get the storage location of u_lightPos');
    return;
  }

  // Get the storage location of u_lightPos2
  u_lightPos2 = gl.getUniformLocation(gl.program, 'u_lightPos2');
  if (!u_lightPos2) {
    console.log('Failed to get the storage location of u_lightPos2');
    return;
  }

  // Get the storage location of u_lightOn
  u_lightOn = gl.getUniformLocation(gl.program, 'u_lightOn');
  if (!u_lightOn) {
    console.log('Failed to get the storage location of u_lightOn');
    return;
  }

  // Get the storage location of u_SpotOn
  u_SpotOn = gl.getUniformLocation(gl.program, 'u_SpotOn');
  if (!u_SpotOn) {
    console.log('Failed to get the storage location of u_SpotOn');
    return;
  }

  // Get the storage location of u_cameraPos
  u_cameraPos = gl.getUniformLocation(gl.program, 'u_cameraPos');
  if (!u_cameraPos) {
    console.log('Failed to get the storage location of u_cameraPos');
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

  u_Sampler4 = gl.getUniformLocation(gl.program, 'u_Sampler4');
  if(!u_Sampler4){
    console.log('Failed to get the storage location of u_Sampler4');
    return;
  }

  u_Sampler5 = gl.getUniformLocation(gl.program, 'u_Sampler5');
  if(!u_Sampler5){
    console.log('Failed to get the storage location of u_Sampler5');
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
let animation = false; 

let g_normalOn = false; 
let g_lightPos = [0,1,-2];
let g_lightOn = false; 

let g_lightPos2 = [10, 1, 0];
let g_SpotOn = false; 


// Set up actions for the HTML UI elements 
function addActionsForHtmlUI(){
    // Button Events 
    document.getElementById('normalOn').onclick = function(){
        g_normalOn = true;
        renderAllShapes();
    };
    document.getElementById('normalOff').onclick = function(){
        g_normalOn = false; 
        renderAllShapes();

    };

    document.getElementById('lightSlideX').addEventListener('mousemove', function(ev){
      if(ev.buttons == 1){
        g_lightPos[0] = this.value/100; 
        renderAllShapes();
      }
    }); 

    document.getElementById('lightSlideY').addEventListener('mousemove', function(ev){
      if(ev.buttons == 1){
        g_lightPos[1] = this.value/100; 
        renderAllShapes();
      }
    }); 

    document.getElementById('lightSlideZ').addEventListener('mousemove', function(ev){
      if(ev.buttons == 1){
        g_lightPos[2] = this.value/100; 
        renderAllShapes();
      }
    }); 

    document.getElementById('lightOn').onclick = function(){
        g_lightOn = true;
        renderAllShapes();
    };
    document.getElementById('lightOff').onclick = function(){
        g_lightOn = false; 
        renderAllShapes();

    };

    document.getElementById('spotOn').onclick = function(){
        g_SpotOn = true;
        renderAllShapes();
    };
    document.getElementById('spotOff').onclick = function(){
        g_SpotOn = false; 
        renderAllShapes();
    };

    document.getElementById('animateOn').onclick = function(){
        animation = true; 
        renderAllShapes();
    };

    document.getElementById('animateOff').onclick = function(){
        animation = false; 
        renderAllShapes();
    };

    canvas.onmousemove = function(ev){
        if(ev.buttons == 1){
            click(ev)
        }
    }
  }
    
function initTextures() {
  var image0 = new Image();
  var image1 = new Image(); // Create the image object
  var image2 = new Image();
  var image3 = new Image();
  var image4 = new Image();
  var image5 = new Image();

  if(!image0 || !image1 || !image2 || !image3 || !image4 || !image5){
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

  image4.onload = function(){
    sendImageToTEXTURE(image4, 4);
    renderAllShapes();
  }

  image5.onload = function(){
  sendImageToTEXTURE(image5, 5);
  renderAllShapes();
  }

  // Tell the browser to load an image
  image0.src = 'ground.jpg';
  image1.src = 'sky.jpg';
  image2.src = 'wall.jpg';
  image3.src = 'bush.jpg';
  image4.src = 'fire.jpg';
  image5.src = 'skin.jpg';
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
  } else if(idx == 4){
    gl.activeTexture(gl.TEXTURE4);
  } else if(idx == 5){
    gl.activeTexture(gl.TEXTURE5);
  }

  //Bind the texture object to the target
  gl.bindTexture(gl.TEXTURE_2D, texture);

  //Set the texture parameters 
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

  // Set the texture image
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);

  if (idx == 0) {
    gl.uniform1i(u_Sampler0, 0);
  } else if (idx == 1) {
    gl.uniform1i(u_Sampler1, 1);
  } else if(idx == 2){
    gl.uniform1i(u_Sampler2, 2);
  } else if(idx == 3){
    gl.uniform1i(u_Sampler3, 3);
  } else if(idx == 4){
    gl.uniform1i(u_Sampler4, 4);
  } else if(idx == 5){
    gl.uniform1i(u_Sampler5, 5);
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
  projMat.setPerspective(82, 1*canvas.width/canvas.height, 1, 100);
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

  if(animation){
    g_lightPos[0] = 15 * Math.cos(g_seconds);
    //g_lightPos[1] = 5* Math.cos(g_seconds);
  //g_lightPos[2] = 5* Math.cos(g_seconds);
  }
  


  // if(headAnimation){
  //   head_Angle = (-10+10*(Math.sin(3*g_seconds)));
  // }

  // if(leftLegAnimation){
  //   leftLeg_Angle = (20* (Math.cos(1.5*g_seconds)));
  // }
  // if(rightLegAnimation){
  //   // rightLeg_Angle = (-20 + 45 * Math.abs(Math.cos(1.5*g_seconds)));
  //   rightLeg_Angle = (-20* (Math.cos(1.5*g_seconds)));
  // }


  // if(leftTopArmAnimation){
  //   leftTopArm_Angle = (-20+ 20 * (Math.abs(Math.sin(3*g_seconds))));
  // }
  // if(leftElbowAnimation){
  //   leftElbow_Angle = ( -10 + 50 * (Math.sin(2*g_seconds)));
  // }

  // if(rightTopArmAnimation){
  //   rightTopArm_Angle = (-20+ 20 * (Math.abs(Math.cos(3*g_seconds))));
  // }

  // if(rightElbowAnimation){
  //   //rightElbow_Angle = (-90 * (Math.abs(Math.sin(3*g_seconds))));
  //   rightElbow_Angle = ( -10 - 50 * (Math.sin(2*g_seconds)));
  // }
}

function renderAllShapes() {

  // Pass the projection matrix
  var startTime = performance.now()


  // Pass the view matrix
  updateViewMatrix();
  
  gl.uniformMatrix4fv(u_ViewMatrix, false, viewMat.elements);

   // Pass the matrix to u_ModelMatrix attribute: 
  updateGlobalRotationMatrix();
  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);

  // Clear canvas: 
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.clear(gl.COLOR_BUFFER_BIT);

  // Pass the light position to GLSL: 
  gl.uniform3f(u_lightPos, g_lightPos[0], g_lightPos[1], g_lightPos[2]);
  gl.uniform3f(u_lightPos2, g_lightPos2[0], g_lightPos2[1], g_lightPos2[2]);

  // Pass the camera position to GLSL; 
  gl.uniform3f(u_cameraPos, g_camera.at.elements[0], g_camera.at.elements[1], g_camera.at.elements[2]);

  // Pass the light status
  gl.uniform1i(u_lightOn, g_lightOn);
  gl.uniform1i(u_SpotOn, g_SpotOn);

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

// // 25 x 25 
// var g_mazeMap = [
// [10, 0, 0, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
// [10, 0, 0, 0,   0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0, 0],
// [10, 0, 0, 0,   0,  10, 0, 0, 0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0, 0],
// [10, 0, 0, 10,  10, 10, 0, 10, 10, 10, 0,  0,  0,  10, 10, 10, 10, 0,  0,  0,  0,  0,  0,  0, 0],
// [10, 0, 0, 10,  0,  0,  0, 0,  0,  0,  0,  0,  10, 0,  0,  0,  0,  0,  0,  10, 10, 10, 0,  0, 0],
// [10, 0, 0, 10,  0,  0,  10, 0,  0,  0,  0,  0,  10, 0,  0,  0,  0,  0,  0,  0,  0,  10, 10, 10, 0],
// [10, 0, 0, 10,  0,  0,  10, 0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0],
// [10, 0, 0, 10,  0,  0,  10, 0,  0,  0,  0, 10, 0, 0,  0,  0,  0,  10, 0, 0, 10, 0,  0,  0,  0],
// [10, 0, 0, 10,  0,  0,  0,  0,  0,  10, 10, 10, 10, 0,  0,  0,  0,  0,  0,  10, 10, 0,  0,  0,  0],
// [10, 0, 0, 0,   0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  10, 10, 0,  0,  0,  0],
// [0, 0, 0, 10,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  10, 10, 0,  0,  0,  0],
// [0, 0, 0, 10,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0, 0, 0, 0,  0,  0],
// [0, 0, 0, 10,  0,  0,  10, 0,  0,  0,  0, 0, 0, 0, 0, 0, 0, 10, 10, 10, 0,  0,  0,  0,  0],
// [0, 0, 0, 10,  0,  0,  10, 0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0, 0,  0,  0],
// [0, 0, 0, 0,   0,  0,  0, 0,  0,  0,  0,  0,  0,  0, 0, 0, 0,  0, 0, 0, 0, 0, 0,   0,  0],
// [0, 0, 0, 0,   0,  0,  0, 0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0, 0, 0,   0,  0],
// [0, 0, 0, 10,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0, 0,  0, 0, 0,  0, 0, 0,   0,  0],
// [0, 0, 0, 10,  0,  0,  10, 0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0, 0, 0,   0,  0],
// [0, 0, 0, 10,  0,  0,  10, 10, 0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0, 0, 0,   0,  0],
// [0, 0, 0, 10,  0,  0,  10, 10, 10, 0,  0,  0,  0,  0,  0,  0,  0, 0,  0,  0,  0, 0, 0,   0,  0],
// [0, 0, 0, 10,  0,  0,  0,  0,  0,  0,  0,  0, 0,  0,  0,  0,  0, 0,  0,  0,  0,  0,  0,  0,  0],
// [0, 0, 0, 10,  0,  0,  10, 0,  10, 0,  0,  0, 0,  0,  0,  0,  0, 0,  0,  0,  0,  0,  0,  0,  0],
// [0, 0, 0, 10,  0,  0,  10, 10, 10, 0,  10, 0, 0,  0,  0,  0,  0, 0, 0, 0, 0,  0,  0,  0, 0],
// [0, 0, 0, 10,  0,  0,  0,  0,  0,  0,  0, 0,0,  10, 0,  0,  10, 0,  0,  0,  0,  0,  0,  0,  0],
// [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
//

var g_mazeMap = [

[0, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 0],
[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 10],
[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 10],
[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 10],
[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 10],
[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 10],
[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 10],
[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 10],
[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 10],
[0, 0, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10]
];

// Rows: Along Y axis 
// Columns: Along X Axis



function drawMap(){
  for(let x = 0; x < 4; x++){
    for(let y = 0; y < 4; y++){
      if(g_horizontalMap[x][y] == 10){
        var body = new Cube();
        body.color = [.64, .17, .17, 1];
        body.textureNum = 3;
        //body.matrix.translate(0,0,0);
        body.matrix.translate(39,1,-22);
        body.matrix.scale(12,25,1);
        body.matrix.translate(x-4, -.17, y-6);
        //body.render();
      }
      if(g_verticalMap[x][y] == 10){
        var body = new Cube();
        body.color = [.64, 0, .17, 1];
        body.textureNum = 3;
        body.matrix.translate(-.5 , 1, 33);
        body.matrix.scale(1, 21 , 8);
        body.matrix.translate(x-4, -.25, y-6);
        //body.render();
      }
    }
  }
  // for(let x = 0; x < 25; x++){
  //   for(let y = 0; y < 25; y++){
  //     if(g_mazeMap[x][y] == 10){
  //       var body = new Cube();
  //       body.color = [1, 0, 0, 1];
  //       body.textureNum = 2;
  //       body.matrix.translate(4.5, -.5, -7);
  //       body.matrix.scale(2,2,2);
  //       body.matrix.translate(x-4, -.17, y-6);
  //       body.render();
  //     }
  //   }
  // }


for(let x = 0; x < 10; x++){
    for(let y = 0; y < 13; y++){
      if(g_mazeMap[x][y] == 10){
        var body = new Cube();
        body.color = [1, 0, 0, 1];
        body.textureNum = 2;
        if(g_normalOn){
          body.textureNum = -3;
        }
        body.matrix.translate(4.5, -.5, -7);
        body.matrix.scale(2,8,2);
        body.matrix.translate(x-4, -.17, y-6);
        body.render();
      }
    }
  }
}
function renderScene(){

  drawMap();

  // // Draw the light 
  // var light = new Cube();
  // light.color = [1,0,0,1];
  // light.textureNum = -1;
  // light.matrix.translate(g_lightPos[0], g_lightPos[1], g_lightPos[2]);
  // light.matrix.scale(-.5,-.5,-.5);
  // light.matrix.translate(10, -12, 40);
  // light.render();

  var light = new Sphere(); 
  light.color = [1,0,0,1];
  light.textureNum = 4; 
  if(g_normalOn){
    light.textureNum = -3;
  }
  light.matrix.translate(g_lightPos[0], g_lightPos[1], g_lightPos[2]);
  light.matrix.scale(-.5, -.5, -.5, -.5);
  light.matrix.translate(-3, -10, 10);
  light.render();

  // Draw the sphere
  var testSphere = new Sphere(); 
  testSphere.textureNum = -1;
  if(g_normalOn){
    testSphere.textureNum = -3;
  }
  testSphere.matrix.scale(.5, .5, .5, .5);
  testSphere.matrix.translate(0, 0, -5.5);
  //testSphere.render();



  // Draw the floor
  var floor = new Cube();
  floor.color = [0, .7, 0, 1];
  floor.textureNum = 0; 
  if(g_normalOn){
    floor.textureNum = -3;
  }
  floor.matrix.scale(45, -1, 80);
  floor.matrix.translate(-.66, 0, -.3);
  floor.render();


  // Draw the sky
  var sky7 = new Cube();
  sky7.color = [0, 0, 1, 1.0];
  sky7.textureNum = 1;
  if(g_normalOn){
     sky7.textureNum = -3;
   }
  sky7.matrix.translate(-10,-60,-29);
  sky7.matrix.scale(100,100,100);
  sky7.render();

  // //Head: 
  // var head = new Cube();
  // head.color = [.84, .58, 0.43, 1.0];
  // head.matrix.translate(-.23, .50, 0);
  // head.matrix.scale(.5, .4, -.2);
  // //head.matrix.rotate(head_Angle, 0, 1, 0);
  // let headMatrixForHair = new Matrix4(head.matrix);
  // let headMatrixForREye = new Matrix4(head.matrix);
  // let headMatrixForLEye = new Matrix4(head.matrix);
  //head.render();

  var head = new Sphere(); 
  //head.color = [.84, .58, 0.43, 1.0];
  head.textureNum = 5;
  //head.color = [0, 2, 0, 1];
  head.matrix.translate(0, .9, 0);
  head.matrix.scale(.4, .4, .4, .4);
  if(g_normalOn){
    head.textureNum = -3;
  }
  head.render();

 
  // Body:
  var body = new Cube(); 
  body.color = [1.0, 0.0, 0.0, 1.0];
  body.matrix.translate(-.26, -.2,-.01);
  //body.matrix.rotate(-5, 1, 0, 0);
  body.matrix.scale(.52,.70,.33);
  if(g_normalOn){
    body.textureNum = -3;
  }
  body.render();

  // Left Shirt Arm: 
  var leftShirtArm = new Cube();
  leftShirtArm.color = [1.0, 0, 0.0, 1.0];
  leftShirtArm.matrix.translate(-.54, .20, 0);
  leftShirtArm.matrix.scale(.30, .3, .35);
  if(g_normalOn){
    leftShirtArm.textureNum = -3;
  }
  leftShirtArm.render();

  // Left Top Arm: 
  var leftTopArm = new Cube();
  leftTopArm.color = [.91, .79, .67, 1.0];
  leftTopArm.matrix.setTranslate(0, 0, 0);
  //leftTopArm.matrix.rotate(leftTopArm_Angle, 1, 0, 0);
  var leftTopArmMatrix = new Matrix4(leftTopArm.matrix);
  leftTopArm.matrix.translate(-.28, .25, .29);
  leftTopArm.matrix.scale(-.24, -.59, -.2);
  if(g_normalOn){
    leftTopArm.textureNum = -3;
  }
  leftTopArm.render();

  // Left Elbow: 
  var leftElbow = new Cube(); 
  leftElbow.color = [.91, .79, .67, 1.0];
  leftElbow.matrix = leftTopArmMatrix;
  leftElbow.matrix.translate(-0.28, -.23, .09);
  //leftElbow.matrix.rotate(leftElbow_Angle, 1,0,0);
  leftElbow.matrix.scale(-.24, -.2, -.38);
  if(g_normalOn){
    leftElbow.textureNum = -3;
  }
  leftElbow.render();

  // // Right Shirt Arm: 
  var rightShirtArm = new Cube();
  rightShirtArm.color = [1.0, 0, 0.0, 1.0];
  rightShirtArm.matrix.translate(.25, .2, 0);
  rightShirtArm.matrix.scale(.3, .3, .35);
  if(g_normalOn){
    rightShirtArm.textureNum = -3;
  }
  rightShirtArm.render();

  // Right Top Arm: 
  var rightTopArm = new Cube();
  rightTopArm.color = [.91, .79, .67, 1.0];
  rightTopArm.matrix.setTranslate(0, 0, 0);
  //rightTopArm.matrix.rotate(rightTopArm_Angle, 1, 0, 0);
  var rightTopArmMatrix = new Matrix4(rightTopArm.matrix);
  rightTopArm.matrix.translate(.51, .33, .12);
  rightTopArm.matrix.scale(-.24, -.75, .2);
  if(g_normalOn){
    rightTopArm.textureNum = -3;
  }
  rightTopArm.render();

  // Right Elbow: 
  var rightElbow = new Cube(); 
  rightElbow.color = [.91, .79, .67, 1.0];
  rightElbow.matrix = rightTopArmMatrix;
  rightElbow.matrix.translate(.51, -.23, .12);
  //rightElbow.matrix.rotate(rightElbow_Angle, 1, 0, 0);
  rightElbow.matrix.scale(-.24, -.2, -.25);
  if(g_normalOn){
    rightElbow.textureNum = -3;
  }
  rightElbow.render();

  // Crotch: 
  var crotch = new Cube(); 
  crotch.color = [0,0,1,1];
  crotch.matrix.translate(-.25, -.45, 0);
  crotch.matrix.scale(.5, .4, .3);
  if(g_normalOn){
    crotch.textureNum = -3;
  }
  crotch.render();

  // Left Leg: 
  var leftLeg = new Cube();
  leftLeg.color = [0,0,1,1];
  leftLeg.matrix.translate(-.02, -.4, -.0005);
  leftLeg.matrix.scale(-.23, -.5, .2);
  //leftLeg.matrix.rotate(leftLeg_Angle, 1,0,0);
  var leftLegMatrix = new Matrix4(leftLeg.matrix);
  if(g_normalOn){
    leftLeg.textureNum = -3;
  }
  leftLeg.render();

  //Right leg: 
  var rightLeg = new Cube();
  rightLeg.color = [0,0,1,1];
  rightLeg.matrix.translate(.25, -.4, -.0005);
  rightLeg.matrix.scale(-.23, -.5, .2);
  if(g_normalOn){
    rightLeg.textureNum = -3;
  }
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
    //addCube.textureNum = 2;
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

  requestAnimationFrame(tick);
}

var g_startTime = performance.now()/1000.0; 
var g_seconds = performance.now()/1000.0-g_startTime; 



