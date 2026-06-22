import type { CommandHandler } from "./command.handler";

export class CommandBus {
    private handlers = new Map();

    register(commandName: any, handler: CommandHandler) {
        this.handlers.set(commandName, handler);   
    }

    async execute(command: any) {
        const handler = this.handlers.get(command.constructor.name);
        if (!handler) {
            throw new Error(`Handler for command ${command.constructor.name} not found`);
        }
        await handler.execute(command);
    }
}
