class Cube{
    constructor(){

        this.type = 'cube'; 
        //this.position = [0.0, 0.0, 0.0];
        this.color = [1.0, 1.0, 1.0, 1.0];
        //this.size = 5.0;
        //this.segments = 2; 
        this.matrix = new Matrix4();
        this.textureNum = -1;
    }

    render() {
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

        // Front of cube: 
        drawTriangle3DUV([0,0,0,  1,1,0,  1,0,0], [1,0, 0,1, 1,1]);
        drawTriangle3D([0,0,0, 0,1,0, 1,1,0]);

        // Pass the color of a point to the u_FragColor uniform variable 
        gl.uniform4f(u_FragColor, rgba[0]*.9, rgba[1]*.9, rgba[2]*.9, rgba[3]);

        // Top of cube: 
        drawTriangle3D([0,1,0, 0,1,1, 1,1,1]);
        drawTriangle3D([0,1,0, 1,1,1, 1,1,0]);

        //Right Side:
        drawTriangle3D([1,0,0,  1,0,1,  1,1,0]);
        drawTriangle3D([1,1,0,  1,1,1,  1,0,1]);

        // Left Side:
        drawTriangle3D([0,0,0,  0,1,0,  0,0,1]);
        drawTriangle3D([0,0,1,  0,1,1,  0,1,0]);

        // Back Side: 
        drawTriangle3D([0,0,1,  0,1,1,  1,0,1]);
        drawTriangle3D([1,1,1,  1,0,1,  0,1,1]);

        // Bottom: 
        drawTriangle3D([0,0,0,  0,0,1,  1,0,0]);
        drawTriangle3D([0,0,1,  1,0,1,  1,0,0]);


    } 
}
