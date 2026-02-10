<script>
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import logo from '$lib/images/svelte-logo.svg';
	import logout from '$lib/images/logout.svg';
	import cart from '$lib/images/cart.svg';
	import { userStore, cartStore } from '$lib/stores/index.js';
	import { getCart, clearCart } from '$lib/services/cartService.js';
	import './header.css';

	let user = null;
	let cartData = { totalItems: 0 };

	// Subscribe to stores
	userStore.subscribe(value => {
		user = value;
		// Load cart when user changes
		if (value?.userId) {
			getCart(value.userId);
		} else {
			clearCart();
		}
	});

	cartStore.subscribe(value => {
		cartData = value;
	});

	function handleLogout() {
		userStore.logout();
		clearCart();
		goto('/login');
	}

	function handleCartClick() {
		goto('/cart');
	}

	onMount(() => {
		// Initialize user store from localStorage
		userStore.init();
	});
</script>

<header>
	<div class="corner">
		<a href="/">
			<img src={logo} alt="companylogo" />
		</a>
	</div>

	<nav>
		<svg viewBox="0 0 2 3" aria-hidden="true">
			<path d="M0,0 L1,2 C1.5,3 1.5,3 2,3 L2,0 Z" />
		</svg>
		<ul>
			<li aria-current={page.url.pathname === '/products' ? 'page' : undefined}>
				<a href="/products">Products</a>
			</li>

			{#if user}
				<li aria-current={page.url.pathname === '/cart' ? 'page' : undefined}>
					<button class="cart-btn" on:click={handleCartClick}>
						<img src={cart} alt="cart" />
						{#if cartData.totalItems > 0}
							<span class="cart-count">{cartData.totalItems}</span>
						{/if}
						<span class="cart-text">Cart</span>
					</button>
				</li>
			{/if}
			
		</ul>
		<svg viewBox="0 0 2 3" aria-hidden="true">
			<path d="M0,0 L0,3 C0.5,3 0.5,3 1,2 L2,0 Z" />
		</svg>
	</nav>

	<div class="corner">
		{#if user}
			<div class="user-section">
				<span class="username">Hi, {user.username}</span>
				<button on:click={handleLogout} class="logout-btn">
					<img src={logout} alt="logout"/>
				</button>
			</div>
		{:else}
			<a href="/login">
				<img src={logout} alt="login"/>
			</a>
		{/if}
	</div>
</header>
