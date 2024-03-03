document.addEventListener('DOMContentLoaded', function() {
    const token = localStorage.getItem('token');
    const editProfileBtn = document.getElementById('editprofile');
    const saveChangesBtn = document.getElementById('savechanges');
    const spinner = document.getElementById('spinner');
    const accountDetailsContainer = document.getElementById('accountDetailsContainer');
    const avatarchange = document.getElementById('avatarchange');
    const username = localStorage.getItem('username');
    let base64Image, deleted, newAboutMe;
    
    if(!token){
        window.location.replace('/');
    }
    else {
        document.getElementById('profileusername').textContent = localStorage.getItem('username'); 
        const base64Avatar = localStorage.getItem('avatar');
        document.getElementById('avatarprofile').src = `data:image/png;base64, ${base64Avatar}`;
        fetchUserData(username);
        const userString = localStorage.getItem('userData');
        const user = JSON.parse(userString);
        if (user) {
            document.getElementById('fname').textContent = user.fname || 'No information';
            document.getElementById('sname').textContent = user.sname || 'No information';
            document.getElementById('job').textContent = user.job || 'No information';
            document.getElementById('country').textContent = user.country || 'No information';
            document.getElementById('country2').textContent = user.country || 'No information';
            document.getElementById('email').textContent = user.email || 'No information';
            if (user.birthday) {
                document.getElementById('birthday').textContent = formatDate(user.birthday);
                document.getElementById('age').textContent = calculateAge(user.birthday);
            } else {
                document.getElementById('birthday').textContent = 'No information';
                document.getElementById('age').textContent = 'No information';
            }
        } 
        else {
            fetchUserData(username);
        }

        const Aboutmetext =  localStorage.getItem('aboutme');
        if (Aboutmetext) {
            document.getElementById('aboutmetext').textContent = Aboutmetext;
        } 
        else {
            fetchAboutMe(username);
        }

        getordershistory(username);

        editProfileBtn.addEventListener('click', () => {
            editProfileBtn.classList.add('hide');
            saveChangesBtn.classList.remove('hide');
            document.getElementById('ageplace').style.display='none';
            avatarchange.classList.remove('hide');
            Array.from(accountDetailsContainer.querySelectorAll('p.card-header')).forEach(p => {
                p.classList.add('hide');
            });
            Array.from(accountDetailsContainer.querySelectorAll('.form-control.hide')).forEach(input => {
                input.classList.remove('hide');
            });
            $(document).ready(function() {
                populateCountrySelect();
            });
            document.getElementById('newcountry').classList.remove('hide');
            document.getElementById('aboutmetext').classList.add('hide');
            document.getElementById('change_aboutme').classList.remove('hide');
            document.getElementById('change_aboutme').placeholder = Aboutmetext ? Aboutmetext : "Enter your about me text here";
            document.getElementById('savechanges').classList.remove('hide');
            document.getElementById('newfname').value = user.fname || '';
            document.getElementById('newsname').value = user.sname || '';
            document.getElementById('newjob').value = user.job || '';
            document.getElementById('newcountry').value = user.country || '';
            document.getElementById('newemail').value = user.email || '';
            document.getElementById('newbirthday').value = user.birthday || '';
        });

        document.getElementById('avatarInput').addEventListener('change', function(event) {
        const file = event.target.files[0];
        if (file) {
            document.getElementById('fileName').textContent = file.name; 
            document.getElementById('fileName').classList.remove('hide');  
            document.getElementById('deleteresult').classList.add('d-none'); 
            const reader = new FileReader();
            reader.onload = function(e) {
                base64Image = e.target.result;
                base64Image = base64Image.replace(/^data:image\/(png|jpeg|jpg);base64,/, '');
            };
          reader.readAsDataURL(file); 
        } } );

        document.getElementById('deleteavatar').addEventListener('click', () => {
        document.getElementById('deleteresult').classList.remove('d-none'); 
        document.getElementById('fileName').textContent = '';  
        deleted = true;
        localStorage.removeItem('avatar'); 
        })
        
        saveChangesBtn.addEventListener('click', async function handleClick() {
            const updatedUserData = {
                fname: capitalizeFirstLetter(document.getElementById('newfname').value) || user.fname,
                sname: capitalizeFirstLetter(document.getElementById('newsname').value) || user.sname,
                job: capitalizeFirstLetter(document.getElementById('newjob').value) || user.job,
                country: document.getElementById('newcountry').value || user.country,
                email: document.getElementById('newemail').value.trim() || user.email,
                birthday: document.getElementById('newbirthday').value || user.birthday
            };            
            const namePattern = /^[A-Za-z]*$/;
            let isValidData = true;
            for (const key in updatedUserData) {
              if (key !== 'birthday' && updatedUserData[key] !== '' && !namePattern.test(updatedUserData[key])) {
              isValidData = false;  
              sendNotification('error', "You wrote incorrect data.");
              break; 
    } }         
            if (isValidData) { 
                sendNotification('success', "Changes saved successfully");
                saveChangesBtn.classList.remove('hide');
                saveChangesBtn.removeEventListener('click', handleClick); 
                saveChangesBtn.onclick = () => {};
                saveChangesBtn.classList.add('hide');
                spinner.classList.remove('hide');
                setTimeout(async () => {
                    try {
                        const username = localStorage.getItem('username');
                        await updateUserData(username, updatedUserData);
                        localStorage.setItem('userData', JSON.stringify(updatedUserData));
                        updateUI(updatedUserData);
                        if (base64Image) {
                            uploadAvatar(base64Image);
                        } else {
                            const currentAvatar = localStorage.getItem('avatar');
                            uploadAvatar(currentAvatar);
                        }
                        if (newAboutMe) {
                            updateAboutMe(newAboutMe);
                        } else {
                            updateAboutMe(Aboutmetext);
                        }
                        if (deleted == true) {
                            deleteAvatar(username);
                            localStorage.setItem(base64Avatar, `${getDefaultAvatar()}`)
                        }
                        Array.from(accountDetailsContainer.querySelectorAll('.form-control:not(.hide)')).forEach(input => {
                            input.classList.add('hide');
                        });
                        Array.from(accountDetailsContainer.querySelectorAll('p.card-header')).forEach(p => {
                            p.classList.remove('hide');
                        });
                        document.getElementById('deleteavatar').style.display = 'none';
                        editprofile.style.display = 'block';
                        window.location.reload();
                    } catch (error) {
                        console.error('Error updating user data:', error);
                    } finally {
                        spinner.classList.add('hide');
                    }
                }, 2000);
            }
        });
        
} });

async function updateUserData(username, userData) {
    try {
        const response = await fetch('/updateUserData', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username: username, userData: userData })
        });
        if (!response.ok) {
            throw new Error('Failed to update user data');
        }
    } catch (error) {
        console.error('Error updating user data:', error);
    }
}

async function fetchUserData(username) { 
    try {
        const response = await fetch(`/getUserData?username=${username}`);
        if (!response.ok) {
            throw new Error('Failed to fetch user data');
        }
        if (response.status === 404) {
            throw new Error('User data not found');
        }
        const userData = await response.json(); 
        localStorage.setItem('userData', JSON.stringify(userData));
        updateUI(userData); 
    } catch (error) {
        console.error('Error fetching user data:', error);
    }
}

const populateCountrySelect = async function() {
    const countries = [
        "USA", "Kazakhstan", "Andorra", "United Arab Emirates", "Antigua and Barbuda",
        "Armenia", "Canada", "Democratic Republic of the Congo", "Republic of the Congo",
        "Switzerland", "Algeria", "Estonia", "Egypt", "Spain"
    ];

    $.each(countries, function(index, country) {
        $('#newcountry').append('<option value="' + country + '">' + country + '</option>');
    });
};

function updateUI(user) {
    document.getElementById('fname').textContent = user.fname || 'No information';
    document.getElementById('sname').textContent = user.sname || 'No information';
    document.getElementById('job').textContent = user.job || 'No information';
    document.getElementById('country').textContent = user.country || 'No information';
    document.getElementById('country2').textContent = user.country || 'No information';
    document.getElementById('email').textContent = user.email || 'No information';
    if (user.birthday) {
        document.getElementById('birthday').textContent = formatDate(user.birthday);
        document.getElementById('age').textContent = calculateAge(user.birthday);
    } else {
        document.getElementById('birthday').textContent = 'No information';
        document.getElementById('age').textContent = 'No information';
    }
}

async function fetchAboutMe(username) {
    try{
        const response = await fetch(`/getaboutme?username=${username}`);
        if (!response.ok) {
            throw new Error('Failed to fetch information');
        }
        const aboutme = await response.text(); 
        document.getElementById('aboutmetext').textContent = `${aboutme}`;
        localStorage.setItem('aboutme', aboutme);
    } catch (error) {
        console.error('Error fetching "about me" information:', error);
    }
}

async function updateAboutMe(newAboutMe) {
    localStorage.removeItem('aboutme'); 
    const username = localStorage.getItem('username'); 
    fetch('/updateAboutMe', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username: username, newAboutMe: newAboutMe })
    })
    .then(response => {
        if (response.ok) {
            return response.json();
        }
        throw new Error('Failed to update information');
    })
    .catch(error => {
        console.error('Error updating information:', error);
    });
    localStorage.setItem('aboutme', newAboutMe);
}

function uploadAvatar(base64Image) {
    const username = localStorage.getItem('username'); 
    fetch('/updateAvatar', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username: username, avatar: base64Image })
    })
    .then(response => {
        if (response.ok) {
            return response.json();
        }
        throw new Error('Failed to update avatar');
    })
    .then(data => {
        console.log('Avatar updated successfully:', data);
    })
    .catch(error => {
        console.error('Error updating avatar:', error);
    });
    localStorage.setItem('avatar', base64Image);
}

async function deleteAvatar(username) {
    try {
        const response = await fetch(`/deleteAvatar`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username: username })
        });
        if (!response.ok) {
            throw new Error('Failed to delete avatar');
        }
        localStorage.removeItem('avatar');
    } catch (error) {
        console.error('Error deleting avatar:', error);
    }
}

async function getDefaultAvatar() {
    try {
        const response = await fetch(`/getDefaultAvatar`);
        if (!response.ok) {
            throw new Error('Failed to fetch avatar');
        }
        const imageData = await response.text(); 
        document.getElementById('avatar').src = `data:image/png;base64, ${imageData}`;
        document.getElementById('avatarprofile').src = `data:image/png;base64, ${imageData}`;
        base64Avatar = localStorage.setItem('avatar', imageData);
    } catch (error) {
        console.error('Error fetching avatar:', error);
    }
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
}

function formatDate(birthday) {
    const date = new Date(birthday);
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const day = date.getDate();
    const monthIndex = date.getMonth();
    const year = date.getFullYear();
    return `${day} ${months[monthIndex]}, ${year}`;
}

function calculateAge(birthday) {
    const birthDate = new Date(birthday);
    const currentDate = new Date();
    let age = currentDate.getFullYear() - birthDate.getFullYear();
    const monthDiff = currentDate.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && currentDate.getDate() < birthDate.getDate())) {
        age--;
    }
    return age.toString();
}

async function getordershistory(username) {
    try {
        const response = await fetch(`/orderHistory?username=${username}`);
        const orderHistory = await response.json();
        const tableBody = document.querySelector('#orders_history tbody');
        tableBody.innerHTML = ''; 
        orderHistory.forEach(order => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${order.OrderData.id}</td>
                <td>${order.OrderData.name}</td>
                <td>${formatDate(order.OrderData.date)}</td>
                <td>${order.OrderData['delivery-status']}</td>
                <td>${order.OrderData['payment-method']}</td>
                <td>${getStatusLabel(order.OrderData['payment-status'])}</td>`;
            const cancelBtnCell = document.createElement('td');
            row.appendChild(cancelBtnCell);
            tableBody.appendChild(row);
            if (order.OrderData['delivery-status'] !== 'Rejected' && order.OrderData['payment-status'] !== 'Rejected') {
                const cancelBtn = document.createElement('button');
                cancelBtn.className = 'btn btn-danger btn-sm cancel-order';
                cancelBtn.textContent = 'Cancel';
                cancelBtn.addEventListener('click', async () => {
                    try {
                        await cancelOrder(order.OrderData.id);
                        row.querySelector('.badge').textContent = 'Rejected';
                        row.querySelector('.badge').classList.remove('badge-success');
                        row.querySelector('.badge').classList.add('badge-danger');
                        cancelBtn.remove(); 
                    } catch (error) {
                        console.error('Error cancelling order:', error);
                    }
                    window.location.reload();
                });
                cancelBtnCell.appendChild(cancelBtn);
            }
        });
        if (orderHistory.length > 0) {
            document.getElementById('orders_history').classList.remove('hide');
        } else {
            document.getElementById('empty_history').classList.remove('hide');
        }
    } catch (error) {
        console.error('Error fetching order history:', error);
    }
}

async function cancelOrder(orderId) {
    try {
        const response = await fetch('/cancelOrder', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ orderId })
        });
        if (response.ok) {
            console.log('Order cancelled successfully');
        } else {
            console.error('Failed to cancel order');
        }
    } catch (error) {
        console.error('Error cancelling order:', error);
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
