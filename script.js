// পণ্যের তথ্য
const products = [
    {
        id: 1,
        name: 'সোনার ঘড়ি',
        category: 'watch',
        price: 15000,
        emoji: '⌚',
        description: 'প্রিমিয়াম সোনার ঘড়ি'
    },
    {
        id: 2,
        name: 'হীরার নেকলেস',
        category: 'jewelry',
        price: 25000,
        emoji: '💎',
        description: 'খাঁটি হীরার নেকলেস'
    },
    {
        id: 3,
        name: 'প্রিমিয়াম পারফিউম',
        category: 'perfume',
        price: 8000,
        emoji: '🧴',
        description: 'ফ্রান্সের আমদানিকৃত পারফিউম'
    },
    {
        id: 4,
        name: 'ডিজাইনার ব্যাগ',
        category: 'bag',
        price: 12000,
        emoji: '👜',
        description: 'ইটালিয়ান চামড়ার ব্যাগ'
    },
    {
        id: 5,
        name: 'রূপালী ব্রেসলেট',
        category: 'jewelry',
        price: 18000,
        emoji: '✨',
        description: '925 খাঁটি রূপা'
    },
    {
        id: 6,
        name: 'স্মার্ট ঘড়ি',
        category: 'watch',
        price: 20000,
        emoji: '⌚',
        description: 'সর্বশেষ প্রযুক্তি সহ স্মার্ট ঘড়ি'
    },
    {
        id: 7,
        name: 'সুগন্ধ স্প্রে',
        category: 'perfume',
        price: 5000,
        emoji: '💐',
        description: 'প্রাকৃতিক উপাদান থেকে তৈরি'
    },
    {
        id: 8,
        name: 'চামড়ার ব্যাগ',
        category: 'bag',
        price: 16000,
        emoji: '💼',
        description: 'দৈনন্দিন ব্যবহারের জন্য নিখুঁত'
    }
];

// শপিং কার্ট
let cart = [];

// পণ্যগুলি প্রদর্শন করা
function displayProducts(productsToDisplay = products) {
    const productsGrid = document.getElementById('products-grid');
    productsGrid.innerHTML = '';

    if (productsToDisplay.length === 0) {
        productsGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center;">কোনো পণ্য পাওয়া যায়নি</p>';
        return;
    }

    productsToDisplay.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        productCard.innerHTML = `
            <div class="product-image">${product.emoji}</div>
            <div class="product-info">
                <h3>${product.name}</h3>
                <p>${product.description}</p>
                <div class="product-price">৳${product.price.toLocaleString('bn-BD')}</div>
                <button class="add-to-cart-btn" onclick="addToCart(${product.id})">কার্টে যোগ করুন</button>
            </div>
        `;
        productsGrid.appendChild(productCard);
    });
}

// পণ্য কার্টে যোগ করা
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    const existingItem = cart.find(item => item.id === productId);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            ...product,
            quantity: 1
        });
    }

    updateCartCount();
    alert(`${product.name} কার্টে যোগ করা হয়েছে!`);
}

// কার্ট কাউন্ট আপডেট করা
function updateCartCount() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    document.getElementById('cart-count').textContent = totalItems;
}

// কার্ট প্রদর্শন/লুকানো
function toggleCart() {
    const cartModal = document.getElementById('cart-modal');
    cartModal.classList.toggle('active');
    displayCart();
}

// কার্ট প্রদর্শন করা
function displayCart() {
    const cartItems = document.getElementById('cart-items');
    const totalPrice = document.getElementById('total-price');

    if (cart.length === 0) {
        cartItems.innerHTML = '<p>কার্ট খালি আছে</p>';
        totalPrice.textContent = '0';
        return;
    }

    let total = 0;
    let html = '';

    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        html += `
            <div class="cart-item">
                <div class="cart-item-info">
                    <div class="cart-item-name">${item.emoji} ${item.name}</div>
                    <div class="cart-item-price">৳${item.price.toLocaleString('bn-BD')} x ${item.quantity}</div>
                </div>
                <div class="cart-item-quantity">
                    <button onclick="updateQuantity(${item.id}, -1)">-</button>
                    <span>${item.quantity}</span>
                    <button onclick="updateQuantity(${item.id}, 1)">+</button>
                </div>
                <button class="remove-btn" onclick="removeFromCart(${item.id})">অপসারণ</button>
            </div>
        `;
    });

    cartItems.innerHTML = html;
    totalPrice.textContent = total.toLocaleString('bn-BD');
}

// পরিমাণ আপডেট করা
function updateQuantity(productId, change) {
    const item = cart.find(i => i.id === productId);
    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) {
            removeFromCart(productId);
        } else {
            updateCartCount();
            displayCart();
        }
    }
}

// কার্ট থেকে অপসারণ করা
function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    updateCartCount();
    displayCart();
}

// পণ্য অনুসন্ধান করা
function searchProducts() {
    const searchValue = document.getElementById('search-box').value.toLowerCase();
    const filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(searchValue) ||
        product.description.toLowerCase().includes(searchValue)
    );
    displayProducts(filteredProducts);
}

// ক্যাটাগরি দ্বারা ফিল্টার করা
function filterByCategory() {
    const selectedCategory = document.getElementById('category-filter').value;
    if (selectedCategory === 'all') {
        displayProducts(products);
    } else {
        const filteredProducts = products.filter(product => product.category === selectedCategory);
        displayProducts(filteredProducts);
    }
}

// চেকআউট করা
function checkout() {
    if (cart.length === 0) {
        alert('কার্ট খালি আছে!');
        return;
    }

    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    alert(`আপনার অর্ডার সফল হয়েছে!\nমোট পরিমাণ: ৳${total.toLocaleString('bn-BD')}\n\nধন্যবাদ আমাদের সাথে কেনাকাটা করার জন্য!`);
    cart = [];
    updateCartCount();
    toggleCart();
}

// পৃষ্ঠা লোড হওয়ার সময় পণ্য প্রদর্শন করা
document.addEventListener('DOMContentLoaded', () => {
    displayProducts();
});