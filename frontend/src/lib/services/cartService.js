import { ADD_TO_CART_ENDPOINT, GET_CART_ENDPOINT, REMOVE_CART_ITEM_ENDPOINT, CLEAR_CART_ENDPOINT, PRODUCT_DETAIL_ENDPOINT } from '../utils/endpoint.js';
import { cartStore } from '../stores/index.js';

export async function addToCart(userId, productId, quantity = 1) {
    try {
        cartStore.setLoading(true);
        cartStore.setError(null);

        const response = await fetch(ADD_TO_CART_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                userId,
                productId,
                quantity
            })
        });

        const data = await response.json();

        if (response.ok) {
            await getCart(userId);
            return { success: true, data };
        } else {
            const error = data.message || `Failed to add to cart: ${response.status}`;
            cartStore.setError(error);
            return { success: false, error };
        }
    } catch (error) {
        console.error('Error adding to cart:', error);
        const errorMessage = `Network error: ${error.message}`;
        cartStore.setError(errorMessage);
        return { success: false, error: errorMessage };
    } finally {
        cartStore.setLoading(false);
    }
}

export async function getCart(userId) {
    try {
        cartStore.setLoading(true);
        cartStore.setError(null);

        const response = await fetch(GET_CART_ENDPOINT(userId));
        const data = await response.json();

        if (response.ok) {
            const cartItems = data.cart || [];
            
            // Fetch product details for each cart item
            const itemsWithDetails = await Promise.all(
                cartItems.map(async (cartItem) => {
                    try {
                        const productResponse = await fetch(PRODUCT_DETAIL_ENDPOINT(cartItem.productId));
                        if (productResponse.ok) {
                            const productData = await productResponse.json();
                            return {
                                ...productData,
                                productId: cartItem.productId,
                                quantity: cartItem.quantity
                            };
                        } else {
                            // If product fetch fails, return minimal item data
                            return {
                                id: cartItem.productId,
                                productId: cartItem.productId,
                                name: `Product ${cartItem.productId}`,
                                price: 0,
                                quantity: cartItem.quantity,
                                description: 'Product details unavailable'
                            };
                        }
                    } catch (error) {
                        console.error(`Error fetching product ${cartItem.productId}:`, error);
                        // Return minimal item data if fetch fails
                        return {
                            id: cartItem.productId,
                            productId: cartItem.productId,
                            name: `Product ${cartItem.productId}`,
                            price: 0,
                            quantity: cartItem.quantity,
                            description: 'Product details unavailable'
                        };
                    }
                })
            );

            const cartData = {
                items: itemsWithDetails
            };
            cartStore.setCart(cartData);
            return { success: true, data: cartData };
        } else {
            const error = data.message || `Failed to fetch cart: ${response.status}`;
            cartStore.setError(error);
            return { success: false, error };
        }
    } catch (error) {
        console.error('Error fetching cart:', error);
        const errorMessage = `Network error: ${error.message}`;
        cartStore.setError(errorMessage);
        return { success: false, error: errorMessage };
    } finally {
        cartStore.setLoading(false);
    }
}

export async function removeCartItem(userId, productId) {
    try {
        cartStore.setLoading(true);
        cartStore.setError(null);

        const response = await fetch(REMOVE_CART_ITEM_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                userId,
                productId
            })
        });

        const data = await response.json();

        if (response.ok) {
            await getCart(userId);
            return { success: true, data };
        } else {
            const error = data.message || `Failed to remove cart item: ${response.status}`;
            cartStore.setError(error);
            return { success: false, error };
        }
    } catch (error) {
        console.error('Error removing cart item:', error);
        const errorMessage = `Network error: ${error.message}`;
        cartStore.setError(errorMessage);
        return { success: false, error: errorMessage };
    } finally {
        cartStore.setLoading(false);
    }
}

export async function clearCart(userId) {
    try {
        cartStore.setLoading(true);
        cartStore.setError(null);

        if (userId) {
            const response = await fetch(CLEAR_CART_ENDPOINT(userId), {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (!response.ok) {
                const data = await response.json();
                const error = data.message || `Failed to clear cart: ${response.status}`;
                cartStore.setError(error);
                return { success: false, error };
            }
        }

        // Clear local cart store
        cartStore.clear();
        return { success: true };
    } catch (error) {
        console.error('Error clearing cart:', error);
        const errorMessage = `Network error: ${error.message}`;
        cartStore.setError(errorMessage);
        return { success: false, error: errorMessage };
    } finally {
        cartStore.setLoading(false);
    }
}
