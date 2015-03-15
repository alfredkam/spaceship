// grid size n x m
var grids = [5,5];
// pixel size
var size = 40;
var gridProperties = ['x','o'];
var matrix = [];
var innerMatrix = [];
var DOMMatrix = [];


var body = document.getElementsByTagName("body")[0];

var makeElement = function (m, n, content) {
    var obj = document.createElement('div');
    obj.dataset.posM = m;
    obj.dataset.posN = n;
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

var getTileDirection = function (element, pos) {
    var m = parseInt(element.style.top);
    var n = parseInt(element.style.left);
    var diffM = m - pos.y;
    var diffN = n - pos.x;

    if (Math.abs(diffM) > Math.abs(diffN)) {
        // moving top or bottom
        if (diffM < 0) {
            return "bottom";
        }
        return "top";
    } else {
        // moving left or right
        if (diffN < 0) {
            return "right";
        }
        return "left";
    }
};

var canChangeDirection = function (element, pos) {
    var m = parseInt(element.dataset.posM) * size;
    var n = parseInt(element.dataset.posN) * size;
    var cY = parseInt(element.style.top);
    var cX = parseInt(element.style.left);

    if (m == cY && n == cX) {
        return true;
    }
    return false;
};

var attachEvent = function (element) {
    var start = true;
    var prev = 0;
    var currDirection = 0;
    // need to switch to touch events later
    element.onmousedown = function () {
        document.onmousemove = mousemove = function (e) {
            // now need to figure out if they moving left or right, and lock it down
            // the grid should be moving relative to finger instead of jumping to it
            // need to adjust the x y relative to grid
            var direction = getTileDirection(element, {
                x: e.pageX,
                y: e.pageY
            });

            if (!currDirection) {
                currDirection = direction;
            }
            // check if its in grid then can change direction
            if (canChangeDirection(element, {
                x: e.pageX,
                y: e.pageY
            })) {
                currDirection = direction;
            }

            if ((currDirection == 'left') || (currDirection == 'right')) {
                element.style.left = e.pageX + "px";
            } else {
                element.style.top = e.pageY + "px";
            }
        };
        // remove event
        document.onmouseup = mouseup = function (e) {
            start = true;
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