# Al Hikmah Attendance

Aplikasi absensi sekolah berbasis web yang berjalan di browser dan responsif untuk HP, tablet, laptop, dan desktop.

## Cara menjalankan

Buka `index.html` langsung di browser, atau jalankan server lokal dari folder ini:

```powershell
python -m http.server 4173 --bind 127.0.0.1
```

Lalu buka `http://127.0.0.1:4173/`.

## Alur awal

1. Login sebagai Administrator.
2. Isi data master: tahun ajaran, semester, guru, kelas, mata pelajaran, jadwal, hari libur, dan pengaturan absensi.
3. Tambahkan siswa. Sistem otomatis membuat `qr_token` unik permanen dan riwayat kelas siswa.
4. Jika `Akun Login` aktif, sistem membuat email login otomatis bila dikosongkan dan password awal acak.
5. Cetak QR per siswa atau massal per kelas.
6. Guru membuka sesi dari jadwal aktif hari ini.
7. Scan QR siswa dari kamera yang mendukung `BarcodeDetector`, atau input token QR manual.
8. Tutup sesi untuk memproses Alfa otomatis sesuai aturan.
9. Gunakan menu Laporan untuk rekap semester, kelas, mapel, harian/bulanan melalui filter.

## Alur per role

- Administrator: mengelola semua master data, user, pengaturan, absensi, dan laporan.
- Guru: dashboard mengajar, buka sesi dari jadwal aktif, scan QR siswa, input manual dengan alasan.
- Wali Kelas: dashboard kelas binaan, pantau siswa perlu perhatian, setujui izin/sakit kelasnya.
- Kepala Sekolah: dashboard rekap sekolah dan laporan tanpa akses hapus data.
- Siswa: dashboard pribadi berisi identitas, QR token permanen, jadwal kelas, status absensi hari ini, dan rekap kehadiran sendiri.

## Catatan teknis

- Data tersimpan di `localStorage` browser, tanpa data dummy bawaan.
- Sesi login tidak dipertahankan setelah halaman di-refresh; pengguna harus login ulang.
- Password pengguna disimpan sebagai hash SHA-256 untuk prototipe browser lokal.
- Role tersedia: Administrator, Guru, Wali Kelas, Kepala Sekolah, dan Siswa.
- Halaman `Profil Saya` menampilkan identitas login. Administrator memakai email/password, sedangkan guru, wali kelas, kepala sekolah, dan siswa memakai NIP/NISN dari data master.
- Data absensi menyimpan snapshot `class_id`, `subject_id`, `teacher_id`, `academic_year_id`, dan `semester_id`.
- Semua perubahan manual dan perubahan otomatis dari izin/sakit dicatat ke `attendance_logs`.
- Untuk produksi sekolah nyata, pindahkan model data ini ke backend dengan database server, session server-side, CSRF token server-side, backup, restore, dan audit log perangkat/IP.

## Akses siap coba

Administrator masuk memakai email dan password:

- Email: `superadmin@eduattend.local`
- Password: `Admin@12345`
- Role login: `Administrator`

Akun guru, wali kelas, kepala sekolah, dan siswa tidak memakai password pada halaman login. Pilih role lalu masukkan NIP/NISN yang sesuai data master.

- Guru Ahmad: NIP `198201012010011001`
- Wali Kelas Siti: NIP `198503122011012002`
- Guru Budi: NIP `197912092008011003`
- Guru Lina: NIP `199004202015032004`
- Kepala Sekolah: NIP `197001011998031001`
- Siswa contoh: NISN `0098765430` sampai `0098765457`
