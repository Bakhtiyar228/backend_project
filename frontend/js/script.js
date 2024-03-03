document.addEventListener('DOMContentLoaded', function() {
    const token = localStorage.getItem('token');
    const profileButton = document.getElementById('profile');
    const loginButton = document.getElementById('loginButton');
    const registerButton = document.getElementById('registerButton');
    if (token) {
        loginButton.style.display = 'none';
        registerButton.style.display = 'none';
        profileButton.style.display = 'block';
        const username = localStorage.getItem('username'); 
        document.getElementById('profile').textContent = `Hello, ${username}!`; 
        const base64Avatar = localStorage.getItem('avatar');
        document.getElementById('avatar').classList.remove('hide')
        if (base64Avatar && base64Avatar !== 'null') {
            document.getElementById('avatar').src = `data:image/png;base64, ${base64Avatar}`;
        } else { 
            fetchAvatar(username);
        }
        if(window.location.pathname=='/'){
          document.getElementById('aboutus_index').textContent = localStorage.getItem('aboutText').split(/[.!?]/).slice(0, 5).join('. ');;
    }
        document.getElementById('aboutus_footer').textContent = localStorage.getItem('aboutText').split(/[.!?]/).slice(0, 2).join('. ');;
        if(localStorage.getItem('username') !== 'admin'){
            document.getElementById('adminpanel').style.display = 'none';
        }
    } else {
        loginButton.classList.remove('hide');
        registerButton.classList.remove('hide');
        profileButton.style.display = 'none';
    }
    setTimeout(function() {
        localStorage.removeItem('token');
        localStorage.removeItem('username');}, 3600 * 10000);
    });

async function fetchAvatar(username) {
    try {
        const response = await fetch(`/avatar?username=${username}`);
        if (!response.ok) {
            throw new Error('Failed to fetch avatar');
        }
        const imageData = await response.text(); 
        localStorage.setItem('avatar', imageData);
        document.getElementById('avatar').src = `data:image/png;base64, ${imageData}`;
    } catch (error) {
        console.error('Error fetching avatar:', error);
    }
}

function initMap() {
    const googleMapDiv = document.getElementById('googleMap');
    const mapOptions = {
      center: { lat: 51.08912364093993, lng: 71.41883448202834 },
      zoom: 15, 
    };
    new google.maps.Map(googleMapDiv, mapOptions);
  }

document.getElementById('logout').addEventListener('click', function(event) {
    event.preventDefault();
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('avatar');
    localStorage.removeItem('userData');
    localStorage.removeItem('aboutText');
    window.location.reload();
});

document.getElementById('searchform').addEventListener('submit', function(event) {
    event.preventDefault();
    const bookname = document.getElementById('search').value;
    if (bookname.trim() !== '') {
        window.location.href = `searchpage?q=${bookname}`;
    }
});

async function searchBooks(query) {
    const apiUrl = `https://www.googleapis.com/books/v1/volumes?q=${query}`;
    try {
        const response = await fetch(apiUrl);
        const data = await response.json();
        if (data.items) {
          const head = document.getElementById('head');
          head.textContent = `Search results for the query: ${query}`; 
            displayBooks(data.items);
        } else {
            displayMessage('No results found');
        }
    } catch (error) {
        console.error('Error fetching books:', error.message);
        displayMessage('An error occurred. Please try again later.');
    }
  }
  
  function displayBooks(books) {
    const resultsContainer = document.getElementById('searchResults');
    resultsContainer.innerHTML = '';
    books.forEach(book => {
      const bookElement = document.createElement('div');
      bookElement.classList.add('book');
      const title = book.volumeInfo.title || 'Unknown Title';
      const authors = book.volumeInfo.authors ? book.volumeInfo.authors.join(', ') : 'Unknown Author';
      const thumbnail = book.volumeInfo.imageLinks ? book.volumeInfo.imageLinks.thumbnail : '';
      const publishedYear = book.volumeInfo.publishedDate ? new Date(book.volumeInfo.publishedDate).getFullYear() : 2020;
      const pageCount = book.volumeInfo.pageCount ? book.volumeInfo.pageCount : Math.floor(Math.random() * (200 - 50 + 1)) + 50;
      const genres = book.volumeInfo.categories ? book.volumeInfo.categories.join(', ') : '';
      const description = book.volumeInfo.description && book.volumeInfo.description.length >= 10 ? book.volumeInfo.description : 'No description available';
      if (thumbnail && thumbnail.startsWith('http')) {
        let htmlContent = `
          <img src="${thumbnail}" alt="Book Cover">
          <div class="book-info">
            <h2>${title}</h2>
            <p>Authors: ${authors}</p>`;
        if (genres !== '') {
          htmlContent += `<p>Genre: ${genres}</p>`;
        }
        htmlContent += `<p>Number of Pages: ${pageCount}</p>`;
        if (publishedYear !== '') {
          htmlContent += `<p>Published Year: ${publishedYear}</p>`;
        }
        htmlContent += `<p>Description: ${description}</p>`;
        bookElement.innerHTML = htmlContent;
        resultsContainer.appendChild(bookElement);
      }
    });
  }
  
  function displayMessage(message) {
    const resultsContainer = document.getElementById('searchResults');
    resultsContainer.innerHTML = `<p>${message}</p>`;
  }

document.getElementById('emailform').addEventListener('submit', async function(event) {
    event.preventDefault();
    const email = document.getElementById('email').value;
    try {
        const response = await fetch('/contacts', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },                                                                                  
            body: JSON.stringify({ email })
        });
        if (!response.ok) {
            throw new Error('Failed to request');
        }
        window.location.reload(); 
    } catch (error) {
        console.error('Error:', error);
    }
});

document.getElementById('contact_usform').addEventListener('submit', async function(event) {
    event.preventDefault();
    const name = document.getElementById('name').value;
    const email = document.getElementById('email2').value;
    const phonenumber = document.getElementById('number').value;
    const message = document.getElementById('message').value;
    try {
        const response = await fetch('/contact_us', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },                                                                                  
            body: JSON.stringify({ name, email, phonenumber, message })
        });
        if (!response.ok) {
            throw new Error('Failed to request');
        }
        window.location.reload(); 
    } catch (error) {
        console.error('Error:', error);
    }
} ) 

function sendNotification(type, text) {
    document.getElementById('notification').style.display = 'block';
    let notificationBox = document.querySelector(".notification-box");
    if (!notificationBox) {
        notificationBox = document.createElement("div");
        notificationBox.className = "notification-box flex flex-col items-center justify-center fixed w-full z-50 p-3";
        document.body.appendChild(notificationBox);
    }
    const alerts = {
        success: {
            icon: `<svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
</svg>`,
            color: "green-500"
        },
        error: {
            icon: `<svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>`,
            color: "red-500"
        }
    };
    let component = document.createElement("div");
    component.className = `relative flex items-center bg-${alerts[type].color} text-white text-sm font-bold px-4 py-3 rounded-md opacity-0 transform transition-all duration-500 mb-1`;
    component.innerHTML = `${alerts[type].icon}<p>${text}</p>`;
    notificationBox.appendChild(component);
    setTimeout(() => {
        component.classList.remove("opacity-0");
        component.classList.add("opacity-1");
    }, 1); 
    setTimeout(() => {
        component.classList.remove("opacity-1");
        component.classList.add("opacity-0");
        component.style.margin = 0;
        component.style.padding = 0;
    }, 3000);
    setTimeout(() => {
        component.style.setProperty("height", "0", "important");
    }, 3100);
    setTimeout(() => {
        notificationBox.removeChild(component);
    }, 3700);
}