import { ColorCodes } from "../../types/utils";
import { chalk } from "../../utils/chalk";
import { errorDomain, errorType, ShellError } from "./base";

class ErrorEvent extends ShellError {
    constructor(type: errorType, message: string) {
        super(errorDomain.Prerun, type, message)
    }
}

export class ShellEventNoClientError extends ErrorEvent {
    constructor() {
        super(errorType.Internal, 'Client has not been gived');
    }
}
export class ShellInvalidEventError extends ErrorEvent {
    constructor(filePath: string) {
        super(errorType.Internal, `An event file has been badly defined.\nThrown for ${chalk(filePath, ColorCodes.Yellow)}`)
    }
}