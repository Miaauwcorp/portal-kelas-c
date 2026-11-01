# Portal Kelas C

Portal pembelajaran statis berbasis Bootstrap yang siap dipublikasikan dengan GitHub Pages. Halaman utama menampilkan Notion melalui iframe dan sidebar navigasi modular tanpa sistem login.

## Menjalankan secara lokal

Buka `index.html` langsung di browser, atau jalankan server sederhana:

```bash
python3 -m http.server 8080
```

Kemudian buka `http://localhost:8080`.

## Publikasi ke GitHub Pages

1. Buat repository baru di GitHub.
2. Upload `index.html`, `styles.css`, `script.js`, dan `README.md` ke branch `main`.
3. Buka **Settings → Pages**.
4. Pada **Build and deployment**, pilih **Deploy from a branch**, branch `main`, folder `/ (root)`, lalu klik **Save**.
5. Tunggu proses deployment selesai. URL portal akan ditampilkan oleh GitHub Pages.

Menu sidebar menggunakan URL terpisah: `/`, `/materi`, `/jadwal`, `/diskusi`, dan `/tentang`. Menu **Tugas** membuka mode Notion penuh melalui `?deadlinetugas`, yang kemudian memakai URL kanonis `/assignements`. Navigasi halaman biasa tetap berjalan tanpa reload dengan `history.pushState`, tombol **Kembali ke beranda** tetap menuju `/`, dan `404.html` menjaga route tersebut dapat dibuka langsung saat dipublikasikan di GitHub Pages.

## Mode halaman Notion penuh

Klik **Tugas** di sidebar atau gunakan URL berikut untuk langsung membuka Notion dalam tampilan penuh dan tema terang:

```text
https://c-class.miaauwcorp.my.id/?deadlinetugas
```

URL `?deadlinetugas` otomatis diarahkan ke `/assignements` setelah mode penuh aktif.

## Custom domain

File `CNAME` sudah disiapkan untuk domain:

```text
c-class.miaauwcorp.my.id
```
