
import Snap from "snapsvg";
import { Model, Player } from "../data/Model";
import { Screen } from "../graphics/Screen";
import { SVGSurface } from "../graphics/SVGSurface";
import { Application, GameState } from "../main";

export class ContestantsScreen extends Screen {

    constructor(surface: SVGSurface, layoutFile: string, layoutAppend: boolean, layoutId: string) {
        super(surface, layoutFile, layoutAppend, layoutId);
    }

    public onDeactivation() {
        this.hide();
    }

    public onActivation(state: GameState, model: Model) {
        this.show();

        if (state === GameState.PICKING_PLAYERS) {
            this.setUpPlayers(model);
        }
    }

    private setUpPlayers(model: Model) {
        Application.setStatusMessage('Picking contestants...');

        this.surface.setTextBackground('#prize1', '0');
        this.surface.setTextBackground('#prize2', '0');
        this.surface.setTextBackground('#prize3', '0');

        this.surface.appendInPlaceSimple('assets/images/avatar_0.svg', '#avatar1', 'g g');

        setTimeout(() => {
            this.surface.appendInPlaceSimple(`assets/images/avatar_${model.getPlayer(Player.CPU1).portrait.toString()}.svg`, '#avatar2', 'g g');
        }, 1500);

        setTimeout(() => {
            this.surface.appendInPlaceSimple(`assets/images/avatar_${model.getPlayer(Player.CPU2).portrait.toString()}.svg`, '#avatar3', 'g g');
        }, 3000);

        setTimeout(() => {
            Application.setStatusMessage(model.getSolutionCategory());
        }, 4500);

        setTimeout(() => {
            Application.onNextPlayer();
        }, 6000);
    }

    public updatePrize(model: Model) {
        this.surface.setTextBackground('#prize1', model.getPlayer(Player.HUMAN).prize.toString());
        this.surface.setTextBackground('#prize2', model.getPlayer(Player.CPU1).prize.toString());
        this.surface.setTextBackground('#prize3', model.getPlayer(Player.CPU2).prize.toString());
    }
}