import { Property } from "../../domain/entities/property.entity";
import { IPropertyRepository } from "../../domain/repositories/property.repository";
import { PropertyOutput } from "../dto/property.outup";
import { UpdatePropertyUseCase } from "./updateProperty.usecase";

const repository = {
    findById: async (id: number): Promise<Property|null> => {
        return {
            id: 1,
            name: 'Test Property',
            description: 'Test Description',
            rooms: [],
            address: 'Test Address',
            city: 'Test City',
            country: 'Test Country',
            latitude: 0,
            longitude: 0,
            checkInTime: 'Test CheckInTime',
            checkOutTime: 'Test CheckOutTime',
            ownerId: 1,
        };
    },
    update: async (property: Property): Promise<Property> => {
        return property;
    }
} as IPropertyRepository;

describe('UpdatePropertyUseCase', () => {
    it('should update a property', async () => {
        const updatePropertyUseCase = new UpdatePropertyUseCase(repository);
        const result = await updatePropertyUseCase.execute(1, {
            name: 'Test Property',
            description: 'Test Description',
            address: 'Test Address',
            city: 'Test City',
            country: 'Test Country',
            latitude: 0,
            longitude: 0,
            checkInTime: 'Test CheckInTime',
            checkOutTime: 'Test CheckOutTime',
            ownerId: 1,
        });

        expect(result).toBeInstanceOf(PropertyOutput);
        expect(result.name).toBe('Test Property');
        expect(result.description).toBe('Test Description');
        expect(result.address).toBe('Test Address');
        expect(result.city).toBe('Test City');
        expect(result.country).toBe('Test Country');
    });
});
