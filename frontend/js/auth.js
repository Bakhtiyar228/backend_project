document.addEventListener('DOMContentLoaded', function () {
    const authtoken = localStorage.getItem('token');
    if(authtoken){
        window.location.replace('/');
    }
    const container = document.getElementById('container');
    const registerBtn = document.getElementById('register');
    const loginBtn = document.getElementById('login');
    
    registerBtn.addEventListener('click', () => {
        container.classList.add("active");
    });
    
    loginBtn.addEventListener('click', () => {
        container.classList.remove("active");
    });
});

document.getElementById('loginform').addEventListener('submit', async function(event) {
    event.preventDefault();
    const name = document.getElementById('name').value;
    const password = document.getElementById('password').value;
    try {
        const response = await fetch('/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, password })
        });
        const data = await response.json();
        if (response.ok) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('username', name);
            window.location.replace("/");
        } else {
            alert(data.error);
            throw new Error(data.error || 'An error has occurred');
        }
    } catch (error) {
        console.error('Error:', error.message);
    }
});

document.getElementById('signupform').addEventListener('submit', async function(event) {
    event.preventDefault();
    const newname = document.getElementById('newname').value;
    const newpassword = document.getElementById('newpassword').value;
    const confirmedPassword = document.getElementById('confirmedpassword').value;
    const nameRegex = /^[a-zA-Z]{3,15}$/; 
    const passwordRegex = /^(?=.*\d)[a-zA-Z0-9]{5,15}$/; 

    if (!nameRegex.test(newname)) {
        alert('Username must contain only alphabetic characters and be between 3 and 15 characters long.');
        return;
    }
    if (!passwordRegex.test(newpassword)) {
        alert('Password must contain at least one number, and only alphabetic and numeric characters, and be between 5 and 15 characters long.');
        return;
    }
    if (newpassword !== confirmedPassword) {
        alert('Passwords are not identical.');
        return;
    }
    try {
        const response = await fetch('/registration', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ newname, newpassword })
        });
        if (response.ok) {
            const data = await response.json();
            localStorage.setItem('token', data.token);
            localStorage.setItem('username', newname);
            window.location.replace('/');
        } else {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to sign up');
        }
    } catch (error) {
        console.error('Error:', error.message);
        alert(error.message);
    }
});
