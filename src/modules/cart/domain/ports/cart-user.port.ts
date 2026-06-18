export const CART_USER_PORT = 'CART_USER_PORT';

export type CartUserSnapshot = {
  id: number;
};

export interface ICartUserPort {
  findByAuthId(authId: number): Promise<CartUserSnapshot | null>;
}
