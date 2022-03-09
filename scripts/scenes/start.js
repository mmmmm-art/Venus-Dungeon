//@ts-check
import {Game} from "../app.js"
import { canvas, ctx } from "../canvas.js";
import { GameObject } from "../game-objects/game-object.js";

export class StartScene extends GameObject {
    /**
     * @param {Game} game
     */
    constructor(game) {
        super(canvas.width, canvas.height, 0, 0)
        this.game = game
        this.textGrad = ctx.createLinearGradient(0, 0, 0, canvas.height)
        this.textGrad.addColorStop(0, "yellow");
        this.textGrad.addColorStop(0.5, "orange");
        this.textGrad.addColorStop(1, "red");
        canvas.addEventListener(
            "click", 
            () => {
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
        ctx.fillText("Venus Dungeon", canvas.width / 2, canvas.height / 3);
        ctx.restore();

        ctx.save();
        ctx.fillStyle = this.textGrad;
        ctx.font = "50px font";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("Click to start", canvas.width / 2, canvas.height / 2);
        ctx.restore();

        ctx.save();
        ctx.fillStyle = this.textGrad;
        ctx.font = "25px font";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("WASD to move", canvas.width / 4, canvas.height / 2);
        ctx.restore();
        
        ctx.save();
        ctx.fillStyle = this.textGrad;
        ctx.font = "25px font";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("Arrowkeys to shoot", canvas.width - canvas.width / 4, canvas.height / 2);
        ctx.restore();

        ctx.save();
        ctx.fillStyle = this.textGrad;
        ctx.font = "50px deez";
        ctx.textBaseline = "middle";
        ctx.fillText("1: minigun  cost: 0", 100, 450);
        ctx.restore();

        ctx.save();
        ctx.fillStyle = this.textGrad;
        ctx.font = "50px deez";
        ctx.textBaseline = "middle";
        ctx.fillText("2: shotgun  cost: 10", 100, 500);
        ctx.restore();

        ctx.save();
        ctx.fillStyle = this.textGrad;
        ctx.font = "50px deez";
        ctx.textBaseline = "middle";
        ctx.fillText("3: bombgun  cost: 50", 100, 550);
        ctx.restore();

        ctx.save();
        ctx.fillStyle = this.textGrad;
        ctx.font = "50px deez";
        ctx.textBaseline = "middle";
        ctx.fillText("4: tentical demon  cost: 100", 100, 600);
        ctx.restore();

        ctx.save();
        ctx.fillStyle = this.textGrad;
        ctx.font = "50px deez";
        ctx.textBaseline = "middle";
        ctx.fillText("[ & ] to change color", 1000, 600);
        ctx.restore();
    }
}
