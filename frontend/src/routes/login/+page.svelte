<script>
	import './login.css';
	import { goto } from '$app/navigation';
    import {LOGIN_ENDPOINT} from '../../lib/utils/endpoint';
	import { userStore } from '$lib/stores/index.js';

	let username = '';
	let password = '';
	let loading = false;
	let errorMessage = '';
	let successMessage = '';


	async function handleLogin() {
		if (!username || !password) {
			errorMessage = 'Please fill in both username and password';
			return;
		}

		loading = true;
		errorMessage = '';
		successMessage = '';

		try {
			const response = await fetch(LOGIN_ENDPOINT,{
                method:'POST',
                headers:{
                    "Content-Type":'application/json',
                },
                body:JSON.stringify({username,password})
            })

            const data = await response.json();

			
			if (data?.token) {
				successMessage = 'Login successful! Redirecting...';
				
				// Store token
				localStorage.setItem('token', data.token);
				
				// Store user information in store and localStorage
				const userInfo = {
					username: username,
					userId: username, // Set userId to be the same as username
					token: data.token
				};
				userStore.set(userInfo);
				
				goto("/products")
			} else {
				errorMessage = data?.message;
			}
		} catch (error) {
			errorMessage = error.message || 'Network error. Please try again.';
			console.error('Login error:', error);
		} finally {
			loading = false;
		}
	}

	function handleSubmit(event) {
		event.preventDefault();
		handleLogin();
	}
</script>

<svelte:head>
	<title>Login</title>
	<meta name="login" content="Login page" />
</svelte:head>

<section>
	<div class="login-container">
		<h1>Vignesh Store</h1>
		
		<form on:submit={handleSubmit} class="login-form">
			<div class="form-group">
				<label for="username">Username</label>
				<input 
					type="text" 
					id="username" 
					bind:value={username}
					placeholder="Enter your username"
					disabled={loading}
					required
				/>
			</div>

			<div class="form-group">
				<label for="password">Password</label>
				<input 
					type="password" 
					id="password" 
					bind:value={password}
					placeholder="Enter your password"
					disabled={loading}
					required
				/>
			</div>

			{#if errorMessage}
				<div class="error-message">
					{errorMessage}
				</div>
			{/if}

			{#if successMessage}
				<div class="success-message">
					{successMessage}
				</div>
			{/if}

			<button 
				type="submit" 
				class="login-btn"
				disabled={loading}
			>
				{loading ? 'Signing in...' : 'Sign In'}
			</button>
		</form>

		
	</div>
</section>


