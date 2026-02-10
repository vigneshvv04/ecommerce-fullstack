<script>
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { userStore } from '$lib/stores/index.js';

	let user = null;

	// Subscribe to user store
	userStore.subscribe(value => {
		user = value;
	});

	onMount(() => {
		// Check if user is authenticated
		if (user && user.userId) {
			// User is authenticated, redirect to products
			goto('/products');
		} else {
			// User is not authenticated, redirect to login
			goto('/login');
		}
	});
</script>

<svelte:head>
	<title>Home</title>
	<meta name="home page" content="Svelte demo app" />
</svelte:head>

