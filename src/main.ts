
import { CachedJSONData } from './data/CachedJSONData';
import { Model } from './data/Model';
import { SVGSurface } from './graphics/SVGSurface';
import { Screen } from "./graphics/Screen";
import { TitleScreen } from './screen/TitleScreen';
import { Sound, SoundFX } from './Sound';
import { UserAgent } from './UserAgent';
import { ContestantsScreen } from './screen/ContestantsScreen';
import { LettersScreen } from './screen/LettersScreen';
import { WallScreen } from './screen/WallScreen';
import { SpecialSection, WheelScreen, WheelSection } from './screen/WheelScreen';
import { ChoicesScreen } from './screen/ChoicesScreen';
import { EntryScreen } from './screen/EntryScreen';
import { DoorsScreen } from './screen/DoorsScreen';

export class Application {
  private static SVG_WIDTH: number = 338.6;
  private static SVG_HEIGHT: number = 190.5;
  public static readonly DEBUG_MODE = false;
  public static isMobile: boolean = UserAgent.hasTouchScreen();
  private static data: CachedJSONData;
  private static model: Model;
  private static surface: SVGSurface;
  private static screen: {[index: string]: Screen} = {};
  private static state: GameState;

  constructor() {
    new CachedJSONData('lucky-spin-data.json', (data: CachedJSONData) => {
      Application.data = data;
      Application.model = new Model(data);

      if (data.getObjectByKey('user') === undefined) {
        data.addObject('user', {sound: '1'});
        data.save();
      }

      if (Application.isMobile) {
        window.addEventListener('deviceorientation', () => {
          this.onDeviceOrientation();
        }, true);
        this.onDeviceOrientation();
      }

      Application.surface = new SVGSurface('scene', '', Application.SVG_WIDTH, Application.SVG_HEIGHT);
      Application.screen[GameScreen.DOORS] = new DoorsScreen(Application.surface, 'assets/images/doors.svg', true, GameScreen.DOORS.toString());
      Application.screen[GameScreen.TITLE] = new TitleScreen(Application.surface, 'assets/images/menu.svg', true, GameScreen.TITLE.toString());
      Application.screen[GameScreen.CONTESTANTS] = new ContestantsScreen(Application.surface, 'assets/images/contestants.svg', true, GameScreen.CONTESTANTS.toString());
      Application.screen[GameScreen.LETTERS] = new LettersScreen(Application.surface, 'assets/images/letters.svg', true, GameScreen.LETTERS.toString());
      Application.screen[GameScreen.WHEEL] = new WheelScreen(Application.surface, 'assets/images/wheel.svg', true, GameScreen.WHEEL.toString());
      Application.screen[GameScreen.WALL] = new WallScreen(Application.surface, 'assets/images/wall.svg', false, GameScreen.WALL.toString());
      Application.screen[GameScreen.CHOICES] = new ChoicesScreen(Application.surface, 'assets/images/choices.svg', true, GameScreen.CHOICES.toString());
      Application.screen[GameScreen.ENTRY] = new EntryScreen(Application.surface, 'assets/images/entry.svg', true, GameScreen.ENTRY.toString());

      Application.onBackToTitle();
    });
  }

  public static activateScreen(screen: GameScreen) {
    Application.screen[screen].onActivation(Application.state, Application.model);
  }

  public static deactivateScreen(screen: GameScreen) {
    Application.screen[screen].onDeactivation(Application.state, Application.model);
  }

  public static deactivateAllScreen() {
    Application.screen[GameScreen.TITLE].onDeactivation(Application.state, Application.model);
    Application.screen[GameScreen.DOORS].onDeactivation(Application.state, Application.model);
    Application.screen[GameScreen.CONTESTANTS].onDeactivation(Application.state, Application.model);
    Application.screen[GameScreen.LETTERS].onDeactivation(Application.state, Application.model);
    Application.screen[GameScreen.WALL].onDeactivation(Application.state, Application.model);
    Application.screen[GameScreen.WHEEL].onDeactivation(Application.state, Application.model);
    Application.screen[GameScreen.CHOICES].onDeactivation(Application.state, Application.model);
    Application.screen[GameScreen.ENTRY].onDeactivation(Application.state, Application.model);
  }

  public static onBackToTitle() {
    Application.state = GameState.TITLE;

    Application.deactivateAllScreen();
    Application.activateScreen(GameScreen.TITLE);
  }

  public static onNewGame() {
    if (Application.isSoundOn()) Sound.loopMusic('op_42_02.mp3');
    
    Application.state = GameState.PICKING_PLAYERS;

    Application.model.reset();

    Application.deactivateAllScreen();
    Application.activateScreen(GameScreen.WALL);
    Application.activateScreen(GameScreen.CONTESTANTS);
  }

  public static onNextPlayer() {
    (Application.screen[GameScreen.CONTESTANTS] as ContestantsScreen).updatePrize(Application.model);

    Application.state = GameState.SPIN;
    Application.model.nextPlayer();

    Application.activateScreen(GameScreen.WHEEL);
  }

  public static onSpinAgain() {
    Application.deactivateScreen(GameScreen.CHOICES);
    (Application.screen[GameScreen.CONTESTANTS] as ContestantsScreen).updatePrize(Application.model);

    Application.state = GameState.SPIN;
    Application.model.setCurrentPrizeCredit(0);

    Application.activateScreen(GameScreen.WHEEL);
  }

  public static onSpinEnded(section: WheelSection) {
    let player = Application.model.getCurrentPlayer();

    switch (section.special) {
      case SpecialSection.BANKRUPT:
        Sound.playFX(SoundFX.BELL);
        Application.setStatusMessage(`Unfortunately I need take away the pot, ${player.name}...`);
        setTimeout(() => {
          player.prize -= Application.model.getCurrentRoundPrizeCredit();
          Application.onNextPlayer();
        }, 2500);
        break;

      case SpecialSection.DOUBLE:
        Sound.playFX(SoundFX.DING);
        if (player.prize === 0) {
          Application.setStatusMessage(`I'm a fair host ${player.name}, your pot shall be 200 credit!`);
          Application.model.setCurrentPrizeCredit(200);
        } else {
          Application.setStatusMessage(`I'll double your pot, ${player.name}! You can guess a letter.`);
          Application.model.setCurrentPrizeCredit(player.prize);
        }
        setTimeout(() => {
          Application.onGuessingLetter();
        }, 2500);
        break;

      case SpecialSection.LOOSE_A_TURN:
        Sound.playFX(SoundFX.BELL);
        Application.setStatusMessage(`You win some, you lose some, ${player.name}.`);
        setTimeout(() => {
          Application.onNextPlayer();
        }, 2500);
        break;

      default:
        Application.setStatusMessage(`Guess a letter for ${section.prize.toString()} credit, ${player.name}.`);
        Application.model.setCurrentPrizeCredit(section.prize);
        setTimeout(() => {
          Application.onGuessingLetter();
        }, 2500);
    }
  }

  public static onGuessingLetter() {
    Application.state = GameState.GUESSING_LETTER;

    Application.deactivateScreen(GameScreen.WHEEL);
    Application.activateScreen(GameScreen.LETTERS);
  }

  public static onLetterGuessed(letter: string) {
    Application.deactivateScreen(GameScreen.LETTERS);

    if (Application.model.isLetterFoundAndHidden(letter)) {
      Application.setStatusMessage(`Good, letter ${letter} is in the solution!`);
      Application.model.markLetterGuessed(letter);
      Application.onRevealingBlocks(letter);
    } else {
      Sound.playFX(SoundFX.BELL);
      Application.setStatusMessage(`Letter ${letter} is not in the solution. Next player.`);
      Application.model.markLetterGuessed(letter);
      setTimeout(() => {
        Application.onNextPlayer();
      }, 2500);
    }
  }

  public static onRevealingBlocks(letter: string) {
    Application.state = GameState.REVEALING_BLOCKS;
    Application.model.setCurrentLetter(letter);

    Application.activateScreen(GameScreen.WALL);
  }

  public static onRevealingBlocksEnded(timesPrize: number) {
    Application.model.getCurrentPlayer().prize += Application.model.getCurrentPrizeCredit() * timesPrize;
    (Application.screen[GameScreen.CONTESTANTS] as ContestantsScreen).updatePrize(Application.model);

    if (Application.model.isSolvedByGuessingAllLetters()) {
      Application.onWon();
    } else {
      setTimeout(() => {
        Application.state = GameState.END_OF_ROUND_CHOICE;
  
        Application.setStatusMessage('What would you like to do?');
        Application.activateScreen(GameScreen.CHOICES);
      }, 1000);
    }
  }

  public static onBuyingVowel() {
    Application.deactivateScreen(GameScreen.CHOICES);
    Application.state = GameState.BUYING_VOWEL;
    Application.model.setCurrentPrizeCredit(0);

    this.setStatusMessage(`Pick a vowel, ${Application.model.getCurrentPlayer().name}, for ${Model.costOfVowel.toString()} credit.`);

    Application.activateScreen(GameScreen.LETTERS);
  }

  public static onVowelBought(letter: string) {
    Application.deactivateScreen(GameScreen.LETTERS);

    Application.model.getCurrentPlayer().prize -= Model.costOfVowel;

    if (Application.model.isLetterFoundAndHidden(letter)) {
      Application.setStatusMessage(`Good, letter ${letter} is in the solution!`);
      Application.model.markLetterGuessed(letter);
      Application.onRevealingBlocks(letter);
    } else {
      Application.setStatusMessage(`Letter ${letter} is not in the solution. Next player.`);
      Application.model.markLetterGuessed(letter);
      setTimeout(() => {
        Application.onNextPlayer();
      }, 2500);
    }
  }

  public static onAttemptToSolve(CPUCorrect: boolean) {
    Application.deactivateScreen(GameScreen.CHOICES);
    Application.state = GameState.ENTERING_SOLUTION;

    this.setStatusMessage("I'm listening, can you tell me what the solution is?");

    if (CPUCorrect === null) {
      Application.activateScreen(GameScreen.ENTRY);
    } else if (CPUCorrect === true) {
      setTimeout(() => {
        Application.onSolutionSubmitted(Application.model.getSolution());
      }, 2000);
    } else {
      setTimeout(() => {
        Application.onSolutionSubmitted('');
      }, 2000);
    }
  }

  public static onSolutionSubmitted(solution: string) {
    Application.deactivateScreen(GameScreen.ENTRY);

    if (Application.model.solutionEqualsTo(solution)) {
      this.setStatusMessage("That is the correct answer!");
      Application.state = GameState.REVEAL_REMAINING_BLOCKS;
      Application.activateScreen(GameScreen.WALL);
    } else {
      Sound.playFX(SoundFX.BELL);
      this.setStatusMessage("I'm afraid that's not it. Next player.");
      setTimeout(() => {
        Application.onNextPlayer();
      }, 3000);
    }
  }

  public static onWon() {
    let player = Application.model.getCurrentPlayer();

    if (player.prize === 0) {
      this.setStatusMessage(`No one goes home empty-handed, ${player.name}! Get ready for the final round.`);
    } else {
      this.setStatusMessage(`Get ready for the final round!`);
    }

    setTimeout(() => {
      if (player.prize === 0) {
        player.prize = 500;
        (Application.screen[GameScreen.CONTESTANTS] as ContestantsScreen).updatePrize(Application.model);
      }

      Application.onShowdown();
    }, 5000);
  }

  public static onShowdown() {
    Application.state = GameState.SHOWDOWN_PICK_A_DOOR;

    Application.deactivateAllScreen();
    Application.activateScreen(GameScreen.CONTESTANTS);
    Application.activateScreen(GameScreen.DOORS);
  }

  public static getGrandTotalPrize(): number {
    return Application.model.getCurrentPlayer().prize;
  }

  public static isCPUPlayerWon(): boolean {
    return Application.model.getCurrentPlayer().name !== 'Player';
  }

  public static setStatusMessage(text: string) {
    let screen = Application.screen[GameScreen.WHEEL] as WheelScreen;
    screen.setStatusMessage(text);
  }

  public static isLetterAlreadyGuessed(letter: string) {
    return Application.model.isLetterAlreadyGuessed(letter);
  }

  private onDeviceOrientation() {
    let portrait: boolean = window.innerHeight > window.innerWidth;

    let headerElement: HTMLElement = document.querySelector('header');
    headerElement.style.display = portrait ? 'block' : 'none';
  }

  public static onToggleSound(): boolean {
    let userData = this.data.getObjectByKey('user');
    let soundOn: string = userData['sound'] as string;
    userData['sound'] = soundOn === '1' ? '0' : '1';
    this.data.save();

    return userData['sound'] === '1';
  }

  public static isSoundOn(): boolean {
    return Application.data.getObjectByKey('user')['sound'] === '1';
  }
}

export enum GameScreen {
  TITLE = 'ti',
  CONTESTANTS = 'co',
  LETTERS = 'le',
  WALL = 'wa',
  WHEEL = 'wh',
  CHOICES = 'ch',
  ENTRY = 'en',
  DOORS = 'do'
}

export enum GameState {
  TITLE,
  PICKING_PLAYERS,
  SPIN,
  GUESSING_LETTER,
  REVEALING_BLOCKS,
  END_OF_ROUND_CHOICE,
  ENTERING_SOLUTION,
  REVEAL_REMAINING_BLOCKS,
  BUYING_VOWEL,
  SHOWDOWN_PICK_A_DOOR
}
