// Firebase imports
const { getDatabase, ref, onValue, update, remove } = firebase;

let db;
let ordersRef;
let currentOrderId = null;
let allOrders = [];

// Firebase initialize
window.addEventListener('DOMContentLoaded', () => {
    // চেক করুন user logged in আছে কি না
    const loggedInUser = localStorage.getItem('loggedInUser');
    if (!loggedInUser) {
        window.location.href = 'index.html';
        return;
    }

    document.getElementById('username').textContent = loggedInUser;
    
    // Firebase initialize
    db = getDatabase(firebaseApp);
    ordersRef = ref(db, 'orders');
    
    // অর্ডার তালিকা লোড করুন
    loadOrders();

    // ফিল্টার ইভেন্ট
    document.getElementById('status-filter').addEventListener('change', filterOrders);
    document.getElementById('search-orders').addEventListener('keyup', searchOrders);
});

// অর্ডার লোড করুন
function loadOrders() {
    onValue(ordersRef, (snapshot) => {
        const container = document.getElementById('orders-container');
        allOrders = [];

        if (!snapshot.exists()) {
            container.innerHTML = '<p class="empty-message">কোনো অর্ডার নেই</p>';
            updateStatusCounts();
            return;
        }

        const orders = snapshot.val();
        allOrders = Object.entries(orders).map(([key, value]) => ({
            id: key,
            ...value
        })).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        document.getElementById('order-count').textContent = allOrders.length;
        displayOrders(allOrders);
        updateStatusCounts();
    });
}

// অর্ডার প্রদর্শন করুন
function displayOrders(orders) {
    const container = document.getElementById('orders-container');
    
    if (orders.length === 0) {
        container.innerHTML = '<p class="empty-message">কোনো অর্ডার নেই</p>';
        return;
    }

    const table = document.createElement('table');
    table.className = 'data-table';
    table.innerHTML = `
        <thead>
            <tr>
                <th>#</th>
                <th>অর্ডার ID</th>
                <th>গ্রাহক</th>
                <th>টাকা</th>
                <th>অবস্থা</th>
                <th>তারিখ</th>
                <th>অ্যাকশন</th>
            </tr>
        </thead>
        <tbody>
            ${orders.map((order, index) => `
                <tr>
                    <td>${index + 1}</td>
                    <td>#${order.id.substring(0, 8)}</td>
                    <td>${order.customerName}</td>
                    <td>৳${order.totalAmount.toLocaleString('bn-BD')}</td>
                    <td>${getStatusBadge(order.status)}</td>
                    <td>${formatDate(order.createdAt)}</td>
                    <td>
                        <button class="btn-small btn-info" onclick="viewOrder('${order.id}')">👁️ দেখুন</button>
                    </td>
                </tr>
            `).join('')}
        </tbody>
    `;
    
    container.innerHTML = '';
    container.appendChild(table);
}

// অর্ডার দেখুন
function viewOrder(orderId) {
    currentOrderId = orderId;
    const order = allOrders.find(o => o.id === orderId);
    
    if (order) {
        document.getElementById('detail-order-id').textContent = order.id.substring(0, 12);
        document.getElementById('detail-customer-name').textContent = order.customerName;
        document.getElementById('detail-customer-email').textContent = order.customerEmail;
        document.getElementById('detail-customer-phone').textContent = order.customerPhone;
        document.getElementById('detail-customer-address').textContent = order.customerAddress;
        document.getElementById('detail-total-amount').textContent = '৳' + order.totalAmount.toLocaleString('bn-BD');
        document.getElementById('status-select').value = order.status;

        // পণ্য তালিকা প্রদর্শন
        const itemsList = document.getElementById('order-items-list');
        itemsList.innerHTML = order.items.map(item => `
            <div class="order-item">
                <div class="item-name">${item.emoji} ${item.name}</div>
                <div class="item-quantity">পরিমাণ: ${item.quantity}</div>
                <div class="item-price">৳${item.price.toLocaleString('bn-BD')} x ${item.quantity} = ৳${(item.price * item.quantity).toLocaleString('bn-BD')}</div>
            </div>
        `).join('');

        document.getElementById('order-detail-modal').style.display = 'block';
    }
}

// অর্ডার স্ট্যাটাস সংরক্ষণ করুন
async function saveOrderStatus() {
    const newStatus = document.getElementById('status-select').value;
    
    try {
        await update(ref(db, `orders/${currentOrderId}`), {
            status: newStatus,
            updatedAt: new Date().toISOString()
        });
        
        alert('✅ অর্ডার স্ট্যাটাস সফলভাবে আপডেট হয়েছে!');
        closeOrderModal();
        loadOrders();
    } catch (error) {
        alert('❌ ত্রুটি: ' + error.message);
    }
}

// অর্ডার মুছুন
async function deleteOrder() {
    if (confirm('আপনি কি এই অর্ডার মুছতে চান?')) {
        try {
            await remove(ref(db, `orders/${currentOrderId}`));
            alert('✅ অর্ডার সফলভাবে মুছা হয়েছে!');
            closeOrderModal();
            loadOrders();
        } catch (error) {
            alert('❌ ত্রুটি: ' + error.message);
        }
    }
}

// অর্ডার ফিল্টার করুন
function filterOrders() {
    const status = document.getElementById('status-filter').value;
    const filtered = status ? allOrders.filter(o => o.status === status) : allOrders;
    displayOrders(filtered);
}

// অর্ডার খুঁজুন
function searchOrders() {
    const searchTerm = document.getElementById('search-orders').value.toLowerCase();
    const filtered = allOrders.filter(order => 
        order.id.toLowerCase().includes(searchTerm) ||
        order.customerName.toLowerCase().includes(searchTerm)
    );
    displayOrders(filtered);
}

// স্ট্যাটাস কাউন্ট আপডেট করুন
function updateStatusCounts() {
    const pending = allOrders.filter(o => o.status === 'pending').length;
    const confirmed = allOrders.filter(o => o.status === 'confirmed').length;
    const shipped = allOrders.filter(o => o.status === 'shipped').length;
    const delivered = allOrders.filter(o => o.status === 'delivered').length;
    
    document.getElementById('pending-count').textContent = pending;
    document.getElementById('confirmed-count').textContent = confirmed;
    document.getElementById('shipped-count').textContent = shipped;
    document.getElementById('delivered-count').textContent = delivered;
}

// স্ট্যাটাস ব্যাজ পান
function getStatusBadge(status) {
    const badges = {
        'pending': '⏳ অপেক্ষমাণ',
        'confirmed': '✅ নিশ্চিত',
        'shipped': '📦 পাঠানো হয়েছে',
        'delivered': '🎉 ডেলিভারি হয়েছে'
    };
    return badges[status] || status;
}

// তারিখ ফরম্যাট করুন
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('bn-BD', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// মোডাল বন্ধ করুন
function closeOrderModal() {
    document.getElementById('order-detail-modal').style.display = 'none';
    currentOrderId = null;
}

// লগ আউট
function logout() {
    if (confirm('আপনি কি লগ আউট করতে চান?')) {
        localStorage.removeItem('loggedInUser');
        window.location.href = 'index.html';
    }
}