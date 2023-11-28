const logEntries = []
let sortState = {
    name: 'asc',
    max_grade: 'asc',
    date: 'asc'
};

document.addEventListener('DOMContentLoaded', function () {
    fetch('./logs.json')
        .then(response => response.json())
        .then(data => {
            logEntries.push(...data);
            displayLogbookEntries(logEntries);
            createGradeChart();
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

function convertFontGradeToNumber(grade) {
    const gradeMap = {
        '1': 1, '2': 2, '3': 3,
        '4A': 4, '4B': 5, '4C': 6,
        '5A': 7, '5A+': 8, '5B': 9, '5+': 10, '5B+': 10, '5C': 11, '5C+': 12,
        '6A': 13, '6A+': 14, '6B': 15, '6B+': 16, '6C': 17, '6C+': 18,
        '7A': 19, '7A+': 20, '7B': 21, '7B+': 22, '7C': 23, '7C+': 24,
        '8A': 25, '8A+': 26, '8B': 27, '8B+': 28, '8C': 29, '8C+': 30,
    };
    return gradeMap[grade];
}

function convertNumberToFontGrade(number) {
    const reverseGradeMap = {
        1: '1', 2: '2', 3: '3',
        4: '4A', 5: '4B', 6: '4C',
        7: '5A', 8: '5A+', 9: '5B', 10: '5+', 11: '5C', 12: '5C+',
        13: '6A', 14: '6A+', 15: '6B', 16: '6B+', 17: '6C', 18: '6C+',
        19: '7A', 20: '7A+', 21: '7B', 22: '7B+', 23: '7C', 24: '7C+',
        25: '8A', 26: '8A+', 27: '8B', 28: '8B+', 29: '8C', 30: '8C+',
    };
    return reverseGradeMap[number] || number;
}

function createGradeChart() {
    logEntries.sort((a, b) => new Date(a.date) - new Date(b.date));
    const dates = logEntries.map(entry => entry.date);
    const grades = logEntries.map(entry => convertFontGradeToNumber(entry.max_grade));

    const ctx = document.getElementById('gradeChart').getContext('2d');
    const gradeChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: dates,
            datasets: [{
                label: 'Max Grades Over Time',
                data: grades,
                backgroundColor: 'rgba(255, 99, 132, 0.2)',
                borderColor: 'rgba(255, 99, 132, 1)',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: false,
                    ticks: {
                        callback: function(value, index, values) {
                            return convertNumberToFontGrade(value);
                        },
                        stepSize: 1
                    }
                }
            }
        }
    });
}


function toggleGraph() {
    const graph = document.getElementById('gradeChart');
    const button = document.getElementById('toggleGraphButton');
    if (graph.style.display === "none") {
        graph.style.display = "block";
        button.textContent = "Hide Graph";
    } else {
        graph.style.display = "none";
        button.textContent = "Show Graph";
    }
}

