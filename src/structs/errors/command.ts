import { ColorCodes, ColorFonts } from "../../types/utils";
import { chalk } from "../../utils/chalk";
import { errorDomain, errorType, ShellError, ShellInternalNeverError } from "./base";

class ShellCommandError extends ShellError {
    constructor(domain: errorDomain, type: errorType, cmdName: string, message: string) {
        super(domain, type, `Command ${chalk(cmdName, ColorCodes.Red, ColorFonts.Light)} : ${message}`);
    }
}

export class ShellArgsBuildMandatoryOrderError extends ShellCommandError {
    constructor(cmdName: string, argumentName: string) {
        super(errorDomain.Prerun, errorType.Internal, cmdName, `Mandatory arguments must come first\nThrown by ${chalk(argumentName, ColorCodes.Yellow)}`);
    }
}
export class ShellCommandPresenceArgumentError extends ShellCommandError {
    constructor(cmdName: string, argName: string) {
        super(errorDomain.Prerun, errorType.Internal, cmdName, `Argument ${chalk(argName, ColorCodes.Yellow)} is of type presence, wich is impossible`);
    }
}
export class ShellCommandArgumentUnknownType extends ShellCommandError {
    constructor(cmdName: string, argName: string, type: string) {
        super(errorDomain.Prerun, errorType.WrongResult, cmdName, `Argument ${chalk(argName, ColorCodes.Yellow)} has an incorrect type (${chalk(type, ColorCodes.Red, ColorFonts.Light)})`);
    }
}
export class ShellCommandOptionUnknownType extends ShellCommandError {
    constructor(cmdName: string, optName: string, type: string) {
        super(errorDomain.Prerun, errorType.WrongResult, cmdName, `Option ${chalk(optName, ColorCodes.Yellow)} has an incorrect type (${chalk(type, ColorCodes.Red, ColorFonts.Light)})`);
    }
}
export class ShellCommandOptsFinderTypeError extends ShellInternalNeverError {
    constructor(optionName: string, got: string, expected: string, file: string) {
        super(`Tried to get argument ${chalk(optionName, ColorCodes.Yellow)} of type ${chalk(expected, ColorCodes.Red, ColorFonts.Light)} but got type ${chalk(got, ColorCodes.Red, ColorFonts.Light)}`, file);
    }
}