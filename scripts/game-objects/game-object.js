//@ts-check
import {ctx} from "../canvas.js";

export class GameObject {
	constructor(w, h) {
		this.x = 0;
		this.y = 0;
		this.width = w;
		this.height = h;
		this.color = 0;
		this.sat = 100;
		this.light = 50;
        this.image = new Image();
        this.image.src = `/images/player.png`;
		this.opacity = 1;
	}

	update(elaspsedtime) {

	}

	render() {
		ctx.save();
        ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
		ctx.restore();
	}

    getBounds() {
        return new objectBoundries(this.x, this.y, this.width, this.height);
    }

    /**
     * @param {GameObject} o
     */
    isColliding(o) {
        let myBounds = this.getBounds();
        let oBounds = o.getBounds();
        
        if (myBounds.bottem <= oBounds.top) return false
        if (myBounds.top >= oBounds.bottem) return false
        if (myBounds.rightSide <= oBounds.leftSide) return false
        if (myBounds.leftSide >= oBounds.rightSide) return false
        return true;
    }
}

class objectBoundries {
    constructor(x, y, w, h) {
        this.top = y;
        this.bottem = y + h;
        this.leftSide = x;
        this.rightSide = x + w;
    }
}