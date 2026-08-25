
export interface AddCartItemDto {
  productId: string; // uuid
  quantity: number;
}

export interface UpdateCartItemDto {
  quantity: number;
}