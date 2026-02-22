// ----------------------------------------------------
// UI Logic & State
// ----------------------------------------------------
let allBrands = {};
let allCouponsData = [];
let allOffersData = [];
let currentCategoryFilter = null;
let currentBrandFilter = null;

const categoriesContainer = document.getElementById('categories-container');
const brandsContainer = document.getElementById('brands-container');
const couponsContainer = document.getElementById('coupons-container');
const loadingSpinner = document.getElementById('loading-spinner');
const appContentWrapper = document.getElementById('app-content-wrapper');
const activeFilterMsg = document.getElementById('active-filter-msg');

// ----------------------------------------------------
// Mobile Menu Toggle
// ----------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const closeMenuBtn = document.getElementById('close-menu');
    const mobileMenu = document.getElementById('mobile-menu');

    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', () => {
            mobileMenu.classList.add('active');
        });
    }

    if (closeMenuBtn) {
        closeMenuBtn.addEventListener('click', () => {
            mobileMenu.classList.remove('active');
        });
    }
});


// ----------------------------------------------------
// Fetching Data from Local Static JSON
// ----------------------------------------------------

async function loadInitialData() {
    try {
        const loadingText = loadingSpinner.querySelector('p');
        if (loadingText) loadingText.innerText = "Carregando ofertas exclusivas...";

        // Faz o fetch do arquivo JSON armazenado pelo GitHub Actions
        const response = await fetch('data/ofertas.json');

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const dbData = await response.json();

        // 1. Processar Marcas
        dbData.brands.forEach(b => {
            allBrands[b.id] = b;
        });

        // 2. Armazena dados isoladamente
        allCouponsData = dbData.coupons || [];
        allOffersData = dbData.offers || [];

        // 3. Renderiza UI inicial
        renderCategories(dbData.categories || []);
        renderBrands(dbData.brands || []);

        // 4. Renderiza cupons com filtros iniciais
        applyFiltersAndRender();

        // Mostrar conteudo
        loadingSpinner.style.display = 'none';
        appContentWrapper.style.display = 'block';

    } catch (error) {
        console.error("Erro ao ler o json local:", error);
        loadingSpinner.innerHTML = `
            <div style="color:red; text-align: center;">
                <i class="fa-solid fa-triangle-exclamation fa-2x"></i>
                <p>Falha ao comunicar com os servidores.</p>
                <button class="btn btn-outline" style="border-color:red;color:red;margin-top:10px" onclick="location.reload()">Tentar novamente</button>
            </div>
        `;
    }
}

function applyFiltersAndRender() {
    couponsContainer.innerHTML = '<div style="text-align:center;width:100%;"><i class="fa fa-spinner fa-spin"></i></div>';

    // Combina cupons e ofertas
    let allItems = [...allCouponsData, ...allOffersData];

    // Aplicar filtros locais
    if (currentCategoryFilter && currentCategoryFilter !== 'all') {
        allItems = allItems.filter(item => {
            // A categoria pode estar em item.categoryId, item.category (string) ou item.categories (array)
            const catArr = Array.isArray(item.categories) ? item.categories : [];
            return catArr.includes(currentCategoryFilter) ||
                item.category === currentCategoryFilter ||
                item.categoryId === currentCategoryFilter;
        });
    }

    if (currentBrandFilter) {
        allItems = allItems.filter(item => item.brandId === currentBrandFilter);
    }

    renderCoupons(allItems);
}


// ----------------------------------------------------
// UI Renderers
// ----------------------------------------------------

function renderCategories(categories) {
    if (!categories || categories.length === 0) {
        categoriesContainer.innerHTML = '<span style="color:#aaa;font-size:0.9rem;">Categorias vazias</span>';
        return;
    }

    let html = `
        <div class="category-pill active" data-id="all">
            Tudo
        </div>
    `;

    categories.forEach(cat => {
        html += `
            <div class="category-pill" data-id="${cat.id}">
                ${cat.name || 'Sem nome'}
            </div>
        `;
    });

    categoriesContainer.innerHTML = html;

    // Listeners
    document.querySelectorAll('.category-pill').forEach(pill => {
        pill.addEventListener('click', (e) => {
            // Remove active style from all
            document.querySelectorAll('.category-pill').forEach(p => p.classList.remove('active'));
            // Add to clicked
            e.currentTarget.classList.add('active');

            const catId = e.currentTarget.getAttribute('data-id');
            currentCategoryFilter = catId === 'all' ? null : catId;
            updateFilterMessage();
            applyFiltersAndRender();
        });
    });
}

function renderBrands(brands) {
    if (!brands || brands.length === 0) {
        brandsContainer.innerHTML = '<p style="color:#aaa;font-size:0.9rem;">Nenhuma loja encontrada.</p>';
        return;
    }

    let html = '';
    brands.forEach(brand => {
        // Se a marca tem imagem real (usa a propriedade "logo" do Firestore)
        const logoUrl = brand.logo ? brand.logo.replace(/^http:\/\//i, 'https://').replace(/^\/\//, 'https://') : null;
        const logoRender = logoUrl
            ? `<img src="${logoUrl}" alt="${brand.name}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">`
            : `<i class="fa-solid fa-shop" style="color: #666; font-size: 1.5rem;"></i>`;

        html += `
            <div class="brand-card" data-id="${brand.id}" onclick="filterByBrand('${brand.id}', '${brand.name || 'Loja'}')">
                <div class="brand-logo-container" style="border: 2px solid transparent;">
                    ${logoRender}
                </div>
                <span>${brand.name || 'Loja'}</span>
            </div>
        `;
    });

    brandsContainer.innerHTML = html;
}

window.filterByBrand = (brandId, brandName) => {
    currentBrandFilter = brandId;
    updateFilterMessage();
    applyFiltersAndRender();
};

window.clearBrandFilter = () => {
    currentBrandFilter = null;
    updateFilterMessage();
    applyFiltersAndRender();
};

function updateFilterMessage() {
    if (currentBrandFilter) {
        const bName = allBrands[currentBrandFilter]?.name || 'a loja selecionada';
        activeFilterMsg.innerHTML = `
            Mostrando cupons de <strong>${bName}</strong>. 
            <a href="javascript:void(0)" onclick="clearBrandFilter()" style="color:var(--primary);text-decoration:underline;">Remover filtro</a>
        `;
    } else {
        activeFilterMsg.innerHTML = '';
    }
}

function renderCoupons(items) {
    if (!items || items.length === 0) {
        couponsContainer.innerHTML = '<div style="grid-column: 1/-1; text-align:center; padding: 2rem; color: #999;">Nenhum cupom ou oferta disponível no momento.</div>';
        return;
    }

    let html = '';
    items.forEach(item => {
        const brand = allBrands[item.brandId] || {};
        const isCodeStr = item.docType === 'code' || item.couponCode || item.code;

        let typeHtml = isCodeStr ? `<i class="fa-solid fa-ticket type-code"></i> Código` : `<i class="fa-solid fa-bolt type-offer"></i> Ativação`;
        let codeLabel = isCodeStr ? (item.couponCode || item.code || 'CUPOM') : 'OFERTA';
        let btnText = isCodeStr ? 'VER CUPOM' : 'ATIVAR';

        const rawLogo = item.brandLogo || brand.logo;
        const secureLogoUrl = rawLogo ? rawLogo.replace(/^http:\/\//i, 'https://').replace(/^\/\//, 'https://') : null;

        const bLogo = secureLogoUrl
            ? `<img src="${secureLogoUrl}" style="width:100%;height:100%;object-fit:cover;border-radius:8px;">`
            : `<div style="color:#666;font-weight:bold;font-size:1.5rem;display:flex;align-items:center;justify-content:center;height:100%;width:100%;">${(item.brandName || brand.name || 'L').charAt(0)}</div>`;

        html += `
            <div class="coupon-item">
                <div class="coupon-header">
                    <div class="coupon-brand-logo">
                        ${bLogo}
                    </div>
                    <div class="coupon-badge">${isCodeStr ? 'Cupom' : 'Oferta'}</div>
                </div>
                <div>
                    <h4 class="coupon-title">${item.brandName || brand.name || item.name || 'Super Oferta'}</h4>
                    <p class="coupon-desc">${item.description || item.desc || 'Aproveite essa oportunidade incrível!.'}</p>
                </div>
                <div class="coupon-footer">
                    <div class="coupon-type">
                        ${typeHtml}
                    </div>
                    <button class="coupon-action-btn" onclick="alert('Funcionalidade de redirecionamento para afiliado. Baixe o app para a experiência completa!')">${btnText}</button>
                </div>
            </div>
        `;
    });

    couponsContainer.innerHTML = html;
}

// Inicia aplicação
loadInitialData();
