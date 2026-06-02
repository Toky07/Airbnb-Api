import { IPropertyRepository } from "../../domain/repositories/property.repository";
import { DeletePropertyUseCase } from "./deleteProperty.usecase";
import { mockDeleteMediasByEntity } from "./test-helpers/property-usecase.mocks";

const repository = {
    delete: async (id: number): Promise<boolean> => {
        return true;
    },
    findById: async (id: number) => {
        return {
            id: 1,
            name: 'Test Property',
            description: 'Test Description',
            type: 'Test Type',
        };
    }
} as IPropertyRepository;

describe('DeletePropertyUseCase', () => {
    it('should delete a property', async () => {
        const deletePropertyUseCase = new DeletePropertyUseCase(
            repository,
            mockDeleteMediasByEntity,
        );
        const result = await deletePropertyUseCase.execute(1);
        expect(result).toBe(true);
    });

    it('should throw an error if the property is not found', async () => {
        const deletePropertyUseCase = new DeletePropertyUseCase(
            repository,
            mockDeleteMediasByEntity,
        );
        vi.spyOn(repository, 'findById').mockResolvedValue(null);
        await expect(deletePropertyUseCase.execute(2)).rejects.toThrow('Property not found');
    });
});
