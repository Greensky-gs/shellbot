import { ColorCodes } from "../../types/utils";
import { chalk } from "../../utils/chalk";
import { errorDomain, errorType, ShellError } from "./base";

class AbstractStructError extends ShellError{
    constructor(domain: errorDomain, struct: string, message: string) {
        super(domain, errorType.Internal, `Structure ${chalk(struct.toUpperCase(), ColorCodes.Yellow)} : ${message}`);
    }
}

export class MixedQueueUnqueueEmptyQueue extends AbstractStructError {
    constructor() {
        super(errorDomain.Runtime, 'MixedQueue', `Tried to unqueue an empty mixedqueue`);
    }
}
export class MixedQueueViewEmptyQueue extends AbstractStructError {
    constructor() {
        super(errorDomain.Runtime, 'mixedqueue', "Tried to get the peak of an empty mixedqueue");
    }
}
export class BijectionInvalidLength extends AbstractStructError {
    constructor(ens: number, res: number) {
        super(errorDomain.Runtime, "bijection", `Ens is of size ${chalk(ens.toString(), ColorCodes.Yellow)} while res is of size ${chalk(res.toString(), ColorCodes.Yellow)}`);
    }
}