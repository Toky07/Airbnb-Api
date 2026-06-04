export type CreatePropertyTypeDto = {
  name: string;
  sortOrder?: number;
  isActive?: boolean;
};

export type UpdatePropertyTypeDto = {
  name?: string;
  sortOrder?: number;
  isActive?: boolean;
};
