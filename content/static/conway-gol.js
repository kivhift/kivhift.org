/* Copyright (c) 2017-2020 Joshua Hughes <kivhift@gmail.com> */
"use strict";

var canv = document.querySelector('#gol'), cx = canv.getContext('2d');
var tick = document.querySelector('#tick');
var auto = document.querySelector('#auto');
var init = document.querySelector('#init');
var interval = 250, timer = null;
var background = '#222222', deadCell = 'black', liveCell = '#007700';

function Grid(width) {
    var g = Object.create(null);
    g.side = width;
    g.data = new Array(g.side * g.side);
    g.next = new Array(g.data.length);
    return g;
}
var grid = Grid(150);

function offset(r, c) {
    return r * grid.side + c;
}
function middle() {
    return Math.floor(grid.side / 2);
}
function blankGrid() {
    for(var i = 0; i < grid.data.length; i++) {
        grid.data[i] = false;
    }
}
function setFromMiddle(offsets) {
    var mr, mc, d = grid.data;
    mr = mc = middle();
    for (var i = 0; i < offsets.length; i++) {
        var roff = offsets[i][0];
        offsets[i].slice(1).forEach(
            coff => d[offset(mr + roff, mc + coff)] = true
        );
    }
}

var patterns = Object.create(null);
patterns.Random = function() {
    blankGrid();
    for(var i = 0; i < grid.data.length; i++) {
        grid.data[i] = Math.random() < 0.2 ? true : false;
    }
};
patterns['R-pentomino'] = function() {
    blankGrid();
    setFromMiddle([
        [-1, 0, 1]
        , [0, -1, 0]
        , [1, 0]
    ]);
};
patterns.Diehard = function() {
    blankGrid();
    setFromMiddle([
        [-1, 2]
        , [0, -4, -3]
        , [1, -3, 1, 2, 3]
    ]);
};
patterns.Acorn = function() {
    blankGrid();
    setFromMiddle([
        [-1, -2]
        , [0, 0]
        , [1, -3, -2, 1, 2, 3]
    ]);
};
patterns.Tube = function() {
    blankGrid();

    var mr, mc, d = grid.data;

    mr = mc = middle();
    for(var i = 0; i < grid.side; i++) {
        d[offset(i, mc)] = true;
        if(0 == (i % 3)) {
            d[offset(i, mc - 1)] = true;
        }
    }
};
patterns["Munroe's Conway Tribute"] = function() {
    blankGrid();
    setFromMiddle([
        [-4, -1, 0, 1]
        , [-3, -1, 1]
        , [-2, -1, 1]
        , [-1, 0]
        , [0, -3, -1, 0, 1]
        , [1, -2, 0, 2]
        , [2, 0, 3]
        , [3, -1, 1]
        , [4, -1, 1]
    ]);
};
patterns['Gosper Glider Gun'] = function() {
    blankGrid();
    setFromMiddle([
        [-4, 7]
        , [-3, 5, 7]
        , [-2, -5, -4, 3, 4, 17, 18]
        , [-1, -6, -2, 3, 4, 17, 18]
        , [0, -17, -16, -7, -1, 3, 4]
        , [1, -17, -16, -7, -3, -1, 0, 5, 7]
        , [2, -7, -1, 7]
        , [3, -6, -2]
        , [4, -5, -4]
    ]);
};
patterns['Simkin Glider Gun'] = function() {
    blankGrid();
    setFromMiddle([
        [-10, -16, -15, -9, -8]
        , [-9, -16, -15, -9, -8]
        , [-7, -12, -11]
        , [-6, -12, -11]
        , [-1, 6, 7, 9, 10]
        , [0, 5, 11]
        , [1, 5, 12, 15, 16]
        , [2, 5, 6, 7, 11, 15, 16]
        , [3, 10]
        , [7, 4, 5]
        , [8, 4]
        , [9, 5, 6, 7]
        , [10, 7]
    ]);
};
patterns.Gliders = function() {
    blankGrid();

    var d = grid.data;
    var end = grid.side - 2;
    for (var r = 0; r < end; r += 5) {
        for (var c = 0; c < end; c += 5) {
            d[offset(r, c)] = true;
            d[offset(r, c + 1)] = true;
            d[offset(r, c + 2)] = true;
            d[offset(r + 1, c + 2)] = true;
            d[offset(r + 2, c + 1)] = true;
        }
    }
};
patterns['Infinite Growth 1'] = function() {
    blankGrid();
    setFromMiddle([
        [-2, 3]
        , [-1, 1, 3, 4]
        , [0, 1, 3]
        , [1, 1]
        , [2, -1]
        , [3, -3, -1]
    ]);
};
patterns['Infinite Growth 2'] = function() {
    blankGrid();
    setFromMiddle([
        [-2, -2, -1, 0, 2]
        , [-1, -2]
        , [0, 1, 2]
        , [1, -1, 0, 2]
        , [2, -2, 0, 2]
    ]);
};
patterns['Infinite Growth 3'] = function() {
    blankGrid();
    setFromMiddle([
        [0, -19, -18, -17, -16, -15, -14, -13, -12, -10, -9, -8, -7, -6, -2
            , -1, 0, 7, 8, 9, 10, 11, 12, 13, 15, 16, 17, 18, 19]
    ]);
};
patterns.Blank = blankGrid;

for(var pattern in patterns) {
    var opt = document.createElement('option');
    opt.textContent = pattern;
    init.appendChild(opt);
}

init.addEventListener('change', function(event) {
    auto.checked = false;
    if(timer) {
        cancelTimer();
    }
    patterns[init.value]();
    drawGrid();
});

canv.addEventListener('click', function(event) {
    var rect = canv.getBoundingClientRect();
    var side = Math.floor(canv.width / grid.side);
    var idx = offset(
        Math.floor((event.clientY - rect.top) / side),
        Math.floor((event.clientX - rect.left) / side));

    grid.data[idx] = ! grid.data[idx];
    drawGrid();
});

tick.addEventListener('click', perhapsAutoAdvance);
auto.addEventListener('click', perhapsAutoAdvance);

function perhapsAutoAdvance() {
    if(timer) return;
    advance();
    if(!auto.checked) return;
    timer = setInterval(advance, interval);
}

function cancelTimer() {
    clearInterval(timer);
    timer = null;
}

function advance() {
    tickGrid();
    drawGrid();
    if(timer && !auto.checked) {
        cancelTimer();
    }
}

function tickGrid() {
    var side = grid.side, data = grid.data, next = grid.next;
    var canGo = false;

    for(var i = 0; i < side; i++) {
        for(var j = 0; j < side; j++) {
            var im1 = (i + side - 1) % side;
            var ip1 = (i + side + 1) % side;
            var jm1 = (j + side - 1) % side;
            var jp1 = (j + side + 1) % side;

            var live = data[offset(im1, jm1)] ? 1 : 0;
            live += data[offset(im1, j)] ? 1 : 0;
            live += data[offset(im1, jp1)] ? 1 : 0;
            live += data[offset(i, jm1)] ? 1 : 0;
            live += data[offset(i, jp1)] ? 1 : 0;
            live += data[offset(ip1, jm1)] ? 1 : 0;
            live += data[offset(ip1, j)] ? 1 : 0;
            live += data[offset(ip1, jp1)] ? 1 : 0;

            var idx = offset(i, j);

            next[idx] = data[idx] ? (2 == live || 3 == live) : (3 == live);
            canGo = next[idx] || canGo;
        }
    }

    if(auto.checked && !canGo) auto.checked = false;

    grid.data = next;
    grid.next = data;
}

function drawGrid() {
    var docbody = document.body;
    var maxHeight = Math.min(docbody.clientWidth, docbody.clientHeight);
    var side = grid.side, data = grid.data;
    var cide = Math.floor(maxHeight / side);

    canv.width = canv.height = cide * side + 1;

    cx.fillStyle = background;
    cx.fillRect(0, 0, canv.width, canv.height);

    for(var i = 0; i < side; i++) {
        for(var j = 0; j < side; j++) {
            cx.fillStyle = data[i * side + j] ? liveCell : deadCell;
            cx.fillRect(j * cide + 1, i * cide + 1, cide - 1, cide - 1);
        }
    }
}

patterns.Random();
drawGrid();
auto.checked = true;
perhapsAutoAdvance();
