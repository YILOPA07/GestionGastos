new Vue({
    el: '#app',
    data: {
        transactions: [],
        description: '',
        amount: '',
        type: 'income',
        totalIncome: 0,
        totalExpenses: 0,
        netBalance: 0,
        chart: null
    },
    methods: {
        addTransaction(event) {
            event.preventDefault();
            const transaction = {
                description: this.description,
                amount: parseFloat(this.amount),
                type: this.type
            };
            this.transactions.push(transaction);
            this.description = '';
            this.amount = '';
            this.calculosTotales();
            this.updateChart();
            this.saveTransactions();
        },
        eliminarTransaccion(event, index) {
            event.preventDefault();
            if (index >= 0 && index < this.transactions.length) {
                this.transactions.splice(index, 1);
                this.calculosTotales();
                this.updateChart();
                this.saveTransactions();
            }
        },
        calculosTotales() {
            this.totalIncome = this.transactions
                .filter(t => t.type === 'income')
                .reduce((sum, t) => sum + t.amount, 0);
            this.totalExpenses = this.transactions
                .filter(t => t.type === 'expense')
                .reduce((sum, t) => sum + t.amount, 0);
            this.netBalance = this.totalIncome - this.totalExpenses;
        },
        formatCurrency(value) {
            return new Intl.NumberFormat('es-CO', {
                style: 'currency',
                currency: 'COP'
            }).format(value);
        },
        updateChart() {
            if (this.chart) {
                const income = this.totalIncome;
                const expense = this.totalExpenses;
                this.chart.data.datasets[0].data = [income, expense];
                this.chart.update();
            }
        },
        saveTransactions() {
            localStorage.setItem('transactions', JSON.stringify(this.transactions));
        },
        loadTransactions() {
            const savedTransactions = localStorage.getItem('transactions');
            if (savedTransactions) {
                this.transactions = JSON.parse(savedTransactions);
                this.calculosTotales();
                this.updateChart();
            }
        },
        exportTransactions() {
            const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(this.transactions));
            const downloadAnchorNode = document.createElement('a');
            downloadAnchorNode.setAttribute("href", dataStr);
            downloadAnchorNode.setAttribute("download", "transacciones.json");
            document.body.appendChild(downloadAnchorNode); // Required for Firefox
            downloadAnchorNode.click();
            downloadAnchorNode.remove();
        }
    },
    mounted() {
        this.chart = new Chart(document.getElementById('expense-chart').getContext('2d'), {
            type: 'doughnut',
            data: {
                labels: ['Ingresos', 'Gastos'],
                datasets: [{
                    data: [0, 0],
                    backgroundColor: ['#4CAF50', '#FF6384']
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    title: {
                        display: true,
                        text: 'Ingresos vs Gastos'
                    }
                }
            }
        });
        this.loadTransactions();
    }
});
