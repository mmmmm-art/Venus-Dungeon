//@ts-check
import {Game} from "../app.js"
import { canvas, ctx } from "../canvas.js";
import { GameObject } from "../game-objects/game-object.js";

export class GameWonScene extends GameObject {
    /**
     * @param {Game} game
     */
    constructor(game) {
        super(canvas.width, canvas.height, 0, 0)
        this.game = game
        this.textGrad = ctx.createLinearGradient(0, 0, 0, canvas.height)
        this.textGrad.addColorStop(0, "yellow");
        this.textGrad.addColorStop(1, "orange");
        canvas.addEventListener(
            "click", 
            () => {
            this.game.gameOver = false;
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
        ctx.fillText(`You won`, canvas.width / 2, canvas.height / 2);
        ctx.restore();
    }
}
