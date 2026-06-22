export type CommandHandler = {
    execute(command: any): Promise<any>;
};
