/**@type {HTMLAudioElement} */
let PlayMusic = document.getElementById("Music")
let pickKey = document.getElementById("Key")
let dooor = document.getElementById("Door")
let tele = document.getElementById("tele")
let never = document.getElementById("gonna give")
//@ts-check

export class AudioPlayer {
    constructor() {
        this.ctx = new AudioContext();
    }

    init() {
        if(this.ctx.state === "suspended")
        {
            this.ctx.resume();
        }
        PlayMusic.volume = 0.1
        PlayMusic.play();
        PlayMusic.loop = true;
    }

    PickKey() {
        pickKey.play();
    }

    OpenDoor() {
        dooor.play();
    }

    teleport() {
        tele.play();
    }

    Never() {
        never.play()
        never.loop = true;
    }
}