// grid size n x m
var grids = [5,5];
// pixel size
var size = 40;
var gridProperties = ['x','o'];
var virtualMatrix = [];
var innerMatrix = [];
var DOMMatrix = [];

var body = document.getElementsByTagName("body")[0];

var makeElement = function (m, n, pos, content) {
    var obj = document.createElement('div');
    obj.dataset.posM = m;
    obj.dataset.posN = n;
    obj.dataset.ref = pos;
    // this should reference to a 'marker' or 'property later'
    obj.dataset.marker = content;
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
        virtualMatrix.push(innerMatrix);
    }
};

var makeDOMGrid = function () {
    var pos = 0;
    for (var i = 0; i < grids[0]; i++) {
        for (var j = 0; j < grids[1]; j++) {
            if (virtualMatrix[i][j] == 0)
                continue;
            DOMMatrix.push(makeElement(i, j, pos, virtualMatrix[i][j]));
        }
    }
};

var appendGridToBody = function () {
    for (var i = 0; i < DOMMatrix.length; i++) {
        body.appendChild(DOMMatrix[i]);
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

var canChangeDirection = function (element) {
    var m = parseInt(element.dataset.posM) * size;
    var n = parseInt(element.dataset.posN) * size;
    var cY = parseInt(element.style.top);
    var cX = parseInt(element.style.left);

    if (m == cY && n == cX) {
        return true;
    }
    return false;
};

var canMoveToNextGrid = function (element, direction) {
    // matrix positions
    // m is Y, n is X
    var m = parseInt(element.dataset.posM);
    var n = parseInt(element.dataset.posN);
    var marker = element.dataset.marker;
    var nextM = m;
    var nextN = n;

    if (direction === 'left') {
        n -= 1;
    } else if (direction === 'right') {
        n += 1;
    } else if (direction === 'top') {
        m -=1;
    } else if (direction === 'bottom') {
        m +=1;
    }

    try {
        if (virtualMatrix[m][n] == 0) {
            return true;
        }
    } catch(e) {
        // array out of bound
    }

    return false;
};

var updatePos = function (element, m, n, newM, newN) {
    try {
        virtualMatrix[newM][newN] = element.dataset.marker;
        element.dataset.posM = newM;
        element.dataset.posN = newN;
        virtualMatrix[m][n] = 0;
    } catch(e) {}
};

var shouldUpdateElementPosition = function (element, direction) {
    var m = parseInt(element.style.top);
    var n = parseInt(element.style.left);
    var y = parseInt(element.dataset.posM);
    var x = parseInt(element.dataset.posN);

    if (direction == 'left') {
        // already at the edge
        if (x === 0) return;
        
    }
};

var shouldSnapToGrid = function (element) {
    // snap to grid mech
};


// lets make it expensive for now
// prunes the grids and scores them
var pruneGrid = function () {
    var score = 0;
    var matrix = virtualMatrix;
    for (var m = 0; m < matrix.length; m++) {
        for (var n = 0; n < matrix[m].length; n++) {
            for (var i = 0; i < gridProperties.length; i++) {
                try {
                    if (matrix[m][n] == matrix[m][n + 1] &&
                        matrix[m][n] == matrix[m][n + 2] &&
                        matrix[m][n] == gridProperties[i]) {
                        score +=1;
                        matrix[m][n + 1] = 0;
                        matrix[m][n + 2] = 0;
                    }
                } catch(e) {}
                try {
                    if (matrix[m][n] == matrix[m + 1][n] &&
                        matrix[m][n] == matrix[m + 2][n] &&
                        matrix[m][n] == gridProperties[i]) {
                        score +=1;
                        matrix[m + 1][n] = 0;
                        matrix[m + 2][n] = 0;
                    }
                } catch(e) {}
            }
        }
    }
};

var attachEvent = function (element) {
    var prev = 0;
    var currDirection = 0;
    // need to switch to touch events later
    element.onmousedown = function () {
        document.onmousemove = mousemove = function (e) {
            e.preventDefault();
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
            if (canChangeDirection(element)) {
                currDirection = direction;
            }

            if (!canMoveToNextGrid(element, direction)) {
                return false;
            }

            if ((currDirection == 'left') || (currDirection == 'right')) {
                element.style.left = e.pageX + "px";
            } else {
                element.style.top = e.pageY + "px";
            }

            shouldUpdateElementPosition(element, direction);
        };
        // remove event
        document.onmouseup = mouseup = function (e) {
            shouldSnapToGrid(element);
            // returns score here, do something with it;
            pruneGrid();
            document.onmousemove = null;
            document.onmouseup = null;
            // need to snap to grid
        };
    };
};

makeGrid();
pruneGrid();
makeDOMGrid();
appendGridToBody();

var gridElement = document.getElementsByClassName("grid");

for (var i = 0; i < gridElement.length; i++) {
    attachEvent(gridElement[i]);
}