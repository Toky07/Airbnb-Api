import { Inject, Module, OnModuleInit } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '@src/modules/authentication/auth.module';
import { EnsureAuthHasRoleService } from '@src/modules/authentication/applications/services/ensure-auth-has-role.service';
import { MailModule } from '@src/modules/mail/mail.module';
import { MailService } from '@src/modules/mail/contracts';
import { UserModule } from '@src/modules/user/user.module';
import {
  USER_REPOSITORY,
  type IUserRepository,
} from '@src/modules/user/contracts';
import { CommandBus } from '@src/shared/useCase/bus/bus';
import { QueryBus } from '@src/shared/useCase/bus/query-bus';
import { HOST_APPLICATION_REPOSITORY } from './domain/repositories/host-application.repository';
import type { IHostApplicationRepository } from './domain/repositories/host-application.repository';
import { HostApplicationOrmEntity } from './infrastructure/entities/host-application.orm-entity';
import { HostApplicationRepository } from './infrastructure/repositories/host-application.repository';
import { HostApplicationController } from './interfaces/http/host-application.controller';
import { HostApplicationBootstrap } from './host-application.bootstrap';
import { SubmitHostApplicationCommand } from './applications/useCase/commands/SubmitHostApplicationCommand';
import { ReviewHostApplicationCommand } from './applications/useCase/commands/ReviewHostApplicationCommand';
import { GetMyHostApplicationQuery } from './applications/useCase/queries/GetMyHostApplicationQuery';
import { ListHostApplicationsQuery } from './applications/useCase/queries/ListHostApplicationsQuery';
import { ListHostsQuery } from './applications/useCase/queries/ListHostsQuery';

@Module({
  imports: [
    TypeOrmModule.forFeature([HostApplicationOrmEntity]),
    UserModule,
    AuthModule,
    MailModule,
  ],
  controllers: [HostApplicationController],
  providers: [
    HostApplicationRepository,
    {
      provide: HOST_APPLICATION_REPOSITORY,
      useClass: HostApplicationRepository,
    },
  ],
  exports: [HOST_APPLICATION_REPOSITORY],
})
export class HostApplicationModule implements OnModuleInit {
  constructor(
    @Inject(HOST_APPLICATION_REPOSITORY)
    private readonly hostApplicationRepository: IHostApplicationRepository,
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    private readonly ensureAuthHasRole: EnsureAuthHasRoleService,
    private readonly mailService: MailService,
  ) {}

  onModuleInit() {
    const bootstrap = HostApplicationBootstrap.create({
      hostApplicationRepository: this.hostApplicationRepository,
      userRepository: this.userRepository,
      ensureAuthHasRole: this.ensureAuthHasRole,
      mailService: this.mailService,
    });

    CommandBus.register(
      SubmitHostApplicationCommand,
      bootstrap.submitHostApplicationCommandHandler,
    );
    CommandBus.register(
      ReviewHostApplicationCommand,
      bootstrap.reviewHostApplicationCommandHandler,
    );
    QueryBus.register(
      GetMyHostApplicationQuery,
      bootstrap.getMyHostApplicationQueryHandler,
    );
    QueryBus.register(
      ListHostApplicationsQuery,
      bootstrap.listHostApplicationsQueryHandler,
    );
    QueryBus.register(ListHostsQuery, bootstrap.listHostsQueryHandler);
  }
}
