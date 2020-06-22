// DrawRectangle.js 
// is a JavaScript program that draws a blue rectangle 
// on the drawing area defined by the <canvas> element. 


function main() {
    // Retrieve <canvas> element 
    var canvas = document.getElementById('example');
    if(!canvas){
        console.log('Failed to retrieve the <canvas> element');
        return;
    }

    // Get the rendering context for 2DCG 
    var ctx = canvas.getContext('2d');

    // Draw a blue rectangle 
    ctx.fillStyle = 'rgba(0, 0, 0, 1.0)'; // Set a blue color --> set to black
    ctx.fillRect(0, 0, 400, 400); // Fill a rectangle with the color 

    let v1 = new Vector3([2.25, 2.25, 0]);
    let v2 = new Vector3([2.25, 4, 0]);

    drawVector(v1,"red");
    drawVector(v2, "blue");

}

function drawVector(v,color) {
    var canvas = document.getElementById('example');
    var ctx = canvas.getContext('2d');
    ctx.beginPath();
    ctx.moveTo(200,200); 
    ctx.lineTo(200+v.elements[0]*20, 200-v.elements[1]*20);    
   
    ctx.strokeStyle = color;
    ctx.stroke();
}

function handleDrawEvent(){
    var canvas = document.getElementById('example');
    var ctx = canvas.getContext('2d');
    
    ctx.clearRect(0,0,400,400);
    ctx.fillStyle = 'rgba(0, 0, 0, 1.0)'; // Set a blue color --> set to black
    ctx.fillRect(0, 0, 400, 400); // Fill a rectangle with the color
    
    var xValue1 = document.getElementById("x1").value;
    var yValue1 = document.getElementById("y1").value; 

    var xValue2 = document.getElementById("x2").value;
    var yValue2 = document.getElementById("y2").value;

    let v1 = new Vector3([xValue1, yValue1, 0]);
    let v2 = new Vector3([xValue2, yValue2, 0]);
    drawVector(v1, "red");
    drawVector(v2, "blue");
}

function angleBetween(v1, v2){

    let theta = Math.acos(Vector3.dot(v1,v2) / (v1.magnitude() * v2.magnitude()));
    let degree = theta * 180/Math.PI;
    return degree; 

}

function areaTriangle(v1, v2){
    let v3 = Vector3.cross(v1, v2);
    let area = 0.5*(v3.magnitude());
    return area;
}
function handleDrawOperationEvent(){
    var canvas = document.getElementById('example');
    var ctx = canvas.getContext('2d');
    
    ctx.clearRect(0,0,400,400);
    ctx.fillStyle = 'rgba(0, 0, 0, 1.0)'; // Set a blue color --> set to black
    ctx.fillRect(0, 0, 400, 400); // Fill a rectangle with the color

    var xValue1 = document.getElementById("x1").value;
    var yValue1 = document.getElementById("y1").value; 

    var xValue2 = document.getElementById("x2").value;
    var yValue2 = document.getElementById("y2").value;
    
   
    let v1 = new Vector3([xValue1, yValue1, 0]);
    let v2 = new Vector3([xValue2, yValue2, 0]);
    
    var v3 = new Vector3([0,0,0]);
    const mode = document.getElementById("selectOperations").value;

    drawVector(v1, "red");
    drawVector(v2, "blue");

    if (mode === "Add"){
        v3 = v1.add(v2);
        drawVector(v3, "green");
    } else if (mode === "Subtract") {
        v3 = v1.sub(v2);
        drawVector(v3, "green");
    } else if (mode === "Multiply") {
        let scalar = document.getElementById("scalarNum").value;
        v3 = v1.mul(scalar);
        drawVector(v3,"green");

        let v4 = v2.mul(scalar);
        drawVector(v4, "green");

    } else if (mode === "Divide") {
        let scalar = document.getElementById("scalarNum").value;
        v3 = v1.div(scalar);
        drawVector(v3,"green");
        let v4 = v2.div(scalar);
        drawVector(v4, "green");
    } else if (mode === "Magnitude") {
        console.log("Magnitude v1: " + v1.magnitude());
        console.log("Magnitude v2: " + v2.magnitude());
    } else if(mode === "Normalize"){
        v3 = v1.normalize();
        v4 = v2.normalize();
        drawVector(v3, "green");
        drawVector(v4, "green");    
    } else if(mode === "Angle Between"){
        console.log("Angle: " + angleBetween(v1, v2));
    } else if(mode === "Area"){
        console.log("Area: " + areaTriangle(v1, v2));
    }
}
