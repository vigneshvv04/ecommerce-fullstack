<script>
	import { onMount } from 'svelte';
	import { userStore, cartStore } from '$lib/stores/index.js';
	import { getCart, clearCart, removeCartItem } from '$lib/services/cartService.js';
	import { PLACE_ORDER_ENDPOINT } from '$lib/utils/endpoint.js';
	import { goto } from '$app/navigation';
    import './cart.css';

	let loading = true;
	let error = null;
	let processingPayment = false;
	let clearingCart = false;

	$: user = $userStore;
	$: cart = $cartStore;

	// Calculate total price
	$: totalPrice = cart?.items?.reduce((total, item) => total + (item.price * item.quantity), 0) || 0;

	onMount(async () => {
		// Redirect to login if not authenticated
		if (!user || !user.userId) {
			goto('/login');
			return;
		}

		// Fetch cart data
		await fetchCart();
	});

	async function fetchCart() {
		if (!user?.userId) return;

		try {
			loading = true;
			error = null;
			await getCart(user.userId);
		} catch (err) {
			console.error('Error fetching cart:', err);
			error = 'Failed to load cart. Please try again.';
		} finally {
			loading = false;
		}
	}

	async function removeItem(productId) {
		if (!user?.userId) return;

		try {
			await removeCartItem(user.userId, productId);
		} catch (err) {
			console.error('Error removing item:', err);
			error = 'Failed to remove item. Please try again.';
		}
	}

	async function handleClearCart() {
		if (!user?.userId) return;

		try {
			clearingCart = true;
			await clearCart(user.userId);
		} catch (err) {
			console.error('Error clearing cart:', err);
			error = 'Failed to clear cart. Please try again.';
		} finally {
			clearingCart = false;
		}
	}

	async function handlePayment() {
		if (!cart?.items?.length || totalPrice === 0) return;

		try {
			processingPayment = true;
			
			// Prepare order payload
			const orderPayload = {
				userId: user.userId,
				items: cart.items.map(item => ({
					productId: item.id,
					quantity: item.quantity
				}))
			};

			// Call order placement API
			const response = await fetch(PLACE_ORDER_ENDPOINT, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(orderPayload)
			});

			const data = await response.json();

			if (data.success) {
				// Clear cart after successful order placement
				await handleClearCart();
				
				// Show success message
				alert('Payment successful! Thank you for your purchase.');
			} else {
				// Show error message from API
				alert(data.message || 'Payment failed. Please try again.');
			}
			
		} catch (err) {
			console.error('Error processing payment:', err);
			alert('Payment failed. Please try again.');
		} finally {
			processingPayment = false;
		}
	}

</script>

<svelte:head>
	<title>Your Cart - E-commerce Store</title>
	<meta name="description" content="Review and checkout your cart items" />
</svelte:head>

<main class="cart-container">
	<div class="cart-header">
		<h1>Your Cart</h1>
		{#if cart?.items?.length > 0}
			<button 
				class="clear-cart-btn"
				on:click={handleClearCart}
				on:keydown={(e) => {}}
				disabled={clearingCart}
				aria-label="Clear all items from cart"
			>
				{clearingCart ? 'Clearing...' : 'Clear Cart'}
			</button>
		{/if}
	</div>

	{#if loading}
		<div class="loading" aria-live="polite">
			<div class="spinner"></div>
			<p>Loading your cart...</p>
		</div>
	{:else if error}
		<div class="error" role="alert">
			<p>{error}</p>
			<button 
				class="retry-btn"
				on:click={fetchCart}
				on:keydown={(e) => handleKeydown(e, fetchCart)}
			>
				Try Again
			</button>
		</div>
	{:else if !cart?.items?.length}
		<div class="empty-cart">
			<div class="empty-cart-icon">🛒</div>
			<h2>Your cart is empty</h2>
			<p>Looks like you haven't added any items to your cart yet.</p>
			<a href="/products" class="continue-shopping-btn">
				Continue Shopping
			</a>
		</div>
	{:else}
		<div class="cart-content">
			<div class="cart-items">
				{#each cart.items as item (item.id)}
					<div class="cart-item" data-testid="cart-item-{item.id}">
						<div class="item-image">
							{#if item.image}
								<img 
									src={item.image} 
									alt={item.name}
									loading="lazy"
								/>
							{:else}
								<div class="image-placeholder">📦</div>
							{/if}
						</div>
						
						<div class="item-details">
							<h3 class="item-name">{item.name}</h3>
							<p class="item-description">{item.description || ''}</p>
							<p class="item-price" aria-label="Price per item">
								${item.price?.toFixed(2)}
							</p>
						</div>

						<div class="quantity-display">
							<span class="quantity-label">Qty:</span>
							<span class="quantity-value">{item.quantity}</span>
						</div>

						<div class="item-total">
							<p aria-label="Total price for {item.name}">
								${(item.price * item.quantity).toFixed(2)}
							</p>
						</div>

						<button 
							class="remove-btn"
							on:click={() => removeItem(item.productId || item.id)}
							on:keydown={(e)=>{}}
							aria-label="Remove {item.name} from cart"
						>
							Remove
						</button>
					</div>
				{/each}
			</div>

			<div class="cart-summary">
				<div class="summary-card">
					<h2>Order Summary</h2>
					
					<div class="summary-row">
						<span>Items ({cart.items.length}):</span>
						<span>${totalPrice.toFixed(2)}</span>
					</div>
					
					<div class="summary-row">
						<span>Shipping:</span>
						<span>FREE</span>
					</div>
					
					<hr class="summary-divider" />
					
					<div class="summary-row total-row">
						<span>Total:</span>
						<span>${totalPrice.toFixed(2)}</span>
					</div>

					<button 
						class="checkout-btn"
						on:click={handlePayment}
						on:keydown={(e) => {}}
						disabled={processingPayment || totalPrice === 0}
						aria-label="Proceed to checkout and pay ${totalPrice.toFixed(2)}"
					>
						{#if processingPayment}
							<span class="spinner-small"></span>
							Processing...
						{:else}
							Proceed to Checkout
						{/if}
					</button>

					<a href="/products" class="continue-shopping-link">
						Continue Shopping
					</a>
				</div>
			</div>
		</div>
	{/if}
</main>

