class Bullet {
    constructor({x, y, radius, angle, speed, color ="white"}){
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.speed = speed;
        this.angle = angle;
        this.color = color;
    }

    draw(){
        ctx.beginPath();
        ctx.arc(ths.x, this.y, this.radius, 0, Math.PI * 2, false);
        ctx.fillStyle = this.color;
        ctx.closePath();
    }
}