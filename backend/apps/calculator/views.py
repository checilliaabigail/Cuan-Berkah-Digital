import json
from pathlib import Path
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from apps.tokens.models import TokenUsage
<<<<<<< HEAD
from apps.subscriptions.models import Subscription
=======
>>>>>>> 8a1f99fda05f1a3fa1a79c3d9890801cfcbc40e2

# ============================================================
# LOAD DATA JSON
# ============================================================
DATA_PATH = Path(__file__).resolve().parent.parent / 'data'

def load_json(filename):
    with open(DATA_PATH / filename, 'r', encoding='utf-8') as f:
        return json.load(f)

# Load semua data saat startup
ADMIN_MALL        = load_json('admin_mall.json')
ADMIN_NON_MALL    = load_json('admin_non-mall.json')
XTRA_CATEGORY     = load_json('xtraCategory.json')
PROMO_XTRA        = load_json('promo_xtra.json')
LIVE_XTRA         = load_json('live_xtra.json')
SPAYLATER_XTRA    = load_json('spaylater_xtra.json')
FREE_PO           = load_json('free_po.json')
BIAYA_PEMBAYARAN  = load_json('biaya_pembayaran.json')


# ============================================================
# VIEW UTAMA
# ============================================================
class CalculateShopeeView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        data = request.data

<<<<<<< HEAD
        # Cek subscription aktif (sesuai flow: user harus subs. aktif dulu sebelum bisa hitung)
        active_sub = (
            Subscription.objects.filter(user=user, status='active')
            .order_by('-end_date')
            .first()
        )
        if not active_sub or not active_sub.is_active():
            return Response({
                'success': False,
                'error': 'Anda belum memiliki subscription aktif. Silakan berlangganan terlebih dahulu.',
                'code': 'no_subscription'
            }, status=status.HTTP_403_FORBIDDEN)

=======
>>>>>>> 8a1f99fda05f1a3fa1a79c3d9890801cfcbc40e2
        # Cek token
        if user.remaining_tokens <= 0:
            return Response({
                'success': False,
                'error': 'Token habis. Silakan beli add-on token.'
            }, status=status.HTTP_400_BAD_REQUEST)

        # ============================================================
        # AMBIL INPUT — sama persis dengan field di frontend
        # ============================================================
        harga_jual       = float(data.get('hargaJual', 0))
        diskon           = float(data.get('diskon', 0))
        voucher          = float(data.get('voucher', 0))
        tipe_toko        = data.get('tipeToko', 'nonStar')
        sub_kategori     = data.get('subKategori', '')
        kategori_utama   = data.get('kategoriUtama', '')   # ← tambahan untuk filter XTRA
        ukuran_barang    = data.get('ukuranBarang', 'biasa')
        basket_size      = float(data.get('basketSize', 0))
        promo_xtra       = data.get('promoXTRA', 'No')
        promo_xtra_plus  = data.get('promoXTRAplus', 'No')
        live_xtra        = data.get('liveXTRA', 'No')
        spay_later       = data.get('spayLater', 'No')
        hemat_kirim      = data.get('hematKirim', 'No')
        asuransi         = data.get('asuransi', 'No')
        produk_po        = data.get('produkPO', 'No')
        biaya_lain_persen = float(data.get('biayaLainPersen', 0))
        biaya_lain_rp    = float(data.get('biayaLainRp', 0))
        product_name     = data.get('productName', '')

        # ============================================================
        # 1. Harga Nett
        # JS: const hargaNett = hargaJual - diskon - voucher;
        # ============================================================
        harga_nett = harga_jual - diskon - voucher

        # ============================================================
        # 2. Biaya Administrasi
        # JS: hitungBiayaAdmin()
        # ============================================================
        biaya_admin = self.hitung_biaya_admin(harga_nett, tipe_toko, sub_kategori)

        # ============================================================
        # 3. Biaya Pembayaran
        # JS: hitungBiayaPembayaran()
        # ============================================================
        biaya_pembayaran = self.hitung_biaya_pembayaran(harga_nett, tipe_toko)

        # ============================================================
        # 4. Biaya Proses Pesanan
        # JS: const biayaProses = basketSize > 0 ? Math.round(1250 / basketSize) : 0;
        # ============================================================
        biaya_proses = round(1250 / basket_size) if basket_size > 0 else 0

        # ============================================================
        # 5. Gratis Ongkir XTRA
        # JS: hitungGratisOngkirDariJSON() → pilih biasa/khusus
        # ============================================================
        ongkir = self.hitung_gratis_ongkir(harga_nett, sub_kategori, kategori_utama, product_name)
        gratis_ongkir = ongkir['biasa'] if ukuran_barang == 'biasa' else ongkir['khusus']

        # ============================================================
        # 6. Promo XTRA
        # JS: hitungPromoXTRA()
        # ============================================================
        biaya_promo_xtra = self.hitung_promo_xtra(harga_nett, promo_xtra)

        # ============================================================
        # 7. Promo XTRA+
        # JS: hitungPromoXTRAplus()
        # ============================================================
        biaya_promo_xtra_plus = self.hitung_promo_xtra_plus(harga_nett, promo_xtra_plus)

        # ============================================================
        # 8. Live XTRA
        # JS: hitungLiveXTRA()
        # ============================================================
        biaya_live_xtra = self.hitung_live_xtra(harga_nett, live_xtra)

        # ============================================================
        # 9. SPayLater XTRA
        # JS: hitungSPayLater()
        # ============================================================
        biaya_spay_later = self.hitung_spay_later(harga_nett, spay_later)

        # ============================================================
        # 10. Hemat Biaya Kirim
        # JS: const biayaHematKirim = hematKirim === 'Yes' ? 350 : 0;
        # ============================================================
        biaya_hemat_kirim = 350 if hemat_kirim == 'Yes' else 0

        # ============================================================
        # 11. Asuransi Pengiriman
        # JS: const biayaAsuransi = asuransi === 'Yes' ? 0.005 * hargaNett : 0;
        # ============================================================
        biaya_asuransi = 0.005 * harga_nett if asuransi == 'Yes' else 0

        # ============================================================
        # 12. Produk PO
        # JS: hitungProdukPO(hargaNett)
        # ============================================================
        biaya_po = self.hitung_produk_po(harga_nett, produk_po, product_name)

        # ============================================================
        # 13. Biaya Lain-Lain (%)
        # JS: biayaLainPersenRp = biayaLainPersen > 0 ? (biayaLainPersen/100)*hargaNett : 0
        # ============================================================
        biaya_lain_persen_rp = (biaya_lain_persen / 100) * harga_nett if biaya_lain_persen > 0 else 0

        # ============================================================
        # 14. Total Biaya Shopee
        # JS: totalBiayaShopee = biayaAdmin + biayaPembayaran + biayaProses +
        #     gratisOngkir + biayaPromoXTRA + biayaPromoXTRAplus + biayaLiveXTRA +
        #     biayaSPayLater + biayaHematKirim + biayaAsuransi + biayaPO +
        #     biayaLainPersenRp + biayaLainRp;
        # ============================================================
        total_biaya = (
            biaya_admin + biaya_pembayaran + biaya_proses +
            gratis_ongkir +
            biaya_promo_xtra + biaya_promo_xtra_plus + biaya_live_xtra + biaya_spay_later +
            biaya_hemat_kirim + biaya_asuransi + biaya_po +
            biaya_lain_persen_rp + biaya_lain_rp
        )

        # Kurangi token
        user.remaining_tokens -= 1
        user.used_tokens += 1
        user.save()
        TokenUsage.objects.create(user=user, action='calculate_shopee', tokens_used=1)

        return Response({
            'success': True,
            'tokens_remaining': user.remaining_tokens,
            'data': {
                'hargaNett':          round(harga_nett, 2),
                'biayaAdmin':         round(biaya_admin, 2),
                'biayaPembayaran':    round(biaya_pembayaran, 2),
                'biayaProses':        round(biaya_proses, 2),
                'gratisOngkir':       round(gratis_ongkir, 2),
                'biayaPromoXTRA':     round(biaya_promo_xtra, 2),
                'biayaPromoXTRAplus': round(biaya_promo_xtra_plus, 2),
                'biayaLiveXTRA':      round(biaya_live_xtra, 2),
                'biayaSPayLater':     round(biaya_spay_later, 2),
                'biayaHematKirim':    round(biaya_hemat_kirim, 2),
                'biayaAsuransi':      round(biaya_asuransi, 2),
                'biayaPO':            round(biaya_po, 2),
                'biayaLainPersen':    round(biaya_lain_persen_rp, 2),
                'biayaLainRp':        round(biaya_lain_rp, 2),
                'totalBiayaShopee':   round(total_biaya, 2),
            }
        })

    # ============================================================
    # HELPER: BIAYA ADMIN
    # JS: hitungBiayaAdmin()
    #   → ambil adminFee dari admin_mall.json atau admin_non-mall.json
    #   → berdasarkan subKategori yang dipilih
    # ============================================================
    def hitung_biaya_admin(self, harga_nett, tipe_toko, sub_kategori):
        if not sub_kategori or harga_nett <= 0:
            return 0
        data_source = ADMIN_MALL if tipe_toko == 'mall' else ADMIN_NON_MALL
        found = next((item for item in data_source
                      if item.get('subKategori') == sub_kategori), None)
        if not found:
            return 0
        rate = found.get('adminFee', 0)
        return (rate / 100) * harga_nett

    # ============================================================
    # HELPER: BIAYA PEMBAYARAN
    # JS: hitungBiayaPembayaran()
    #   → ambil dari biaya_pembayaran.json berdasarkan tipeToko
    #   → non-mall: rate 0 (gratis)
    #   → mall: rate 1.8%, max Rp50.000
    # ============================================================
    def hitung_biaya_pembayaran(self, harga_nett, tipe_toko):
        if harga_nett <= 0:
            return 0
        tipe_key = 'mall' if tipe_toko == 'mall' else 'nonStar'
        data = next((item for item in BIAYA_PEMBAYARAN
                     if item.get('tipeToko') == tipe_key), None)
        if not data:
            return 0
        rate      = data.get('rate', 0)
        max_biaya = data.get('maxPerQty', 0)
        biaya = harga_nett * rate
        return min(biaya, max_biaya) if max_biaya > 0 else biaya

    # ============================================================
    # HELPER: GRATIS ONGKIR XTRA
    # JS: hitungGratisOngkirDariJSON()
    #   Strategi 1: cari via nama produk di jenisProduk[]
    #   Strategi 2: exact match subKategori + kategoriUtama
    #   Strategi 3: partial match keyword subKategori + kategoriUtama
    #   Strategi 4: fallback ke kategoriUtama saja
    #   Return: { biasa: ..., khusus: ... }
    # ============================================================
    def hitung_gratis_ongkir(self, harga_nett, sub_kategori, kategori_utama, product_name):
        if harga_nett <= 0:
            return {'biasa': 0, 'khusus': 0}

        found = None

        # Strategi 1: nama produk
        if product_name:
            pn_lower = product_name.lower()
            found = next((item for item in XTRA_CATEGORY
                          if any(
                              p.lower() == pn_lower or
                              p.lower() in pn_lower or
                              pn_lower in p.lower()
                              for p in item.get('jenisProduk', [])
                          )), None)

        # Strategi 2: exact match subKategori + kategoriUtama
        if not found and sub_kategori:
            found = next((item for item in XTRA_CATEGORY
                          if item.get('kategoriUtama') == kategori_utama
                          and item.get('subKategori') == sub_kategori), None)

        # Strategi 3: partial match keyword subKategori + kategoriUtama
        if not found and sub_kategori:
            import re
            keywords = [w for w in re.split(r'[()\-,\s]+', sub_kategori.lower())
                        if len(w) > 3]
            for keyword in keywords:
                found = next((item for item in XTRA_CATEGORY
                              if item.get('kategoriUtama') == kategori_utama
                              and keyword in item.get('subKategori', '').lower()), None)
                if found:
                    break

        # Strategi 4: fallback ke kategoriUtama saja
        if not found and kategori_utama:
            found = next((item for item in XTRA_CATEGORY
                          if item.get('kategoriUtama') == kategori_utama), None)

        if not found:
            return {'biasa': 0, 'khusus': 0}

        # Hitung biaya regular (biasa) dan special (khusus)
        # JS: const calc = (cfg) => {
        #       if (!cfg?.rate) return 0;
        #       const biaya = hargaNett * cfg.rate;
        #       return cfg.maxPerQty ? Math.min(biaya, cfg.maxPerQty) : biaya;
        #     };
        def calc(cfg):
            if not cfg or not cfg.get('rate'):
                return 0
            biaya = harga_nett * cfg['rate']
            max_qty = cfg.get('maxPerQty', 0)
            return min(biaya, max_qty) if max_qty else biaya

        return {
            'biasa':  calc(found.get('regular')),
            'khusus': calc(found.get('special')),
        }

    # ============================================================
    # HELPER: PROMO XTRA
    # JS: hitungPromoXTRA()
    #   → rate 4.5%, max Rp60.000 (dari promo_xtra.json)
    # ============================================================
    def hitung_promo_xtra(self, harga_nett, promo_xtra):
        if promo_xtra != 'Yes':
            return 0
        data = next((item for item in PROMO_XTRA
                     if item.get('fieldName') == 'promoXTRA'), None)
        if not data:
            return 0
        return min(harga_nett * data['rate'], data['maxBiaya'])

    # ============================================================
    # HELPER: PROMO XTRA+
    # JS: hitungPromoXTRAplus()
    #   → rate 6.5%, max Rp80.000 (dari promo_xtra.json)
    # ============================================================
    def hitung_promo_xtra_plus(self, harga_nett, promo_xtra_plus):
        if promo_xtra_plus != 'Yes':
            return 0
        data = next((item for item in PROMO_XTRA
                     if item.get('fieldName') == 'promoXTRAplus'), None)
        if not data:
            return 0
        return min(harga_nett * data['rate'], data['maxBiaya'])

    # ============================================================
    # HELPER: LIVE XTRA
    # JS: hitungLiveXTRA()
    #   → Yes: 3%, max Rp20.000
    #   → YesPromo: 2%, max Rp20.000
    #   → (dari live_xtra.json)
    # ============================================================
    def hitung_live_xtra(self, harga_nett, live_xtra):
        if live_xtra == 'No':
            return 0
        data = next((item for item in LIVE_XTRA
                     if item.get('fieldName') == 'liveXTRA'), None)
        if not data:
            return 0
        option = next((opt for opt in data.get('options', [])
                       if opt.get('value') == live_xtra), None)
        if not option:
            return 0
        return min(harga_nett * option['rate'], option['maxBiaya'])

    # ============================================================
    # HELPER: SPAYLATER XTRA
    # JS: hitungSPayLater()
    #   → Tenor3: 2.5% (dari spaylater_xtra.json)
    #   → Tenor6: 4.0%
    #   → tidak ada batas maksimal
    # ============================================================
    def hitung_spay_later(self, harga_nett, spay_later):
        if spay_later == 'No':
            return 0
        data = next((item for item in SPAYLATER_XTRA
                     if item.get('fieldName') == 'spayLater'), None)
        if not data:
            return 0
        option = next((opt for opt in data.get('options', [])
                       if opt.get('value') == spay_later), None)
        if not option:
            return 0
        return harga_nett * option['rate']   # tidak ada maxBiaya

    # ============================================================
    # HELPER: PRODUK PO
    # JS: hitungProdukPO(hargaNett)
    #   → Yes3: 3% kecuali produk masuk free_po.json
    #   → cek isFreePO: exact match atau contains
    # ============================================================
    def hitung_produk_po(self, harga_nett, produk_po, product_name):
        if produk_po != 'Yes3':
            return 0
        # Cek free PO
        # JS: item.jenisProduk.toLowerCase() === productName.toLowerCase()
        #  || item.jenisProduk.toLowerCase().includes(productName.toLowerCase())
        if product_name:
            pn_lower = product_name.lower()
            is_free = any(
                item.get('jenisProduk', '').lower() == pn_lower or
                pn_lower in item.get('jenisProduk', '').lower()
                for item in FREE_PO
            )
            if is_free:
                return 0
        return 0.03 * harga_nett