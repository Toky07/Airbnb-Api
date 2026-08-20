import type { HostApplicationStatus } from '@src/modules/host-application/domain/constants/host-application-status.constant';
import { HostApplication } from '@src/modules/host-application/domain/entities/host-application.entity';
import { HostApplicationOrmEntity } from '@src/modules/host-application/infrastructure/entities/host-application.orm-entity';

export class HostApplicationMapper {
  static toDomain(entity: HostApplicationOrmEntity): HostApplication {
    return new HostApplication(
      entity.userId,
      entity.city,
      entity.message,
      entity.status as HostApplicationStatus,
      entity.propertyName,
      entity.reviewComment,
      entity.reviewedByAuthId,
      entity.reviewedAt,
      entity.id,
      entity.createdAt,
      entity.updatedAt,
    );
  }

  static toEntity(application: HostApplication): HostApplicationOrmEntity {
    const entity = new HostApplicationOrmEntity();
    if (application.id) {
      entity.id = application.id;
    }
    entity.userId = application.userId;
    entity.city = application.city;
    entity.propertyName = application.propertyName;
    entity.message = application.message;
    entity.status = application.status;
    entity.reviewComment = application.reviewComment;
    entity.reviewedByAuthId = application.reviewedByAuthId;
    entity.reviewedAt = application.reviewedAt;
    return entity;
  }
}
