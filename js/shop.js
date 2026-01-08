/**
 * RoseBud Global - Shop Page JavaScript v2.7
 * With hierarchical categories, proper product navigation, URL filtering
 */

// ========================================
// CONFIGURATION DATA
// ========================================

const shopConfig = {
    header: {
        title: 'Shop Our Collections',
        subtitle: 'Discover premium fine china, crystal, home décor, leather handbags, and unique gift items',
        image: 'images/shop-headers/Shop_Header_1.png'
    },
    breadcrumbs: {
        home: 'Home',
        current: 'Shop'
    },
    labels: {
        filter: 'Filter',
        categories: 'ALL PRODUCTS',
        price: 'PRICE',
        sortBy: 'Sort by',
        showMore: 'Show more',
        addToCart: 'Add to cart',
        contactForPricing: 'Contact for Price',
        noProducts: 'No products found in this category',
        loading: 'Loading products...'
    },
    newsletter: {
        title: 'Join Our Newsletter',
        description: 'Sign up for deals, new products and promotions',
        placeholder: 'Email address',
        submitText: 'Signup',
        backgroundImage: 'images/Newsletter_Card.png',
        emailIconColor: '#D63585'
    }
};

// Hierarchical Category Data with subcategories
const categoriesData = [
    { 
        id: 'custom-gifts', 
        name: 'Custom Gift Items', 
        count: 0, 
        expanded: false,
        subcategories: [
            { id: 'apparel', name: 'Apparel', count: 0 },
            { id: 'corporate-gifts', name: 'Corporate Gifts', count: 0 },
            { id: 'electronics', name: 'Electronics', count: 0 },
            { id: 'writing-instruments', name: 'Writing Instruments', count: 0 }
        ]
    },
    { 
        id: 'home-decor', 
        name: 'Home Decor & Accessories', 
        count: 0, 
        expanded: false,
        subcategories: [
            { id: 'furniture', name: 'Furniture', count: 0 },
            { id: 'tables', name: 'Tables', count: 0 },
            { id: 'lamps', name: 'Lamps', count: 0 }
        ]
    },
    { 
        id: 'household', 
        name: 'Household Items', 
        count: 0, 
        expanded: false,
        subcategories: [
            { id: 'bedding', name: 'Bedding', count: 0 },
            { id: 'cookware', name: 'Cookware', count: 0 },
            { id: 'crystal-drinkware', name: 'Crystal Drinkware', count: 0 },
            { id: 'crystal-vases', name: 'Crystal Vases', count: 0 },
            { id: 'cutlery', name: 'Cutlery', count: 0 },
            { id: 'fine-china', name: 'Fine Bone China Dinner Sets', count: 0 },
            { id: 'miscellaneous', name: 'Miscellaneous', count: 0 },
            { id: 'mugs', name: 'Mugs', count: 0 },
            { id: 'picture-frames', name: 'Picture Frames', count: 0 },
            { id: 'trays', name: 'Trays', count: 0 }
        ]
    },
    { 
        id: 'specialty', 
        name: 'Specialty Items', 
        count: 0, 
        expanded: false,
        subcategories: [
            { id: 'auto-parts', name: 'Auto Parts', count: 0 },
            { id: 'handbags', name: 'Ladies Handbags', count: 0 }
        ]
    },
    { 
        id: 'wholesale', 
        name: 'Wholesale', 
        count: 0, 
        expanded: false,
        subcategories: []
    },
    { 
        id: 'sale', 
        name: 'Sale Items', 
        count: 0, 
        expanded: false,
        subcategories: []
    }
];

// Price Filter Data
const priceFiltersData = [
    { id: 'all', label: 'All Prices', min: 0, max: Infinity, checked: false },
    { id: '0-99', label: 'Under $100', min: 0, max: 99.99, checked: false },
    { id: '100-199', label: '$100 - $199', min: 100, max: 199.99, checked: false },
    { id: '200-499', label: '$200 - $499', min: 200, max: 499.99, checked: false },
    { id: '500+', label: '$500+', min: 500, max: Infinity, checked: false },
    { id: 'contact', label: 'Contact for Price', min: -1, max: 0, checked: false }
];

// Sort Options
const sortOptions = [
    { id: 'featured', name: 'Featured' },
    { id: 'newest', name: 'Newest' },
    { id: 'price-low', name: 'Price: Low to High' },
    { id: 'price-high', name: 'Price: High to Low' },
    { id: 'name-az', name: 'Name: A to Z' },
    { id: 'name-za', name: 'Name: Z to A' }
];

// ========================================
// STATE MANAGEMENT
// ========================================

let productsData = [];
let filteredProducts = [];
let selectedCategories = [];
let selectedPriceFilters = [];
let currentSort = 'featured';
let currentGridView = 3;
let displayedProducts = 12;
let searchQuery = '';
let isLoading = true;

// ========================================
// INITIALIZATION
// ========================================

document.addEventListener('DOMContentLoaded', function() {
    initShopPage();
});

async function initShopPage() {
    showLoading(true);
    
    // Load products from JSON
    await loadProducts();
    
    // Check URL parameters for category filter
    const urlParams = new URLSearchParams(window.location.search);
    const categoryParam = urlParams.get('category');
    if (categoryParam) {
        selectedCategories = [categoryParam];
    }
    
    // Initialize all components
    initPageHeader();
    initCategories();
    initPriceFilters();
    initSortDropdown();
    initSearch();
    initNewsletter();
    initLabels();
    
    // Initial render
    filterAndRenderProducts();
    
    showLoading(false);
}

// ========================================
// DATA LOADING
// ========================================

async function loadProducts() {
    try {
        const response = await fetch('data/shop_products.json');
        if (response.ok) {
            productsData = await response.json();
            console.log(`Loaded ${productsData.length} products`);
            updateCategoryCounts();
        } else {
            console.error('Failed to load products');
            productsData = [];
        }
    } catch (error) {
        console.error('Error loading products:', error);
        productsData = [];
    }
}

function updateCategoryCounts() {
    // Count products per category/subcategory
    productsData.forEach(product => {
        const cat = product.category || '';
        const subcat = product.subcategory || '';
        
        categoriesData.forEach(category => {
            if (category.id === cat || category.subcategories.some(s => s.id === cat)) {
                category.count++;
            }
            category.subcategories.forEach(sub => {
                if (sub.id === cat || sub.id === subcat) {
                    sub.count++;
                }
            });
        });
    });
}

// ========================================
// PAGE HEADER
// ========================================

function initPageHeader() {
    const titleEl = document.getElementById('pageTitle');
    const subtitleEl = document.getElementById('pageSubtitle');
    const imageEl = document.getElementById('pageHeaderImage');
    const breadcrumbHomeEl = document.getElementById('breadcrumbHome');
    const breadcrumbCurrentEl = document.getElementById('breadcrumbCurrent');
    
    if (titleEl) titleEl.textContent = shopConfig.header.title;
    if (subtitleEl) subtitleEl.textContent = shopConfig.header.subtitle;
    if (imageEl) imageEl.src = shopConfig.header.image;
    if (breadcrumbHomeEl) breadcrumbHomeEl.textContent = shopConfig.breadcrumbs.home;
    if (breadcrumbCurrentEl) breadcrumbCurrentEl.textContent = shopConfig.breadcrumbs.current;
}

// ========================================
// CATEGORIES - Hierarchical with Multi-select
// ========================================

function initCategories() {
    const categoryList = document.getElementById('categoryList');
    if (!categoryList) return;
    
    let html = '';
    
    categoriesData.forEach(cat => {
        const isChecked = selectedCategories.includes(cat.id);
        const hasSubcats = cat.subcategories && cat.subcategories.length > 0;
        
        html += `
            <li class="category-item ${hasSubcats ? 'has-subcategories' : ''}">
                <div class="category-row">
                    <label class="category-checkbox">
                        <input type="checkbox" 
                               value="${cat.id}" 
                               ${isChecked ? 'checked' : ''}
                               onchange="handleCategoryChange('${cat.id}', this.checked)">
                        <span class="checkmark"></span>
                        <span class="category-name">${cat.name}</span>
                    </label>
                    ${hasSubcats ? `
                        <button class="expand-btn" onclick="toggleCategory('${cat.id}')">
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                <path d="M4 6L8 10L12 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                            </svg>
                        </button>
                    ` : ''}
                </div>
                ${hasSubcats ? `
                    <ul class="subcategory-list" id="subcat-${cat.id}" style="display: ${cat.expanded ? 'block' : 'none'}">
                        ${cat.subcategories.map(sub => {
                            const subChecked = selectedCategories.includes(sub.id);
                            return `
                                <li class="subcategory-item">
                                    <label class="category-checkbox">
                                        <input type="checkbox" 
                                               value="${sub.id}" 
                                               ${subChecked ? 'checked' : ''}
                                               onchange="handleCategoryChange('${sub.id}', this.checked)">
                                        <span class="checkmark"></span>
                                        <span class="category-name">${sub.name}</span>
                                    </label>
                                </li>
                            `;
                        }).join('')}
                    </ul>
                ` : ''}
            </li>
        `;
    });
    
    categoryList.innerHTML = html;
}

function toggleCategory(categoryId) {
    const cat = categoriesData.find(c => c.id === categoryId);
    if (cat) {
        cat.expanded = !cat.expanded;
        const subcatList = document.getElementById(`subcat-${categoryId}`);
        if (subcatList) {
            subcatList.style.display = cat.expanded ? 'block' : 'none';
        }
        // Rotate expand button
        const btn = document.querySelector(`.category-item .expand-btn`);
        if (btn) btn.classList.toggle('expanded', cat.expanded);
    }
}

function handleCategoryChange(categoryId, isChecked) {
    if (isChecked) {
        if (!selectedCategories.includes(categoryId)) {
            selectedCategories.push(categoryId);
        }
    } else {
        selectedCategories = selectedCategories.filter(c => c !== categoryId);
    }
    
    displayedProducts = 12;
    filterAndRenderProducts();
    updateResultsCount();
}

// ========================================
// PRICE FILTERS - Multi-select
// ========================================

function initPriceFilters() {
    const priceFilters = document.getElementById('priceFilters');
    if (!priceFilters) return;
    
    priceFilters.innerHTML = priceFiltersData.map(filter => `
        <label class="price-checkbox">
            <input type="checkbox" 
                   name="price" 
                   value="${filter.id}" 
                   ${filter.checked ? 'checked' : ''}
                   onchange="handlePriceFilter('${filter.id}', this.checked)">
            <span class="checkmark"></span>
            <span class="price-label">${filter.label}</span>
        </label>
    `).join('');
}

function handlePriceFilter(filterId, isChecked) {
    if (isChecked) {
        if (!selectedPriceFilters.includes(filterId)) {
            selectedPriceFilters.push(filterId);
        }
    } else {
        selectedPriceFilters = selectedPriceFilters.filter(f => f !== filterId);
    }
    
    displayedProducts = 12;
    filterAndRenderProducts();
}

// ========================================
// SORT DROPDOWN
// ========================================

function initSortDropdown() {
    const sortBtn = document.getElementById('sortBtn');
    if (!sortBtn) return;
    
    let dropdown = document.getElementById('sortDropdown');
    if (!dropdown) {
        const dropdownHTML = `
            <div class="sort-dropdown-menu" id="sortDropdown">
                ${sortOptions.map(opt => `
                    <button class="sort-option ${opt.id === currentSort ? 'active' : ''}" 
                            data-sort="${opt.id}"
                            onclick="handleSort('${opt.id}')">
                        ${opt.name}
                    </button>
                `).join('')}
            </div>
        `;
        sortBtn.parentElement.insertAdjacentHTML('beforeend', dropdownHTML);
    }
    
    sortBtn.onclick = function(e) {
        e.stopPropagation();
        document.getElementById('sortDropdown').classList.toggle('show');
    };
    
    document.addEventListener('click', function() {
        const dropdown = document.getElementById('sortDropdown');
        if (dropdown) dropdown.classList.remove('show');
    });
}

function handleSort(sortId) {
    currentSort = sortId;
    
    document.querySelectorAll('.sort-option').forEach(opt => {
        opt.classList.toggle('active', opt.dataset.sort === sortId);
    });
    
    const sortBtn = document.getElementById('sortBtn');
    const sortOption = sortOptions.find(o => o.id === sortId);
    if (sortBtn && sortOption) {
        sortBtn.querySelector('span').textContent = sortOption.name;
    }
    
    document.getElementById('sortDropdown').classList.remove('show');
    filterAndRenderProducts();
}

// ========================================
// SEARCH
// ========================================

function initSearch() {
    const searchInput = document.getElementById('shopSearch');
    if (searchInput) {
        searchInput.addEventListener('input', function(e) {
            searchQuery = e.target.value.toLowerCase().trim();
            displayedProducts = 12;
            filterAndRenderProducts();
        });
    }
}

// ========================================
// FILTERING & SORTING
// ========================================

function filterAndRenderProducts() {
    filteredProducts = [...productsData];
    
    // Filter by categories (multi-select)
    if (selectedCategories.length > 0) {
        filteredProducts = filteredProducts.filter(p => {
            return selectedCategories.some(cat => 
                p.category === cat || 
                p.subcategory === cat ||
                (p.category || '').toLowerCase().includes(cat.toLowerCase())
            );
        });
    }
    
    // Filter by price (multi-select)
    if (selectedPriceFilters.length > 0) {
        filteredProducts = filteredProducts.filter(p => {
            return selectedPriceFilters.some(filterId => {
                const priceFilter = priceFiltersData.find(f => f.id === filterId);
                if (!priceFilter) return false;
                if (filterId === 'contact') {
                    return !p.price || p.price === 0;
                }
                if (filterId === 'all') return true;
                return p.price >= priceFilter.min && p.price <= priceFilter.max;
            });
        });
    }
    
    // Filter by search
    if (searchQuery) {
        filteredProducts = filteredProducts.filter(p => 
            p.name.toLowerCase().includes(searchQuery) ||
            (p.sku && p.sku.toLowerCase().includes(searchQuery)) ||
            (p.brand && p.brand.toLowerCase().includes(searchQuery)) ||
            (p.color && p.color.toLowerCase().includes(searchQuery))
        );
    }
    
    // Sort
    sortProducts();
    
    // Render
    renderProducts();
}

function sortProducts() {
    switch (currentSort) {
        case 'newest':
            filteredProducts.sort((a, b) => (b.images?.length || 0) - (a.images?.length || 0));
            break;
        case 'price-low':
            filteredProducts.sort((a, b) => (a.price || 9999) - (b.price || 9999));
            break;
        case 'price-high':
            filteredProducts.sort((a, b) => (b.price || 0) - (a.price || 0));
            break;
        case 'name-az':
            filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
            break;
        case 'name-za':
            filteredProducts.sort((a, b) => b.name.localeCompare(a.name));
            break;
        case 'featured':
        default:
            filteredProducts.sort((a, b) => {
                const aHasImg = a.images && a.images.length > 0 ? 1 : 0;
                const bHasImg = b.images && b.images.length > 0 ? 1 : 0;
                if (bHasImg !== aHasImg) return bHasImg - aHasImg;
                return a.name.localeCompare(b.name);
            });
            break;
    }
}

// ========================================
// PRODUCT RENDERING
// ========================================

function renderProducts() {
    const productGrid = document.getElementById('productGrid');
    if (!productGrid) return;
    
    if (filteredProducts.length === 0) {
        productGrid.innerHTML = `
            <div class="no-products">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#ccc" stroke-width="1.5">
                    <circle cx="11" cy="11" r="8"/>
                    <path d="M21 21l-4.35-4.35"/>
                </svg>
                <p>${shopConfig.labels.noProducts}</p>
            </div>
        `;
        return;
    }
    
    const productsToShow = filteredProducts.slice(0, displayedProducts);
    
    productGrid.innerHTML = productsToShow.map(product => createProductCard(product)).join('');
    productGrid.className = `product-grid grid-${currentGridView}`;
    
    const showMoreBtn = document.getElementById('showMoreBtn');
    if (showMoreBtn) {
        const remaining = filteredProducts.length - displayedProducts;
        if (remaining > 0) {
            showMoreBtn.style.display = 'inline-flex';
            showMoreBtn.innerHTML = `
                <span>Show more</span>
                <span class="remaining-count">(${remaining} more)</span>
            `;
        } else {
            showMoreBtn.style.display = 'none';
        }
    }
    
    updateResultsCount();
}

function createProductCard(product) {
    const hasImage = product.images && product.images.length > 0;
    const imageUrl = hasImage ? product.image : 'images/avatar-placeholder.png';
    const priceDisplay = product.price > 0 
        ? `$${product.price.toFixed(2)}` 
        : 'Contact for Price';
    
    // Check if this product needs "Make an Inquiry" button
    const category = (product.category || '').toLowerCase();
    const inquiryCategories = ['custom gift items', 'home decor', 'specialty items', 'home decor & accessories', 'wholesale'];
    const needsInquiry = inquiryCategories.some(cat => category.includes(cat));
    
    // Determine button text and style
    let buttonText, buttonClass;
    if (needsInquiry || product.price === 0) {
        buttonText = 'Make an Inquiry';
        buttonClass = 'inquiry-btn';
    } else {
        buttonText = shopConfig.labels.addToCart;
        buttonClass = '';
    }
    
    let badges = '';
    if (product.badges && product.badges.length > 0) {
        badges = `<div class="product-badges">
            ${product.badges.map(b => `<span class="badge badge-${b}">${b.toUpperCase()}</span>`).join('')}
        </div>`;
    }
    
    // Add Sale badge for Sale category
    if (category === 'sale') {
        badges = `<div class="product-badges">
            <span class="badge badge-sale">SALE</span>
        </div>` + badges;
    }
    
    const multiImageIndicator = product.images && product.images.length > 1 
        ? `<span class="multi-image-indicator">${product.images.length} photos</span>` 
        : '';
    
    return `
        <div class="product-card" onclick="viewProduct(${product.id})">
            <div class="product-image-container">
                <img src="${imageUrl}" 
                     alt="${product.name}" 
                     class="product-image"
                     onerror="this.src='images/avatar-placeholder.png'"
                     loading="lazy">
                ${badges}
                ${multiImageIndicator}
                <button class="wishlist-btn" onclick="event.stopPropagation(); toggleWishlist(${product.id})" aria-label="Add to wishlist">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                        <path d="M10 17.5L9.08333 16.6667C4.58333 12.5833 1.66667 9.95833 1.66667 6.79167C1.66667 4.16667 3.75 2.08333 6.375 2.08333C7.86667 2.08333 9.3 2.79167 10 3.89167C10.7 2.79167 12.1333 2.08333 13.625 2.08333C16.25 2.08333 18.3333 4.16667 18.3333 6.79167C18.3333 9.95833 15.4167 12.5833 10.9167 16.6667L10 17.5Z" stroke="currentColor" stroke-width="1.5"/>
                    </svg>
                </button>
                <button class="add-to-cart-btn ${buttonClass}" onclick="event.stopPropagation(); ${needsInquiry || product.price === 0 ? `addToInquiryCartFromShop(${product.id})` : `addProductToCart(${product.id})`}">
                    ${buttonText}
                </button>
            </div>
            <div class="product-info">
                <div class="product-rating">
                    ${renderStars(product.rating || 5)}
                </div>
                <h3 class="product-name">${product.name}</h3>
                <p class="product-brand">${product.brand || 'Rose Bud Global'}</p>
                <div class="product-price">
                    <span class="current-price ${product.price === 0 ? 'contact-price' : ''}">${priceDisplay}</span>
                </div>
            </div>
        </div>
    `;
}

function renderStars(rating) {
    let stars = '';
    for (let i = 0; i < 5; i++) {
        const filled = i < rating;
        stars += `<svg class="star-icon" width="16" height="16" viewBox="0 0 16 16" fill="${filled ? '#C9A164' : 'none'}">
            <path d="M8 1L10.06 5.52L15 6.23L11.5 9.63L12.36 14.57L8 12.27L3.64 14.57L4.5 9.63L1 6.23L5.94 5.52L8 1Z" 
                  stroke="#C9A164" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>`;
    }
    return stars;
}

function updateResultsCount() {
    const toolbarTitle = document.getElementById('toolbarTitle');
    if (toolbarTitle) {
        const count = filteredProducts.length;
        let title = 'All Products';
        if (selectedCategories.length === 1) {
            // Find category name
            categoriesData.forEach(cat => {
                if (cat.id === selectedCategories[0]) title = cat.name;
                cat.subcategories.forEach(sub => {
                    if (sub.id === selectedCategories[0]) title = sub.name;
                });
            });
        } else if (selectedCategories.length > 1) {
            title = `${selectedCategories.length} Categories`;
        }
        toolbarTitle.innerHTML = `${title} <span class="results-count">(${count} ${count === 1 ? 'item' : 'items'})</span>`;
    }
}

// ========================================
// PRODUCT ACTIONS
// ========================================

function loadMoreProducts() {
    displayedProducts += 12;
    renderProducts();
}

function viewProduct(productId) {
    const product = productsData.find(p => p.id === productId);
    if (product) {
        // Store product data in sessionStorage for product detail page
        sessionStorage.setItem('currentProduct', JSON.stringify(product));
        window.location.href = `product.html?id=${productId}&sku=${encodeURIComponent(product.sku || '')}`;
    }
}

function addProductToCart(productId) {
    const product = productsData.find(p => p.id === productId);
    if (product) {
        if (product.price === 0) {
            window.location.href = `contact.html?product=${encodeURIComponent(product.name)}`;
            return;
        }
        
        if (typeof addToCart === 'function') {
            addToCart({
                id: product.sku || `PROD-${productId}`,
                name: product.name,
                price: product.price,
                image: product.image || 'images/avatar-placeholder.png',
                color: product.color || 'Default',
                quantity: 1,
                brand: product.brand,
                category: product.category
            });
            
            showAddedToCartFeedback(product.name);
        }
    }
}

function showAddedToCartFeedback(productName) {
    const toast = document.createElement('div');
    toast.className = 'cart-toast';
    toast.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M16.667 5L7.5 14.167L3.333 10" stroke="#10B981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <span>Added to cart: ${productName}</span>
    `;
    document.body.appendChild(toast);
    
    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function toggleWishlist(productId) {
    let wishlist = JSON.parse(localStorage.getItem('rosebudWishlist') || '[]');
    
    const index = wishlist.indexOf(productId);
    if (index > -1) {
        wishlist.splice(index, 1);
    } else {
        wishlist.push(productId);
    }
    
    localStorage.setItem('rosebudWishlist', JSON.stringify(wishlist));
}

// ========================================
// GRID VIEW
// ========================================

function setGridView(columns) {
    currentGridView = columns;
    
    document.querySelectorAll('.view-btn').forEach(btn => {
        const btnView = btn.dataset.view;
        const btnCols = btnView === 'list' ? 1 : parseInt(btnView.replace('grid-', ''));
        btn.classList.toggle('active', btnCols === columns);
    });
    
    const productGrid = document.getElementById('productGrid');
    if (productGrid) {
        productGrid.className = `product-grid grid-${columns}`;
    }
}

// ========================================
// SIDEBAR TOGGLE
// ========================================

function toggleSidebar() {
    const sidebarContent = document.getElementById('sidebarContent');
    if (sidebarContent) {
        sidebarContent.classList.toggle('active');
    }
}

// ========================================
// LABELS
// ========================================

function initLabels() {
    const filterLabel = document.getElementById('filterLabel');
    const categoriesTitle = document.getElementById('categoriesTitle');
    const priceTitle = document.getElementById('priceTitle');
    const sortLabel = document.getElementById('sortLabel');
    const showMoreText = document.getElementById('showMoreText');
    
    if (filterLabel) filterLabel.textContent = shopConfig.labels.filter;
    if (categoriesTitle) categoriesTitle.textContent = shopConfig.labels.categories;
    if (priceTitle) priceTitle.textContent = shopConfig.labels.price;
    if (sortLabel) sortLabel.textContent = shopConfig.labels.sortBy;
    if (showMoreText) showMoreText.textContent = shopConfig.labels.showMore;
}

// ========================================
// NEWSLETTER
// ========================================

function initNewsletter() {
    const titleEl = document.getElementById('newsletterTitle');
    const descEl = document.getElementById('newsletterDescription');
    const inputEl = document.getElementById('newsletterEmail');
    const submitBtn = document.getElementById('newsletterSubmitBtn');
    const bgImage = document.getElementById('newsletterBgImage');
    const emailIcon = document.getElementById('newsletterEmailIcon');
    
    if (titleEl) titleEl.textContent = shopConfig.newsletter.title;
    if (descEl) descEl.textContent = shopConfig.newsletter.description;
    if (inputEl) inputEl.placeholder = shopConfig.newsletter.placeholder;
    if (submitBtn) submitBtn.textContent = shopConfig.newsletter.submitText;
    if (bgImage) bgImage.src = shopConfig.newsletter.backgroundImage;
    
    if (emailIcon) {
        const paths = emailIcon.querySelectorAll('path');
        paths.forEach(path => {
            path.setAttribute('fill', shopConfig.newsletter.emailIconColor);
        });
    }
}

function handleNewsletterSubmit(event) {
    event.preventDefault();
    const emailInput = document.getElementById('newsletterEmail');
    const email = emailInput ? emailInput.value.trim() : '';
    
    if (email) {
        alert(`Thank you for subscribing!\n\nWe've sent a confirmation to: ${email}`);
        if (emailInput) emailInput.value = '';
    }
}

// ========================================
// LOADING STATE
// ========================================

function showLoading(show) {
    isLoading = show;
    const productGrid = document.getElementById('productGrid');
    
    if (show && productGrid) {
        productGrid.innerHTML = `
            <div class="loading-state">
                <div class="loading-spinner"></div>
                <p>${shopConfig.labels.loading}</p>
            </div>
        `;
    }
}

// ========================================
// EXPORT FOR EXTERNAL USE
// ========================================

window.shopConfig = shopConfig;
window.productsData = productsData;
window.categoriesData = categoriesData;
window.handleCategoryChange = handleCategoryChange;
window.handlePriceFilter = handlePriceFilter;
window.handleSort = handleSort;
window.setGridView = setGridView;
window.loadMoreProducts = loadMoreProducts;
window.viewProduct = viewProduct;
window.addProductToCart = addProductToCart;
window.toggleWishlist = toggleWishlist;
window.toggleSidebar = toggleSidebar;
window.toggleCategory = toggleCategory;
window.handleNewsletterSubmit = handleNewsletterSubmit;

// ========================================
// INQUIRY CART FROM SHOP
// ========================================

function addToInquiryCartFromShop(productId) {
    const product = productsData.find(p => p.id === productId);
    if (!product) return;
    
    // Get existing inquiry cart
    let inquiryCart = JSON.parse(localStorage.getItem('rosebudInquiryCart') || '[]');
    
    // Check if product already in inquiry cart
    const existingIndex = inquiryCart.findIndex(item => item.sku === product.sku);
    
    const inquiryItem = {
        name: product.name,
        sku: product.sku,
        image: product.image || product.images?.[0] || 'images/avatar-placeholder.png',
        category: product.category,
        description: product.description || 'Premium quality product from RoseBud Global.',
        quantity: 1
    };
    
    if (existingIndex > -1) {
        inquiryCart[existingIndex].quantity += 1;
    } else {
        inquiryCart.push(inquiryItem);
    }
    
    localStorage.setItem('rosebudInquiryCart', JSON.stringify(inquiryCart));
    
    // Show notification
    showInquiryNotification(product.name);
}

function showInquiryNotification(name) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: #2563EB;
        color: white;
        padding: 16px 24px;
        border-radius: 8px;
        z-index: 10000;
        box-shadow: 0 4px 20px rgba(37, 99, 235, 0.3);
        font-family: 'Poppins', sans-serif;
        max-width: 320px;
    `;
    notification.innerHTML = `
        <strong>Added to Inquiry</strong><br>
        <span style="font-size: 14px;">${name}</span><br>
        <a href="contact.html?inquiry=cart" style="color: white; text-decoration: underline; font-size: 13px;">View Inquiry Cart →</a>
    `;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.transition = 'opacity 0.3s ease';
        notification.style.opacity = '0';
        setTimeout(() => notification.remove(), 300);
    }, 4000);
}

window.addToInquiryCartFromShop = addToInquiryCartFromShop;
