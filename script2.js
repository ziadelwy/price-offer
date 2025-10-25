// Price Calculator Application
class PriceCalculator {
    constructor() {
        this.tableCounter = 1;
        this.initializeElements();
        this.bindEvents();
        this.setDefaultDates();
        this.ensureClientNameEmpty();
        this.calculateAll(); // تأكد من حساب القيم فور التحميل
    }

    initializeElements() {
        this.clientName = document.getElementById('clientName');
        this.currentDate = document.getElementById('currentDate');
        this.validUntil = document.getElementById('validUntil');
        this.daysPerWeek = document.getElementById('daysPerWeek');
        this.hoursPerDay = document.getElementById('hoursPerDay');
        this.tablesContainer = document.getElementById('tablesContainer');
        this.addTableBtn = document.getElementById('addTableBtn');
        this.setupFee = document.getElementById('setupFee');
        this.calculateBtn = document.getElementById('calculateBtn');
        this.printBtn = document.getElementById('printBtn');
        this.exportBtn = document.getElementById('exportBtn');
        this.resetBtn = document.getElementById('resetBtn');
    }

    bindEvents() {
        this.addTableBtn.addEventListener('click', () => this.addNewTable());
        this.calculateBtn.addEventListener('click', () => this.calculateAll());
        this.printBtn.addEventListener('click', () => this.printQuote());
        this.exportBtn.addEventListener('click', () => this.exportToPDF());
        this.resetBtn.addEventListener('click', () => this.resetAll());

        this.bindTableEvents();
    }

    setDefaultDates() {
        const today = new Date();
        const validUntil = new Date(today);
        validUntil.setDate(today.getDate() + 7);

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
        if (this.clientName) {
            this.clientName.value = '';
            this.clientName.placeholder = 'أدخل اسم العميل';
            this.clientName.setAttribute('value', '');
        }
    }

    syncAllQuantities(sourceTable, sourceQuantity) {
        const quantity = parseInt(sourceQuantity) || 1;
        this.syncWithinTable(sourceTable, quantity, 'quantity');
        this.calculateTable(sourceTable);
    }

    syncWithinTable(table, value, type) {
        let inputs;
        if (type === 'months') {
            inputs = table.querySelectorAll('.months-input, .crm-months-input');
        } else if (type === 'quantity') {
            inputs = table.querySelectorAll('.quantity-input');
        }
        
        if (inputs) {
            inputs.forEach(input => {
                input.value = value;
            });
        }
    }

    bindTableEvents() {
        const tables = this.tablesContainer.querySelectorAll('.table-wrapper');
        tables.forEach(table => {
            this.bindTableEventListeners(table);
        });
    }

    bindTableEventListeners(table) {
        const quantityInputs = table.querySelectorAll('.quantity-input');
        const monthsInputs = table.querySelectorAll('.months-input');
        const costInputs = table.querySelectorAll('.cost-input');
        const crmMonthsInputs = table.querySelectorAll('.crm-months-input');
        const crmCostInputs = table.querySelectorAll('.crm-cost-input');

        // ربط الأحداث لحساب الجدول عند تغيير التكلفة
        [...costInputs, ...crmCostInputs].forEach(input => {
            input.addEventListener('input', () => this.calculateTable(table));
        });

        // ربط الأحداث لحساب الجدول عند تغيير عدد الأشهر (بدون مزامنة)
        [...monthsInputs, ...crmMonthsInputs].forEach(input => {
            input.addEventListener('input', () => {
                this.calculateTable(table);
            });
        });

        // ربط الأحداث لمزامنة الكمية وحساب الجدول عند تغيير العدد
        quantityInputs.forEach(input => {
            input.addEventListener('input', () => {
                this.syncAllQuantities(table, input.value);
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
                            <th>التكلفة الشهرية</th>
                            <th>الإجمالي</th>
                            <th>الإجمالي بعد الخصم</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>ممثل خدمة العملاء</td>
                            <td><input type="number" class="quantity-input" value="1" min="1"></td>
                            <td><input type="number" class="months-input" value="1" min="1"></td>
                            <td><input type="number" class="cost-input" value="2500" min="0"></td>
                            <td class="total item-total"></td>
                            <td class="total discounted-total"></td>
                        </tr>
                        <tr>
                            <td>باقة الدقائق 4000 دقيقة</td>
                            <td><input type="number" class="quantity-input" value="1" min="1"></td>
                            <td><input type="number" class="months-input" value="1" min="1"></td>
                            <td><input type="number" class="cost-input" value="1200" min="0"></td>
                            <td class="total item-total"></td>
                            <td class="total discounted-total"></td>
                        </tr>
                        <tr>
                            <td>سعر Callva CRM</td>
                            <td>1</td>
                            <td><input type="number" class="crm-months-input" value="1" min="1"></td>
                            <td><input type="number" class="crm-cost-input" value="50" min="0"></td>
                            <td class="total item-total"></td>
                            <td class="total discounted-total"></td>
                        </tr>
                        <tr>
                            <td>مركز الاتصال السحابي</td>
                            <td>1</td>
                            <td>1</td>
                            <td>مجاني</td>
                            <td class="total">0</td>
                            <td class="total">0</td>
                        </tr>
                    </tbody>
                    <tfoot>
                        <tr class="subtotal">
                            <td colspan="4">إجمالي المبلغ</td>
                            <td class="total table-subtotal"></td>
                            <td class="total table-discounted"></td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        `;

        this.tablesContainer.insertAdjacentHTML('beforeend', tableHTML);
        const newTable = this.tablesContainer.querySelector(`[data-table-id="${tableId}"]`);
        this.bindTableEventListeners(newTable);
        this.calculateTable(newTable);
    }

    calculateTable(table) {
        const rows = table.querySelectorAll('tbody tr');
        let tableTotal = 0;
        let tableDiscounted = 0;
    
        rows.forEach(row => {
            const itemTotalCell = row.querySelector('.item-total');
            const discountedTotalCell = row.querySelector('.discounted-total');
            if (!itemTotalCell || !discountedTotalCell) return;
    
            const quantity = parseFloat(row.querySelector('.quantity-input')?.value) || 1;
            const months = parseFloat(row.querySelector('.months-input')?.value) || 1;
            const cost = parseFloat(row.querySelector('.cost-input')?.value) || 0;
    
            // الحساب العادي
            const total = quantity * months * cost;
            itemTotalCell.textContent = this.formatNumber(total);
            tableTotal += total;
    
            // حساب الخصم
            const discountPercentage = this.getDiscountPercentage(months);
            const discount = total * (discountPercentage / 100);
            const discounted = total - discount;
            const roundedDiscounted = this.roundToNearest100(discounted);
    
            discountedTotalCell.textContent = this.formatNumber(roundedDiscounted);
            tableDiscounted += roundedDiscounted;
        });
    
        const subtotal = table.querySelector('.table-subtotal');
        const discountedTotal = table.querySelector('.table-discounted');
    
        if (subtotal) subtotal.textContent = this.formatNumber(tableTotal);
        if (discountedTotal) discountedTotal.textContent = this.formatNumber(tableDiscounted);
    }

    calculateAll() {
        const tables = this.tablesContainer.querySelectorAll('.table-wrapper');
        tables.forEach(table => {
            this.calculateTable(table);
        });
    }

    formatNumber(number) {
        return new Intl.NumberFormat('en-US').format(Math.round(number));
    }

    getDiscountPercentage(months) {
        if (months >= 3 && months <= 5) return 10;
        if (months >= 6 && months <= 8) return 15;
        if (months >= 9 && months <= 11) return 20;
        if (months === 12) return 25;
        return 0;
    }

    roundToNearest100(number) {
        return Math.floor(number / 100) * 100;
    }

    printQuote() {
        const actions = document.querySelector('.actions');
        actions.style.display = 'none';
        window.print();
        setTimeout(() => {
            actions.style.display = 'flex';
        }, 1000);
    }

    exportToPDF() {
        alert('لتصدير PDF، استخدم زر الطباعة واختر "حفظ كـ PDF" من خيارات الطابعة');
        this.printQuote();
    }

    resetAll() {
        if (confirm('هل أنت متأكد من إعادة تعيين جميع البيانات؟')) {
            this.clientName.value = '';
            this.daysPerWeek.value = 6;
            this.hoursPerDay.value = 8;
            this.setDefaultDates();

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
        const crmMonthsInputs = table.querySelectorAll('.crm-months-input');
        const crmCostInputs = table.querySelectorAll('.crm-cost-input');

        quantityInputs.forEach(input => input.value = 1);
        monthsInputs.forEach(input => input.value = 1);
        costInputs[0].value = 2500;
        if (costInputs[1]) costInputs[1].value = 1200;
        crmMonthsInputs.forEach(input => input.value = 1);
        crmCostInputs.forEach(input => input.value = 50);

        this.syncWithinTable(table, 1, 'quantity');
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
    window.calculator = calculator;

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
});
