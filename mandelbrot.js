// Thomas Milne-Jones
// tmlinejo
// 1396046
// lab3
// 04/24/2015
// mandelbrot.js
// creates terrain using the mandelbrot set and displays it


var xdim = 50
var ydim = 50
var xmin = -2
var xmax = 1
var ymin = -1.75
var ymax = 1.25

var intensity = 3
var startDistance = 3
var playerPosition = [0,0,startDistance]
var lightColor = [1,1,1]
var coordList = []
var movementSpeed = .01


var maxColor = 255;
var Rmax = 100;
var dx = (xmax - xmin) / (xdim - 1);
var dy = (ymax - ymin) / (ydim - 1);
var sx = xmax - xmin;
var sy = ymax - ymin;

var canvas;
var gl;



var maxNumVertices  = 1044484;
var index = 0;

var vertexShaderSource = "\
    attribute vec4 vPosition;  \n\
    attribute vec4 vColor;      \n\
    varying vec4 fColor;         \n\
    void main(void)                \n\
    {                                  \n\
      gl_Position = vPosition; \n\
      fColor = vColor;            \n\
    }                                  \n\
";
var fragmentShaderSource = "\
    precision mediump float;    \n\
    varying vec4 fColor;         \n\
    void main(void)                \n\
    {                                  \n\
      gl_FragColor = fColor;    \n\
    }                                  \n\
";

var vBuffer;
var vPosition;
var cBuffer;
var vColor;

window.onload = function init() {

    canvas = document.getElementById( "gl-canvas" );
    
    gl = canvas.getContext("experimental-webgl");    // sets up gl
    if ( !gl ) { alert( "WebGL isn't available" ); }
    
    gl.viewport( 0, 0, canvas.width, canvas.height );// shows the canvas on the screen
    gl.clearColor( 0.0, 0.5, 0.0, 1.0 );  // sets the default background color

    //
    //  Load shaders and initialize attribute buffers
    //
    var program = initShaders( gl, vertexShaderSource, fragmentShaderSource );
    gl.useProgram( program ); // runs the shader program
    
    
    vBuffer = gl.createBuffer(); // creates the array into which the vertices will be stored
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, 8*maxNumVertices, gl.STATIC_DRAW);
    
    vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0); // enables vertices to be drawn
    gl.enableVertexAttribArray(vPosition);

    cBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, 16*maxNumVertices, gl.STATIC_DRAW);

    vColor = gl.getAttribLocation( program, "vColor");
    gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vColor);
    
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    
    var hField = {};
    for (i = xmin; i<=xmax; i+=dx)
    {
        var tempCol = {};
        for (j = ymax; j>=ymin; j-=dy)
        {
            tempCol[j-ymin] = (height(i,j));
        }
        hField[i-xmin] = (tempCol);
    }
    
    
    for (i = xmin; i<=xmax; i+=dx)
    {
        for (j = ymax; j>=ymin; j-=dy)
        {
            if ((i+dx <= xmax) && (j-dy >= ymin))
            {
                var pA = [((i-xmin)*sx/(dx*xdim))-(sx/2), ((j-ymax)*sy/(dy*ydim))+(sy/2), height(i,j)/maxColor]
                var pB = [((i+dx-xmin)*sx/(dx*xdim))-(sx/2), ((j-ymax)*sy/(dy*ydim))+(sy/2), height(i+dx,j)/maxColor]
                var pC = [((i-xmin)*sx/(dx*xdim))-(sx/2), ((j-dy-ymax)*sy/(dy*ydim))+(sy/2), height(i,j-dy)/maxColor]
                var pD = [((i+dx-xmin)*sx/(dx*xdim))-(sx/2), ((j-dy-ymax)*sy/(dy*ydim))+(sy/2), height(i+dx,j-dy)/maxColor]
                pA = rotateZ(pA, Math.PI*5/4)
                pB = rotateZ(pB, Math.PI*5/4)
                pC = rotateZ(pC, Math.PI*5/4)
                pD = rotateZ(pD, Math.PI*5/4)
                pA = rotateX(pA, Math.PI*1.64)
                pB = rotateX(pB, Math.PI*1.64)
                pC = rotateX(pC, Math.PI*1.64)
                pD = rotateX(pD, Math.PI*1.64)
                var normal1 = getNormal(pA, pC, pB)
                var normal2 = getNormal(pB, pC, pD)
                
                coordList.push(pA) // Tri 1
                coordList.push(pC)
                coordList.push(pB)
                
                coordList.push(pB) // Tri 2
                coordList.push(pC)
                coordList.push(pD)
            }
        }
    }
    render();
    
    var leftMouse = false
    var rightMouse = false
    var prevx, prevy
    var wheelR = false
    var wheelG = false
    var wheelB = false
    
    canvas.addEventListener("contextmenu", function(event) { event.preventDefault();}); // prevent right click menu
    canvas.addEventListener("mousedown", function(event)
    {
        if(event.button === 0) // left click
            leftMouse = true
        if(event.button === 2) // right click
            rightMouse = true
        prevx = event.clientX
        prevy = event.clientY
    });
    canvas.addEventListener("mouseup", function(event)
    {
        if(event.button === 0) // left unclick
            leftMouse = false
        if(event.button === 1)
            lightColor = [1,1,1]; render()
        if(event.button === 2) // right unclick
            rightMouse = false
    });
    canvas.addEventListener("mousemove", function(event)
    {
        if(leftMouse)
        {
            for(index=0; index<coordList.length; index++)
            {
                coordList[index][2] += movementSpeed
            }
            render()
        }
        if(rightMouse)
        {
            var movex = event.clientX - prevx
            var movey = event.clientY - prevy
            for(index=0; index<coordList.length; index++)
            {
                coordList[index] = rotateY(coordList[index], movex/canvas.width)
                coordList[index] = rotateX(coordList[index], movey/canvas.height)
            }
            render()
        }
        prevx = event.clientX
        prevy = event.clientY
    });
    canvas.addEventListener("mousewheel", function(event)
    {
        var adjustment = event.wheelDelta / (Math.abs(event.wheelDelta)*20)
        if(wheelR)
            lightColor[0] += adjustment
        else if(wheelG)
            lightColor[1] += adjustment
        else if(wheelB)
            lightColor[2] += adjustment
        else
            intensity += adjustment
        render()
    });
    window.addEventListener("keydown", function(event)
    {
        if(event.keyCode === 82)
            wheelR = true
        if(event.keyCode === 71)
            wheelG = true
        if(event.keyCode === 66)
            wheelB = true
    });
    window.addEventListener("keyup", function(event)
    {
        if(event.keyCode === 82)
            wheelR = false
        if(event.keyCode === 71)
            wheelG = false
        if(event.keyCode === 66)
            wheelB = false
    });
}









function getDistance(point)
{
    var test = [0,0,startDistance]
    var sum = 0
    for(var i=0; i<point.length; i++)
    {
        sum+=Math.pow(point[i] - playerPosition[i], 2)
    }
    return Math.sqrt(sum)
}

function translate(point, translation)
{
    output = []
    for(i=0; i<point.length; i++)
        output.push(point[i] + translation[i])
    return output
}

function scale(point, factor)
{
    var output = []
    for(var i=0; i<3; i++)
        output.push(point[i] * factor)
    return output
}

function rotateX(point, angle)
{
    var x = point[0]
    var y = point[1]
    var z = point[2]
    var vx = x
    var vy = (Math.cos(angle) * y) - (Math.sin(angle) * z)
    var vz = (Math.sin(angle) * y) + (Math.cos(angle) * z)
    return [vx, vy, vz]
}
function rotateY(point, angle)
{
    var x = point[0]
    var y = point[1]
    var z = point[2]
    var vx = (Math.cos(angle) * x) + (Math.sin(angle) * z)
    var vy = y
    var vz = -(Math.sin(angle) * x) + (Math.cos(angle) * z)
    return [vx, vy, vz]
}
function rotateZ(point, angle)
{
    var x = point[0]
    var y = point[1]
    var z = point[2]
    var vx = (Math.cos(angle) * x) - (Math.sin(angle) * y)
    var vy = (Math.sin(angle) * x) + (Math.cos(angle) * y)
    var vz = z
    return [vx, vy, vz]
}

function rotate(ax, ay, az)
{
    var x = ax/sx; // scaling
    var y = ay/sy;
    var z = az/maxColor;
    var vx = Math.sqrt(1/2)*(x+y);  // rotation to viewport, rotated to match instructor's reference image on Piazza @76
    var vy = Math.sqrt(1/6)*(x-z+(2*y));
    var vz = Math.sqrt(1/3)*(z-x+y);
    return [vx, vy, vz];
}

function getNormal(pA, pB, pC) // calculates the normal of a given triangle
{
    var edge1 = [pB[0] - pA[0], pB[1] - pA[1], pB[2] - pA[2]];
    var edge2 = [pC[0] - pA[0], pC[1] - pA[1], pC[2] - pA[2]];
    output = normalize(cross(edge1, edge2));
    return output
} // getNormal

function getColor(point, normal)
{
    var distFactor = intensity/getDistance(point)
    var headlight = [playerPosition[0], playerPosition[1], playerPosition[2]]
    normalize(headlight)
    var lightFactor = dot(normal, headlight) * distFactor
    return vec4(lightFactor*lightColor[0],lightFactor*lightColor[1],lightFactor*lightColor[2], 1.0); // light and surface are both white
}

function render() 
{
    index = 0
    for(var i=0; i<coordList.length; i+=3)
    {
        p1 = scale(coordList[i], 1/(getDistance(coordList[i])))
        p2 = scale(coordList[i+1], 1/(getDistance(coordList[i+1])))
        p3 = scale(coordList[i+2], 1/(getDistance(coordList[i+2])))
        var normal = getNormal(p1,p2,p3)
        if(dot(normal, [0,0,1]) >= 0)
        {
            drawPoint(p1, getColor(coordList[i], normal))
            drawPoint(p2, getColor(coordList[i+1], normal))
            drawPoint(p3, getColor(coordList[i+2], normal))
        }
    }
    gl.clear( gl.COLOR_BUFFER_BIT ); // colors the background
    gl.drawArrays( gl.TRIANGLES, 0, index ); // draws the lines

}

function height(real, imaginary) // use mandelbrot algorithm to determine height of a point
{
    var n = 0;
    var za = 0;
    var zb = 0;
    var zdist = 0;
    var temp = 0;
    
    while(zdist<=100) // while not "sufficiently far"
    {
        if(n==maxColor) // maxColor
        { return 0; }
        n++; // z(n+1)
        
        temp = za;
        za = (za*za) - (zb*zb);
        zb = 2*zb*temp; // z(n) squared
        za+=real;
        zb+=imaginary; // plus c
        
        zdist = (za*za) + (zb*zb); // modulusSquare
    }
    
    return n-1; // undo the increment that caused the failure
}

function drawPoint(point, color) // adds a point and color to the buffer
{
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer);
    gl.bufferSubData(gl.ARRAY_BUFFER, 8*index, flatten(point)); // load into buffer, scaled and repositioned after rotation for better looking view
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer); 
    gl.bufferSubData(gl.ARRAY_BUFFER, 16*index, flatten(color));
    index++;
}
