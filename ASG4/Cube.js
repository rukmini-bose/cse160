class Cube{
    constructor(){

        this.type = 'cube'; 
        //this.position = [0.0, 0.0, 0.0];
        this.color = [1.0, 1.0, 1.0, 1.0];
        //this.size = 5.0;
        //this.segments = 2; 
        this.matrix = new Matrix4();
        //this.normalMatrix = new Matrix4();
        this.textureNum = -2;
    }

    render(){
        //var xy = this.position;
        var rgba = this.color;
        //var size = this.size; 
        //var segments = this.segments; 

        // Pass the texture number
        gl.uniform1i(u_whichTexture, this.textureNum);

        // Pass the color of a point to u_FragColor variable
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

        // Pass the matrix to a u_ModelMatrix attribute
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

        //Front of cube: 
        drawTriangle3DUVNormal(
            [0,0,0, 1,1,0,  1,0,0],
            [0,0,   1,1,    1,0],
            [0,0,-1,    0,0,-1, 0,0,-1]);
        drawTriangle3DUVNormal(
            [0,0,0,  0,1,0,  1,1,0], 
            [0,0,   0,1,    1,1],
            [0,1,0, 0,1,0,  0,1,0]);

        // Pass the color of a point to the u_FragColor uniform variable 
       // gl.uniform4f(u_FragColor, rgba[0]*.9, rgba[1]*.9, rgba[2]*.9, rgba[3]);

        //Top of cube: 
        drawTriangle3DUVNormal(
            [0,1,0, 0,1,1,  1,1,1],
            [0,0,   0,1,    1,1],
            [0,1,0, 0,1,0,  0,1,0]);
        drawTriangle3DUVNormal(
            [0,1,0, 1,1,1,  1,1,0],
            [0,0,   1,1,    1,0],
            [0,1,0, 0,1,0,  0,1,0]);


        // Pass the color of a point to the u_FragColor uniform variable 
        //gl.uniform4f(u_FragColor, rgba[0]*.8, rgba[1]*.8, rgba[2]*.8, rgba[3]);
        
        // Right of cube: 
        //gl.uniform4f(u_FragColor, rgba[0]*.8, rgba[1]*.8, rgba[2]*.8, rgba[3]);
        drawTriangle3DUVNormal(
            [1,1,0, 1,1,1,  1,0,0],
            [0,0,   0,1,    1,1],
            [1,0,0, 1,0,0,  1,0,0]);
        drawTriangle3DUVNormal(
            [1,0,0, 1,1,1,  1,0,1],
            [0,0,   1,1,    1,0],
            [1,0,0, 1,0,0,  1,0,0]);


        // Left of cube: 
       //gl.uniform4f(u_FragColor, rgba[0]*.8, rgba[1]*.8, rgba[2]*.8, rgba[3]);
        drawTriangle3DUVNormal(
            [0,0,0, 0,1,0,  0,0,1],
            [0,0,   0,1,    1,1],
            [-1,0,0, -1,0,0, -1,0,0]);
        drawTriangle3DUVNormal(
            [0,0,1, 0,1,1,  0,1,0],
            [1,0,   0,1,    1,1],
            [-1,0,0, -1,0,0, -1,0,0]);


        // Bottom of cube: 
        //gl.uniform4f(u_FragColor, rgba[0]*.8, rgba[1]*.8, rgba[2]*.8, rgba[3]);
        drawTriangle3DUVNormal(
            [0,0,0, 0,0,1, 1,0,1],
            [0,0,   0,1,    1,1],
            [0,-1,0, 0,-1,0,  0,-1,0]);
        drawTriangle3DUVNormal(
            [0,0,0, 0,0,1, 1,0,1],
            [0,0,   1,1,    1,0],
            [0,-1,0, 0,-1,0,  0,-1,0]);


        // Back of cube: 
        //gl.uniform4f(u_FragColor, rgba[0]*.8, rgba[1]*.8, rgba[2]*.8, rgba[3]);
        drawTriangle3DUVNormal(
            [0,0,1, 0,1,1,  1,0,1],
            [0,0,   0,1,    1,1],
            [0,0,1, 0,0,1,  0,0,1]);
        drawTriangle3DUVNormal(
            [1,1,1, 1,0,1,  0,1,1],
            [0,0,   1,1,    1,0],
            [0,0,1, 0,0,1,  0,0,1]);

        // // Top of cube: 
        // drawTriangle3DUV([0,1,0, 0,1,1, 1,1,1], [1,0, 0,1, 1,1]);
        // drawTriangle3DUV([0,1,0, 1,1,1, 1,1,0], [1,0, 0,1, 1,1]);

        // //Right Side:
        // drawTriangle3DUV([1,0,0,  1,0,1,  1,1,0], [1,0, 0,1, 1,1]);
        // drawTriangle3DUV([1,1,0,  1,1,1,  1,0,1], [1,0, 0,1, 1,1]);

        // // Left Side:
        // drawTriangle3DUV([0,0,0,  0,1,0,  0,0,1], [1,0, 0,1, 1,1]);
        // drawTriangle3DUV([0,0,1,  0,1,1,  0,1,0], [1,0, 0,1, 1,1]);

        // // Back Side: 
        // drawTriangle3DUV([0,0,1,  0,1,1,  1,0,1], [1,0, 0,1, 1,1]);
        // drawTriangle3DUV([1,1,1,  1,0,1,  0,1,1], [1,0, 0,1, 1,1]);

        // // Bottom: 
        // drawTriangle3DUV([0,0,0,  0,0,1,  1,0,0], [1,0, 0,1, 1,1]);
        // drawTriangle3DUV([0,0,1,  1,0,1,  1,0,0], [1,0, 0,1, 1,1]);


    } 

    renderfast() {
        //var xy = this.position;
        var rgba = this.color;
        //var size = this.size; 
        //var segments = this.segments; 

        // Pass the texture number
        gl.uniform1i(u_whichTexture, this.textureNum);

        // Pass the color of a point to u_FragColor variable
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

        // Pass the matrix to a u_ModelMatrix attribute
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

        var allverts = []; 
        var allvertsUV = [];
        var vertsUV = [];


        //Right face
        allverts = allverts.concat([1.0, -1.0,  1.0, 1.0, -1.0, -1.0,   1.0,  1.0, -1.0]);
        allverts = allverts.concat([1.0, -1.0,  1.0,  1.0,  1.0, -1.0, 1.0,  1.0,  1.0]);
        allvertsUV = allvertsUV.concat([0,0, 0,1, 1,1]);
        allvertsUV = allvertsUV.concat([0,0, 1,1, 1,0]);
        //Left Face
        allverts = allverts.concat([-1.0, -1.0, -1.0, -1.0, -1.0,  1.0,  -1.0,  1.0,  1.0]);
        allverts = allverts.concat([-1.0, -1.0, -1.0,  -1.0,  1.0,  1.0,   -1.0,  1.0, -1.0]);
        allvertsUV = allvertsUV.concat([0,0, 0,1, 1,1]);
        allvertsUV = allvertsUV.concat([0,0, 1,1, 1,0]);
        //Back face
        allverts = allverts.concat([1.0,  1.0, 1.0, -1.0,  1.0, 1.0,   -1.0, -1.0, 1.0]);
        allverts = allverts.concat([1.0,  1.0, 1.0,  -1.0, -1.0, 1.0,   1.0, -1.0, 1.0]);
        allvertsUV = allvertsUV.concat([1,1, 1,0, 0,0]);
        allvertsUV = allvertsUV.concat([1,1, 0,0, 0,1]);
        //Front face
        allverts = allverts.concat([1.0, -1.0, -1.0, -1.0, -1.0, -1.0,   -1.0,  1.0, -1.0]);
        allverts = allverts.concat([1.0, -1.0, -1.0, -1.0,  1.0, -1.0,   1.0,  1.0, -1.0]);
        allvertsUV = allvertsUV.concat([0,0, 0,1, 1,1]);
        allvertsUV = allvertsUV.concat([0,0, 1,1, 1,0]);
        //Top face
        allverts = allverts.concat([1.0, 1.0, -1.0, -1.0, 1.0, -1.0,   -1.0, 1.0,  1.0]);
        allverts = allverts.concat([1.0, 1.0, -1.0,  1.0, 1.0,  1.0,   -1.0, 1.0,  1.0]);
        allvertsUV = allvertsUV.concat([0,0, 0,1, 1,1]);
        allvertsUV = allvertsUV.concat([0,0, 1,0, 1,1]);
        //Bottom face
        allverts = allverts.concat([1.0, -1.0, -1.0, -1.0, -1.0, -1.0,   -1.0, -1.0,  1.0]);
        allverts = allverts.concat([1.0, -1.0, -1.0, 1.0, -1.0,  1.0,   -1.0, -1.0,  1.0]);
        allvertsUV = allvertsUV.concat([1,0, 1,1, 0,1]);
        allvertsUV = allvertsUV.concat([1,0, 0,0, 0,1]);
        drawTriangle3DUVNormal(allverts, allvertsUV);
    }
    //     // Front of cube
    //     allVerts = allVerts.concat([0,0,0,  1,1,0,  1,0,0]);
    //     allVerts = allVerts.concat([0,0,0,  0,1,0,  1,1,0]);

    //     // Top of cube 
    //     allVerts = allVerts.concat([0,1,0,  0,1,1,  1,1,1]);
    //     allVerts = allVerts.concat([0,1,0,  1,1,1,  1,1,0]);

    //     // Right of cube: 
    //     allVerts = allVerts.concat([1,1,0,  1,1,1,  1,0,0]);
    //     allVerts = allVerts.concat([1,0,0,  1,1,1,  1,0,1]);

    //     // Left of Cube: 
    //     allVerts = allVerts.concat([0,1,0,  0,1,1,  0,0,0]);
    //     allVerts = allVerts.concat([0,0,0,  0,1,1,  0,0,1]);

    //     // Bottom of cube: 
    //     allVerts = allVerts.concat([0,0,0,  0,0,1,  1,0,1]);
    //     allVerts = allVerts.concat([0,0,0,  1,0,1,  1,0,0]);

    //     // Back of Cube: 
    //     allVerts = allVerts.concat([0,0,1,  0,1,1,  1,0,1], [1,0, 0,1, 1,1]);
    //     allVerts = allVerts.concat([1,1,1,  1,0,1,  0,1,1], [1,0, 0,1, 1,1]);
    // }   
}
