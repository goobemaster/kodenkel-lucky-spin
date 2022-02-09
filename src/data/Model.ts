import { CachedJSONData } from "./CachedJSONData";

export enum CPUChoice {
    SPIN_AGAIN,
    GUESS_RIGHT,
    GUESS_WRONG,
    BUY_VOWEL
}

export class Model {
    private readonly data: CachedJSONData;
    private static readonly names: string[] = [
        'Jessica',
        'Emma',
        'Olivia',
        'Alex',
        'Charles',
        'Riley'
    ];
    private static readonly letters: string[] = [
        'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O',
        'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'
    ];
    public static readonly vowels: string[] = [
        'A', 'E', 'I', 'O', 'U', 'Y'
    ];
    public static readonly costOfVowel: number = 500;
    private static readonly CPUAffinity: CPUAffinityDetails[] = [
        {skillLower: -1, skillUpper: 25, lettersGuessed: 14, list: [CPUChoice.SPIN_AGAIN, CPUChoice.BUY_VOWEL, CPUChoice.GUESS_RIGHT, CPUChoice.GUESS_WRONG]},
        {skillLower: -1, skillUpper: 25, lettersGuessed: 0, list: [CPUChoice.SPIN_AGAIN, CPUChoice.BUY_VOWEL, CPUChoice.GUESS_WRONG, CPUChoice.GUESS_RIGHT]},

        {skillLower: 25, skillUpper: 50, lettersGuessed: 14, list: [CPUChoice.BUY_VOWEL, CPUChoice.SPIN_AGAIN, CPUChoice.GUESS_RIGHT, CPUChoice.GUESS_WRONG]},
        {skillLower: 25, skillUpper: 50, lettersGuessed: 0, list: [CPUChoice.BUY_VOWEL, CPUChoice.SPIN_AGAIN, CPUChoice.GUESS_WRONG, CPUChoice.GUESS_RIGHT]},

        {skillLower: 50, skillUpper: 75, lettersGuessed: 8, list: [CPUChoice.SPIN_AGAIN, CPUChoice.BUY_VOWEL, CPUChoice.GUESS_RIGHT, CPUChoice.GUESS_WRONG]},
        {skillLower: 50, skillUpper: 75, lettersGuessed: 0, list: [CPUChoice.SPIN_AGAIN, CPUChoice.BUY_VOWEL, CPUChoice.GUESS_WRONG, CPUChoice.GUESS_RIGHT]},

        {skillLower: 75, skillUpper: 100, lettersGuessed: 6, list: [CPUChoice.BUY_VOWEL, CPUChoice.SPIN_AGAIN, CPUChoice.GUESS_RIGHT, CPUChoice.GUESS_WRONG]},
        {skillLower: 75, skillUpper: 100, lettersGuessed: 0, list: [CPUChoice.BUY_VOWEL, CPUChoice.SPIN_AGAIN, CPUChoice.GUESS_WRONG, CPUChoice.GUESS_RIGHT]}
    ];
 
    private solution: string;
    private solutionCategory: SolutionType;
    private lettersGuessed: string[];

    private humanPlayer: PlayerData;
    private cpu1Player: PlayerData;
    private cpu2Player: PlayerData;

    private currentPlayer: number;
    private currentPrizeCredit: number;
    private currentRoundPrizeCredit: number;
    private currentLetter: string;

    constructor(data: CachedJSONData) {
        this.data = data;
    }

    public reset() {
        // Solution
        let category: number = Math.floor(Math.random() * 100);
        if (category < 50) {
            this.solutionCategory = SolutionType.PROVERB;
        } else if (category >= 50 && category < 75) {
            this.solutionCategory = SolutionType.MOVIE;
        } else {
            this.solutionCategory = SolutionType.BAND;
        }

        let possibleSolutions: string[] = this.data.getArrayByKey(this.solutionCategory) as [];
        this.solution = possibleSolutions[Math.floor(Math.random() * possibleSolutions.length)].toUpperCase();

        // Letters
        this.lettersGuessed = [];

        // Player
        this.humanPlayer = {
            portrait: null,
            prize: 0,
            skill: null,
            name: 'Player'
        }

        // CPU Players
        let cpu1portrait: number = Math.floor(Math.random() * 5) + 1;
        let cpu2portrait: number = Math.floor(Math.random() * 5) + 1;
        while (cpu2portrait === cpu1portrait) {
            cpu2portrait = Math.floor(Math.random() * 5) + 1;
        }
        this.cpu1Player = {
            portrait: cpu1portrait,
            prize: 0,
            skill: Math.floor(Math.random() * 100),
            name: Model.names[cpu1portrait - 1]
        };
        this.cpu2Player = {
            portrait: cpu2portrait,
            prize: 0,
            skill: Math.floor(Math.random() * 100),
            name: Model.names[cpu2portrait - 1]
        };

        this.currentPlayer = -1;
    }

    public getPlayer(player: Player): PlayerData {
        switch (player) {
            case Player.CPU1:
                return this.cpu1Player;
            case Player.CPU2:
                return this.cpu2Player;
            default:
                return this.humanPlayer;
        }
    }

    public getCurrentPlayer(): PlayerData {
        return this.getPlayer(this.currentPlayer);
    }

    public nextPlayer() {
        this.currentPlayer++;
        if (this.currentPlayer > 2) this.currentPlayer = 0;

        this.currentPrizeCredit = 0;
        this.currentRoundPrizeCredit = 0;
    }

    public solutionEqualsTo(solution: string) {
        return this.solution.replace(/[^a-zA-Z]/gi, '').toUpperCase() === solution.replace(/[^a-zA-Z]/gi, '').toUpperCase();
    }

    public getSolution(): string {
        return this.solution;
    }

    public getSolutionCategory(): string {
        return this.solutionCategory.toString().toLocaleUpperCase();
    }

    public setCurrentPrizeCredit(credit: number) {
        this.currentPrizeCredit = credit;
        this.currentRoundPrizeCredit += credit;
    }

    public getCurrentPrizeCredit(): number {
        return this.currentPrizeCredit;
    }    

    public getCurrentRoundPrizeCredit(): number {
        return this.currentRoundPrizeCredit;
    }

    public static getLetters(): string[] {
        return Model.letters;
    }

    public isLetterAlreadyGuessed(letter: string) {
        return this.lettersGuessed.includes(letter);
    }

    public getRandomAvailableLetter(): string {
        let randomLetter = Model.letters[Math.floor(Math.random() * (Model.letters.length - 1))];
        while (this.lettersGuessed.includes(randomLetter)) {
            randomLetter = Model.letters[Math.floor(Math.random() * (Model.letters.length - 1))];
        }
        return randomLetter;
    }

    public getRandomAvailableVowel(): string {
        let randomLetter = Model.letters[Math.floor(Math.random() * (Model.letters.length - 1))];
        while (this.lettersGuessed.includes(randomLetter) || !Model.vowels.includes(randomLetter)) {
            randomLetter = Model.letters[Math.floor(Math.random() * (Model.letters.length - 1))];
        }
        return randomLetter;
    }

    public isLetterFoundAndHidden(letter: string): boolean {
        return this.solution.includes(letter) && !this.lettersGuessed.includes(letter);
    }

    public setCurrentLetter(letter: string) {
        this.currentLetter = letter;
    }

    public getCurrentLetterBlocks(): number[] {
        let blockIndexes: number[] = [];

        for (let i = 0; i < this.solution.length; i++) {
            if (this.solution.charAt(i) === this.currentLetter) blockIndexes.push(i);
        }

        return blockIndexes;
    }

    public getRemainingLetterBlocks(): number[] {
        let blockIndexes: number[] = [];

        Model.letters.forEach((letter) => {
            for (let i = 0; i < this.solution.length; i++) {
                if (this.solution.charAt(i) === letter) blockIndexes.push(i);
            }
        });

        return blockIndexes;
    }

    public markLetterGuessed(letter: string) {
        this.lettersGuessed.push(letter);
    }

    public isThereVowelsAvailable() {
        let vowelsGuessed = 0;

        Model.vowels.forEach((vowel) => {
            if (this.lettersGuessed.includes(vowel)) vowelsGuessed++;
        });

        return vowelsGuessed !== Model.vowels.length;
    }

    public getCPUChoice(skill: number, vowelBuyable: boolean, prize: number): CPUChoice {
        let lettersGuessed = this.lettersGuessed.length;
        let CPUAffinity: CPUAffinityDetails = Model.CPUAffinity[0];
        let CPUChoice: CPUChoice;
        let chance: number;

        Model.CPUAffinity.every((details) => {
            if (skill > details.skillLower && skill <= details.skillUpper && lettersGuessed >= details.lettersGuessed) {
                CPUAffinity = details;
                return false;
            }
            return true;
        });

        while (CPUChoice === undefined || !this.isValidCPUChoice(CPUChoice, vowelBuyable, prize)) {
            chance = Math.floor(Math.random() * 100);
            if (chance >= 0 && chance < 50) {
                CPUChoice = CPUAffinity.list[0];
            } else if (chance >= 50 && chance < 75) {
                CPUChoice = CPUAffinity.list[1];
            } else if (chance >= 75 && chance < 90) {
                CPUChoice = CPUAffinity.list[2];
            } else {
                CPUChoice = CPUAffinity.list[3];
            }
        }

        return CPUChoice;
    }

    private isValidCPUChoice(choice: CPUChoice, vowelBuyable: boolean, prize: number): boolean {
        if (choice === CPUChoice.BUY_VOWEL && (!vowelBuyable || (vowelBuyable && prize < Model.costOfVowel))) {
            return false;
        }
        return true;
    }

    public isSolvedByGuessingAllLetters(): boolean {
        let character: string;
        let characterCode: number;

        for (let i = 0; i < this.solution.length; i++) {
            character = this.solution.charAt(i);
            characterCode = this.solution.charCodeAt(i);

            if ((characterCode >= 65 && characterCode <= 90) && !this.lettersGuessed.includes(character)) {
                return false;
            }
        }

        return true;
    }
}

export enum Player {
    HUMAN,
    CPU1,
    CPU2
}

export enum SolutionType {
    PROVERB = 'proverb',
    MOVIE = 'movie',
    BAND = 'band'
}

export interface PlayerData {
    portrait: number;
    prize: number;
    skill: number;
    name: string;
}

interface CPUAffinityDetails {
    skillLower: number;
    skillUpper: number;
    lettersGuessed: number;
    list: CPUChoice[];
}