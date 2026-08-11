import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Req,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { JwtPayload } from '../../../authentication/contracts';
import { RequirePermissions } from '../../../authentication/contracts';
import type { CreatePropertyDto } from '../../../properties/contracts';
import { parsePropertyBody } from '../../../properties/contracts';
import type { UploadFile } from '../../../media/contracts';
import { ListPropertyTypeOptionsQuery } from '../../../properties/contracts';
import { CommandBus } from '../../../../shared/useCase/bus/bus';
import { QueryBus } from '../../../../shared/useCase/bus/query-bus';
import { AMENITY_SCOPE } from '../../../amenity/contracts';
import type { SyncAmenitiesDto } from '../../../amenity/contracts';
import { ApiJwtAuth } from '../../../../shared/swagger/swagger.decorators';
import { SWAGGER_TAGS } from '../../../../shared/swagger/swagger.constants';
import { ListHostPropertiesQuery } from '../../applications/useCase/queries/ListHostPropertiesQuery';
import { GetHostPropertyQuery } from '../../applications/useCase/queries/GetHostPropertyQuery';
import { CreateHostPropertyCommand } from '../../applications/useCase/commands/CreateHostPropertyCommand';
import { UpdateHostPropertyCommand } from '../../applications/useCase/commands/UpdateHostPropertyCommand';
import { ListHostAmenityOptionsQuery } from '../../applications/useCase/queries/ListHostAmenityOptionsQuery';
import { GetHostPropertyAmenitiesQuery } from '../../applications/useCase/queries/GetHostPropertyAmenitiesQuery';
import { SyncHostPropertyAmenitiesCommand } from '../../applications/useCase/commands/SyncHostPropertyAmenitiesCommand';

@ApiTags(SWAGGER_TAGS.HOST)
@ApiJwtAuth()
@Controller('host')
export class HostPropertiesController {
  @Get('properties')
  @RequirePermissions('host.property.read')
  @ApiOperation({ summary: 'Mes établissements' })
  properties(@Req() request: { user: JwtPayload }) {
    return QueryBus.execute(new ListHostPropertiesQuery(request.user));
  }

  @Get('properties/:id')
  @RequirePermissions('host.property.read')
  @ApiOperation({ summary: "Détail d'un de mes établissements" })
  property(@Req() request: { user: JwtPayload }, @Param('id') id: number) {
    return QueryBus.execute(new GetHostPropertyQuery(request.user, Number(id)));
  }

  @Post('properties')
  @RequirePermissions('host.property.create')
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Créer un établissement' })
  @UseInterceptors(FileInterceptor('image'))
  createProperty(
    @Req() request: { user: JwtPayload },
    @Body() body: CreatePropertyDto | Record<string, unknown>,
    @UploadedFile() image?: UploadFile,
  ) {
    const dto =
      typeof (body as CreatePropertyDto).latitude === 'number'
        ? (body as CreatePropertyDto)
        : parsePropertyBody(body);
    const { ownerId: _ownerId, ...fields } = dto;
    return CommandBus.execute(
      new CreateHostPropertyCommand(request.user, fields, image),
    );
  }

  @Put('properties/:id')
  @RequirePermissions('host.property.update')
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Modifier un établissement' })
  @UseInterceptors(FileInterceptor('image'))
  updateProperty(
    @Req() request: { user: JwtPayload },
    @Param('id') id: number,
    @Body() body: CreatePropertyDto | Record<string, unknown>,
    @UploadedFile() image?: UploadFile,
  ) {
    const dto =
      typeof (body as CreatePropertyDto).latitude === 'number'
        ? (body as CreatePropertyDto)
        : parsePropertyBody(body);
    const { ownerId: _ownerId, ...fields } = dto;
    return CommandBus.execute(
      new UpdateHostPropertyCommand(request.user, Number(id), fields, image),
    );
  }

  @Get('property-types/options')
  @RequirePermissions('host.property.read')
  propertyTypeOptions() {
    return QueryBus.execute(new ListPropertyTypeOptionsQuery());
  }

  @Get('amenities/property/options')
  @RequirePermissions('host.property.read')
  propertyAmenityOptions() {
    return QueryBus.execute(
      new ListHostAmenityOptionsQuery(AMENITY_SCOPE.PROPERTY),
    );
  }

  @Get('properties/:id/amenities')
  @RequirePermissions('host.property.read')
  propertyAmenities(
    @Req() request: { user: JwtPayload },
    @Param('id') id: number,
  ) {
    return QueryBus.execute(
      new GetHostPropertyAmenitiesQuery(request.user, Number(id)),
    );
  }

  @Put('properties/:id/amenities')
  @RequirePermissions('host.property.update')
  syncPropertyAmenities(
    @Req() request: { user: JwtPayload },
    @Param('id') id: number,
    @Body() body: SyncAmenitiesDto,
  ) {
    return CommandBus.execute(
      new SyncHostPropertyAmenitiesCommand(request.user, Number(id), body),
    );
  }
}
