/* Copyright (c) 2022-2023 Joshua Hughes <kivhift@gmail.com> */
"use strict";

function random(to) {
    return Math.floor(Math.random() * to);
}

function euclidean(a, b) {
    return Math.sqrt(a * a + b * b);
}

function manhattan(a, b) {
    return Math.abs(a) + Math.abs(b);
}

function minkowski(a, b, p) {
    return Math.pow(
        Math.pow(Math.abs(a), p) + Math.pow(Math.abs(b), p),
        1 / p
    );
}

let distance = manhattan;
// let distance = (a, b) => {
//     return minkowski(a, b, 0.5);
// }

const radius = 125;
let mouse = {
    radius: radius,
    x: radius,
    y: radius,
    vx: 2,
    vy: 3,
    adjust() {
        if ((this.x + this.radius) > canvas.width) {
            this.x = canvas.width - this.radius;
        } else if (this.x < this.radius) {
            this.x = this.radius;
        }

        if ((this.y + this.radius) > canvas.height) {
            this.y = canvas.height - this.radius;
        } else if (this.y < this.radius) {
            this.y = this.radius;
        }
    },
    update() {
        this.x += this.vx;
        this.y += this.vy;

        if (((this.x + this.radius) > canvas.width)
        ||   (this.x < this.radius)) {
            this.vx *= -1;
        }

        if (((this.y + this.radius) > canvas.height)
        ||   (this.y < this.radius)) {
            this.vy *= -1;
        }
    },
};

window.addEventListener("mousemove", (e) => {
    mouse.x = e.x;
    mouse.y = e.y;
    mouse.adjust();
});

class Particle {
    constructor(x, y, home_x, home_y, intensity, is_text) {
        this.x = x;
        this.y = y;
        this.home_x = home_x;
        this.home_y = home_y;
        this.color = is_text
            ? `rgb(0, ${intensity}, 0)`
            : `rgb(${intensity}, ${intensity}, ${intensity})`;
        this.away_color = `rgb(${intensity}, 0, 0)`;
        this.radius = 0.5;
    }

    draw(repelled) {
        ctx.fillStyle = repelled ? this.away_color : this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
        ctx.closePath();
        ctx.fill();
    }

    update() {
        let dx = mouse.x - this.x;
        let dy = mouse.y - this.y;
        let dist = distance(dx, dy);
        let norm_x = dx / dist, norm_y = dy / dist;
        let repel = false;

        if (dist < (mouse.radius + this.radius)) {
            repel = true;
            this.x -= norm_x;
            this.y -= norm_y;
        } else {
            dx = this.x - this.home_x;
            dy = this.y - this.home_y;
            dist = distance(dx, dy);
            if (dist > 0) {
                this.x -= dx / dist;
                this.y -= dy / dist;
            }
        }

        this.draw(repel);
    }
}
let particles = [];

function draw_field() {
    function init() {
        const canv = document.createElement("canvas");
        const cc = canv.getContext("2d");
        const text_height = 48;
        const msg = "Hello!", font = `${text_height}px serif`;
        cc.font = font;
        const metrics = cc.measureText(msg);
        canv.width = Math.ceil(metrics.width);
        canv.height = text_height;
        // Changing the width/height changed the font back to its default for
        // some reason.
        cc.font = font;
        cc.textBaseline = "top";
        cc.fillStyle = 'rgb(0, 0, 0)';
        cc.fillRect(0, 0, canv.width, canv.height);
        cc.fillStyle = 'rgb(255, 0, 0)';
        cc.fillText(msg, 0, 0);
        const text = cc.getImageData(0, 0, canv.width, canv.height);

        const particle_count = 5000;
        let bi = 0, p = 0;
        particles = [];
        for (
            let iy = 0, cy = (canvas.height / 2) - (2 * text.height);
            iy < text.height;
            iy++, cy += 4
        ) {
            for (
                let ix = 0, cx = (canvas.width / 2) - (2 * text.width);
                ix < text.width;
                ix++, cx += 4
            ) {
                if (text.data[bi] > 0) {
                    particles.push(new Particle(
                        random(canvas.width), random(canvas.height),
                        cx, cy, text.data[bi], true
                    ));
                    p++;
                }
                bi += 4;
            }
        }
        for (; p < particle_count; p++) {
            particles.push(new Particle(
                random(canvas.width), random(canvas.height),
                random(canvas.width), random(canvas.height),
                255, false
            ));
        }

        mouse.x = random(canvas.width);
        mouse.y = random(canvas.height);
        mouse.adjust();
    }

    function animate() {
        ctx.fillStyle = "rgba(0, 0, 0, 0.1)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        mouse.update();

        particles.forEach((particle) => {
            particle.update();
        });

        requestAnimationFrame(animate);
    }

    window.addEventListener("resize", () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        init();
    });

    init();
    animate();
}

const canvas = document.querySelector("#canvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

window.addEventListener("load", (e) => { draw_field(); });
