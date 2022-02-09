
import Snap from "snapsvg";
import { Screen } from "../graphics/Screen";
import { SVGSurface } from "../graphics/SVGSurface";
import { Application } from "../main";

export class TitleScreen extends Screen {

    constructor(surface: SVGSurface, layoutFile: string, layoutAppend: boolean, layoutId: string) {
        super(surface, layoutFile, layoutAppend, layoutId);
    }

    public onInit(_surface: SVGSurface, element: Snap.Element) {
        element.removeClass('hidden');

        SVGSurface.onClickOrTouchElement(element.select('#start-button'), () => {
            Application.onNewGame();
        });

        SVGSurface.onClickOrTouchElement(element.select('#sound-button'), () => {
            this.updateSoundBox(Application.onToggleSound());
        });
    }

    public onDeactivation() {
        this.hide();
    }

    public onActivation() {
        this.show();

        setTimeout(() => {
            this.updateSoundBox(Application.isSoundOn());
        }, 1000);
    }

    private updateSoundBox(on: boolean) {
        this.surface.setTextBackground('#sound-text tspan', on ? '✓' : '');
    }
}