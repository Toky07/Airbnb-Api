export type CreateRoomTypeDto = {
  name: string;
  sortOrder?: number;
  isActive?: boolean;
};

export type UpdateRoomTypeDto = {
  name?: string;
  sortOrder?: number;
  isActive?: boolean;
};
