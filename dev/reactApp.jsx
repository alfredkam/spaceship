var grids = [5,5];
var size = 40;
var gridProperties = ['x','o'];
var matrix = [];
var innerMatrix = [];
var DOMMatrix = [];


var body = document.getElementsByTagName("body")[0];

var makeElement = function (m, n, content) {
    var obj = document.createElement('div');
    obj.dataSet = m.toString() + n.toString();
    obj.innerHTML = content;
    obj.className = 'grid grid-' + content;
    obj.style.position = "absolute";
    obj.style.fontSize = size + "px";
    obj.style.height = size + "px";
    obj.style.width = size + "px";
    obj.style.top = m * size + "px";
    obj.style.left = n * size + "px";
    obj.style.cursor = "pointer";
    return obj;
};

var makeGrid = function () {
    for (var i = 0; i < grids[0]; i++) {
        innerMatrix = [];
        for (var j = 0; j < grids[1]; j++) {
            innerMatrix.push(gridProperties[Math.round(Math.random() * (gridProperties.length - 1))]);
        }
        matrix.push(innerMatrix);
    }
};

var makeDOMGrid = function () {
    for (var i = 0; i < grids[0]; i++) {
        innerMatrix = [];
        for (var j = 0; j < grids[1]; j++) {
            innerMatrix.push(makeElement(i, j, matrix[i][j]));
        }
        DOMMatrix.push(innerMatrix);
    }
};

var appendGridToBody = function () {
    for (var i = 0; i < grids[0]; i++) {
        for (var j = 0; j < grids[1]; j++) {
            body.appendChild(DOMMatrix[i][j]);
        }
    }
};

var attachEvent = function (element) {
    element.onmousedown = function () {
        document.onmousemove = mousemove = function (e) {
            console.log(e.pageX - e.offsetX, e.pageY - e.offsetY);
            // now need to figure out if they moving left or right, and lock it down
            // fix it down to relative of the finger
            element.style.top = e.pageY + "px";
            element.style.left = e.pageX + "px";
        };
        // remove event
        document.onmouseup = mouseup = function (e) {
            document.onmousemove = null;
            document.onmouseup = null;
        };
    };
};

makeGrid();
makeDOMGrid();
appendGridToBody();

var gridElement = document.getElementsByClassName("grid");

for (var i = 0; i < gridElement.length; i++) {
    attachEvent(gridElement[i]);
}