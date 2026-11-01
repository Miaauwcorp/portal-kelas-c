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

Menu sidebar sudah menggunakan struktur data-page sehingga halaman baru dapat ditambahkan dengan membuat section `page-*`, lalu menambahkan satu tombol navigasi.

## Mode halaman Notion penuh

Gunakan URL berikut untuk langsung membuka Notion dalam tampilan penuh dan tema terang:

```text
https://miaauwcorp.github.io/portal-kelas-c/?deadlinetugas
```

## Custom domain

File `CNAME` sudah disiapkan untuk domain:

```text
c-class.miaauwcorp.my.id
```
