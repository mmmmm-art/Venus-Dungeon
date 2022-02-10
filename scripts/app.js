import { GameObject } from "./game-objects/game-object.js";
import {canvas, ctx} from "./canvas.js";
import {level1} from "./levels.js";
//@ts-check
/** @type {HTMLCanvasElement} */
//@ts-ignore


class Player extends GameObject {
	constructor(walls) {
		super(32, 32);
		this.walls = walls
		this.x = 1000;
		this.y = 100;
		this.isMovingUp = false;
		this.isMovingDown = false;
		this.isMovingRight = false;
		this.isMovingLeft = false;
		this.isSneaking = false;
		this.isRunning = false;
		this.baseSpeed = 5;

		this.wireUpEvents();
	}

	wireUpEvents() {
		window.addEventListener("keydown", (e) => {
			// console.log(e.key);
			this.toggleMovement(e.key, true);
		});

		window.addEventListener("keyup", (e) => {
			// console.log(e.key);
			this.toggleMovement(e.key, false);
		});
	}

	toggleMovement(key, toggleValue) {
		switch (key) {
			case "ArrowUp":
			case "w":
				this.isMovingUp = toggleValue;
				break;
			case "ArrowDown":
			case "s":
				this.isMovingDown = toggleValue;
				break;
			case "ArrowRight":
			case "d":
				this.isMovingRight = toggleValue;
				break;
			case "ArrowLeft":
			case "a":
				this.isMovingLeft = toggleValue;
				break;
			case "q":
				this.isSneaking = toggleValue;
				break;
			case "e":
				this.isRunning = toggleValue;
				break;
		}
	}

	update(elaspsedtime) {
		this.color += 0.5;
		let speedMultiplier = 1;

		if (this.isRunning && !this.isSneaking) {
			speedMultiplier = 2;
		} else if (this.isSneaking && !this.isRunning) {
			speedMultiplier = 0.5;
		}

		let speed = this.baseSpeed * speedMultiplier;

		if (this.isMovingUp) {
			this.y -= speed;
		}

		if (this.isMovingDown) {
			this.y += speed;
		}

		if (this.isMovingRight) {
			this.x += speed;
		}

		if (this.isMovingLeft) {
			this.x -= speed;
		}

		if(this.x + this.width >= canvas.width)
		{
			this.x = canvas.width - this.width
		}
		if(this.x <= 0)
		{
			this.x = 0
		}
		if(this.y + this.height >= canvas.height)
		{
			this.y = canvas.height - this.height
		}
		if(this.y <= 0)
		{
			this.y = 0
		}


		walls.forEach((w) => {
			if (this.isColliding(w))
			{
				let Bounds = w.getBounds();

				if(player.isMovingDown)
				{
					this.y = Bounds.top - this.height
				}
				else if (player.isMovingUp)
				{
					this.y = Bounds.bottem
				}
				if(player.isMovingRight)
				{
					this.x = Bounds.leftSide - this.width
				}
				else if (player.isMovingLeft)
				{
					this.x = Bounds.rightSide
				}

			}
		});
		

	}

}

class Monster extends GameObject {
/**
	 * @param {Player} [player]
	 */
constructor(player, health, walls) {
super(32, 32);
this.player = player;
this.walls = walls;
this.health = health;
this.x = Math.random() * canvas.width;
this.y = Math.random() * canvas.height;
this.baseSpeed = 5;
this.image.src = `/images/monster.png`
this.senseDis = 150;

this.movement = {
	timeSinceLastUpdate: 0,
	timeToNextUpdate: 1000,
	x: {
		direction: 1,
		speed: this.baseSpeed,
	},
	y: {
		direction: 1,
		speed: this.baseSpeed,
	},
};


}

update(elaspsedtime) {
	this.color ++;
	this.movement.timeSinceLastUpdate += elaspsedtime;
	if (this.movement.timeSinceLastUpdate >= this.movement.timeToNextUpdate) {
		this.movement.x.direction = Math.random() >= 0.5? 1 : -1;
		this.movement.y.direction = Math.random() >= 0.5? 1 : -1;
		this.movement.x.speed = Math.random() * this.baseSpeed;
		this.movement.y.speed = Math.random() * this.baseSpeed;
		this.movement.timeToNextUpdate = Math.random() * 1000 + 500;
		this.movement.timeSinceLastUpdate = 0;
	}

	if(this.x + this.width >= canvas.width)
	{
		this.movement.x.direction = -1
	}
	if(this.x <= 0)
	{
		this.movement.x.direction = 1
	}
	if(this.y + this.height >= canvas.height)
	{
		this.movement.y.direction = -1
	}
	if(this.y <= 0)
	{
		this.movement.y.direction = 1
	}

	if(player.isSneaking)
	{
		this.senseDis = 50
	}
	else
	{
		this.senseDis = 150
	}

	let insideX = player.x > this.x - this.senseDis && player.x < this.x + this.senseDis;
	let insideY = player.y > this.y - this.senseDis && player.y < this.y + this.senseDis;
	let isInside = insideX && insideY;

	let insideX2 = player.x + player.width > this.x && player.x < this.x + this.width;
	let insideY2 = player.y + player.height > this.y && player.y < this.y + this.height;
	let isInside2 = insideX2 && insideY2;

	if (player.x > this.x - this.senseDis && player.x < this.x && isInside)
	{
		this.movement.x.direction = -1;
	}
	if (player.x < this.x + this.senseDis && player.x > this.x && isInside)
	{
		this.movement.x.direction = 1;
	}
	if(player.y > this.y - this.senseDis && player.y < this.y && isInside)
	{
		this.movement.y.direction = -1;
	}
	if (player.y < this.y + this.senseDis && player.y > this.y && isInside)
	{
		this.movement.y.direction = 1;
	}

	if(isInside2)
	{
		this.health.health -= 10
        this.health.healthX += 5;
	}

	this.x += this.movement.x.speed * this.movement.x.direction;
	this.y += this.movement.y.speed * this.movement.y.direction;

	walls.forEach((w) => {
		if (this.isColliding(w))
		{
			let Bounds = w.getBounds();

			if(this.movement.y.direction = 1)
			{
				this.y = Bounds.top - this.height
			}
			else if (this.movement.y.direction = -1)
			{
				this.y = Bounds.bottem
			}
			if(this.movement.x.direction = 1)
			{
				this.x = Bounds.leftSide - this.width
			}
			else if (this.movement.x.direction = -1)
			{
				this.x = Bounds.rightSide
			}

		}
	});

}

}

class Wall extends GameObject {
	constructor(x, y, w, h) {
		super(w, h);
		this.x = x;
		this.y = y;
		this.width = w;
		this.height = h;
		this.image.src = `/images/block.png`;
	}

	update(elaspsedtime) {

	}


}

class Game {
	constructor() {

	}
	/**
	 * @param {string[]} level1 
	 */
	loadLevel(level1) {
		let walls = [];
		let monsters = [];
		let player;
		level1.forEach((row, idx) => {
			for (let col = 0; col < row.length; col++) {
				let x = col * 16;
				let y = idx * 16
				switch(row[col]) {
					case "w":
						walls.push(new Wall(x, y, 16, 16));
						break;
					case "m":
						monsters.push(new Monster(null));
						break;
					case "p":
						player = new Player(null)
						player.x = x;
						player.y = y;
						break



				}
				
			}
		});
	}


}

class Health {
	constructor() {
		this.health = 1000
        this.healthX = 200;
	}

	update(elaspsedtime) {

		if (this.health <= 0)
        {
            // @ts-ignore
            trace.opacity = 0;
        }
	}

	render() {
		ctx.save();
        ctx.fillStyle = 'hsla(0, 100%, 50%, 1)';
        ctx.fillRect(200, 10, 1000, 20);
        ctx.restore();

        ctx.save();
        ctx.fillStyle = 'hsla(100, 100%, 50%, 1)';
        ctx.fillRect(this.healthX, 10, this.health, 20);
        ctx.restore();
	}
}

let walls = [];
let player = new Player(walls);
let health = new Health();
let monster = new Monster(player, health, walls);
let game = new Game();
let gameObjects = [monster, ...walls, player, health];





let currentTime = 0;

function gameLoop(timestamp) {
	ctx.clearRect(0, 0, canvas.width, canvas.height);

	let elaspsedtime = timestamp - currentTime;
	currentTime = timestamp;
	game.loadLevel(level1);
	gameObjects.forEach((o) => {
        o.update(elaspsedtime);
        o.render();
    });
	requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);
