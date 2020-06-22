// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE = `
  attribute vec4 a_Position;
  uniform float u_Size;
  void main() {
    gl_Position = a_Position;
    //gl_PointSize = 10.0;
    gl_PointSize = u_Size;
  }`

// Fragment shader program
var FSHADER_SOURCE = `
  precision mediump float;
  uniform vec4 u_FragColor;
  void main() {
    gl_FragColor = u_FragColor;
  }`

var VSHADER_SOURCE_1 = `
  attribute vec4 p_Position;
  uniform float p_Size;
  void main() {
    gl_Position = p_Position;
    //previewGl_PointSize = 10.0;
    gl_PointSize = p_Size;
  }`

// Fragment shader program
var FSHADER_SOURCE_1 = `
  precision mediump float;
  uniform vec4 p_FragColor;
  void main() {
    gl_FragColor = p_FragColor;
  }`  

// Global Variables 
let canvas;
let gl;
let preview;
let previewGl;
let a_Position; 
let p_Position;
let u_FragColor;
let p_FragColor; 
let u_Size;
let p_Size;


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

  // Second WebGL context for bonus
  preview = document.getElementById('preview');
  previewGl = preview.getContext("webgl", {preserveDrawingBuffer: true});
  if (!previewGl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }
  previewGl.clearColor(0.0, 0.0, 0.0, 1.0);
  previewGl.clear(previewGl.COLOR_BUFFER_BIT);

}

function connectVariablesToGLSL(){
  // Initialize shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }

  a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return;
  }

  u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
  if (!u_FragColor) {
    console.log('Failed to get the storage location of u_FragColor');
    return;
  }

  u_Size = gl.getUniformLocation(gl.program, 'u_Size');
  if(!u_Size){
    console.log('Failed to get the storage location of u_Size');
    return;
  }

  // Initialize bonus shaders
  if (!initShaders(previewGl, VSHADER_SOURCE_1, FSHADER_SOURCE_1)) {
    console.log('Failed to intialize shaders.');
    return;
  }

  p_Position = previewGl.getAttribLocation(previewGl.program, 'p_Position');
  if (p_Position < 0) {
    console.log('Failed to get the storage location of p_Position');
    return;
  }

  p_FragColor = previewGl.getUniformLocation(previewGl.program, 'p_FragColor');
  if (!p_FragColor) {
    console.log('Failed to get the storage location of p_FragColor');
    return;
  }

  p_Size = previewGl.getUniformLocation(previewGl.program, 'p_Size');
  if(!u_Size){
    console.log('Failed to get the storage location of p_Size');
    return;
  }  
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
let g_preview; // initialized in main via updatePreview();
let g_shapes = [];

// Set up actions for the HTML UI elements 
function addActionsForHtmlUI(){
    
    //Button Events (Shape Type)
    
    /* document.getElementById('green').onclick = function() {g_selectedColor = [0.0, 1.0, 0.0, 1.0]; };
    document.getElementById('red').onclick = function() {g_selectedColor = [1.0, 0.0, 0.0, 1.0]; };*/
    document.getElementById('clearButton').onclick = function() { 
      gl.clear(gl.COLOR_BUFFER_BIT); 
      g_shapes = [];

      };

    document.getElementById('pointButton').onclick = function() {
        g_selectedType = POINT;
        updatePreview();
      };
    document.getElementById('triButton').onclick = function() {
        g_selectedType = TRIANGLE;
        updatePreview();
      };
    document.getElementById('circleButton').onclick = function() {
        g_selectedType = CIRCLE;
        updatePreview();
      };
    // Color Slider Events
    document.getElementById('redSlide')
      .addEventListener('mouseup', function() {
          g_selectedColor[0] = this.value/100;
          updatePreview();
        });
    document.getElementById('greenSlide')
      .addEventListener('mouseup', function() {
          g_selectedColor[1] = this.value/100;
          updatePreview();
        });
    document.getElementById('blueSlide')
      .addEventListener('mouseup', function() {
          g_selectedColor[2] = this.value/100;
          updatePreview();
        });

    // Size Slider Events
    document.getElementById('sizeSlide')
      .addEventListener('mouseup', function() {
          g_selectedSize = this.value;
          updatePreview();
        });
    document.getElementById('segSlide')
      .addEventListener('mouseup', function() {
          g_selectedSegment = this.value;
          updatePreview();
        });
    
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
  gl.clear(gl.COLOR_BUFFER_BIT);

  updatePreview();
}

function buildPreview(){ 
  if(g_selectedType == POINT) {
    g_preview = new Point(); 
  } else if(g_selectedType == TRIANGLE){
    g_preview = new Triangle(); 
  } else{
    g_preview = new Circle();
    g_preview.segments = g_selectedSegment;
  }
  g_preview.color = g_selectedColor.slice(); 
  g_preview.size = g_selectedSize;
}

function updatePreview() {
  buildPreview();
  previewGl.clear(gl.COLOR_BUFFER_BIT);
  g_preview.renderPreview();  
}

function renderAllShapes() {
  g_shapes[g_shapes.length - 1].render();
}

function click(ev) {

  // Extract the event click and return it in WebGL Coordinates 
  let [x,y] = convertCoordinatesEventToGL(ev); 

  // Create and store the new point 
  g_preview.position = [x,y]; 

  g_shapes.push(g_preview);

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
