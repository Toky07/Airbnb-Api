import { Property } from "../../domain/entities/property.entity";
import { IPropertyRepository } from "../../domain/repositories/property.repository";
import { PropertyOutput } from "../dto/property.outup";
import { FindOnePropertyUseCase } from "./findOneProperty.usecase";

const repository = {
    findById: async (id: number): Promise<Property|null> => {
        return {
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
        };
    }
} as IPropertyRepository;

describe('FindOnePropertyUseCase', () => {
    it('should find a property', async () => {
        const findOnePropertyUseCase = new FindOnePropertyUseCase(repository);
        const result = await findOnePropertyUseCase.execute(1);
        expect(result).toBeInstanceOf(PropertyOutput);
    });

    it('should throw an error if the property is not found', async () => {
        vi.spyOn(repository, 'findById').mockResolvedValue(null);
        const findOnePropertyUseCase = new FindOnePropertyUseCase(repository);
        await expect(findOnePropertyUseCase.execute(2)).rejects.toThrow('Property not found');
        expect(repository.findById).toHaveBeenCalledWith(2);
    });
});
