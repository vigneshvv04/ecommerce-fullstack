<script>
    import { page } from '$app/stores';
    import { goto } from '$app/navigation';
    import { onMount } from 'svelte';
    import { PRODUCT_DETAIL_ENDPOINT } from '$lib/utils/endpoint.js';
    import { userStore } from '$lib/stores/index.js';
    import { addToCart } from '$lib/services/cartService.js';
    import './productDetails.css';

    // Get the product ID from the URL
    $: productId = $page.params.id;

    // State variables
    let product = null;
    let loading = true;
    let error = null;
    let quantity = 1;
    let selectedImageIndex = 0;
    let user = null;
    let addingToCart = false;

    // Subscribe to user store
    userStore.subscribe(value => {
        user = value;
    });

    // Fetch product details
    const getProductDetails = async () => {
        try {
            loading = true;
            error = null;
            
            const res = await fetch(PRODUCT_DETAIL_ENDPOINT(productId));
            const data = await res.json();
            
            if (res.ok) {
                product = data?.data || data;
                console.log('Product details:', product);
            } else {
                error = `Failed to load product: ${res.status} ${res.statusText}`;
            }
        } catch (err) {
            console.error('Error fetching product:', err);
            error = `Network error: ${err.message}`;
        } finally {
            loading = false;
        }
    };

    const goBack = () => {
        goto('/products');
    };

    const updateQuantity = (change) => {
        const newQuantity = quantity + change;
        if (newQuantity >= 1 && newQuantity <= (product?.stock || 1)) {
            quantity = newQuantity;
        }
    };

    const handleAddToCart = async () => {
        if (!user?.userId) {
            goto('/login');
            return;
        }

        addingToCart = true;

        try {
            const result = await addToCart(user.userId, productId, quantity);
            
            if (result.success) {
                // Reset quantity to 1 after successful addition
                quantity = 1;
            }
        } catch (error) {
        } finally {
            addingToCart = false;
        }
    };

    const selectImage = (index) => {
        selectedImageIndex = index;
    };

    onMount(() => {
        if (productId) {
            getProductDetails();
        }
    });

    // Reactive statement to refetch when productId changes
    $: if (productId) {
        getProductDetails();
    }
</script>

<div class="product-detail-container">
    <!-- Back Button -->
    <div class="back-section">
        <button class="back-btn" on:click={goBack}>
            <span class="back-icon">←</span>
            Back to Products
        </button>
    </div>

    {#if loading}
        <div class="loading-container">
            <div class="loading-spinner"></div>
            <p>Loading product details...</p>
        </div>
    {:else if error}
        <div class="error-container">
            <h3>Oops! Something went wrong</h3>
            <p>{error}</p>
            <button class="retry-btn" on:click={getProductDetails}>Try Again</button>
            <button class="back-btn-secondary" on:click={goBack}>Go Back to Products</button>
        </div>
    {:else if product}
        <div class="product-detail-content">
            <!-- Product Images Section -->
            <div class="product-images">
                <div class="main-image">
                    {#if product.images && product.images.length > 0}
                        <img 
                            src={product.images[selectedImageIndex]} 
                            alt={product.name}
                            class="main-product-image"
                        />
                    {:else if product.image}
                        <img 
                            src={product.image} 
                            alt={product.name}
                            class="main-product-image"
                        />
                    {:else}
                        <div class="image-placeholder">
                            <span class="placeholder-icon">📦</span>
                        </div>
                    {/if}
                </div>

                <!-- Thumbnail images -->
                {#if product.images && product.images.length > 1}
                    <div class="thumbnail-container">
                        {#each product.images as image, index}
                            <button 
                                class="thumbnail {index === selectedImageIndex ? 'active' : ''}"
                                on:click={() => selectImage(index)}
                            >
                                <img src={image} alt={`${product.name} view ${index + 1}`} />
                            </button>
                        {/each}
                    </div>
                {/if}
            </div>

            <!-- Product Information Section -->
            <div class="product-info">
                <div class="product-header">
                    <h1 class="product-title">{product.name}</h1>
                    {#if product.category}
                        <span class="product-category-badge">{product.category}</span>
                    {/if}
                </div>

                <div class="price-section">
                    <span class="current-price">${product.price || '0.00'}</span>
                    {#if product.originalPrice && product.originalPrice > product.price}
                        <span class="original-price">${product.originalPrice}</span>
                        <span class="discount">
                            {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                        </span>
                    {/if}
                </div>

                <div class="stock-section">
                    <span class="stock-status {product.stock > 0 ? 'in-stock' : 'out-of-stock'}">
                        {#if product.stock > 0}
                            ✓ {product.stock} in stock
                        {:else}
                            ✗ Out of stock
                        {/if}
                    </span>
                </div>

                <div class="description-section">
                    <h3>Description</h3>
                    <p class="product-description">
                        {product.description || 'No description available for this product.'}
                    </p>
                </div>

                <!-- Product Specifications -->
                {#if product.specifications}
                    <div class="specifications-section">
                        <h3>Specifications</h3>
                        <ul class="spec-list">
                            {#each Object.entries(product.specifications) as [key, value]}
                                <li>
                                    <strong>{key}:</strong> {value}
                                </li>
                            {/each}
                        </ul>
                    </div>
                {/if}

                <!-- Quantity and Add to Cart -->
                {#if product.stock > 0}
                    <div class="purchase-section">
                        <div class="quantity-section">
                            <label for="quantity">Quantity:</label>
                            <div class="quantity-controls">
                                <button 
                                    class="quantity-btn" 
                                    on:click={() => updateQuantity(-1)}
                                    disabled={quantity <= 1}
                                >
                                    −
                                </button>
                                <span class="quantity-display">{quantity}</span>
                                <button 
                                    class="quantity-btn" 
                                    on:click={() => updateQuantity(1)}
                                    disabled={quantity >= product.stock}
                                >
                                    +
                                </button>
                            </div>
                        </div>

                        <button 
                            class="add-to-cart-btn {addingToCart ? 'loading' : ''}" 
                            on:click={handleAddToCart}
                            disabled={addingToCart}
                        >
                            {#if addingToCart}
                                Adding to Cart...
                            {:else}
                                Add to Cart - ${(product.price * quantity).toFixed(2)}
                            {/if}
                        </button>
                    </div>
                {:else}
                    <div class="out-of-stock-section">
                        <button class="out-of-stock-btn" disabled>
                            Out of Stock
                        </button>
                        <p class="notify-text">Get notified when this item is back in stock</p>
                    </div>
                {/if}

            
            
            </div>
        </div>
    {:else}
        <div class="not-found">
            <h2>Product Not Found</h2>
            <p>The product you're looking for doesn't exist.</p>
            <button class="back-btn-secondary" on:click={goBack}>Go Back to Products</button>
        </div>
    {/if}
</div>


