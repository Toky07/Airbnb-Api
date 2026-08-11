import { AuthEntity } from '@src/modules/authentication/infrastructure/entity/auth.entity';
import { UserEntity } from '@src/modules/user/infrastructure/entities/user.entity';
import { Role } from '@src/modules/authentication/infrastructure/entity/role.entity';
import { PermissionEntity } from '@src/modules/authentication/infrastructure/entity/permission.entity';
import { PropertyEntity } from '@src/modules/properties/infrastructure/entities/property-entity.entity';
import { PropertyTypeEntity } from '@src/modules/properties/infrastructure/entities/property-type.entity';
import { RoomEntity } from '@src/modules/rooms/infrastructure/entities/room.entity';
import { RoomTypeEntity } from '@src/modules/rooms/infrastructure/entities/room-type.entity';
import { RoomBlockedDateOrmEntity } from '@src/modules/rooms/infrastructure/entities/room-blocked-date.orm-entity';
import { RoomRateOverrideOrmEntity } from '@src/modules/rooms/infrastructure/entities/room-rate-override.orm-entity';
import { MediaOrmEntity } from '@src/modules/media/infrastructure/entities/media-orm.entity';
import { EmailOrmEntity } from '@src/modules/mail/infrastructure/entities/email.orm-entity';
import { PasswordSetupTokenOrmEntity } from '@src/modules/authentication/infrastructure/entities/password-setup-token.orm-entity';
import { PasswordResetTokenOrmEntity } from '@src/modules/authentication/infrastructure/entities/password-reset-token.orm-entity';
import { PaymentOrmEntity } from '@src/modules/payment/infrastructure/entities/payment.orm-entity';
import { ReservationOrmEntity } from '@src/modules/reservation/infrastructure/entities/reservation.orm-entity';
import { ReservationItemOrmEntity } from '@src/modules/reservation/infrastructure/entities/reservation-item.orm-entity';
import { CartOrmEntity } from '@src/modules/cart/infrastructure/entities/cart.orm-entity';
import { CartItemOrmEntity } from '@src/modules/cart/infrastructure/entities/cart-item.orm-entity';
import { AmenityOrmEntity } from '@src/modules/amenity/infrastructure/entities/amenity.orm-entity';
import { PropertyAmenityOrmEntity } from '@src/modules/amenity/infrastructure/entities/property-amenity.orm-entity';
import { RoomAmenityOrmEntity } from '@src/modules/amenity/infrastructure/entities/room-amenity.orm-entity';
import { InvoiceOrmEntity } from '@src/modules/invoice/infrastructure/entities/invoice.orm-entity';
import { InvoiceSequenceOrmEntity } from '@src/modules/invoice/infrastructure/entities/invoice-sequence.orm-entity';
import { ConversationOrmEntity } from '@src/modules/messaging/infrastructure/entities/conversation.orm-entity';
import { MessageOrmEntity } from '@src/modules/messaging/infrastructure/entities/message.orm-entity';
import { FavoriteOrmEntity } from '@src/modules/favorite/infrastructure/entities/favorite.orm-entity';
import { ReviewOrmEntity } from '@src/modules/review/infrastructure/entities/review.orm-entity';

export const TYPEORM_ENTITIES = [
  AuthEntity,
  UserEntity,
  Role,
  PermissionEntity,
  PropertyEntity,
  PropertyTypeEntity,
  RoomEntity,
  RoomTypeEntity,
  RoomBlockedDateOrmEntity,
  RoomRateOverrideOrmEntity,
  MediaOrmEntity,
  EmailOrmEntity,
  PasswordSetupTokenOrmEntity,
  PasswordResetTokenOrmEntity,
  PaymentOrmEntity,
  ReservationOrmEntity,
  ReservationItemOrmEntity,
  CartOrmEntity,
  CartItemOrmEntity,
  AmenityOrmEntity,
  PropertyAmenityOrmEntity,
  RoomAmenityOrmEntity,
  InvoiceOrmEntity,
  InvoiceSequenceOrmEntity,
  ConversationOrmEntity,
  MessageOrmEntity,
  FavoriteOrmEntity,
  ReviewOrmEntity,
];
