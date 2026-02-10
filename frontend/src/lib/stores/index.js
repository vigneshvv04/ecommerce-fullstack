import { writable } from 'svelte/store';
import { browser } from '$app/environment';

// User store
function createUserStore() {
    const { subscribe, set, update } = writable(null);

    return {
        subscribe,
        set: (user) => {
            set(user);
            if (browser) {
                if (user) {
                    localStorage.setItem('user', JSON.stringify(user));
                } else {
                    localStorage.removeItem('user');
                }
            }
        },
        init: () => {
            if (browser) {
                const storedUser = localStorage.getItem('user');
                if (storedUser) {
                    try {
                        set(JSON.parse(storedUser));
                    } catch (e) {
                        console.error('Error parsing stored user:', e);
                        localStorage.removeItem('user');
                    }
                }
            }
        },
        logout: () => {
            set(null);
            if (browser) {
                localStorage.removeItem('user');
                localStorage.removeItem('token');
            }
        }
    };
}

// Cart store
function createCartStore() {
    const { subscribe, set, update } = writable({
        items: [],
        totalPrice: 0,
        totalItems: 0,
        loading: false,
        error: null
    });

    return {
        subscribe,
        setLoading: (loading) => update(state => ({ ...state, loading })),
        setError: (error) => update(state => ({ ...state, error })),
        setCart: (cartData) => {
            const items = cartData.items || [];
            const totalPrice = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
            
            set({
                items,
                totalPrice,
                totalItems,
                loading: false,
                error: null
            });
        },
        clear: () => set({
            items: [],
            totalPrice: 0,
            totalItems: 0,
            loading: false,
            error: null
        })
    };
}

export const userStore = createUserStore();
export const cartStore = createCartStore();
