import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '@src/modules/authentication/contracts';
import { SensitiveRouteThrottle } from '@src/shared/decorators/sensitive-route-throttle.decorator';
import { CONTACT_THROTTLE } from '@src/config/throttle.config';
import { CommandBus } from '@src/shared/useCase/bus/bus';
import { SWAGGER_TAGS } from '@src/shared/swagger/swagger.constants';
import { SubmitContactMessageDto } from '@src/modules/mail/applications/dto/submit-contact-message.dto';
import { ContactMessageOutput } from '@src/modules/mail/applications/dto/contact-message.output';
import { SubmitContactMessageCommand } from '@src/modules/mail/applications/useCase/commands/SubmitContactMessageCommand';

@ApiTags(SWAGGER_TAGS.CONTACT)
@Controller('contact')
export class ContactController {
  @Post()
  @Public()
  @SensitiveRouteThrottle(CONTACT_THROTTLE)
  @ApiOperation({ summary: 'Envoyer un message au support (public)' })
  submit(@Body() dto: SubmitContactMessageDto): Promise<ContactMessageOutput> {
    return CommandBus.execute(new SubmitContactMessageCommand(dto));
  }
}
