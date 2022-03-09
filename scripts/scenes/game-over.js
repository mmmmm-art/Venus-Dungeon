//@ts-check
import {Game} from "../app.js"
import { canvas, ctx } from "../canvas.js";
import { GameObject } from "../game-objects/game-object.js";

export class GameOverScene extends GameObject {
    /**
     * @param {Game} game
     */
    constructor(game) {
        super(canvas.width, canvas.height, 0, 0)
        this.game = game
        this.textGrad = ctx.createLinearGradient(0, 0, 0, canvas.height)
        this.textGrad.addColorStop(0, "red");
        this.textGrad.addColorStop(1, "yellow");
        canvas.addEventListener(
            "click", 
            () => {
            this.game.gameOver = false;
            this.game.currentLevel = 0;
            this.game.money = 0;
            this.game.Start();
        },
        {once: true}
        );
    }
    render () {
        super.render();

        ctx.save();
        ctx.fillStyle = this.textGrad;
        ctx.font = "100px font";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("GAME OVER", canvas.width / 2, canvas.height / 3);
        ctx.restore();

        ctx.save();
        ctx.fillStyle = this.textGrad;
        ctx.font = "50px font";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("Click to Restart", canvas.width / 2, canvas.height - 200);
        ctx.restore();

        ctx.save();
        ctx.fillStyle = this.textGrad;
        ctx.font = "50px deez";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(`Levels completed: ${this.game.currentLevel}`, canvas.width / 2, canvas.height / 2);
        ctx.restore();

        ctx.save();
        ctx.fillStyle = this.textGrad;
        ctx.font = "50px deez";
        ctx.textBaseline = "middle";
        ctx.fillText("1: minigun  cost: 0", 50, 450);
        ctx.restore();

        ctx.save();
        ctx.fillStyle = this.textGrad;
        ctx.font = "50px deez";
        ctx.textBaseline = "middle";
        ctx.fillText("2: shotgun  cost: 10", 50, 500);
        ctx.restore();

        ctx.save();
        ctx.fillStyle = this.textGrad;
        ctx.font = "50px deez";
        ctx.textBaseline = "middle";
        ctx.fillText("3: bombgun  cost: 50", 50, 550);
        ctx.restore();

        ctx.save();
        ctx.fillStyle = this.textGrad;
        ctx.font = "50px deez";
        ctx.textBaseline = "middle";
        ctx.fillText("4: tentical demon  cost: 100", 50, 600);
        ctx.restore();

        ctx.save();
        ctx.fillStyle = this.textGrad;
        ctx.font = "50px deez";
        ctx.textBaseline = "middle";
        ctx.fillText("[ & ] to change color", 1000, 600);
        ctx.restore();
    }
}
