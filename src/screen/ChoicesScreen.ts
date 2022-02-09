import { SVGSurface } from "../graphics/SVGSurface";
import { Screen } from "../graphics/Screen";
import { Application, GameState } from "../main";
import { CPUChoice, Model } from "../data/Model";
import Snap from "snapsvg";

export class ChoicesScreen extends Screen {
    private static readonly GREYED_FILL: string = '#939dac';
    private static readonly ACTIVE_FILL: string = '#ff80b2';

    private spinAgainButton: Snap.Element;
    private solveButton: Snap.Element;
    private buyVowelButton: Snap.Element;

    private buyVowelAvailable: boolean;
    private playerPrize: number;

    constructor(surface: SVGSurface, layoutFile: string, layoutAppend: boolean, layoutId: string) {
        super(surface, layoutFile, layoutAppend, layoutId);
    }

    public onInit(surface: SVGSurface) {
        this.spinAgainButton = surface.query('#spin-again-button');
        this.solveButton = surface.query('#solve-button');
        this.buyVowelButton = surface.query('#buy-vowel-button');

        SVGSurface.onClickOrTouchElement(this.spinAgainButton, () => {
            Application.onSpinAgain();
        });

        SVGSurface.onClickOrTouchElement(this.solveButton, () => {
            Application.onAttemptToSolve(null);
        });

        SVGSurface.onClickOrTouchElement(this.buyVowelButton, () => {
            if (this.buyVowelAvailable && this.playerPrize >= Model.costOfVowel) {
                Application.onBuyingVowel();
            } else if (this.buyVowelAvailable && this.playerPrize < Model.costOfVowel) {
                Application.setStatusMessage('Sorry, each vowel cost 500 credit.');
            } else {
                Application.setStatusMessage('Sorry, no more vowels left.');
            }
        });
    }

    public onActivation(state: GameState, model: Model) {
        this.buyVowelAvailable = model.isThereVowelsAvailable();
        this.buyVowelButton.attr({fill: this.buyVowelAvailable ? ChoicesScreen.ACTIVE_FILL : ChoicesScreen.GREYED_FILL});

        let player = model.getCurrentPlayer();
        this.playerPrize = player.prize;

        if (state === GameState.END_OF_ROUND_CHOICE) {
            if (player.name === 'Player') {
                this.show();
            } else {
                this.hide();

                setTimeout(() => {
                    switch (model.getCPUChoice(player.skill, this.buyVowelAvailable, player.prize)) {
                        case CPUChoice.BUY_VOWEL:
                            Application.onBuyingVowel();
                            break;
                        case CPUChoice.GUESS_RIGHT:
                            Application.onAttemptToSolve(true);
                            break;
                        case CPUChoice.GUESS_WRONG:
                            Application.onAttemptToSolve(false);
                            break;
                        default:
                            Application.onSpinAgain();
                    }
                }, 2000);
            }
        }
    }

    public onDeactivation() {
        this.hide();
    }
}