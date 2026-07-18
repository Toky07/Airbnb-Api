export type SendAccountInvitationCommandPayload = {
  userId: number;
  sourceModule?: string;
};

export class SendAccountInvitationCommand {
  constructor(public readonly options: SendAccountInvitationCommandPayload) {}
}
