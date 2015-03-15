/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

var gameApp = function () {
    // grid size n x m
    var grids = [5,5];
    // pixel size
    var size = 40;
    var offsetX = 0;
    var offsetY = 0;
    var gridProperties = ['x','o'];
    var virtualMatrix = [];
    var innerMatrix = [];
    var DOMMatrix = [];
    var DOMMatrixRef = {};
    var virtualMatrixReference = {};

    // var htmlBody = document.getElementsByTagName("body")[0];
    // var body = document.createElement("div");
    var body = document.getElementsByClassName("gameBody")[0];
    var test = document.createElement("div");
    // test.innerHTML = 'test';
    // body.appendChild(test);
    body.style.position = 'relative';
    body.style.top = '100px';
    body.style.left = '0px';
    // htmlBody.appendChild(body);

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
        DOMMatrixRef[m + "." + n] = obj;
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
            DOMMatrixRef[newM + "." + newN] = element;
            DOMMatrixRef[m + "." + n] = 0;
        } catch(e) {}
    };

    var shouldUpdateElementPosition = function (element, direction) {
        // TODO:: need to account for offset
        var pY = parseInt(element.style.top);
        var pX = parseInt(element.style.left);
        var y = m = parseInt(element.dataset.posM);
        var x = n = parseInt(element.dataset.posN);

        var half = size / 2;
        // backward looking
        if (direction == 'left') {
            // already at the edge
            if (x === 0) return;
            if ((x - 1) * size + half > pX) {
                updatePos(element, y, x, y, x - 1);
            }
            return;
        } else if (direction == 'top') {
            if (y === 0) return;
            if ((y - 1) * size + half > pY) {
                updatePos(element, y, x, y - 1, x);
            }
        // forward looking
        } else if (direction == 'right') {
            if (x === virtualMatrix[0].length - 1) return;
            if ((x + 1) * size - half < pX) {
                updatePos(element, y, x, y, x + 1);
            }
        } else if (direction == 'bottom') {
            if (y === virtualMatrix.length - 1) return;
            if ((y + 1) * size - half < pY) {
                updatePos(element, y, x, y + 1, x);
            }
        }
        return;
    };

    var shouldSnapToGrid = function (element) {
        // snap to grid mech
        var y = m = parseInt(element.dataset.posM);
        var x = n = parseInt(element.dataset.posN);

        element.style.top = m * size + "px";
        element.style.left = n * size + "px";
    };

    var remove = function (element) {
        element.parentElement.removeChild(element);
    };


    // lets make it expensive for now
    // prunes the grids and scores them
    var pruneGrid = function (shouldRemove) {
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

                            if (shouldRemove) {
                                var ref = DOMMatrixRef[m + "." + (n + 1)];
                                remove(ref);
                                ref = 0;
                                ref = DOMMatrixRef[m + "." + (n + 2)];
                                remove(ref);
                                ref = 0;
                            }
                        }
                    } catch(e) {}
                    try {
                        if (matrix[m][n] == matrix[m + 1][n] &&
                            matrix[m][n] == matrix[m + 2][n] &&
                            matrix[m][n] == gridProperties[i]) {
                            score +=1;
                            matrix[m + 1][n] = 0;
                            matrix[m + 2][n] = 0;
                            if (shouldRemove) {
                                var ref = DOMMatrixRef[(m + 1) + "." + n];
                                remove(ref);
                                ref = 0;
                                ref = DOMMatrixRef[(m + 2) + "." + n];
                                remove(ref);
                                ref = 0;
                            }
                        }
                    } catch(e) {}
                }
            }
        }
        return score;
    };

    var currentScore = 0;
    var attachEvent = function (element) {
        var prev = 0;
        var currDirection = 0;
        // need to switch to touch events later
        // element.onmousedown = function () {
        element.ontouchstart = function () {
            // document.onmousemove = mousemove = function (e) {
            document.ontouchmove = function (e) {
                e.preventDefault();

                if(e.originalEvent && e.originalEvent.touches && e.originalEvent.touches.length) {
                    e = e.originalEvent.touches[0];
                }

                var y = e.pageY - body.offsetTop;
                var x = e.pageX - body.offsetLeft;
                // now need to figure out if they moving left or right, and lock it down
                // the grid should be moving relative to finger instead of jumping to it
                // need to adjust the x y relative to grid
                var direction = getTileDirection(element, {
                    x: x,
                    y: y
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
                    element.style.left = x + "px";
                } else {
                    element.style.top = y + "px";
                }

                shouldUpdateElementPosition(element, direction);
            };
            // remove event
            // document.onmouseup = mouseup = function (e) {
            document.ontouchend = function (e) {
                if(e.originalEvent && e.originalEvent.touches && e.originalEvent.touches.length) {
                    e = e.originalEvent.touches[0];
                }

                shouldSnapToGrid(element);
                // returns score here, do something with it;
                var shouldRemove = true;
                currentScore += pruneGrid(shouldRemove);
                // document.onmousemove = null;
                // document.onmouseup = null;
                document.ontouchmove = null;
                document.ontouchend = null;
                console.log('score:', currentScore);
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
};
gameApp();

// var app = {
//     // Application Constructor
//     initialize: function() {
//         this.bindEvents();
//     },
//     // Bind Event Listeners
//     //
//     // Bind any events that are required on startup. Common events are:
//     // 'load', 'deviceready', 'offline', and 'online'.
//     bindEvents: function() {
//         document.addEventListener('deviceready', this.onDeviceReady, false);
//     },
//     // deviceready Event Handler
//     //
//     // The scope of 'this' is the event. In order to call the 'receivedEvent'
//     // function, we must explicitly call 'app.receivedEvent(...);'
//     onDeviceReady: function() {
//         app.receivedEvent('deviceready');
//         console.log("device ready");
//         gameApp();
//     },
//     // Update DOM on a Received Event
//     receivedEvent: function(id) {
//         var parentElement = document.getElementById(id);
//         var listeningElement = parentElement.querySelector('.listening');
//         var receivedElement = parentElement.querySelector('.received');

//         listeningElement.setAttribute('style', 'display:none;');
//         receivedElement.setAttribute('style', 'display:block;');
//         gameApp();
//         console.log('Received Event: ' + id);
//     }
// };

// app.initialize();