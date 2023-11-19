const halls = [];
let myCoordinates = null;
let sortState = {
    name: 'asc',
    city: 'asc',
    province: 'asc',
    distance: 'asc'
};


function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition, showError);
    } else {
        console.error("Geolocation is not supported by this browser.");
        sortByName();
    }
}

function showPosition(position) {
    const warningElement = document.getElementById('warning');
    warningElement.textContent = '';
    warningElement.style.display = 'none';

    myCoordinates = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude
    };
    updateHallList();
}

function showError(error) {
    console.error("Geolocation error:", error.message);
    const warningElement = document.getElementById('warning');
    warningElement.style.display = 'block';

    if (error.code === error.PERMISSION_DENIED) {
        warningElement.textContent = "Location permissions denied. Sorting halls alphabetically.";
    }

    sortByName();
}


function loadHalls() {
    fetch('./halls.json')
        .then(response => response.json())
        .then(data => {
            halls.push(...data);
            getLocation();
        })
        .catch(error => console.error(error));
}

function updateHallList() {
    if (myCoordinates) {
        halls.forEach(hall => {
            hall.distance = calculateDistance(myCoordinates.latitude, myCoordinates.longitude, hall.latitude, hall.longitude);
        });
        halls.sort((a, b) => a.distance - b.distance);
    } else {
        sortByName();
    }
    displayHalls(halls);
}

function sortByName() {
    halls.sort((a, b) => {
        return sortState.name === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
    });
    sortState.name = sortState.name === 'asc' ? 'desc' : 'asc';
    displayHalls(halls);
}

function sortByCity() {
    halls.sort((a, b) => {
        return sortState.city === 'asc' ? a.city.localeCompare(b.city) : b.city.localeCompare(a.city);
    });
    sortState.city = sortState.city === 'asc' ? 'desc' : 'asc';
    displayHalls(halls);
}

function sortByProvince() {
    halls.sort((a, b) => {
        return sortState.province === 'asc' ? a.province.localeCompare(b.province) : b.province.localeCompare(a.province);
    });
    sortState.province = sortState.province === 'asc' ? 'desc' : 'asc';
    displayHalls(halls);
}

function sortByDistance() {
    halls.sort((a, b) => {
        if (!a.distance || !b.distance) return !a.distance ? 1 : -1;
        return sortState.distance === 'asc' ? a.distance - b.distance : b.distance - a.distance;
    });
    sortState.distance = sortState.distance === 'asc' ? 'desc' : 'asc';
    displayHalls(halls);
}

function filterHalls() {
    const searchQuery = document.getElementById('searchInput').value.toLowerCase();
    const filteredHalls = halls.filter(hall =>
        hall.name.toLowerCase().includes(searchQuery) || hall.city.toLowerCase().includes(searchQuery) || hall.province.toLowerCase().includes(searchQuery)
    );
    displayHalls(filteredHalls);
}

function displayHalls(hallList) {
    const tableBody = document.getElementById('hallTable').querySelector('tbody');
    tableBody.innerHTML = '';

    hallList.forEach(hall => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${hall.name}</td>
            <td>${hall.city}</td>
            <td>${hall.province}</td>
            <td>${hall.distance ? `${hall.distance.toFixed(2)} km` : 'N/A'}</td>
        `;
        tableBody.appendChild(row);
    });
}

function calculateDistance(lat1, lon1, lat2, lon2) {
    if (!lat1 || !lon1 || !lat2 || !lon2) return null;

    const toRadians = degree => degree * Math.PI / 180;
    let R = 6371;
    let dLat = toRadians(lat2 - lat1);
    let dLon = toRadians(lon2 - lon1);
    let a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}


loadHalls();
