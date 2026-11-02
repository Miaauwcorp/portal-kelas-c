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

Menu sidebar menggunakan URL terpisah. **Beranda** menuju `/`, sedangkan **Materi**, **Tugas**, **Jadwal**, **Diskusi**, dan **Tentang kelas** membuka embed Notion masing-masing dalam mode full-screen. Route browser tetap mengikuti menu yang dipilih, dan Tugas juga mendukung URL `?deadlinetugas` dengan kanonis `/assignments`. Semua URL embed dapat diubah terpusat pada object `notionSources` di `script.js`.

## Mode halaman Notion penuh

Klik **Tugas** di sidebar atau gunakan URL berikut untuk langsung membuka Notion dalam tampilan penuh dan tema terang:

```text
https://c-class.miaauwcorp.my.id/?deadlinetugas
```

URL `?deadlinetugas` otomatis diarahkan ke `/assignments` setelah mode penuh aktif dan tetap memakai embed deadline sebelumnya. Menu lainnya mempertahankan URL masing-masing dan menampilkan embed sementara `40bf5ba699fa80e5861ff254c4e10558` di halaman menunya.

## Custom domain

File `CNAME` sudah disiapkan untuk domain:

```text
c-class.miaauwcorp.my.id
```
