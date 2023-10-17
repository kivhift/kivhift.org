/* Copyright (c) 2022-2023 Joshua Hughes <kivhift@gmail.com> */
"use strict";

function random(to) {
    return Math.floor(Math.random() * to);
}

function random_around_zero() {
    return 2 * Math.random() - 1;
}

class Vector {
    constructor(x, y) {
        this.set(x, y);
    }

    set(x, y) {
        this.x = x;
        this.y = y;
    }

    scaled_clone(s) {
        return new Vector(s * this.x, s * this.y);
    }

    add(other) {
        this.x += other.x;
        this.y += other.y;
    }

    sub(other) {
        this.x -= other.x;
        this.y -= other.y;
    }

    mul(s) {
        this.x *= s;
        this.y *= s;
    }

    div(s) {
        this.x /= s;
        this.y /= s;
    }

    dot(other) {
        return this.x * other.x + this.y * other.y;
    }

    distance_to(other) {
        let dx = this.x - other.x, dy = this.y - other.y;

        return Math.sqrt(dx * dx + dy * dy);
    }

    square_distance_to(other) {
        let dx = this.x - other.x, dy = this.y - other.y;

        return dx * dx + dy * dy;
    }

    magnitude() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    normalize() {
        let mag = this.magnitude();
        if (0 != mag) {
            this.div(mag);
        }
    }

    as_string() {
        return `<${this.x}, ${this.y}>`;
    }

    zero() {
        this.x = 0;
        this.y = 0;
    }

    static zeros() {
        return new Vector(0, 0);
    }

    static add(v1, v2) {
        return new Vector(v1.x + v2.x, v1.y + v2.y);
    }

    static sub(v1, v2) {
        return new Vector(v1.x - v2.x, v1.y - v2.y);
    }

    static mul(v, s) {
        return new Vector(s * v.x, s * v.y);
    }

    static div(v, s) {
        return new Vector(v.x / s, v.y / s);
    }
}

class Boid {
    constructor(x, y) {
        this.position = new Vector(x, y);
        this.velocity = new Vector(random_around_zero(), random_around_zero());
        this.acceleration = Vector.zeros();
        this.color = "rgb(0, 255, 0)";
        this.radius = 1;
    }

    draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, this.radius, 0, 2 * Math.PI);
        ctx.closePath();
        ctx.fill();
    }

    limit_speed(lim) {
        const mag = this.velocity.magnitude();
        if (mag < lim.min) {
            this.velocity.div(mag);
            this.velocity.mul(lim.min);
        } else if (mag > lim.max) {
            this.velocity.div(mag);
            this.velocity.mul(lim.max);
        }
    }

    bound_position(boundary, turn_factor) {
        const pos = this.position, min = boundary.min, max = boundary.max;
        if (pos.x < min.x) {
            this.velocity.x += turn_factor;
        } else if (pos.x > max.x) {
            this.velocity.x -= turn_factor;
        }

        if (pos.y < min.y) {
            this.velocity.y += turn_factor;
        } else if (pos.y > max.y) {
            this.velocity.y -= turn_factor;
        }
    }

    in_FOV(other) {
        let heading = this.velocity.scaled_clone(1);
        let displacement = Vector.sub(other.position, this.position);
        heading.normalize();
        displacement.normalize();

        return heading.dot(displacement) > -0.5;
    }
}

const canvas = document.querySelector("#canvas");
const ctx = canvas.getContext("2d");

const S = {
    count: 500,
    boids: null,
    pause_animation: false,
    show_HUD: false,
    show_help: false,
    tails: true,
    obstacle_enabled: false,
    obstacle: null,
    boundary: { min: null, max: null },
    factor: {
        alignment: 0.05,
        avoidance: 0.05,
        cohesion: 0.0005,
        separation: 0.05,
        turn: 0.1
    },
    range: { perception: 40, separation: 5 },
    speed: { min: 1, max: 7 },
    neighbors_of(idx, ok, too_close) {
        let boid = this.boids[idx];
        let pos = boid.position;
        let percep = this.range.perception * this.range.perception;
        let sep = this.range.separation * this.range.separation;

        for (let i = 0; i < this.boids.length; i++) {
            if (i === idx) {
                continue;
            }

            let dist = pos.square_distance_to(this.boids[i].position);
            if (dist > percep) {
                continue;
            }

            if (boid.in_FOV(this.boids[i])) {
                (dist < sep ? too_close : ok).push(i);
            }
        }
    },
}

function init() {
    const w = canvas.width, h = canvas.height;

    S.boids = [];
    for (let i = 0; i < S.count; i++) {
        S.boids.push(new Boid(random(w), random(h)));
    }

    S.obstacle = new Vector(-200, -200);

    S.boundary.min = new Vector(50, 50);
    S.boundary.max = new Vector(w - 50, h - 50);

    ctx.fillStyle = "rgb(0, 0, 0)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function draw_obstacle() {
    ctx.fillStyle = "rgba(255, 0, 0, 0.1)";
    ctx.beginPath();
    ctx.arc(S.obstacle.x, S.obstacle.y, S.range.perception, 0, 2 * Math.PI);
    ctx.closePath();
    ctx.fill();
}

function animate(timestamp) {
    ctx.fillStyle = S.tails ? "rgba(0, 0, 0, 0.1)" : "rgb(0, 0, 0)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (S.count !== S.boids.length) {
        S.count = Math.round(S.count);
        if (S.count < 1) {
            console.log("bunk count =", S.count);
            S.count = S.boids.length;
        } else if (S.count < S.boids.length) {
            console.log("truncate count =", S.count);
            S.boids.length = S.count;
        } else if (S.count > S.boids.length) {
            const delta = S.count - S.boids.length;
            const mid_x = canvas.width / 2, mid_y = canvas.height / 2;
            for (let i = 0; i < delta; i++) {
                S.boids.push(new Boid(mid_x, mid_y));
            }
            console.log("added-boid count =", delta);
        }
    }

    const percep = S.range.perception * S.range.perception;
    const use_obstacle = S.obstacle_enabled;
    let ok = [];
    let too_close = [];
    for (let i = 0; i < S.boids.length; i++) {
        let boid = S.boids[i];

        boid.draw(ctx);

        let accel = boid.acceleration;
        accel.zero();

        ok.length = 0;
        too_close.length = 0;
        S.neighbors_of(i, ok, too_close);
        if (too_close.length > 0) {
            let sod = boid.position.scaled_clone(too_close.length);
            for (const j of too_close) {
                sod.sub(S.boids[j].position);
            }
            // separation
            sod.div(too_close.length);
            sod.mul(S.factor.separation);
            accel.add(sod);
        }

        if (ok.length > 0) {
            let sop = Vector.zeros();
            let sov = Vector.zeros();

            for (const j of ok) {
                let neighbor = S.boids[j];
                sop.add(neighbor.position);
                sov.add(neighbor.velocity);
            }

            // cohesion
            sop.div(ok.length);
            sop.sub(boid.position);
            sop.mul(S.factor.cohesion);
            accel.add(sop);

            // alignment
            sov.div(ok.length);
            sov.sub(boid.velocity);
            sov.mul(S.factor.alignment);
            accel.add(sov);
        }

        if (use_obstacle
        && boid.position.square_distance_to(S.obstacle) < percep) {
            let avoid_obstacle = Vector.sub(boid.position, S.obstacle);
            avoid_obstacle.mul(S.factor.avoidance);
            accel.add(avoid_obstacle);
        }
    }

    for (const boid of S.boids) {
        boid.velocity.add(boid.acceleration);
        boid.bound_position(S.boundary, S.factor.turn);
        boid.limit_speed(S.speed);
        boid.position.add(boid.velocity);
    }

    if (use_obstacle) {
        draw_obstacle();
    }

    if (S.show_help) {
        show_help();
    } else if (S.show_HUD) {
        ctx.fillStyle = "white";
        let offset = 2;
        for (const desc of "factor range speed".split(" ")) {
            const obj = S[desc];
            for (const key of Object.keys(obj)) {
                const msg = `${key} ${desc}: ${obj[key]}`;
                ctx.fillText(msg, 2, offset);
                offset += 13;
            }
        }
        ctx.fillText(`count: ${S.count}`, 2, offset);
    }

    if (null !== I.value) {
        I.show_feedback();
    }

    if (S.pause_animation) {
        ctx.fillStyle = "red";
        ctx.fillText("Paused", canvas.width / 2, canvas.height / 2);
        return;
    }

    requestAnimationFrame(animate);
}

function adjust_size() {
    const w = window.innerWidth, h = window.innerHeight;
    canvas.width = w;
    canvas.height = h;

    if (null !== S.boundary.max) {
        S.boundary.max.set(w - 50, h - 50);
    }

    ctx.font = "12px monospace";
    ctx.textBaseline = "top";
}

window.addEventListener("load", (e) => {
    adjust_size();
    init();
    if (S.boids.length > 1) {
        animate();
    }
});

window.addEventListener("resize", (e) => {
    adjust_size();
});

canvas.addEventListener("click", (e) => {
    S.obstacle.x = e.x;
    S.obstacle.y = e.y;
    S.obstacle_enabled = true;
});

const I = {
    tag: null,
    value: null,
    obj: null,
    field: null,
    init(tag, obj, field) {
        I.tag = tag;
        I.obj = obj;
        I.field = field;
        I.value = "";
    },
    reset() {
        this.tag = null;
        this.value = null;
        this.obj = null;
        this.field = null;
        window.removeEventListener("keydown", number_keydown_handler);
        window.addEventListener("keydown", normal_keydown_handler);
        ctx.fillStyle = "black";
        ctx.fillRect(0, canvas.height - 16, canvas.width, canvas.height);
    },
    show_feedback() {
        ctx.fillStyle = "red";
        ctx.fillRect(0, canvas.height - 16, canvas.width, canvas.height);
        ctx.fillStyle = "white";
        ctx.fillText(`${I.tag}: ` + I.value, 2, canvas.height - 14);
    },
};

const number_keydown_handler = (e) => {
    const key = e.key;

    switch (key) {
    case "Escape":
        I.reset();
        return;
    case "Enter":
        const val = I.value.trim();
        if (0 === val.length) {
            I.reset();
            return;
        }
        const num = Number(val);
        if (!Number.isFinite(num)) {
            return;
        }
        I.obj[I.field] = num;
        I.reset();
        return;
    case "Backspace":
        if (I.value.length > 0) {
            I.value = I.value.slice(0, I.value.length - 1);
        }
        break;
    case "-": case "+": case ".": case ",":
    case "0": case "1": case "2": case "3": case "4":
    case "5": case "6": case "7": case "8": case "9":
        I.value += key;
        break;
    }

    I.show_feedback();
}

function get_number(tag, obj, field) {
    window.removeEventListener("keydown", normal_keydown_handler);
    window.addEventListener("keydown", number_keydown_handler);
    I.init(tag, obj, field);
    I.show_feedback();
}

const normal_keydown_handler = (e) => {
    switch (e.key) {
    // case "Escape":
    //     S.show_HUD = false;
    //     break;
    case " ":
        S.pause_animation = !S.pause_animation;
        if (!S.pause_animation) {
            animate();
        }
        break;
    case "?":
        S.show_help = !S.show_help;
        break;
    case "A":
        get_number("New Obstacle-avoidance Factor?", S.factor, "avoidance");
        break;
    case "a":
        get_number("New Alignment Factor?", S.factor, "alignment");
        break;
    case "C":
        get_number("New Boid Count?", S, "count");
        break;
    case "c":
        get_number("New Cohesion Factor?", S.factor, "cohesion");
        break;
    case "h":
        S.show_HUD = !S.show_HUD;
        break;
    case "M":
        get_number("New Maximum Speed?", S.speed, "max");
        break;
    case "m":
        get_number("New Minimum Speed?", S.speed, "min");
        break;
    case "o":
        S.obstacle_enabled = false;
        break;
    case "P":
        get_number("New perception range?", S.range, "perception");
        break;
    case "p":
            get_number("New separation range?", S.range, "separation");
        break;
    case "s":
        get_number("New Separation Factor?", S.factor, "separation");
        break;
    case "T":
        S.tails = !S.tails;
        break;
    case "t":
        get_number("New Turn Factor?", S.factor, "turn");
        break;
    }
};

function show_help() {
    ctx.fillStyle = "yellow";

    const help = `--- Help ---
Click to place obstacle.  The following
keys perform the coresponding action.

space: Toggle animation
    ?: Toggle help
    A: Enter avoidance factor
    a: Enter alignment factor
    C: Enter boid count
    c: Enter cohesion factor
    h: Toggle HUD
    M: Enter maximum speed
    m: Enter minimum speed
    o: Disable obstacle
    P: Enter perception range
    p: Enter separation range
    s: Enter separation factor
    T: Toggle tails
    t: Enter turn factor
`;
    let offset = 2;
    for (const line of help.split("\n")) {
        ctx.fillText(line, 2, offset);
        offset += 13;
    }
}

window.addEventListener("keydown", normal_keydown_handler);
