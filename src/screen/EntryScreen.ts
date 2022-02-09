import Snap from "snapsvg";
import { Screen } from "../graphics/Screen";
import { SVGSurface } from "../graphics/SVGSurface";
import { Application, GameState } from "../main";

export class EntryScreen extends Screen {
    private entryInput: HTMLInputElement;
    private entryInputButton: HTMLButtonElement;
    private entryText: Snap.Element;

    constructor(surface: SVGSurface, layoutFile: string, layoutAppend: boolean, layoutId: string) {
        super(surface, layoutFile, layoutAppend, layoutId);
    }

    public onInit(surface: SVGSurface) {
        this.entryInput = document.querySelector('#entry');
        this.entryInputButton = document.querySelector('#entry-button');
        this.entryText = surface.query('text#entry-text tspan');

        surface.onClickOrTouch('#submit-button', () => {
            Application.onSolutionSubmitted(this.entryInput.value);
        });

        surface.onClickOrTouch('#entry-box', () => {
            this.entryInput.focus();
            this.entryInput.click();
            this.entryInputButton.click();            
        })
        SVGSurface.onClickOrTouchElement(this.entryText, () => {
            this.entryInput.focus();
            this.entryInput.click();
            this.entryInputButton.click();
        });

        this.entryInputButton.addEventListener('click', () => {
            this.entryInput.focus();
            this.entryInput.click();
        });

        this.entryInput.addEventListener('keyup', (event) => {
            if (event.keyCode === 13) {
                event.preventDefault();
                Application.onSolutionSubmitted(this.entryInput.value);
            } else {
                this.entryText.node.textContent = this.entryInput.value + '|';
            }
        });
    }

    public onActivation() {
        this.show();

        this.entryInput.value = '';
        this.entryText.node.textContent = '|';
        this.entryInput.focus();
        this.entryInput.click();
        this.entryInputButton.click();
    }

    public onDeactivation() {
        this.hide();
    }
}