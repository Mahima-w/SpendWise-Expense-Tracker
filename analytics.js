
/* ========================================
   SPENDWISE - ANALYTICS
======================================== */

const expenseChartCanvas = document.getElementById("expenseChart");
const monthlyIncomeElement = document.getElementById("monthlyIncome");
const monthlyExpenseElement = document.getElementById("monthlyExpense");
const monthlySavingsElement = document.getElementById("monthlySavings");

let expenseChart;

// Format currency
function formatAnalyticsCurrency(amount) {
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 2
    }).format(amount);
}

// Parse YYYY-MM-DD as a local date
function parseLocalDate(dateString) {
    if (!dateString) return null;

    const parts = dateString.split("-").map(Number);

    if (parts.length !== 3 || parts.some(Number.isNaN)) {
        return null;
    }

    const [year, month, day] = parts;
    const date = new Date(year, month - 1, day);

    if (
        date.getFullYear() !== year ||
        date.getMonth() !== month - 1 ||
        date.getDate() !== day
    ) {
        return null;
    }

    return date;
}

// Update analytics
function updateAnalytics() {
    const savedTransactions =
        JSON.parse(localStorage.getItem("transactions")) || [];

    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    let monthlyIncome = 0;
    let monthlyExpense = 0;

    const categoryExpenses = {};

    savedTransactions.forEach(transaction => {
        const amount = Number(transaction.amount) || 0;

        // Monthly summary
        const transactionDate = parseLocalDate(transaction.date);

        if (
            transactionDate &&
            transactionDate.getMonth() === currentMonth &&
            transactionDate.getFullYear() === currentYear
        ) {
            if (transaction.type === "income") {
                monthlyIncome += amount;
            } else if (transaction.type === "expense") {
                monthlyExpense += amount;
            }
        }

        // All-time category-wise expenses for the chart
        if (transaction.type === "expense") {
            const category = transaction.category || "other";

            categoryExpenses[category] =
                (categoryExpenses[category] || 0) + amount;
        }
    });

    const monthlySavings = monthlyIncome - monthlyExpense;

    if (monthlyIncomeElement) {
        monthlyIncomeElement.textContent =
            formatAnalyticsCurrency(monthlyIncome);
    }

    if (monthlyExpenseElement) {
        monthlyExpenseElement.textContent =
            formatAnalyticsCurrency(monthlyExpense);
    }

    if (monthlySavingsElement) {
        monthlySavingsElement.textContent =
            formatAnalyticsCurrency(monthlySavings);
    }

    // Update expense chart
    if (expenseChart) {
        expenseChart.destroy();
        expenseChart = null;
    }

    if (expenseChartCanvas && typeof Chart !== "undefined") {
        const categories = Object.keys(categoryExpenses);
        const amounts = Object.values(categoryExpenses);

        expenseChart = new Chart(expenseChartCanvas, {
            type: "doughnut",
            data: {
                labels: categories,
                datasets: [{
                    label: "Expenses",
                    data: amounts,
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: "bottom"
                    }
                }
            }
        });
    }
}

// Run once when the page loads
updateAnalytics();
