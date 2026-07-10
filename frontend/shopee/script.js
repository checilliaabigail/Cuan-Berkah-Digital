// ============================================================
// KALKULATOR CUAN SHOPEE - SCRIPT.JS
// Cuan Berkah Digital
// ============================================================

const DATA_PATH = 'data/';
const MAX_LIVE_XTRA = 20000;

let dataXTRACategory = [];
let dataAdminMall = [];
let dataAdminNonMall = [];
let dataPromoXtra = [];
let dataXtraFee = [];
let dataBiayaPembayaran = [];
let dataLiveXtra = [];
let dataSPayLater = [];
let dataFreePO = [];
let productIndex = [];

const DOM = {};

function cacheDomElements() {
    DOM.kategoriSelect = document.getElementById('kategori');
    DOM.subKategoriSelect = document.getElementById('subKategoriSelect');
    DOM.subKategoriDisplay = document.getElementById('subKategoriDisplay');
    DOM.subKategoriHidden = document.getElementById('subKategori');
    DOM.tipeTokoSelect = document.getElementById('tipeToko');
    DOM.biayaAdminText = document.getElementById('biayaAdminText');
    DOM.biayaPembayaranText = document.getElementById('biayaPembayaranText');
    DOM.hargaNett = document.getElementById('hargaNett');
    DOM.totalBiayaShopee = document.getElementById('totalBiayaShopee');
    DOM.danaDicairkan = document.getElementById('danaDicairkan');
    DOM.totalCOGS = document.getElementById('totalCOGS');
    DOM.profitKotor = document.getElementById('profitKotor');
    DOM.totalBiaya = document.getElementById('totalBiaya');
    DOM.profitSebelumPajak = document.getElementById('profitSebelumPajak');
    DOM.pajak = document.getElementById('pajak');
    DOM.profitBersih = document.getElementById('profitBersih');
    DOM.profitBersihBox = document.getElementById('profitBersihBox');
    DOM.searchProduk = document.getElementById('searchProduk');
    DOM.searchResults = document.getElementById('searchResults');

    DOM.inputs = {
        productName: document.getElementById('productName'),
        hargaJual: document.getElementById('hargaJual'),
        diskon: document.getElementById('diskon'),
        voucher: document.getElementById('voucher'),
        basketSize: document.getElementById('basketSize'),
        hpp: document.getElementById('hpp'),
        biayaPenanganan: document.getElementById('biayaPenanganan'),
        roas: document.getElementById('roas'),
        komisiAfiliasi: document.getElementById('komisiAfiliasi'),
        promosiLuar: document.getElementById('promosiLuar'),
        biayaPacking: document.getElementById('biayaPacking'),
        biayaOperasional: document.getElementById('biayaOperasional'),
        biayaLain: document.getElementById('biayaLain'),
        pajakRate: document.getElementById('pajakRate'),
        biayaLainPersen: document.getElementById('biayaLainPersen'),
        biayaLainRp: document.getElementById('biayaLainRp')
    };

    DOM.toggles = {
        promoXTRA: document.getElementById('promoXTRA'),
        promoXTRAplus: document.getElementById('promoXTRAplus'),
        liveXTRA: document.getElementById('liveXTRA'),
        spayLater: document.getElementById('spayLater'),
        hematKirim: document.getElementById('hematKirim'),
        asuransi: document.getElementById('asuransi'),
        produkPO: document.getElementById('produkPO'),
        ppn: document.getElementById('ppn')
    };
}

// ============================================================
// LOAD DATA
// ============================================================
async function loadAllData() {
    try {
        const [xtraCategory, adminMall, adminNonMall, promoXtra, xtraFee, biayaPembayaran, liveXtra, spayLater, freePO] = await Promise.all([
            fetch(`${DATA_PATH}xtraCategory.json`).then(r => { if (!r.ok) throw new Error('xtraCategory.json not found'); return r.json(); }),
            fetch(`${DATA_PATH}admin_mall.json`).then(r => { if (!r.ok) throw new Error('admin_mall.json not found'); return r.json(); }),
            fetch(`${DATA_PATH}admin_non-mall.json`).then(r => { if (!r.ok) throw new Error('admin_non-mall.json not found'); return r.json(); }),
            fetch(`${DATA_PATH}promo_xtra.json`).then(r => { if (!r.ok) throw new Error('promo_xtra.json not found'); return r.json(); }),
            fetch(`${DATA_PATH}xtraFee.json`).then(r => { if (!r.ok) throw new Error('xtraFee.json not found'); return r.json(); }),
            fetch(`${DATA_PATH}biaya_pembayaran.json`).then(r => { if (!r.ok) throw new Error('biaya_pembayaran.json not found'); return r.json(); }),
            fetch(`${DATA_PATH}live_xtra.json`).then(r => { if (!r.ok) throw new Error('live_xtra.json not found'); return r.json(); }),
            fetch(`${DATA_PATH}spaylater_xtra.json`).then(r => { if (!r.ok) throw new Error('spaylater_xtra.json not found'); return r.json(); }),
            fetch(`${DATA_PATH}free_po.json`).then(r => { if (!r.ok) throw new Error('free_po.json not found'); return r.json(); })
        ]);

        dataXTRACategory = xtraCategory;
        dataAdminMall = adminMall;
        dataAdminNonMall = adminNonMall;
        dataPromoXtra = promoXtra;
        dataXtraFee = xtraFee;
        dataBiayaPembayaran = biayaPembayaran;
        dataLiveXtra = liveXtra;
        dataSPayLater = spayLater;
        dataFreePO = freePO;

        console.log('✅ Semua data berhasil dimuat!');
        buildProductIndex();
        initApp();

    } catch (error) {
        console.error('❌ Gagal load data:', error);
        alert('Gagal memuat data. Pastikan file JSON tersedia di folder data/\n\nError: ' + error.message);
    }
}

// ============================================================
// PRODUCT INDEX & SEARCH
// ============================================================
function buildProductIndex() {
    productIndex = [];
    const seen = new Set();

    dataAdminNonMall.forEach(item => {
        if (item.jenisProduk && Array.isArray(item.jenisProduk)) {
            item.jenisProduk.forEach(product => {
                const key = product + '|' + item.subKategori;
                if (seen.has(key)) return;
                seen.add(key);

                const mallItem = dataAdminMall.find(m =>
                    m.kategoriUtama === item.kategoriUtama &&
                    m.subKategori === item.subKategori
                );

                productIndex.push({
                    keyword: product.toLowerCase(),
                    displayName: product,
                    kategoriUtama: item.kategoriUtama,
                    kategori: item.kategori,
                    subKategori: item.subKategori,
                    adminFee: item.adminFee,
                    mallFee: mallItem ? mallItem.adminFee : item.adminFee
                });
            });
        }
    });

    console.log('📊 Product Index:', productIndex.length, 'items');
}

function searchProducts(query) {
    if (!query || query.length < 2) return [];
    const q = query.toLowerCase();
    return productIndex.filter(item =>
        item.keyword.includes(q) || item.subKategori.toLowerCase().includes(q)
    ).slice(0, 15);
}

function displaySearchResults(results) {
    const container = DOM.searchResults;
    if (results.length === 0) {
        container.classList.remove('show');
        container.innerHTML = '';
        return;
    }

    container.classList.add('show');
    container.innerHTML = '';

    results.forEach(item => {
        const div = document.createElement('div');
        div.className = 'search-result-item';

        const leftDiv = document.createElement('div');
        leftDiv.innerHTML = `
            <div class="product-name">${item.displayName}</div>
            <div class="product-path">${item.kategoriUtama} › ${item.kategori} › ${item.subKategori}</div>
        `;

        const feeDiv = document.createElement('div');
        feeDiv.className = 'product-fee';
        feeDiv.textContent = `Admin: ${item.adminFee}%`;

        div.appendChild(leftDiv);
        div.appendChild(feeDiv);
        div.addEventListener('click', () => selectProduct(item));
        container.appendChild(div);
    });
}

function selectProduct(item) {
    DOM.searchProduk.value = item.displayName;
    DOM.subKategoriDisplay.value = `${item.subKategori} (${item.kategoriUtama})`;
    DOM.subKategoriHidden.value = item.subKategori;

    let kategoriValue = 'lainnya';
    if (item.kategoriUtama === 'Fashion') kategoriValue = 'fashion';
    else if (item.kategoriUtama === 'FMCG') kategoriValue = 'fmcg';
    else if (item.kategoriUtama === 'Elektronik') kategoriValue = 'elektronik';
    else if (item.kategoriUtama === 'Lifestyle') kategoriValue = 'lifestyle';

    DOM.kategoriSelect.value = kategoriValue;
    updateSubKategoriFromJSON();

    const options = DOM.subKategoriSelect.options;
    for (let i = 0; i < options.length; i++) {
        if (options[i].value === item.subKategori) {
            DOM.subKategoriSelect.selectedIndex = i;
            break;
        }
    }

    hitungBiayaAdmin();
    hitungBiayaPembayaran();
    hitungSemua();

    DOM.searchResults.classList.remove('show');
    DOM.searchResults.innerHTML = '';
}

// ============================================================
// UTILITY
// ============================================================
function getNumber(id) {
    const el = document.getElementById(id);
    if (!el) return 0;
    const val = el.value;
    if (val === '' || val === null || val === undefined) return 0;
    return parseFloat(val) || 0;
}

function formatRupiah(angka) {
    if (isNaN(angka) || angka === null || angka === undefined) return 'Rp 0';
    const bilangan = Math.round(angka);
    return 'Rp ' + bilangan.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

function showBox(id, nilai, textId) {
    const box = document.getElementById(id);
    const text = document.getElementById(textId);
    if (!box || !text) return;
    if (nilai > 0) {
        box.style.display = 'flex';
        text.innerText = formatRupiah(nilai);
    } else {
        box.style.display = 'none';
    }
}

function hideBox(id) {
    const el = document.getElementById(id);
    if (el) el.style.display = 'none';
}

// ============================================================
// RESET FORM
// ============================================================
function resetForm() {
    const inputIds = [
        'productName', 'hargaJual', 'diskon', 'voucher', 'basketSize',
        'hpp', 'biayaPenanganan', 'roas', 'komisiAfiliasi', 'promosiLuar',
        'biayaPacking', 'biayaOperasional', 'biayaLain', 'pajakRate',
        'biayaLainPersen', 'biayaLainRp'
    ];

    inputIds.forEach(id => {
        const el = document.getElementById(id);
        if (el && (el.type === 'text' || el.type === 'number')) el.value = '';
    });

    DOM.kategoriSelect.value = 'fashion';
    DOM.tipeTokoSelect.value = 'nonStar';
    DOM.subKategoriSelect.innerHTML = '<option value="">-- Pilih Sub Kategori --</option>';
    DOM.subKategoriDisplay.value = '';
    DOM.subKategoriHidden.value = '';
    DOM.searchProduk.value = '';
    DOM.searchResults.classList.remove('show');
    DOM.searchResults.innerHTML = '';

    Object.values(DOM.toggles).forEach(el => { if (el) el.value = 'No'; });

    const boxes = [
        'promoXTRABox', 'promoXTRAplusBox', 'liveXTRABox',
        'spayLaterBox', 'hematKirimBox', 'asuransiBox', 'produkPOBox',
        'biayaLainPersenBox', 'biayaLainRpBox', 'ppnBox'
    ];
    boxes.forEach(hideBox);

    updateSubKategoriFromJSON();
    console.log('🔄 Form telah direset!');
}

// ============================================================
// UPDATE SUB KATEGORI
// ============================================================
function updateSubKategoriFromJSON() {
    const kategori = DOM.kategoriSelect.value;
    const select = DOM.subKategoriSelect;
    select.innerHTML = '<option value="">-- Pilih Sub Kategori --</option>';

    const filterMap = {
        fashion: 'Fashion',
        fmcg: 'FMCG',
        elektronik: 'Elektronik',
        lifestyle: 'Lifestyle'
    };

    let dataSource = [];
    if (filterMap[kategori]) {
        dataSource = dataAdminNonMall.filter(item => item.kategoriUtama === filterMap[kategori]);
    } else {
        dataSource = dataAdminNonMall.filter(item =>
            item.kategoriUtama === 'Kategori Lainnya' ||
            item.kategoriUtama === 'Tiket, Voucher, & Layanan'
        );
    }

    const grouped = {};
    dataSource.forEach(item => {
        if (!grouped[item.subKategori]) grouped[item.subKategori] = [];
        grouped[item.subKategori].push(item);
    });

    Object.keys(grouped).sort().forEach(subKategori => {
        const option = document.createElement('option');
        option.value = subKategori;
        option.textContent = subKategori;

        const firstItem = grouped[subKategori][0];
        const adminFeeNonMall = firstItem.adminFee || 0;
        const mallItem = dataAdminMall.find(item =>
            item.kategoriUtama === firstItem.kategoriUtama &&
            item.subKategori === subKategori
        );

        option.setAttribute('data-admin-nonmall', adminFeeNonMall);
        option.setAttribute('data-admin-mall', mallItem ? mallItem.adminFee : adminFeeNonMall);
        option.setAttribute('data-kategori-utama', firstItem.kategoriUtama || '');
        option.setAttribute('data-kategori', firstItem.kategori || '');
        select.appendChild(option);
    });
}

// ============================================================
// HITUNG BIAYA ADMIN & PEMBAYARAN
// ============================================================
function hitungBiayaAdmin() {
    const hargaJual = getNumber('hargaJual');
    const hargaNett = hargaJual - getNumber('diskon') - getNumber('voucher');
    const tipeToko = DOM.tipeTokoSelect.value;
    const selectedOption = DOM.subKategoriSelect.options[DOM.subKategoriSelect.selectedIndex];

    if (!selectedOption || !selectedOption.value || hargaNett <= 0) {
        DOM.biayaAdminText.innerText = '0% → Rp 0';
        return 0;
    }

    const persen = parseFloat(selectedOption.getAttribute(
        tipeToko === 'mall' ? 'data-admin-mall' : 'data-admin-nonmall'
    )) || 0;

    const biayaAdminRp = (persen / 100) * hargaNett;
    DOM.biayaAdminText.innerText = `${persen}% → ${formatRupiah(biayaAdminRp)}`;
    return biayaAdminRp;
}

function hitungBiayaPembayaran() {
    const hargaNett = getNumber('hargaJual') - getNumber('diskon') - getNumber('voucher');
    if (hargaNett <= 0) {
        DOM.biayaPembayaranText.innerText = '0% → Rp 0';
        return 0;
    }

    const tipeToko = DOM.tipeTokoSelect.value;
    const data = dataBiayaPembayaran.find(item =>
        item.tipeToko === (tipeToko === 'mall' ? 'mall' : 'nonStar')
    );

    if (!data) {
        DOM.biayaPembayaranText.innerText = '0% → Rp 0';
        return 0;
    }

    let biaya = hargaNett * data.rate;
    if (data.maxPerQty > 0 && biaya > data.maxPerQty) biaya = data.maxPerQty;

    DOM.biayaPembayaranText.innerText = `${(data.rate * 100).toFixed(1)}% → ${formatRupiah(biaya)}`;
    return biaya;
}

// ============================================================
// HITUNG KOMPONEN XTRA
// ============================================================
function hitungPromoXTRA() {
    if (DOM.toggles.promoXTRA.value === 'No') return 0;
    const hargaNett = getNumber('hargaJual') - getNumber('diskon') - getNumber('voucher');
    const data = dataPromoXtra.find(item => item.fieldName === 'promoXTRA');
    if (!data) return 0;
    return Math.min(hargaNett * data.rate, data.maxBiaya);
}

function hitungPromoXTRAplus() {
    if (DOM.toggles.promoXTRAplus.value === 'No') return 0;
    const hargaNett = getNumber('hargaJual') - getNumber('diskon') - getNumber('voucher');
    const data = dataPromoXtra.find(item => item.fieldName === 'promoXTRAplus');
    if (!data) return 0;
    return Math.min(hargaNett * data.rate, data.maxBiaya);
}

function hitungLiveXTRA() {
    const pilihan = DOM.toggles.liveXTRA.value;
    if (pilihan === 'No') return 0;
    const hargaNett = getNumber('hargaJual') - getNumber('diskon') - getNumber('voucher');
    const data = dataLiveXtra.find(item => item.fieldName === 'liveXTRA');
    if (!data) return 0;
    const option = data.options.find(opt => opt.value === pilihan);
    if (!option) return 0;
    return Math.min(hargaNett * option.rate, option.maxBiaya);
}

function hitungSPayLater() {
    const pilihan = DOM.toggles.spayLater.value;
    if (pilihan === 'No') return 0;
    const hargaNett = getNumber('hargaJual') - getNumber('diskon') - getNumber('voucher');
    const data = dataSPayLater.find(item => item.fieldName === 'spayLater');
    if (!data) return 0;
    const option = data.options.find(opt => opt.value === pilihan);
    if (!option) return 0;
    return hargaNett * option.rate;
}

function isFreePO(productName) {
    if (!productName) return false;
    return dataFreePO.some(item =>
        item.jenisProduk.toLowerCase() === productName.toLowerCase() ||
        item.jenisProduk.toLowerCase().includes(productName.toLowerCase())
    );
}

function hitungProdukPO(hargaNett) {
    const pilihan = DOM.toggles.produkPO.value;
    const productName = DOM.searchProduk.value.trim();
    if (pilihan === 'No' || isFreePO(productName)) return 0;
    if (pilihan === 'Yes3') return 0.03 * hargaNett;
    return 0;
}

function hitungGratisOngkirDariJSON() {
    let productName = DOM.searchProduk.value.trim();

    if (!productName) {
        const match = DOM.subKategoriDisplay.value.match(/^(.+?)\s*\(/);
        if (match) productName = match[1].trim();
    }

    if (!productName) {
        const selectedOption = DOM.subKategoriSelect.options[DOM.subKategoriSelect.selectedIndex];
        if (selectedOption && selectedOption.value) {
            const productData = dataAdminNonMall.find(item => item.subKategori === selectedOption.value);
            if (productData?.jenisProduk?.length > 0) productName = productData.jenisProduk[0];
        }
    }

    const selectedOption = DOM.subKategoriSelect.options[DOM.subKategoriSelect.selectedIndex];
    const subKategori = selectedOption?.value || '';
    const kategoriUtama = selectedOption?.getAttribute('data-kategori-utama') || '';
    const hargaNett = getNumber('hargaJual') - getNumber('diskon') - getNumber('voucher');

    if (hargaNett <= 0) return { biasa: 0, khusus: 0 };

    let found = null;

    if (productName) {
        found = dataXTRACategory.find(item =>
            item.jenisProduk?.some(p =>
                p.toLowerCase() === productName.toLowerCase() ||
                p.toLowerCase().includes(productName.toLowerCase())
            )
        );
    }

    if (!found && subKategori) {
        found = dataXTRACategory.find(item =>
            item.kategoriUtama === kategoriUtama && item.subKategori === subKategori
        );
    }

    if (!found && subKategori) {
        const keywords = subKategori.toLowerCase().split(/[()\-,\s]+/).filter(w => w.length > 3);
        for (const keyword of keywords) {
            found = dataXTRACategory.find(item =>
                item.kategoriUtama === kategoriUtama &&
                item.subKategori.toLowerCase().includes(keyword)
            );
            if (found) break;
        }
    }

    if (!found && kategoriUtama) {
        found = dataXTRACategory.find(item => item.kategoriUtama === kategoriUtama);
    }

    if (!found) return { biasa: 0, khusus: 0 };

    const calc = (cfg) => {
        if (!cfg?.rate) return 0;
        const biaya = hargaNett * cfg.rate;
        return cfg.maxPerQty ? Math.min(biaya, cfg.maxPerQty) : biaya;
    };

    return { biasa: calc(found.regular), khusus: calc(found.special) };
}

// ============================================================
// FUNGSI UTAMA PERHITUNGAN
// ============================================================
function hitungSemua() {
    const hargaJual = getNumber('hargaJual');
    const diskon = getNumber('diskon');
    const voucher = getNumber('voucher');

    // ✅ FIX BUG 1: hargaNett dideklarasi PERTAMA sebelum dipakai di mana pun
    const hargaNett = hargaJual - diskon - voucher;
    DOM.hargaNett.innerText = formatRupiah(hargaNett);

    const promoXTRA = DOM.toggles.promoXTRA.value;
    const promoXTRAplus = DOM.toggles.promoXTRAplus.value;
    const liveXTRA = DOM.toggles.liveXTRA.value;
    const spayLater = DOM.toggles.spayLater.value;
    const hematKirim = DOM.toggles.hematKirim.value;
    const asuransi = DOM.toggles.asuransi.value;
    const produkPO = DOM.toggles.produkPO.value;

    const hpp = getNumber('hpp');
    const biayaPenanganan = getNumber('biayaPenanganan');
    const roas = getNumber('roas');
    const komisiAfiliasiPersen = getNumber('komisiAfiliasi');
    const promosiLuar = getNumber('promosiLuar');
    const biayaPacking = getNumber('biayaPacking');
    const biayaOperasional = getNumber('biayaOperasional');
    const biayaLain = getNumber('biayaLain');
    const pajakRate = getNumber('pajakRate') / 100;

    // 2. Biaya Admin
    let biayaAdmin = hitungBiayaAdmin();
    if (isNaN(biayaAdmin)) biayaAdmin = 0;

    // 3. Biaya Pembayaran
    let biayaPembayaran = hitungBiayaPembayaran();
    if (isNaN(biayaPembayaran)) biayaPembayaran = 0;

    // 4. Biaya Proses Pesanan
    const basketSize = getNumber('basketSize');
    const biayaProses = basketSize > 0 ? Math.round(1250 / basketSize) : 0;

    // 5. Gratis Ongkir XTRA
    const ongkirFromJSON = hitungGratisOngkirDariJSON();
    const ukuranBarang = document.getElementById('ukuranBarang').value;
    const gratisOngkir = ukuranBarang === 'biasa' ? ongkirFromJSON.biasa : ongkirFromJSON.khusus;
    document.getElementById('gratisOngkirXtraText').innerText = formatRupiah(gratisOngkir);

    // 6. Promo XTRA
    const biayaPromoXTRA = hitungPromoXTRA();
    if (promoXTRA === 'Yes') {
        showBox('promoXTRABox', biayaPromoXTRA, 'biayaPromoXTRAText');
    } else {
        hideBox('promoXTRABox');
    }

    // 7. Promo XTRA+
    const biayaPromoXTRAplus = hitungPromoXTRAplus();
    if (promoXTRAplus === 'Yes') {
        showBox('promoXTRAplusBox', biayaPromoXTRAplus, 'biayaPromoXTRAplusText');
    } else {
        hideBox('promoXTRAplusBox');
    }

    // 8. Live XTRA
    const biayaLiveXTRA = hitungLiveXTRA();
    if (liveXTRA !== 'No') {
        showBox('liveXTRABox', biayaLiveXTRA, 'biayaLiveXTRAText');
    } else {
        hideBox('liveXTRABox');
    }

    // 9. SPayLater
    const biayaSPayLater = hitungSPayLater();
    if (spayLater !== 'No') {
        showBox('spayLaterBox', biayaSPayLater, 'biayaSPayLaterText');
    } else {
        hideBox('spayLaterBox');
    }

    // 10. Hemat Biaya Kirim
    const biayaHematKirim = hematKirim === 'Yes' ? 350 : 0;
    if (hematKirim === 'Yes') {
        showBox('hematKirimBox', biayaHematKirim, 'biayaHematKirimText');
    } else {
        hideBox('hematKirimBox');
    }

    // 11. Asuransi
    const biayaAsuransi = asuransi === 'Yes' ? 0.005 * hargaNett : 0;
    if (asuransi === 'Yes') {
        showBox('asuransiBox', biayaAsuransi, 'biayaAsuransiText');
    } else {
        hideBox('asuransiBox');
    }

    // 12. Produk PO
    const biayaPO = hitungProdukPO(hargaNett);
    if (produkPO === 'Yes3' && !isFreePO(DOM.searchProduk.value.trim())) {
        showBox('produkPOBox', biayaPO, 'biayaPOText');
    } else {
        hideBox('produkPOBox');
    }

    // 13. Biaya Lain-Lain (%)
    const biayaLainPersen = getNumber('biayaLainPersen');
    const biayaLainPersenRp = biayaLainPersen > 0 ? (biayaLainPersen / 100) * hargaNett : 0;
    if (biayaLainPersen > 0) {
        showBox('biayaLainPersenBox', biayaLainPersenRp, 'biayaLainPersenText');
    } else {
        hideBox('biayaLainPersenBox');
    }

    // 14. Biaya Lain-Lain (Rp)
    const biayaLainRp = getNumber('biayaLainRp');
    if (biayaLainRp > 0) {
        showBox('biayaLainRpBox', biayaLainRp, 'biayaLainRpText');
    } else {
        hideBox('biayaLainRpBox');
    }

    // 15. Total Biaya Shopee
    const totalBiayaShopee = biayaAdmin + biayaPembayaran + biayaProses +
        gratisOngkir + biayaPromoXTRA + biayaPromoXTRAplus + biayaLiveXTRA +
        biayaSPayLater + biayaHematKirim + biayaAsuransi + biayaPO +
        biayaLainPersenRp + biayaLainRp;
    DOM.totalBiayaShopee.innerText = formatRupiah(totalBiayaShopee);

    // 16. Dana Dicairkan
    const danaDicairkan = hargaNett - totalBiayaShopee;
    DOM.danaDicairkan.innerText = formatRupiah(danaDicairkan);

    // 17. COGS
    const totalCOGS = hpp + biayaPenanganan;
    DOM.totalCOGS.innerText = formatRupiah(totalCOGS);

    // 18. Profit Kotor
    const profitKotor = danaDicairkan - totalCOGS;
    DOM.profitKotor.innerText = formatRupiah(profitKotor);

    // 19. Pengeluaran
    const biayaIklan = roas > 0 ? (1 / roas) * hargaNett : 0;
    const biayaKomisiAfiliasi = (komisiAfiliasiPersen / 100) * hargaNett;
    const totalPengeluaran = biayaIklan + biayaKomisiAfiliasi + promosiLuar +
        biayaPacking + biayaOperasional + biayaLain;
    DOM.totalBiaya.innerText = formatRupiah(totalPengeluaran);

    // 20. Profit Sebelum Pajak
    const profitSebelumPajak = profitKotor - totalPengeluaran;
    DOM.profitSebelumPajak.innerText = formatRupiah(profitSebelumPajak);

    // 21. Pajak UMKM
    const pajak = pajakRate * hargaNett;
    DOM.pajak.innerText = formatRupiah(pajak);

    // 21b. PPN
    const ppn = DOM.toggles.ppn.value;
    const biayaPPN = ppn === 'Yes' ? 0.11 * hargaNett : 0;
    if (ppn === 'Yes') {
        showBox('ppnBox', biayaPPN, 'ppnText');
    } else {
        hideBox('ppnBox');
    }

    // 22. Profit Bersih
    const profitBersih = profitSebelumPajak - pajak - biayaPPN;
    DOM.profitBersih.innerText = formatRupiah(profitBersih);

    if (profitBersih >= 0) {
        DOM.profitBersih.className = 'result-value profit-positive';
        DOM.profitBersihBox.style.background = '#d1fae5';
    } else {
        DOM.profitBersih.className = 'result-value profit-negative';
        DOM.profitBersihBox.style.background = '#fee2e2';
    }
}

// ============================================================
// EVENT LISTENERS
// ============================================================
function attachEventListeners() {
    DOM.kategoriSelect.addEventListener('change', () => {
        updateSubKategoriFromJSON();
        DOM.subKategoriDisplay.value = '';
        DOM.subKategoriHidden.value = '';
        hitungBiayaAdmin();
        hitungBiayaPembayaran();
        hitungSemua();
    });

    DOM.tipeTokoSelect.addEventListener('change', () => {
        hitungBiayaAdmin();
        hitungBiayaPembayaran();
        hitungSemua();
    });

    DOM.subKategoriSelect.addEventListener('change', function() {
        const selectedOption = this.options[this.selectedIndex];
        if (selectedOption && selectedOption.value) {
            const kategoriUtama = selectedOption.getAttribute('data-kategori-utama') || '';
            DOM.subKategoriDisplay.value = `${selectedOption.value} (${kategoriUtama})`;
            DOM.subKategoriHidden.value = selectedOption.value;

            const productData = dataAdminNonMall.find(item => item.subKategori === selectedOption.value);
            if (productData?.jenisProduk?.length > 0) DOM.searchProduk.value = productData.jenisProduk[0];
        } else {
            DOM.subKategoriDisplay.value = '';
            DOM.subKategoriHidden.value = '';
            DOM.searchProduk.value = '';
        }
        hitungBiayaAdmin();
        hitungSemua();
    });

    DOM.searchProduk.addEventListener('input', function() {
        const results = searchProducts(this.value.trim());
        displaySearchResults(results);
    });

    DOM.searchProduk.addEventListener('focus', function() {
        if (this.value.trim().length >= 2) displaySearchResults(searchProducts(this.value.trim()));
    });

    document.addEventListener('click', function(e) {
        if (!DOM.searchProduk.contains(e.target) && !DOM.searchResults.contains(e.target)) {
            DOM.searchResults.classList.remove('show');
            DOM.searchResults.innerHTML = '';
        }
    });

    // ✅ FIX BUG 2: field desimal (%) hanya pakai 'change', bukan 'input'
    // supaya user bisa ketik "2.5" tanpa terpotong di "2."
    const inputOnChange = ['biayaLainPersen', 'pajakRate', 'komisiAfiliasi'];
    inputOnChange.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('change', hitungSemua);
    });

    // Field angka bulat tetap pakai 'input' supaya real-time
    const inputRealtime = [
        'hargaJual', 'diskon', 'voucher', 'basketSize',
        'hpp', 'biayaPenanganan', 'roas', 'promosiLuar',
        'biayaPacking', 'biayaOperasional', 'biayaLain', 'biayaLainRp'
    ];
    inputRealtime.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('input', hitungSemua);
            el.addEventListener('change', hitungSemua);
        }
    });

    const ukuranBarangEl = document.getElementById('ukuranBarang');
    if (ukuranBarangEl) ukuranBarangEl.addEventListener('change', hitungSemua);

    const toggleIds = ['promoXTRA', 'promoXTRAplus', 'liveXTRA', 'spayLater', 'hematKirim', 'asuransi', 'produkPO', 'ppn'];
    toggleIds.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('change', hitungSemua);
    });
}

// ============================================================
// INIT
// ============================================================
function initApp() {
    cacheDomElements();
    resetForm();
    attachEventListeners();
    hitungSemua();
    console.log('🚀 Aplikasi siap digunakan!');
}

document.addEventListener('DOMContentLoaded', loadAllData);
