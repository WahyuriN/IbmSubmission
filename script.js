/**
 * ================================================================
 * Urban Air Quality & Mobility Dashboard — script.js
 * Vanilla JavaScript murni, tanpa library eksternal.
 *
 * Fitur yang diimplementasikan:
 * 1. Toggle sidebar mobile (open / close drawer)
 * 2. Tutup sidebar saat overlay diklik
 * 3. Tutup sidebar saat link nav diklik (mobile UX)
 * 4. Switching panel konten tanpa reload halaman
 * 5. Update state aktif nav item secara dinamis
 * 6. Update judul & subtitle halaman di top nav saat panel berpindah
 * 7. Efek bayangan navbar saat halaman di-scroll
 * 8. Tombol refresh: animasi spin ikon + update timestamp
 * 9. Tombol notifikasi: toggle panel dropdown + tandai sudah dibaca
 * ================================================================
 */

'use strict';

/* ================================================================
   KONSTANTA & REFERENSI DOM
   Semua elemen DOM dikumpulkan di satu tempat agar mudah dilacak.
================================================================ */

/** Sidebar panel (aside) */
const sidebar = document.getElementById('sidebar');

/** Overlay latar gelap (mobile) */
const sidebarOverlay = document.getElementById('sidebar-overlay');

/** Tombol hamburger di top nav (mobile) */
const sidebarToggleBtn = document.getElementById('sidebar-toggle');

/** Ikon hamburger (tiga garis) */
const topnavIconOpen = document.getElementById('topnav-icon-open');

/** Ikon close (silang) */
const topnavIconClose = document.getElementById('topnav-icon-close');

/** Judul halaman di top nav (diperbarui saat panel berubah) */
const pageTitle = document.getElementById('page-title');

/** Subtitle di bawah judul (diperbarui saat panel berubah) */
const pageSubtitle = document.getElementById('page-subtitle');

/** Semua tombol navigasi (sidebar + avatar di topnav) */
const allNavItems = document.querySelectorAll('.nav-item[data-panel]');

/** Semua section konten panel */
const allPanels = document.querySelectorAll('.content-panel');

/**
 * Peta nama panel → { title, subtitle } yang ditampilkan di topnav.
 * @type {Object<string, {title: string, subtitle: string}>}
 */
const PANEL_META = {
  'ringkasan':      { title: 'Ringkasan',       subtitle: 'Urban Air Quality & Mobility · Jakarta' },
  'kualitas-udara': { title: 'Kualitas Udara',   subtitle: 'Pemantauan real-time 142 sensor · Jakarta Raya' },
  'mobilitas':      { title: 'Mobilitas Kota',   subtitle: 'Data lalu lintas & armada kendaraan listrik' },
  'pengaturan':     { title: 'Pengaturan',        subtitle: 'Konfigurasi sistem & profil operator' },
};

/**
 * @deprecated Dipertahankan agar tidak ada referensi lama yang rusak.
 * Gunakan PANEL_META sebagai gantinya.
 */
const PANEL_TITLES = Object.fromEntries(
  Object.entries(PANEL_META).map(([k, v]) => [k, v.title])
);


/* ================================================================
   1. SIDEBAR MOBILE — Toggle (open / close)
================================================================ */

/**
 * Membuka sidebar mobile.
 * Menambahkan class animasi pada sidebar dan menampilkan overlay.
 */
function openSidebar() {
  sidebar.classList.add('is-open');
  sidebarOverlay.classList.remove('hidden');

  // Delay 1 frame agar transisi opacity overlay berjalan
  requestAnimationFrame(() => {
    sidebarOverlay.classList.add('is-visible');
  });

  // Tukar ikon hamburger → close, update ARIA
  topnavIconOpen.classList.add('hidden');
  topnavIconClose.classList.remove('hidden');
  sidebarToggleBtn.setAttribute('aria-expanded', 'true');
  sidebarToggleBtn.setAttribute('aria-label', 'Tutup navigasi');
}

/**
 * Menutup sidebar mobile.
 * Menghapus class animasi dan menyembunyikan overlay.
 */
function closeSidebar() {
  sidebar.classList.remove('is-open');
  sidebarOverlay.classList.remove('is-visible');

  // Sembunyikan overlay setelah transisi opacity selesai (300ms)
  setTimeout(() => {
    sidebarOverlay.classList.add('hidden');
  }, 300);

  // Kembalikan ikon close → hamburger, update ARIA
  topnavIconOpen.classList.remove('hidden');
  topnavIconClose.classList.add('hidden');
  sidebarToggleBtn.setAttribute('aria-expanded', 'false');
  sidebarToggleBtn.setAttribute('aria-label', 'Buka navigasi');
}

/**
 * Toggle sidebar berdasarkan state saat ini.
 */
function toggleSidebar() {
  const isOpen = sidebarToggleBtn.getAttribute('aria-expanded') === 'true';
  if (isOpen) {
    closeSidebar();
  } else {
    openSidebar();
  }
}

// Pasang event listener pada tombol hamburger
sidebarToggleBtn.addEventListener('click', toggleSidebar);

// Tutup sidebar saat overlay diklik
sidebarOverlay.addEventListener('click', closeSidebar);


/* ================================================================
   2. PANEL SWITCHING — Ganti konten tanpa reload halaman
================================================================ */

/**
 * Menampilkan panel yang sesuai dan menyembunyikan yang lain.
 * Juga memperbarui state aktif nav item dan judul halaman.
 *
 * @param {string} targetPanelId - Nilai dari data-panel pada nav item
 */
function switchPanel(targetPanelId) {
  // --- Sembunyikan semua panel ---
  allPanels.forEach((panel) => {
    panel.classList.add('hidden');
  });

  // --- Tampilkan panel yang dituju ---
  const targetPanel = document.getElementById(`panel-${targetPanelId}`);
  if (targetPanel) {
    targetPanel.classList.remove('hidden');
  }

  // --- Update state aktif semua nav item ---
  allNavItems.forEach((item) => {
    if (item.dataset.panel === targetPanelId) {
      item.classList.add('is-active');
      item.setAttribute('aria-current', 'page');
    } else {
      item.classList.remove('is-active');
      item.removeAttribute('aria-current');
    }
  });

  // --- Update judul & subtitle di top nav ---
  const meta = PANEL_META[targetPanelId];
  if (meta) {
    pageTitle.textContent = meta.title;
    if (pageSubtitle) pageSubtitle.textContent = meta.subtitle;
  }

  // --- Tutup panel notifikasi jika sedang terbuka ---
  closeNotifPanel();

  // --- Scroll ke atas konten setelah pindah panel ---
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/**
 * Handler klik untuk setiap nav item.
 * Membaca data-panel dari tombol yang diklik dan beralih panel.
 *
 * @param {MouseEvent} event
 */
function handleNavItemClick(event) {
  const clickedItem = event.currentTarget;
  const targetPanelId = clickedItem.dataset.panel;

  if (!targetPanelId) return;    // Abaikan jika tidak ada data-panel

  switchPanel(targetPanelId);

  // Tutup sidebar mobile setelah memilih menu
  closeSidebar();
}

// Pasang event listener pada semua nav item yang memiliki data-panel
allNavItems.forEach((item) => {
  item.addEventListener('click', handleNavItemClick);
});


/* ================================================================
   3. NAVBAR SCROLL EFFECT
   Tambahkan shadow lebih kuat pada topnav saat halaman di-scroll.
================================================================ */
const topnav = document.getElementById('topnav');

/**
 * Memperbarui shadow topnav berdasarkan posisi scroll saat ini.
 */
function updateTopnavShadow() {
  if (window.scrollY > 8) {
    topnav.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.1)';
  } else {
    topnav.style.boxShadow = '';
  }
}

// passive: true untuk performa scroll optimal
window.addEventListener('scroll', updateTopnavShadow, { passive: true });


/* ================================================================
   4. INISIALISASI
   Pastikan state awal dashboard sudah benar saat halaman dimuat:
   panel Ringkasan aktif, nav item Ringkasan berstatus aktif.
================================================================ */
(function init() {
  // Panel awal: ringkasan
  switchPanel('ringkasan');

  // Pastikan shadow topnav sesuai posisi scroll awal
  updateTopnavShadow();

  // Inisialisasi tab filter kategori (panel Ringkasan)
  initCategoryFilter();

  // Inisialisasi tabel stasiun (panel Kualitas Udara)
  initStationTable();
})();


/* ================================================================
   5. CATEGORY FILTER TABS — Tab Semua / Aktif / Perlu Perhatian
   Menghitung jumlah item dari DOM panel Ringkasan secara dinamis,
   menampilkan angka di dalam tab, dan menyaring konten yang tampil
   sesuai tab yang dipilih — tanpa reload halaman.

   Definisi filter:
     semua     → tampilkan semua blok (KPI grid + alert panel + target panel)
     aktif     → tampilkan KPI grid + target panel; sembunyikan alert panel
     perhatian → tampilkan alert panel + target panel; sembunyikan KPI grid

   Count per tab:
     semua     = KPI (4) + alert rows (3) + target items (4) = 11
     aktif     = KPI (4) + target items yang BUKAN merah (3)  = 7
     perhatian = alert rows (3) + target items merah (1)      = 4
================================================================ */

/**
 * Menghitung jumlah item per kategori langsung dari DOM.
 *
 * @returns {{ semua: number, aktif: number, perhatian: number }}
 */
function countCategoryItems() {
  // KPI cards — dihitung dari #kpi-grid (id spesifik, tidak ambigu)
  const kpiGrid  = document.getElementById('kpi-grid');
  const kpiCount = kpiGrid ? kpiGrid.querySelectorAll(':scope > .dash-card').length : 4;

  // Alert rows — setiap .alert-row di #alert-panel adalah satu peringatan
  const alertCount = document.querySelectorAll('#alert-panel .alert-row').length;

  // Target items — setiap <li> langsung di dalam #target-panel .space-y-4
  const targetItems = document.querySelectorAll('#target-panel .space-y-4 > li');
  const targetCount = targetItems.length;

  // Target "at-risk": item yang persentasenya ditandai merah (.text-red-600)
  let targetAtRiskCount = 0;
  targetItems.forEach((li) => {
    if (li.querySelector('.text-red-600')) targetAtRiskCount += 1;
  });

  // "Aktif" = KPI + target yang TIDAK at-risk (sedang berjalan normal)
  const targetOnTrackCount = targetCount - targetAtRiskCount;

  return {
    semua:     kpiCount + alertCount + targetCount,
    aktif:     kpiCount + targetOnTrackCount,
    perhatian: alertCount + targetAtRiskCount,
  };
}

/**
 * Menulis angka count ke elemen badge di dalam setiap tab.
 */
function updateTabCounts() {
  const counts = countCategoryItems();
  const elSemua     = document.getElementById('count-semua');
  const elAktif     = document.getElementById('count-aktif');
  const elPerhatian = document.getElementById('count-perhatian');

  if (elSemua)     elSemua.textContent     = counts.semua;
  if (elAktif)     elAktif.textContent     = counts.aktif;
  if (elPerhatian) elPerhatian.textContent = counts.perhatian;
}

/**
 * Menyaring konten panel Ringkasan berdasarkan tab yang dipilih.
 * Visibilitas dikontrol lewat class `filter-hidden` (tambah/hapus).
 *
 * Aturan visibilitas per filter:
 *   semua     → semua blok tampil
 *   aktif     → KPI grid + target panel tampil; alert panel tersembunyi
 *   perhatian → alert panel + target panel tampil; KPI grid tersembunyi
 *
 * @param {string} filter — 'semua' | 'aktif' | 'perhatian'
 */
function applyRingkasanFilter(filter) {
  const kpiGrid     = document.getElementById('kpi-grid');
  const alertPanel  = document.getElementById('alert-panel');
  const targetPanel = document.getElementById('target-panel');

  if (!kpiGrid || !alertPanel || !targetPanel) return;

  // Visibilitas berdasarkan nilai filter
  const show = {
    kpi:    filter === 'semua' || filter === 'aktif',
    alert:  filter === 'semua' || filter === 'perhatian',
    target: true,   // Target panel selalu tampil (relevan di semua filter)
  };

  kpiGrid.classList.toggle('filter-hidden', !show.kpi);
  alertPanel.classList.toggle('filter-hidden', !show.alert);
  targetPanel.classList.toggle('filter-hidden', !show.target);

  // Saat tab "Perlu Perhatian", sorot item at-risk di target panel
  const targetItems = document.querySelectorAll('#target-panel .space-y-4 > li');
  targetItems.forEach((li) => {
    const isAtRisk = !!li.querySelector('.text-red-600');
    if (filter === 'perhatian') {
      // Redup item yang tidak at-risk
      li.classList.toggle('filter-dimmed', !isAtRisk);
    } else {
      li.classList.remove('filter-dimmed');
    }
  });
}

/**
 * Mengatur tab aktif (kelas + aria) dan menerapkan filter konten.
 *
 * @param {HTMLButtonElement} clickedTab
 */
function setActiveFilterTab(clickedTab) {
  document.querySelectorAll('.filter-tab').forEach((tab) => {
    const isActive = tab === clickedTab;
    tab.classList.toggle('filter-tab--active', isActive);
    tab.setAttribute('aria-selected', isActive ? 'true' : 'false');
  });

  applyRingkasanFilter(clickedTab.dataset.filter);
}

/**
 * Inisialisasi tab filter kategori panel Ringkasan.
 * Dipanggil sekali dari init().
 */
function initCategoryFilter() {
  // Hitung dan tampilkan angka count di tiap tab
  updateTabCounts();

  // Render kondisi awal (tab "Semua" aktif → semua blok tampil)
  applyRingkasanFilter('semua');

  // Pasang event listener pada tiap tombol tab
  document.querySelectorAll('.filter-tab').forEach((tab) => {
    tab.addEventListener('click', () => setActiveFilterTab(tab));
  });
}


/* ================================================================
   6. TOMBOL REFRESH — Animasi spin ikon + update timestamp panel
   Klik tombol refresh: ikon berputar 360° selama 600ms, kemudian
   timestamp di header panel Ringkasan diperbarui ke waktu sekarang.
================================================================ */

/** Referensi elemen tombol dan ikon refresh */
const btnRefresh  = document.getElementById('btn-refresh');
const iconRefresh = document.getElementById('icon-refresh');

/**
 * Memformat objek Date menjadi string "DD MMM YYYY, HH:MM WIB".
 * @param {Date} date
 * @returns {string}
 */
function formatTimestamp(date) {
  const MONTHS = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agt','Sep','Okt','Nov','Des'];
  const dd  = String(date.getDate()).padStart(2, '0');
  const mmm = MONTHS[date.getMonth()];
  const yy  = date.getFullYear();
  const hh  = String(date.getHours()).padStart(2, '0');
  const min = String(date.getMinutes()).padStart(2, '0');
  return `${dd} ${mmm} ${yy}, ${hh}:${min} WIB`;
}

/**
 * Handler klik tombol refresh.
 * Mencegah klik ganda saat animasi sedang berjalan.
 */
function handleRefreshClick() {
  // Cegah klik ganda
  if (btnRefresh.disabled) return;
  btnRefresh.disabled = true;

  // Mulai animasi spin pada ikon
  iconRefresh.classList.add('icon-spin');

  // Setelah 700ms: hentikan animasi, update timestamp, aktifkan kembali tombol
  setTimeout(() => {
    iconRefresh.classList.remove('icon-spin');
    btnRefresh.disabled = false;

    // Update timestamp di header panel Ringkasan (paragraf kedua di div.mb-5)
    const headerDiv = document.querySelector('#panel-ringkasan > .mb-5');
    if (headerDiv) {
      const timeEl = headerDiv.querySelector('p.text-sm');
      if (timeEl) {
        timeEl.textContent = `Pembaruan terakhir: ${formatTimestamp(new Date())}`;
      }
    }
  }, 700);
}

if (btnRefresh) {
  btnRefresh.addEventListener('click', handleRefreshClick);
}


/* ================================================================
   7. TOMBOL NOTIFIKASI — Toggle panel dropdown + tandai dibaca
   Klik tombol: tampilkan/sembunyikan panel dropdown notifikasi.
   Klik "Tandai semua sudah dibaca": sembunyikan badge & reset label.
   Klik di luar panel: tutup panel.
================================================================ */

/** Referensi elemen notifikasi */
const btnNotifikasi    = document.getElementById('btn-notifikasi');
const notifPanel       = document.getElementById('notif-panel');
const notifBadge       = document.getElementById('notif-badge');
const notifUnreadLabel = document.getElementById('notif-unread-label');
const notifMarkRead    = document.getElementById('notif-mark-read');

/** Jumlah notifikasi belum dibaca saat ini */
let unreadCount = 3;

/**
 * Menutup panel notifikasi (dipanggil juga dari switchPanel).
 */
function closeNotifPanel() {
  if (!notifPanel) return;
  notifPanel.classList.add('hidden');
  if (btnNotifikasi) {
    btnNotifikasi.setAttribute('aria-expanded', 'false');
  }
}

/**
 * Membuka panel notifikasi.
 * Badge disembunyikan saat panel dibuka — pengguna dianggap sudah melihat.
 */
function openNotifPanel() {
  notifPanel.classList.remove('hidden');
  btnNotifikasi.setAttribute('aria-expanded', 'true');

  // Sembunyikan badge saat panel dibuka (item sudah terlihat)
  if (notifBadge) notifBadge.classList.add('hidden');

  // Update aria-label agar screen reader tahu badge sudah hilang
  const label = unreadCount > 0
    ? `Notifikasi — ${unreadCount} belum dibaca`
    : 'Notifikasi — semua sudah dibaca';
  btnNotifikasi.setAttribute('aria-label', label);
}

/**
 * Toggle panel notifikasi berdasarkan state saat ini.
 */
function toggleNotifPanel() {
  const isOpen = btnNotifikasi.getAttribute('aria-expanded') === 'true';
  if (isOpen) {
    closeNotifPanel();
  } else {
    openNotifPanel();
  }
}

/**
 * Menandai semua notifikasi sebagai sudah dibaca:
 * - Set unreadCount ke 0
 * - Hapus highlight "unread" dari semua item
 * - Update label dan sembunyikan badge
 * - Update aria-label tombol notifikasi
 * - Tutup panel setelah jeda singkat
 */
function markAllNotifRead() {
  unreadCount = 0;

  // Hapus class unread dari semua item di panel
  notifPanel.querySelectorAll('.notif-dropdown__item--unread').forEach((item) => {
    item.classList.remove('notif-dropdown__item--unread');
  });

  // Update label di dalam panel dropdown
  if (notifUnreadLabel) notifUnreadLabel.textContent = 'Semua sudah dibaca';

  // Sembunyikan badge pada tombol
  if (notifBadge) notifBadge.classList.add('hidden');

  // Update aria-label tombol notifikasi
  if (btnNotifikasi) {
    btnNotifikasi.setAttribute('aria-label', 'Notifikasi — semua sudah dibaca');
  }

  // Tutup panel setelah jeda singkat agar pengguna bisa melihat perubahan
  setTimeout(closeNotifPanel, 400);
}

// Pasang event listeners notifikasi
if (btnNotifikasi) {
  btnNotifikasi.addEventListener('click', (e) => {
    e.stopPropagation();   // Cegah bubble ke document listener
    toggleNotifPanel();
  });
}

if (notifMarkRead) {
  notifMarkRead.addEventListener('click', markAllNotifRead);
}

// Tutup panel notifikasi saat klik di luar elemen
document.addEventListener('click', (e) => {
  if (!notifPanel || notifPanel.classList.contains('hidden')) return;
  // Jika klik bukan di dalam wrapper notifikasi, tutup panel
  const wrapper = notifPanel.closest('.relative');
  if (wrapper && !wrapper.contains(e.target)) {
    closeNotifPanel();
  }
});


/* ================================================================
   8. STATION TABLE — Tabel stasiun pemantauan Kualitas Udara
   Fitur:
   - Data 12 stasiun didefinisikan sebagai array konstanta
   - Render baris tabel dari data
   - Filter real-time berdasarkan status tab (Semua/Baik/Moderat/Tidak Sehat)
   - Pencarian real-time berdasarkan nama atau wilayah stasiun
   - Tampilkan pesan kosong jika tidak ada hasil
   - Update badge count di tiap tab
================================================================ */

/**
 * Dataset 12 stasiun pemantauan kualitas udara Jakarta.
 * Setiap objek stasiun memiliki:
 *   id       {number}  — identifier unik
 *   nama     {string}  — nama resmi stasiun
 *   wilayah  {string}  — nama wilayah/kecamatan
 *   aqi      {number}  — indeks AQI saat ini
 *   pm25     {number}  — PM2.5 dalam µg/m³
 *   pm10     {number}  — PM10 dalam µg/m³
 *   status   {string}  — 'baik' | 'moderat' | 'tidak-sehat'
 *
 * @type {Array<{id:number, nama:string, wilayah:string, aqi:number, pm25:number, pm10:number, status:string}>}
 */
const STATION_DATA = [
  { id:  1, nama: 'Stasiun Kebayoran Lama',    wilayah: 'Jakarta Selatan', aqi:  38, pm25:  7.2, pm10: 14.1, status: 'baik' },
  { id:  2, nama: 'Stasiun Cilandak',           wilayah: 'Jakarta Selatan', aqi:  42, pm25:  8.1, pm10: 15.8, status: 'baik' },
  { id:  3, nama: 'Stasiun Kebon Jeruk',        wilayah: 'Jakarta Barat',   aqi:  44, pm25:  8.6, pm10: 16.3, status: 'baik' },
  { id:  4, nama: 'Stasiun Cengkareng',         wilayah: 'Jakarta Barat',   aqi:  58, pm25: 11.4, pm10: 21.7, status: 'moderat' },
  { id:  5, nama: 'Stasiun Gambir',             wilayah: 'Jakarta Pusat',   aqi:  72, pm25: 14.2, pm10: 27.5, status: 'moderat' },
  { id:  6, nama: 'Stasiun Menteng',            wilayah: 'Jakarta Pusat',   aqi:  67, pm25: 13.0, pm10: 24.8, status: 'moderat' },
  { id:  7, nama: 'Stasiun Kramat Jati',        wilayah: 'Jakarta Timur',   aqi:  65, pm25: 12.7, pm10: 24.1, status: 'moderat' },
  { id:  8, nama: 'Stasiun Duren Sawit',        wilayah: 'Jakarta Timur',   aqi:  79, pm25: 15.6, pm10: 29.4, status: 'moderat' },
  { id:  9, nama: 'Stasiun Penjaringan',        wilayah: 'Jakarta Utara',   aqi: 108, pm25: 21.3, pm10: 40.2, status: 'tidak-sehat' },
  { id: 10, nama: 'Stasiun Tanjung Priok',      wilayah: 'Jakarta Utara',   aqi: 124, pm25: 24.5, pm10: 46.1, status: 'tidak-sehat' },
  { id: 11, nama: 'Stasiun Koja',               wilayah: 'Jakarta Utara',   aqi:  98, pm25: 19.4, pm10: 36.7, status: 'tidak-sehat' },
  { id: 12, nama: 'Stasiun Pulau Tidung',       wilayah: 'Kepulauan Seribu',aqi:  22, pm25:  4.3, pm10:  8.5, status: 'baik' },
];

/* -- Referensi elemen DOM tabel stasiun --------------------- */
const stationTbody      = document.getElementById('station-tbody');
const stationEmpty      = document.getElementById('station-empty');
const stationEmptyDesc  = document.getElementById('station-empty-desc');
const stationCountEl    = document.getElementById('station-count');
const stationSearchInput = document.getElementById('station-search');

/** State filter saat ini: nilai dari data-status tab aktif */
let activeStationFilter = 'semua';

/**
 * Pemetaan nilai status → label tampilan dan CSS modifier.
 * @type {Object<string, {label:string, cls:string, dot:string}>}
 */
const STATUS_META = {
  'baik':         { label: 'Baik',         cls: 'station-status-badge--baik',         dot: '●', dotCls: 'station-aqi--baik' },
  'moderat':      { label: 'Moderat',      cls: 'station-status-badge--moderat',      dot: '●', dotCls: 'station-aqi--moderat' },
  'tidak-sehat':  { label: 'Tidak Sehat',  cls: 'station-status-badge--tidak-sehat',  dot: '●', dotCls: 'station-aqi--tidak-sehat' },
};

/**
 * Membuat satu baris <tr> dari objek data stasiun.
 *
 * @param {Object} station - Satu item dari STATION_DATA
 * @returns {HTMLTableRowElement}
 */
function createStationRow(station) {
  const meta = STATUS_META[station.status];
  const tr = document.createElement('tr');

  tr.innerHTML = `
    <td>
      <span class="station-name">${station.nama}</span>
    </td>
    <td>
      <span class="station-region">${station.wilayah}</span>
    </td>
    <td class="text-right">
      <span class="station-aqi ${meta.dotCls}">${station.aqi}</span>
    </td>
    <td class="text-right">${station.pm25.toFixed(1)}</td>
    <td class="text-right">${station.pm10.toFixed(1)}</td>
    <td>
      <span class="station-status-badge ${meta.cls}">
        ${meta.dot} ${meta.label}
      </span>
    </td>
  `;

  return tr;
}

/**
 * Memperbarui badge count di tiap tab filter stasiun.
 * Dihitung dari STATION_DATA (tidak terpengaruh oleh search/filter aktif).
 */
function updateStationTabCounts() {
  const counts = { baik: 0, moderat: 0, 'tidak-sehat': 0 };
  STATION_DATA.forEach((s) => { counts[s.status] = (counts[s.status] || 0) + 1; });

  document.getElementById('stab-count-semua').textContent        = STATION_DATA.length;
  document.getElementById('stab-count-baik').textContent         = counts['baik'];
  document.getElementById('stab-count-moderat').textContent      = counts['moderat'];
  document.getElementById('stab-count-tidak-sehat').textContent  = counts['tidak-sehat'];
}

/**
 * Merender tabel berdasarkan filter status aktif dan query pencarian.
 * Dipanggil setiap kali filter tab atau search input berubah.
 */
function renderStationTable() {
  const query = stationSearchInput
    ? stationSearchInput.value.trim().toLowerCase()
    : '';

  // Filter: status
  const byStatus = activeStationFilter === 'semua'
    ? STATION_DATA
    : STATION_DATA.filter((s) => s.status === activeStationFilter);

  // Filter: pencarian nama atau wilayah
  const results = query
    ? byStatus.filter((s) =>
        s.nama.toLowerCase().includes(query) ||
        s.wilayah.toLowerCase().includes(query)
      )
    : byStatus;

  // Update angka "Menampilkan X dari Y"
  if (stationCountEl) stationCountEl.textContent = results.length;

  // Render baris atau tampilkan state kosong
  if (results.length === 0) {
    stationTbody.innerHTML = '';
    stationEmpty.classList.remove('hidden');

    // Pesan berbeda tergantung penyebab kosong
    if (stationEmptyDesc) {
      stationEmptyDesc.textContent = query
        ? `Tidak ada stasiun yang cocok dengan "${query}".`
        : 'Tidak ada stasiun dengan status ini.';
    }
  } else {
    stationEmpty.classList.add('hidden');

    // Gunakan DocumentFragment agar hanya 1x reflow
    const fragment = document.createDocumentFragment();
    results.forEach((station) => fragment.appendChild(createStationRow(station)));

    stationTbody.innerHTML = '';
    stationTbody.appendChild(fragment);
  }
}

/**
 * Mengatur tab stasiun yang aktif dan men-trigger render ulang.
 *
 * @param {HTMLButtonElement} clickedTab
 */
function setActiveStationTab(clickedTab) {
  document.querySelectorAll('.station-tab').forEach((tab) => {
    const isActive = tab === clickedTab;
    tab.classList.toggle('station-tab--active', isActive);
    tab.setAttribute('aria-selected', isActive ? 'true' : 'false');
  });

  activeStationFilter = clickedTab.dataset.status;
  renderStationTable();
}

/**
 * Inisialisasi tabel stasiun: hitung count tab, render data awal,
 * dan pasang event listener pada tab + search input.
 * Dipanggil sekali dari init().
 */
function initStationTable() {
  if (!stationTbody) return;   // Guard: keluar jika elemen tidak ada

  // Isi count badge tiap tab
  updateStationTabCounts();

  // Render semua baris saat pertama kali
  renderStationTable();

  // Event listener: filter tab
  document.querySelectorAll('.station-tab').forEach((tab) => {
    tab.addEventListener('click', () => setActiveStationTab(tab));
  });

  // Event listener: search input (real-time, debounce ringan)
  if (stationSearchInput) {
    let debounceTimer = null;

    stationSearchInput.addEventListener('input', () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(renderStationTable, 120);
    });
  }
}
