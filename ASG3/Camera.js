class Camera{
    constructor(){
        this.type = 'camera';
        // this.eye = new Vector3([0,0,3]);
        // this.at = new Vector3([0,0,-100]);
        // this.up = new Vector3([0,1,0]);

        this.eye = new Vector3([0,0,3]);
        this.at = new Vector3([0,0,-1]);
        this.up = new Vector3([0,1,0]); 
       
    }

    moveForward(){
        //this.eye.elements[2] = this.eye.elements[2] - .2;
        var f = new Vector3();
        f.set(this.at);
        f.sub(this.eye);
        f.normalize();
        f.mul(.2);
        this.eye.add(f);
    }

    moveBackward(){
        //this.eye.elements[2] = this.eye.elements[2] + .2;
        //  DONT NEED var f = this.eye.sub(this.at); 
        var b = new Vector3();
        b.set(this.at);
        b.sub(this.eye);
        b.normalize();
        b.mul(.2);
        this.eye.sub(b);
    }

    moveLeft(){
        //this.eye.elements[0] = this.eye.elements[0] - 0.2;
        var f = new Vector3();
        f.set(this.at);
        f = this.at.sub(this.eye);
        let s = new Vector3();
        s = Vector3.cross(this.up, f);
        s.normalize();
        s.mul(.1);
        this.eye.add(s);
        this.at.add(s);
    }
    moveRight(){
        //this.eye.elements[0] = this.eye.elements[0] + .2;
        var f = new Vector3();
        f.set(this.at);
        f = this.at.sub(this.eye);
        let s = new Vector3();
        s = Vector3.cross(f, this.up);
        s.normalize();
        s.mul(.1);
        this.eye.add(s);
        this.at.add(s);
    }
    panRight(){
        var f = new Vector3();
        f.set(this.at)
        f.sub(this.eye);
        let rotationMatrix = new Matrix4();
        rotationMatrix.setRotate(-10, this.up.elements[0], this.up.elements[1], this.up.elements[2]);
        //let f_prime = rotationMatrix.multiplyVector3(f);
        let f_prime = new Vector3();
        f_prime = rotationMatrix.multiplyVector3(f);
        let tempEye = new Vector3();
        //PROBLEM LINE
        tempEye.set(this.eye);
        this.at = tempEye.add(f_prime);

    }
    panLeft(){
        var f = new Vector3();
        f.set(this.at)
        f.sub(this.eye);
        let rotationMatrix = new Matrix4();
        rotationMatrix.setRotate(10, this.up.elements[0], this.up.elements[1], this.up.elements[2]);
        //let f_prime = rotationMatrix.multiplyVector3(f);
        let f_prime = new Vector3();
        f_prime = rotationMatrix.multiplyVector3(f);
        let tempEye = new Vector3();
        //PROBLEM LINE
        tempEye.set(this.eye);
        this.at = tempEye.add(f_prime);
        // console.log(this.at);
    }
}
