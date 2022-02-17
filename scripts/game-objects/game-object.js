//@ts-check
import {ctx} from "../canvas.js";

export class GameObject {
	constructor(w, h, x, y) {
		this.x = x;
		this.y = y;
		this.width = w;
		this.height = h;
		this.color = 0;
		this.sat = 100;
		this.light = 50;
        this.image = new Image();
        this.image.src = `/images/player.png`;
		this.opacity = 1;
        this.lastLocation = new Location(this.x, this.y);
	}

	update(elaspsedtime) {
        this.lastLocation.x = this.x;
        this.lastLocation.y = this.y;
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
        
        if (myBounds.bottem <= oBounds.top) return undefined
        if (myBounds.top >= oBounds.bottem) return undefined
        if (myBounds.rightSide <= oBounds.leftSide) return undefined
        if (myBounds.leftSide >= oBounds.rightSide) return undefined
        return this.lastLocation;
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

export class Location {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}