import { Property } from "../../domain/entities/property.entity";
import { ListPropertyUseCase } from "./listProperty.usecase";
import { IPropertyRepository } from "../../domain/repositories/property.repository";

describe('ListPropertyUseCase', () => {
    const repository = {
        findAll: async (): Promise<Property[]> => {
            return [{
                id: 1,
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
                createdAt: new Date(),
                updatedAt: new Date(),
            }];
        },
    } as IPropertyRepository;

    it('should list properties', async () => {
        const listPropertyUseCase = new ListPropertyUseCase(repository);
        const result = await listPropertyUseCase.execute();
    
        expect(result).toHaveLength(1);
        expect(result[0].id).toBe(1);
        expect(result[0].name).toBe('Test Property');
        expect(result[0].description).toBe('Test Description');
        expect(result[0].type).toBe('Test Type');
        expect(result[0].address).toBe('Test Address');
        expect(result[0].city).toBe('Test City');
        expect(result[0].country).toBe('Test Country');
        expect(result[0].latitude).toBe(0);
        expect(result[0].longitude).toBe(0);
        expect(result[0].checkInTime).toBe('Test CheckInTime');
        expect(result[0].checkOutTime).toBe('Test CheckOutTime');
        expect(result[0].ownerId).toBe(1);
        expect(result[0].createdAt).toBeInstanceOf(Date);
        expect(result[0].updatedAt).toBeInstanceOf(Date);
    });
});
