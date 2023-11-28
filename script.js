const halls = [];
const visitedColour = '#2f7531';
let myCoordinates = null;
let sortState = {
    name: 'asc',
    city: 'asc',
    province: 'asc',
    distance: 'asc',
    visited: false,
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
    const mapButton = document.getElementById('toggleMapButton');
    mapButton.disabled = true;
    warningElement.style.display = 'block';
    warningElement.innerHTML = `
        <button type="button" class="btn-close" aria-label="Close" onclick="closeWarning()"></button>
        <strong>Warning:</strong> Location permissions denied. Try again with location permissions to get distances.
    `;
}

function renderMap() {
    if (myCoordinates) {
        const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${myCoordinates.longitude-0.025}%2C${myCoordinates.latitude-0.015}%2C${myCoordinates.longitude+0.025}%2C${myCoordinates.latitude+0.015}&layer=mapnik&marker=${myCoordinates.latitude}%2C${myCoordinates.longitude}`;
        document.getElementById('map').innerHTML = `<iframe width="100%" height="400" src="${mapUrl}"></iframe>`;
    }
}

function toggleMap() {
    const map = document.getElementById('map');
    const button = document.getElementById('toggleMapButton');
    const locationLabel = document.getElementById('locationLabel');

    if (map.style.display === "none") {
        if (!myCoordinates) return alert("Location is not enabled.");
        renderMap();
        map.style.display = "block";
        button.textContent = "Hide Map";
        locationLabel.textContent = "Your Location";
    } else {
        map.style.display = "none";
        button.textContent = "Show Map";
        locationLabel.textContent = "";
    }
}

function closeWarning() {
    const warningElement = document.getElementById('warning');
    warningElement.style.display = 'none';
}

function loadHalls() {
    fetch('./halls.json')
        .then(response => response.json())
        .then(data => {
            halls.push(...data);
            console.log(halls);
            updateVisitedCounter();
            updateSearchBar(halls.length);
            sortByName();
            getLocation();
        })
        .catch(error => console.error(error));
}

function updateSearchBar(count) {
    document.getElementById('searchInput').placeholder = `Search ${count} halls...`;
}

function updateVisitedCounter() {
    const visitedCount = halls.filter(hall => hall.visited).length;
    document.getElementById('visitedCounter').textContent = `${visitedCount} Visited`;
}

function updateHallList() {
    if (myCoordinates) {
        halls.forEach(hall => {
            hall.distance = calculateDistance(myCoordinates.latitude, myCoordinates.longitude, hall.latitude, hall.longitude);
        });
        sortByDistance();
        sortState.name = 'asc';
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
        const cityCompare = sortState.city === 'asc' ? a.city.localeCompare(b.city) : b.city.localeCompare(a.city);
        if (cityCompare === 0) {
            return a.name.localeCompare(b.name);
        }
        return cityCompare;
    });
    sortState.city = sortState.city === 'asc' ? 'desc' : 'asc';
    displayHalls(halls);
}

function sortByProvince() {
    halls.sort((a, b) => {
        const provinceCompare = sortState.province === 'asc' ? a.province.localeCompare(b.province) : b.province.localeCompare(a.province);
        if (provinceCompare === 0) {
            return a.name.localeCompare(b.name);
        }
        return provinceCompare;
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

function showVisited() {
    displayHalls(sortState.visited ? halls : halls.filter(hall => hall.visited));
    sortState.visited = !sortState.visited;
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
            <td class="text-white" style="${hall.visited ? `background-color: ${visitedColour};` : ''}">${hall.name}</td>
            <td class="text-white" style="${hall.visited ? `background-color: ${visitedColour};` : ''}">${hall.city}</td>
            <td class="text-white" style="${hall.visited ? `background-color: ${visitedColour};` : ''}">${hall.province}</td>
            <td class="text-white" style="${hall.visited ? `background-color: ${visitedColour};` : ''}">${hall.distance ? `${hall.distance.toFixed(2)} km` : 'N/A'}</td>
        `;
        tableBody.appendChild(row);
    });
    updateSearchBar(hallList.length);
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
