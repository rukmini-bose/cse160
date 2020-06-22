class Triangle{
  constructor(){
    this.type='triangle';
    this.position = [0.0, 0.0, 0.0, 0.0];
    this.color = [1.0, 1.0, 1.0, 1.0]; 
    this.size = 5.0; 
  }

//Render this shape
  render(){
      var xy = this.position;
      var rgba = this.color;
      var size = this.size; 

      /* var xy = g_shapesList[i].position;
      var rgba = g_shapesList[i].color;
      var size = g_shapesList[i].size; */ 

      // Pass the position of a point to a_Position variable
      //gl.vertexAttrib3f(a_Position, xy[0], xy[1], 0.0);

      // Pass the color of a point to u_FragColor variable
      gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

      //Pass the color of a point to u_FragColor variable 
      gl.uniform1f(u_Size, 4.0);

      // Draw
      var d = this.size/200.0; // delta
      drawTriangle([xy[0], xy[1], xy[0]+d, xy[1], xy[0], xy[1]+d] );
      //gl.drawArrays(gl.POINTS, 0, 1);    
  }  

  renderPreview() {
    var xy = this.position;
    var rgba = this.color;
    var size = this.size; 

    /* var xy = g_shapesList[i].position;
    var rgba = g_shapesList[i].color;
    var size = g_shapesList[i].size; */ 

    // Pass the position of a point to a_Position variable
    //gl.vertexAttrib3f(a_Position, xy[0], xy[1], 0.0);

    // Pass the color of a point to u_FragColor variable
    previewGl.uniform4f(p_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

    //Pass the color of a point to u_FragColor variable 
    previewGl.uniform1f(p_Size, size);

    // Draw
    var d = this.size/50.0; // delta
    drawTrianglePreview([-d/2, -d/2, d/2, -d/2, -d/2, +d/2]);
    //gl.drawArrays(gl.POINTS, 0, 1);
  }
}

function drawTriangle(vertices) {
  var n = 3; // The number of vertices

  // Create a buffer object
  var vertexBuffer = gl.createBuffer();
  if (!vertexBuffer) {
    console.log('Failed to create the buffer object');
    return -1;
  }

  // Bind the buffer object to target
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  
  // Write date into the buffer object
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.DYNAMIC_DRAW);

  // Assign the buffer object to a_Position variable
  gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);

  // Enable the assignment to a_Position variable
  gl.enableVertexAttribArray(a_Position);

  gl.drawArrays(gl.TRIANGLES, 0, n);

}

function drawTrianglePreview(vertices) {
//  var vertices = new Float32Array([
//    0, 0.5,   -0.5, -0.5,   0.5, -0.5
//  ]);
  var n = 3; // The number of vertices

  // Create a buffer object
  var vertexBuffer = previewGl.createBuffer();
  if (!vertexBuffer) {
    console.log('Failed to create the buffer object');
    return -1;
  }

  // Bind the buffer object to target
  previewGl.bindBuffer(previewGl.ARRAY_BUFFER, vertexBuffer);
  
  // Write date into the buffer object
  previewGl.bufferData(previewGl.ARRAY_BUFFER, new Float32Array(vertices), previewGl.DYNAMIC_DRAW);

  // Assign the buffer object to a_Position variable
  previewGl.vertexAttribPointer(p_Position, 2, previewGl.FLOAT, false, 0, 0);

  // Enable the assignment to a_Position variable
  previewGl.enableVertexAttribArray(p_Position);

  previewGl.drawArrays(previewGl.TRIANGLES, 0, n);
  //return n;
}

function drawTriangle3D(vertices) {
  var n = 3; // The number of vertices

  // Create a buffer object
  var vertexBuffer = gl.createBuffer();
  if (!vertexBuffer) {
    console.log('Failed to create the buffer object');
    return -1;
  }

  // Bind the buffer object to target
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  
  // Write date into the buffer object
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.DYNAMIC_DRAW);

  // Assign the buffer object to a_Position variable
  gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);

  // Enable the assignment to a_Position variable
  gl.enableVertexAttribArray(a_Position);

  gl.drawArrays(gl.TRIANGLES, 0, n);
}

function drawTriangle3DUV(vertices, uv){
  var n = 3; // The number of vertices

  // ----------------- 
  // ---- Create a buffer object for positions 
  var vertexBuffer = gl.createBuffer(); 
  if(!vertexBuffer){
    console.log('Failed to create the buffer object'); 
    return -1;
  }

  // Bind the buffer object to target
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

  // Write date into the buffer object 
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.DYNAMIC_DRAW);

  //Assign the buffer object to a_Position variable 
  gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);

  // Enable the assignment to a_Position variable 
  gl.enableVertexAttribArray(a_Position);

  // --------------------
  // -------- Create a buffer object for UV 
  var uvBuffer = gl.createBuffer(); 
  if(!uvBuffer){
    console.log('Failed to create the buffer object');
    return -1; 
  }

  // Bind the buffer object to target 
  gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);

  // Write date into the buffer object
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(uv), gl.DYNAMIC_DRAW);

  // Assign the buffer object to a_Position variable 
  gl.vertexAttribPointer(a_UV, 2, gl.FLOAT, false, 0, 0);

  // Enable the assignment to a_Position variable
  gl.enableVertexAttribArray(a_UV);

  // -------------------- 
  //-------- Draw the triangle 
  gl.drawArrays(gl.TRIANGLES, 0, n);

}
