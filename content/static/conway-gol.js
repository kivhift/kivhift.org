/* Copyright (c) 2017 Joshua Hughes <kivhift@gmail.com> */
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
var grid = Grid(101);

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

var patterns = Object.create(null);
patterns.Random = function() {
    blankGrid();
    for(var i = 0; i < grid.data.length; i++) {
        grid.data[i] = Math.random() < 0.2 ? true : false;
    }
};
patterns['R-pentomino'] = function() {
    blankGrid();

    var mr, mc, d = grid.data;

    mr = mc = middle();
    d[offset(mr - 1, mc)] = true;
    d[offset(mr - 1, mc + 1)] = true;
    d[offset(mr, mc - 1)] = true;
    d[offset(mr, mc)] = true;
    d[offset(mr + 1, mc)] = true;
};
patterns.Diehard = function() {
    blankGrid();

    var mr, mc, d = grid.data;

    mr = mc = middle();
    d[offset(mr - 1, mc + 2)] = true;
    d[offset(mr, mc - 4)] = true;
    d[offset(mr, mc - 3)] = true;
    d[offset(mr + 1, mc - 3)] = true;
    d[offset(mr + 1, mc + 1)] = true;
    d[offset(mr + 1, mc + 2)] = true;
    d[offset(mr + 1, mc + 3)] = true;
};
patterns.Acorn = function() {
    blankGrid();

    var mr, mc, d = grid.data;

    mr = mc = middle();
    d[offset(mr - 1, mc - 2)] = true;
    d[offset(mr, mc)] = true;
    d[offset(mr + 1, mc - 3)] = true;
    d[offset(mr + 1, mc - 2)] = true;
    d[offset(mr + 1, mc + 1)] = true;
    d[offset(mr + 1, mc + 2)] = true;
    d[offset(mr + 1, mc + 3)] = true;
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
