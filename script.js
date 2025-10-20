// Price Calculator Application
class PriceCalculator {
    constructor() {
        this.tableCounter = 1;
        this.initializeElements();
        this.bindEvents();
        this.setDefaultDates();
        this.scheduleMidnightUpdate();
        this.ensureClientNameEmpty();
        this.calculateAll();
        
        // Force clear client name field after a short delay
        setTimeout(() => {
            if (this.clientName) {
                this.clientName.value = '';
                this.clientName.placeholder = 'أدخل اسم العميل';
            }
        }, 100);
    }

    scheduleMidnightUpdate() {
        const now = new Date();
        const nextMidnight = new Date(now);
        nextMidnight.setHours(24, 0, 0, 0); // start of next day
        const msUntilMidnight = nextMidnight - now;

        setTimeout(() => {
            this.setDefaultDates();
            this.calculateAll();
            setInterval(() => {
                this.setDefaultDates();
                this.calculateAll();
            }, 24 * 60 * 60 * 1000);
        }, msUntilMidnight);
    }

    initializeElements() {
        // Customer info inputs
        this.clientName = document.getElementById('clientName');
        this.currentDate = document.getElementById('currentDate');
        this.validUntil = document.getElementById('validUntil');
        this.daysPerWeek = document.getElementById('daysPerWeek');
        this.hoursPerDay = document.getElementById('hoursPerDay');

        // Table management
        this.tablesContainer = document.getElementById('tablesContainer');
        this.addTableBtn = document.getElementById('addTableBtn');

        // Setup fee
        this.setupFee = document.getElementById('setupFee');

        // Buttons
        this.calculateBtn = document.getElementById('calculateBtn');
        this.printBtn = document.getElementById('printBtn');
        this.exportBtn = document.getElementById('exportBtn');
        this.resetBtn = document.getElementById('resetBtn');
    }

    bindEvents() {
        // Customer info changes - no longer needed

        // Table management
        this.addTableBtn.addEventListener('click', () => this.addNewTable());

        // Button events
        this.calculateBtn.addEventListener('click', () => this.calculateAll());
        this.printBtn.addEventListener('click', () => this.printQuote());
        this.exportBtn.addEventListener('click', () => this.exportToPDF());
        this.resetBtn.addEventListener('click', () => this.resetAll());

        // Bind table events
        this.bindTableEvents();
    }

    setDefaultDates() {
        const today = new Date();
        const validUntil = new Date(today);
        validUntil.setDate(today.getDate() + 7);

        // Format dates as dd/mm/yyyy
        const formatDate = (date) => {
            const day = String(date.getDate()).padStart(2, '0');
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const year = date.getFullYear();
            return `${day}/${month}/${year}`;
        };

        this.currentDate.value = formatDate(today);
        this.validUntil.value = formatDate(validUntil);
    }

    ensureClientNameEmpty() {
        // Ensure client name field is empty
        if (this.clientName) {
            this.clientName.value = '';
            this.clientName.placeholder = 'أدخل اسم العميل';
            // Force clear any existing text
            this.clientName.setAttribute('value', '');
        }
    }

    syncAllMonths(sourceTable, sourceMonths) {
        const months = parseInt(sourceMonths) || 1;
        
        // Only sync within the same table
        this.syncWithinTable(sourceTable, months);
        
        // Recalculate this table
        this.calculateTable(sourceTable);
    }

    syncWithinTable(table, months) {
        // Update all months inputs within the same table
        const monthsInputs = table.querySelectorAll('.months-input');
        
        monthsInputs.forEach(input => {
            input.value = months;
        });
    }



    bindTableEvents() {
        // Bind events for existing tables
        const tables = this.tablesContainer.querySelectorAll('.table-wrapper');
        tables.forEach(table => {
            this.bindTableEventListeners(table);
        });
    }

    bindTableEventListeners(table) {
        const quantityInputs = table.querySelectorAll('.quantity-input');
        const monthsInputs = table.querySelectorAll('.months-input');
        const costInputs = table.querySelectorAll('.cost-input');

        // Bind quantity and cost inputs
        [...quantityInputs, ...costInputs].forEach(input => {
            input.addEventListener('input', () => this.calculateTable(table));
        });

        // Bind months inputs to sync with all other months inputs
        monthsInputs.forEach(input => {
            input.addEventListener('input', () => {
                this.syncAllMonths(table, input.value);
            });
        });
    }

    addNewTable() {
        this.tableCounter++;
        const tableId = this.tableCounter;
        
        const tableHTML = `
            <div class="table-wrapper" data-table-id="${tableId}">
                <div class="table-controls">
                    <span class="table-title">جدول التكلفة #${tableId}</span>
                    <button class="remove-table-btn" onclick="removeTable(${tableId})">حذف الجدول</button>
                </div>
                <table class="pricing-table">
                    <thead>
                        <tr>
                            <th>البند</th>
                            <th>العدد</th>
                            <th>عدد الأشهر</th>
                            <th>التكلفة الإجمالية</th>
                            <th>الإجمالي</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>ممثل خدمة العملاء</td>
                            <td><input type="number" class="quantity-input" value="1" min="1"></td>
                            <td><input type="number" class="months-input" value="1" min="1"></td>
                            <td><input type="number" class="cost-input" value="2500" min="0"></td>
                            <td class="total item-total">2,500</td>
                        </tr>
                        <tr>
                            <td>مركز الاتصال السحابي</td>
                            <td>-</td>
                            <td>-</td>
                            <td>مجاني</td>
                            <td class="total">0</td>
                        </tr>
                    </tbody>
                    <tfoot>
                        <tr class="subtotal">
                            <td colspan="4">إجمالي المبلغ</td>
                            <td class="total table-subtotal">2,500</td>
                        </tr>
                        <tr class="discount">
                            <td colspan="4">الإجمالي بعد الخصم</td>
                            <td class="total table-discounted">2,500</td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        `;

        this.tablesContainer.insertAdjacentHTML('beforeend', tableHTML);
        
        // Bind events for the new table
        const newTable = this.tablesContainer.querySelector(`[data-table-id="${tableId}"]`);
        this.bindTableEventListeners(newTable);
        
        // Initialize new table with default values (no sync with other tables)
        // The new table will have its own independent months values
        
        // Calculate the new table
        this.calculateTable(newTable);
    }

    calculateTable(table) {
        const rows = table.querySelectorAll('tbody tr');
        let tableTotal = 0;

        rows.forEach((row, index) => {
            const itemTotal = row.querySelector('.item-total');
            if (!itemTotal) return;

            if (index === 1) { // Cloud center - free
                itemTotal.textContent = '0';
            } else { // Regular items (representative)
                const quantity = parseFloat(row.querySelector('.quantity-input')?.value) || 0;
                const months = parseFloat(row.querySelector('.months-input')?.value) || 0;
                const cost = parseFloat(row.querySelector('.cost-input')?.value) || 0;
                const total = quantity * months * cost;
                itemTotal.textContent = this.formatNumber(total);
                tableTotal += total;
            }
        });

        // Update table totals
        const subtotal = table.querySelector('.table-subtotal');
        const discounted = table.querySelector('.table-discounted');
        
        if (subtotal) {
            subtotal.textContent = this.formatNumber(tableTotal);
        }
        
        if (discounted) {
            // Get the months value from the first months input in the table
            const monthsInput = table.querySelector('.months-input');
            const months = parseInt(monthsInput?.value) || 1;
            
            // Calculate discount based on months
            const discountPercentage = this.getDiscountPercentage(months);
            
            if (discountPercentage > 0) {
                const discount = tableTotal * (discountPercentage / 100);
                const discountedTotal = tableTotal - discount;
                
                // Round down to nearest 100
                const roundedTotal = this.roundToNearest100(discountedTotal);
                discounted.textContent = this.formatNumber(roundedTotal);
            } else {
                // No discount, show original total
                discounted.textContent = this.formatNumber(tableTotal);
            }
        }
    }

    calculateAll() {
        const tables = this.tablesContainer.querySelectorAll('.table-wrapper');
        tables.forEach(table => {
            this.calculateTable(table);
        });
    }


    formatNumber(number) {
        return new Intl.NumberFormat('en-US').format(number);
    }

    getDiscountPercentage(months) {
        if (months === 3) return 10;
        if (months === 4) return 10;
        if (months === 5) return 10;
        if (months === 6) return 15;
        if (months === 7) return 15;
        if (months === 8) return 15;
        if (months === 9) return 20;
        if (months === 10) return 20;
        if (months === 11) return 20;
        if (months === 12) return 25;
        return 0; // No discount for other values
    }

    roundToNearest100(number) {
        return Math.floor(number / 100) * 100;
    }

    printQuote() {
        // Hide action buttons for printing
        const actions = document.querySelector('.actions');
        actions.style.display = 'none';
        
        // Print the page
        window.print();
        
        // Show action buttons again
        setTimeout(() => {
            actions.style.display = 'flex';
        }, 1000);
    }

    exportToPDF() {
        // Simple PDF export using browser's print to PDF
        alert('لتصدير PDF، استخدم زر الطباعة واختر "حفظ كـ PDF" من خيارات الطابعة');
        this.printQuote();
    }

    resetAll() {
        if (confirm('هل أنت متأكد من إعادة تعيين جميع البيانات؟')) {
            // Reset customer info
            this.clientName.value = '';
            this.daysPerWeek.value = 6;
            this.hoursPerDay.value = 8;
            this.setDefaultDates();

            // Reset all tables to default values
            const tables = this.tablesContainer.querySelectorAll('.table-wrapper');
            tables.forEach(table => {
                this.resetTable(table);
            });

            this.calculateAll();
        }
    }

    resetTable(table) {
        const quantityInputs = table.querySelectorAll('.quantity-input');
        const monthsInputs = table.querySelectorAll('.months-input');
        const costInputs = table.querySelectorAll('.cost-input');

        // Reset to default values
        quantityInputs[0].value = 1; // Representative
        monthsInputs[0].value = 1;   // Representative months
        costInputs[0].value = 2500; // Representative cost

        // Sync all months to 1 within this table only
        this.syncWithinTable(table, 1);
        this.calculateTable(table);
    }
}

// Global function to remove table
function removeTable(tableId) {
    const table = document.querySelector(`[data-table-id="${tableId}"]`);
    if (table) {
        if (confirm('هل أنت متأكد من حذف هذا الجدول؟')) {
            table.remove();
        }
    }
}

// Initialize the application when the page loads
document.addEventListener('DOMContentLoaded', function() {
    const calculator = new PriceCalculator();
    
    // Add some additional utility functions
    window.calculator = calculator;
    
    // Add keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        if (e.ctrlKey && e.key === 'p') {
            e.preventDefault();
            calculator.printQuote();
        }
        if (e.ctrlKey && e.key === 'r') {
            e.preventDefault();
            calculator.resetAll();
        }
        if (e.ctrlKey && e.key === 'n') {
            e.preventDefault();
            calculator.addNewTable();
        }
    });
    
    // Add auto-save functionality (do not persist dates to always show today's date)
    setInterval(() => {
        const data = {
            clientName: calculator.clientName.value,
        };
        localStorage.setItem('priceQuoteData', JSON.stringify(data));
    }, 30000); // Auto-save every 30 seconds
    
    // Load saved data
    const savedData = localStorage.getItem('priceQuoteData');
    if (savedData) {
        try {
            const data = JSON.parse(savedData);
            if (data.clientName) calculator.clientName.value = data.clientName;
            // Do not restore dates; keep today's date set by setDefaultDates()
            calculator.calculateAll();
        } catch (e) {
            console.log('No saved data found');
        }
    }
});

