import React from "reactn"

export interface Product {
  id?: number,
  msa_id: string,
  name: string,
  description: string,
  unit_price: number,
  unit_type: string,
  has_package: boolean,
  has_big_package: boolean,
  package_price: number,
  big_package_price: number,
  package_size: number,
  big_package_size: number,
  images: Array<string>,
  categories: Array<string>
}

export interface UserInfo {
  id?: number,
  business: string,
  name: string,
  street_address: string,
  city: string,
  province: string,
  postal_code: string,
  email: string,
  phone: string,
  username: string,
  password: string,
  is_admin: boolean,
  created_at?: Date
  iat?: number,
  exp?: number
}

export interface Invoice {
  id: number,
  user_id: number,
  total_price: number,
  created_at: Date,
  items: Array<Item>,
  sent: boolean
}

export interface Item {
  product: Product,
  amount: number, 
  package_type: string,
  price?: number
}

export interface Cart {
  [key: string]: Item
}

export interface AddItemButtonProps {
  product: Product,
  cart: Cart,
  setCart: (cart: Cart) => void
}

export interface ProductCardProps {
  product: Product,
  cart: Cart,
  setCart: (cart: Cart) => void
}

export interface CartModalProps {
  onBlur: () => void
}

export interface AuthRouteProps {
  children: React.ReactNode,
  isAdmin?: boolean
}

export interface ChangePasswordModalProps {
  closeModal?: () => void;
}

export interface Category {
  id: number,
  name: string,
  parent_id: number | null,
  is_leaf: boolean,
  order_index: number
}

export interface CategoryTree {
  id: number,
  name: string,
  parent_id: number | null,
  is_leaf: boolean,
  order_index: number,
  children?: Array<CategoryTree>
}

export interface CategoryItemProps {
  category: CategoryTree,
  setEditCategory: (category: Category | null) => void,
  fetchUpdate: () => Promise<void>
}

export interface AddCategoryProps {
  closeModal: () => void
  categories: Array<Category>, 
  editCategory: Category | null,
  fetchUpdate: () => Promise<void>
}

declare module 'reactn/default' {
  export interface State {
    userInfo: UserInfo;
    token: string | null;
    cart: Cart;
    loading: boolean;
  }
}