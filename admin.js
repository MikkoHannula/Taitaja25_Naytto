// Get user role from session
const userRole = sessionStorage.getItem('userRole');

// Check if user is logged in and has necessary permissions
if (!sessionStorage.getItem('isLoggedIn')) {
    window.location.href = 'login.html';
} else if (userRole !== 'admin') {
    // Hide the users tab for non-admin users
    document.querySelector('[data-tab="users"]').style.display = 'none';
    document.getElementById('users').style.display = 'none';
}

// Initialize data from localStorage or use defaults
let questions = JSON.parse(localStorage.getItem('questions')) || mockQuestions;
let categories = JSON.parse(localStorage.getItem('categories')) || mockCategories;
let results = JSON.parse(localStorage.getItem('results')) || [];
let users = JSON.parse(localStorage.getItem('users')) || [
    { id: 1, username: 'Pasi', password: 'Taitaja25!', role: 'admin' }
];

// Tab handling
document.querySelectorAll('.tab-button').forEach(button => {
    button.addEventListener('click', () => {
        document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
        button.classList.add('active');
        document.getElementById(button.dataset.tab).classList.add('active');
    });
});

// Question management
function loadQuestions() {
    const questionList = document.getElementById('questionList');
    
    // Create a section for each category
    questionList.innerHTML = categories.map(category => {
        // Get questions for this category
        const categoryQuestions = questions[category.id] || [];
        
        // Only show category section if it has questions
        if (categoryQuestions.length === 0) return '';
        
        return `
            <div class="category-section">
                <div class="category-header" onclick="toggleCategory(${category.id})">
                    <div class="header-content">
                        <span class="folder-icon">📁</span>
                        <h2>${category.name}</h2>
                        <span class="question-count">(${categoryQuestions.length} kysymystä)</span>
                    </div>
                </div>
                <div class="questions-grid" id="category-${category.id}">
                    ${categoryQuestions.map((question, index) => `
                        <div class="question-item">
                            <h3>${question.question}</h3>
                            <div class="options">
                                ${question.options.map((option, optIndex) => `
                                    <div class="option ${optIndex === question.correctAnswer ? 'correct' : ''}">
                                        ${option}
                                    </div>
                                `).join('')}
                            </div>
                            <div class="question-actions">
                                <button class="btn-secondary" onclick="editQuestion(${category.id},${index})">Muokkaa</button>
                                <button class="btn-danger" onclick="deleteQuestion(${category.id},${index})">Poista</button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }).join('');

    // Add styles for the new category sections
    if (!document.getElementById('categoryStyles')) {
        const style = document.createElement('style');
        style.id = 'categoryStyles';
        style.textContent = `
            .category-section {
                margin-bottom: 1rem;
                background: var(--container-bg);
                border-radius: 1rem;
                box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
                border: 1px solid var(--border-color);
                overflow: hidden;
            }

            .category-header {
                padding: 1.25rem 1.5rem;
                cursor: pointer;
                transition: all 0.3s ease;
                background: var(--card-bg);
                border-bottom: 1px solid var(--border-color);
            }

            .category-header:hover {
                background-color: var(--hover-color);
            }

            .header-content {
                display: flex;
                align-items: center;
                gap: 1rem;
            }

            .folder-icon {
                font-size: 1.5rem;
                transition: transform 0.3s ease;
            }

            .category-header.open .folder-icon {
                transform: rotate(-5deg);
            }

            .question-count {
                color: #6b7280;
                font-size: 0.9rem;
                font-weight: 500;
            }

            .category-header h2 {
                color: var(--primary-color);
                margin: 0;
                flex-grow: 1;
                font-size: 1.25rem;
            }

            .questions-grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
                gap: 1.25rem;
                padding: 1.5rem;
                border-top: 1px solid var(--border-color);
                opacity: 0;
                max-height: 0;
                transition: all 0.3s ease;
            }

            .questions-grid.open {
                opacity: 1;
                max-height: 2000px;
            }

            .question-item {
                background: var(--background-color);
                padding: 1.25rem;
                border-radius: 0.75rem;
                border: 1px solid var(--border-color);
                transition: all 0.2s ease;
            }

            .question-item:hover {
                transform: translateY(-2px);
                box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            }

            .question-item h3 {
                font-size: 1.1rem;
                margin-bottom: 1rem;
                color: var(--text-color);
            }

            .options {
                margin-bottom: 1.25rem;
            }

            .option {
                padding: 0.75rem;
                margin: 0.5rem 0;
                border-radius: 0.5rem;
                background: white;
                border: 1px solid var(--border-color);
                transition: all 0.2s ease;
            }

            .option.correct {
                background: #ecfdf5;
                border-color: var(--primary-color);
                color: var(--secondary-color);
            }

            .question-actions {
                display: flex;
                gap: 0.5rem;
                margin-top: 1rem;
            }

            .question-actions button {
                flex: 1;
            }

            .btn-danger {
                background-color: #fee2e2;
                color: #dc2626;
                border: 1px solid #fecaca;
            }

            .btn-danger:hover {
                background-color: #fecaca;
            }
        `;
        document.head.appendChild(style);
    }
}

// Update the toggleCategory function for smooth animations
function toggleCategory(categoryId) {
    const questionsGrid = document.getElementById(`category-${categoryId}`);
    const categoryHeader = questionsGrid.previousElementSibling;
    const isHidden = !questionsGrid.classList.contains('open');
    
    // Toggle the open class for animations
    questionsGrid.classList.toggle('open');
    categoryHeader.classList.toggle('open');
    
    // Update folder icon
    const folderIcon = categoryHeader.querySelector('.folder-icon');
    folderIcon.textContent = isHidden ? '📂' : '📁';
}

function addQuestion() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <h2>Lisää uusi kysymys</h2>
            <form id="questionForm">
                <div class="form-group">
                    <label for="category">Kategoria</label>
                    <select id="category" required>
                        ${categories.map(cat => `
                            <option value="${cat.id}">${cat.name}</option>
                        `).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label for="question">Kysymys</label>
                    <input type="text" id="question" required>
                </div>
                ${Array.from({length: 4}, (_, i) => `
                    <div class="form-group">
                        <label for="option${i}">Vaihtoehto ${i + 1}</label>
                        <input type="text" id="option${i}" required>
                    </div>
                `).join('')}
                <div class="form-group">
                    <label for="correctAnswer">Oikea vastaus</label>
                    <select id="correctAnswer" required>
                        ${Array.from({length: 4}, (_, i) => `
                            <option value="${i}">Vaihtoehto ${i + 1}</option>
                        `).join('')}
                    </select>
                </div>
                <div class="modal-actions">
                    <button type="submit" class="btn-primary">Tallenna</button>
                    <button type="button" class="btn-secondary" onclick="closeModal()">Peruuta</button>
                </div>
            </form>
        </div>
    `;

    document.body.appendChild(modal);
    document.getElementById('questionForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const categoryId = document.getElementById('category').value;
        const newQuestion = {
            question: document.getElementById('question').value,
            options: Array.from({length: 4}, (_, i) => document.getElementById(`option${i}`).value),
            correctAnswer: parseInt(document.getElementById('correctAnswer').value)
        };

        if (!questions[categoryId]) {
            questions[categoryId] = [];
        }
        questions[categoryId].push(newQuestion);
        localStorage.setItem('questions', JSON.stringify(questions));
        loadQuestions();
        closeModal();
    });
}

function editQuestion(categoryId, index) {
    const question = questions[categoryId][index];
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <h2>Muokkaa kysymystä</h2>
            <form id="editQuestionForm">
                <div class="form-group">
                    <label for="category">Kategoria</label>
                    <select id="category" required>
                        ${categories.map(cat => `
                            <option value="${cat.id}" ${cat.id === parseInt(categoryId) ? 'selected' : ''}>
                                ${cat.name}
                            </option>
                        `).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label for="question">Kysymys</label>
                    <input type="text" id="question" value="${question.question}" required>
                </div>
                ${question.options.map((option, i) => `
                    <div class="form-group">
                        <label for="option${i}">Vaihtoehto ${i + 1}</label>
                        <input type="text" id="option${i}" value="${option}" required>
                    </div>
                `).join('')}
                <div class="form-group">
                    <label for="correctAnswer">Oikea vastaus</label>
                    <select id="correctAnswer" required>
                        ${question.options.map((_, i) => `
                            <option value="${i}" ${i === question.correctAnswer ? 'selected' : ''}>
                                Vaihtoehto ${i + 1}
                            </option>
                        `).join('')}
                    </select>
                </div>
                <div class="modal-actions">
                    <button type="submit" class="btn-primary">Tallenna</button>
                    <button type="button" class="btn-secondary" onclick="closeModal()">Peruuta</button>
                </div>
            </form>
        </div>
    `;

    document.body.appendChild(modal);
    document.getElementById('editQuestionForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const newCategoryId = document.getElementById('category').value;
        const updatedQuestion = {
            question: document.getElementById('question').value,
            options: Array.from({length: 4}, (_, i) => document.getElementById(`option${i}`).value),
            correctAnswer: parseInt(document.getElementById('correctAnswer').value)
        };

        // Remove from old category
        questions[categoryId].splice(index, 1);
        
        // Add to new category
        if (!questions[newCategoryId]) {
            questions[newCategoryId] = [];
        }
        questions[newCategoryId].push(updatedQuestion);
        
        localStorage.setItem('questions', JSON.stringify(questions));
        loadQuestions();
        closeModal();
    });
}

function deleteQuestion(categoryId, index) {
    if (confirm('Haluatko varmasti poistaa tämän kysymyksen?')) {
        questions[categoryId].splice(index, 1);
        localStorage.setItem('questions', JSON.stringify(questions));
        loadQuestions();
    }
}

// Category management
function loadCategories() {
    const categoryList = document.getElementById('categoryList');
    categoryList.innerHTML = categories.map(category => `
        <div class="category-item">
            <h3>${category.name}</h3>
            <div class="category-actions">
                <button class="btn-secondary" onclick="editCategory(${category.id})">Muokkaa</button>
                <button class="btn-danger" onclick="deleteCategory(${category.id})">Poista</button>
            </div>
        </div>
    `).join('');
}

function addCategory() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <h2>Lisää uusi kategoria</h2>
            <form id="categoryForm">
                <div class="form-group">
                    <label for="categoryName">Kategorian nimi</label>
                    <input type="text" id="categoryName" required>
                </div>
                <div class="modal-actions">
                    <button type="submit" class="btn-primary">Tallenna</button>
                    <button type="button" class="btn-secondary" onclick="closeModal()">Peruuta</button>
                </div>
            </form>
        </div>
    `;

    document.body.appendChild(modal);
    document.getElementById('categoryForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const newCategory = {
            id: categories.length + 1,
            name: document.getElementById('categoryName').value
        };
        categories.push(newCategory);
        localStorage.setItem('categories', JSON.stringify(categories));
        loadCategories();
        closeModal();
    });
}

function editCategory(categoryId) {
    const category = categories.find(c => c.id === categoryId);
    if (!category) return;

    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <h2>Muokkaa kategoriaa</h2>
            <form id="editCategoryForm">
                <div class="form-group">
                    <label for="categoryName">Kategorian nimi</label>
                    <input type="text" id="categoryName" value="${category.name}" required>
                </div>
                <div class="modal-actions">
                    <button type="submit" class="btn-primary">Tallenna</button>
                    <button type="button" class="btn-secondary" onclick="closeModal()">Peruuta</button>
                </div>
            </form>
        </div>
    `;

    document.body.appendChild(modal);
    document.getElementById('editCategoryForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const index = categories.findIndex(c => c.id === categoryId);
        if (index !== -1) {
            categories[index].name = document.getElementById('categoryName').value;
            localStorage.setItem('categories', JSON.stringify(categories));
            loadCategories();
            closeModal();
        }
    });
}

function deleteCategory(categoryId) {
    if (confirm('Haluatko varmasti poistaa tämän kategorian? Kaikki kategorian kysymykset poistetaan myös.')) {
        const index = categories.findIndex(c => c.id === categoryId);
        if (index !== -1) {
            categories.splice(index, 1);
            delete questions[categoryId];
            localStorage.setItem('categories', JSON.stringify(categories));
            localStorage.setItem('questions', JSON.stringify(questions));
            loadCategories();
            loadQuestions();
        }
    }
}

// User management
function loadUsers() {
    const userList = document.getElementById('userList');
    userList.innerHTML = users.map(user => `
        <div class="category-item">
            <div>
                <h3>${user.username}</h3>
                <span class="user-role">${user.role}</span>
            </div>
            <div class="category-actions">
                <button class="btn-secondary" onclick="editUser(${user.id})">Muokkaa</button>
                <button class="btn-danger" onclick="deleteUser(${user.id})">Poista</button>
            </div>
        </div>
    `).join('');
}

function addUser() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <h2>Lisää uusi käyttäjä</h2>
            <form id="userForm">
                <div class="form-group">
                    <label for="username">Käyttäjätunnus</label>
                    <input type="text" id="username" required>
                </div>
                <div class="form-group">
                    <label for="password">Salasana</label>
                    <div class="password-container">
                        <input type="password" id="password" required>
                        <button type="button" class="password-toggle" onclick="togglePasswordVisibility('password')">
                            👁️
                        </button>
                    </div>
                </div>
                <div class="form-group">
                    <label for="role">Rooli</label>
                    <select id="role" required>
                        <option value="teacher">Opettaja</option>
                        <option value="admin">Ylläpitäjä</option>
                    </select>
                </div>
                <div class="modal-actions">
                    <button type="submit" class="btn-primary">Tallenna</button>
                    <button type="button" class="btn-secondary" onclick="closeModal()">Peruuta</button>
                </div>
            </form>
        </div>
    `;

    document.body.appendChild(modal);
    document.getElementById('userForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const newUser = {
            id: users.length + 1,
            username: document.getElementById('username').value,
            password: document.getElementById('password').value,
            role: document.getElementById('role').value
        };

        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));
        loadUsers();
        closeModal();
    });
}

function editUser(userId) {
    const user = users.find(u => u.id === userId);
    if (!user) return;

    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <h2>Muokkaa käyttäjää</h2>
            <form id="editUserForm">
                <div class="form-group">
                    <label for="username">Käyttäjätunnus</label>
                    <input type="text" id="username" value="${user.username}" required>
                </div>
                <div class="form-group">
                    <label for="password">Salasana</label>
                    <div class="password-container">
                        <input type="password" id="password" placeholder="Jätä tyhjäksi säilyttääksesi nykyisen">
                        <button type="button" class="password-toggle" onclick="togglePasswordVisibility('password')">
                            👁️
                        </button>
                    </div>
                </div>
                <div class="form-group">
                    <label for="role">Rooli</label>
                    <select id="role" required>
                        <option value="teacher" ${user.role === 'teacher' ? 'selected' : ''}>Opettaja</option>
                        <option value="admin" ${user.role === 'admin' ? 'selected' : ''}>Ylläpitäjä</option>
                    </select>
                </div>
                <div class="modal-actions">
                    <button type="submit" class="btn-primary">Tallenna</button>
                    <button type="button" class="btn-secondary" onclick="closeModal()">Peruuta</button>
                </div>
            </form>
        </div>
    `;

    document.body.appendChild(modal);
    document.getElementById('editUserForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const index = users.findIndex(u => u.id === userId);
        if (index !== -1) {
            const password = document.getElementById('password').value;
            users[index] = {
                ...users[index],
                username: document.getElementById('username').value,
                role: document.getElementById('role').value
            };
            if (password) {
                users[index].password = password;
            }
            localStorage.setItem('users', JSON.stringify(users));
            loadUsers();
            closeModal();
        }
    });
}

function deleteUser(userId) {
    if (users.length === 1) {
        alert('Et voi poistaa viimeistä käyttäjää!');
        return;
    }

    if (confirm('Haluatko varmasti poistaa tämän käyttäjän?')) {
        const index = users.findIndex(u => u.id === userId);
        if (index !== -1) {
            users.splice(index, 1);
            localStorage.setItem('users', JSON.stringify(users));
            loadUsers();
        }
    }
}

// Handle game results
function saveGameResult(playerName, category, score, total) {
    const result = {
        name: playerName,
        category: category,
        score: `${score}/${total}`,
        date: new Date().toISOString().split('T')[0]
    };
    results.push(result);
    localStorage.setItem('results', JSON.stringify(results));
    loadResults();
}

// Results management
function loadResults(page = 1) {
    const resultsPerPage = 10;
    const start = (page - 1) * resultsPerPage;
    const end = start + resultsPerPage;
    const paginatedResults = results.slice(start, end);

    const tbody = document.getElementById('resultsTableBody');
    tbody.innerHTML = paginatedResults.map(result => `
        <tr>
            <td>${result.name}</td>
            <td>${result.category}</td>
            <td>${result.score}</td>
            <td>${result.date}</td>
        </tr>
    `).join('');

    // Update pagination
    const totalPages = Math.ceil(results.length / resultsPerPage);
    const pagination = document.getElementById('resultsPagination');
    pagination.innerHTML = `
        ${Array.from({length: totalPages}, (_, i) => `
            <button class="${page === i + 1 ? 'active' : ''}" 
                    onclick="loadResults(${i + 1})">
                ${i + 1}
            </button>
        `).join('')}
    `;
}

function sortResults(by) {
    results.sort((a, b) => {
        if (by === 'score') {
            const scoreA = parseInt(a.score);
            const scoreB = parseInt(b.score);
            return scoreB - scoreA;
        } else {
            return new Date(b.date) - new Date(a.date);
        }
    });
    loadResults();
}

// Utility functions
function closeModal() {
    document.querySelector('.modal').remove();
}

function togglePasswordVisibility(inputId) {
    const passwordInput = document.getElementById(inputId);
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
    } else {
        passwordInput.type = 'password';
    }
}

// Initialize the admin panel
document.addEventListener('DOMContentLoaded', () => {
    // Display teacher name
    const teacherName = sessionStorage.getItem('teacherName');
    document.getElementById('teacherName').textContent = teacherName;

    // Add logout functionality
    document.getElementById('logoutBtn').addEventListener('click', () => {
        sessionStorage.removeItem('isLoggedIn');
        sessionStorage.removeItem('teacherName');
        window.location.href = 'login.html';
    });

    loadQuestions();
    loadCategories();
    loadResults();
    loadUsers();

    // Add event listeners for add buttons
    document.getElementById('addQuestionBtn').addEventListener('click', addQuestion);
    document.getElementById('addCategoryBtn').addEventListener('click', addCategory);
    document.getElementById('addUserBtn').addEventListener('click', addUser);
});