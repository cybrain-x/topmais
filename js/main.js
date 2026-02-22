document.addEventListener('DOMContentLoaded', () => {
    // ----------------------------------------------------
    // Navbar Scroll Effect
    // ----------------------------------------------------
    const navbar = document.getElementById('navbar');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // ----------------------------------------------------
    // Mobile Menu Toggle
    // ----------------------------------------------------
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const closeMenuBtn = document.getElementById('close-menu');
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileLinks = document.querySelectorAll('.mobile-nav-links a');

    // Open Menu
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', () => {
            mobileMenu.classList.add('active');
            document.body.style.overflow = 'hidden'; // Prevent scrolling
        });
    }

    // Close Menu
    if (closeMenuBtn) {
        closeMenuBtn.addEventListener('click', () => {
            mobileMenu.classList.remove('active');
            document.body.style.overflow = '';
        });
    }

    // Close menu when clicking a link
    mobileLinks.forEach(link => {
        link.addEventListener('click', () => {
            mobileMenu.classList.remove('active');
            document.body.style.overflow = '';
        });
    });

    // ----------------------------------------------------
    // Smooth Scroll for anchor links
    // ----------------------------------------------------
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            // Ignore links that are just "#"
            if (this.getAttribute('href') === '#') return;

            e.preventDefault();

            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);

            if (targetElement) {
                // Account for fixed navbar height
                const navHeight = navbar.offsetHeight;
                const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - navHeight;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
    // ----------------------------------------------------
    // App Simulation Data & Logic
    // ----------------------------------------------------
    const categories = [
        { id: 'all', name: 'Tudo' },
        { id: 'electronics', name: 'Eletrônicos' },
        { id: 'fashion', name: 'Moda' },
        { id: 'food', name: 'Alimentação' },
        { id: 'travel', name: 'Viagens' },
        { id: 'home', name: 'Casa' }
    ];

    const brands = [
        { id: 1, name: 'Amazon', color: '#ff9900', icon: 'fa-amazon' },
        { id: 2, name: 'Mercado Livre', color: '#ffe600', icon: 'fa-handshake' },
        { id: 3, name: 'Shopee', color: '#ee4d2d', icon: 'fa-bag-shopping' },
        { id: 4, name: 'Magalu', color: '#0086ff', icon: 'fa-box' },
        { id: 5, name: 'Ifood', color: '#ea1d2c', icon: 'fa-burger' },
        { id: 6, name: 'Uber', color: '#000000', icon: 'fa-car' }
    ];

    const coupons = [
        {
            id: 1,
            brand: 'Amazon',
            brandColor: '#ff9900',
            title: '15% OFF em Eletrônicos',
            description: 'Válido para produtos selecionados e vendidos pela Amazon.',
            type: 'code',
            code: 'ELETRO15',
            category: 'electronics'
        },
        {
            id: 2,
            brand: 'Shopee',
            brandColor: '#ee4d2d',
            title: 'Frete Grátis acima de R$39',
            description: 'Cupom de frete grátis liberado para todas as lojas oficiais.',
            type: 'offer',
            category: 'all'
        },
        {
            id: 3,
            brand: 'Mercado Livre',
            brandColor: '#ffe600',
            title: 'R$50 OFF na Primeira Compra',
            description: 'Válido para contas novas em compras acima de R$150.',
            type: 'code',
            code: 'NOVO50',
            category: 'all'
        },
        {
            id: 4,
            brand: 'Ifood',
            brandColor: '#ea1d2c',
            title: 'R$15 OFF para Lanches',
            description: 'Válido em padarias e lanchonetes parceiras selecionadas.',
            type: 'code',
            code: 'FOME15',
            category: 'food'
        }
    ];

    const renderCategories = () => {
        const container = document.getElementById('categories-container');
        if (!container) return;

        container.innerHTML = categories.map(cat => `
            <div class="category-pill ${cat.id === 'all' ? 'active' : ''}">
                ${cat.name}
            </div>
        `).join('');
    };

    const renderBrands = () => {
        const container = document.getElementById('brands-container');
        if (!container) return;

        container.innerHTML = brands.map(brand => `
            <div class="brand-card">
                <div class="brand-logo-container" style="color: ${brand.color}; font-size: 2rem;">
                    <i class="fa-solid ${brand.icon} fa-brands"></i>
                </div>
                <span>${brand.name}</span>
            </div>
        `).join('');
    };

    const renderCoupons = () => {
        const container = document.getElementById('coupons-container');
        if (!container) return;

        container.innerHTML = coupons.map(coupon => `
            <div class="coupon-item">
                <div class="coupon-header">
                    <div class="coupon-brand-logo" style="background: ${coupon.brandColor}20; color: ${coupon.brandColor}; font-weight: bold; font-size: 1.2rem;">
                        ${coupon.brand.charAt(0)}
                    </div>
                    <div class="coupon-badge">${coupon.type === 'code' ? 'Cupom' : 'Oferta'
            }</div>
                </div>
                <div>
                    <h4 class="coupon-title">${coupon.title}</h4>
                    <p class="coupon-desc">${coupon.description}</p>
                </div>
                <div class="coupon-footer">
                    <div class="coupon-type">
                        ${coupon.type === 'code'
                ? `<i class="fa-solid fa-ticket type-code"></i> Código`
                : `<i class="fa-solid fa-bolt type-offer"></i> Ativação`}
                    </div>
                    <button class="coupon-action-btn">PEGAR</button>
                </div>
            </div>
        `).join('');
    };

    // Initialize rendering
    renderCategories();
    renderBrands();
    renderCoupons();
});
