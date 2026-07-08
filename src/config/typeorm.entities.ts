import { AuthEntity } from '../modules/authentication/infrastructure/entity/auth.entity';
import { UserEntity } from '../modules/user/infrastructure/entities/user.entity';
import { Role } from '../modules/authentication/infrastructure/entity/role.entity';
import { PermissionEntity } from '../modules/authentication/infrastructure/entity/permission.entity';
import { PropertyEntity } from '../modules/properties/infrastructure/entities/property-entity.entity';
import { MediaOrmEntity } from '../modules/media/infrastructure/entities/media-orm.entity';
import { EmailOrmEntity } from '../modules/mail/infrastructure/entities/email.orm-entity';
import { PasswordSetupTokenOrmEntity } from '../modules/authentication/infrastructure/entities/password-setup-token.orm-entity';
import { PaymentOrmEntity } from '../modules/payment/infrastructure/entities/payment.orm-entity';
import { ReservationOrmEntity } from '../modules/reservation/infrastructure/entities/reservation.orm-entity';
import { ReservationItemOrmEntity } from '../modules/reservation/infrastructure/entities/reservation-item.orm-entity';
import { CartOrmEntity } from '../modules/cart/infrastructure/entities/cart.orm-entity';
import { CartItemOrmEntity } from '../modules/cart/infrastructure/entities/cart-item.orm-entity';
import { AmenityOrmEntity } from '../modules/amenity/infrastructure/entities/amenity.orm-entity';
import { PropertyAmenityOrmEntity } from '../modules/amenity/infrastructure/entities/property-amenity.orm-entity';
import { RoomAmenityOrmEntity } from '../modules/amenity/infrastructure/entities/room-amenity.orm-entity';
import { InvoiceOrmEntity } from '../modules/invoice/infrastructure/entities/invoice.orm-entity';

export const TYPEORM_ENTITIES = [
  AuthEntity,
  UserEntity,
  Role,
  PermissionEntity,
  PropertyEntity,
  MediaOrmEntity,
  EmailOrmEntity,
  PasswordSetupTokenOrmEntity,
  PaymentOrmEntity,
  ReservationOrmEntity,
  ReservationItemOrmEntity,
  CartOrmEntity,
  CartItemOrmEntity,
  AmenityOrmEntity,
  PropertyAmenityOrmEntity,
  RoomAmenityOrmEntity,
  InvoiceOrmEntity,
];
