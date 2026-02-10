export const BASEURL = 'http://localhost:3000/api';
export const LOGIN_ENDPOINT = `${BASEURL}/auth-service/login`;
export const PRODUCTS_ENDPOINT = `${BASEURL}/product-service/products`;
export const PRODUCT_DETAIL_ENDPOINT = (id) => `${BASEURL}/product-service/products/${id}`;
export const ADD_TO_CART_ENDPOINT = `${BASEURL}/cart-service/cart/add`;
export const GET_CART_ENDPOINT = (userId) => `${BASEURL}/cart-service/cart/${userId}`;
export const REMOVE_CART_ITEM_ENDPOINT = `${BASEURL}/cart-service/cart/remove`;
export const CLEAR_CART_ENDPOINT = (userId) => `${BASEURL}/cart-service/cart/${userId}`;
export const PLACE_ORDER_ENDPOINT = `${BASEURL}/order-service/order/place`;