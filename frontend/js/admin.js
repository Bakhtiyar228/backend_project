document.addEventListener('DOMContentLoaded', function() {
    const token = localStorage.getItem('token');
    if(!token || localStorage.getItem('username') !== 'admin'){
        window.location.replace('/');
    }
    if (token) {
        
        const base64Avatar = localStorage.getItem('avatar');
        document.getElementById('avatarprofile').src = `data:image/png;base64, ${base64Avatar}`;
        document.getElementById('avatarprofile_order').src = `data:image/png;base64, ${base64Avatar}`;
        document.getElementById('profileusername').textContent = localStorage.getItem('username'); 
        document.getElementById('username_order').textContent = localStorage.getItem('username'); 
        get_orders();
        get_counts();
        get_genres();
        top_sales().then(book => {
            if (book) {
                document.getElementById('topsales').textContent=book.name;
            } else {
                console.log('Failed to fetch most selling book');
            }
        });
            fetchRegionCounts().then(regionCounts => {
            generateTableRows(regionCounts);
            
        });
       document.getElementById('aboutus_footer').textContent = localStorage.getItem('aboutText').split(/[.!?]/).slice(0, 2).join('. ');;
        } 
});

async function top_sales() {
    try {
        const response = await fetch(`/orders`);
        const orderHistory = await response.json();
        const bookCounts = new Map();
        orderHistory.forEach(order => {
            const bookName = order.OrderData.name;
            if (bookCounts.has(bookName)) {
                bookCounts.set(bookName, bookCounts.get(bookName) + 1);
            } else {
                bookCounts.set(bookName, 1);
            }
        });
        let mostSellingBook = { name: '', count: 0 };
        for (const [bookName, count] of bookCounts.entries()) {
            if (count > mostSellingBook.count) {
                mostSellingBook = { name: bookName, count: count };
            }
        }
        return mostSellingBook;
    } catch (error) {
        console.error('Error fetching most selling book:', error);
        return null;
    }
}

async function get_genres() {
    try {
        const response = await fetch('/get_genres');
        const data = await response.json();
        const genreCounts = {
            Adventure: data.Adventure || 0,
            History: data.History || 0,
            Science: data.Science || 0,
            Fantasy: data.Fantasy || 0,
            Biography: data.Biography || 0,
            Textbooks: data.Textbooks || 0
        };
        const totalCount = Object.values(genreCounts).reduce((total, count) => total + count, 0);
        Object.entries(genreCounts).forEach(([genre, count]) => {
            const widthPercentage = totalCount === 0 ? '0%' : ((count / totalCount) * 100) + '%';
            document.getElementById(genre.toLowerCase()).style.width = widthPercentage;
        });
    } catch(error) {
        console.log("Error occurred", error);
    }
}

async function get_counts() {
    try {
        const response = await fetch('/get_counts');
        const data = await response.json();
        document.getElementById('users_count').textContent = data.users_count;
        document.getElementById('orders_count').textContent = data.orders_count;    
        document.getElementById('profit').textContent = `$${data.profit}`;    
        document.getElementById('subscribers_count').textContent = `+${data.subscribers_count}`;    
    } catch(error) {
        console.log("Error occurred", error);
    }
}

async function fetchRegionCounts() {
    try {
        const response = await fetch('/region_counts');
        if (!response.ok) {
            throw new Error('Failed to fetch region counts');
        }
        return await response.json();
    } catch (error) {
        console.error('Error occurred while fetching region counts:', error);
        return [];
    }
}

function generateTableRows(regionCounts) {
    const tbody = document.getElementById("regionTableBody");
    tbody.innerHTML = ""; 
    regionCounts.sort((a, b) => b.count - a.count);
    regionCounts.forEach(({ _id, count }) => {
        const row = document.createElement("tr");
        const flagCell = document.createElement("td");
        const flagImg = document.createElement("img");
        flagImg.classList.add('flag-icon');
        flagImg.src = `images/flags/${regionFlagMapping[_id]}`; 
        flagCell.appendChild(flagImg);
        row.appendChild(flagCell);
        const countryCell = document.createElement("td");
        countryCell.textContent = _id;
        row.appendChild(countryCell);
        const countCell = document.createElement("td");
        countCell.classList.add("text-right");
        countCell.textContent = count;
        row.appendChild(countCell);
        tbody.appendChild(row);
    });
}
const regionFlagMapping = {
    "USA": "US.png",
    "Kazakhstan": "KZ.png",
    "Andorra": "AD.png",
    "United Arab Emirates": "AE.png",
    "Antigua and Barbuda": "AG.png",
    "Armenia": "AM.png",
    "Canada": "CA.png",
    "Democratic Republic of the Congo": "CD.png",
    "Republic of the Congo": "CG.png",
    "Switzerland": "CH.png",
    "Algeria": "DZ.png",
    "Estonia": "EE.png",
    "Egypt": "EG.png",
    "Spain": "ES.png"
};

function formatDate(string) {
    const date = new Date(string);
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const day = date.getDate();
    const monthIndex = date.getMonth();
    const year = date.getFullYear();
    return `${day} ${months[monthIndex]}, ${year}`;
}

async function get_orders() {
    try {
        const response = await fetch(`/orders`);
        const orderHistory = await response.json();
        const tableBody = document.querySelector('#orders_all tbody');
        tableBody.innerHTML = ''; 
        orderHistory.forEach(order => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${order.OrderData.id}</td>
                <td>${order.username}</td>
                <td>${order.OrderData.name}</td>
                <td>${formatDate(order.OrderData.date)}</td>
                <td>${order.OrderData['delivery-status']}</td>
                <td>${order.OrderData['payment-method']}</td>
                <td>${getStatusLabel(order.OrderData['payment-status'])}</td>
                <td><a href="#" class="btn btn-outline-success btn-sm">View Order</a></td>`;
            tableBody.appendChild(row);
        });
    } catch (error) {
        console.error('Error fetching order history:', error);
    }
}
function getStatusLabel(status) {
    switch(status) {
        case 'Approved':
            return `<label class="badge badge-success">${status}</label>`;
        case 'Pending':
            return `<label class="badge badge-warning">${status}</label>`;
        case 'Rejected':
            return `<label class="badge badge-danger">${status}</label>`;
        default:
            return status;
    }
}