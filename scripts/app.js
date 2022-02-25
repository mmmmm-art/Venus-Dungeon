//@ts-check
import { GameObject, Location } from "./game-objects/game-object.js";
import { canvas, ctx } from "./canvas.js";
import { level1, level2, level3 } from "./levels.js";
/** @type {HTMLCanvasElement} */
//@ts-ignore

class Player extends GameObject {
	/**
	 * @param {Game} game 
	 * @param {number} x 
	 * @param {number} y 
	 */
	constructor(game, x, y) {
		super(32, 32, x, y);
		this.game = game
		this.health = 1000;
		this.healthX = 200;
		this.isMovingUp = false;
		this.isMovingDown = false;
		this.isMovingRight = false;
		this.isMovingLeft = false;
		this.isSneaking = false;
		this.isRunning = false;
		this.shootR = false;
		this.shootL = false;
		this.shootD = false;
		this.shootU = false;
		this.shotType1 = true;
		this.shotType2 = false;
		this.shotType3 = false;
		this.shotType4 = false;
		this.shoot = false
		this.inventory = [];
		this.baseSpeed = 5;
		this.shot = false;
		this.boughtShot = false;
		this.boughtShot2 = false;
		this.boughtShot3 = false;

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

	/**
	 * @param {string} key
	 * @param {boolean} toggleValue
	 */
	toggleMovement(key, toggleValue) {
		switch (key) {
			case "w":
				this.isMovingUp = toggleValue;
				break;
			case "s":
				this.isMovingDown = toggleValue;
				break;
			case "d":
				this.isMovingRight = toggleValue;
				break;
			case "a":
				this.isMovingLeft = toggleValue;
				break;
			case "q":
				this.isSneaking = toggleValue;
				break;
			case "e":
				this.isRunning = toggleValue;
				break;
			case "ArrowRight":
				this.shootR = toggleValue;
				break
			case "ArrowLeft":
				this.shootL = toggleValue;
				break
			case "ArrowUp":
				this.shootU = toggleValue;
				break
			case "ArrowDown":
				this.shootD = toggleValue;
				break
			case "1":
				this.shotType1 = true;
				this.shotType2 = false;
				this.shotType3 = false;
				this.shotType4 = false;
				break
			case "2":
				if(this.boughtShot || this.game.money >= 10) 
				{
					this.boughtShot = true
					this.shotType1 = false;
					this.shotType2 = true;
					this.shotType3 = false;
					this.shotType4 = false;
				}
				break
			case " ":
				this.shoot = toggleValue
				break
			case "4":
				if(this.boughtShot3 || this.game.money >= 50) 
				{
					this.boughtShot3 = true
					this.shotType1 = false;
					this.shotType2 = false;
					this.shotType3 = true;
					this.shotType4 = false;
				}
				break
			case "3":
				if(this.boughtShot2 || this.game.money >= 25) 
				{
					this.boughtShot2 = true
					this.shotType1 = false;
					this.shotType2 = false;
					this.shotType3 = false;
					this.shotType4 = true;
				}
				break
		}
	}

	/**
	 * @param {any} elaspsedtime
	 */
	update(elaspsedtime) {
		let speedMultiplier = 1;

		if (this.health <= 0) {
			this.game.gameOver = true
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

		this.game.walls.forEach((w) => {
			if(w.isOpen) return
			let safeLocation = this.isColliding(w);
			if (w.isLocked && this.inventory.length && safeLocation) 
			{
				this.inventory.pop();
				w.isLocked = false;
				w.isOpen = true;
				return;
			}
	
			if (safeLocation) {
				this.x = safeLocation.x;
				this.y = safeLocation.y;
			}
		});

		this.game.gunBlocks.forEach((w) => {
			let safeLocation = this.isColliding(w);
	
			if (safeLocation) {
				this.x = safeLocation.x;
				this.y = safeLocation.y;
			}
		});


		this.game.keys.filter(k => !k.isPicked).forEach((k) => {
			if(this.isColliding(k)) {
				this.inventory.push(k);
				k.isPicked = true;
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
	 * @param {Game} game
	 * @param {Number} x
	 * @param {Number} y
	 */
	constructor(game, x, y) {
		super(32, 32, x, y);
		this.game = game
		this.baseSpeed = 2;
		this.image.src = `/images/monster.png`;
		this.senseDis = 150;
		this.isLastMoveCollide = false;
		this.isDead = false
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
		this.health = 10;
	}

	/**
	 * @param {number} elaspsedtime
	 */
	update(elaspsedtime) {
		if(this.isDead) return
		if(this.health < 0)
		{
			this.isDead = true
			this.game.blood.push(new Blood(this.x, this.y, 1, 1, Math.random() * 4, Math.random() * 4, Math.random() * 40 + 10, game))
			this.game.blood.push(new Blood(this.x, this.y, 1, 1, Math.random() * 4, Math.random() * 4, Math.random() * 40 + 10, game))
			this.game.blood.push(new Blood(this.x, this.y, 0, 1, Math.random() * 4, Math.random() * 4, Math.random() * 40 + 10, game))
			this.game.blood.push(new Blood(this.x, this.y, 1, 0, Math.random() * 4, Math.random() * 4, Math.random() * 40 + 10, game))
			this.game.blood.push(new Blood(this.x, this.y, -1, -1, Math.random() * 4, Math.random() * 4, Math.random() * 40 + 10, game))
			this.game.blood.push(new Blood(this.x, this.y, -1, -1, Math.random() * 4, Math.random() * 4, Math.random() * 40 + 10, game))
			this.game.blood.push(new Blood(this.x, this.y, 1, 1, Math.random() * 4, Math.random() * 4, Math.random() * 40 + 10, game))
			this.game.blood.push(new Blood(this.x, this.y, 1, 1, Math.random() * 4, Math.random() * 4, Math.random() * 40 + 10, game))
			this.game.blood.push(new Blood(this.x, this.y, 0, 1, Math.random() * 4, Math.random() * 4, Math.random() * 40 + 10, game))
			this.game.blood.push(new Blood(this.x, this.y, 1, 0, Math.random() * 4, Math.random() * 4, Math.random() * 40 + 10, game))
			this.game.blood.push(new Blood(this.x, this.y, 0, 1, Math.random() * 4, Math.random() * 4, Math.random() * 40 + 10, game))
			this.game.blood.push(new Blood(this.x, this.y, -1, 0, Math.random() * 4, Math.random() * 4, Math.random() * 40 + 10, game))
			this.x = 4000000;
			this.y = 4000000;
		}
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

		if (game.player.isSneaking) 
		{
			this.senseDis = 50;
		} 
		else if (game.player.isRunning)
		{
			this.senseDis = 200000000000
		}
		else 
		{
			this.senseDis = 150;
		}

		let insideX =
		game.player.x > this.x - this.senseDis &&
		game.player.x < this.x + this.senseDis;
		let insideY =
		game.player.y > this.y - this.senseDis &&
		game.player.y < this.y + this.senseDis;
		let isInside = insideX && insideY;


		if (
			game.player.x > this.x - this.senseDis &&
			game.player.x < this.x &&
			isInside
		) {
			this.movement.x.direction = -1;
			this.baseSpeed = 5;
		}
		if (
			game.player.x < this.x + this.senseDis &&
			game.player.x > this.x &&
			isInside
		) {
			this.movement.x.direction = 1;
			this.baseSpeed = 5;
		}
		if (
			game.player.y > this.y - this.senseDis &&
			game.player.y < this.y &&
			isInside
		) {
			this.movement.y.direction = -1;
			this.baseSpeed = 5;
		}
		if (
			game.player.y < this.y + this.senseDis &&
			game.player.y > this.y &&
			isInside
		) {
			this.movement.y.direction = 1;
			this.baseSpeed = 5;
		}

		this.x += this.movement.x.speed * this.movement.x.direction;
		this.y += this.movement.y.speed * this.movement.y.direction;

		this.isLastMoveCollide = false;
		this.game.walls.forEach((w) => {
			if(w.isOpen) return
			let safeLocation = this.isColliding(w);
			if (safeLocation) {
				this.isLastMoveCollide = true;
				this.x = safeLocation.x;
				this.y = safeLocation.y;
			}
		});
		

		if (this.game.player.isColliding(this))
		{
			game.player.health -= 5;
			game.player.healthX += 2.5;
		}

		super.update(elaspsedtime);
	}

	render() {
		if(this.isDead) return

		super.render();
	}
}

class Wall extends GameObject {
	/**
	 * @param {number} x
	 * @param {number} y
	 * @param {number} w
	 * @param {number} h
	 */
	constructor(x, y, w, h) {
		super(w, h, x, y);
		this.image.src = `/images/block.png`;
	}
}

class Game {
	/**
	 * @param {Array<EnemyBullet>} EBullets
	 * @param {Array<Bullet>} bullets
	 * @param {Array<Blood>} blood
	 * @param {Array<Bomb>} [bombs]
	 */
	constructor(EBullets, bullets, blood, bombs) {
		this.EBullets = EBullets
		this.bullets = bullets;
		this.bombs = bombs;
		this.blood = blood;
		this.player = undefined;
		this.walls = [];
		this.monsters = [];
		this.keys = [];
		this.gold = [];
		this.gunBlocks = [];
		this.bosses = [];
		this.goal = undefined;
		this.gameOver = false;
		this.isLevelComp = false;
		this.levels = [level1, level2, level3];
		this.currentLevel = 0;
		this.money = 5000;
		this.gameObjects = [];

	}
	start() {
		this.loadLevel();
		requestAnimationFrame(gameLoop)
	}
	nextLevel() {
		this.currentLevel ++;
		this.player = undefined;
		this.walls = [];
		this.monsters = [];
		this.keys = [];
		this.gold = [];
		this.gunBlocks = [];
		this.bosses = [];
		this.goal = undefined;
		this.gameObjects = [];
		this.isLevelComp = false;
		this.loadLevel();
	}
	loadLevel() {

		let level = this.levels[this.currentLevel]
		let monsterCoords = [];
		let playerCoords = { x: 0, y: 0 };
		let goalCoords = { x: 0, y: 0 };
		
		level.forEach((row, idx) => {
			for (let col = 0; col < row.length; col++) {
				let x = col * 16;
				let y = idx * 16;
				switch (row[col]) {
					case "w":
						this.walls.push(new Wall(x, y, 16, 16));
						break;
					case "m":
						monsterCoords.push({ x: x, y: y });
						break;
					case "p":
						playerCoords = { x: x, y: y };
						break;
					case "k":
						this.keys.push(new Key(x, y));
						break;
					case "d":
						this.walls.push(new Door(x, y, true));
						break
					case "D":
						this.walls.push(new Door(x, y, false));
						break
					case "X":
						goalCoords = { x: x, y: y };
						break
					case "B":
						this.bosses.push(new Boss(x, y, this, true));
						break
					case "b":
						this.bosses.push(new Boss(x, y, this, false));
						break
					case "g":
						this.gold.push(new Gold(x, y, game))
						break
					case "G":
						this.gunBlocks.push(new GunBlock(x, y))
						break

				}
			}
		});

		this.player = new Player(this, playerCoords.x, playerCoords.y);
		this.goal = new Goal(goalCoords.x, goalCoords.y, this);
		monsterCoords.forEach((c) => {
			this.monsters.push(new Monster(this, c.x, c.y));
		});

		this.gameObjects = [
			...this.monsters,
			...this.walls,		
			...this.bullets, 
			...this.EBullets,
			...this.bombs,
			this.player,
			...this.keys, 
			...this.bosses,
			this.goal, 
			...this.gold,
			...this.gunBlocks,
			...this.blood
			];
	}

	render() {
		ctx.save();
		ctx.fillStyle = `hsla(50, 100%, 45%, 1)`;
		ctx.strokeStyle = `hsla(60, 100%, 25%, 1)`;
		ctx.font = "90px karma";
		ctx.fillText(`Gold:${this.money}`, 0, canvas.height);
		ctx.strokeText(`Gold:${this.money}`, 0, canvas.height);
		ctx.restore();
	}


}

class Key extends GameObject {
	/**
	 * @param {number} x
	 * @param {number} y
	 */
	constructor(x, y) {
		super(16, 10, x, y);
		this.isPicked = false;
		this.image.src = `/images/key.png`;
	}

	render() {
		if(this.isPicked)
		{
			return
		}
		super.render();
	}


}

class Door extends GameObject {
	/**
	 * @param {number} x
	 * @param {number} y
	 * @param {boolean} isVertical
	 */
	constructor(x, y, isVertical) {
		let width = isVertical ? 16 : 48;
		let height = isVertical ? 48 : 16;
		let addX = isVertical ? x : x - 16;
		let addY = isVertical ? y - 16 : y;
		super(width, height, addX, addY);
		this.image.src = `/images/door.png`;
		this.isOpen = false;
		this.isLocked = true;
	}

	render() {
		if(this.isOpen) return
		super.render()
	}
}

class Bullet extends GameObject {
	/**
	 * @param {number} xd
	 * @param {number} yd
	 * @param {Game} game
	 * @param {number} dd
	 * @param {number} sy
	 * @param {number} sx
	 * @param {number} x
	 * @param {number} y
	 */
	constructor(xd, yd, dd, sy, sx, game, x, y) {
		super(10, 10, x, y);
		this.originalX = x;
		this.originalY = y;
		this.image.src = `/images/goodBullet.png`;
		this.game = game;
		this.movement = {
			x: {
				direction: xd,
				speed: sx,
			},
		 	y: {
				direction: yd,
		 		speed: sy,
			},
		};
		this.dead = false;
		this.distance = dd
	}

	update(elaspsedtime) {
		if(this.dead) return
		this.x += this.movement.x.speed * this.movement.x.direction;
		this.y += this.movement.y.speed * this.movement.y.direction;
		if(this.x > this.originalX + this.distance)
		{
			this.dead = true;
		}
		if(this.x < this.originalX - this.distance)
		{
			this.dead = true;
		}
		if(this.y > this.originalY + this.distance)
		{
			this.dead = true;
		}
		if(this.y < this.originalY - this.distance)
		{
			this.dead = true;
		}

		this.game.walls.forEach((w) => {
			if(w.isOpen) return
			let gotHit = this.isColliding(w);
			if (gotHit) {
				this.dead = true;
			}
		});

		this.game.monsters.forEach((m) => {
			let gotHit = this.isColliding(m);
			if (gotHit) {
				m.health -= 3;
				this.dead = true;
			}
		});
	


	}

	render() {
		if(this.dead) return

		super.render();
	}
}

class EnemyBullet extends GameObject {
	 /**
	 * @param {number} xd
	 * @param {number} yd
	 * @param {Game} game
	 * @param {number} dd
	 * @param {number} x
	 * @param {number} y
	 * @param {number} d1
	 * @param {number} d2
	 * @param {number} sx
	 * @param {number} sy
	 */
	 constructor(x, y, xd, yd, dd, game, d1, d2, sx, sy) {
		super(10, 10, x, y);
		this.originalX =  x;
		this.originalY =  y;
		this.d1 = d1;
		this.d2 = d2;
		this.image.src = `/images/badBullet.png`;
		this.game = game;
		this.movement = {
			x: {
				direction: xd,
				speed: sx,
			},
		 	y: {
				direction: yd,
		 		speed: sy,
			},
		};
		this.dead = false;
		this.distance = dd;
		this.isBad = true
	}

	/**
	 * @param {any} elaspsedtime
	 */
	update(elaspsedtime) {
		if(this.dead) return
		this.x += this.movement.x.speed * this.movement.x.direction;
		this.y += this.movement.y.speed * this.movement.y.direction;
		if(this.x > this.originalX + this.distance)
		{
			this.dead = true;
		}
		if(this.x < this.originalX - this.distance)
		{
			this.dead = true;
		}
		if(this.y > this.originalY + this.distance)
		{
			this.dead = true;
		}
		if(this.y < this.originalY - this.distance)
		{
			this.dead = true;
		}

		this.game.walls.forEach((w) => {
			if(w.isOpen) return
			let gotHit = this.isColliding(w);
			if (gotHit) {
				this.dead = true;
			}
		});

		if(this.game.player.isColliding(this))
		{
			game.player.health -= this.d1;
			game.player.healthX += this.d2;
		}
	}

	render() {
		if(this.dead) return

		super.render();
	}

	
}

class BulletMan {
	
	/**
	 * @param {Game} game
	 * @param {Array<Bullet>} bullets
	 * @param {Array<EnemyBullet>} EBullets
	 * @param {Array<GunBlock>} gunBlocks
	 * @param {Array<Bomb>} bombs
	 */
	constructor(game, bullets, EBullets, gunBlocks, bombs) {
		this.game = game
		this.bombs = bombs;
		this.gunBlocks = gunBlocks
		this.EBullets = EBullets;
		this.bullets = bullets;
		this.lastShot = 0;
	}

	/**
	 * @param {number} elaspsedtime
	 */
	update(elaspsedtime) {
		let time2Shoot1 = this.lastShot >= 0.2;
		let time2Shoot2 = this.lastShot >= 0.7;
		let time2Shoot3 = this.lastShot >= 0;
		let time2Shoot4 = this.lastShot > 0.7;
		let shot = this.game.player.shootR || this.game.player.shootL || this.game.player.shootU || this.game.player.shootD;
		this.lastShot += elaspsedtime / 1000;
		if(this.game.player.shootR && this.game.player.shotType1 && time2Shoot1)
		{
			this.bullets.push(new Bullet(1, 0, 300, 6, 6, this.game, game.player.x + game.player.width / 3, game.player.y + game.player.width / 3));
			this.lastShot = 0;
		}
		else if(this.game.player.shootL && this.game.player.shotType1 && time2Shoot1)
		{
			this.bullets.push(new Bullet(-1, 0, 300, 6, 6, this.game, game.player.x + game.player.width / 3, game.player.y + game.player.width / 3));
			this.lastShot = 0;
		}
		else if(this.game.player.shootU && this.game.player.shotType1 && time2Shoot1)
		{
			this.bullets.push(new Bullet(0, -1, 300, 6, 6, this.game, game.player.x + game.player.width / 3, game.player.y + game.player.width / 3));
			this.lastShot = 0;
		}
		else if(this.game.player.shootD && this.game.player.shotType1 && time2Shoot1)
		{
			this.bullets.push(new Bullet(0, 1, 300, 6, 6, this.game, game.player.x + game.player.width / 3, game.player.y + game.player.width / 3));
			this.lastShot = 0;
		}

		if(this.game.player.shootR && this.game.player.shotType4 && time2Shoot4)
		{
			this.bombs.push(new Bomb(1, 0, 300, game, bullets));
			this.lastShot = 0;
		}
		else if(this.game.player.shootL && this.game.player.shotType4 && time2Shoot4)
		{
			this.bombs.push(new Bomb(-1, 0, 300, game, bullets));
			this.lastShot = 0;
		}
		else if(this.game.player.shootU && this.game.player.shotType4 && time2Shoot4)
		{
			this.bombs.push(new Bomb(0, -1, 300, game, bullets));
			this.lastShot = 0;
		}
		else if(this.game.player.shootD && this.game.player.shotType4 && time2Shoot4)
		{
			this.bombs.push(new Bomb(0, 1, 300, game, bullets));
			this.lastShot = 0;
		}

		if(this.game.player.shootR && this.game.player.shotType2 && time2Shoot2)
		{
			this.bullets.push(new Bullet(1, 0, 150, 6, 6, this.game, game.player.x + game.player.width / 3, game.player.y + game.player.width / 3));
			this.bullets.push(new Bullet(1, -1, 150, 6, 6, this.game, game.player.x + game.player.width / 3, game.player.y + game.player.width / 3));
			this.bullets.push(new Bullet(1, 1, 150, 6, 6, this.game, game.player.x + game.player.width / 3, game.player.y + game.player.width / 3));
			this.lastShot = 0;
		}
		else if(this.game.player.shootL && this.game.player.shotType2 && time2Shoot2)
		{
			this.bullets.push(new Bullet(-1, 0, 150, 6, 6, this.game, game.player.x + game.player.width / 3, game.player.y + game.player.width / 3));
			this.bullets.push(new Bullet(-1, -1, 150, 6, 6, this.game, game.player.x + game.player.width / 3, game.player.y + game.player.width / 3));
			this.bullets.push(new Bullet(-1, 1, 150, 6, 6, this.game, game.player.x + game.player.width / 3, game.player.y + game.player.width / 3));
			this.lastShot = 0;
		}
		else if(this.game.player.shootU && this.game.player.shotType2 && time2Shoot2)
		{
			this.bullets.push(new Bullet(-1, -1, 150, 6, 6, this.game, game.player.x + game.player.width / 3, game.player.y + game.player.width / 3));
			this.bullets.push(new Bullet(0, -1, 150, 6, 6, this.game, game.player.x + game.player.width / 3, game.player.y + game.player.width / 3));
			this.bullets.push(new Bullet(1, -1, 150, 6, 6, this.game, game.player.x + game.player.width / 3, game.player.y + game.player.width / 3));
			this.lastShot = 0;
		}
		else if(this.game.player.shootD && this.game.player.shotType2 && time2Shoot2)
		{
			this.bullets.push(new Bullet(-1, 1, 150, 6, 6, this.game, game.player.x + game.player.width / 3, game.player.y + game.player.width / 3));
			this.bullets.push(new Bullet(0, 1, 150, 6, 6, this.game, game.player.x + game.player.width / 3, game.player.y + game.player.width / 3));
			this.bullets.push(new Bullet(1, 1, 150, 6, 6, this.game, game.player.x + game.player.width / 3, game.player.y + game.player.width / 3));
			this.lastShot = 0;
		}

		if(shot && game.player.shotType3 && time2Shoot3)
		{
			this.bullets.push(new Bullet(-1, -1, 200, 6, 6, this.game, game.player.x + game.player.width / 3, game.player.y + game.player.width / 3));
			this.bullets.push(new Bullet(1, 1, 200, 6, 6, this.game, game.player.x + game.player.width / 3, game.player.y + game.player.width / 3));
			this.bullets.push(new Bullet(1, 0, 200, 6, 6, this.game, game.player.x + game.player.width / 3, game.player.y + game.player.width / 3));
			this.bullets.push(new Bullet(0, 1, 200, 6, 6, this.game, game.player.x + game.player.width / 3, game.player.y + game.player.width / 3));
			this.bullets.push(new Bullet(-1, 0, 200, 6, 6, this.game, game.player.x + game.player.width / 3, game.player.y + game.player.width / 3));
			this.bullets.push(new Bullet(0, -1, 200, 6, 6, this.game, game.player.x + game.player.width / 3, game.player.y + game.player.width / 3));
			this.bullets.push(new Bullet(-1, 1, 200, 6, 6, this.game, game.player.x + game.player.width / 3, game.player.y + game.player.width / 3));
			this.bullets.push(new Bullet(1, -1, 200, 6, 6, this.game, game.player.x + game.player.width / 3, game.player.y + game.player.width / 3));
			this.bullets.push(new Bullet(-1, -1, 200, 12, 6, this.game, game.player.x + game.player.width / 3, game.player.y + game.player.width / 3));
			this.bullets.push(new Bullet(-1, 1, 200, 6, 12, this.game, game.player.x + game.player.width / 3, game.player.y + game.player.width / 3));
			this.bullets.push(new Bullet(1, -1, 200, 12, 6, this.game, game.player.x + game.player.width / 3, game.player.y + game.player.width / 3));
			this.bullets.push(new Bullet(1, 1, 200, 6, 12, this.game, game.player.x + game.player.width / 3, game.player.y + game.player.width / 3));
			this.bullets.push(new Bullet(-1, -1, 200, 3, 6, this.game, game.player.x + game.player.width / 3, game.player.y + game.player.width / 3));
			this.bullets.push(new Bullet(-1, 1, 200, 6, 3, this.game, game.player.x + game.player.width / 3, game.player.y + game.player.width / 3));
			this.bullets.push(new Bullet(1, -1, 200, 3, 6, this.game, game.player.x + game.player.width / 3, game.player.y + game.player.width / 3));
			this.bullets.push(new Bullet(1, 1, 200, 6, 3, this.game, game.player.x + game.player.width / 3, game.player.y + game.player.width / 3));
		}

		if(game.player.shoot && !game.player.shot)
		{
			this.bombs.push(new Bomb(1, 1, 300, game, bullets));
			this.bombs.push(new Bomb(1, -1, 300, game, bullets));
			this.bombs.push(new Bomb(-1, 1, 300, game, bullets));
			this.bombs.push(new Bomb(-1, -1, 300, game, bullets));
			this.bombs.push(new Bomb(0, 1, 300, game, bullets));
			this.bombs.push(new Bomb(0, -1, 300, game, bullets));
			this.bombs.push(new Bomb(-1, 0, 300, game, bullets));
			this.bombs.push(new Bomb(1, 0, 300, game, bullets));
			game.player.shot = true;
		}

		this.game.bosses.forEach((b) => {
			if(!b.isDead && !b.isBigBoi) {
				this.EBullets.push(new EnemyBullet(b.x + b.width / 3, b.y + b.height / 3, -1, -1, 150, this.game, 0.3125, 0.15625, 2, 2));
				this.EBullets.push(new EnemyBullet(b.x + b.width / 3, b.y + b.height / 3, 1, 1, 150, this.game, 0.3125, 0.15625, 2, 2));
				this.EBullets.push(new EnemyBullet(b.x + b.width / 3, b.y + b.height / 3, 1, 0, 150, this.game, 0.3125, 0.15625, 2, 2));
				this.EBullets.push(new EnemyBullet(b.x + b.width / 3, b.y + b.height / 3, 0, 1, 150, this.game, 0.3125, 0.15625, 2, 2));
				this.EBullets.push(new EnemyBullet(b.x + b.width / 3, b.y + b.height / 3, -1, 0, 150, this.game, 0.3125, 0.15625, 2, 2));
				this.EBullets.push(new EnemyBullet(b.x + b.width / 3, b.y + b.height / 3, 0, -1, 150, this.game, 0.3125, 0.15625, 2, 2));
				this.EBullets.push(new EnemyBullet(b.x + b.width / 3, b.y + b.height / 3, -1, 1, 150, this.game, 0.3125, 0.15625, 2, 2));
				this.EBullets.push(new EnemyBullet(b.x + b.width / 3, b.y + b.height / 3, 1, -1, 150, this.game, 0.3125, 0.15625, 2, 2));
			}
			else if (!b.isDead && b.isBigBoi)
			{
				this.EBullets.push(new EnemyBullet(b.x + b.width / 3, b.y + b.height / 3, -1, -1, 150, this.game, 0.3125, 0.15625, 2, 2));
				this.EBullets.push(new EnemyBullet(b.x + b.width / 3, b.y + b.height / 3, 1, 1, 150, this.game, 0.3125, 0.15625, 2, 2));
				this.EBullets.push(new EnemyBullet(b.x + b.width / 3, b.y + b.height / 3, 1, 0, 150, this.game, 0.3125, 0.15625, 2, 2));
				this.EBullets.push(new EnemyBullet(b.x + b.width / 3, b.y + b.height / 3, 0, 1, 150, this.game, 0.3125, 0.15625, 2, 2));
				this.EBullets.push(new EnemyBullet(b.x + b.width / 3, b.y + b.height / 3, -1, 0, 150, this.game, 0.3125, 0.15625, 2, 2));
				this.EBullets.push(new EnemyBullet(b.x + b.width / 3, b.y + b.height / 3, 0, -1, 150, this.game, 0.3125, 0.15625, 2, 2));
				this.EBullets.push(new EnemyBullet(b.x + b.width / 3, b.y + b.height / 3, -1, 1, 150, this.game, 0.3125, 0.15625, 2, 2));
				this.EBullets.push(new EnemyBullet(b.x + b.width / 3, b.y + b.height / 3, 1, -1, 150, this.game, 0.3125, 0.15625, 2, 2));
				this.EBullets.push(new EnemyBullet(b.x + b.width / 3, b.y + b.height / 3, -1, -1, 150, this.game, 0.3125, 0.15625, 4, 2));
				this.EBullets.push(new EnemyBullet(b.x + b.width / 3, b.y + b.height / 3, 1, 1, 150, this.game, 0.3125, 0.15625, 2, 4));
				this.EBullets.push(new EnemyBullet(b.x + b.width / 3, b.y + b.height / 3, -1, 1, 150, this.game, 0.3125, 0.15625, 4, 2));
				this.EBullets.push(new EnemyBullet(b.x + b.width / 3, b.y + b.height / 3, 1, -1, 150, this.game, 0.3125, 0.15625, 2, 4));
				this.EBullets.push(new EnemyBullet(b.x + b.width / 3, b.y + b.height / 3, -1, -1, 150, this.game, 0.3125, 0.15625, 1, 2));
				this.EBullets.push(new EnemyBullet(b.x + b.width / 3, b.y + b.height / 3, 1, 1, 150, this.game, 0.3125, 0.15625, 2, 1));
				this.EBullets.push(new EnemyBullet(b.x + b.width / 3, b.y + b.height / 3, -1, 1, 150, this.game, 0.3125, 0.15625, 1, 2));
				this.EBullets.push(new EnemyBullet(b.x + b.width / 3, b.y + b.height / 3, 1, -1, 150, this.game, 0.3125, 0.15625, 2, 1));
			}
		})

		this.game.gunBlocks.forEach((g) => {
			let d2 = 0.15625 * 100
			let d1 = 0.3125 * 100
			if(time2Shoot2)
			{
			this.EBullets.push(new EnemyBullet(g.x + g.width / 3, g.y + g.height / 3, 1, 0, 150, this.game, d1, d2, 6, 6));
			this.EBullets.push(new EnemyBullet(g.x + g.width / 3, g.y + g.height / 3, 0, 1, 150, this.game, d1, d2, 6, 6));
			this.EBullets.push(new EnemyBullet(g.x + g.width / 3, g.y + g.height / 3, -1, 0, 150, this.game, d1, d2, 6, 6));
			this.EBullets.push(new EnemyBullet(g.x + g.width / 3, g.y + g.height / 3, 0, -1, 150, this.game, d1, d2, 6, 6));
			this.lastShot = 0;
			}
		})

		
	}
}

class Boss extends GameObject {
	/**
	 * @param {number} x
	 * @param {number} y
	 * @param {Game} game
	 * @param {Boolean} [isb]
	 */
	constructor(x, y, game, isb) {
		super(32, 32, x, y)
		this.game = game
		this.baseSpeed = 3;
		this.image.src = `/images/boss.png`;
		this.senseDis = 150;
		this.isLastMoveCollide = false;
		this.isDead = false
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
		this.health = 250;
		this.isBigBoi = isb;
	}

	/**
	 * @param {number} elaspsedtime
	 */
	update(elaspsedtime) {
		if(this.isDead) return
		this.movement.timeSinceLastUpdate += elaspsedtime;
		if (this.movement.timeSinceLastUpdate >= this.movement.timeToNextUpdate || this.isLastMoveCollide) 
		{
			this.movement.x.direction = Math.random() >= 0.5 ? 1 : -1;
			this.movement.y.direction = Math.random() >= 0.5 ? 1 : -1;
			this.movement.x.speed = Math.random() * this.baseSpeed;
			this.movement.y.speed = Math.random() * this.baseSpeed;
			this.movement.timeToNextUpdate = Math.random() * 500 + 250;
			this.movement.timeSinceLastUpdate = 0;
		}

		this.x += this.movement.x.speed * this.movement.x.direction;
		this.y += this.movement.y.speed * this.movement.y.direction;

		this.isLastMoveCollide = false;
		this.game.walls.forEach((w) => {
			if(w.isOpen) return
			let safeLocation = this.isColliding(w);
			if (safeLocation) {
				this.isLastMoveCollide = true;
				this.x = safeLocation.x;
				this.y = safeLocation.y;
			}
		});

		this.game.bullets.forEach((b) => {
			let gotHit = this.isColliding(b)

			if(gotHit)
			{
				this.health -= 3
			}
		});

		if (this.health < 0)
		{
			this.isDead = true;
		}


		super.update(elaspsedtime);
	}

	render() {
		if(this.isDead) return

		super.render();
	}
}

class Goal extends GameObject {
	/**
	 * @param {number} x
	 * @param {number} y
	 * @param {Game} game
	 */
	constructor(x, y, game) {
		super(32, 32, x, y)
		this.game = game
		this.image.src = `/images/goal.png`;
	}

	update(elaspsedtime) {
		if (this.game.player.isColliding(this))
		{
			this.game.player.shot = false;
			this.game.isLevelComp = true;
		}
	}
}

class GunBlock extends GameObject {
	/**
	 * @param {number} x
	 * @param {number} y
	 */
	constructor(x, y) {
		super(32, 32, x, y);

	}
}

class Gold extends GameObject {
	/**
	 * @param {number} x
	 * @param {number} y
	 * @param {Game} [game]
	 */
	constructor(x, y, game) {
		super(16, 16, x, y)
		this.game = game
		this.got = false
		this.image.src = `/images/gold.png`;

	}

	update(elaspsedtime) {
		if(this.got) return

		if(game.player.isColliding(this))
		{
			this.game.money += 1;
			this.got = true
		}
	}

	render() {
		if(this.got) return

		super.render();
	}
}

class Bomb extends GameObject {
	/**
	 * @param {number} xd
	 * @param {number} yd
	 * @param {number} dd
	 * @param {Game} game
	 * @param {Array<Bullet>} bullets
	 */
	constructor(xd, yd, dd, game, bullets) {
		super(16, 16, game.player.x + game.player.width / 3, game.player.y + game.player.width / 3)
		this.originalX =  game.player.x + game.player.width / 3;
		this.originalY =  game.player.y + game.player.height / 3;
		this.bullets = bullets
		this.image.src = `/images/bomb.png`;
		this.game = game;
		this.movement = {
			x: {
				direction: xd,
				speed: 6,
			},
		 	y: {
				direction: yd,
		 		speed: 6,
			},
		};
		this.dead = false;
		this.distance = dd
	}

	update(elaspsedtime) {
		if(this.dead) return
		this.x += this.movement.x.speed * this.movement.x.direction;
		this.y += this.movement.y.speed * this.movement.y.direction;
		if(this.x > this.originalX + this.distance)
		{
			this.dead = true;
			this.bullets.push(new Bullet(-1, -1, 200, 6, 6, this.game, this.x + this.width / 3, this.y + this.width / 3));
			this.bullets.push(new Bullet(1, 1, 200, 6, 6, this.game, this.x + this.width / 3, this.y + this.width / 3));
			this.bullets.push(new Bullet(1, 0, 200, 6, 6, this.game, this.x + this.width / 3, this.y + this.width / 3));
			this.bullets.push(new Bullet(0, 1, 200, 6, 6, this.game, this.x + this.width / 3, this.y + this.width / 3));
			this.bullets.push(new Bullet(-1, 0, 200, 6, 6, this.game, this.x + this.width / 3, this.y + this.width / 3));
			this.bullets.push(new Bullet(0, -1, 200, 6, 6, this.game, this.x + this.width / 3, this.y + this.width / 3));
			this.bullets.push(new Bullet(-1, 1, 200, 6, 6, this.game, this.x + this.width / 3, this.y + this.width / 3));
			this.bullets.push(new Bullet(1, -1, 200, 6, 6, this.game, this.x + this.width / 3, this.y + this.width / 3));
		}
		if(this.x < this.originalX - this.distance)
		{
			this.dead = true;
			this.bullets.push(new Bullet(-1, -1, 200, 6, 6, this.game, this.x + this.width / 3, this.y + this.width / 3));
			this.bullets.push(new Bullet(1, 1, 200, 6, 6, this.game, this.x + this.width / 3, this.y + this.width / 3));
			this.bullets.push(new Bullet(1, 0, 200, 6, 6, this.game, this.x + this.width / 3, this.y + this.width / 3));
			this.bullets.push(new Bullet(0, 1, 200, 6, 6, this.game, this.x + this.width / 3, this.y + this.width / 3));
			this.bullets.push(new Bullet(-1, 0, 200, 6, 6, this.game, this.x + this.width / 3, this.y + this.width / 3));
			this.bullets.push(new Bullet(0, -1, 200, 6, 6, this.game, this.x + this.width / 3, this.y + this.width / 3));
			this.bullets.push(new Bullet(-1, 1, 200, 6, 6, this.game, this.x + this.width / 3, this.y + this.width / 3));
			this.bullets.push(new Bullet(1, -1, 200, 6, 6, this.game, this.x + this.width / 3, this.y + this.width / 3));
		}
		if(this.y > this.originalY + this.distance)
		{
			this.dead = true;
			this.bullets.push(new Bullet(-1, -1, 200, 6, 6, this.game, this.x + this.width / 3, this.y + this.width / 3));
			this.bullets.push(new Bullet(1, 1, 200, 6, 6, this.game, this.x + this.width / 3, this.y + this.width / 3));
			this.bullets.push(new Bullet(1, 0, 200, 6, 6, this.game, this.x + this.width / 3, this.y + this.width / 3));
			this.bullets.push(new Bullet(0, 1, 200, 6, 6, this.game, this.x + this.width / 3, this.y + this.width / 3));
			this.bullets.push(new Bullet(-1, 0, 200, 6, 6, this.game, this.x + this.width / 3, this.y + this.width / 3));
			this.bullets.push(new Bullet(0, -1, 200, 6, 6, this.game, this.x + this.width / 3, this.y + this.width / 3));
			this.bullets.push(new Bullet(-1, 1, 200, 6, 6, this.game, this.x + this.width / 3, this.y + this.width / 3));
			this.bullets.push(new Bullet(1, -1, 200, 6, 6, this.game, this.x + this.width / 3, this.y + this.width / 3));
		}
		if(this.y < this.originalY - this.distance)
		{
			this.dead = true;
			this.bullets.push(new Bullet(-1, -1, 200, 6, 6, this.game, this.x + this.width / 3, this.y + this.width / 3));
			this.bullets.push(new Bullet(1, 1, 200, 6, 6, this.game, this.x + this.width / 3, this.y + this.width / 3));
			this.bullets.push(new Bullet(1, 0, 200, 6, 6, this.game, this.x + this.width / 3, this.y + this.width / 3));
			this.bullets.push(new Bullet(0, 1, 200, 6, 6, this.game, this.x + this.width / 3, this.y + this.width / 3));
			this.bullets.push(new Bullet(-1, 0, 200, 6, 6, this.game, this.x + this.width / 3, this.y + this.width / 3));
			this.bullets.push(new Bullet(0, -1, 200, 6, 6, this.game, this.x + this.width / 3, this.y + this.width / 3));
			this.bullets.push(new Bullet(-1, 1, 200, 6, 6, this.game, this.x + this.width / 3, this.y + this.width / 3));
			this.bullets.push(new Bullet(1, -1, 200, 6, 6, this.game, this.x + this.width / 3, this.y + this.width / 3));
		}

		this.game.walls.forEach((w) => {
			if(w.isOpen) return
			let gotHit = this.isColliding(w);
			if (gotHit) {
				this.dead = true;
				this.bullets.push(new Bullet(-1, -1, 200, 6, 6, this.game, this.x + this.width / 3, this.y + this.width / 3));
				this.bullets.push(new Bullet(1, 1, 200, 6, 6, this.game, this.x + this.width / 3, this.y + this.width / 3));
				this.bullets.push(new Bullet(1, 0, 200, 6, 6, this.game, this.x + this.width / 3, this.y + this.width / 3));
				this.bullets.push(new Bullet(0, 1, 200, 6, 6, this.game, this.x + this.width / 3, this.y + this.width / 3));
				this.bullets.push(new Bullet(-1, 0, 200, 6, 6, this.game, this.x + this.width / 3, this.y + this.width / 3));
				this.bullets.push(new Bullet(0, -1, 200, 6, 6, this.game, this.x + this.width / 3, this.y + this.width / 3));
				this.bullets.push(new Bullet(-1, 1, 200, 6, 6, this.game, this.x + this.width / 3, this.y + this.width / 3));
				this.bullets.push(new Bullet(1, -1, 200, 6, 6, this.game, this.x + this.width / 3, this.y + this.width / 3));
			}
		});

		this.game.monsters.forEach((m) => {
			let gotHit = this.isColliding(m);
			if (gotHit) {
				m.health -= 3;
				this.dead = true;
				this.bullets.push(new Bullet(-1, -1, 200, 6, 6, this.game, this.x + this.width / 3, this.y + this.width / 3));
				this.bullets.push(new Bullet(1, 1, 200, 6, 6, this.game, this.x + this.width / 3, this.y + this.width / 3));
				this.bullets.push(new Bullet(1, 0, 200, 6, 6, this.game, this.x + this.width / 3, this.y + this.width / 3));
				this.bullets.push(new Bullet(0, 1, 200, 6, 6, this.game, this.x + this.width / 3, this.y + this.width / 3));
				this.bullets.push(new Bullet(-1, 0, 200, 6, 6, this.game, this.x + this.width / 3, this.y + this.width / 3));
				this.bullets.push(new Bullet(0, -1, 200, 6, 6, this.game, this.x + this.width / 3, this.y + this.width / 3));
				this.bullets.push(new Bullet(-1, 1, 200, 6, 6, this.game, this.x + this.width / 3, this.y + this.width / 3));
				this.bullets.push(new Bullet(1, -1, 200, 6, 6, this.game, this.x + this.width / 3, this.y + this.width / 3));
			}
		});
	


	}

	render() {
		if(this.dead) return

		super.render();
	}
}

class Blood extends GameObject {
	/**
	 * @param {number} x
	 * @param {number} y
	 * @param {number} xd
	 * @param {number} yd
	 * @param {number} xs
	 * @param {number} ys
	 * @param {number} dd
	 * @param {Game} game
	 */
	constructor(x, y, xd, yd, xs, ys, dd, game) {
		super(10, 10, x, y)
		this.originalX =  x
		this.originalY =  y
		this.image.src = `/images/blood.png`;
		this.game = game;
		this.movement = {
			x: {
				direction: xd,
				speed: xs,
			},
		 	y: {
				direction: yd,
		 		speed: ys,
			},
		};
		this.dead = false;
		this.distance = dd
	}

	update(elaspsedtime) {
		if(this.dead) return
		this.x += this.movement.x.speed * this.movement.x.direction;
		this.y += this.movement.y.speed * this.movement.y.direction;

		if(this.x > this.originalX + this.distance)
		{
			this.dead = true;
		}
		if(this.x < this.originalX - this.distance)
		{
			this.dead = true;
		}
		if(this.y > this.originalY + this.distance)
		{
			this.dead = true;
		}
		if(this.y < this.originalY - this.distance)
		{
			this.dead = true;
		}

	}

	render() {
		if(this.dead) return

		super.render();
	}
}

let blood = [];
let bullets = [];
let EBullets = [];
let bombs = [];
let game = new Game(EBullets, bullets, blood, bombs);
game.start();
let BMan = new BulletMan(game, bullets, EBullets, game.gunBlocks, bombs);


let currentTime = 0;
/**
 * @param {number} timestamp
 */
function gameLoop(timestamp) {
	if(game.gameOver) return
	if(game.isLevelComp) {
		game.nextLevel();
	}
	
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	let elaspsedtime = timestamp - currentTime;
	currentTime = timestamp;
	console.log(currentTime/1000);
	game.gameObjects.forEach((o) => {
		o.update(elaspsedtime);
		o.render();
	});
	game.gameObjects = [
		...game.monsters,
		...game.walls,		
		...game.bullets, 
		...game.EBullets,
		...game.bombs,
		game.player,
		...game.keys, 
		...game.bosses,
		game.goal, 
		...game.gold,
		...game.gunBlocks,
		...game.blood
		];
	BMan.update(elaspsedtime);
	game.render();
	if(!game.gameOver) requestAnimationFrame(gameLoop);
}
