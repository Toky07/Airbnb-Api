import { beforeEach, describe, expect, it } from 'vitest';
import { Property } from "../../domain/entities/property.entity";
import { IPropertyRepository } from "../../domain/repositories/property.repository";
import { PropertyOutput } from "../dto/property.outup";
import { UpdatePropertyUseCase } from "./updateProperty.usecase";
import {
    mockPropertyMediaPresenter,
    mockSaveEntityMedias,
} from "./test-helpers/property-usecase.mocks";

let lastUpdated: Property | null = null;

const repository = {
    findById: async (id: number): Promise<Property|null> => {
        return lastUpdated ?? {
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
            propertyTypeId: null,
            propertyType: null,
        };
    },
    update: async (property: Property): Promise<Property> => {
        lastUpdated = property;
        return property;
    },
} as IPropertyRepository;

describe('UpdatePropertyUseCase', () => {
    beforeEach(() => {
        lastUpdated = null;
    });

    it('should update a property', async () => {
        const updatePropertyUseCase = new UpdatePropertyUseCase(
            repository,
            mockSaveEntityMedias,
            mockPropertyMediaPresenter,
        );
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
        expect(result.image).toBeNull();
    });

    it('persiste le type d’établissement', async () => {
        const updatePropertyUseCase = new UpdatePropertyUseCase(
            repository,
            mockSaveEntityMedias,
            mockPropertyMediaPresenter,
        );
        await updatePropertyUseCase.execute(1, {
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
            propertyTypeId: 3,
        });

        expect(lastUpdated?.propertyTypeId).toBe(3);
    });
});
