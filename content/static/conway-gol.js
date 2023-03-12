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
    return grid.side >> 1;
}
function blankGrid() {
    for(var i = 0; i < grid.data.length; i++) {
        grid.data[i] = false;
    }
}
function setRLE(rle) {
    var _0 = '0'.charCodeAt()
        , _9 = '9'.charCodeAt()
        , width = 'x'.charCodeAt()
        , height = 'y'.charCodeAt()
        , blank = 'b'.charCodeAt()
        , occupied = 'o'.charCodeAt()
        , eol = '$'.charCodeAt()
        , end = '!'.charCodeAt();

    var count = 0;
    var get_and_reset_count = function() {
        var cc = count > 0 ? count : 1;
        count = 0;
        return cc;
    };
    var inc = Object.create(null);

    var row, col, left_col, d = grid.data;
    for (var i = 0; i < rle.length; i++) {
        var ch = rle[i].charCodeAt();

        if (_0 <= ch && ch <= _9) {
            count *= 10;
            count += ch - _0;
        } else if (blank === ch) {
            inc.col();
        } else if (occupied === ch) {
            var lim = get_and_reset_count();
            for (var j = 0; j < lim; j++, col++) {
                d[offset(row, col)] = true;
            }
        } else if(eol === ch) {
            inc.row();
        } else if(end === ch) {
            break;
        } else if (width === ch) {
            if (inc.has_width) {
                blankGrid();
                console.error('Width specified more than once!');
                return;
            }
            col = middle() - (get_and_reset_count() >> 1);
            if (col < 0) {
                blankGrid();
                console.error('Width too wide for grid!');
                return;
            }
            left_col = col;
            inc.col = function() {
                col += get_and_reset_count();
            };
            inc.has_width = true;
        } else if (height === ch) {
            if (inc.has_height) {
                blankGrid();
                console.error('Height specified more than once!');
                return;
            }
            row = middle() - (get_and_reset_count() >> 1);
            if (row < 0) {
                blankGrid();
                console.error('Height too high for grid!');
                return;
            }
            inc.row = function() {
                row += get_and_reset_count();
                col = left_col;
            }
            inc.has_height = true;
        } else {
            blankGrid();
            console.error('Bad character: ' + rle[i]);
            return;
        }
    }
}

var patterns = Object.create(null);
patterns.Random = function() {
    blankGrid();
    for(var i = 0; i < grid.data.length; i++) {
        grid.data[i] = Math.random() < 0.2 ? true : false;
    }
};
patterns.Blank = blankGrid;
patterns['R-pentomino'] = function() {
    blankGrid();
    setRLE("3x3yb2o$2o$bo!");
};
patterns.Diehard = function() {
    blankGrid();
    setRLE("8x3y6bo$2o$bo3b3o!");
};
patterns.Acorn = function() {
    blankGrid();
    setRLE("7x3ybo$3bo$2o2b3o!");
};
patterns.Herschel = function() {
    blankGrid();
    setRLE("3x4yo$3o$obo$2bo!");
};
patterns.Tube = function() {
    blankGrid();

    var mc = middle(), d = grid.data;
    for(var i = 0; i < grid.side; i++) {
        d[offset(i, mc)] = true;
        if(0 == (i % 3)) {
            d[offset(i, mc - 1)] = true;
        }
    }
};
patterns["Munroe's Conway Tribute"] = function() {
    blankGrid();
    setRLE("7x9y2b3o$2bobo$2bobo$3bo$ob3o$bobobo$3bo2bo$2bobo$2bobo!");
};
patterns['Happy Gliders'] = function() {
    blankGrid();
    setRLE("8x4y2bo2bo$o6bo$bo4bo$2b4o!");
};
patterns['Gosper Glider Gun'] = function() {
    blankGrid();
    setRLE("36x9y"
    + "24bo11b$22bobo11b$12b2o6b2o12b2o$11bo3bo4b2o12b2o$2o8bo5bo3b2o14b$2o8b"
    + "o3bob2o4bobo11b$10bo5bo7bo11b$11bo3bo20b$12b2o!"
    );
};
patterns['Simkin Glider Gun'] = function() {
    blankGrid();
    setRLE("33x21y"
    + "2o5b2o$2o5b2o2$4b2o$4b2o5$22b2ob2o$21bo5bo$21bo6bo2b2o$21b3o3bo3b2o$"
    + "26bo4$20b2o$20bo$21b3o$23bo!"
    );
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
    setRLE("8x6y6bo$4bob2o$4bobo$4bo$2bo$obo!");
};
patterns['Infinite Growth 2'] = function() {
    blankGrid();
    setRLE("5x5y3obo$o$3b2o$b2obo$obobo!");
};
patterns['Infinite Growth 3'] = function() {
    blankGrid();
    setRLE("39xy8ob5o3b3o6b7ob5o!");
};

// The RLEs were obtained from: https://www.conwaylife.com/wiki
patterns['Space Rake'] = function() {
    blankGrid();
    setRLE("22x19y"
    + "11b2o5b4o$9b2ob2o3bo3bo$9b4o8bo$10b2o5bo2bob2$8bo13b$7b2o8b2o3b$6bo9bo"
    + "2bo2b$7b5o4bo2bo2b$8b4o3b2ob2o2b$11bo4b2o4b4$18b4o$o2bo13bo3bo$4bo16bo"
    + "$o3bo12bo2bob$b4o!"
    );
};
patterns["Noah's Ark"] = function() {
    blankGrid();
    setRLE(
    "15x15y10bobo2b$9bo5b$10bo2bob$12b3o6$bo13b$obo12b2$o2bo11b$2b2o11b$3bo!"
    );
};
patterns.Max = function() {
    blankGrid();
    setRLE("27x27y"
    + "18bo8b$17b3o7b$12b3o4b2o6b$11bo2b3o2bob2o4b$10bo3bobo2bobo5b$10bo4bobo"
    + "bobob2o2b$12bo4bobo3b2o2b$4o5bobo4bo3bob3o2b$o3b2obob3ob2o9b2ob$o5b2o"
    + "5bo13b$bo2b2obo2bo2bob2o10b$7bobobobobobo5b4o$bo2b2obo2bo2bo2b2obob2o"
    + "3bo$o5b2o3bobobo3b2o5bo$o3b2obob2o2bo2bo2bob2o2bob$4o5bobobobobobo7b$"
    + "10b2obo2bo2bob2o2bob$13bo5b2o5bo$b2o9b2ob3obob2o3bo$2b3obo3bo4bobo5b4o"
    + "$2b2o3bobo4bo12b$2b2obobobobo4bo10b$5bobo2bobo3bo10b$4b2obo2b3o2bo11b$"
    + "6b2o4b3o12b$7b3o17b$8bo!"
    );
};
patterns.Scholar = function() {
    blankGrid();
    setRLE("23x81y"
    + "10b3o$9bo3bo2$7bo7bo$6b2obobobob2o$6b3o5b3o2$6bobo5bobo$6bo2bo3bo2bo$"
    + "7b3o3b3o$4bo4bo3bo4bo$4b5o5b5o$9bo3bo$5b3obo3bob3o$4bo13bo$6bob2o3b2ob"
    + "o$5bo11bo$6b3o5b3o$7b3o3b3o$b2o17b2o$ob2o4bo5bo4b2obo$o2bo2b2ob5ob2o2b"
    + "o2bo$bo5bo3bo3bo5bo$6bo9bo$6bo3bobo3bo$7bobo3bobo$6b4o3b4o$6bobobobobo"
    + "bo$7bo2bobo2bo$7bob2ob2obo2$3b5o7b5o$3b2obo9bob2o$2bo3b2o7b2o3bo2$7b4o"
    + "b4o$2bobobo9bobobo$3b2o3bobobobo3b2o$4b2o4bobo4b2o$4bo4bo3bo4bo$b3obo"
    + "3bo3bo3bob3o$o2b2ob3o5b3ob2o2bo$bob3o3bo3bo3b3obo$2bo5b2o3b2o5bo$7b2o"
    + "5b2o$7b2obobob2o2$5b2o9b2o$5b2o9b2o$7bo7bo$10bobo$7b3o3b3o$7b2o5b2o$7b"
    + "3o3b3o$7b3o3b3o$7bo2bobo2bo$8b3ob3o$8b2o3b2o$9b2ob2o2$8b2o3b2o$4b2o4b"
    + "3o4b2o$3b2o5b3o5b2o$2bo8bo8bo$b5o5bo5b5o$b2ob2o4b3o4b2ob2o$2b4o3bobobo"
    + "3b4o$3bo4bo5bo4bo$7bo7bo$3b3o11b3o$5bo5bo5bo$10bobo$6bo2bo3bo2bo$7bo2b"
    + "obo2bo$6b3o2bo2b3o$5bo11bo$4b3o9b3o$4bo13bo$3b3o11b3o$3bo15bo$3b2o13b"
    + "2o!"
    );
};
patterns['Spaghetti Monster'] = function() {
    blankGrid();
    setRLE("27x137y"
    + "8b3o5b3o$8bobo5bobo$8bobo5bobo$6bob2o3bo3b2obo$6b2o4bobo4b2o$10b2obob"
    + "2o$9bo7bo$9bobo3bobo$5b5o7b5o$4bo2bo11bo2bo$5bob3o7b3obo$7bob2o5b2obo$"
    + "6b2obobo3bobob2o$6b3obo5bob3o2$10b2o3b2o$12bobo$9bo7bo$9b2o5b2o$6b2o"
    + "11b2o$4bob2o11b2obo$4b2o2b2o7b2o2b2o$4bo2bo2bo5bo2bo2bo$5bo4bo5bo4bo$"
    + "5bo2bo2bo3bo2bo2bo$2bo5bo9bo5bo$3bobo15bobo$7bo11bo$3bo3bobo7bobo3bo$"
    + "3bo2bo3bo5bo3bo2bo$4b2o2b2o7b2o2b2o$8bo9bo2$8b5ob5o$bo6b2ob2ob2ob2o6bo"
    + "$3o7bo5bo7b3o$o2b2o5bo5bo5b2o2bo$2bo3b5o5b5o3bo$7bob2o5b2obo$bo3bo15bo"
    + "3bo$bob2o2bo11bo2b2obo$bob4o13b4obo$4bo17bo2$2bo21bo$bobo19bobo$o25bo$"
    + "o3bo17bo3bo$5bo15bo$2o23b2o$2bo3bo2bo7bo2bo3bo$2bo3bobobo5bobobo3bo$2b"
    + "o5bob2o3b2obo5bo$2bo3b2obo7bob2o3bo$6b2o11b2o$4bo17bo$3bo19bo$3bo4bo9b"
    + "o4bo$2b2o3b2o9b2o3b2o$2b2o3bobo7bobo3b2o$2b2o3b2o3b3o3b2o3b2o$2b3o2b3o"
    + "bo3bob3o2b3o$6bob2obo3bob2obo$2b2o3b2obo5bob2o3b2o$3bob2o3bobobobo3b2o"
    + "bo$11bobobo$8bo9bo$8b3o5b3o$10b2obob2o$10b7o$8b3o5b3o$7b2obobobobob2o$"
    + "6bo3bo5bo3bo$11b2ob2o$5bo2bobobobobobo2bo$6b4o7b4o$9bo7bo$9bo7bo$6b2ob"
    + "o2bobo2bob2o2$9b2o5b2o3$9bo7bo$9b3o3b3o$8bo2bo3bo2bo$9bo7bo$8bo2bo3bo"
    + "2bo$11b2ob2o$12bobo$10bobobobo$9bo3bo3bo$9bo7bo$12bobo$7b2obo5bob2o$7b"
    + "2o2bo3bo2b2o$7bo11bo$8bo9bo$6bobo9bobo$5b4o9b4o$5b2obobo5bobob2o$4bo2b"
    + "o11bo2bo$9bobo3bobo$8b2obo3bob2o$4bo2bo3b2ob2o3bo2bo$9bo2bobo2bo$6bo2b"
    + "ob2ob2obo2bo$7bobobobobobobo$8b2o2bobo2b2o$9bobo3bobo$10b2o3b2o$7b2o9b"
    + "2o$7b3o7b3o$7bobo7bobo$5b2o2bo7bo2b2o$5b2o13b2o$11bo3bo$6bo4bo3bo4bo$"
    + "6b2o3bo3bo3b2o$7bo2bo5bo2bo$7b3o7b3o$6bobo9bobo$6b2o11b2o$6bobo4bo4bob"
    + "o$6b2o4b3o4b2o$6b2o3bo3bo3b2o$5b3o4b3o4b3o$3b2o17b2o$2bo5b2o2bobo2b2o"
    + "5bo2$2bo2bob3ob2ob2ob3obo2bo$8b3o5b3o$10b3ob3o$5bo4b2obob2o4bo$11bo3bo"
    + "2$11b2ob2o!"
    );
};
patterns['Sir Robin'] = function() {
    blankGrid();
    setRLE("31x79y"
    + "4b2o$4bo2bo$4bo3bo$6b3o$2b2o6b4o$2bob2o4b4o$bo4bo6b3o$2b4o4b2o3bo$o9b"
    + "2o$bo3bo$6b3o2b2o2bo$2b2o7bo4bo$13bob2o$10b2o6bo$11b2ob3obo$10b2o3bo2b"
    + "o$10bobo2b2o$10bo2bobobo$10b3o6bo$11bobobo3bo$14b2obobo$11bo6b3o2$11bo"
    + "9bo$11bo3bo6bo$12bo5b5o$12b3o$16b2o$13b3o2bo$11bob3obo$10bo3bo2bo$11bo"
    + "4b2ob3o$13b4obo4b2o$13bob4o4b2o$19bo$20bo2b2o$20b2o$21b5o$25b2o$19b3o"
    + "6bo$20bobo3bobo$19bo3bo3bo$19bo3b2o$18bo6bob3o$19b2o3bo3b2o$20b4o2bo2b"
    + "o$22b2o3bo$21bo$21b2obo$20bo$19b5o$19bo4bo$18b3ob3o$18bob5o$18bo$20bo$"
    + "16bo4b4o$20b4ob2o$17b3o4bo$24bobo$28bo$24bo2b2o$25b3o$22b2o$21b3o5bo$"
    + "24b2o2bobo$21bo2b3obobo$22b2obo2bo$24bobo2b2o$26b2o$22b3o4bo$22b3o4bo$"
    + "23b2o3b3o$24b2ob2o$25b2o$25bo2$24b2o$26bo!"
    );
};
patterns['Half-bakery Reaction'] = function() {
    blankGrid();
    setRLE("59x53y"
    + "57bo$56bo$56b3o12$36bo$34b2o$35b2o22$20b2o$19bo2bo$19bobo$17b2obo$16bo"
    + "2bo$16bobo$17bo2$4b2o$3bo2bo$3bobo$b2obo$o2bo$obo$bo!"
    );
};

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
