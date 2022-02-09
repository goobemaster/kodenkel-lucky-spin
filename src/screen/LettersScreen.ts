
import Snap from "snapsvg";
import { Model, PlayerData } from "../data/Model";
import { Screen } from "../graphics/Screen";
import { SVGSurface } from "../graphics/SVGSurface";
import { Application, GameState } from "../main";

export class LettersScreen extends Screen {
    private static readonly GREYED_FILL: string = '#939dac';
    private static readonly ACTIVE_FILL: string = '#ff80b2';

    private letters: Snap.Element[];
    private player: PlayerData;
    private isBuyingVowel: boolean;

    constructor(surface: SVGSurface, layoutFile: string, layoutAppend: boolean, layoutId: string) {
        super(surface, layoutFile, layoutAppend, layoutId);
    }

    public onInit(surface: SVGSurface) {
        this.letters = [
            surface.query('#letterA'),
            surface.query('#letterB'),
            surface.query('#letterC'),
            surface.query('#letterD'),
            surface.query('#letterE'),
            surface.query('#letterF'),
            surface.query('#letterG'),
            surface.query('#letterH'),
            surface.query('#letterI'),
            surface.query('#letterJ'),
            surface.query('#letterK'),
            surface.query('#letterL'),
            surface.query('#letterM'),
            surface.query('#letterN'),
            surface.query('#letterO'),
            surface.query('#letterP'),
            surface.query('#letterQ'),
            surface.query('#letterR'),
            surface.query('#letterS'),
            surface.query('#letterT'),
            surface.query('#letterU'),
            surface.query('#letterV'),
            surface.query('#letterW'),
            surface.query('#letterX'),
            surface.query('#letterY'),
            surface.query('#letterZ')
        ];

        for (let i = 0; i < 26; i++) {
            SVGSurface.onClickOrTouchElement(this.letters[i], () => {
                let letter = Model.getLetters()[i];

                if (this.isBuyingVowel) {
                    if (this.player.name === 'Player' && Model.vowels.includes(letter)) {
                        Application.onVowelBought(letter);
                    }
                } else {
                    if (this.player.name === 'Player' && !Application.isLetterAlreadyGuessed(letter)) {
                        Application.onLetterGuessed(letter);
                    }
                }
            });
            this.letters[i].addClass('pointer');
        }
    }

    public onDeactivation() {
        this.hide();
    }

    public onActivation(state: GameState, model: Model) {
        this.show();

        this.player = model.getCurrentPlayer();

        Model.getLetters().forEach((letter: string, index: number) => {
            this.letters[index].attr({fill: model.isLetterAlreadyGuessed(letter) ? LettersScreen.GREYED_FILL : LettersScreen.ACTIVE_FILL});
        });

        if (state === GameState.GUESSING_LETTER) {
            this.isBuyingVowel = false;

            if (this.player.name !== 'Player') {
                setTimeout(() => {
                    Application.onLetterGuessed(model.getRandomAvailableLetter());
                }, 2000);
            }
        }

        if (state === GameState.BUYING_VOWEL) {
            this.isBuyingVowel = true;

            Model.getLetters().forEach((letter: string, index: number) => {
                if (model.isLetterAlreadyGuessed(letter) || !Model.vowels.includes(letter)) {
                    this.letters[index].attr({fill: LettersScreen.GREYED_FILL});
                } else {
                    this.letters[index].attr({fill: LettersScreen.ACTIVE_FILL});
                }
            });

            if (this.player.name !== 'Player') {
                // TODO: CPU
                setTimeout(() => {
                    Application.onVowelBought(model.getRandomAvailableVowel());
                }, 3000);
            }
        }
    }
}