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
let _isCalculating = false;
let _lastResult = null;
let _previewEnabled = true;

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
    DOM.danaDicairkanPreview = document.getElementById('danaDicairkanPreview');

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

    hitungPreview();
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
    // Aktifkan preview lagi
    _previewEnabled = true;
    _isCalculating = false;
    _lastResult = null;

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

    // Reset semua hasil ke Rp 0
    const resultIds = [
        'biayaAdminText', 'biayaPembayaranText', 'gratisOngkirXtraText',
        'totalBiayaShopee', 'danaDicairkan', 'danaDicairkanPreview',
        'totalCOGS', 'profitKotor', 'totalBiaya', 'profitSebelumPajak',
        'pajak', 'profitBersih', 'ppnText'
    ];
    resultIds.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.innerText = 'Rp 0';
    });

    // Hapus class hasil
    document.querySelectorAll('.result-box').forEach(el => {
        el.classList.remove('has-result', 'result-final');
        el.classList.add('empty');
    });

    // Reset status
    const status = document.getElementById('statusHitung');
    if (status) {
        status.textContent = '';
        status.style.color = '#718096';
    }

    window._hasilKalkulasi = null;
    updateSubKategoriFromJSON();
    hitungPreview();
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
// HITUNG PREVIEW (REAL-TIME)
// ============================================================
function hitungPreview() {
    // JANGAN JALANKAN PREVIEW KALAU SUDAH ADA HASIL RESMI ATAU PREVIEW DINONAKTIFKAN
    if (_lastResult !== null || !_previewEnabled) {
        return;
    }

    const hargaJual = getNumber('hargaJual');
    const diskon = getNumber('diskon');
    const voucher = getNumber('voucher');
    const hargaNett = hargaJual - diskon - voucher;
    
    DOM.hargaNett.innerText = formatRupiah(hargaNett);
    
    if (hargaNett > 0) {
        const tipeToko = DOM.tipeTokoSelect.value;
        const selectedOption = DOM.subKategoriSelect.options[DOM.subKategoriSelect.selectedIndex];
        let biayaAdmin = 0;
        if (selectedOption && selectedOption.value) {
            const persen = parseFloat(selectedOption.getAttribute(
                tipeToko === 'mall' ? 'data-admin-mall' : 'data-admin-nonmall'
            )) || 0;
            biayaAdmin = (persen / 100) * hargaNett;
        }
        
        let biayaPembayaran = 0;
        if (tipeToko === 'mall') {
            const data = dataBiayaPembayaran.find(item => item.tipeToko === 'mall');
            if (data) {
                biayaPembayaran = Math.min(hargaNett * data.rate, data.maxPerQty);
            }
        }
        
        let gratisOngkir = 0;
        if (selectedOption && selectedOption.value) {
            const found = dataXTRACategory.find(item => item.subKategori === selectedOption.value);
            if (found) {
                const ukuran = document.getElementById('ukuranBarang').value;
                const cfg = ukuran === 'biasa' ? found.regular : found.special;
                if (cfg && cfg.rate) {
                    gratisOngkir = Math.min(hargaNett * cfg.rate, cfg.maxPerQty || Infinity);
                }
            }
        }
        
        const biayaProses = 1250;
        const totalEstimasi = biayaAdmin + biayaPembayaran + biayaProses + gratisOngkir;
        const danaPreview = hargaNett - totalEstimasi;
        DOM.danaDicairkanPreview.innerText = formatRupiah(danaPreview > 0 ? danaPreview : 0);
    } else {
        DOM.danaDicairkanPreview.innerText = 'Rp 0';
    }
}

// ============================================================
// HITUNG BIAYA ADMIN & PEMBAYARAN
// ============================================================
function hitungBiayaAdmin() {
    // CEK: JANGAN HITUNG KALAU SUDAH ADA HASIL RESMI
    if (_lastResult !== null) {
        return _lastResult.biayaAdmin || 0;
    }
    
    const hargaJual = getNumber('hargaJual');
    const hargaNett = hargaJual - getNumber('diskon') - getNumber('voucher');
    const tipeToko = DOM.tipeTokoSelect.value;
    const selectedOption = DOM.subKategoriSelect.options[DOM.subKategoriSelect.selectedIndex];

    if (!selectedOption || !selectedOption.value || hargaNett <= 0) {
        return 0;
    }

    const persen = parseFloat(selectedOption.getAttribute(
        tipeToko === 'mall' ? 'data-admin-mall' : 'data-admin-nonmall'
    )) || 0;

    return (persen / 100) * hargaNett;
}

function hitungBiayaPembayaran() {
    // CEK: JANGAN HITUNG KALAU SUDAH ADA HASIL RESMI
    if (_lastResult !== null) {
        return _lastResult.biayaPembayaran || 0;
    }
    
    const hargaNett = getNumber('hargaJual') - getNumber('diskon') - getNumber('voucher');
    if (hargaNett <= 0) return 0;

    const tipeToko = DOM.tipeTokoSelect.value;
    if (tipeToko !== 'mall') return 0;

    const data = dataBiayaPembayaran.find(item => item.tipeToko === 'mall');
    if (!data) return 0;

    let biaya = hargaNett * data.rate;
    if (data.maxPerQty > 0 && biaya > data.maxPerQty) biaya = data.maxPerQty;
    return biaya;
}

// ============================================================
// HITUNG KOMPONEN XTRA
// ============================================================
function hitungPromoXTRA() {
    if (_lastResult !== null) {
        return _lastResult.biayaPromoXTRA || 0;
    }
    if (DOM.toggles.promoXTRA.value === 'No') return 0;
    const hargaNett = getNumber('hargaJual') - getNumber('diskon') - getNumber('voucher');
    const data = dataPromoXtra.find(item => item.fieldName === 'promoXTRA');
    if (!data) return 0;
    return Math.min(hargaNett * data.rate, data.maxBiaya);
}

function hitungPromoXTRAplus() {
    if (_lastResult !== null) {
        return _lastResult.biayaPromoXTRAplus || 0;
    }
    if (DOM.toggles.promoXTRAplus.value === 'No') return 0;
    const hargaNett = getNumber('hargaJual') - getNumber('diskon') - getNumber('voucher');
    const data = dataPromoXtra.find(item => item.fieldName === 'promoXTRAplus');
    if (!data) return 0;
    return Math.min(hargaNett * data.rate, data.maxBiaya);
}

function hitungLiveXTRA() {
    if (_lastResult !== null) {
        return _lastResult.biayaLiveXTRA || 0;
    }
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
    if (_lastResult !== null) {
        return _lastResult.biayaSPayLater || 0;
    }
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
    if (_lastResult !== null) {
        return _lastResult.biayaPO || 0;
    }
    const pilihan = DOM.toggles.produkPO.value;
    const productName = DOM.searchProduk.value.trim();
    if (pilihan === 'No' || isFreePO(productName)) return 0;
    if (pilihan === 'Yes3') return 0.03 * hargaNett;
    return 0;
}

function hitungGratisOngkirDariJSON() {
    // CEK: JANGAN HITUNG KALAU SUDAH ADA HASIL RESMI
    if (_lastResult !== null) {
        return { biasa: _lastResult.gratisOngkir || 0, khusus: _lastResult.gratisOngkir || 0 };
    }
    
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
// HITUNG KE BACKEND
// ============================================================
async function hitungKeBackend() {
    const token = getToken();
    if (!token) {
        alert('Anda harus login terlebih dahulu!');
        window.location.href = '../login.html';
        return;
    }

    const data = {
        hargaJual: parseFloat(document.getElementById('hargaJual').value) || 0,
        diskon: parseFloat(document.getElementById('diskon').value) || 0,
        voucher: parseFloat(document.getElementById('voucher').value) || 0,
        tipeToko: document.getElementById('tipeToko').value,
        subKategori: document.getElementById('subKategori').value || document.getElementById('subKategoriSelect').value,
        ukuranBarang: document.getElementById('ukuranBarang').value,
        basketSize: parseInt(document.getElementById('basketSize').value) || 1,
        promoXTRA: document.getElementById('promoXTRA').value,
        promoXTRAplus: document.getElementById('promoXTRAplus').value,
        liveXTRA: document.getElementById('liveXTRA').value,
        spayLater: document.getElementById('spayLater').value,
        hematKirim: document.getElementById('hematKirim').value,
        asuransi: document.getElementById('asuransi').value,
        produkPO: document.getElementById('produkPO').value,
        biayaLainPersen: parseFloat(document.getElementById('biayaLainPersen').value) || 0,
        biayaLainRp: parseFloat(document.getElementById('biayaLainRp').value) || 0,
        productName: document.getElementById('productName').value || ''
    };

    if (!data.subKategori) {
        alert('Silakan pilih sub kategori terlebih dahulu!');
        return;
    }

    _isCalculating = true;
    _lastResult = null;
    // Preview akan dinonaktifkan saat hasil muncul

    const btn = document.getElementById('btnHitung');
    const status = document.getElementById('statusHitung');
    btn.disabled = true;
    btn.textContent = '⏳ Menghitung...';
    status.textContent = 'Mengirim data ke server...';
    status.style.color = '#667eea';

    try {
        const response = await fetch(window.APP_ROOT + '/api/calculate/shopee', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (response.status === 401) {
            alert('Sesi Anda habis. Silakan login kembali.');
            logoutUser();
            return;
        }

        if (!response.ok) {
            let errorMsg = 'Terjadi kesalahan';
            if (result.error) errorMsg = result.error;
            else if (result.errors) {
                const firstKey = Object.keys(result.errors)[0];
                errorMsg = result.errors[firstKey];
                if (Array.isArray(errorMsg)) errorMsg = errorMsg[0];
            }

            // Belum subscription aktif → langsung arahkan ke halaman subscription
            if (result.code === 'no_subscription') {
                alert(errorMsg);
                window.location.href = '../subscription.html';
                return;
            }

            throw new Error(errorMsg);
        }

        if (result.success) {
            _lastResult = result.data;
            tampilkanHasilResmi(result.data, result.tokens_remaining);
            status.textContent = '✅ Perhitungan berhasil! Token terpakai 1.';
            status.style.color = '#10b981';
        } else {
            throw new Error(result.error || 'Perhitungan gagal');
        }

    } catch (error) {
        console.error('Error:', error);
        status.textContent = '❌ ' + error.message;
        status.style.color = '#ef4444';
        _lastResult = null;
        _previewEnabled = true;
    } finally {
        btn.disabled = false;
        btn.textContent = '🚀 Hitung';
        _isCalculating = false;
    }
}

// ============================================================
// TAMPILKAN HASIL RESMI
// ============================================================
function tampilkanHasilResmi(data, tokensRemaining) {
    // NONAKTIFKAN PREVIEW
    _previewEnabled = false;
    _lastResult = data;

    // Update token
    const userData = getUser();
    if (userData) {
        userData.remaining_tokens = tokensRemaining;
        localStorage.setItem('user', JSON.stringify(userData));
        document.getElementById('tokenDisplay').textContent = '🪙 ' + tokensRemaining + ' token';
    }

    // Hapus class empty, tambah has-result dan result-final
    document.querySelectorAll('.result-box').forEach(el => {
        el.classList.remove('empty');
        el.classList.add('has-result', 'result-final');
    });

    // Update semua nilai
    const persenAdmin = data.hargaNett > 0 ? (data.biayaAdmin / data.hargaNett * 100) : 0;
    document.getElementById('biayaAdminText').innerHTML = 
        `${persenAdmin.toFixed(1)}% → Rp ${data.biayaAdmin.toLocaleString('id-ID')}`;

    const persenBayar = data.hargaNett > 0 ? (data.biayaPembayaran / data.hargaNett * 100) : 0;
    document.getElementById('biayaPembayaranText').innerHTML = 
        `${persenBayar.toFixed(1)}% → Rp ${data.biayaPembayaran.toLocaleString('id-ID')}`;

    document.getElementById('hargaNett').innerHTML = `Rp ${data.hargaNett.toLocaleString('id-ID')}`;
    document.getElementById('gratisOngkirXtraText').innerHTML = `Rp ${data.gratisOngkir.toLocaleString('id-ID')}`;
    document.getElementById('totalBiayaShopee').innerHTML = `Rp ${data.totalBiayaShopee.toLocaleString('id-ID')}`;

    const danaDicairkan = data.hargaNett - data.totalBiayaShopee;
    document.getElementById('danaDicairkan').innerHTML = `Rp ${danaDicairkan.toLocaleString('id-ID')}`;
    document.getElementById('danaDicairkanPreview').innerHTML = `Rp ${danaDicairkan.toLocaleString('id-ID')}`;

    // Box tambahan
    tampilkanBox('promoXTRABox', 'biayaPromoXTRAText', data.biayaPromoXTRA);
    tampilkanBox('promoXTRAplusBox', 'biayaPromoXTRAplusText', data.biayaPromoXTRAplus);
    tampilkanBox('liveXTRABox', 'biayaLiveXTRAText', data.biayaLiveXTRA);
    tampilkanBox('spayLaterBox', 'biayaSPayLaterText', data.biayaSPayLater);
    tampilkanBox('hematKirimBox', 'biayaHematKirimText', data.biayaHematKirim);
    tampilkanBox('asuransiBox', 'biayaAsuransiText', data.biayaAsuransi);
    tampilkanBox('produkPOBox', 'biayaPOText', data.biayaPO);
    tampilkanBox('biayaLainPersenBox', 'biayaLainPersenText', data.biayaLainPersen);
    tampilkanBox('biayaLainRpBox', 'biayaLainRpText', data.biayaLainRp);

    // Hitung profit
    hitungProfit(danaDicairkan);
}

function tampilkanBox(boxId, textId, value) {
    const box = document.getElementById(boxId);
    const text = document.getElementById(textId);
    if (!box || !text) return;
    if (value > 0) {
        box.style.display = 'flex';
        box.classList.add('has-result', 'result-final');
        text.innerHTML = `Rp ${value.toLocaleString('id-ID')}`;
    } else {
        box.style.display = 'none';
    }
}

function hitungProfit(danaDicairkan) {
    const hargaJual = getNumber('hargaJual');
    const hpp = getNumber('hpp');
    const biayaPenanganan = getNumber('biayaPenanganan');
    const roas = getNumber('roas');
    const komisiAfiliasi = getNumber('komisiAfiliasi');
    const promosiLuar = getNumber('promosiLuar');
    const biayaPacking = getNumber('biayaPacking');
    const biayaOperasional = getNumber('biayaOperasional');
    const biayaLain = getNumber('biayaLain');
    const pajakRate = getNumber('pajakRate') / 100;
    const ppn = document.getElementById('ppn').value === 'Yes';

    const totalCOGS = hpp + biayaPenanganan;
    const profitKotor = danaDicairkan - totalCOGS;

    const biayaIklan = roas > 0 ? (1 / roas) * hargaJual : 0;
    const biayaKomisiAfiliasi = (komisiAfiliasi / 100) * hargaJual;
    const totalPengeluaran = biayaIklan + biayaKomisiAfiliasi + promosiLuar + biayaPacking + biayaOperasional + biayaLain;
    const profitSebelumPajak = profitKotor - totalPengeluaran;

    const pajak = pajakRate * hargaJual;
    const biayaPPN = ppn ? 0.11 * hargaJual : 0;
    const profitBersih = profitSebelumPajak - pajak - biayaPPN;

    document.getElementById('totalCOGS').innerHTML = `Rp ${totalCOGS.toLocaleString('id-ID')}`;
    document.getElementById('profitKotor').innerHTML = `Rp ${profitKotor.toLocaleString('id-ID')}`;
    document.getElementById('totalBiaya').innerHTML = `Rp ${totalPengeluaran.toLocaleString('id-ID')}`;
    document.getElementById('profitSebelumPajak').innerHTML = `Rp ${profitSebelumPajak.toLocaleString('id-ID')}`;
    document.getElementById('pajak').innerHTML = `Rp ${pajak.toLocaleString('id-ID')}`;

    const profitEl = document.getElementById('profitBersih');
    const profitBox = document.getElementById('profitBersihBox');
    profitEl.innerHTML = `Rp ${profitBersih.toLocaleString('id-ID')}`;

    if (profitBersih >= 0) {
        profitEl.className = 'result-value profit-positive';
        profitBox.style.background = '#d1fae5';
    } else {
        profitEl.className = 'result-value profit-negative';
        profitBox.style.background = '#fee2e2';
    }

    // PPN
    if (ppn) {
        const ppnBox = document.getElementById('ppnBox');
        ppnBox.style.display = 'flex';
        ppnBox.classList.add('has-result', 'result-final');
        document.getElementById('ppnText').innerHTML = `Rp ${biayaPPN.toLocaleString('id-ID')}`;
    } else {
        document.getElementById('ppnBox').style.display = 'none';
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
        hitungPreview();
    });

    DOM.tipeTokoSelect.addEventListener('change', hitungPreview);

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
        hitungPreview();
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

    // Input yang trigger preview
    const previewInputs = ['hargaJual', 'diskon', 'voucher', 'basketSize', 'ukuranBarang'];
    previewInputs.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('input', hitungPreview);
            el.addEventListener('change', hitungPreview);
        }
    });

    // Toggle yang trigger preview
    const toggleIds = ['promoXTRA', 'promoXTRAplus', 'liveXTRA', 'spayLater', 'hematKirim', 'asuransi', 'produkPO', 'ppn'];
    toggleIds.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('change', hitungPreview);
    });

    // Field lain untuk preview
    const otherFields = ['biayaLainPersen', 'biayaLainRp', 'tipeToko', 'kategori'];
    otherFields.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('change', hitungPreview);
            if (el.type === 'number') el.addEventListener('input', hitungPreview);
        }
    });
}

// ============================================================
// INIT
// ============================================================
function initApp() {
    cacheDomElements();
    resetForm();
    attachEventListeners();
    hitungPreview();

    // Cegah form submit reload
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
        });
    });

    console.log('🚀 Aplikasi siap digunakan!');
}

document.addEventListener('DOMContentLoaded', loadAllData);
