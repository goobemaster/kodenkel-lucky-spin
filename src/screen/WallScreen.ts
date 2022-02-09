
import { Model } from "../data/Model";
import { Screen } from "../graphics/Screen";
import { SVGSurface } from "../graphics/SVGSurface";
import { Application, GameScreen, GameState } from "../main";
import { Sound, SoundFX } from "../Sound";

export class WallScreen extends Screen {
    private static readonly textAttributes: {[index: string]: string} = {
        'font-size': '22px',
        'font-family': 'coolvetica',
        'font-style': 'normal',
        'font-variant': 'normal',
        'font-stretch': 'normal',
        'line-height': '1.25',
        'fill': '#000000',
        'fill-opacity': '1'
    };

    constructor(surface: SVGSurface, layoutFile: string, layoutAppend: boolean, layoutId: string) {
        super(surface, layoutFile, layoutAppend, layoutId);
    }

    public onDeactivation() {
        this.hide();
    }

    public onActivation(state: GameState, model: Model) {
        this.show();

        if (state === GameState.PICKING_PLAYERS) {
            this.setUpBlocks(model.getSolution());
        }

        if (state === GameState.REVEALING_BLOCKS) {
            let blockIndexes: number[] = model.getCurrentLetterBlocks();

            blockIndexes.forEach((blockIndex, index) => {
                setTimeout(() => {
                    Sound.playFX(SoundFX.DING);
                    this.surface.changeAttribute('#b' + blockIndex.toString(), 'fill', BlockColor.YELLOW);
                }, index * 500);
            });

            setTimeout(() => {
                blockIndexes.forEach((blockIndex) => {
                    this.surface.insertTextNodeAt('#b' + blockIndex.toString(), '#' + GameScreen.WALL.toString(), model.getSolution().charAt(blockIndex), WallScreen.textAttributes, 0, -8);
                    this.surface.changeAttribute('#b' + blockIndex.toString(), 'fill', BlockColor.BLUE);
                });

                Application.onRevealingBlocksEnded(blockIndexes.length);
            }, blockIndexes.length * 500 + 1000);
        }

        if (state === GameState.REVEAL_REMAINING_BLOCKS) {
            let blockIndexes: number[] = model.getRemainingLetterBlocks();

            blockIndexes.forEach((blockIndex) => {
                this.surface.insertTextNodeAt('#b' + blockIndex.toString(), '#' + GameScreen.WALL.toString(), model.getSolution().charAt(blockIndex), WallScreen.textAttributes, 0, -8);
                this.surface.changeAttribute('#b' + blockIndex.toString(), 'fill', BlockColor.BLUE);
            });

            Application.onWon();
        }
    }

    private setUpBlocks(solution: string) {
        let charCode: number;
        let color: string;

        if (Application.DEBUG_MODE) console.log(solution);

        for (let i = 0; i < solution.length; i++) {
            charCode = solution.charCodeAt(i);
            if (charCode >= 65 && charCode <= 90) {
                color = BlockColor.BLUE.toString();
            } else if ((charCode >= 33 && charCode <= 47) || (charCode >= 58 && charCode <= 64)) {
                color = BlockColor.LIGHTGRAY.toString();
                let attributes = WallScreen.textAttributes;
                attributes['id'] = 'b' + i.toString() + 'letter';
                this.surface.insertTextNodeAt('#b' + i.toString(), '#' + GameScreen.WALL.toString(), solution.charAt(i), WallScreen.textAttributes, 0, -8);
            } else {
                color = BlockColor.GRAY.toString();
            }

            this.surface.changeAttribute('#b' + i.toString(), 'fill', color);
        }
    }
}

enum BlockColor {
    BLUE = '#3771c8',
    GRAY = '#939dac',
    YELLOW = '#ffcc00',
    LIGHTGRAY = '#dfdfdf'
}