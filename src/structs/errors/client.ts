import { errorDomain, errorType, ShellError } from "./base";

class ShellClientError extends ShellError {
    constructor(message: string) {
        super(errorDomain.Runtime, errorType.DiscordAPI, message);
    }
}

export class ShellClientChatInputDeploymentErrors extends ShellClientError {
    constructor(exception: any) {
        super(`chat inputs deployments failed.\nRejection : ${exception}`);
    }
}