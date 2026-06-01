import { Property } from "../../domain/entities/property.entity";
import { IPropertyRepository } from "../../domain/repositories/property.repository";
import { CreatePropertyUseCase } from "./createProperty.usecase";
import { PropertyOutput } from "../dto/property.outup";

const repository = {
    create: async (property: Property): Promise<Property> => {
        return property;
    }
} as IPropertyRepository;

describe('CreatePropertyUseCase', () => {
    it('should create a property', async () => {
        const createPropertyUseCase = new CreatePropertyUseCase(repository);
        const result = await createPropertyUseCase.execute({
            name: 'Test Property',
            description: 'Test Description',
            type: 'Test Type',
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
        expect(result.type).toBe('Test Type');
        expect(result.address).toBe('Test Address');
        expect(result.city).toBe('Test City');
        expect(result.country).toBe('Test Country');
        expect(result.latitude).toBe(0);
        expect(result.longitude).toBe(0);
        expect(result.checkInTime).toBe('Test CheckInTime');
        expect(result.checkOutTime).toBe('Test CheckOutTime');
        expect(result.ownerId).toBe(1);
    });
});