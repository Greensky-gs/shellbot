import { ColorCodes } from "../../types/utils";
import { chalk } from "../../utils/chalk";
import { errorDomain, errorType, ShellError } from "./base";

class AbstractStructError extends ShellError{
    constructor(domain: errorDomain, struct: string, message: string) {
        super(domain, errorType.Internal, `Structure ${chalk(struct, ColorCodes.Yellow)} : ${message}`);
    }
}

export class MixedQueueUnqueueEmptyQueue extends AbstractStructError {
    constructor() {
        super(errorDomain.Runtime, 'MIXEDQUEUE', `Tried to unqueue an empty mixedqueue`);
    }
}
export class MixedQueueViewEmptyQueue extends AbstractStructError {
    constructor() {
        super(errorDomain.Runtime, 'MIXEDQUEUE', "Tried to get the peak of an empty mixedqueue");
    }
}