import { Body, Controller, Delete, Get, Param, Post, Put } from "@nestjs/common";
import { ListPropertyUseCase } from "../../applications/useCase/listProperty.usecase";
import { PropertyOutput } from "../../applications/dto/property.outup";
import { FindOnePropertyUseCase } from "../../applications/useCase/findOneProperty.usecase";
import type { CreatePropertyDto } from "../../applications/dto/createProperty.dto";
import { CreatePropertyUseCase } from "../../applications/useCase/createProperty.usecase";
import { UpdatePropertyUseCase } from "../../applications/useCase/updateProperty.usecase";
import { DeletePropertyUseCase } from "../../applications/useCase/deleteProperty.usecase";

@Controller('properties')
export class PropertyController {
    constructor(
        private readonly listePropertyUseCase: ListPropertyUseCase,
        private readonly findPropertyUseCase: FindOnePropertyUseCase, 
        private readonly createPropertyUseCase: CreatePropertyUseCase,
        private readonly updatePropertyUseCase: UpdatePropertyUseCase,
        private readonly deletePropertyUseCase: DeletePropertyUseCase,
    ) {}

    @Get()
    findAll(): Promise<PropertyOutput[]> {
        return this.listePropertyUseCase.execute();
    }

    @Get(':id')
    findById(@Param('id') id: number): Promise<PropertyOutput> {
        return this.findPropertyUseCase.execute(id);
    }

    @Post()
    create(@Body() createPropertyDto: CreatePropertyDto): Promise<PropertyOutput> {
        return this.createPropertyUseCase.execute(createPropertyDto);
    }

    @Put(':id')
    update(@Param('id') id: number, @Body() updatePropertyDto: CreatePropertyDto): Promise<PropertyOutput> {
        return this.updatePropertyUseCase.execute(id, updatePropertyDto);
    }

    @Delete(':id')
    delete(@Param('id') id: number): Promise<boolean> {
        return this.deletePropertyUseCase.execute(id);
    }
}