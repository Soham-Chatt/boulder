const logEntries = []
let sortState = {
    name: 'asc',
    max_grade: 'asc',
    date: 'desc'
};

document.addEventListener('DOMContentLoaded', function () {
    fetch('./logs.json')
        .then(response => response.json())
        .then(data => {
            logEntries.push(...data);
            displayLogbookEntries(logEntries);
            updateSearchBar();
            sortByDate();
        })
        .catch(error => console.error('Error loading logbook data:', error));

});

function filterLogEntries() {
    const searchQuery = document.getElementById('searchLogInput').value.toLowerCase();
    const filteredLogs = logEntries.filter(entry =>
        entry.name.toLowerCase().includes(searchQuery) || entry.max_grade.toLowerCase().includes(searchQuery) || entry.date.toLowerCase().includes(searchQuery)
    );
    displayLogbookEntries(filteredLogs);
}

function sortByName() {
    sortState.name = sortState.name === 'asc' ? 'desc' : 'asc';
    logEntries.sort((a, b) => sortState.name === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name));
    displayLogbookEntries(logEntries);
}

function sortByGrade() {
    sortState.max_grade = sortState.max_grade === 'asc' ? 'desc' : 'asc';
    logEntries.sort((a, b) => sortState.max_grade === 'asc' ? (a.max_grade > b.max_grade ? 1 : a.max_grade < b.max_grade ? -1 : 0) : (a.max_grade < b.max_grade ? 1 : a.max_grade > b.max_grade ? -1 : 0));
    displayLogbookEntries(logEntries);
}

function sortByDate() {
    sortState.date = sortState.date === 'asc' ? 'desc' : 'asc';
    logEntries.sort((a, b) => sortState.date === 'asc' ? new Date(a.date) - new Date(b.date) : new Date(b.date) - new Date(a.date));
    displayLogbookEntries(logEntries);
}

function updateSearchBar() {
    document.getElementById('searchLogInput').placeholder = `Search ${logEntries.length} entries...`;
}

function displayLogbookEntries(logList) {
    const tableBody = document.getElementById('logbookEntries');
    tableBody.innerHTML = '';
    logList.forEach(entry => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${entry.name}</td>
            <td>${entry.max_grade}</td>
            <td>${entry.date}</td>
        `;
        tableBody.appendChild(row);
    });
}

