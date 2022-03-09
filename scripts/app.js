//@ts-check
import { GameObject, Location } from "./game-objects/game-object.js";
import { canvas, ctx } from "./canvas.js";
import { level1,level2, level3, level4, level5, level6, level7} from "./levels.js";
import { StartScene } from "./scenes/start.js";
import { GameOverScene } from "./scenes/game-over.js";
import { GameWonScene } from "./scenes/game-won.js";
import { AudioPlayer } from "./audio.js";
/** @type {HTMLCanvasElement} */
//@ts-ignore

export class Game {
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
		this.flasks = [];
		this.gunBlocks = [];
		this.bosses = [];
		this.lastShot = 0;
		this.goal = undefined;
		this.gameOver = false;
		this.isLevelComp = false;
		this.isLevelBack = false;
		this.levels = [level1,level2, level3, level4, level5, level6, level7];
		this.currentLevel = 0;
		this.money = 0;
		this.gameObjects = [];
		this.traps = [];
		this.musicDisk = new AudioPlayer

	}

	init() {
        let begin = new StartScene(this);
        this.gameObjects = [begin];
        requestAnimationFrame(gameLoop);
    }
	reset() {
		this.EBullets = EBullets
		this.bullets = bullets;
		this.bombs = bombs;
		this.blood = blood;
		this.walls = [];
		this.monsters = [];
		this.keys = [];
		this.gold = [];
		this.gunBlocks = [];
		this.bosses = [];
		this.flasks = [];
		this.goal = undefined;
		this.goalB = undefined;
		this.gameObjects = [];
		this.isLevelComp = false;
		this.isLevelBack = false;
		this.traps = [];
		this.player = undefined;
	}
	GameOver() {
		this.gameOver = true;
		let no = new GameOverScene(this);
		this.gameObjects = [no];
	}
	GameWon() {
		this.gameOver = true;
		let won = new GameWonScene(this)
		this.gameObjects = [won];
	}
	Start() {
        this.musicDisk.init();
        this.reset();
        this.loadLevel();
    }
	nextLevel() {
		this.currentLevel ++;
		this.reset();
		if(this.currentLevel < this.levels.length) {
			this.loadLevel();
		}
		else {
			this.musicDisk.teleport();
			this.GameWon();
		}
		
	}
	lastLevel() {
		this.currentLevel -= 1;
		this.reset();
		this.loadLevel();
	}
	loadLevel() {
		if(!this.levels) return
		let level = this.levels[this.currentLevel]
		let monsterCoords = [];
		let playerCoords = { x: 0, y: 0 };
		let goalCoords = { x: 0, y: 0 };
		let goalBCoords = { x: -100, y: -100 };
		
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
					case "x":
						goalBCoords = { x: x, y: y };
						break
					case "B":
						this.bosses.push(new Boss(x, y, this, true));
						break
					case "b":
						this.bosses.push(new Boss(x, y, this, false));
						break
					case "g":
						this.gold.push(new Gold(x, y, this))
						break
					case "G":
						this.gunBlocks.push(new GunBlock(x, y))
						break
					case "t":
						this.traps.push(new Trap(x, y, this));
						break
					case "f":
						this.flasks.push(new Flask(x, y, this));
						break

				}
			}
		});

		this.player = new Player(this, playerCoords.x, playerCoords.y);
		this.goal = new Goal(goalCoords.x, goalCoords.y, this);
		this.goalB = new GoalBack(goalBCoords.x, goalBCoords.y, this);
		monsterCoords.forEach((c) => {
			this.monsters.push(new Monster(this, c.x, c.y));
		});

		this.gameObjects = [
			...this.monsters,
			...this.walls,		
			...this.bullets, 
			...this.EBullets,
			...this.bombs,
			...this.keys, 
			...this.bosses,
			this.goal, 
			this.goalB,
			...this.gold,
			...this.gunBlocks,
			...this.blood,
			...this.traps,
			...this.flasks,
			this.player
			];
	}

	update(elaspsedtime) {
		if (!this.player) return
		let time2Shoot1 = this.lastShot >= 0.2;
		let time2Shoot2 = this.lastShot >= 0.7;
		let time2Shoot3 = this.lastShot >= 0;
		let time2Shoot4 = this.lastShot > 0.7;
		let shot = this.player.shootR || this.player.shootL || this.player.shootU || this.player.shootD;
		this.lastShot += elaspsedtime / 1000;
		if(this.player.shootR && this.player.shotType1 && time2Shoot1)
		{
			this.bullets.push(new Bullet(1, 0, 300, 6, 6, this, this.player.x + this.player.width / 3, this.player.y + this.player.width / 3));
			this.lastShot = 0;
		}
		else if(this.player.shootL && this.player.shotType1 && time2Shoot1)
		{
			this.bullets.push(new Bullet(-1, 0, 300, 6, 6, this, this.player.x + this.player.width / 3, this.player.y + this.player.width / 3));
			this.lastShot = 0;
		}
		else if(this.player.shootU && this.player.shotType1 && time2Shoot1)
		{
			this.bullets.push(new Bullet(0, -1, 300, 6, 6, this, this.player.x + this.player.width / 3, this.player.y + this.player.width / 3));
			this.lastShot = 0;
		}
		else if(this.player.shootD && this.player.shotType1 && time2Shoot1)
		{
			this.bullets.push(new Bullet(0, 1, 300, 6, 6, this, this.player.x + this.player.width / 3, this.player.y + this.player.width / 3));
			this.lastShot = 0;
		}

		if(this.player.shootR && this.player.shotType4 && time2Shoot4)
		{
			this.bombs.push(new Bomb(1, 0, 300, this, bullets));
			this.lastShot = 0;
		}
		else if(this.player.shootL && this.player.shotType4 && time2Shoot4)
		{
			this.bombs.push(new Bomb(-1, 0, 300, this, bullets));
			this.lastShot = 0;
		}
		else if(this.player.shootU && this.player.shotType4 && time2Shoot4)
		{
			this.bombs.push(new Bomb(0, -1, 300, this, bullets));
			this.lastShot = 0;
		}
		else if(this.player.shootD && this.player.shotType4 && time2Shoot4)
		{
			this.bombs.push(new Bomb(0, 1, 300, this, bullets));
			this.lastShot = 0;
		}

		if(this.player.shootR && this.player.shotType2 && time2Shoot2)
		{
			this.bullets.push(new Bullet(1, -1, 150, 1.5, 6, this, this.player.x + this.player.width / 3, this.player.y + this.player.width / 3));
			this.bullets.push(new Bullet(1, 1, 150, 1.5, 6, this, this.player.x + this.player.width / 3, this.player.y + this.player.width / 3));
			this.bullets.push(new Bullet(1, -1, 150, 1, 6, this, this.player.x + this.player.width / 3, this.player.y + this.player.width / 3));
			this.bullets.push(new Bullet(1, 1, 150, 1, 6, this, this.player.x + this.player.width / 3, this.player.y + this.player.width / 3));
			this.bullets.push(new Bullet(1, 0, 150, 6, 6, this, this.player.x + this.player.width / 3, this.player.y + this.player.width / 3));
			this.lastShot = 0;
		}
		else if(this.player.shootL && this.player.shotType2 && time2Shoot2)
		{
			this.bullets.push(new Bullet(-1, -1, 150, 1.5, 6, this, this.player.x + this.player.width / 3, this.player.y + this.player.width / 3));
			this.bullets.push(new Bullet(-1, 1, 150, 1.5, 6, this, this.player.x + this.player.width / 3, this.player.y + this.player.width / 3));
			this.bullets.push(new Bullet(-1, -1, 150, 1, 6, this, this.player.x + this.player.width / 3, this.player.y + this.player.width / 3));
			this.bullets.push(new Bullet(-1, 1, 150, 1, 6, this, this.player.x + this.player.width / 3, this.player.y + this.player.width / 3));
			this.bullets.push(new Bullet(-1, 0, 150, 6, 6, this, this.player.x + this.player.width / 3, this.player.y + this.player.width / 3));
			this.lastShot = 0;
		}
		else if(this.player.shootU && this.player.shotType2 && time2Shoot2)
		{
			this.bullets.push(new Bullet(-1, -1, 150, 6, 1, this, this.player.x + this.player.width / 3, this.player.y + this.player.width / 3));
			this.bullets.push(new Bullet(1, -1, 150, 6, 1, this, this.player.x + this.player.width / 3, this.player.y + this.player.width / 3));
			this.bullets.push(new Bullet(-1, -1, 150, 6, 1.5, this, this.player.x + this.player.width / 3, this.player.y + this.player.width / 3));
			this.bullets.push(new Bullet(1, -1, 150, 6, 1.5, this, this.player.x + this.player.width / 3, this.player.y + this.player.width / 3));
			this.bullets.push(new Bullet(0, -1, 150, 6, 1.5, this, this.player.x + this.player.width / 3, this.player.y + this.player.width / 3));
			this.lastShot = 0;
		}
		else if(this.player.shootD && this.player.shotType2 && time2Shoot2)
		{
			this.bullets.push(new Bullet(-1, 1, 150, 6, 1, this, this.player.x + this.player.width / 3, this.player.y + this.player.width / 3));
			this.bullets.push(new Bullet(1, 1, 150, 6, 1, this, this.player.x + this.player.width / 3, this.player.y + this.player.width / 3));
			this.bullets.push(new Bullet(-1, 1, 150, 6, 1.5, this, this.player.x + this.player.width / 3, this.player.y + this.player.width / 3));
			this.bullets.push(new Bullet(1, 1, 150, 6, 1.5, this, this.player.x + this.player.width / 3, this.player.y + this.player.width / 3));
			this.bullets.push(new Bullet(0, 1, 150, 6, 1.5, this, this.player.x + this.player.width / 3, this.player.y + this.player.width / 3));
			this.lastShot = 0;
		}

		if(shot && this.player.shotType3 && time2Shoot3)
		{
			this.bullets.push(new Bullet(-1, -1, 200, 6, 6, this, this.player.x + this.player.width / 3, this.player.y + this.player.width / 3));
			this.bullets.push(new Bullet(1, 1, 200, 6, 6, this, this.player.x + this.player.width / 3, this.player.y + this.player.width / 3));
			this.bullets.push(new Bullet(1, 0, 200, 6, 6, this, this.player.x + this.player.width / 3, this.player.y + this.player.width / 3));
			this.bullets.push(new Bullet(0, 1, 200, 6, 6, this, this.player.x + this.player.width / 3, this.player.y + this.player.width / 3));
			this.bullets.push(new Bullet(-1, 0, 200, 6, 6, this, this.player.x + this.player.width / 3, this.player.y + this.player.width / 3));
			this.bullets.push(new Bullet(0, -1, 200, 6, 6, this, this.player.x + this.player.width / 3, this.player.y + this.player.width / 3));
			this.bullets.push(new Bullet(-1, 1, 200, 6, 6, this, this.player.x + this.player.width / 3, this.player.y + this.player.width / 3));
			this.bullets.push(new Bullet(1, -1, 200, 6, 6, this, this.player.x + this.player.width / 3, this.player.y + this.player.width / 3));
			this.bullets.push(new Bullet(-1, -1, 200, 12, 6, this, this.player.x + this.player.width / 3, this.player.y + this.player.width / 3));
			this.bullets.push(new Bullet(-1, 1, 200, 6, 12, this, this.player.x + this.player.width / 3, this.player.y + this.player.width / 3));
			this.bullets.push(new Bullet(1, -1, 200, 12, 6, this, this.player.x + this.player.width / 3, this.player.y + this.player.width / 3));
			this.bullets.push(new Bullet(1, 1, 200, 6, 12, this, this.player.x + this.player.width / 3, this.player.y + this.player.width / 3));
			this.bullets.push(new Bullet(-1, -1, 200, 3, 6, this, this.player.x + this.player.width / 3, this.player.y + this.player.width / 3));
			this.bullets.push(new Bullet(-1, 1, 200, 6, 3, this, this.player.x + this.player.width / 3, this.player.y + this.player.width / 3));
			this.bullets.push(new Bullet(1, -1, 200, 3, 6, this, this.player.x + this.player.width / 3, this.player.y + this.player.width / 3));
			this.bullets.push(new Bullet(1, 1, 200, 6, 3, this, this.player.x + this.player.width / 3, this.player.y + this.player.width / 3));
		}

		if(this.player.shoot && !this.player.shot)
		{
			this.bombs.push(new Bomb(1, 1, 300, this, bullets));
			this.bombs.push(new Bomb(1, -1, 300, this, bullets));
			this.bombs.push(new Bomb(-1, 1, 300, this, bullets));
			this.bombs.push(new Bomb(-1, -1, 300, this, bullets));
			this.bombs.push(new Bomb(0, 1, 300, this, bullets));
			this.bombs.push(new Bomb(0, -1, 300, this, bullets));
			this.bombs.push(new Bomb(-1, 0, 300, this, bullets));
			this.bombs.push(new Bomb(1, 0, 300, this, bullets));
			this.player.shot = true;
		}

		this.bosses.forEach((b) => {
			if(!b.isDead && !b.isBigBoi) {
				this.EBullets.push(new EnemyBullet(b.x + b.width / 3, b.y + b.height / 3, -1, -1, 150, this, 0.3125, 0.15625, 2, 2));
				this.EBullets.push(new EnemyBullet(b.x + b.width / 3, b.y + b.height / 3, 1, 1, 150, this, 0.3125, 0.15625, 2, 2));
				this.EBullets.push(new EnemyBullet(b.x + b.width / 3, b.y + b.height / 3, 1, 0, 150, this, 0.3125, 0.15625, 2, 2));
				this.EBullets.push(new EnemyBullet(b.x + b.width / 3, b.y + b.height / 3, 0, 1, 150, this, 0.3125, 0.15625, 2, 2));
				this.EBullets.push(new EnemyBullet(b.x + b.width / 3, b.y + b.height / 3, -1, 0, 150, this, 0.3125, 0.15625, 2, 2));
				this.EBullets.push(new EnemyBullet(b.x + b.width / 3, b.y + b.height / 3, 0, -1, 150, this, 0.3125, 0.15625, 2, 2));
				this.EBullets.push(new EnemyBullet(b.x + b.width / 3, b.y + b.height / 3, -1, 1, 150, this, 0.3125, 0.15625, 2, 2));
				this.EBullets.push(new EnemyBullet(b.x + b.width / 3, b.y + b.height / 3, 1, -1, 150, this, 0.3125, 0.15625, 2, 2));
			}
			else if (!b.isDead && b.isBigBoi)
			{
				this.EBullets.push(new EnemyBullet(b.x + b.width / 3, b.y + b.height / 3, -1, -1, 150, this, 0.3125, 0.15625, 2, 2));
				this.EBullets.push(new EnemyBullet(b.x + b.width / 3, b.y + b.height / 3, 1, 1, 150, this, 0.3125, 0.15625, 2, 2));
				this.EBullets.push(new EnemyBullet(b.x + b.width / 3, b.y + b.height / 3, 1, 0, 150, this, 0.3125, 0.15625, 2, 2));
				this.EBullets.push(new EnemyBullet(b.x + b.width / 3, b.y + b.height / 3, 0, 1, 150, this, 0.3125, 0.15625, 2, 2));
				this.EBullets.push(new EnemyBullet(b.x + b.width / 3, b.y + b.height / 3, -1, 0, 150, this, 0.3125, 0.15625, 2, 2));
				this.EBullets.push(new EnemyBullet(b.x + b.width / 3, b.y + b.height / 3, 0, -1, 150, this, 0.3125, 0.15625, 2, 2));
				this.EBullets.push(new EnemyBullet(b.x + b.width / 3, b.y + b.height / 3, -1, 1, 150, this, 0.3125, 0.15625, 2, 2));
				this.EBullets.push(new EnemyBullet(b.x + b.width / 3, b.y + b.height / 3, 1, -1, 150, this, 0.3125, 0.15625, 2, 2));
				this.EBullets.push(new EnemyBullet(b.x + b.width / 3, b.y + b.height / 3, -1, -1, 150, this, 0.3125, 0.15625, 4, 2));
				this.EBullets.push(new EnemyBullet(b.x + b.width / 3, b.y + b.height / 3, 1, 1, 150, this, 0.3125, 0.15625, 2, 4));
				this.EBullets.push(new EnemyBullet(b.x + b.width / 3, b.y + b.height / 3, -1, 1, 150, this, 0.3125, 0.15625, 4, 2));
				this.EBullets.push(new EnemyBullet(b.x + b.width / 3, b.y + b.height / 3, 1, -1, 150, this, 0.3125, 0.15625, 2, 4));
				this.EBullets.push(new EnemyBullet(b.x + b.width / 3, b.y + b.height / 3, -1, -1, 150, this, 0.3125, 0.15625, 1, 2));
				this.EBullets.push(new EnemyBullet(b.x + b.width / 3, b.y + b.height / 3, 1, 1, 150, this, 0.3125, 0.15625, 2, 1));
				this.EBullets.push(new EnemyBullet(b.x + b.width / 3, b.y + b.height / 3, -1, 1, 150, this, 0.3125, 0.15625, 1, 2));
				this.EBullets.push(new EnemyBullet(b.x + b.width / 3, b.y + b.height / 3, 1, -1, 150, this, 0.3125, 0.15625, 2, 1));
			}
		})

		this.gunBlocks.forEach((g) => {
			let d2 = 0.15625 * 100
			let d1 = 0.3125 * 100
			if(time2Shoot2)
			{
			this.EBullets.push(new EnemyBullet(g.x + g.width / 3, g.y + g.height / 3, 1, 0, 2000, this, d1, d2, 3, 3));
			this.EBullets.push(new EnemyBullet(g.x + g.width / 3, g.y + g.height / 3, 0, 1, 2000, this, d1, d2, 3, 3));
			this.EBullets.push(new EnemyBullet(g.x + g.width / 3, g.y + g.height / 3, -1, 0, 2000, this, d1, d2, 3, 3));
			this.EBullets.push(new EnemyBullet(g.x + g.width / 3, g.y + g.height / 3, 0, -1, 2000, this, d1, d2, 3, 3));
			this.lastShot = 0;
			}
		})

	
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
		this.skin = 0;

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
				if(this.boughtShot3 || this.game.money >= 100) 
				{
					this.boughtShot3 = true
					this.shotType1 = false;
					this.shotType2 = false;
					this.shotType3 = true;
					this.shotType4 = false;
				}
				break
			case "3":
				if(this.boughtShot2 || this.game.money >= 50) 
				{
					this.boughtShot2 = true
					this.shotType1 = false;
					this.shotType2 = false;
					this.shotType3 = false;
					this.shotType4 = true;
				}
				break
			case "[":
				this.skin += 3;
				break
			case "]":
				this.skin -= 3;
				break

		}
	}

	/**
	 * @param {any} elaspsedtime
	 */
	update(elaspsedtime) {
		let speedMultiplier = 1;
		if(this.shotType3) { 
			this.game.musicDisk.Never();
		}
		if (this.health <= 0) {
			this.game.GameOver();
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

		this.game.walls.forEach((w) => {
			if(w.isOpen) return
			let safeLocation = this.isColliding(w);
			if (w.isLocked && this.inventory.length && safeLocation) 
			{
				this.inventory.pop();
				w.isLocked = false;
				w.isOpen = true;
				this.game.musicDisk.OpenDoor();
				return;
			}
	
			if (safeLocation) {
				this.x = safeLocation.x;
				this.y = safeLocation.y;
			}
		});

		this.game.traps.forEach((w) => {
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
				this.health -= 10;
				this.healthX += 5;
				
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
				this.game.musicDisk.PickKey();
			}
		});

		this.game.flasks.filter(f => !f.isPicked).forEach((f) => {
			if(f.isColliding(this)) {
				this.game.player.health += 250
				this.game.player.healthX -= 125;
				f.isPicked = true;
			}
		})

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

	render() {
		ctx.save();
        ctx.fillStyle = `hsla(${this.skin}, 100%, 50%, 1)`;
		ctx.beginPath();
		ctx.fillRect(this.x, this.y, this.width, this.height);
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
			this.game.money += 2;
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

		if (this.game.player.isSneaking) 
		{
			this.senseDis = 50;
		} 
		else if (this.game.player.isRunning)
		{
			this.senseDis = 200000000000
		}
		else 
		{
			this.senseDis = 150;
		}

		let insideX =
		this.game.player.x > this.x - this.senseDis &&
		this.game.player.x < this.x + this.senseDis;
		let insideY =
		this.game.player.y > this.y - this.senseDis &&
		this.game.player.y < this.y + this.senseDis;
		let isInside = insideX && insideY;


		if (
			this.game.player.x > this.x - this.senseDis &&
			this.game.player.x < this.x &&
			isInside
		) {
			this.movement.x.direction = -1;
			this.baseSpeed = 5;
		}
		if (
			this.game.player.x < this.x + this.senseDis &&
			this.game.player.x > this.x &&
			isInside
		) {
			this.movement.x.direction = 1;
			this.baseSpeed = 5;
		}
		if (
			this.game.player.y > this.y - this.senseDis &&
			this.game.player.y < this.y &&
			isInside
		) {
			this.movement.y.direction = -1;
			this.baseSpeed = 5;
		}
		if (
			this.game.player.y < this.y + this.senseDis &&
			this.game.player.y > this.y &&
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
			this.game.player.health -= 5;
			this.game.player.healthX += 2.5;
		}

		super.update(elaspsedtime);
	}

	render() {
		if(this.isDead) return

		super.render();
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
			this.game.money += 5;
			this.isDead = true;
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
		if (this.game.player.isColliding(this) && this.game.currentLevel < this.game.levels.length)
		{
			this.game.musicDisk.teleport();
			this.game.player.shot = false;
			this.game.isLevelComp = true;
		}
	}
}

class GoalBack extends GameObject {
	 /**
	 * @param {number} x
	 * @param {number} y
	 * @param {Game} game
	 * @param {boolean} [id]
	 */
	 constructor(x, y, game, id) {
		super(32, 32, x, y)
		this.game = game
		this.image.src = `/images/goal2.png`;
		this.isDelayed = id
	}

	update(elaspsedtime) {
		if (this.game.player.isColliding(this))
		{
			this.game.musicDisk.teleport();
			this.game.player.shot = false;
			this.game.isLevelBack = true;
		}
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
		if(this.dead)
		{
			this.x = 4000000;
			this.y = 4000000;
			return
		}
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
		this.delay = 0
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
			this.game.player.health -= this.d1;
			this.game.player.healthX += this.d2;
		}
	}

	render() {
		if(this.dead) return

		super.render();
	}

	
}

class GunBlock extends GameObject {
	/**
	 * @param {number} x
	 * @param {number} y
	 */
	constructor(x, y) {
		super(32, 32, x, y);
		this.image.src = '/images/gunBlock.png';

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

class Trap extends GameObject {
	/**
	 * @param {number} x
	 * @param {number} y
	 * @param {Game} game
	 */
	constructor(x, y, game) {
		super(32, 32, x, y)
		this.hasTrapped = false;
		this.game = game;
		this.image.src = '/images/trap.png'
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

		if(this.game.player.isColliding(this))
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

class Flask extends GameObject {
	/**
	 * @param {number} x
	 * @param {number} y
	 * @param {Game} game
	 */
	constructor(x, y, game) {
	super(16, 16, x, y)
	this.game = game

	this.isPicked = false;
	this.image.src = `/images/health.png`;
	}

	render() {
		console.log(this.isPicked)
		if(this.isPicked) return
		super.render();
	}

}

let blood = [];
let bullets = [];
let EBullets = [];
let bombs = [];
let back = new Image();
let allB = [...blood, ...bullets, ...EBullets, ...bombs];
back.src = "/images/background.png";
let game = new Game(EBullets, bullets, blood, bombs);
game.init();


let currentTime = 0;
/**
 * @param {number} timestamp
 */
function gameLoop(timestamp) {
	if(game.isLevelComp) {
		bullets.forEach((b) => {
			b.dead = true
		})
		EBullets.forEach((b) => {
			b.dead = true
		})
		blood.forEach((b) => {
			b.dead = true
		})
		bombs.forEach((b) => {
			b.dead = true
		})
		game.nextLevel();
	}
	if(game.isLevelBack) {
		bullets.forEach((b) => {
			b.dead = true
		})
		EBullets.forEach((b) => {
			b.dead = true
		})
		blood.forEach((b) => {
			b.dead = true
		})
		bombs.forEach((b) => {
			b.dead = true
		})
		game.lastLevel();
	}
	if(game.gameOver) {
		bullets.forEach((b) => {
			b.dead = true
		})
		EBullets.forEach((b) => {
			b.dead = true
		})
		blood.forEach((b) => {
			b.dead = true
		})
		bombs.forEach((b) => {
			b.dead = true
		})
	}
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	let elaspsedtime = timestamp - currentTime;
	currentTime = timestamp;
	ctx.drawImage(back, 0, 0);
	allB = [...blood, ...bullets, ...EBullets, ...bombs];
	allB.forEach((B) => {
		B.update(elaspsedtime);
		B.render();
	})
	game.gameObjects.forEach((o) => {
		o.update(elaspsedtime);
		o.render();
	});
	console.log()
	game.update(elaspsedtime);
	game.render();
	requestAnimationFrame(gameLoop);
}
