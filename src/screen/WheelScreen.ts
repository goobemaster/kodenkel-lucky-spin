
import Snap from "snapsvg";
import { Model, PlayerData } from "../data/Model";
import { Screen } from "../graphics/Screen";
import { SVGSurface } from "../graphics/SVGSurface";
import { Application, GameState } from "../main";
import { Sound, SoundFX } from "../Sound";

export interface WheelSection {
    prize: number;
    special: SpecialSection;
}

export enum SpecialSection {
    NONE,
    BANKRUPT,
    DOUBLE,
    LOOSE_A_TURN
}

export class WheelScreen extends Screen {
    private spinButton: Snap.Element;
    private spinButtonText: Snap.Element;
    private spinButtonDecor: Snap.Element;
    private bar: Snap.Element;
    private wheel: Snap.Element;

    private static readonly barY: number = 132.95834;
    private static readonly barHeight: number = 142.87503;
    private static readonly section: WheelSection[] = [
        { prize: 400, special: SpecialSection.NONE },
        { prize: 800, special: SpecialSection.NONE },
        { prize: 0, special: SpecialSection.BANKRUPT },
        { prize: 3000, special: SpecialSection.NONE },
        { prize: 200, special: SpecialSection.NONE },
        { prize: 1000, special: SpecialSection.NONE },
        { prize: 0, special: SpecialSection.DOUBLE },
        { prize: 750, special: SpecialSection.NONE },
        { prize: 250, special: SpecialSection.NONE },
        { prize: 0, special: SpecialSection.LOOSE_A_TURN },
        { prize: 100, special: SpecialSection.NONE },
        { prize: 5000, special: SpecialSection.NONE }                                                                                      
    ];

    private player: PlayerData;
    private spinInProgress: boolean;
    private spinDirection: boolean;
    private wheelDegree: number = 0;

    constructor(surface: SVGSurface, layoutFile: string, layoutAppend: boolean, layoutId: string) {
        super(surface, layoutFile, layoutAppend, layoutId);
    }

    public onInit(surface: SVGSurface) {
        this.spinButton = surface.query('#spin-button');
        this.spinButtonText = surface.query('#spin-button-text');
        this.spinButtonDecor = surface.query('#spin-button-decor');
        this.bar = surface.query('#momentum-bar');
        this.wheel = surface.query('#gwheel');

        SVGSurface.onClickOrTouchElement(this.spinButton, () => {
            if (this.spinInProgress) {
                this.spinInProgress = false;
                this.wheelAnimationTick(this.getInitialSpeed());
            }
        });
    }

    public onDeactivation() {
        this.hide();
    }

    public onActivation(state: GameState, model: Model) {
        this.show();

        if (state === GameState.SPIN) {
            this.player = model.getCurrentPlayer();
            this.spinInProgress = true;
            this.spinDirection = true;

            Application.setStatusMessage(`It is time to spin the wheel, ${this.player.name} !`);

            if (this.player.name === 'Player') {
                this.spinButton.removeClass('hidden');
                this.spinButtonText.removeClass('hidden');
                this.spinButtonDecor.removeClass('hidden');
                this.bar.attr({
                    y: WheelScreen.barY,
                    height: WheelScreen.barHeight
                });
            } else {
                this.spinButton.addClass('hidden');
                this.spinButtonText.addClass('hidden');
                this.spinButtonDecor.addClass('hidden');
                setTimeout(() => {
                    this.spinInProgress = false;
                    this.wheelAnimationTick(this.getInitialSpeed());
                }, 500 + Math.floor(Math.random() * 3000));
            }

            this.barAnimationTick();
        }
    }

    private barAnimationTick() {
        setTimeout(() => {
            let top = parseFloat(this.bar.attr('y'));
            top = top + (this.spinDirection ? 5 : -5);

            if (top > WheelScreen.barY + WheelScreen.barHeight) {
                this.spinDirection = false;
                top = WheelScreen.barY + WheelScreen.barHeight;
            } else if (top < WheelScreen.barY) {
                this.spinDirection = true;
                top = WheelScreen.barY;
            }

            this.bar.attr({
                y: top,
                height: WheelScreen.barY + WheelScreen.barHeight - top
            });

            if (this.spinInProgress) this.barAnimationTick();
        }, 25);
    }

    private wheelAnimationTick(speed: number) {
        setTimeout(() => {
            this.wheel.attr({style: `transform-origin: center; transform-box: fill-box; transform: rotate(${this.wheelDegree.toString()}deg)`})

            let speedMod = speed - 1;
            this.wheelDegree = this.wheelDegree + speedMod;
            if (this.wheelDegree > 360) this.wheelDegree -= 360 
            if (speed < 1) {
                Application.onSpinEnded(this.getWheelSection());
            } else {
                this.wheelAnimationTick(speedMod);
            }
        }, 100);
    }

    private getWheelSection(): WheelSection {
        let degree = parseInt(this.wheel.attr('style').match(/[\d\.]+/)[0]);
        let section = Math.floor((degree - 15) / 30);

        return section < 0 ? WheelScreen.section[11] : WheelScreen.section[section];
    }

    private getInitialSpeed(): number {
        return 15 + ((WheelScreen.barHeight / 100 * (WheelScreen.barY + WheelScreen.barHeight - parseFloat(this.bar.attr('y')))) / 5);
    }

    public setStatusMessage(text: string) {
        this.surface.setTextBackground('#statusText', text);
    }
}
