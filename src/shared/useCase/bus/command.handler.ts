/** @deprecated Use ICommandHandler from command-handler.interface */
export type CommandHandler = {
  execute(command: unknown): Promise<unknown>;
};

export type { ICommandHandler } from './command-handler.interface';
