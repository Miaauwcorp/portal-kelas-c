/* =========================================================
   PENGATURAN PORTAL KELAS C
   Cukup ubah file ini. File lain tidak perlu disentuh.
   ========================================================= */
window.KONFIG = {
  // Nama yang tampil di sidebar dan beranda
  namaKelas: 'Kelas C',
  hurufKelas: 'C',
  subjudul: 'Ruang bersama untuk materi, tugas, jadwal, diskusi, dan dokumentasi kegiatan kelas.',

  // URL Web App dari Google Apps Script (berakhiran /exec).
  // Dipakai oleh Forum dan Galeri. Contoh:
  // 'https://script.google.com/macros/s/AKfycb.../exec'
  appsScriptUrl: 'https://script.google.com/macros/s/AKfycbwEe_bSHoaBzyTn3JaqJ9F1vWovNK8Tq6YTp7YuvO0AcQtwtbwKXUputV1G2RRpYz0/exec',

  // Link embed Notion untuk tiap menu. Biarkan kosong jika belum ada.
  notion: {
    materi: '',
    tugas: 'https://wood-foundation-baf.notion.site/ebd//40cf5ba699fa808a8196d87aa1cbbae4?v=40cf5ba699fa80409bd9000cea75225e',
    jadwal: ''
  },

  // Ubah ke true jika KODE_UNGGAH di Code.gs diisi.
  // Formulir buat album dan unggah foto akan meminta kode kelas.
  pakaiKodeUnggah: false,

  // Jumlah foto maksimal dalam satu kali unggah
  maksFotoSekaliUnggah: 20
};
