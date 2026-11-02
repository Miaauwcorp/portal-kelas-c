/* Portal Kelas C: routing, halaman Notion, forum, dan galeri */
(function () {
  'use strict';

  const K = window.KONFIG || {};
  const NOTION = K.notion || {};
  const API_URL = String(K.appsScriptUrl || '').trim();
  const NAMA_KELAS = K.namaKelas || 'Kelas C';
  const MAKS_FOTO = Number(K.maksFotoSekaliUnggah) || 20;

  const MENU = [
    { id: 'beranda', label: 'Beranda', ikon: 'rumah' },
    { id: 'materi', label: 'Materi', ikon: 'buku', ket: 'Bahan belajar dan rangkuman tiap pertemuan', notion: true },
    { id: 'tugas', label: 'Tugas', ikon: 'tugas', ket: 'Daftar tugas beserta tenggat pengumpulan', notion: true },
    { id: 'jadwal', label: 'Jadwal', ikon: 'kalender', ket: 'Jadwal pelajaran dan agenda kelas', notion: true },
    { id: 'forum', label: 'Forum', ikon: 'obrolan', ket: 'Tanya jawab dan diskusi bersama' },
    { id: 'galeri', label: 'Galeri', ikon: 'gambar', ket: 'Foto kegiatan, satu album untuk tiap acara' }
  ];

  const IKON = {
    rumah: '<path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V21h14V9.5"/><path d="M10 21v-6h4v6"/>',
    buku: '<path d="M4 19.5V5a2 2 0 0 1 2-2h14v16H6a2 2 0 0 0-2 2.5z"/><path d="M8 7h8M8 11h5"/>',
    tugas: '<rect x="5" y="4" width="14" height="18" rx="2"/><path d="M9 4V2.5h6V4"/><path d="m9 13 2 2 4-4"/>',
    kalender: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
    obrolan: '<path d="M21 12a8 8 0 0 1-11.6 7.1L4 20.5l1.4-4.9A8 8 0 1 1 21 12z"/>',
    gambar: '<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="m21 16-5-5-9 9"/>',
    kembali: '<path d="M19 12H5M11 6l-6 6 6 6"/>',
    menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
    keluar: '<path d="M14 4h6v6M20 4l-9 9"/><path d="M19 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h5"/>',
    perbesar: '<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/>',
    tambah: '<path d="M12 5v14M5 12h14"/>',
    unggah: '<path d="M12 16V4M7 9l5-5 5 5"/><path d="M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3"/>',
    unduh: '<path d="M12 4v12M7 11l5 5 5-5"/><path d="M4 20h16"/>',
    tutup: '<path d="M6 6l12 12M18 6 6 18"/>',
    kiri: '<path d="m15 5-7 7 7 7"/>',
    kanan: '<path d="m9 5 7 7-7 7"/>'
  };

  const ikon = (n) => `<svg class="ikon" viewBox="0 0 24 24" aria-hidden="true">${IKON[n] || ''}</svg>`;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));
  const view = $('#view');

  /* ---------- Utilitas ---------- */
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

  const fmtHari = new Intl.DateTimeFormat('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const fmtPendek = new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  const fmtPanjang = new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  const fmtLengkap = new Intl.DateTimeFormat('id-ID', { dateStyle: 'full', timeStyle: 'short' });

  function waktuRelatif(iso) {
    const d = new Date(iso);
    if (isNaN(d)) return '';
    const detik = (Date.now() - d.getTime()) / 1000;
    if (detik < 60) return 'baru saja';
    if (detik < 3600) return Math.floor(detik / 60) + ' menit lalu';
    if (detik < 86400) return Math.floor(detik / 3600) + ' jam lalu';
    if (detik < 7 * 86400) return Math.floor(detik / 86400) + ' hari lalu';
    return fmtPendek.format(d);
  }
  const waktuPenuh = (iso) => { const d = new Date(iso); return isNaN(d) ? '' : fmtLengkap.format(d); };
  function tanggalAlbum(s) {
    if (!s) return '';
    const d = new Date(String(s).slice(0, 10) + 'T00:00:00');
    return isNaN(d) ? String(s) : fmtPanjang.format(d);
  }

  const WARNA_AVATAR = ['#1E3B33', '#7A5A0E', '#3A6B58', '#8A3B2A', '#2F4E6B', '#5B4A7A', '#4F6B2A'];
  function avatar(nama) {
    const n = String(nama || '?').trim();
    let h = 0;
    for (const ch of n) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
    const inisial = n.split(/\s+/).slice(0, 2).map((w) => w[0]).join('').toUpperCase() || '?';
    return `<span class="avatar" style="background:${WARNA_AVATAR[h % WARNA_AVATAR.length]}" aria-hidden="true">${esc(inisial)}</span>`;
  }

  function simpanNama(n) { try { localStorage.setItem('kelasc_nama', n); } catch (e) { /* abaikan */ } }
  function namaTersimpan() { try { return localStorage.getItem('kelasc_nama') || ''; } catch (e) { return ''; } }

  let timerToast;
  function toast(pesan, jenis) {
    const t = $('#toast');
    const kelasJenis = jenis === 'galat' ? ' galat' : '';
    t.textContent = pesan;
    t.className = 'toast tampil' + kelasJenis;
    clearTimeout(timerToast);
    timerToast = setTimeout(() => { t.className = 'toast' + kelasJenis; }, jenis === 'galat' ? 6500 : 3200);
  }

  function pesanGalat(e) {
    if (e instanceof TypeError) return 'Tidak bisa menghubungi server. Periksa koneksi internet dan URL Apps Script di js/config.js.';
    return (e && e.message) ? e.message : String(e);
  }

  // URL gambar Google Drive (utama + cadangan)
  const gbr = (id, w) => `https://drive.google.com/thumbnail?id=${encodeURIComponent(id)}&sz=w${w}`;
  const gbrCadangan = (id, w) => `https://lh3.googleusercontent.com/d/${encodeURIComponent(id)}=w${w}`;
  const tagGbr = (id, w, alt = '') =>
    `<img src="${gbr(id, w)}" data-cadangan="${gbrCadangan(id, w)}" alt="${esc(alt)}" loading="lazy" decoding="async">`;

  document.addEventListener('error', (e) => {
    const img = e.target;
    if (img.tagName === 'IMG' && img.dataset.cadangan && !img.dataset.coba) {
      img.dataset.coba = '1';
      img.src = img.dataset.cadangan;
    }
  }, true);

  /* ---------- Komponen kecil ---------- */
  const memuat = (teks = 'Memuat…') => `<div class="memuat"><span class="putar"></span>${esc(teks)}</div>`;
  const kosong = (teks) => `<div class="kosong">${esc(teks)}</div>`;
  const galat = (e) => `<div class="kosong galat"><strong>Gagal memuat.</strong> ${esc(pesanGalat(e))}<br><button class="tombol sekunder" type="button" data-aksi="ulang">Coba lagi</button></div>`;
  const kepala = (judul, teks) => `<header class="hal-kepala"><h1>${esc(judul)}</h1><p>${esc(teks)}</p></header>`;
  const belumTersambung = (fitur) => `<div class="catatan"><strong>${esc(fitur)} belum tersambung ke server.</strong> Isi <code>appsScriptUrl</code> di <code>js/config.js</code> dengan URL Web App dari Google Apps Script. Langkahnya ada di PETUNJUK-PEMASANGAN.md.</div>`;
  const kolomKode = () => K.pakaiKodeUnggah
    ? '<label class="isian">Kode kelas<input name="kode" required autocomplete="off" placeholder="Minta ke pengurus kelas"></label>'
    : '';

  /* ---------- API Apps Script ---------- */
  const API = {
    siap: !!API_URL,
    async get(action, params = {}) {
      const url = new URL(API_URL);
      url.searchParams.set('action', action);
      Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
      url.searchParams.set('_', Date.now());
      return olahBalasan(await fetch(url.toString()));
    },
    async post(action, data = {}) {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' }, // menghindari preflight CORS
        body: JSON.stringify(Object.assign({ action }, data))
      });
      return olahBalasan(res);
    }
  };
  async function olahBalasan(res) {
    if (!res.ok) throw new Error('Server membalas dengan kode ' + res.status + '.');
    let j;
    try { j = await res.json(); } catch (e) {
      throw new Error('Balasan server tidak terbaca. Pastikan URL Apps Script berakhiran /exec dan aksesnya "Siapa saja".');
    }
    if (!j.ok) throw new Error(j.error || 'Terjadi kesalahan di server.');
    return j.data;
  }

  // Kirim formulir sederhana (forum & album)
  async function kirimForm(form, action, tambahan = {}) {
    const wajib = $$('[required]', form).find((el) => !el.value.trim());
    if (wajib) { wajib.focus(); toast('Lengkapi kolom yang masih kosong.', 'galat'); return null; }
    const data = {};
    new FormData(form).forEach((v, k) => { data[k] = String(v).trim(); });
    const tombol = form.querySelector('[type="submit"]');
    const teksAsli = tombol.textContent;
    tombol.disabled = true;
    tombol.textContent = 'Mengirim…';
    try {
      if (data.nama && action !== 'createAlbum') simpanNama(data.nama);
      return await API.post(action, Object.assign(data, tambahan));
    } catch (e) {
      toast(pesanGalat(e), 'galat');
      return null;
    } finally {
      tombol.disabled = false;
      tombol.textContent = teksAsli;
    }
  }
// ggsd
  /* ---------- Sidebar ---------- */
  const sidebar = $('#sidebar');
  const tirai = $('#tirai');
  const tombolMenu = $('#tombolMenu');
  const hurufKelas = () => K.hurufKelas || NAMA_KELAS.trim().slice(-1).toUpperCase();

  function bangunSidebar() {
    $('#merekNama').textContent = NAMA_KELAS;
    $('#merekHuruf').textContent = hurufKelas();
    $('#bilahJudul').textContent = NAMA_KELAS;
    $('#nav').innerHTML = MENU.map((m, i) =>
      (i === 1 || i === 4 ? '<div class="nav-pisah" aria-hidden="true"></div>' : '') +
      `<a href="#${m.id}" data-id="${m.id}">${ikon(m.ikon)}<span>${m.label}</span>${m.notion ? '<small>Notion</small>' : ''}</a>`
    ).join('');
  }
  function bukaSidebar() { sidebar.classList.add('buka'); tirai.hidden = false; tombolMenu.setAttribute('aria-expanded', 'true'); }
  function tutupSidebar() { sidebar.classList.remove('buka'); tirai.hidden = true; tombolMenu.setAttribute('aria-expanded', 'false'); }
  tombolMenu.addEventListener('click', () => (sidebar.classList.contains('buka') ? tutupSidebar() : bukaSidebar()));
  tirai.addEventListener('click', tutupSidebar);

  function tandaiAktif(id) {
    $$('#nav a').forEach((a) => {
      if (a.dataset.id === id) a.setAttribute('aria-current', 'page');
      else a.removeAttribute('aria-current');
    });
  }

  /* ---------- Lapisan Notion ---------- */
  const notionEl = $('#notion');
  const frame = $('#notionFrame');
  const notionMuat = $('#notionMuat');

  frame.addEventListener('load', () => { if (frame.getAttribute('src')) notionMuat.hidden = true; });

  function bukaNotion(m) {
    const url = String(NOTION[m.id] || '').trim();
    const kotakKosong = $('#notionKosong');
    const tautanBaru = $('#notionBaru');
    notionEl.hidden = false;
    document.body.classList.add('terkunci');
    $('#notionJudul').textContent = m.label;
    document.title = `${m.label} | ${NAMA_KELAS}`;

    if (!url) {
      frame.hidden = true;
      notionMuat.hidden = true;
      tautanBaru.hidden = true;
      kotakKosong.hidden = false;
      kotakKosong.innerHTML = `<div>
        <span class="ikon-kotak besar">${ikon(m.ikon)}</span>
        <h2>Halaman ${esc(m.label)} belum dihubungkan</h2>
        <p>Tempel link embed Notion untuk menu ini di <code>js/config.js</code>, pada bagian <code>notion.${m.id}</code>.</p>
        <button class="tombol" type="button" data-aksi="beranda">Kembali ke beranda</button>
      </div>`;
    } else {
      kotakKosong.hidden = true;
      frame.hidden = false;
      tautanBaru.hidden = false;
      tautanBaru.href = url;
      if (frame.getAttribute('src') !== url) {
        notionMuat.hidden = false;
        frame.src = url;
      }
    }
    $('#notionKembali').focus();
  }

  function tutupNotion() {
    if (notionEl.hidden) return;
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    notionEl.hidden = true;
    document.body.classList.remove('terkunci');
  }

  $('#notionKembali').addEventListener('click', () => { location.hash = '#beranda'; });
  const tombolPenuh = $('#notionPenuh');
  if (!document.fullscreenEnabled) tombolPenuh.hidden = true;
  tombolPenuh.addEventListener('click', () => {
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    else notionEl.requestFullscreen().catch(() => toast('Browser ini tidak mengizinkan layar penuh.', 'galat'));
  });

  /* ---------- Router ---------- */
  let urutan = 0;
  const mulai = (halaman) => { view.dataset.page = halaman; return ++urutan; };
  const masihAktif = (n) => n === urutan;

  function route() {
    const hash = decodeURIComponent(location.hash.slice(1)) || 'beranda';
    const [halaman, sub] = hash.split('/');
    const m = MENU.find((x) => x.id === halaman) || MENU[0];

    tutupLb();
    tutupSidebar();
    tandaiAktif(m.id);

    if (m.notion) {
      if (view.dataset.page !== 'beranda') renderBeranda();
      bukaNotion(m);
      return;
    }

    tutupNotion();
    document.title = m.id === 'beranda' ? NAMA_KELAS : `${m.label} | ${NAMA_KELAS}`;
    $('#bilahJudul').textContent = m.id === 'beranda' ? NAMA_KELAS : m.label;

    if (m.id === 'forum') sub ? renderTopik(sub) : renderForum();
    else if (m.id === 'galeri') sub ? renderAlbum(sub) : renderGaleri();
    else renderBeranda();

    window.scrollTo(0, 0);
    view.focus({ preventScroll: true });
  }

  /* ---------- Beranda ---------- */
  function renderBeranda() {
    const n = mulai('beranda');
    const sekarang = new Date();
    const jam = sekarang.getHours();
    const salam = jam < 11 ? 'Selamat pagi' : jam < 15 ? 'Selamat siang' : jam < 18 ? 'Selamat sore' : 'Selamat malam';

    view.innerHTML = `
      <section class="sambut">
        <span class="sambut-huruf" aria-hidden="true">${esc(hurufKelas())}</span>
        <p class="salam">${salam}, semuanya</p>
        <h1>${esc(NAMA_KELAS)}</h1>
        ${K.subjudul ? `<p class="sambut-sub">${esc(K.subjudul)}</p>` : ''}
        <p class="tanggal">${fmtHari.format(sekarang)}</p>
      </section>

      <nav class="pintasan" aria-label="Pintasan menu">
        ${MENU.filter((m) => m.id !== 'beranda').map((m) => `
          <a href="#${m.id}">
            <span class="ikon-kotak">${ikon(m.ikon)}</span>
            <strong>${m.label}</strong>
            <span class="ket">${m.ket}</span>
          </a>`).join('')}
      </nav>

      ${API.siap ? `
      <div class="dua-kolom">
        <section>
          <div class="judul-bagian"><h2>Diskusi terbaru</h2><a href="#forum">Lihat semua</a></div>
          <div id="berandaTopik" class="daftar-topik ringkas">${memuat()}</div>
        </section>
        <section>
          <div class="judul-bagian"><h2>Album terbaru</h2><a href="#galeri">Lihat semua</a></div>
          <div id="berandaAlbum" class="album-mini">${memuat()}</div>
        </section>
      </div>` : ''}`;

    if (!API.siap) return;

    API.get('topics').then((d) => {
      if (!masihAktif(n)) return;
      $('#berandaTopik').innerHTML = d.length ? d.slice(0, 4).map(itemTopik).join('') : kosong('Belum ada diskusi.');
    }).catch((e) => { if (masihAktif(n)) $('#berandaTopik').innerHTML = galat(e); });

    API.get('albums').then((d) => {
      if (!masihAktif(n)) return;
      $('#berandaAlbum').innerHTML = d.length ? d.slice(0, 4).map((a) => `
        <a class="album-mini-item" href="#galeri/${encodeURIComponent(a.id)}">
          <span class="mini-sampul">${a.sampulId ? tagGbr(a.sampulId, 200) : ikon('gambar')}</span>
          <span><strong>${esc(a.nama)}</strong><small>${a.tanggal ? tanggalAlbum(a.tanggal) + ', ' : ''}${a.jumlah} foto</small></span>
        </a>`).join('') : kosong('Belum ada album.');
    }).catch((e) => { if (masihAktif(n)) $('#berandaAlbum').innerHTML = galat(e); });
  }

  /* ---------- Forum ---------- */
  function itemTopik(t) {
    return `<a class="topik" href="#forum/${encodeURIComponent(t.id)}">
      <h3>${esc(t.judul)}</h3>
      ${t.cuplikan ? `<p>${esc(t.cuplikan)}</p>` : ''}
      <div class="meta">
        <span>oleh ${esc(t.nama)}</span>
        <span title="${esc(waktuPenuh(t.aktivitas || t.waktu))}">${waktuRelatif(t.aktivitas || t.waktu)}</span>
        <span class="lencana">${Number(t.balasan) || 0} balasan</span>
      </div>
    </a>`;
  }

  async function renderForum() {
    const n = mulai('forum');
    view.innerHTML = `
      ${kepala('Forum diskusi', 'Tanyakan soal pelajaran, tugas, atau kegiatan kelas. Semua orang bisa membaca dan membalas, jadi tulis dengan sopan.')}
      ${API.siap ? `
        <details class="panel lipat">
          <summary>${ikon('tambah')} Mulai topik baru</summary>
          <form id="formTopik" class="form" novalidate>
            <div class="baris">
              <label class="isian">Nama kamu<input name="nama" maxlength="40" required autocomplete="name" value="${esc(namaTersimpan())}"></label>
              <label class="isian">Judul topik<input name="judul" maxlength="120" required placeholder="Contoh: Cara mengerjakan soal nomor 4"></label>
            </div>
            <label class="isian">Isi<textarea name="isi" maxlength="4000" required placeholder="Tulis pertanyaan atau pendapatmu"></textarea></label>
            <div><button class="tombol" type="submit">Kirim topik</button></div>
          </form>
        </details>
        <div id="daftarTopik" class="daftar-topik">${memuat('Memuat topik…')}</div>`
      : belumTersambung('Forum')}`;

    if (!API.siap) return;

    $('#formTopik').addEventListener('submit', async (e) => {
      e.preventDefault();
      const hasil = await kirimForm(e.target, 'addTopic');
      if (hasil) { toast('Topik terkirim.'); location.hash = '#forum/' + encodeURIComponent(hasil.id); }
    });

    try {
      const d = await API.get('topics');
      if (!masihAktif(n)) return;
      $('#daftarTopik').innerHTML = d.length ? d.map(itemTopik).join('') : kosong('Belum ada topik. Mulai diskusi pertama lewat tombol di atas.');
    } catch (e) {
      if (masihAktif(n)) $('#daftarTopik').innerHTML = galat(e);
    }
  }

  const posHTML = (p, utama) => `
    <article class="pos${utama ? ' pos-utama' : ''}">
      ${utama ? `<h1>${esc(p.judul)}</h1>` : ''}
      <div class="pos-penulis">${avatar(p.nama)}
        <div><strong>${esc(p.nama)}</strong><span title="${esc(waktuPenuh(p.waktu))}">${waktuRelatif(p.waktu)}</span></div>
      </div>
      <div class="pos-isi">${esc(p.isi)}</div>
    </article>`;

  async function renderTopik(id, gulirKeBawah) {
    const n = mulai('forum');
    view.innerHTML = `<a class="tautan-kembali" href="#forum">${ikon('kembali')} Semua topik</a><div id="isiTopik">${memuat('Memuat diskusi…')}</div>`;
    if (!API.siap) { $('#isiTopik').innerHTML = belumTersambung('Forum'); return; }

    try {
      const d = await API.get('topic', { id });
      if (!masihAktif(n)) return;
      const t = d.topik;
      document.title = `${t.judul} | ${NAMA_KELAS}`;
      $('#isiTopik').innerHTML = `
        ${posHTML(t, true)}
        <h2 class="judul-balasan">${d.balasan.length ? d.balasan.length + ' balasan' : 'Belum ada balasan'}</h2>
        <div class="daftar-balasan">${d.balasan.map((b) => posHTML(b, false)).join('')}</div>
        <section class="panel">
          <h3>Tulis balasan</h3>
          <form id="formBalas" class="form" novalidate>
            <label class="isian">Nama kamu<input name="nama" maxlength="40" required autocomplete="name" value="${esc(namaTersimpan())}"></label>
            <label class="isian">Balasan<textarea name="isi" maxlength="4000" required></textarea></label>
            <div><button class="tombol" type="submit">Kirim balasan</button></div>
          </form>
        </section>`;

      $('#formBalas').addEventListener('submit', async (e) => {
        e.preventDefault();
        const hasil = await kirimForm(e.target, 'addReply', { topikId: id });
        if (hasil) { toast('Balasan terkirim.'); renderTopik(id, true); }
      });

      if (gulirKeBawah) {
        const semua = $$('.daftar-balasan .pos');
        if (semua.length) semua[semua.length - 1].scrollIntoView({ block: 'center' });
      }
    } catch (e) {
      if (masihAktif(n)) $('#isiTopik').innerHTML = galat(e);
    }
  }

  /* ---------- Galeri ---------- */
  function kartuAlbum(a) {
    return `<a class="album" href="#galeri/${encodeURIComponent(a.id)}">
      <div class="album-sampul">${a.sampulId ? tagGbr(a.sampulId, 600, a.nama) : ikon('gambar')}</div>
      <h3>${esc(a.nama)}</h3>
      <p class="meta">${a.tanggal ? `<span>${tanggalAlbum(a.tanggal)}</span>` : ''}<span>${Number(a.jumlah) || 0} foto</span></p>
    </a>`;
  }

  async function renderGaleri() {
    const n = mulai('galeri');
    view.innerHTML = `
      ${kepala('Galeri', 'Foto-foto kegiatan kelas. Setiap kegiatan punya albumnya sendiri. Buka album untuk melihat atau menambah foto.')}
      ${API.siap ? `
        <details class="panel lipat">
          <summary>${ikon('tambah')} Buat album kegiatan</summary>
          <form id="formAlbum" class="form" novalidate>
            <div class="baris">
              <label class="isian">Nama kegiatan<input name="nama" maxlength="80" required placeholder="Contoh: Class meeting semester ganjil"></label>
              <label class="isian">Tanggal kegiatan<input type="date" name="tanggal"></label>
            </div>
            <label class="isian">Keterangan singkat<textarea class="pendek" name="deskripsi" maxlength="500" placeholder="Opsional"></textarea></label>
            ${kolomKode()}
            <div><button class="tombol" type="submit">Buat album</button></div>
          </form>
        </details>
        <div id="daftarAlbum" class="album-grid">${memuat('Memuat album…')}</div>`
      : belumTersambung('Galeri')}`;

    if (!API.siap) return;

    $('#formAlbum').addEventListener('submit', async (e) => {
      e.preventDefault();
      const hasil = await kirimForm(e.target, 'createAlbum');
      if (hasil) { toast('Album dibuat. Sekarang tambahkan fotonya.'); location.hash = '#galeri/' + encodeURIComponent(hasil.id); }
    });

    try {
      const d = await API.get('albums');
      if (!masihAktif(n)) return;
      $('#daftarAlbum').innerHTML = d.length ? d.map(kartuAlbum).join('') : kosong('Belum ada album. Buat album pertama untuk kegiatan kelas.');
    } catch (e) {
      if (masihAktif(n)) $('#daftarAlbum').innerHTML = galat(e);
    }
  }

  // Perkecil foto di browser sebelum dikirim
  function kecilkan(file, maks = 2000, mutu = 0.85) {
    return new Promise((selesai) => {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        const skala = Math.min(1, maks / Math.max(img.naturalWidth, img.naturalHeight));
        const c = document.createElement('canvas');
        c.width = Math.round(img.naturalWidth * skala);
        c.height = Math.round(img.naturalHeight * skala);
        const ctx = c.getContext('2d');
        ctx.fillStyle = '#fff';
        ctx.fillRect(0, 0, c.width, c.height);
        ctx.drawImage(img, 0, 0, c.width, c.height);
        URL.revokeObjectURL(url);
        selesai({ data: c.toDataURL('image/jpeg', mutu), mime: 'image/jpeg', nama: file.name.replace(/\.[^.]+$/, '') + '.jpg' });
      };
      img.onerror = () => {
        // Format yang tidak bisa dibaca browser (mis. HEIC di Chrome): kirim apa adanya
        URL.revokeObjectURL(url);
        const fr = new FileReader();
        fr.onload = () => selesai({ data: fr.result, mime: file.type || 'image/heic', nama: file.name });
        fr.readAsDataURL(file);
      };
      img.src = url;
    });
  }

  let fotoAktif = [];

  async function renderAlbum(id) {
    const n = mulai('galeri');
    view.innerHTML = `<a class="tautan-kembali" href="#galeri">${ikon('kembali')} Semua album</a><div id="isiAlbum">${memuat('Memuat album…')}</div>`;
    if (!API.siap) { $('#isiAlbum').innerHTML = belumTersambung('Galeri'); return; }

    let d;
    try {
      d = await API.get('album', { id });
    } catch (e) {
      if (masihAktif(n)) $('#isiAlbum').innerHTML = galat(e);
      return;
    }
    if (!masihAktif(n)) return;

    const a = d.album;
    const foto = d.foto || [];
    fotoAktif = foto;
    document.title = `${a.nama} | ${NAMA_KELAS}`;

    $('#isiAlbum').innerHTML = `
      <header class="hal-kepala">
        <h1>${esc(a.nama)}</h1>
        <p class="meta">${a.tanggal ? `<span>${tanggalAlbum(a.tanggal)}</span>` : ''}<span>${foto.length} foto</span></p>
        ${a.deskripsi ? `<p>${esc(a.deskripsi)}</p>` : ''}
      </header>

      <details class="panel lipat"${foto.length ? '' : ' open'}>
        <summary>${ikon('tambah')} Tambah foto ke album ini</summary>
        <form id="formFoto" class="form" novalidate>
          <label class="zona-unggah" id="zonaUnggah" for="pilihFoto">
            ${ikon('unggah')}
            <strong>Pilih foto atau seret ke sini</strong>
            <span>Bisa beberapa sekaligus, maksimal ${MAKS_FOTO}. Foto diperkecil otomatis sebelum diunggah.</span>
          </label>
          <input type="file" id="pilihFoto" class="sr-only" accept="image/*" multiple>
          <div id="pratinjau" class="pratinjau"></div>
          <div class="baris">
            <label class="isian">Nama pengunggah<input name="nama" maxlength="40" required autocomplete="name" value="${esc(namaTersimpan())}"></label>
            <label class="isian">Keterangan<input name="keterangan" maxlength="200" placeholder="Opsional, berlaku untuk semua foto yang dipilih"></label>
          </div>
          ${kolomKode()}
          <div class="baris-aksi">
            <button class="tombol" type="submit">Unggah foto</button>
            <span id="progres" class="progres" aria-live="polite"></span>
          </div>
        </form>
      </details>

      <div class="foto-grid">
        ${foto.length
          ? foto.map((f, i) => `<div class="foto-item"><button class="foto" type="button" data-i="${i}" aria-label="Lihat foto ${i + 1}">${tagGbr(f.fileId, 500, f.keterangan)}</button><button class="foto-hapus" type="button" data-foto-id="${esc(f.id)}" aria-label="Hapus foto ${i + 1}">Hapus</button></div>`).join('')
          : kosong('Album ini masih kosong. Tambahkan foto pertama lewat formulir di atas.')}
      </div>`;

    $$('.foto').forEach((b) => b.addEventListener('click', () => bukaLb(Number(b.dataset.i))));
    $$('.foto-hapus').forEach((b) => b.addEventListener('click', () => hapusFoto(id, b.dataset.fotoId)));
    pasangUnggah(id);
  }

  async function hapusFoto(albumId, fotoId) {
    const foto = fotoAktif.find((f) => String(f.id) === String(fotoId));
    if (!foto || !confirm('Hapus foto ini secara permanen?')) return;
    const kode = K.pakaiKodeUnggah ? (prompt('Masukkan kode kelas untuk menghapus foto:') || '') : '';
    try {
      await API.post('deletePhoto', { albumId, fotoId: foto.id, kode });
      toast('Foto berhasil dihapus.');
      renderAlbum(albumId);
    } catch (e) {
      toast(pesanGalat(e), 'galat');
    }
  }

  function pasangUnggah(albumId) {
    const form = $('#formFoto');
    const input = $('#pilihFoto');
    const zona = $('#zonaUnggah');
    const progres = $('#progres');
    let dipilih = [];

    function setPilihan(files) {
      let semua = Array.from(files).filter((f) => f.type.startsWith('image/') || /\.(heic|heif)$/i.test(f.name));
      if (semua.length > MAKS_FOTO) {
        toast(`Hanya ${MAKS_FOTO} foto pertama yang dipakai.`, 'galat');
        semua = semua.slice(0, MAKS_FOTO);
      }
      dipilih = semua;
      const p = $('#pratinjau');
      p.innerHTML = '';
      dipilih.forEach((f) => {
        const u = URL.createObjectURL(f);
        const img = document.createElement('img');
        img.alt = '';
        img.onload = () => URL.revokeObjectURL(u);
        img.onerror = () => { URL.revokeObjectURL(u); img.remove(); };
        img.src = u;
        p.appendChild(img);
      });
      if (dipilih.length) {
        const s = document.createElement('span');
        s.textContent = dipilih.length + ' foto dipilih';
        p.appendChild(s);
      }
    }

    input.addEventListener('change', () => setPilihan(input.files));
    ['dragenter', 'dragover'].forEach((ev) => zona.addEventListener(ev, (e) => { e.preventDefault(); zona.classList.add('seret'); }));
    ['dragleave', 'drop'].forEach((ev) => zona.addEventListener(ev, () => zona.classList.remove('seret')));
    zona.addEventListener('drop', (e) => { e.preventDefault(); if (e.dataTransfer && e.dataTransfer.files) setPilihan(e.dataTransfer.files); });

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const el = form.elements;
      if (!dipilih.length) { toast('Pilih foto dulu.', 'galat'); return; }
      const pengunggah = el.nama.value.trim();
      if (!pengunggah) { el.nama.focus(); toast('Isi nama pengunggah.', 'galat'); return; }
      const kode = el.kode ? el.kode.value.trim() : '';
      if (el.kode && !kode) { el.kode.focus(); toast('Isi kode kelas.', 'galat'); return; }
      simpanNama(pengunggah);

      const tombol = form.querySelector('[type="submit"]');
      tombol.disabled = true;
      input.disabled = true;
      let berhasil = 0;
      const gagal = [];

      for (let i = 0; i < dipilih.length; i++) {
        progres.textContent = `Mengunggah ${i + 1} dari ${dipilih.length}…`;
        try {
          const b = await kecilkan(dipilih[i]);
          await API.post('uploadPhoto', {
            albumId, nama: b.nama, mime: b.mime, data: b.data,
            keterangan: el.keterangan.value.trim(), pengunggah, kode
          });
          berhasil++;
        } catch (err) {
          gagal.push(`${dipilih[i].name}: ${pesanGalat(err)}`);
          if (/kode kelas/i.test(err.message || '')) break; // kode salah, hentikan
        }
      }

      progres.textContent = '';
      tombol.disabled = false;
      input.disabled = false;

      if (gagal.length) toast(`${gagal.length} foto gagal diunggah. ${gagal[0]}`, 'galat');
      if (berhasil) {
        if (!gagal.length) toast(`${berhasil} foto terunggah. Gambar baru kadang butuh beberapa detik untuk tampil.`);
        renderAlbum(albumId);
      }
    });
  }

  /* ---------- Penampil foto ---------- */
  const lb = $('#lightbox');
  const lbGambar = $('#lbGambar');
  let lbIndeks = 0;

  function tampilLb() {
    const f = fotoAktif[lbIndeks];
    if (!f) return;
    delete lbGambar.dataset.coba;
    lbGambar.dataset.cadangan = gbrCadangan(f.fileId, 2000);
    lbGambar.src = gbr(f.fileId, 2000);
    lbGambar.alt = f.keterangan || 'Foto kegiatan';
    $('#lbKet').innerHTML = [
      f.keterangan ? `<span>${esc(f.keterangan)}</span>` : '',
      `<span>${lbIndeks + 1} dari ${fotoAktif.length}</span>`,
      f.pengunggah ? `<span>Diunggah oleh ${esc(f.pengunggah)}</span>` : ''
    ].join('');
    $('#lbUnduh').href = `https://drive.google.com/uc?export=download&id=${encodeURIComponent(f.fileId)}`;
    const satu = fotoAktif.length < 2;
    $('#lbSebelum').hidden = satu;
    $('#lbBerikut').hidden = satu;
  }
  function bukaLb(i) {
    if (!fotoAktif.length) return;
    lbIndeks = i;
    tampilLb();
    lb.hidden = false;
    document.body.classList.add('terkunci');
    $('#lbTutup').focus();
  }
  function tutupLb() {
    if (lb.hidden) return;
    lb.hidden = true;
    lbGambar.removeAttribute('src');
    if (notionEl.hidden) document.body.classList.remove('terkunci');
  }
  function geserLb(arah) {
    if (!fotoAktif.length) return;
    lbIndeks = (lbIndeks + arah + fotoAktif.length) % fotoAktif.length;
    tampilLb();
  }

  $('#lbTutup').addEventListener('click', tutupLb);
  $('#lbSebelum').addEventListener('click', () => geserLb(-1));
  $('#lbBerikut').addEventListener('click', () => geserLb(1));
  lb.addEventListener('click', (e) => { if (e.target === lb || e.target.classList.contains('lb-figur')) tutupLb(); });

  let sentuhX = null;
  lb.addEventListener('touchstart', (e) => { sentuhX = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener('touchend', (e) => {
    if (sentuhX === null) return;
    const dx = e.changedTouches[0].clientX - sentuhX;
    if (Math.abs(dx) > 50) geserLb(dx < 0 ? 1 : -1);
    sentuhX = null;
  });

  /* ---------- Event global ---------- */
  document.addEventListener('keydown', (e) => {
    if (!lb.hidden) {
      if (e.key === 'Escape') tutupLb();
      else if (e.key === 'ArrowLeft') geserLb(-1);
      else if (e.key === 'ArrowRight') geserLb(1);
      return;
    }
    if (e.key !== 'Escape') return;
    if (!notionEl.hidden && !document.fullscreenElement) location.hash = '#beranda';
    else if (sidebar.classList.contains('buka')) tutupSidebar();
  });

  document.addEventListener('click', (e) => {
    const t = e.target.closest('[data-aksi]');
    if (!t) return;
    if (t.dataset.aksi === 'beranda') location.hash = '#beranda';
    if (t.dataset.aksi === 'ulang') route();
  });

  /* ---------- Mulai ---------- */
  function pasangIkon() {
    $$('[data-ikon]').forEach((el) => {
      if (!el.querySelector('svg')) el.insertAdjacentHTML('afterbegin', ikon(el.dataset.ikon));
    });
  }

  bangunSidebar();
  pasangIkon();
  window.addEventListener('hashchange', route);
  route();
})();
