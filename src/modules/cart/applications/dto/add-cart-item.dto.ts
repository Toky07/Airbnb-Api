import {
  IsDateString,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  MinLength,
  ValidateIf,
} from 'class-validator';
import { CART_ITEM_TYPE } from '@src/modules/cart/domain/constants/cart-item-type.constant';

export class AddCartItemDto {
  @IsIn([CART_ITEM_TYPE.RESERVATION])
  itemType: (typeof CART_ITEM_TYPE)[keyof typeof CART_ITEM_TYPE];

  @ValidateIf(
    (dto: AddCartItemDto) => dto.itemType === CART_ITEM_TYPE.RESERVATION,
  )
  @IsInt()
  @Min(1)
  roomId?: number;

  @ValidateIf(
    (dto: AddCartItemDto) => dto.itemType === CART_ITEM_TYPE.RESERVATION,
  )
  @IsDateString()
  startDate?: string;

  @ValidateIf(
    (dto: AddCartItemDto) => dto.itemType === CART_ITEM_TYPE.RESERVATION,
  )
  @IsDateString()
  endDate?: string;

  @ValidateIf(
    (dto: AddCartItemDto) => dto.itemType === CART_ITEM_TYPE.RESERVATION,
  )
  @IsInt()
  @Min(1)
  guestCount?: number;

  @ValidateIf((dto: AddCartItemDto) => dto.itemType === CART_ITEM_TYPE.SERVICE)
  @IsInt()
  @Min(1)
  serviceId?: number;

  @ValidateIf((dto: AddCartItemDto) => dto.itemType === CART_ITEM_TYPE.SERVICE)
  @IsInt()
  @Min(1)
  propertyId?: number;

  @ValidateIf((dto: AddCartItemDto) => dto.itemType === CART_ITEM_TYPE.SERVICE)
  @IsString()
  @MinLength(1)
  label?: string;

  @ValidateIf((dto: AddCartItemDto) => dto.itemType === CART_ITEM_TYPE.SERVICE)
  @IsNumber()
  @Min(0.01)
  unitPrice?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  quantity?: number;
}
