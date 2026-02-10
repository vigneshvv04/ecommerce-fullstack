<script>
    import { PRODUCTS_ENDPOINT } from "$lib/utils/endpoint";
    import { onMount } from "svelte";
    import { goto } from '$app/navigation';
    import { userStore } from '$lib/stores/index.js';
    import { addToCart } from '$lib/services/cartService.js';
    import './product.css';

    // State variables
    let allProducts = [];
    let filteredProducts = [];
    let displayedProducts = [];
    let loading = true;
    let error = null;
    let user = null;
    let addingToCart = {};
    
    // Pagination state
    let currentPage = 1;
    let itemsPerPage = 6;
    let totalPages = 1;
    
    // Search and filter state
    let searchQuery = "";
    let sortBy = "name";
    let sortOrder = "asc"; // asc or desc
    
    // Available sort options
    const sortOptions = [
        { value: "name", label: "Name" },
        { value: "price", label: "Price" },
        { value: "category", label: "Category" },
        { value: "stock", label: "Stock" }
    ];

    // Subscribe to user store
    userStore.subscribe(value => {
        user = value;
    });

    const getProducts = async () => {
        try {
            loading = true;
            const res = await fetch(PRODUCTS_ENDPOINT);
            const data = await res.json();
            if (res.ok) {
                allProducts = data?.data || [];
                filterAndSortProducts();
            } else {
                error = `Failed to load products: ${res.status}`;
            }
        } catch (err) {
            console.error(err);
            error = `Network error: ${err.message}`;
        } finally {
            loading = false;
        }
    };

    // Filter products based on search query
    const filterProducts = () => {
        if (!searchQuery.trim()) {
            return allProducts;
        }
        
        const query = searchQuery.toLowerCase();
        return allProducts.filter(product => 
            product.name?.toLowerCase().includes(query) ||
            product.category?.toLowerCase().includes(query)
        );
    };

    // Sort products based on selected criteria
    const sortProducts = (products) => {
        return [...products].sort((a, b) => {
            let aValue = a[sortBy];
            let bValue = b[sortBy];
            
            // Handle string values
            if (typeof aValue === 'string') {
                aValue = aValue.toLowerCase();
                bValue = bValue?.toLowerCase() || '';
            }
            
            // Handle numeric values
            if (sortBy === 'price' || sortBy === 'stock') {
                aValue = parseFloat(aValue) || 0;
                bValue = parseFloat(bValue) || 0;
            }
            
            if (sortOrder === 'asc') {
                return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
            } else {
                return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
            }
        });
    };

    // Apply filtering, sorting, and pagination
    const filterAndSortProducts = () => {
        // Filter products
        filteredProducts = filterProducts();
        
        // Sort products
        filteredProducts = sortProducts(filteredProducts);
        
        // Calculate pagination
        totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
        
        // Ensure current page is within bounds
        if (currentPage > totalPages && totalPages > 0) {
            currentPage = 1;
        }
        if (currentPage < 1) {
            currentPage = 1;
        }
        
        // Get products for current page
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        displayedProducts = filteredProducts.slice(startIndex, endIndex);
        
    };

    const handleAddToCart = async (product, event) => {
        // Prevent navigation to product detail
        event.stopPropagation(); 
        
        if (!user?.userId) {
            goto('/login');
            return;
        }

        const productId = product.id || product._id;
        addingToCart[productId] = true;

        try {
            const result = await addToCart(user.userId, productId, 1);
        } catch (error) {
            
        } finally {
            addingToCart[productId] = false;
        }
    };

    const navigateToProduct = (product) => {
        goto(`/products/${product.id || product._id}`);
    };

    const toggleSortOrder = () => {
        sortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
        filterAndSortProducts();
    };

    const goToPage = (page) => {
        if (page >= 1 && page <= totalPages) {
            currentPage = page;
            filterAndSortProducts();
        }
    };

    // Reactive page numbers
    $: pageNumbers = (() => {
        const pages = [];
        const maxVisible = 5;
        
        
        if (totalPages <= maxVisible) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            let start = Math.max(1, currentPage - 2);
            let end = Math.min(totalPages, start + maxVisible - 1);
            
            if (end - start < maxVisible - 1) {
                start = Math.max(1, end - maxVisible + 1);
            }
            
            for (let i = start; i <= end; i++) {
                pages.push(i);
            }
        }
        
        return pages;
    })();

    onMount(() => {
        getProducts();
    });

    // Reactive statements to handle changes
    let previousSearchQuery = "";
    
    $: {
        // Explicitly depend on these variables to trigger reactivity
        searchQuery;
        sortBy;
        sortOrder;
        
        // Track search query changes to reset pagination
        if (searchQuery !== previousSearchQuery) {
            currentPage = 1;
            previousSearchQuery = searchQuery;
        }
        
        // Always refilter and sort when any dependency changes
        if (allProducts.length > 0) {
            filterAndSortProducts();
        }
    }
</script>

<div class="products-container">
    <div class="header-section">
        <h1>Products Catalog</h1>
        <p class="subtitle">Discover our amazing collection of products</p>
    </div>

    {#if loading}
        <div class="loading-container">
            <div class="loading-spinner"></div>
            <p>Loading products...</p>
        </div>
    {:else if error}
        <div class="error-container">
            <h3>Oops! Something went wrong</h3>
            <p>{error}</p>
            <button class="retry-btn" on:click={getProducts}>Try Again</button>
        </div>
    {:else}
        <!-- Search and Filter Section -->
        <div class="controls-section">
            <div class="search-container">
                <input
                    type="text"
                    placeholder="Search by name or category..."
                    bind:value={searchQuery}
                    class="search-input"
                />
                <span class="search-icon">🔍</span>
            </div>
            
            <div class="sort-container">
                <button class="sort-order-btn" on:click={toggleSortOrder} title="Toggle sort order">
                    {#if sortOrder === 'asc'}
                        ↑
                    {:else}
                        ↓
                    {/if}
                </button>
            </div>
            
            <div class="results-info">
                Showing {displayedProducts.length} of {filteredProducts.length} products
            </div>
        </div>

        <!-- Products Grid -->
        {#if displayedProducts.length === 0}
            <div class="no-products">
                <h3>No products found</h3>
                <p>Try adjusting your search criteria</p>
            </div>
        {:else}
            <div class="products-grid">
                {#each displayedProducts as product}
                    <div 
                        class="product-card" 
                        on:click={() => navigateToProduct(product)}
                        on:keydown={(event) => {}}
                        role="button" 
                        tabindex="0"
                        aria-label="View details for {product.name}"
                    >
                        <div class="product-image">
                            {#if product.image}
                                <img src={product.image} alt={product.name} />
                            {:else}
                                <div class="product-placeholder">📦</div>
                            {/if}
                        </div>
                        
                        <div class="product-info">
                            <h3 class="product-name">{product.name || 'Unnamed Product'}</h3>
                            
                            {#if product.category}
                                <span class="product-category">{product.category}</span>
                            {/if}
                            
                            <p class="product-description">
                                {product.description || 'No description available'}
                            </p>
                            
                            <div class="product-footer">
                                <div class="price-section">
                                    <span class="price">${product.price || '0.00'}</span>
                                </div>
                                
                                <div class="stock-section">
                                    <span class="stock {product.stock > 0 ? 'in-stock' : 'out-of-stock'}">
                                        {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                                    </span>
                                </div>
                            </div>
                            
                            <button 
                                class="add-to-cart-btn {product.stock <= 0 ? 'disabled' : ''} {addingToCart[product.id || product._id] ? 'loading' : ''}"
                                disabled={product.stock <= 0 || addingToCart[product.id || product._id]}
                                on:click={(event) => handleAddToCart(product, event)}
                                aria-label="Add {product.name} to cart"
                            >
                                {#if addingToCart[product.id || product._id]}
                                    Adding...
                                {:else if product.stock > 0}
                                    Add to Cart
                                {:else}
                                    Unavailable
                                {/if}
                            </button>
                        </div>
                    </div>
                {/each}
            </div>
        {/if}

        <!-- Pagination -->
        {#if totalPages > 1}
            <div class="pagination-container">
                <button 
                    class="pagination-btn" 
                    on:click={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                >
                    Previous
                </button>
                
                {#each pageNumbers as pageNum}
                    <button 
                        class="pagination-btn {pageNum === currentPage ? 'active' : ''}"
                        on:click={() => goToPage(pageNum)}
                    >
                        {pageNum}
                    </button>
                {/each}
                
                <button 
                    class="pagination-btn" 
                    on:click={() => goToPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                >
                    Next
                </button>
            </div>
            
            <div class="pagination-info">
                Page {currentPage} of {totalPages}
            </div>
        {/if}
    {/if}
</div>

