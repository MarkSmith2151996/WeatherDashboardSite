document.addEventListener('DOMContentLoaded', () => {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    
    // Signup Logic
    const signupForm = document.getElementById('signup-form');
    if (signupForm) {
        signupForm.addEventListener('submit', function (event) {
            event.preventDefault();
            const name = document.getElementById('signup-name').value.trim();
            const email = document.getElementById('signup-email').value.trim();
            const password = document.getElementById('signup-password').value.trim();

            if (users.find(user => user.email === email)) {
                alert('User already exists!');
            } else {
                users.push({ name, email, password });
                localStorage.setItem('users', JSON.stringify(users));
                alert('Account created successfully!');
                window.location.href = 'login.html';
            }
        });
    }

    // Login Logic
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', function (event) {
            event.preventDefault();
            const email = document.getElementById('login-email').value.trim();
            const password = document.getElementById('login-password').value.trim();

            const user = users.find(user => user.email === email && user.password === password);
            if (user) {
                alert(`Welcome back, ${user.name}!`);
                localStorage.setItem('currentUser', JSON.stringify(user));
                window.location.href = 'index.html';
            } else {
                document.getElementById('login-error').classList.remove('hidden');
            }
        });
    }
});
