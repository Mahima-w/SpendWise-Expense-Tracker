// ========================================
// SPENDWISE - EXPENSE TRACKER
// COMPLETE SCRIPT.JS
// ========================================


// ========================================
// DOM ELEMENTS
// ========================================

const transactionForm =
    document.getElementById("transactionForm");

const transactionType =
    document.getElementById("transactionType");

const amountInput =
    document.getElementById("amount");

const descriptionInput =
    document.getElementById("description");

const categoryInput =
    document.getElementById("category");

const dateInput =
    document.getElementById("date");

const transactionList =
    document.getElementById("transactionList");

const totalBalance =
    document.getElementById("totalBalance");

const totalIncome =
    document.getElementById("totalIncome");

const totalExpense =
    document.getElementById("totalExpense");


// ========================================
// SEARCH & FILTER ELEMENTS
// ========================================

const searchInput =
    document.getElementById("searchInput");

const categoryFilter =
    document.getElementById("categoryFilter");

const filterButtons =
    document.querySelectorAll(".filter-btn");

let currentTypeFilter = "all";


// ========================================
// TRANSACTIONS DATA
// ========================================

// Load transactions from LocalStorage

let transactions =
    JSON.parse(localStorage.getItem("transactions")) || [];


// Used when editing a transaction

let editingTransactionId = null;


// ========================================
// FORM SUBMIT
// ADD / UPDATE TRANSACTION
// ========================================

transactionForm.addEventListener(
    "submit",
    function (event) {

        event.preventDefault();


        // Get form values

        const type =
            transactionType.value;

        const amount =
            parseFloat(amountInput.value);

        const description =
            descriptionInput.value.trim();

        const category =
            categoryInput.value;

        const date =
            dateInput.value;


        // ========================================
        // VALIDATION
        // ========================================

        if (
            !type ||
            !amount ||
            amount <= 0 ||
            !description ||
            !category ||
            !date
        ) {

            alert("Please fill all fields correctly.");

            return;
        }


        // ========================================
        // EDIT EXISTING TRANSACTION
        // ========================================

        if (editingTransactionId !== null) {

            const index =
                transactions.findIndex(
                    function (transaction) {

                        return transaction.id ===
                            editingTransactionId;

                    }
                );


            if (index !== -1) {

                transactions[index] = {

                    id: editingTransactionId,

                    type: type,

                    amount: amount,

                    description: description,

                    category: category,

                    date: date

                };

            }


            const wasEditing = editingTransactionId !== null;

            editingTransactionId = null;


            // Change button text back

            document.querySelector(".add-btn").textContent =
                "➕ Add Transaction";

        }


        // ========================================
        // ADD NEW TRANSACTION
        // ========================================

        else {

            const newTransaction = {

                id: Date.now(),

                type: type,

                amount: amount,

                description: description,

                category: category,

                date: date

            };


            transactions.push(newTransaction);

        }


        // ========================================
        // SAVE TO LOCAL STORAGE
        // ========================================

        saveTransactions();


        // ========================================
        // UPDATE UI
        // ========================================

        updateDashboard();

        displayTransactions();


        // ========================================
        // RESET FORM
        // ========================================

        transactionForm.reset();


        alert(
    wasEditing
        ? "Transaction updated successfully!"
        : "Transaction added successfully!"
);
    }
);


// ========================================
// SAVE TRANSACTIONS
// ========================================

function saveTransactions() {

    localStorage.setItem(
        "transactions",
        JSON.stringify(transactions)
    );

}


// ========================================
// UPDATE DASHBOARD
// ========================================

function updateDashboard() {

    let income = 0;

    let expense = 0;


    transactions.forEach(
        function (transaction) {

            if (transaction.type === "income") {

                income +=
                    Number(transaction.amount);

            }

            else if (transaction.type === "expense") {

                expense +=
                    Number(transaction.amount);

            }

        }
    );


    const balance =
        income - expense;


    // Update dashboard

    totalIncome.textContent =
        formatCurrency(income);

    totalExpense.textContent =
        formatCurrency(expense);

    totalBalance.textContent =
        formatCurrency(balance);

}


// ========================================
// DISPLAY / FILTER TRANSACTIONS
// ========================================

function displayTransactions() {

    transactionList.innerHTML = "";


    // ========================================
    // GET FILTER VALUES
    // ========================================

    const searchText =
        searchInput.value
            .toLowerCase()
            .trim();


    const selectedCategory =
        categoryFilter.value;


    // ========================================
    // FILTER TRANSACTIONS
    // ========================================

    const filteredTransactions =
        transactions.filter(
            function (transaction) {


                const description =
                    String(
                        transaction.description || ""
                    ).toLowerCase();


                const category =
                    String(
                        transaction.category || ""
                    ).toLowerCase();


                // Search

                const matchesSearch =
                    description.includes(searchText) ||
                    category.includes(searchText);


                // Income / Expense

                const matchesType =
                    currentTypeFilter === "all" ||
                    transaction.type ===
                    currentTypeFilter;


                // Category

                const matchesCategory =
                    selectedCategory === "all" ||
                    transaction.category ===
                    selectedCategory;


                return (
                    matchesSearch &&
                    matchesType &&
                    matchesCategory
                );

            }
        );


    // ========================================
    // NO TRANSACTIONS
    // ========================================

    if (filteredTransactions.length === 0) {

        transactionList.innerHTML = `

            <div class="empty-state">

                <div class="empty-icon">
                    🔍
                </div>

                <h3>
                    No Transactions Found
                </h3>

                <p>
                    Try changing your search
                    or filter.
                </p>

            </div>

        `;

        return;
    }


    // ========================================
    // DISPLAY TRANSACTIONS
    // ========================================

    filteredTransactions.forEach(
        function (transaction) {


            const transactionItem =
                document.createElement("div");


            transactionItem.classList.add(
                "transaction-item"
            );


            // Income = +
            // Expense = -

            const sign =
                transaction.type === "income"
                    ? "+"
                    : "-";


            transactionItem.innerHTML = `

                <div class="transaction-info">

                    <div class="transaction-icon">

                        ${getCategoryIcon(
                            transaction.category
                        )}

                    </div>


                    <div>

                        <h3>
                            ${transaction.description}
                        </h3>

                        <p>
                            ${transaction.category}
                            •
                            ${transaction.date}
                        </p>

                    </div>

                </div>


                <div class="transaction-right">

                    <div class="transaction-amount
                                ${transaction.type}">

                        ${sign}${formatCurrency(
                            transaction.amount
                        )}

                    </div>


                    <button
                        class="edit-btn"
                        onclick="editTransaction(${transaction.id})">

                        ✏️

                    </button>


                    <button
                        class="delete-btn"
                        onclick="deleteTransaction(${transaction.id})">

                        🗑️

                    </button>

                </div>

            `;


            transactionList.appendChild(
                transactionItem
            );

        }
    );

}


// ========================================
// EDIT TRANSACTION
// ========================================

function editTransaction(id) {

    const transaction =
        transactions.find(
            function (transaction) {

                return transaction.id === id;

            }
        );


    if (!transaction) {

        return;

    }


    // Put transaction data into form

    transactionType.value =
        transaction.type;

    amountInput.value =
        transaction.amount;

    descriptionInput.value =
        transaction.description;

    categoryInput.value =
        transaction.category;

    dateInput.value =
        transaction.date;


    // Store editing ID

    editingTransactionId =
        id;


    // Change button text

    document.querySelector(".add-btn").textContent =
        "✏️ Update Transaction";


    // Scroll to form

    transactionForm.scrollIntoView({
        behavior: "smooth",
        block: "center"
    });

}


// ========================================
// DELETE TRANSACTION
// ========================================


/* ========================================
   DELETE TRANSACTION
======================================== */

function deleteTransaction(id) {
    const confirmDelete = confirm(
        "Are you sure you want to delete this transaction?"
    );

    if (!confirmDelete) {
        return;
    }

    // Remove transaction
    transactions = transactions.filter(function (transaction) {
        return transaction.id !== id;
    });

    // Save updated transactions
    saveTransactions();

    // Refresh dashboard and transaction list
    updateDashboard();
    displayTransactions();

    // Refresh analytics if available
    if (typeof updateAnalytics === "function") {
        updateAnalytics();
    }

    alert("Transaction deleted successfully!");
}

    // Save updated data

   saveTransactions();
updateDashboard();
displayTransactions();

if (typeof updateAnalytics === "function") {
    updateAnalytics();
}

    // Update screen

    updateDashboard();

    displayTransactions();




// ========================================
// CATEGORY ICON
// ========================================


function getCategoryIcon(category) {
    const icons = {
        food: "🍔",
        shopping: "🛍️",
        transport: "🚌",
        bills: "💡",
        entertainment: "🎬",
        health: "💊",
        education: "📚",
        salary: "💰",
        freelance: "💻",
        other: "📦"
    };

    return icons[String(category || "").toLowerCase()] || "💳";
}


// ========================================
// CURRENCY FORMAT
// ========================================

function formatCurrency(amount) {

    return new Intl.NumberFormat(
        "en-IN",
        {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 2
        }
    ).format(amount);

}


// ========================================
// SEARCH
// ========================================

searchInput.addEventListener(
    "input",
    function () {

        displayTransactions();

    }
);


// ========================================
// INCOME / EXPENSE FILTER
// ========================================

filterButtons.forEach(
    function (button) {

        button.addEventListener(
            "click",
            function () {


                // Remove active from all buttons

                filterButtons.forEach(
                    function (btn) {

                        btn.classList.remove(
                            "active"
                        );

                    }
                );


                // Add active to clicked button

                button.classList.add(
                    "active"
                );


                // Get selected type

                currentTypeFilter =
                    button.dataset.type;


                // Display filtered transactions

                displayTransactions();

            }
        );

    }
);


// ========================================
// CATEGORY FILTER
// ========================================

categoryFilter.addEventListener(
    "change",
    function () {

        displayTransactions();

    }
);


// ========================================
// INITIAL LOAD
// ========================================

updateDashboard();

displayTransactions();