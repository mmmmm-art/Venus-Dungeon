import { GameObject, Location } from "./game-objects/game-object.js";
import { canvas, ctx } from "./canvas.js";
import { level1, level2 } from "./levels.js";
//@ts-check
/** @type {HTMLCanvasElement} */
//@ts-ignore

class Player extends GameObject {
	constructor(walls, x, y) {
		super(32, 32, x, y);
		this.walls = walls;
		this.health = 1000;
		this.healthX = 200;
		this.isMovingUp = false;
		this.isMovingDown = false;
		this.isMovingRight = false;
		this.isMovingLeft = false;
		this.isSneaking = false;
		this.isRunning = false;
		this.shoot = false;
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
			case " ":
				this.shoot = toggleValue;
				break;
		}
	}

	update(elaspsedtime) {
		let speedMultiplier = 1;

		if (this.health <= 0) {
			// @ts-ignore
			trace.opacity = 0;
		}

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

		if (this.x + this.width >= canvas.width) {
			this.x = canvas.width - this.width;
		}
		if (this.x <= 0) {
			this.x = 0;
		}
		if (this.y + this.height >= canvas.height) {
			this.y = canvas.height - this.height;
		}
		if (this.y <= 0) {
			this.y = 0;
		}

		this.walls.forEach((w) => {
			let safeLocation = this.isColliding(w);
			if (safeLocation) {
				this.x = safeLocation.x;
				this.y = safeLocation.y;
			}
		});

		super.update(elaspsedtime);

		ctx.save();
		ctx.fillStyle = "hsla(0, 100%, 50%, 1)";
		ctx.fillRect(200, 10, 1000, 20);
		ctx.restore();

		ctx.save();
		ctx.fillStyle = "hsla(100, 100%, 50%, 1)";
		ctx.fillRect(this.healthX, 10, this.health, 20);
		ctx.restore();
	}
}

class Monster extends GameObject {
	/**
	 * @param {Player} [player]
	 */
	constructor(player, walls, x, y) {
		super(32, 32, x, y);
		this.player = player;
		this.walls = walls;
		this.baseSpeed = 2;
		this.image.src = `/images/monster.png`;
		this.senseDis = 150;
		this.isLastMoveCollide = false;

		this.movement = {
			timeSinceLastUpdate: 0,
			timeToNextUpdate: 1000,
			x: {
				direction: 0,
				speed: this.baseSpeed,
			},
			y: {
				direction: 0,
				speed: this.baseSpeed,
			},
		};
	}

	update(elaspsedtime) {
		this.movement.timeSinceLastUpdate += elaspsedtime;
		if (this.movement.timeSinceLastUpdate >= this.movement.timeToNextUpdate || this.isLastMoveCollide) 
		{
			this.movement.x.direction = Math.random() >= 0.5 ? 1 : -1;
			this.movement.y.direction = Math.random() >= 0.5 ? 1 : -1;
			this.movement.x.speed = Math.random() * this.baseSpeed;
			this.movement.y.speed = Math.random() * this.baseSpeed;
			this.movement.timeToNextUpdate = Math.random() * 1000 + 500;
			this.movement.timeSinceLastUpdate = 0;
		}

		if (player.isSneaking) {
			this.senseDis = 50;
		} else {
			this.senseDis = 150;
		}

		let insideX =
			player.x > this.x - this.senseDis &&
			player.x < this.x + this.senseDis;
		let insideY =
			player.y > this.y - this.senseDis &&
			player.y < this.y + this.senseDis;
		let isInside = insideX && insideY;

		let insideX2 =
			player.x + player.width > this.x && player.x < this.x + this.width;
		let insideY2 =
			player.y + player.height > this.y &&
			player.y < this.y + this.height;
		let isInside2 = insideX2 && insideY2;

		if (
			player.x > this.x - this.senseDis &&
			player.x < this.x &&
			isInside
		) {
			this.movement.x.direction = -1;
			this.baseSpeed = 5;
		}
		if (
			player.x < this.x + this.senseDis &&
			player.x > this.x &&
			isInside
		) {
			this.movement.x.direction = 1;
			this.baseSpeed = 5;
		}
		if (
			player.y > this.y - this.senseDis &&
			player.y < this.y &&
			isInside
		) {
			this.movement.y.direction = -1;
			this.baseSpeed = 5;
		}
		if (
			player.y < this.y + this.senseDis &&
			player.y > this.y &&
			isInside
		) {
			this.movement.y.direction = 1;
			this.baseSpeed = 5;
		}

		if (isInside2) {
			player.health -= 5;
			player.healthX += 2.5;
		}

		this.x += this.movement.x.speed * this.movement.x.direction;
		this.y += this.movement.y.speed * this.movement.y.direction;

		this.isLastMoveCollide = false;
		this.walls.forEach((w) => {
			let safeLocation = this.isColliding(w);
			if (safeLocation) {
				this.isLastMoveCollide = true;
				this.x = safeLocation.x;
				this.y = safeLocation.y;
			}
		});

		super.update(elaspsedtime);
	}
}

class Wall extends GameObject {
	constructor(x, y, w, h) {
		super(w, h, x, y);
		this.image.src = `/images/block.png`;
	}
}

class Game {
	constructor() {}
	/**
	 * @param {string[]} level1
	 */
	loadLevel(level1) {
		let walls = [];
		let monsters = [];
		let monsterCoords = [];
		let playerCoords = { x: 0, y: 0 };
		let player;
		let keys = [];
		level1.forEach((row, idx) => {
			for (let col = 0; col < row.length; col++) {
				let x = col * 16;
				let y = idx * 16;
				switch (row[col]) {
					case "w":
						walls.push(new Wall(x, y, 16, 16));
						break;
					case "m":
						monsterCoords.push({ x: x, y: y });
						break;
					case "p":
						playerCoords = { x: x, y: y };
						break;
					case "k":
						keys.push(new Key(x, y));
						break;

				}
			}
		});

		player = new Player(walls, playerCoords.x, playerCoords.y);

		monsterCoords.forEach((c) => {
			monsters.push(new Monster(player, walls, c.x, c.y));
		});

		return { player: player, monsters: monsters, walls: walls, keys: keys};
	}
}

class Key extends GameObject {
	constructor(x, y) {
		super(16, 10, x, y);
		this.isPicked = false;
		this.image.src = `/images/key.png`;
	}


}

class Bullet extends GameObject {
	constructor(xd, yd) {
		super(10, 10);
		this.x = player.x;
		this.originalX =  player.x
		this.y = player.y;
		this.image.src = `/images/bullet.png`;
		this.xd = xd;
		this.yd = yd;
		this.movement = {
			x: {
				direction: this.xd,
				speed: 6,
			},
			y: {
				direction: this.yd,
				speed: 6,
			},
		};
	}
	update(elaspsedtime) {
		this.x += this.movement.x.speed * this.movement.direction;
		this.y += this.movement.y.speed * this.movement.direction;

		if(this.x > this.originalX + 200)
		{
			
		}
	}
}

class BulletMan {
	/**
	 * @param {Player} player
	 * @param {Array<Monster>} monsters
	 * @param {Array<Wall>} walls
	 * @param {Array<Bullet>} bullets
	 */
	constructor(player, monsters, walls, bullets) {
		this.player = player;
		this.monsters = monsters;
		this.walls = walls;
		this.bullets = bullets;
	}

	update(elaspsedtime) {
		if(player.shoot)
		{

		}
	}
}

let game = new Game();

let { player, monsters, walls, keys } = game.loadLevel(level1);
let bullets = [new Bullet()];
let BMan = new BulletMan(player, ...monsters, ...walls, ...bullets);
let gameObjects = [...monsters, ...walls, player, ...bullets, ...keys,];

let currentTime = 0;

function gameLoop(timestamp) {
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	let elaspsedtime = timestamp - currentTime;
	currentTime = timestamp;
	gameObjects.forEach((o) => {
		o.update(elaspsedtime);
		o.render();
	});
	BMan.update(elaspsedtime);
	requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);
