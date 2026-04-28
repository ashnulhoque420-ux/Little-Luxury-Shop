// Firebase imports
const { getDatabase, ref, push, set, onValue, remove, update } = firebase;

let db;
let productsRef;
let currentEditId = null;

// Firebase initialize
window.addEventListener('DOMContentLoaded', () => {
    // চেক করুন user logged in আছে কিনা
    const loggedInUser = localStorage.getItem('loggedInUser');
    if (!loggedInUser) {
        window.location.href = 'index.html';
        return;
    }

    document.getElementById('username').textContent = loggedInUser;
    
    // Firebase initialize
    db = getDatabase(firebaseApp);
    productsRef = ref(db, 'products');
    
    // পণ্য তালিকা লোড করুন
    loadProducts();

    // ফর্ম সাবমিট ইভেন্ট
    document.getElementById('product-form').addEventListener('submit', addProduct);
    document.getElementById('edit-form').addEventListener('submit', updateProduct);
    document.getElementById('search-products').addEventListener('keyup', searchProducts);
});

// পণ্য যোগ করুন
async function addProduct(e) {
    e.preventDefault();

    const name = document.getElementById('product-name').value;
    const category = document.getElementById('product-category').value;
    const price = parseInt(document.getElementById('product-price').value);
    const description = document.getElementById('product-description').value;
    const stock = parseInt(document.getElementById('product-stock').value);
    const emoji = document.getElementById('product-emoji').value || '📦';

    try {
        const newProductRef = push(productsRef);
        await set(newProductRef, {
            name,
            category,
            price,
            description,
            stock,
            emoji,
            createdAt: new Date().toISOString(),
            id: newProductRef.key
        });

        alert('✅ পণ্য সফলভাবে যোগ হয়েছে!');
        document.getElementById('product-form').reset();
        loadProducts();
    } catch (error) {
        alert('❌ ত্রুটি: ' + error.message);
    }
}

// পণ্য তালিকা লোড করুন
function loadProducts() {
    onValue(productsRef, (snapshot) => {
        const container = document.getElementById('products-container');
        container.innerHTML = '';

        if (!snapshot.exists()) {
            container.innerHTML = '<p class="empty-message">কোনো পণ্য নেই</p>';
            document.getElementById('product-count').textContent = '0';
            return;
        }

        const products = snapshot.val();
        const productArray = Object.entries(products).map(([key, value]) => ({
            id: key,
            ...value
        }));

        document.getElementById('product-count').textContent = productArray.length;

        const table = document.createElement('table');
        table.className = 'data-table';
        table.innerHTML = `
            <thead>
                <tr>
                    <th>#</th>
                    <th>নাম</th>
                    <th>ক্যাটাগরি</th>
                    <th>দাম</th>
                    <th>স্টক</th>
                    <th>সম্পাদন</th>
                </tr>
            </thead>
            <tbody>
                ${productArray.map((product, index) => `
                    <tr>
                        <td>${index + 1}</td>
                        <td>${product.emoji} ${product.name}</td>
                        <td>${getCategoryName(product.category)}</td>
                        <td>৳${product.price.toLocaleString('bn-BD')}</td>
                        <td>${product.stock}</td>
                        <td>
                            <button class="btn-small btn-edit" onclick="editProduct('${product.id}')">✏️ সম্পাদন</button>
                            <button class="btn-small btn-delete" onclick="deleteProduct('${product.id}')">🗑️ মুছুন</button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        `;
        container.appendChild(table);
    });
}

// পণ্য সম্পাদন
function editProduct(productId) {
    currentEditId = productId;
    onValue(ref(db, `products/${productId}`), (snapshot) => {
        if (snapshot.exists()) {
            const product = snapshot.val();
            document.getElementById('edit-product-id').value = productId;
            document.getElementById('edit-product-name').value = product.name;
            document.getElementById('edit-product-category').value = product.category;
            document.getElementById('edit-product-price').value = product.price;
            document.getElementById('edit-product-description').value = product.description;
            document.getElementById('edit-product-stock').value = product.stock;
            document.getElementById('edit-modal').style.display = 'block';
        }
    }, { onlyOnce: true });
}

// পণ্য আপডেট করুন
async function updateProduct(e) {
    e.preventDefault();

    const productId = document.getElementById('edit-product-id').value;
    const name = document.getElementById('edit-product-name').value;
    const category = document.getElementById('edit-product-category').value;
    const price = parseInt(document.getElementById('edit-product-price').value);
    const description = document.getElementById('edit-product-description').value;
    const stock = parseInt(document.getElementById('edit-product-stock').value);

    try {
        await update(ref(db, `products/${productId}`), {
            name,
            category,
            price,
            description,
            stock,
            updatedAt: new Date().toISOString()
        });

        alert('✅ পণ্য সফলভাবে আপডেট হয়েছে!');
        closeEditModal();
        loadProducts();
    } catch (error) {
        alert('❌ ত্রুটি: ' + error.message);
    }
}

// পণ্য মুছুন
async function deleteProduct(productId) {
    if (confirm('আপনি কি এই পণ্য মুছতে চান?')) {
        try {
            await remove(ref(db, `products/${productId}`));
            alert('✅ পণ্য সফলভাবে মুছা হয়েছে!');
            loadProducts();
        } catch (error) {
            alert('❌ ত্রুটি: ' + error.message);
        }
    }
}

// পণ্য খুঁজুন
function searchProducts() {
    const searchTerm = document.getElementById('search-products').value.toLowerCase();
    const rows = document.querySelectorAll('.data-table tbody tr');
    
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(searchTerm) ? '' : 'none';
    });
}

// মোডাল বন্ধ করুন
function closeEditModal() {
    document.getElementById('edit-modal').style.display = 'none';
    document.getElementById('edit-form').reset();
}

// ক্যাটাগরি নাম পান
function getCategoryName(category) {
    const names = {
        'watch': '⌚ ঘড়ি',
        'jewelry': '💎 গহনা',
        'perfume': '🌸 পারফিউম',
        'bag': '👜 ব্যাগ'
    };
    return names[category] || category;
}

// লগ আউট
function logout() {
    if (confirm('আপনি কি লগ আউট করতে চান?')) {
        localStorage.removeItem('loggedInUser');
        window.location.href = 'index.html';
    }
}