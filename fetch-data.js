const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// 1. Carrega as credenciais da Service Account do Firebase
// Criada dinamicamente pelo GitHub Actions
const serviceAccount = require('./firebase-service-account.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// 2. Pasta onde o arquivo estático JSON será salvo
const DATA_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}

async function fetchAllData() {
    console.log('🔄 Iniciando fetch do Firestore para o Site Estático...');
    const jsonOutput = {
        lastUpdated: new Date().toISOString(),
        brands: [],
        categories: [],
        coupons: [],
        offers: []
    };

    try {
        // 3. Buscar todas Marcas
        console.log('📦 Buscando Brands...');
        const brandsSnap = await db.collection('brands').get();
        brandsSnap.forEach(doc => {
            const data = doc.data();
            // Salva apenas campos essenciais pro frontend para reduzir tamanho do json
            jsonOutput.brands.push({
                id: doc.id,
                name: data.name,
                logo: data.logo,
                segment: data.segment,
                isHighlight: data.isHighlight
            });
        });

        // 4. Buscar Categorias
        console.log('🏷️ Buscando Categories...');
        const catsSnap = await db.collection('categories').get();
        catsSnap.forEach(doc => {
            const data = doc.data();
            jsonOutput.categories.push({
                id: doc.id,
                name: data.name,
                slug: data.slug,
                icon: data.icon
            });
        });

        // 5. Buscar Cupons
        console.log('🎫 Buscando Coupons...');
        const couponsSnap = await db.collection('coupons').get();
        couponsSnap.forEach(doc => {
            const data = doc.data();
            jsonOutput.coupons.push({
                id: doc.id,
                brandId: data.brandId,
                brandName: data.brandName,
                brandLogo: data.brandLogo,
                code: data.code,
                description: data.description,
                docType: 'code',
                categories: data.categories,
                isHighlight: data.isHighlight
            });
        });

        // 6. Buscar Offers
        console.log('🎁 Buscando Offers...');
        const offersSnap = await db.collection('offers').get();
        offersSnap.forEach(doc => {
            const data = doc.data();
            jsonOutput.offers.push({
                id: doc.id,
                brandId: data.brandId,
                brandName: data.brandName,
                brandLogo: data.brandLogo,
                name: data.name,
                description: data.description,
                docType: 'offer',
                categories: data.categories,
                isHighlight: data.isHighlight
            });
        });

        // 7. Escrever tudo num único arquivo
        const outputPath = path.join(DATA_DIR, 'ofertas.json');
        fs.writeFileSync(outputPath, JSON.stringify(jsonOutput, null, 2), 'utf8');
        console.log(`✅ Sucesso! Dados estáticos salvos em ${outputPath}`);

    } catch (error) {
        console.error('❌ Erro durante a geração dos dados:', error);
        process.exit(1);
    }
}

fetchAllData();
