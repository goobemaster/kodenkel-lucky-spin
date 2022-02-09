import { SVGSurface } from "../graphics/SVGSurface";
import { Screen } from "../graphics/Screen";
import Snap from "snapsvg";
import { Application, GameState } from "../main";
import { Model } from "../data/Model";
import { Sound, SoundFX } from "../Sound";

export class DoorsScreen extends Screen {
    private static readonly ACTIVE_FILL: string = '#ff80b2';

    private statusText: Snap.Element;
    private doorMarker: Snap.Element[] = [];
    private doorClosed: Snap.Element[] = [];
    private doorOpen: Snap.Element[] = [];
    private goat: Snap.Element[] = [];
    private prize: Snap.Element[] = [];

    private behindTheDoor: boolean[];
    private initialPick: number;
    private prizePick: number;
    private finalPick: number;
    private stage: number;

    private isCPU: boolean;

    constructor(surface: SVGSurface, layoutFile: string, layoutAppend: boolean, layoutId: string) {
        super(surface, layoutFile, layoutAppend, layoutId);
    }

    public onInit(surface: SVGSurface) {
        surface.hide('#restart-button');
        this.statusText = surface.query('#statusTextMonty');
        this.doorMarker.push(surface.query('#doormarker1'));
        this.doorMarker.push(surface.query('#doormarker2'));
        this.doorMarker.push(surface.query('#doormarker3'));
        this.doorClosed.push(surface.query('#door1closed'));
        this.doorClosed.push(surface.query('#door2closed'));
        this.doorClosed.push(surface.query('#door3closed'));
        this.doorOpen.push(surface.query('#door1open')); this.doorOpen[0].addClass('hidden');
        this.doorOpen.push(surface.query('#door2open')); this.doorOpen[1].addClass('hidden');
        this.doorOpen.push(surface.query('#door3open')); this.doorOpen[2].addClass('hidden');
        this.goat.push(surface.query('#door1goat')); this.goat[0].addClass('hidden');
        this.goat.push(surface.query('#door2goat')); this.goat[1].addClass('hidden');
        this.goat.push(surface.query('#door3goat')); this.goat[2].addClass('hidden');
        this.prize.push(surface.query('#door1prize')); this.prize[0].addClass('hidden');
        this.prize.push(surface.query('#door2prize')); this.prize[1].addClass('hidden');
        this.prize.push(surface.query('#door3prize')); this.prize[2].addClass('hidden');

        this.behindTheDoor = [false, false, false];
        this.prizePick = Math.floor(Math.random() * 2);
        this.behindTheDoor[this.prizePick] = true;
        this.initialPick = 0;
        this.finalPick = 0;
        this.stage = 0;

        for (let i = 0; i < 3; i++) {
            SVGSurface.onClickOrTouchElement(this.doorClosed[i], () => {
                if (!this.isCPU) {
                    if (this.stage === 0) {
                        this.doorMarker[i].attr({fill: DoorsScreen.ACTIVE_FILL});
                        setTimeout(() => {
                            this.initialDoorPicked(i);
                        }, 2000);
                    } else if (this.stage === 2) {
                        // Final decision
                        this.finalPick = i;
                        this.doorMarker[0].addClass('hidden');
                        this.doorMarker[1].addClass('hidden');
                        this.doorMarker[2].addClass('hidden');
                        this.doorMarker[i].attr({fill: DoorsScreen.ACTIVE_FILL});
                        this.doorMarker[i].removeClass('hidden');
                        this.stage = 3;
                        setTimeout(() => {
                            this.evaluate();
                        }, 2000);
                    }
                }
            });
        }

        surface.onClickOrTouch('#restart-button', () => {
            location.reload();
        });
    }

    public onDeactivation() {
        this.hide();
    }

    // @ts-ignore
    public onActivation(state: GameState, model: Model) {
        this.show();

        this.isCPU = Application.isCPUPlayerWon();

        if (this.isCPU) {
            let doorPick = Math.floor(Math.random() * 3);

            setTimeout(() => {
                this.doorMarker[doorPick].attr({fill: DoorsScreen.ACTIVE_FILL});
            }, 2000);

            setTimeout(() => {
                this.initialDoorPicked(doorPick);
            }, 4000);
        }
    }

    public initialDoorPicked(id: number) {
        this.stage = 1;
        this.initialPick = id;
        this.statusText.select('tspan:nth-child(1)').node.textContent = "Jolly good.";
        this.statusText.select('tspan:nth-child(2)').node.textContent = "";
        this.statusText.select('tspan:nth-child(3)').node.textContent = "I'll open a door that had a goat behind, all along.";
        setTimeout(() => {
            Sound.playFX(SoundFX.DOOR_OPEN);
            let hostDoor: number = Math.floor(Math.random() * 3);
            while (!this.isDoorValidHostPick(hostDoor)) {
                hostDoor = Math.floor(Math.random() * 3);
            }
            this.doorClosed[hostDoor].addClass('hidden');
            this.doorOpen[hostDoor].removeClass('hidden');
            this.goat[hostDoor].removeClass('hidden');
            this.statusText.select('tspan:nth-child(1)').node.textContent = "The question is...";
            this.statusText.select('tspan:nth-child(2)').node.textContent = "";
            this.statusText.select('tspan:nth-child(3)').node.textContent = "Do you keep your original guess or do you swap?";
            this.stage = 2;

            if (this.isCPU) {
                setTimeout(() => {
                    let cpuDoor: number = Math.floor(Math.random() * 3);
                    while (!this.isDoorValidFinalPick(cpuDoor)) {
                        cpuDoor = Math.floor(Math.random() * 3);
                    }
                    this.finalPick = cpuDoor;
                    this.doorMarker[0].addClass('hidden');
                    this.doorMarker[1].addClass('hidden');
                    this.doorMarker[2].addClass('hidden');
                    this.doorMarker[cpuDoor].attr({fill: DoorsScreen.ACTIVE_FILL});
                    this.doorMarker[cpuDoor].removeClass('hidden');
                    setTimeout(() => {
                        this.evaluate();
                    }, 2000);
                }, 5000);
            }
        }, 5000);
    }

    private isDoorValidHostPick(id: number): boolean {
        return id !== this.initialPick && this.behindTheDoor[id] === false;
    }

    private isDoorValidFinalPick(id: number): boolean {
        return !this.doorClosed[id].hasClass('hidden');
    }

    private evaluate() {
        Sound.playFX(SoundFX.DOOR_OPEN);
        
        this.doorClosed[0].addClass('hidden');
        this.doorClosed[1].addClass('hidden');
        this.doorClosed[2].addClass('hidden');
        this.doorOpen[0].removeClass('hidden');
        this.doorOpen[1].removeClass('hidden');
        this.doorOpen[2].removeClass('hidden');
        this.goat[0].addClass('hidden');
        this.goat[1].addClass('hidden');
        this.goat[2].addClass('hidden');
        this.prize[0].addClass('hidden');
        this.prize[1].addClass('hidden');
        this.prize[2].addClass('hidden');

        if (this.behindTheDoor[0]) {
            this.prize[0].removeClass('hidden');
        } else {
            this.goat[0].removeClass('hidden');
        }

        if (this.behindTheDoor[1]) {
            this.prize[1].removeClass('hidden');
        } else {
            this.goat[1].removeClass('hidden');
        }

        if (this.behindTheDoor[2]) {
            this.prize[2].removeClass('hidden');
        } else {
            this.goat[2].removeClass('hidden');
        }

        if (this.finalPick === this.prizePick) {
            Sound.playFX(SoundFX.DING);
            this.statusText.select('tspan:nth-child(1)').node.textContent = `You\'ve won the grand total prize of ${Application.getGrandTotalPrize()} !`;
            this.statusText.select('tspan:nth-child(2)').node.textContent = "Created by: Gabor Major in February 2022";
            this.statusText.select('tspan:nth-child(3)').node.textContent = "Part of the kodenkel open source collection.";
        } else {
            Sound.playFX(SoundFX.BLEAT);
            this.statusText.select('tspan:nth-child(1)').node.textContent = "Well, at least the goat may keep the tax office away! ;)";
            this.statusText.select('tspan:nth-child(2)').node.textContent = "Created by: Gabor Major in February 2022";
            this.statusText.select('tspan:nth-child(3)').node.textContent = "Part of the kodenkel open source collection.";
        }

        this.surface.show('#restart-button');
    }
}