import Snap from "snapsvg";
import { Model } from "../data/Model";
import { GameState } from "../main";
import { SVGSurface } from "./SVGSurface";

export abstract class Screen {
    private readonly layoutFile: string;
    private readonly layoutAppend: boolean;
    private readonly layoutId: string;
    
    protected surface: SVGSurface;

    constructor(surface: SVGSurface, layoutFile: string, layoutAppend: boolean, layoutId: string) {
        this.surface = surface;
        this.layoutFile = layoutFile;
        this.layoutAppend = layoutAppend;
        this.layoutId = layoutId;

        if (this.layoutAppend) {
            this.surface.appendFragment(this.layoutFile, this.layoutId, 'g', null, true, (element: Snap.Element) => {
                this.onInit(surface, element);
            });
        } else {
            this.surface.prependFragment(this.layoutFile, this.layoutId, 'g', null, true, (element: Snap.Element) => {
                this.onInit(surface, element);
            });
        }
    }

    public onInit(_surface: SVGSurface, _element: Snap.Element) {}

    public onDeactivation(_state: GameState, _model: Model) {}

    public onActivation(_state: GameState, _model: Model) {}

    public show() {
        this.surface.show('#' + this.layoutId);
    }

    public hide() {
        this.surface.hide('#' + this.layoutId);
    }
}