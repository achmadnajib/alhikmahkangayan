const DB_KEY = "alhikmah_attendance_v1";
const SESSION_KEY = "alhikmah_session_v1";
const YEAR_KEY = "alhikmah_selected_academic_year";
const NOTIF_SENT_KEY = "alhikmah_notification_sent_v1";
const HEADMASTER_UNIT_KEY = "alhikmah_headmaster_active_unit";
const ACTIVE_UNIT_KEY = "alhikmah_active_unit";

const roles = {
  super_admin: "Administrator",
  guru: "Guru",
  wali_kelas: "Wali Kelas",
  kepala_sekolah: "Kepala Sekolah",
  siswa: "Siswa",
  wali_murid: "Wali Murid"
};

const statusLabels = {
  belum: "Belum Absen",
  hadir: "Hadir",
  terlambat: "Terlambat",
  izin: "Izin",
  sakit: "Sakit",
  alfa: "Alfa",
  pending: "Menunggu",
  approved: "Disetujui",
  rejected: "Ditolak",
  cancelled: "Dibatalkan",
  open: "Terbuka",
  closed: "Ditutup"
};

const tables = [
  "users", "roles", "permissions", "students", "student_class_histories", "teachers",
  "classes", "subjects", "schedules", "academic_years", "semesters",
  "attendance_sessions", "attendance_records", "leave_requests", "attendance_logs",
  "holidays", "lesson_hours", "settings", "notifications", "meetings",
  "rank_periods", "rank_results"
];

const schemas = {
  academic_years: {
    title: "Tahun Ajaran",
    subtitle: "Kelola periode tahun ajaran aktif sekolah.",
    fields: [
      ["name", "Tahun Ajaran", "text", true],
      ["start_date", "Tanggal Mulai", "date", true],
      ["end_date", "Tanggal Selesai", "date", true],
      ["is_active", "Status Aktif", "select", true, [["true", "Aktif"], ["false", "Nonaktif"]]]
    ],
    columns: [["name", "Tahun Ajaran"], ["start_date", "Mulai"], ["end_date", "Selesai"], ["is_active", "Status", boolText]]
  },
  semesters: {
    title: "Semester",
    subtitle: "Semester harus terhubung ke tahun ajaran.",
    fields: [
      ["academic_year_id", "Tahun Ajaran", "ref:academic_years", true],
      ["name", "Semester", "select", true, [["Ganjil", "Ganjil"], ["Genap", "Genap"]]],
      ["start_date", "Tanggal Mulai", "date", true],
      ["end_date", "Tanggal Selesai", "date", true],
      ["is_active", "Status Aktif", "select", true, [["true", "Aktif"], ["false", "Nonaktif"]]]
    ],
    columns: [["name", "Semester"], ["academic_year_id", "Tahun Ajaran", refName("academic_years")], ["start_date", "Mulai"], ["end_date", "Selesai"], ["is_active", "Status", boolText]]
  },
  teachers: {
    title: "Guru",
    subtitle: "Data guru, akun login, dan status wali kelas.",
    fields: [
      ["name", "Nama Lengkap", "text", true],
      ["phone", "Nomor HP", "text", false],
      ["staff_role", "Jabatan Login", "select", true, [["guru", "Guru"], ["wali_kelas", "Wali Kelas"], ["kepala_sekolah", "Kepala Sekolah"]]],
      ["identity_type", "Jenis Identitas", "select", true, [["NIP", "NIP"], ["NUPTK", "NUPTK"], ["NIY", "NIY"], ["ID", "ID Internal"]]],
      ["identity_number", "Nomor Identitas", "text", true],
      ["unit", "Unit Lembaga", "select", false, educationUnitOptions(true)],
      ["units", "Unit Akses Kepala Sekolah", "unit_access", false],
      ["address", "Alamat", "textarea", false],
      ["active", "Status Aktif", "select", true, [["true", "Aktif"], ["false", "Nonaktif"]]],
      ["login_enabled", "Akun Login", "select", true, [["true", "Aktif"], ["false", "Nonaktif"]]],
      ["is_homeroom", "Role Wali Kelas", "select", true, [["false", "Tidak"], ["true", "Ya"]]]
    ],
    columns: [["identity_number", "Nomor Identitas", teacherIdentityText], ["name", "Nama"], ["staff_role", "Jabatan", roleLabel], ["unit", "Unit"], ["units", "Unit Akses", headmasterUnitsText], ["phone", "HP"], ["active", "Status", boolText], ["is_homeroom", "Wali Kelas", boolText]]
  },
  classes: {
    title: "Kelas",
    subtitle: "Kelas disimpan per semester agar riwayat absensi lama aman.",
    fields: [
      ["name", "Nama Kelas", "text", true],
      ["unit", "Unit Lembaga", "select", true, educationUnitOptions()],
      ["level", "Tingkat", "select", true, classLevelOptions()],
      ["major", "Jurusan", "text", false],
      ["academic_year_id", "Tahun Ajaran", "ref:academic_years", true],
      ["semester_id", "Semester", "ref:semesters", true],
      ["homeroom_teacher_id", "Wali Kelas", "ref:teachers", false]
    ],
    columns: [["name", "Kelas"], ["unit", "Unit"], ["level", "Tingkat"], ["major", "Jurusan"], ["academic_year_id", "Tahun Ajaran", refName("academic_years")], ["semester_id", "Semester", refName("semesters")], ["homeroom_teacher_id", "Wali Kelas", refName("teachers")]]
  },
  subjects: {
    title: "Mata Pelajaran",
    subtitle: "Kelola kode, nama, dan kelompok mapel.",
    fields: [
      ["code", "Kode Mapel", "text", true],
      ["name", "Nama Mapel", "text", true],
      ["group", "Kelompok Mapel", "text", false],
      ["active", "Status Aktif", "select", true, [["true", "Aktif"], ["false", "Nonaktif"]]]
    ],
    columns: [["code", "Kode"], ["name", "Nama"], ["group", "Kelompok"], ["active", "Status", boolText]]
  },
  lesson_hours: {
    title: "Jam Pelajaran",
    subtitle: "Template jam pelajaran untuk membantu penyusunan jadwal.",
    fields: [
      ["name", "Nama Jam", "text", true],
      ["start_time", "Jam Mulai", "time", true],
      ["end_time", "Jam Selesai", "time", true]
    ],
    columns: [["name", "Nama"], ["start_time", "Mulai"], ["end_time", "Selesai"]]
  },
  schedules: {
    title: "Jadwal Pelajaran",
    subtitle: "Sesi absensi selalu dibuat dari jadwal aktif.",
    fields: [
      ["academic_year_id", "Tahun Ajaran", "ref:academic_years", true],
      ["semester_id", "Semester", "ref:semesters", true],
      ["class_id", "Kelas", "ref:classes", true],
      ["subject_id", "Mata Pelajaran", "ref:subjects", true],
      ["teacher_id", "Guru", "ref:teachers", true],
      ["day", "Hari", "select", true, [["Senin", "Senin"], ["Selasa", "Selasa"], ["Rabu", "Rabu"], ["Kamis", "Kamis"], ["Jumat", "Jumat"], ["Sabtu", "Sabtu"], ["Minggu", "Minggu"]]],
      ["lesson_hour_id", "Jam Pelajaran", "lesson_hour", true],
      ["room", "Ruang", "text", false],
      ["active", "Status Aktif", "select", true, [["true", "Aktif"], ["false", "Nonaktif"]]]
    ],
    columns: [["day", "Hari"], ["class_id", "Kelas", refName("classes")], ["subject_id", "Mapel", refName("subjects")], ["teacher_id", "Guru", refName("teachers")], ["start_time", "Mulai"], ["end_time", "Selesai"], ["active", "Status", boolText]]
  },
  holidays: {
    title: "Hari Libur",
    subtitle: "Hari libur tidak dihitung sebagai sesi wajib dan tidak membuat alfa otomatis.",
    fields: [
      ["date", "Tanggal", "date", true],
      ["name", "Nama Libur", "text", true],
      ["type", "Jenis Libur", "select", true, [["nasional", "Nasional"], ["sekolah", "Sekolah"], ["ujian", "Ujian"], ["kegiatan", "Kegiatan"]]],
      ["note", "Keterangan", "textarea", false]
    ],
    columns: [["date", "Tanggal"], ["name", "Nama"], ["type", "Jenis"], ["note", "Keterangan"]]
  },
  students: {
    title: "Siswa",
    subtitle: "Setiap siswa memiliki satu QR token unik permanen.",
    fields: [
      ["nis", "NIS", "text", true], ["nisn", "NISN", "text", false], ["name", "Nama Siswa", "text", true],
      ["gender", "Jenis Kelamin", "select", true, [["L", "Laki-laki"], ["P", "Perempuan"]]],
      ["birth_place", "Tempat Lahir", "text", false], ["birth_date", "Tanggal Lahir", "date", false],
      ["address", "Alamat", "textarea", false], ["father_name", "Nama Ayah", "text", false], ["mother_name", "Nama Ibu", "text", false],
      ["parent_phone", "Nomor HP Orang Tua", "text", false], ["login_enabled", "Akun Login", "select", true, [["true", "Aktif"], ["false", "Nonaktif"]]], ["photo", "Foto Siswa", "image", false],
      ["active_class_id", "Kelas Aktif", "ref:classes", true], ["active_academic_year_id", "Tahun Ajaran Aktif", "ref:academic_years", true],
      ["status", "Status Siswa", "select", true, [["aktif", "Aktif"], ["pindah", "Pindah"], ["lulus", "Lulus"], ["keluar", "Keluar"]]]
    ],
    columns: [
      ["nis", "NIS"], ["nisn", "NISN"], ["name", "Nama"],
      ["active_class_id", "Kelas", refName("classes")],
      ["active_class_id", "Semester", (_, row) => escapeHtml(classSemesterName(row.active_class_id))],
      ["active_academic_year_id", "Tahun Ajaran", refName("academic_years")],
      ["status", "Status"], ["qr_token", "QR Token"]
    ]
  },
  leave_requests: {
    title: "Izin dan Sakit",
    subtitle: "Persetujuan izin/sakit diterapkan hanya pada sesi yang sesuai tanggal.",
    fields: [
      ["student_id", "Siswa", "ref:students", true], ["class_id", "Kelas Saat Pengajuan", "ref:classes", true],
      ["academic_year_id", "Tahun Ajaran", "ref:academic_years", true], ["semester_id", "Semester", "ref:semesters", true],
      ["leave_type", "Jenis", "select", true, [["izin", "Izin"], ["sakit", "Sakit"]]], ["start_date", "Tanggal Mulai", "date", true],
      ["end_date", "Tanggal Selesai", "date", true], ["reason", "Alasan", "textarea", true], ["attachment", "Bukti Surat", "image", false],
      ["status", "Status", "select", true, [["pending", "Menunggu"], ["approved", "Disetujui"], ["rejected", "Ditolak"], ["cancelled", "Dibatalkan"]]],
      ["approval_note", "Catatan Persetujuan", "textarea", false]
    ],
    columns: [["student_id", "Siswa", refName("students")], ["leave_type", "Jenis"], ["start_date", "Mulai"], ["end_date", "Selesai"], ["attachment", "Bukti", evidenceLink], ["status", "Status"], ["approved_by", "Disetujui Oleh", refName("users")]]
  },
  settings: {
    title: "Pengaturan Absensi",
    subtitle: "Atur toleransi keterlambatan dan identitas cetak laporan.",
    fields: [
      ["school_name", "Nama Sekolah", "text", true],
      ["school_logo", "Logo Sekolah", "image", false],
      ["school_website", "Website Sekolah", "text", false],
      ["school_phone", "Nomor Telepon Sekolah", "text", false],
      ["headmaster_name", "Nama Kepala Sekolah", "text", false],
      ["late_tolerance_minutes", "Toleransi Terlambat (Menit)", "number", true],
      ["parent_portal", "Portal Orang Tua", "select", true, [["false", "Nonaktif"], ["true", "Aktif"]]]
    ],
    columns: [["school_name", "Sekolah"], ["school_website", "Website"], ["school_phone", "Telepon"], ["headmaster_name", "Kepala Sekolah"], ["late_tolerance_minutes", "Toleransi"], ["parent_portal", "Portal Orang Tua", boolText]]
  },
  meetings: {
    title: "Rapat",
    subtitle: "Kirim undangan rapat ke guru dan wali kelas.",
    fields: [
      ["title", "Tujuan Rapat", "text", true],
      ["date", "Tanggal Rapat", "date", true],
      ["time", "Jam Rapat", "time", true],
      ["location", "Tempat / Link", "text", false],
      ["agenda", "Detail Rapat", "textarea", true],
      ["status", "Status", "select", true, [["scheduled", "Terjadwal"], ["cancelled", "Dibatalkan"], ["done", "Selesai"]]]
    ],
    columns: [["title", "Tujuan"], ["date", "Tanggal"], ["time", "Jam"], ["location", "Tempat"], ["status", "Status"]]
  }
};

const state = { db: null, session: null, page: "dashboard", filters: {}, selectedAcademicYearId: "", videoStream: null, remoteDb: false, remoteRevision: 0, remoteUpdatedAt: "", remoteSyncing: false, lastRemoteSync: 0, saveTimer: null, notificationTimer: null, modalHistoryOpen: false };

document.addEventListener("DOMContentLoaded", init);

function educationUnitOptions(includeAll = false) {
  const options = [["PAUD", "PAUD"], ["MI", "MI"], ["SMP", "SMP"], ["SMA", "SMA"]];
  return includeAll ? [["", "Lintas Unit"], ...options] : options;
}

function classLevelOptions() {
  return [["PAUD", "PAUD"], ...Array.from({ length: 12 }, (_, index) => {
    const level = String(index + 1);
    return [level, `Kelas ${level}`];
  })];
}

function classLevelOptionsForUnit(unit = "") {
  if (!unit) return classLevelOptions();
  if (unit === "PAUD") return [["PAUD", "PAUD"]];
  const range = unit === "MI" ? [1, 6] : unit === "SMP" ? [7, 9] : unit === "SMA" ? [10, 12] : [1, 12];
  return Array.from({ length: range[1] - range[0] + 1 }, (_, index) => {
    const level = String(range[0] + index);
    return [level, `Kelas ${level}`];
  });
}

function normalizeClassLevelFilter(unit, level) {
  return classLevelOptionsForUnit(unit).some(([value]) => value === level) ? level : "";
}

function classUnit(cls = {}) {
  if (cls.unit) return cls.unit;
  const text = `${cls.level || ""} ${cls.name || ""} ${cls.major || ""}`.toLowerCase();
  if (/(paud|tk|ra|kb)/.test(text)) return "PAUD";
  const number = Number(String(cls.level || cls.name || "").match(/\d+/)?.[0] || 0);
  if (number >= 1 && number <= 6) return "MI";
  if (number >= 7 && number <= 9) return "SMP";
  if (number >= 10 && number <= 12) return "SMA";
  return "MI";
}

function classLevelValue(cls = {}) {
  const text = String(cls.level || cls.name || "");
  if (/(paud|tk|ra|kb)/i.test(text)) return "PAUD";
  return text.match(/\d+/)?.[0] || String(cls.level || "");
}

function classSimpleLabel(cls) {
  if (!cls) return "";
  const unit = classUnit(cls);
  return [cls.name || "", unit ? `(${unit})` : ""].filter(Boolean).join(" ");
}

function headmasterUnit() {
  const user = currentUser?.();
  return user?.role === "kepala_sekolah" ? activeUnit() : "";
}

function headmasterUnitStorageKey(user = currentUser?.()) {
  return activeUnitStorageKey(user, HEADMASTER_UNIT_KEY);
}

function headmasterUnits(teacher = null) {
  const user = currentUser?.();
  const source = teacher || (user?.role === "kepala_sekolah" ? findById?.("teachers", user.teacher_id) : null);
  if (!source) return [];
  const raw = String(source.units || source.unit || "")
    .split(/[,\s|/]+/)
    .map(unit => unit.trim().toUpperCase())
    .filter(Boolean);
  const valid = educationUnitOptions().map(([value]) => value);
  return [...new Set(raw.filter(unit => valid.includes(unit)))];
}

function headmasterUnitsText(value, row) {
  const units = headmasterUnits(row);
  return escapeHtml(units.join(", ") || row?.unit || "-");
}

function teacherIdentityText(value, row) {
  return escapeHtml([row?.identity_type || "NIP", row?.identity_number || row?.nip || ""].filter(Boolean).join(" "));
}

function activeUnitStorageKey(user = currentUser?.(), prefix = ACTIVE_UNIT_KEY) {
  return `${prefix}_${user?.role || "role"}_${user?.teacher_id || user?.student_id || user?.id || "default"}`;
}

function scheduleUnitsForTeacher(teacherId) {
  const classById = new Map(state.db.classes.filter(cls => !cls.deleted_at).map(cls => [cls.id, cls]));
  const valid = new Set(educationUnitOptions().map(([unit]) => unit));
  return [...new Set(state.db.schedules
    .filter(schedule => !schedule.deleted_at && schedule.active !== "false" && schedule.teacher_id === teacherId)
    .map(schedule => classUnit(classById.get(schedule.class_id)))
    .filter(unit => valid.has(unit)))];
}

function homeroomUnitsForTeacher(teacherId) {
  const valid = new Set(educationUnitOptions().map(([unit]) => unit));
  return [...new Set(state.db.classes
    .filter(cls => !cls.deleted_at && cls.homeroom_teacher_id === teacherId)
    .map(cls => classUnit(cls))
    .filter(unit => valid.has(unit)))];
}

function accessUnitsForUser(user = currentUser?.()) {
  if (!user) return [];
  if (user.role === "kepala_sekolah") return headmasterUnits(findById("teachers", user.teacher_id));
  if (user.role === "guru") return scheduleUnitsForTeacher(user.teacher_id);
  if (user.role === "wali_kelas") return homeroomUnitsForTeacher(user.teacher_id);
  if (user.role === "siswa") {
    const student = findById("students", user.student_id);
    const cls = student ? findById("classes", student.active_class_id) : null;
    return cls ? [classUnit(cls)] : [];
  }
  return [];
}

function activeUnit(user = currentUser?.()) {
  const units = accessUnitsForUser(user);
  if (!units.length) return "";
  const stored = localStorage.getItem(activeUnitStorageKey(user));
  return units.includes(stored) ? stored : units[0];
}

function filterClassesForRole(classes) {
  const unit = activeUnit();
  return unit ? classes.filter(cls => classUnit(cls) === unit) : classes;
}

function emptyDb() {
  const db = {};
  tables.forEach(t => db[t] = []);
  db.roles = Object.entries(roles).map(([id, name]) => ({ id, name }));
  db.permissions = [
    { id: uid("perm"), role: "super_admin", scope: "all" },
    { id: uid("perm"), role: "guru", scope: "teaching_attendance" },
    { id: uid("perm"), role: "wali_kelas", scope: "homeroom_reports" },
    { id: uid("perm"), role: "kepala_sekolah", scope: "all_reports" }
  ];
  db.settings = [{ id: uid("set"), school_name: "", school_website: "", school_phone: "", headmaster_name: "", late_tolerance_minutes: 15, parent_portal: "false", created_at: now(), updated_at: now() }];
  seedStarterData(db);
  return db;
}

async function init() {
  state.db = await loadDb();
  state.selectedAcademicYearId = resolveStoredAcademicYearId();
  state.session = validateStoredSession(loadSession());
  bindAuth();
  bindShell();
  startTableLabelObserver();
  if (!state.db.users.length) showSetup();
  else if (!state.session) showLogin();
  else showApp();
}

async function loadDb() {
  try {
    const response = await fetch("/api/state", { cache: "no-store" });
    if (response.ok) {
      state.remoteDb = true;
      const payload = await response.json();
      state.remoteRevision = Number(payload.revision || 0);
      state.remoteUpdatedAt = payload.updated_at || "";
      const localRaw = localStorage.getItem(DB_KEY);
      const sourceDb = payload.db || (localRaw ? JSON.parse(localRaw) : emptyDb());
      const beforeNormalize = JSON.stringify(sourceDb);
      const db = normalizeDb(sourceDb);
      if (!payload.db) await persistRemoteDb(db);
      else if (JSON.stringify(db) !== beforeNormalize) await persistRemoteDb(db);
      localStorage.setItem(DB_KEY, JSON.stringify(db));
      return db;
    }
  } catch (error) {
    console.warn("Remote database tidak tersedia, memakai localStorage.", error);
  }
  state.remoteDb = false;
  const raw = localStorage.getItem(DB_KEY);
  if (!raw) return emptyDb();
  const db = JSON.parse(raw);
  return normalizeDb(db, true);
}

function normalizeDb(db, persistLocal = false) {
  tables.forEach(t => db[t] ||= []);
  removeDeprecatedRoles(db);
  removeNonAdminEmails(db);
  normalizeTeacherRoles(db);
  normalizeLeaveRequests(db);
  repairDeletedReferences(db);
  repairAdminRole(db);
  ensureStarterAccess(db);
  if (!db.students.length && !db.teachers.length) {
    seedStarterData(db);
  }
  if (persistLocal) localStorage.setItem(DB_KEY, JSON.stringify(db));
  return db;
}

function removeNonAdminEmails(db) {
  db.students.forEach(s => delete s.email);
  db.teachers.forEach(t => delete t.email);
  db.users.forEach(u => {
    if (u.role !== "super_admin") delete u.email;
  });
}

function repairDeletedReferences(db) {
  db.students.forEach(student => {
    const hasValidPlacement = studentHasActivePlacement(student, db);
    if (student.deleted_at || student.status !== "aktif" || student.login_enabled === "false" || !hasValidPlacement) {
      student.login_enabled = "false";
      db.users.filter(user => user.student_id === student.id).forEach(user => {
        user.active = "false";
        user.updated_at ||= now();
      });
      db.student_class_histories.forEach(history => {
        if (history.student_id === student.id && history.status === "aktif") {
          history.status = "selesai";
          history.end_date ||= today();
          history.updated_at ||= now();
        }
      });
    }
  });
  db.teachers.forEach(teacher => {
    if (teacher.deleted_at || teacher.active === "false" || teacher.login_enabled === "false") {
      db.users.filter(user => user.teacher_id === teacher.id).forEach(user => {
        user.active = "false";
        user.updated_at ||= now();
      });
    }
  });
  db.classes.forEach(cls => {
    if (!cls.deleted_at) return;
    db.schedules.filter(schedule => schedule.class_id === cls.id && !schedule.deleted_at).forEach(schedule => {
      schedule.deleted_at = schedule.deleted_at || now();
      schedule.updated_at ||= now();
    });
    db.student_class_histories.forEach(history => {
      if (history.class_id === cls.id && history.status === "aktif") {
        history.status = "selesai";
        history.end_date ||= today();
        history.updated_at ||= now();
      }
    });
  });
  db.schedules.forEach(schedule => {
    if (!schedule.deleted_at) return;
    db.attendance_sessions.filter(session => session.schedule_id === schedule.id && session.status !== "cancelled").forEach(session => {
      session.status = "cancelled";
      session.closed_at ||= now();
      session.updated_at ||= now();
    });
  });
}

function studentHasActivePlacement(student, db = state.db) {
  if (!student || !db) return false;
  const cls = db.classes?.find(item => item.id === student.active_class_id);
  if (!cls || cls.deleted_at || cls.active === "false" || cls.status === "lulus") return false;
  if (student.active_academic_year_id && cls.academic_year_id !== student.active_academic_year_id) return false;
  return db.student_class_histories?.some(history =>
    !history.deleted_at &&
    history.student_id === student.id &&
    history.class_id === cls.id &&
    history.academic_year_id === cls.academic_year_id &&
    history.semester_id === cls.semester_id &&
    history.status === "aktif"
  );
}

function normalizeLeaveRequests(db) {
  db.leave_requests.forEach(leave => {
    if (!leave.status) leave.status = "pending";
    if (!leave.end_date) leave.end_date = leave.start_date || leave.tanggal || today();
    if (!leave.start_date) leave.start_date = leave.tanggal || leave.end_date || today();
    if (!leave.leave_type && leave.jenis) leave.leave_type = leave.jenis;
    if (!leave.reason && leave.keterangan) leave.reason = leave.keterangan;
  });
}

function startTableLabelObserver() {
  const view = byId("view");
  if (!view || view.dataset.tableObserverReady === "true") return;
  view.dataset.tableObserverReady = "true";
  const decorate = () => decorateResponsiveTables(view);
  new MutationObserver(decorate).observe(view, { childList: true, subtree: true });
  decorate();
}

function decorateResponsiveTables(root = document) {
  root.querySelectorAll("table").forEach(table => {
    const headers = Array.from(table.querySelectorAll("thead th")).map(th => th.textContent.trim());
    if (!headers.length) return;
    table.querySelectorAll("tbody tr").forEach(row => {
      Array.from(row.children).forEach((cell, index) => {
        if (cell.tagName === "TD" && !cell.dataset.label) cell.dataset.label = headers[index] || "";
      });
    });
  });
}

function normalizeTeacherRoles(db) {
  db.teachers.forEach(teacher => {
    const linkedUser = db.users.find(user => user.teacher_id === teacher.id && ["guru", "wali_kelas", "kepala_sekolah"].includes(user.role));
    teacher.staff_role ||= linkedUser?.role || (teacher.is_homeroom === "true" ? "wali_kelas" : "guru");
    teacher.identity_type ||= teacher.nip ? "NIP" : "ID";
    teacher.identity_number ||= teacher.nip || "";
    teacher.nip = teacher.identity_number || teacher.nip || "";
    teacher.units = normalizeUnitList(teacher.units || (teacher.staff_role === "kepala_sekolah" ? teacher.unit : ""));
    if (teacher.staff_role === "wali_kelas") teacher.is_homeroom = "true";
    if (teacher.staff_role === "kepala_sekolah") teacher.is_homeroom = "false";
    db.users.filter(user => user.teacher_id === teacher.id).forEach(user => {
      user.nip = teacher.identity_number || teacher.nip || user.nip || "";
      user.identity_type = teacher.identity_type;
      user.identity_number = teacher.identity_number || teacher.nip || user.identity_number || "";
    });
  });
}

function normalizeUnitList(value) {
  const valid = educationUnitOptions().map(([unit]) => unit);
  return [...new Set(String(value || "")
    .split(/[,\s|/]+/)
    .map(unit => unit.trim().toUpperCase())
    .filter(unit => valid.includes(unit)))]
    .join(",");
}

function removeDeprecatedRoles(db) {
  db.users = db.users.filter(u => !["admin", "operator"].includes(u.role));
  db.roles = Object.entries(roles).map(([id, name]) => ({ id, name }));
  db.permissions = db.permissions.filter(p => !["admin", "operator"].includes(p.role));
}

function ensureStarterAccess(db) {
  ensureHeadmasterNip(db);
  if (db.users.some(u => u.email === "superadmin@eduattend.local")) return;
  db.users.push({
    id: "usr_super_admin_starter",
    name: "Administrator EduAttend",
    email: "superadmin@eduattend.local",
    role: "super_admin",
    active: "true",
    password_hash: "6f2cb9dd8f4b65e24e1c3f3fa5bc57982349237f11abceacd45bbcb74d621c25",
    created_at: now(),
    updated_at: now()
  });
}

function ensureHeadmasterNip(db) {
  let headTeacher = db.teachers.find(t => t.id === "t_kepsek") || db.teachers.find(t => t.nip === "197001011998031001");
  if (!headTeacher) {
    headTeacher = {
      id: "t_kepsek",
      nip: "197001011998031001",
      name: "Drs. Hendra Saputra",
      phone: "081234560099",
      address: "Jl. Pendidikan Nasional No. 1",
      active: "true",
      login_enabled: "true",
      is_homeroom: "false",
      created_at: now(),
      updated_at: now()
    };
    db.teachers.push(headTeacher);
  }
  const user = db.users.find(u => u.role === "kepala_sekolah" && (u.teacher_id === headTeacher.id || u.name === "Drs. Hendra Saputra"));
  if (user) {
    user.teacher_id = headTeacher.id;
    user.nip = headTeacher.nip;
    user.updated_at = now();
  }
}

function seedStarterData(db) {
  const ts = now();
  const pass = "ff7bd97b1a7789ddd2775122fd6817f3173672da9f802ceec57f284325bf589f";
  const adminPass = "6f2cb9dd8f4b65e24e1c3f3fa5bc57982349237f11abceacd45bbcb74d621c25";
  db.settings = [{
    id: "set_main",
    school_name: "SMP Negeri EduAttend Pro",
    school_website: "www.eduattend-pro.sch.id",
    school_phone: "(021) 555-0199",
    headmaster_name: "Drs. Hendra Saputra",
    late_tolerance_minutes: 15,
    parent_portal: "true",
    seed_version: "starter-2027",
    created_at: ts,
    updated_at: ts
  }];
  db.academic_years = [{ id: "ay_2026_2027", name: "2026/2027", start_date: "2026-07-01", end_date: "2027-06-30", is_active: "true", created_at: ts, updated_at: ts }];
  db.semesters = [
    { id: "sem_ganjil_2026", academic_year_id: "ay_2026_2027", name: "Ganjil", start_date: "2026-07-01", end_date: "2026-12-20", is_active: "false", created_at: ts, updated_at: ts },
    { id: "sem_genap_2027", academic_year_id: "ay_2026_2027", name: "Genap", start_date: "2027-01-05", end_date: "2027-06-20", is_active: "true", created_at: ts, updated_at: ts }
  ];
  db.teachers = [
    { id: "t_ahmad", nip: "198201012010011001", name: "Guru Ahmad", phone: "081234560001", address: "Jl. Pendidikan No. 12", active: "true", login_enabled: "true", is_homeroom: "false", created_at: ts, updated_at: ts },
    { id: "t_siti", nip: "198503122011012002", name: "Siti Rahmawati", phone: "081234560002", address: "Jl. Melati No. 7", active: "true", login_enabled: "true", is_homeroom: "true", created_at: ts, updated_at: ts },
    { id: "t_budi", nip: "197912092008011003", name: "Budi Santoso", phone: "081234560003", address: "Jl. Merdeka No. 21", active: "true", login_enabled: "true", is_homeroom: "false", created_at: ts, updated_at: ts },
    { id: "t_lina", nip: "199004202015032004", name: "Lina Marlina", phone: "081234560004", address: "Jl. Anggrek No. 9", active: "true", login_enabled: "true", is_homeroom: "false", created_at: ts, updated_at: ts },
    { id: "t_kepsek", nip: "197001011998031001", name: "Drs. Hendra Saputra", phone: "081234560099", address: "Jl. Pendidikan Nasional No. 1", active: "true", login_enabled: "true", is_homeroom: "false", created_at: ts, updated_at: ts }
  ];
  db.classes = [
    { id: "cls_8a_genap", name: "8A", level: "8", major: "Reguler", academic_year_id: "ay_2026_2027", semester_id: "sem_genap_2027", homeroom_teacher_id: "t_siti", created_at: ts, updated_at: ts },
    { id: "cls_7a_genap", name: "7A", level: "7", major: "Reguler", academic_year_id: "ay_2026_2027", semester_id: "sem_genap_2027", homeroom_teacher_id: "t_budi", created_at: ts, updated_at: ts }
  ];
  db.subjects = [
    { id: "sub_math", code: "MATH", name: "Matematika", group: "Wajib", active: "true", created_at: ts, updated_at: ts },
    { id: "sub_bindo", code: "BIN", name: "Bahasa Indonesia", group: "Wajib", active: "true", created_at: ts, updated_at: ts },
    { id: "sub_ipa", code: "IPA", name: "IPA", group: "Wajib", active: "true", created_at: ts, updated_at: ts },
    { id: "sub_bing", code: "ENG", name: "Bahasa Inggris", group: "Wajib", active: "true", created_at: ts, updated_at: ts }
  ];
  db.lesson_hours = [
    { id: "lh_1", name: "Jam 1-2", start_time: "07:00", end_time: "08:30", created_at: ts, updated_at: ts },
    { id: "lh_3", name: "Jam 3-4", start_time: "08:45", end_time: "10:15", created_at: ts, updated_at: ts },
    { id: "lh_5", name: "Jam 5-6", start_time: "10:30", end_time: "12:00", created_at: ts, updated_at: ts }
  ];
  db.schedules = [
    { id: "sch_8a_math_thu", academic_year_id: "ay_2026_2027", semester_id: "sem_genap_2027", class_id: "cls_8a_genap", subject_id: "sub_math", teacher_id: "t_ahmad", day: "Kamis", start_time: "07:00", end_time: "08:30", room: "Ruang 8A", active: "true", created_at: ts, updated_at: ts },
    { id: "sch_8a_bindo_thu", academic_year_id: "ay_2026_2027", semester_id: "sem_genap_2027", class_id: "cls_8a_genap", subject_id: "sub_bindo", teacher_id: "t_siti", day: "Kamis", start_time: "08:45", end_time: "10:15", room: "Ruang 8A", active: "true", created_at: ts, updated_at: ts },
    { id: "sch_8a_ipa_fri", academic_year_id: "ay_2026_2027", semester_id: "sem_genap_2027", class_id: "cls_8a_genap", subject_id: "sub_ipa", teacher_id: "t_budi", day: "Jumat", start_time: "07:00", end_time: "08:30", room: "Lab IPA", active: "true", created_at: ts, updated_at: ts },
    { id: "sch_7a_bing_thu", academic_year_id: "ay_2026_2027", semester_id: "sem_genap_2027", class_id: "cls_7a_genap", subject_id: "sub_bing", teacher_id: "t_lina", day: "Kamis", start_time: "07:00", end_time: "08:30", room: "Ruang 7A", active: "true", created_at: ts, updated_at: ts }
  ];
  db.holidays = [
    { id: "hol_2027_01_01", date: "2027-01-01", name: "Tahun Baru", type: "nasional", note: "Libur nasional", created_at: ts, updated_at: ts },
    { id: "hol_2027_03_19", date: "2027-03-19", name: "Kegiatan Sekolah", type: "kegiatan", note: "Kegiatan yayasan", created_at: ts, updated_at: ts }
  ];
  const studentNames = [
    "Adryan Syahputra", "Bunga Amelia", "Citra Lestari", "Dafa Pratama", "Eka Wulandari", "Farhan Maulana", "Gita Ananda",
    "Hafiz Ramadhan", "Intan Permata", "Joko Firmansyah", "Karin Oktavia", "Lukman Hakim", "Maya Salsabila", "Naufal Rizky",
    "Olivia Putri", "Prasetyo Nugroho", "Qori Azzahra", "Rafi Alfarizi", "Salsa Nuraini", "Tegar Wicaksono", "Ulfa Maharani",
    "Vino Ardana", "Wulan Puspita", "Yusuf Ibrahim", "Zahra Aulia", "Aldi Saputra", "Nadia Kirana", "Rizki Fadillah"
  ];
  db.students = studentNames.map((name, i) => {
    const no = String(i + 1).padStart(3, "0");
    return {
      id: `stu_8a_${no}`,
      nis: `242508${no}`,
      nisn: `0098765${String(430 + i)}`,
      name,
      gender: i % 2 ? "P" : "L",
      birth_place: "Kota Digital",
      birth_date: `2013-${String((i % 12) + 1).padStart(2, "0")}-${String((i % 26) + 1).padStart(2, "0")}`,
      address: `Jl. Siswa No. ${i + 1}`,
      father_name: `Ayah ${name.split(" ")[0]}`,
      mother_name: `Ibu ${name.split(" ")[0]}`,
      parent_phone: `08130000${String(i + 1).padStart(4, "0")}`,
      login_enabled: "true",
      photo: "",
      active_class_id: "cls_8a_genap",
      active_academic_year_id: "ay_2026_2027",
      status: "aktif",
      qr_token: `QR-EDUATTEND-8A-${no}`,
      created_at: ts,
      updated_at: ts
    };
  });
  db.student_class_histories = db.students.map(s => ({ id: `hist_${s.id}`, student_id: s.id, class_id: "cls_8a_genap", academic_year_id: "ay_2026_2027", semester_id: "sem_genap_2027", status: "aktif", start_date: "2027-01-05", end_date: "", created_at: ts }));
  db.leave_requests = [{
    id: "leave_001",
    student_id: "stu_8a_023",
    class_id: "cls_8a_genap",
    academic_year_id: "ay_2026_2027",
    semester_id: "sem_genap_2027",
    leave_type: "izin",
    start_date: today(),
    end_date: today(),
    reason: "Keperluan keluarga yang sudah disetujui wali kelas.",
    attachment: "",
    status: "approved",
    requested_by: "usr_super_admin_starter",
    approved_by: "usr_wali_siti",
    approved_at: ts,
    approval_note: "Disetujui wali kelas.",
    created_at: ts,
    updated_at: ts
  }];
  db.attendance_sessions = [{
    id: "ses_8a_math_today",
    schedule_id: "sch_8a_math_thu",
    teacher_id: "t_ahmad",
    class_id: "cls_8a_genap",
    subject_id: "sub_math",
    academic_year_id: "ay_2026_2027",
    semester_id: "sem_genap_2027",
    date: today(),
    start_time: "07:00",
    end_time: "08:30",
    status: "open",
    opened_by: "usr_guru_ahmad",
    closed_by: "",
    opened_at: ts,
    closed_at: ""
  }];
  const records = [];
  db.students.slice(0, 20).forEach((s, i) => records.push(starterRecord(s, i, i < 10 ? "07:0" + i : "07:" + i, "hadir", "qr", ts)));
  db.students.slice(20, 22).forEach((s, i) => records.push(starterRecord(s, i + 20, `07:${20 + i}`, "terlambat", "qr", ts)));
  records.push(starterRecord(db.students[22], 22, "", "izin", "leave_auto", ts));
  db.attendance_records = records;
  db.attendance_logs = [
    { id: "log_001", attendance_record_id: "rec_022", student_id: "stu_8a_023", old_status: "belum", new_status: "izin", changed_by: "usr_wali_siti", reason: "Izin disetujui sebelum sesi dimulai.", created_at: ts }
  ];
  db.users = [
    { id: "usr_super_admin_starter", name: "Administrator EduAttend", email: "superadmin@eduattend.local", role: "super_admin", active: "true", password_hash: adminPass, created_at: ts, updated_at: ts },
    { id: "usr_kepsek_starter", name: "Drs. Hendra Saputra", role: "kepala_sekolah", teacher_id: "t_kepsek", nip: "197001011998031001", active: "true", password_hash: pass, created_at: ts, updated_at: ts },
    { id: "usr_guru_ahmad", name: "Guru Ahmad", role: "guru", teacher_id: "t_ahmad", active: "true", password_hash: pass, created_at: ts, updated_at: ts },
    { id: "usr_wali_siti", name: "Siti Rahmawati", role: "wali_kelas", teacher_id: "t_siti", active: "true", password_hash: pass, created_at: ts, updated_at: ts },
    { id: "usr_guru_budi", name: "Budi Santoso", role: "guru", teacher_id: "t_budi", active: "true", password_hash: pass, created_at: ts, updated_at: ts },
    { id: "usr_guru_lina", name: "Lina Marlina", role: "guru", teacher_id: "t_lina", active: "true", password_hash: pass, created_at: ts, updated_at: ts },
    ...db.students.map(s => ({ id: `usr_${s.id}`, name: s.name, role: "siswa", student_id: s.id, active: "true", password_hash: pass, created_at: ts, updated_at: ts }))
  ];
}

function starterRecord(student, index, scanTime, status, inputMethod, ts) {
  return {
    id: `rec_${String(index).padStart(3, "0")}`,
    session_id: "ses_8a_math_today",
    student_id: student.id,
    class_id: "cls_8a_genap",
    subject_id: "sub_math",
    teacher_id: "t_ahmad",
    schedule_id: "sch_8a_math_thu",
    academic_year_id: "ay_2026_2027",
    semester_id: "sem_genap_2027",
    date: today(),
    start_time: "07:00",
    end_time: "08:30",
    status,
    scan_time: scanTime,
    input_method: inputMethod,
    note: status === "izin" ? "Izin otomatis dari pengajuan disetujui." : "Data awal siap coba.",
    created_by: inputMethod === "qr" ? "usr_guru_ahmad" : "usr_wali_siti",
    updated_by: inputMethod === "qr" ? "usr_guru_ahmad" : "usr_wali_siti",
    created_at: ts,
    updated_at: ts
  };
}

function repairAdminRole(db) {
  if (!db.users?.length || db.users.some(u => u.role === "super_admin" && u.active !== "false")) return;
  const candidate = db.users.find(u => !u.teacher_id) || db.users[0];
  candidate.role = "super_admin";
  candidate.active = "true";
  candidate.updated_at = now();
}

function saveDb() {
  localStorage.setItem(DB_KEY, JSON.stringify(state.db));
  if (!state.remoteDb) return;
  clearTimeout(state.saveTimer);
  state.saveTimer = setTimeout(() => persistRemoteDb(state.db), 120);
}

async function persistRemoteDb(db) {
  try {
    const response = await fetch("/api/state", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ db })
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const payload = await response.json().catch(() => ({}));
    state.remoteRevision = Number(payload.revision || state.remoteRevision || 0);
    state.remoteUpdatedAt = payload.updated_at || state.remoteUpdatedAt || "";
  } catch (error) {
    console.error("Gagal menyimpan ke database online.", error);
    toast("Database online gagal disimpan. Cek konfigurasi Vercel/Postgres.", "error");
  }
}
function loadSession() { return JSON.parse(localStorage.getItem(SESSION_KEY) || "null"); }
function saveSession(session) { localStorage.setItem(SESSION_KEY, JSON.stringify(session)); state.session = session; }
function validateStoredSession(session) {
  if (session?.role === "wali_murid") {
    const student = state.db.students.find(item => item.id === session.murid_id && studentCanLogin(item));
    if (student) return { ...session, nama_siswa: student.name };
    localStorage.removeItem(SESSION_KEY);
    return null;
  }
  if (!session?.userId) return null;
  const user = state.db.users.find(item => item.id === session.userId && !item.deleted_at && item.active !== "false");
  if (!user || !roles[session.role || user.role] || !canLoginAsRole(user, session.role || user.role) || !linkedLoginTargetActive(user)) {
    localStorage.removeItem(SESSION_KEY);
    return null;
  }
  return session;
}

function linkedLoginTargetActive(user) {
  if (!user || user.deleted_at || user.active === "false") return false;
  if (user.student_id) {
    const student = findById("students", user.student_id);
    return studentCanLogin(student);
  }
  if (user.teacher_id) {
    const teacher = findById("teachers", user.teacher_id);
    return teacherCanLogin(teacher);
  }
  return true;
}

function studentCanLogin(student) {
  return !!student && !student.deleted_at && student.status === "aktif" && student.login_enabled !== "false" && studentHasActivePlacement(student);
}

function teacherCanLogin(teacher) {
  return !!teacher && !teacher.deleted_at && teacher.active !== "false" && teacher.login_enabled !== "false";
}

function ensureSessionStillValid() {
  if (!state.session) return false;
  const valid = validateStoredSession(state.session);
  if (!valid) {
    logoutApp();
    toast("Data login sudah tidak aktif atau sudah dihapus.", "error");
    return false;
  }
  state.session = valid;
  return true;
}
function now() { return new Date().toISOString(); }
function today() { return new Date().toISOString().slice(0, 10); }
function uid(prefix) { return `${prefix}_${crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2)}`; }
async function hashPassword(password) {
  const data = new TextEncoder().encode(password);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, "0")).join("");
}

function bindAuth() {
  byId("login-form").querySelector('[name="role"]').addEventListener("change", updateLoginIdentifierHint);
  byId("login-identifier").addEventListener("input", updateLoginIdentifierHint);
  updateLoginIdentifierHint();
  byId("setup-form").addEventListener("submit", async e => {
    e.preventDefault();
    const fd = formData(e.target);
    const user = { id: uid("usr"), name: fd.name, email: fd.email, role: "super_admin", password_hash: await hashPassword(fd.password), created_at: now(), updated_at: now(), active: "true" };
    state.db.users.push(user);
    state.db.settings[0].school_name = fd.schoolName;
    saveDb();
    saveSession({ userId: user.id });
    toast("Administrator dibuat.", "ok");
    showApp();
  });
  byId("login-form").addEventListener("submit", async e => {
    e.preventDefault();
    const fd = formData(e.target);
    if (fd.role === "wali_murid") return handleParentLogin(fd.email);
    const user = findLoginUser(fd.role, fd.email);
    const effectiveRole = user?.role === "super_admin" ? "super_admin" : fd.role;
    const needsPassword = loginNeedsPassword(effectiveRole);
    if (!user) return toast("Data tidak ditemukan. Periksa kembali nomor identitas Anda.", "error");
    if (user.active === "false") return toast("Akun Anda tidak aktif. Silakan hubungi admin sekolah.", "error");
    if (needsPassword && user.password_hash !== await hashPassword(fd.password)) return toast("Password salah.", "error");
    if (!canLoginAsRole(user, effectiveRole)) return toast(`Akun ini terdaftar sebagai ${roles[user.role]}. Pilih role yang sesuai.`, "error");
    state.page = landingPageForRole(effectiveRole);
    saveSession({
      userId: user.id,
      role: effectiveRole,
      quoteSeed: effectiveRole === "siswa" ? uid("quote") : ""
    });
    showApp();
  });
}

function updateLoginIdentifierHint() {
  const role = byId("login-form")?.querySelector('[name="role"]')?.value;
  const label = byId("login-id-label");
  const input = byId("login-identifier");
  if (!label || !input) return;
  if (role === "siswa") {
    label.textContent = "NISN / NIS";
    input.placeholder = "Masukkan NISN atau NIS";
    byId("login-password-field")?.classList.add("hidden");
    byId("login-password").required = false;
    byId("login-password").value = "";
  } else if (role === "wali_murid") {
    label.textContent = "Nama Siswa";
    input.placeholder = "Masukkan nama siswa";
    byId("login-password-field")?.classList.add("hidden");
    byId("login-password").required = false;
    byId("login-password").value = "";
  } else if (role === "super_admin") {
    label.textContent = "Username / Email Admin";
    input.placeholder = "Masukkan username atau email admin";
    byId("login-password-field")?.classList.remove("hidden");
    byId("login-password").required = true;
  } else if (role === "kepala_sekolah") {
    label.textContent = "NIP / NUPTK / NIY / ID";
    input.placeholder = "Masukkan NIP, NUPTK, NIY, atau ID";
    byId("login-password-field")?.classList.add("hidden");
    byId("login-password").required = false;
    byId("login-password").value = "";
  } else {
    label.textContent = "NIP / NUPTK / NIY / ID";
    input.placeholder = "Masukkan NIP, NUPTK, NIY, atau ID";
    byId("login-password-field")?.classList.add("hidden");
    byId("login-password").required = false;
    byId("login-password").value = "";
  }
}

function loginNeedsPassword(role) {
  return role === "super_admin";
}

function handleParentLogin(identifier) {
  const matches = findStudentsByParentLogin(identifier);
  if (!matches.length) return toast("Nama siswa tidak ditemukan.", "error");
  if (matches.length === 1) return loginAsParent(matches[0]);
  showParentStudentChooser(matches);
}

function findStudentsByParentLogin(identifier) {
  const value = String(identifier || "").trim().toLowerCase().replace(/\s+/g, " ");
  if (!value) return [];
  const activeStudents = state.db.students.filter(studentCanLogin);
  const exact = activeStudents.filter(student => String(student.name || "").trim().toLowerCase().replace(/\s+/g, " ") === value);
  return exact.length ? exact : activeStudents.filter(student => String(student.name || "").toLowerCase().includes(value));
}

function loginAsParent(student) {
  if (!studentCanLogin(student)) return toast("Data siswa sudah tidak aktif atau sudah dihapus.", "error");
  state.page = "dashboard";
  saveSession({
    role: "wali_murid",
    murid_id: student.id,
    nama_siswa: student.name,
    quoteSeed: uid("parent")
  });
  showApp();
  toast(`Masuk sebagai wali ${student.name}.`, "ok");
}

function showParentStudentChooser(students) {
  modal("Pilih Siswa", `<div class="parent-choice-list">
    <p class="muted">Nama siswa ditemukan lebih dari satu. Pilih anak yang ingin dipantau.</p>
    ${students.map(student => {
      const cls = studentClassForSelectedYear(student) || findById("classes", student.active_class_id);
      return `<button type="button" class="parent-choice-card" data-parent-student="${student.id}">
        <strong>${escapeHtml(student.name)}</strong>
        <span>${escapeHtml(displayName("classes", cls) || "-")} · ${escapeHtml(student.nis || student.id)}</span>
        <small>Wali: ${escapeHtml(parentNameForStudent(student) || "-")} · ${escapeHtml(shortAddress(student.address) || "-")}</small>
      </button>`;
    }).join("")}
  </div>`);
  byId("modal-backdrop").querySelectorAll("[data-parent-student]").forEach(button => {
    button.onclick = () => {
      const student = findById("students", button.dataset.parentStudent);
      if (!student) return toast("Siswa tidak ditemukan.", "error");
      closeModal({ fromPopState: true });
      loginAsParent(student);
    };
  });
}

function parentNameForStudent(student = {}) {
  return student.guardian_name || student.parent_name || student.father_name || student.mother_name || "";
}

function shortAddress(address = "") {
  const text = String(address || "").trim();
  return text.length > 48 ? `${text.slice(0, 48)}...` : text;
}

function findLoginUser(role, identifier) {
  const value = String(identifier || "").trim().toLowerCase();
  if (role === "super_admin") {
    return state.db.users.find(u =>
      u.role === "super_admin" &&
      !u.deleted_at &&
      [u.email, u.username, u.name].some(item => String(item || "").toLowerCase() === value)
    ) || null;
  }
  if (role === "siswa") {
    const student = state.db.students.find(s => studentCanLogin(s) && [s.nisn, s.nis].some(item => String(item || "").toLowerCase() === value));
    const user = student ? state.db.users.find(u => !u.deleted_at && u.active !== "false" && u.student_id === student.id) : null;
    return user && linkedLoginTargetActive(user) ? user : null;
  }
  if (["guru", "wali_kelas", "kepala_sekolah"].includes(role)) {
    if (role === "kepala_sekolah" && value.includes("@")) {
      return state.db.users.find(u => u.role === "super_admin" && !u.deleted_at && u.active !== "false" && u.email?.toLowerCase() === value) || null;
    }
    const teacher = state.db.teachers.find(t => teacherIdentityMatches(t, value) && teacherCanLogin(t));
    if (!teacher) return null;
    const linkedUsers = state.db.users.filter(u => !u.deleted_at && u.active !== "false" && u.teacher_id === teacher.id);
    const linked = linkedUsers.find(u => u.role === role) || linkedUsers[0] || null;
    if (role === "wali_kelas") {
      const homeroom = teacher.is_homeroom === "true" || state.db.classes.some(cls => !cls.deleted_at && cls.homeroom_teacher_id === teacher.id);
      return homeroom && linked && linkedLoginTargetActive(linked) ? linked : null;
    }
    if (role === "guru") {
      const teaches = state.db.schedules.some(schedule => !schedule.deleted_at && schedule.teacher_id === teacher.id);
      return teaches && linked && linkedLoginTargetActive(linked) ? linked : null;
    }
    if (role === "kepala_sekolah") {
      const user = linkedUsers.find(u => u.role === "kepala_sekolah") || state.db.users.find(u => !u.deleted_at && u.active !== "false" && u.role === "kepala_sekolah" && [u.nip, u.identity_number].some(item => String(item || "").toLowerCase() === value));
      return user && linkedLoginTargetActive(user) ? user : null;
    }
  }
  return null;
}

function teacherIdentityMatches(teacher, value) {
  return [teacher.identity_number, teacher.nip, teacher.nuptk, teacher.niy, teacher.internal_id]
    .some(item => String(item || "").trim().toLowerCase() === value);
}

function canLoginAsRole(user, role) {
  if (user.role === role) return true;
  if (user.teacher_id && ["guru", "wali_kelas"].includes(role)) {
    const teacher = findById("teachers", user.teacher_id);
    if (!teacherCanLogin(teacher)) return false;
    if (role === "wali_kelas") return teacher.is_homeroom === "true" || state.db.classes.some(cls => !cls.deleted_at && cls.homeroom_teacher_id === teacher.id);
    return state.db.schedules.some(schedule => !schedule.deleted_at && schedule.teacher_id === teacher.id);
  }
  return false;
}

function bindShell() {
  byId("logout").onclick = logoutApp;
  byId("menu-toggle").onclick = () => document.querySelector(".sidebar").classList.toggle("open");
  window.addEventListener("popstate", handleAppBack);
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) refreshRemoteDbForAccess({ force: true });
  });
  let lastMobileState = isMobileViewport();
  window.addEventListener("resize", () => {
    const nextMobileState = isMobileViewport();
    if (!state.session || nextMobileState === lastMobileState) return;
    lastMobileState = nextMobileState;
    renderMenu();
  });
}

function handleAppBack(event) {
  if (byId("modal-backdrop")) {
    closeModal({ fromPopState: true });
    return;
  }
  const targetPage = event.state?.page;
  if (state.session && targetPage && targetPage !== state.page) {
    state.page = targetPage;
    renderMenu();
    navigate(targetPage, { replaceHistory: true });
  }
}

function logoutApp() {
  localStorage.removeItem(SESSION_KEY);
  stopCamera();
  closeModal({ fromPopState: true });
  if (state.notificationTimer) clearInterval(state.notificationTimer);
  state.notificationTimer = null;
  state.session = null;
  state.page = "dashboard";
  byId("view").innerHTML = "";
  byId("menu").innerHTML = "";
  byId("mobile-school-bar").innerHTML = "";
  byId("active-user").textContent = "";
  byId("active-role").textContent = "";
  document.querySelector(".sidebar")?.classList.remove("open");
  showLogin();
}

function showSetup() { byId("auth").classList.remove("hidden"); byId("app").classList.add("hidden"); byId("setup-form").classList.remove("hidden"); byId("login-form").classList.add("hidden"); }
function showLogin() {
  byId("app").classList.add("hidden");
  byId("auth").classList.remove("hidden");
  byId("setup-form").classList.add("hidden");
  byId("login-form").classList.remove("hidden");
  document.querySelector(".sidebar")?.classList.remove("open");
  applySchoolBrand();
}
function showApp() {
  if (!ensureSessionStillValid()) return;
  byId("auth").classList.add("hidden");
  byId("app").classList.remove("hidden");
  applySchoolBrand();
  const user = currentUser();
  if (!user) return logoutApp();
  byId("active-user").textContent = user.name;
  byId("active-role").textContent = roles[user.role];
  updateMobileSchoolBar();
  renderMenu();
  startNotificationEngine();
  primeAppHistory();
  navigate(state.page, { replaceHistory: true });
}

function primeAppHistory() {
  if (!state.session || !history.replaceState || !history.pushState) return;
  const appState = { app: "alhikmah", page: state.page };
  history.replaceState(appState, "", location.href);
  if (history.state?.app === "alhikmah" && !history.state.modal) history.pushState(appState, "", location.href);
}

function applySchoolBrand() {
  const setting = state.db.settings?.[0] || {};
  const name = setting.school_name || "EduAttend Pro";
  document.querySelectorAll(".login-brand strong, .brand strong").forEach(el => {
    el.textContent = name;
  });
  document.querySelectorAll(".logo-mark").forEach(el => {
    el.innerHTML = schoolLogoHtml();
  });
  document.querySelectorAll(".brand").forEach(el => {
    let logo = el.querySelector(".brand-logo-image");
    if (!logo) {
      logo = document.createElement("span");
      logo.className = "brand-logo-image";
      el.prepend(logo);
    }
    logo.innerHTML = schoolLogoHtml();
  });
  updateMobileSchoolBar();
}

function schoolLogoHtml(className = "school-logo-image") {
  const setting = state.db.settings?.[0] || {};
  const name = setting.school_name || "EduAttend Pro";
  if (setting.school_logo) return `<img class="${escapeHtml(className)}" src="${escapeHtml(setting.school_logo)}" alt="${escapeHtml(name)}">`;
  return escapeHtml(initials(name));
}

function updateMobileSchoolBar() {
  const bar = byId("mobile-school-bar");
  if (!bar || !state.db || !state.session) return;
  const user = currentUser();
  const setting = state.db.settings?.[0] || {};
  const schoolName = setting.school_name || "EduAttend Pro";
  const unread = unreadNotificationsForUser(user).length;
  bar.innerHTML = `
    <div class="mobile-school-id">
      <span>${schoolLogoHtml()}</span>
      <strong>${escapeHtml(schoolName)}</strong>
    </div>
    ${headmasterUnitSwitcher("mobile")}
    ${["siswa", "wali_murid"].includes(user?.role) ? `<button type="button" class="mobile-rank-trigger" data-open-ranking-history aria-label="Riwayat Peringkat">${iconForPage("rankings")}</button>` : ""}
    ${["siswa", "guru", "wali_kelas", "kepala_sekolah"].includes(user?.role) ? `<button type="button" class="mobile-notification" data-open-notifications aria-label="Notifikasi"><b>&#128276;</b>${unread ? `<em>${unread}</em>` : ""}</button>` : ""}
  `;
  bar.querySelector("[data-open-ranking-history]")?.addEventListener("click", openCurrentUserRankingHistory);
  bar.querySelector("[data-open-notifications]")?.addEventListener("click", openNotifications);
  bindHeadmasterUnitSwitcher(bar);
}

function mobileScheduleNotification(user) {
  if (!["siswa", "guru", "wali_kelas"].includes(user?.role)) return null;
  const schedules = notificationSchedulesForUser(user);
  if (!schedules.length) return { text: "Tidak ada jadwal hari ini", detail: "Tidak ada pelajaran yang terdaftar untuk hari ini." };
  const nowMin = currentMinutes();
  const active = schedules.find(s => nowMin >= timeToMinutes(s.start_time) && nowMin <= timeToMinutes(s.end_time));
  const next = active || schedules.find(s => timeToMinutes(s.start_time) >= nowMin) || schedules[schedules.length - 1];
  const subject = displayName("subjects", findById("subjects", next.subject_id));
  const cls = displayName("classes", findById("classes", next.class_id));
  if (active) return { text: `${subject} sedang dimulai`, detail: `${cls} - ${next.start_time} sampai ${next.end_time}` };
  if (timeToMinutes(next.start_time) >= nowMin) return { text: `${subject} mulai ${next.start_time}`, detail: `${cls} - ${next.start_time} sampai ${next.end_time}` };
  return { text: "Jadwal hari ini selesai", detail: "Semua jadwal hari ini sudah lewat." };
}

function notificationSchedulesForUser(user) {
  const day = dayName(new Date());
  let schedules = schedulesForSelectedYear().filter(s => !s.deleted_at && s.active !== "false" && s.day === day);
  if (user.role === "siswa") {
    const student = findById("students", user.student_id);
    const cls = student ? studentClassForSelectedYear(student) || findById("classes", student.active_class_id) : null;
    schedules = schedules.filter(s => s.class_id === cls?.id);
  } else if (user.role === "guru") {
    schedules = schedules.filter(s => s.teacher_id === user.teacher_id);
  } else if (user.role === "wali_kelas") {
    const classIds = new Set(classesForSelectedYear().filter(c => c.homeroom_teacher_id === user.teacher_id).map(c => c.id));
    schedules = schedules.filter(s => classIds.has(s.class_id));
  }
  return schedules.sort((a, b) => timeToMinutes(a.start_time) - timeToMinutes(b.start_time));
}

function startNotificationEngine() {
  if (state.notificationTimer) clearInterval(state.notificationTimer);
  runNotificationJobs();
  state.notificationTimer = setInterval(runNotificationJobs, 60_000);
}

function runNotificationJobs() {
  if (!state.db || !state.session) return;
  refreshRemoteDbForAccess();
  const user = currentUser();
  if (!user) return;
  autoClosePastOpenSessions();
  createScheduleNotificationsForUser(user);
  createLeaveNotificationsForUser(user);
  createMeetingNotificationsForUser(user);
  updateMobileSchoolBar();
}

async function refreshRemoteDbForAccess({ force = false } = {}) {
  if (!state.remoteDb || state.remoteSyncing) return;
  const time = Date.now();
  if (!force && time - state.lastRemoteSync < 10_000) return;
  state.lastRemoteSync = time;
  state.remoteSyncing = true;
  try {
    const response = await fetch("/api/state", { cache: "no-store" });
    if (!response.ok) return;
    const payload = await response.json();
    const revision = Number(payload.revision || 0);
    const updatedAt = payload.updated_at || "";
    if (!payload.db || (revision === state.remoteRevision && updatedAt === state.remoteUpdatedAt)) return;
    const currentPage = state.page;
    state.db = normalizeDb(payload.db);
    state.remoteRevision = revision;
    state.remoteUpdatedAt = updatedAt;
    localStorage.setItem(DB_KEY, JSON.stringify(state.db));
    state.selectedAcademicYearId = resolveStoredAcademicYearId();
    if (state.session && !validateStoredSession(state.session)) {
      logoutApp();
      toast("Data login sudah tidak ada di data aktif. Silakan hubungi Administrator.", "error");
      return;
    }
    if (state.session && !byId("modal-backdrop")) {
      state.page = currentPage;
      renderMenu();
      navigate(currentPage, { replaceHistory: true });
    }
  } catch (error) {
    console.warn("Gagal menyinkronkan database online.", error);
  } finally {
    state.remoteSyncing = false;
  }
}

function autoClosePastOpenSessions() {
  let changed = false;
  state.db.attendance_sessions
    .filter(session => !session.deleted_at && session.status === "open" && session.date === today())
    .forEach(session => {
      const schedule = findById("schedules", session.schedule_id);
      if (scheduleTimingState(schedule) === "past" && processSessionClosure(session, { silent: true })) changed = true;
    });
  if (changed) saveDb();
}

function createScheduleNotificationsForUser(user) {
  const nowDate = new Date();
  const minute = currentMinutes();
  if (user.role === "siswa") {
    notificationSchedulesForUser(user).forEach(schedule => {
      const start = timeToMinutes(schedule.start_time);
      if (start - minute > 0 && start - minute <= 15) {
        addNotification(user.id, `Pelajaran hampir dimulai`, `${displayName("subjects", findById("subjects", schedule.subject_id))} dimulai ${schedule.start_time} di ${displayName("classes", findById("classes", schedule.class_id))}.`, "schedule-soon", schedule.id);
      }
    });
    if (nowDate.getHours() === 21) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const student = findById("students", user.student_id);
      const cls = student ? studentClassForSelectedYear(student) || findById("classes", student.active_class_id) : null;
      const schedules = schedulesForSelectedYear().filter(s => !s.deleted_at && s.active !== "false" && s.class_id === cls?.id && s.day === dayName(tomorrow));
      if (schedules.length) {
        addNotification(user.id, "Persiapan pelajaran besok", schedules.map(s => `${displayName("subjects", findById("subjects", s.subject_id))} ${s.start_time}`).join(", "), "tomorrow-schedule", `${today()}-${cls?.id}`);
      }
    }
  }
  if (["guru", "wali_kelas"].includes(user.role)) {
    notificationSchedulesForUser({ ...user, role: "guru" }).forEach(schedule => {
      const start = timeToMinutes(schedule.start_time);
      if (start - minute > 0 && start - minute <= 10) {
        addNotification(user.id, "Jadwal mengajar 10 menit lagi", `${displayName("subjects", findById("subjects", schedule.subject_id))} - ${displayName("classes", findById("classes", schedule.class_id))} pukul ${schedule.start_time}.`, "teacher-schedule", schedule.id);
      }
    });
  }
}

function createLeaveNotificationsForUser(user) {
  if (user.role !== "wali_kelas") return;
  const classIds = new Set(classesForSelectedYear().filter(c => c.homeroom_teacher_id === user.teacher_id).map(c => c.id));
  state.db.leave_requests.filter(l => !l.deleted_at && l.status === "pending" && classIds.has(l.class_id)).forEach(leave => {
    addNotification(user.id, "Pengajuan izin menunggu", `${displayName("students", findById("students", leave.student_id))} mengajukan ${statusLabels[leave.leave_type] || leave.leave_type}.`, "leave-approval", leave.id);
  });
}

function createMeetingNotificationsForUser(user) {
  if (!["guru", "wali_kelas"].includes(user.role)) return;
  state.db.meetings.filter(m => !m.deleted_at && m.status !== "cancelled").forEach(meeting => {
    addNotification(user.id, `Rapat: ${meeting.title}`, `${meeting.date} ${meeting.time} - ${meeting.location || "Lokasi menyusul"}. ${meeting.agenda || ""}`, "meeting", meeting.id);
  });
}

function addNotification(userId, title, body, type, refId = "") {
  if (["meeting", "leave-approval"].includes(type) && state.db.notifications.some(n => n.user_id === userId && n.type === type && n.ref_id === refId && !n.deleted_at)) return;
  const key = `${userId}|${type}|${refId}|${today()}`;
  if (state.db.notifications.some(n => n.key === key)) return;
  const notification = { id: uid("not"), key, user_id: userId, title, body, type, ref_id: refId, read_at: "", created_at: now() };
  state.db.notifications.push(notification);
  saveDb();
  notifyDevice(notification);
}

function notifyDevice(notification) {
  const sent = JSON.parse(localStorage.getItem(NOTIF_SENT_KEY) || "{}");
  if (sent[notification.id]) return;
  if ("Notification" in window && Notification.permission === "granted") {
    new Notification(notification.title, { body: notification.body });
    sent[notification.id] = true;
    localStorage.setItem(NOTIF_SENT_KEY, JSON.stringify(sent));
  }
}

function notificationsForUser(user = currentUser()) {
  return state.db.notifications
    .filter(n => !n.deleted_at && n.user_id === user?.id)
    .sort((a, b) => String(b.created_at || "").localeCompare(String(a.created_at || "")));
}

function unreadNotificationsForUser(user = currentUser()) {
  return notificationsForUser(user).filter(n => !n.read_at);
}

async function openNotifications() {
  if ("Notification" in window && Notification.permission === "default") {
    try { await Notification.requestPermission(); } catch {}
  }
  runNotificationJobs();
  const items = notificationsForUser().slice(0, 30);
  modal("Notifikasi", `<div class="notification-list">
    ${items.map(n => notificationItemHtml(n)).join("") || `<div class="empty-state">Belum ada notifikasi.</div>`}
  </div>`);
  const root = byId("modal-backdrop");
  root.querySelectorAll("[data-read-notification]").forEach(button => button.onclick = () => {
    const item = findById("notifications", button.dataset.readNotification);
    if (item) item.read_at = now();
    saveDb();
    closeModal({ fromPopState: true });
    openNotifications();
  });
  root.querySelectorAll("[data-approve-notification-leave]").forEach(button => button.onclick = () => {
    approveLeave(button.dataset.approveNotificationLeave);
    const item = state.db.notifications.find(n => n.ref_id === button.dataset.approveNotificationLeave && n.type === "leave-approval");
    if (item) item.read_at = now();
    saveDb();
    closeModal({ fromPopState: true });
    openNotifications();
  });
}

function notificationItemHtml(notification) {
  const approve = notification.type === "leave-approval" && findById("leave_requests", notification.ref_id)?.status === "pending"
    ? `<button class="primary" data-approve-notification-leave="${notification.ref_id}">Setujui</button>`
    : "";
  return `<article class="notification-item ${notification.read_at ? "" : "unread"}">
    <div><h3>${escapeHtml(notification.title)}</h3><p>${escapeHtml(notification.body)}</p><small>${escapeHtml(notification.created_at?.slice(0, 16).replace("T", " ") || "")}</small></div>
    <div class="notification-actions">${approve}<button class="ghost" data-read-notification="${notification.id}">${notification.read_at ? "Tutup" : "Tandai Dibaca"}</button></div>
  </article>`;
}

function currentUser() {
  if (state.session?.role === "wali_murid") {
    const student = findById("students", state.session.murid_id);
    if (!studentCanLogin(student)) return null;
    return {
      id: `wali_${state.session.murid_id}`,
      name: parentNameForStudent(student) || `Wali ${student?.name || "Murid"}`,
      role: "wali_murid",
      student_id: state.session.murid_id,
      murid_id: state.session.murid_id,
      active: "true"
    };
  }
  const user = state.db.users.find(u => u.id === state.session?.userId);
  if (!linkedLoginTargetActive(user)) return null;
  return state.session?.role && user.role !== state.session.role ? { ...user, original_role: user.role, role: state.session.role } : user;
}
function landingPageForRole(role) {
  return ({
    super_admin: "dashboard",
    guru: "attendance",
    wali_kelas: "leave_requests",
    kepala_sekolah: "reports",
    siswa: "dashboard",
    wali_murid: "dashboard"
  })[role] || "dashboard";
}
function canDelete() { return ["super_admin", "kepala_sekolah"].includes(currentUser().role); }
function canEditMaster() { return ["super_admin", "kepala_sekolah"].includes(currentUser().role); }
function canReport() { return ["super_admin", "guru", "wali_kelas", "kepala_sekolah"].includes(currentUser().role); }
function canCreateLeaveRequest(table) { return table === "leave_requests" && ["super_admin", "guru", "wali_kelas", "wali_murid"].includes(currentUser().role); }
function canApproveLeaveFor(classId) {
  const user = currentUser();
  if (["super_admin", "kepala_sekolah"].includes(user.role)) return true;
  if (user.role === "guru") return state.db.schedules.some(s => !s.deleted_at && s.teacher_id === user.teacher_id && s.class_id === classId);
  if (user.role !== "wali_kelas") return false;
  return state.db.classes.some(c => c.id === classId && c.homeroom_teacher_id === user.teacher_id);
}
function canAccess(page) { return menuItemsForCurrentUser().some(([id]) => id === page); }

function renderMenu() {
  const mobile = isMobileViewport();
  const items = mobile ? mobileBarItemsForCurrentUser() : menuItemsForCurrentUser();
  byId("menu").dataset.role = currentUser().role;
  if (!mobile && ["super_admin", "kepala_sekolah"].includes(currentUser().role)) {
    byId("menu").innerHTML = adminMenuGroups().map(group => `
      <div class="menu-group">
        <span class="menu-label">${group.label}</span>
        ${group.items.filter(([id]) => items.some(([itemId]) => itemId === id)).map(([id, label]) => `<button data-page="${id}" class="${state.page === id ? "active" : ""}">${label}</button>`).join("")}
      </div>`).join("");
    byId("menu").querySelectorAll("button").forEach(btn => btn.onclick = () => navigate(btn.dataset.page));
    return;
  }
  byId("menu").innerHTML = items.map((item, index) => mobileMenuButton(item, index)).join("");
  byId("menu").querySelectorAll("button").forEach(btn => btn.onclick = () => navigate(btn.dataset.page));
}

function mobileMenuButton([id, label], index) {
  const slot = index + 1;
  const center = slot === 3;
  return `<button data-page="${id}" data-mobile-slot="${slot}" ${center ? `data-mobile-center="true"` : ""} style="--mobile-slot:${slot}" class="${state.page === id ? "active" : ""}" aria-label="${escapeHtml(label)}">
    ${iconForPage(id)}
    <span class="nav-label">${escapeHtml(label)}</span>
  </button>`;
}

function iconForPage(page) {
  const icons = {
    dashboard: "M3 12h7V3H3v9Zm11 9h7V3h-7v18ZM3 21h7v-7H3v7Z",
    attendance: "M4 4h6v6H4V4Zm10 0h6v6h-6V4ZM4 14h6v6H4v-6Zm10 0h3v3h3v3h-6v-6Z",
    my_qr: "M4 4h6v6H4V4Zm10 0h6v6h-6V4ZM4 14h6v6H4v-6Zm11 0h2v2h-2v-2Zm4 0h1v6h-4v-2h3v-4Z",
    student_today: "M7 3v3M17 3v3M4 8h16M6 5h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Zm3 8 2 2 4-5",
    history: "M3 12a9 9 0 1 0 3-6.7M3 4v6h6M12 7v6l4 2",
    reports: "M5 3h14v18H5V3Zm4 5h6M9 12h6M9 16h3",
    students: "M8 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm8 2a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM2 21a6 6 0 0 1 12 0M14 21a5 5 0 0 1 8 0",
    teachers: "M4 19V5l8-3 8 3v14l-8 3-8-3Zm4-9h8M8 14h8",
    subjects: "M4 5a3 3 0 0 1 3-3h13v17H7a3 3 0 0 0-3 3V5Zm3 14h13",
    schedules: "M4 5h16v16H4V5Zm4-3v6M16 2v6M4 10h16",
    periods: "M4 4h16v4H4V4Zm0 8h16v8H4v-8Zm4 2v4M12 14v4M16 14v4",
    leave_requests: "M5 3h14v18H5V3Zm4 6h6M9 13h6M9 17h3",
    parent_leave_requests: "M5 3h14v18H5V3Zm4 6h6M9 13h6M9 17h3",
    meetings: "M4 5h16v10H7l-3 3V5Zm5 4h6",
    audit_logs: "M5 3h14v18H5V3Zm4 5h6M9 12h6M9 16h3",
    users: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-7 9a7 7 0 0 1 14 0",
    settings: "M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Zm0-5v3M12 18v3M4.9 4.9 7 7M17 17l2.1 2.1M3 12h3M18 12h3M4.9 19.1 7 17M17 7l2.1-2.1",
    profile: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-6 9a6 6 0 0 1 12 0",
    wali_murid: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-8 9a8 8 0 0 1 16 0M17 5l3 3-3 3",
    classes: "M4 5h16v14H4V5Zm4 0v14M4 10h16",
    rankings: "M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0V4Zm0 2H4v2a3 3 0 0 0 3 3M17 6h3v2a3 3 0 0 1-3 3",
    logout: "M10 6H5v12h5M14 8l4 4-4 4M8 12h10",
    mobile_settings: "M4 6h16M4 12h16M4 18h16"
  };
  const path = icons[page] || icons.dashboard;
  return `<svg class="app-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="${path}"></path></svg>`;
}

function adminMenuGroups() {
  return [
    { label: "Utama", items: [["dashboard", "Dashboard"], ["attendance", "Sesi & Scan QR"], ["history", "History"], ["reports", "Laporan"]] },
    { label: "Akademik", items: [["students", "Siswa & Kelas"], ["teachers", "Guru"], ["subjects", "Mapel & Jadwal"], ["rankings", "Peringkat"]] },
    { label: "Periode", items: [["periods", "Periode Akademik"]] },
    { label: "Sistem", items: [["leave_requests", "Izin & Sakit"], ["parent_leave_requests", "Pengajuan Izin Wali"], ["meetings", "Rapat"], ["audit_logs", "Audit Sistem"], ["users", "Akses Login"], ["settings", "Pengaturan"], ["profile", "Profil Saya"]] }
  ];
}

function menuItemsForCurrentUser() {
  const user = currentUser();
  return [
    ["dashboard", "Dashboard", true],
    ["attendance", "Sesi & Scan QR", ["super_admin", "guru"].includes(user.role)],
    ["my_qr", "QR Saya", user.role === "siswa"],
    ["student_today", "Hari Ini", user.role === "siswa"],
    ["history", "History", ["super_admin", "guru", "wali_kelas", "kepala_sekolah", "siswa", "wali_murid"].includes(user.role)],
    ["students", "Siswa & Kelas", canEditMaster() || user.role === "wali_kelas"],
    ["teachers", "Guru", canEditMaster()],
    ["classes", "Kelas", canEditMaster()],
    ["subjects", "Mapel & Jadwal", canEditMaster()],
    ["schedules", "Jadwal Pelajaran", user.role === "guru"],
    ["periods", "Periode Akademik", canEditMaster()],
    ["rankings", "Peringkat", ["super_admin", "kepala_sekolah", "wali_kelas"].includes(user.role)],
    ["leave_requests", "Izin & Sakit", ["super_admin", "guru", "wali_kelas", "wali_murid"].includes(user.role)],
    ["parent_leave_requests", "Pengajuan Izin Wali", ["super_admin", "guru", "wali_kelas", "kepala_sekolah"].includes(user.role)],
    ["meetings", "Rapat", user.role === "kepala_sekolah"],
    ["reports", "Laporan", canReport()],
    ["audit_logs", "Audit Sistem", ["super_admin", "kepala_sekolah"].includes(user.role)],
    ["users", "Akses Login", user.role === "super_admin"],
    ["settings", "Pengaturan", canEditMaster()],
    ["profile", "Profil Saya", user.role !== "super_admin"]
  ].filter(i => i[2]);
}

function isMobileViewport() {
  return window.matchMedia?.("(max-width: 980px)").matches;
}

function mobileBarItemsForCurrentUser() {
  const user = currentUser();
  const byRole = {
    super_admin: [["dashboard", "Dashboard"], ["students", "Siswa"], ["attendance", "Scan"], ["reports", "Laporan"]],
    guru: [["dashboard", "Dashboard"], ["history", "History"], ["attendance", "Scan"], ["reports", "Laporan"]],
    wali_kelas: [["dashboard", "Dashboard"], ["history", "History"], ["rankings", "Peringkat"], ["reports", "Laporan"]],
    kepala_sekolah: [["dashboard", "Dashboard"], ["students", "Siswa"], ["meetings", "Rapat"], ["reports", "Laporan"]],
    siswa: [["dashboard", "Dashboard"], ["history", "History"], ["my_qr", "QR"], ["student_today", "Hari Ini"], ["profile", "Profil"]],
    wali_murid: [["dashboard", "Dashboard"], ["history", "History"], ["leave_requests", "Izin"], ["profile", "Profil"]]
  };
  if (user.role === "siswa") return byRole.siswa.filter(([id]) => id === "my_qr" || canAccessFull(id));
  const preferred = byRole[user.role] || byRole.siswa;
  const fullItems = menuItemsForCurrentUser();
  const allowed = id => id === "my_qr" || canAccessFull(id);
  const main = preferred.filter(([id]) => allowed(id));
  fullItems.forEach(([id, label]) => {
    if (main.length >= 4) return;
    if (!main.some(([itemId]) => itemId === id) && id !== "profile" && id !== "settings") main.push([id, label]);
  });
  if (main.length < 4 && canAccessFull("profile") && !main.some(([id]) => id === "profile")) main.push(["profile", "Profil"]);
  return [...main.slice(0, 4), ["mobile_settings", "Menu"]];
}

function canAccessFull(page) {
  return menuItemsForCurrentUser().some(([id]) => id === page);
}

function canAccessPeriodChild(page) {
  return canEditMaster() && ["academic_years", "semesters", "lesson_hours", "holidays", "subject_master"].includes(page);
}

function navigate(page, options = {}) {
  if (!ensureSessionStillValid()) return;
  stopCamera();
  if (page !== "my_qr" && byId("modal-backdrop")) closeModal({ fromPopState: true });
  if (page === "my_qr") return showMyQr();
  if (page === "mobile_settings") return renderMobileSettingsHub();
  if (!canAccess(page) && !canAccessPeriodChild(page)) page = landingPageForRole(currentUser().role);
  state.page = page;
  if (!options.replaceHistory) pushAppHistory(page);
  document.querySelector(".sidebar").classList.remove("open");
  renderMenu();
  const titles = { dashboard: "Dashboard", attendance: "Scan", history: "History", subjects: "Mapel & Jadwal", rankings: "Peringkat", reports: "Reports", users: "Akses Login", profile: "Profile", periods: "Periode Akademik", audit_logs: "Audit Sistem", leave_requests: "Izin & Sakit", parent_leave_requests: "Pengajuan Izin Wali" };
  const schema = schemas[page];
  byId("page-title").textContent = titles[page] || schema?.title || "Aplikasi";
  byId("page-subtitle").textContent = page === "attendance" ? "Buka jadwal aktif terlebih dahulu sebelum scan QR siswa." : "";
  updateMobileSchoolBar();
  renderQuickTools();
  if (page === "dashboard") return renderDashboard();
  if (page === "attendance") return renderAttendance();
  if (page === "history") return renderHistory();
  if (page === "student_today") return renderStudentToday();
  if (page === "reports") return renderReports();
  if (page === "rankings") return renderRankings();
  if (page === "leave_requests" && currentUser().role === "wali_murid") return renderParentLeaveRequests();
  if (page === "parent_leave_requests") return renderParentLeaveAdmin();
  if (page === "meetings") return renderMeetings();
  if (page === "periods") return renderPeriodHub();
  if (page === "subject_master") return renderSubjectMaster();
  if (page === "audit_logs") return renderAuditLogs();
  if (page === "users") return renderUsers();
  if (page === "profile") return renderProfile();
  return renderCrud(page);
}

function pushAppHistory(page) {
  if (!state.session || !history.pushState) return;
  const current = history.state || {};
  if (current.app === "alhikmah" && current.page === page && !current.modal) return;
  history.pushState({ app: "alhikmah", page }, "", location.href);
}

function renderMobileSettingsHub() {
  state.page = "mobile_settings";
  document.querySelector(".sidebar").classList.remove("open");
  renderMenu();
  byId("page-title").textContent = "Menu";
  byId("page-subtitle").textContent = "Menu tambahan dan pengaturan akun.";
  updateMobileSchoolBar();
  renderQuickTools();
  const bottomIds = new Set(mobileBarItemsForCurrentUser().map(([id]) => id));
  const extraItems = menuItemsForCurrentUser()
    .filter(([id]) => !bottomIds.has(id) && id !== "my_qr");
  const cards = extraItems.map(([id, label]) => `
    <button class="menu-hub-card" data-menu-hub="${id}">
      <span class="menu-hub-icon">${iconForPage(id)}</span>
      <span class="menu-hub-copy"><strong>${label}</strong><small>Buka halaman ${label.toLowerCase()}</small></span>
    </button>`).join("");
  byId("view").innerHTML = `
    <section class="panel menu-hub-panel">
      <div class="panel-head">
        <div>
          <span class="eyebrow">Menu Setting</span>
          <h2>Pengaturan dan menu lainnya</h2>
          <p class="muted">Bottom bar hanya menampilkan menu utama. Halaman lain tetap tersedia dari sini.</p>
        </div>
      </div>
      <div class="menu-hub-grid">
        ${cards || `<p class="muted">Tidak ada menu tambahan untuk role ini.</p>`}
        <button class="menu-hub-card danger" data-menu-logout>
          <span class="menu-hub-icon">${iconForPage("logout")}</span>
          <span class="menu-hub-copy"><strong>Keluar</strong><small>Kembali ke halaman login</small></span>
        </button>
      </div>
    </section>`;
  byId("view").querySelectorAll("[data-menu-hub]").forEach(btn => btn.onclick = () => navigate(btn.dataset.menuHub));
  const logoutBtn = byId("view").querySelector("[data-menu-logout]");
  if (logoutBtn) logoutBtn.onclick = logoutApp;
}

function renderPeriodHub() {
  const items = [
    ["academic_years", "Tahun Ajaran", "Atur periode besar 1 tahun ajaran.", state.db.academic_years.filter(r => !r.deleted_at).length],
    ["semesters", "Semester", "Hubungkan ganjil/genap ke tanggal resmi.", state.db.semesters.filter(r => !r.deleted_at && r.academic_year_id === selectedAcademicYearId()).length],
    ["lesson_hours", "Jam Pelajaran", "Template jam untuk mencegah input jadwal sembarang.", state.db.lesson_hours.filter(r => !r.deleted_at).length],
    ["holidays", "Hari Libur", "Tanggal libur agar alfa tidak dibuat otomatis.", state.db.holidays.filter(r => !r.deleted_at).length],
    ["subject_master", "Mata Pelajaran", "Master mapel untuk dipakai saat menyusun jadwal kelas.", state.db.subjects.filter(r => !r.deleted_at).length]
  ];
  byId("view").innerHTML = `
    <section class="panel period-hub">
      <div class="panel-head">
        <div>
          <span class="eyebrow">Periode Akademik</span>
          <h2>Atur Kalender Sekolah dari Satu Tempat</h2>
          <p class="muted">Menu periode disatukan supaya operator tidak bolak-balik mencari tahun ajaran, semester, jam pelajaran, dan hari libur.</p>
        </div>
        <div class="actions">${academicYearSwitcher("periods")}</div>
      </div>
      <div class="period-hub-grid">
        ${items.map(([id, title, desc, count]) => `
          <button class="period-card" data-period-page="${id}">
            <span>${escapeHtml(String(count))}</span>
            <strong>${escapeHtml(title)}</strong>
            <small>${escapeHtml(desc)}</small>
          </button>`).join("")}
      </div>
    </section>`;
  bindAcademicYearSwitcher(renderPeriodHub);
  byId("view").querySelectorAll("[data-period-page]").forEach(btn => btn.onclick = () => navigate(btn.dataset.periodPage));
}

function renderSubjectMaster() {
  const schema = schemas.subjects;
  const q = state.filters.subject_master || "";
  let rows = state.db.subjects.filter(subject => !subject.deleted_at);
  if (q) rows = rows.filter(subject => JSON.stringify(subject).toLowerCase().includes(q));
  rows = rows.sort((a, b) => String(a.name || a.code || "").localeCompare(String(b.name || b.code || "")));
  byId("page-title").textContent = "Mata Pelajaran";
  byId("view").innerHTML = `
    <section class="panel">
      <div class="panel-head">
        <div>
          <span class="eyebrow">Periode Akademik</span>
          <h2>Master Mata Pelajaran</h2>
          <p class="muted">Tambah, edit, dan hapus mapel dari sini. Jadwal kelas hanya memakai mapel yang masih aktif.</p>
        </div>
        <div class="actions crud-toolbar">
          <button class="primary" data-add-subject-master>Tambah Mata Pelajaran</button>
          ${crudActionSelect("subjects")}
        </div>
      </div>
      <div class="filters"><input data-search-subject-master placeholder="Cari kode, nama, atau kelompok mapel..." value="${escapeHtml(q)}"></div>
      <div class="table-wrap"><table><thead><tr>${schema.columns.map(c => `<th>${c[1]}</th>`).join("")}<th>Aksi</th></tr></thead><tbody>
        ${rows.map(row => `<tr>${schema.columns.map(([key, label, fmt]) => `<td data-label="${escapeHtml(label)}">${fmt ? fmt(row[key], row) : escapeHtml(row[key] ?? "")}</td>`).join("")}<td data-label="Aksi" class="row-actions">${crudActions("subjects", row, true)}</td></tr>`).join("") || emptyRow(schema.columns.length + 1)}
      </tbody></table></div>
    </section>`;
  const root = byId("view");
  root.querySelector("[data-add-subject-master]")?.addEventListener("click", () => openForm("subjects", null, {}, { renderAfterSave: renderSubjectMaster }));
  root.querySelector("[data-search-subject-master]")?.addEventListener("input", event => {
    state.filters.subject_master = event.target.value.toLowerCase();
    renderSubjectMaster();
  });
  bindCrud("subjects", { renderAfterSave: renderSubjectMaster });
}

function renderAuditLogs() {
  const rows = auditLogRows();
  byId("view").innerHTML = `
    <section class="panel">
      <div class="panel-head">
        <div>
          <span class="eyebrow">Audit Sistem</span>
          <h2>Riwayat Perubahan Absensi</h2>
          <p class="muted">Halaman ini menampilkan perubahan status yang memiliki alasan, termasuk koreksi manual dan perubahan izin/sakit.</p>
        </div>
        <div class="actions">
          <input data-audit-search placeholder="Cari siswa, status, alasan..." value="${escapeHtml(state.filters.auditLogs || "")}">
          <select class="table-action-select" data-audit-export aria-label="Export audit">
            <option value="">Export</option>
            <option value="csv">CSV</option>
            <option value="excel">Excel</option>
          </select>
        </div>
      </div>
      <div class="table-wrap">
        <table>
          <thead><tr><th>Waktu</th><th>Siswa</th><th>Kelas</th><th>Dari</th><th>Ke</th><th>Diubah Oleh</th><th>Alasan</th></tr></thead>
          <tbody>${rows.map(row => `
            <tr>
              <td data-label="Waktu">${escapeHtml(row.waktu)}</td>
              <td data-label="Siswa">${escapeHtml(row.siswa)}</td>
              <td data-label="Kelas">${escapeHtml(row.kelas)}</td>
              <td data-label="Dari">${escapeHtml(row.dari)}</td>
              <td data-label="Ke">${escapeHtml(row.ke)}</td>
              <td data-label="Diubah Oleh">${escapeHtml(row.oleh)}</td>
              <td data-label="Alasan">${escapeHtml(row.alasan)}</td>
            </tr>`).join("") || emptyRow(7)}</tbody>
        </table>
      </div>
    </section>`;
  byId("view").querySelector("[data-audit-search]")?.addEventListener("input", e => {
    state.filters.auditLogs = e.target.value.toLowerCase();
    renderAuditLogs();
  });
  byId("view").querySelector("[data-audit-export]")?.addEventListener("change", e => {
    const value = e.target.value;
    e.target.value = "";
    if (value === "csv") exportCsv("audit_logs", rows);
    if (value === "excel") exportExcel("audit_logs", rows);
  });
}

function auditLogRows() {
  const accessibleRecordIds = new Set(scopedAttendanceRecords().map(record => record.id));
  const q = state.filters.auditLogs || "";
  return state.db.attendance_logs
    .filter(log => !log.deleted_at && accessibleRecordIds.has(log.attendance_record_id))
    .map(log => {
      const record = findById("attendance_records", log.attendance_record_id);
      return {
        waktu: log.created_at?.slice(0, 16).replace("T", " ") || "",
        siswa: displayName("students", findById("students", log.student_id)) || "-",
        kelas: displayName("classes", findById("classes", record?.class_id)) || "-",
        dari: statusLabels[log.old_status] || log.old_status || "-",
        ke: statusLabels[log.new_status] || log.new_status || "-",
        oleh: displayName("users", findById("users", log.changed_by)) || "-",
        alasan: log.reason || "-"
      };
    })
    .filter(row => !q || JSON.stringify(row).toLowerCase().includes(q))
    .sort((a, b) => b.waktu.localeCompare(a.waktu));
}

function menuInitial(label) {
  return String(label || "M").split(/\s+/).map(word => word[0]).join("").slice(0, 2).toUpperCase();
}

function renderQuickTools() {
  const user = currentUser();
  if (["super_admin", "kepala_sekolah"].includes(user.role)) {
    const tools = [
      ["dashboard", "Dashboard", canAccess("dashboard")],
      ["students", "Siswa", canAccess("students")],
      ["teachers", "Guru", canAccess("teachers")],
      ["subjects", "Mapel", canAccess("subjects")],
      ["reports", "Laporan", canAccess("reports")]
    ].filter(t => t[2]);
    byId("quick-tools").innerHTML = `${headmasterUnitSwitcher("desktop")}${tools.map(([page, label]) => `<button class="${state.page === page ? "active" : ""}" data-quick="${page}" title="${label}">${iconForPage(page)}<span>${label}</span></button>`).join("")}`;
    bindHeadmasterUnitSwitcher(byId("quick-tools"));
    byId("quick-tools").querySelectorAll("button").forEach(btn => btn.onclick = () => navigate(btn.dataset.quick));
    return;
  }
  const tools = [
    ["dashboard", "Dashboard", "▦", canAccess("dashboard")],
    ["attendance", user.role === "siswa" ? "QR Saya" : "Scan", "▩", user.role === "siswa" ? true : canAccess("attendance")],
    ["reports", "Reports", "▤", canAccess("reports")],
    ["profile", "Profile", "♙", canAccess("profile")]
  ].filter(t => t[3]);
  const rankButton = ["siswa", "wali_murid"].includes(user.role) ? `<button class="rank-icon-btn" data-open-ranking-history title="Riwayat Peringkat">${iconForPage("rankings")}<span>Peringkat</span></button>` : "";
  byId("quick-tools").innerHTML = `${rankButton}${tools.map(([page, label]) => `<button class="${state.page === page ? "active" : ""}" data-quick="${page}" title="${label}">${iconForPage(page)}<span>${label}</span></button>`).join("")}`;
  byId("quick-tools").querySelector("[data-open-ranking-history]")?.addEventListener("click", openCurrentUserRankingHistory);
  byId("quick-tools").querySelectorAll("button").forEach(btn => btn.onclick = () => {
    if (btn.dataset.openRankingHistory !== undefined) return openCurrentUserRankingHistory();
    if (btn.dataset.quick === "attendance" && currentUser().role === "siswa") return showMyQr();
    navigate(btn.dataset.quick);
  });
}

function renderDashboard() {
  const role = currentUser().role;
  if (role === "siswa") return renderStudentDashboard();
  if (role === "guru") return renderTeacherDashboard();
  if (role === "wali_kelas") return renderHomeroomDashboard();
  if (role === "kepala_sekolah") return renderHeadmasterDashboard();
  if (role === "wali_murid") return renderParentDashboard();
  const date = today();
  const recordsToday = recordsForSelectedYear().filter(r => r.date === date);
  const stat = s => recordsToday.filter(r => r.status === s).length;
  const sessionsThisYear = filterBySelectedAcademicYear("attendance_sessions", state.db.attendance_sessions.filter(s => !s.deleted_at));
  const schedulesThisYear = schedulesForSelectedYear(state.db.schedules.filter(s => !s.deleted_at));
  const studentsThisYear = visibleRows("students");
  const teachersActive = visibleRows("teachers");
  const classesThisYear = classesForSelectedYear();
  const activeSession = sessionsThisYear.find(s => s.date === date && s.status === "open") || sessionsThisYear.find(s => s.date === date);
  const classCount = activeSession ? studentsInClass(activeSession.class_id).length : studentsThisYear.length;
  const presentCount = stat("hadir");
  const lateCount = stat("terlambat");
  const leaveCount = stat("izin");
  const sickCount = stat("sakit");
  const absentPending = Math.max(0, classCount - presentCount - lateCount - leaveCount - sickCount - stat("alfa"));
  byId("view").innerHTML = `
    <section class="mobile-dashboard">
      <article class="session-hero">
        <span>Active Session</span>
        <h2>${activeSession ? `${refName("subjects")(activeSession.subject_id)} - Kelas ${refName("classes")(activeSession.class_id)}` : "Belum Ada Sesi Aktif"}</h2>
        <div><b>Guru</b> ${activeSession ? refName("teachers")(activeSession.teacher_id) : "Pilih jadwal"} <b>Jam</b> ${activeSession ? `${activeSession.start_time} - ${activeSession.end_time}` : "Buka sesi absensi"}</div>
      </article>
      <article class="total-card">
        <span>Total Students</span>
        <strong>${classCount}</strong>
        <small>${activeSession ? `Session ID: #${activeSession.id.slice(-10).toUpperCase()}` : `${studentsThisYear.length} siswa aktif`}</small>
      </article>
      <div class="mini-stats">
        <article><strong class="ok-text">${presentCount}</strong><span>Hadir</span></article>
        <article><strong>${lateCount}</strong><span>Terlambat</span></article>
        <article><strong>${leaveCount}</strong><span>Izin</span></article>
        <article><strong class="danger-text">${sickCount}</strong><span>Sakit</span></article>
      </div>
      <article class="pending-card"><strong>${absentPending}</strong><span>Belum Absen</span></article>
    </section>
    <section class="cards desktop-only">
      ${card("Siswa Aktif", studentsThisYear.length)}
      ${card("Guru Aktif", teachersActive.length)}
      ${card("Kelas Aktif", classesThisYear.length)}
      ${card("Sesi Hari Ini", sessionsThisYear.filter(s => s.date === date).length)}
    </section>
    <section class="panel">
      <div class="panel-head"><div><h2>Ringkasan Operasional</h2><p class="muted">Dashboard mengikuti data tahun ajaran ${escapeHtml(selectedAcademicYearName())}.</p></div><div class="actions">${academicYearSwitcher("dashboard")}</div></div>
      <div class="table-wrap"><table><thead><tr><th>Area</th><th>Informasi</th></tr></thead><tbody>
        <tr><td>Guru</td><td>${schedulesThisYear.filter(s => s.active !== "false").length} jadwal aktif, ${sessionsThisYear.filter(s => s.status === "open").length} sesi berjalan.</td></tr>
        <tr><td>Wali Kelas</td><td>${visibleRows("leave_requests").filter(l => l.status === "pending").length} pengajuan izin menunggu persetujuan.</td></tr>
        <tr><td>Kepala Sekolah</td><td>Laporan harian, bulanan, semester, kelas, dan mapel tersedia di menu Laporan.</td></tr>
      </tbody></table></div>
    </section>`;
  bindAcademicYearSwitcher(renderDashboard);
}

function renderStudentDashboard() {
  const user = currentUser();
  const student = state.db.students.find(s => s.id === user.student_id);
  if (!student) return renderProfile();
  const cls = studentClassForSelectedYear(student) || findById("classes", student.active_class_id);
  const records = recordsForSelectedYear().filter(r => r.student_id === student.id);
  const totals = attendanceTotals(records);
  const pct = totals.total ? (((totals.hadir + totals.terlambat) / totals.total) * 100).toFixed(1) : "0.0";
  const identityHidden = state.filters?.student_identity_hidden === "true";
  const nisText = identityHidden ? maskStudentIdentity(student.nis) : escapeHtml(student.nis);
  const nisnText = identityHidden ? maskStudentIdentity(student.nisn || "-") : escapeHtml(student.nisn || "-");
  byId("view").innerHTML = `
    <section class="student-quote-card">
      <span class="quote-label">Quote of the Day</span>
      <p>"${escapeHtml(studentLoginMessage(student))}"</p>
      <small><i></i> Al-Hikmah Attendance</small>
      <b aria-hidden="true">"</b>
    </section>
    <section class="student-home">
      <article class="student-card">
        <button type="button" class="student-secret-toggle ${identityHidden ? "is-hidden" : ""}" data-toggle-student-secret aria-label="${identityHidden ? "Tampilkan NIS dan NISN" : "Sembunyikan NIS dan NISN"}">
          <span class="eye-icon" aria-hidden="true"></span>
        </button>
        <div>
          <h2>${escapeHtml(student.name)}</h2>
          <p>${nisText} / ${nisnText} · Kelas ${escapeHtml(displayName("classes", cls))}</p>
        </div>
        <div class="student-identity">
          <small>Identitas Login</small>
          <strong>${nisnText}</strong>
          <em>QR tersedia melalui tombol bawah</em>
        </div>
      </article>
      <div class="mini-stats">
        <article><strong class="ok-text">${totals.hadir}</strong><span>Hadir</span></article>
        <article><strong>${totals.terlambat}</strong><span>Terlambat</span></article>
        <article><strong>${totals.izin}</strong><span>Izin</span></article>
        <article><strong class="danger-text">${totals.alfa}</strong><span>Alfa</span></article>
      </div>
      <article class="total-card student-percent">
        <span>Persentase Kehadiran</span>
        <strong>${pct}%</strong>
        <small>${totals.total} sesi tercatat</small>
      </article>
    </section>`;
  bindProfileSummaryActions();
  bindStudentIdentityToggle();
}

function parentStudent() {
  return findById("students", state.session?.murid_id || currentUser()?.murid_id);
}

function parentAttendanceRecords() {
  const student = parentStudent();
  if (!student) return [];
  return recordsForSelectedYear().filter(record => record.student_id === student.id);
}

function latestStudentRecordForDate(studentId, date) {
  return recordsForSelectedYear()
    .filter(record => record.student_id === studentId && record.date === date)
    .sort((a, b) => String(b.scan_time || b.start_time || "").localeCompare(String(a.scan_time || a.start_time || "")))[0];
}

function renderParentDashboard() {
  const student = parentStudent();
  if (!student) return logoutApp();
  const cls = studentClassForSelectedYear(student) || findById("classes", student.active_class_id);
  const todayRecord = latestStudentRecordForDate(student.id, today());
  const todaySchedules = cls ? schedulesTodayForClass(cls.id) : [];
  const records = parentAttendanceRecords();
  const totals = attendanceTotals(records);
  const percent = totals.total ? (((totals.hadir + totals.terlambat) / totals.total) * 100).toFixed(1) : "0.0";
  byId("view").innerHTML = `
    <section class="panel parent-dashboard">
      <div class="panel-head">
        <div>
          <span class="eyebrow">Pantauan Anak</span>
          <h2>${escapeHtml(student.name)}</h2>
          <p class="muted">${escapeHtml(displayName("classes", cls) || "-")} · NIS ${escapeHtml(student.nis || "-")}</p>
        </div>
      </div>
      <div class="summary-grid">
        ${card("Status Hari Ini", todayRecord ? badge(todayRecord.status) : "Belum ada data")}
        ${card("Jam Masuk", escapeHtml(todayRecord?.scan_time || "-"))}
        ${card("Jam Pulang", escapeHtml(todayRecord?.checkout_time || todayRecord?.end_time || "-"))}
        ${card("Keterangan", escapeHtml(todayRecord?.note || (todayRecord?.status === "terlambat" ? "Terlambat" : "-")))}
      </div>
    </section>
    <section class="panel parent-message-panel">
      <div class="panel-head"><div><span class="eyebrow">Pesan untuk Wali</span><h2>Terima kasih sudah ikut mengawasi kehadiran ananda.</h2><p class="muted">Perhatian kecil dari orang tua sangat membantu kedisiplinan anak di sekolah.</p></div></div>
    </section>
    <section class="panel parent-today-lessons">
      <div class="panel-head"><div><h2>Pelajaran Hari Ini</h2><p class="muted">Status mengikuti jadwal pelajaran dan absensi anak hari ini.</p></div></div>
      <div class="parent-lesson-list">
        ${todaySchedules.map(schedule => parentLessonTodayCard(schedule, student.id)).join("") || `<div class="empty-state">Belum ada jadwal pelajaran hari ini.</div>`}
      </div>
    </section>
    <section class="cards">
      ${card("Hadir", totals.hadir)}
      ${card("Izin", totals.izin)}
      ${card("Sakit", totals.sakit)}
      ${card("Alfa", totals.alfa)}
      ${card("Terlambat", totals.terlambat)}
      ${card("Kehadiran", `${percent}%`)}
    </section>`;
}

function parentLessonTodayCard(schedule, studentId) {
  const session = todaySessionForSchedule(schedule.id);
  const record = session ? state.db.attendance_records.find(r => r.session_id === session.id && r.student_id === studentId) : null;
  const status = record ? (statusLabels[record.status] || titleCase(record.status)) : parentScheduleStatusText(schedule, session);
  const time = record?.scan_time || schedule.start_time || "-";
  return `<article class="parent-lesson-card">
    <div>
      <strong>${escapeHtml(displayName("subjects", findById("subjects", schedule.subject_id)) || "-")}</strong>
      <span>${escapeHtml(displayName("teachers", findById("teachers", schedule.teacher_id)) || "-")} · ${escapeHtml(schedule.start_time)} - ${escapeHtml(schedule.end_time)}</span>
    </div>
    <p><b>${escapeHtml(time)}</b><small>Status: ${escapeHtml(status)}</small></p>
  </article>`;
}

function parentScheduleStatusText(schedule, session = null) {
  const timing = scheduleTimingState(schedule);
  if (timing === "future") return "Belum mulai";
  if (timing === "active") return session ? "Belum absen" : "Sedang berlangsung";
  if (timing === "past") return "Belum ada absensi";
  return `Jadwal ${schedule.day}`;
}

function parentLeaveTable() {
  const student = parentStudent();
  const rows = state.db.leave_requests
    .filter(leave => !leave.deleted_at && leave.student_id === student?.id)
    .sort((a, b) => String(b.created_at || b.start_date).localeCompare(String(a.created_at || a.start_date)))
    .slice(0, 8)
    .map(leave => `<tr><td>${escapeHtml(leave.start_date || "")}</td><td>${escapeHtml(statusLabels[leave.leave_type] || leave.leave_type || "")}</td><td>${badge(leave.status)}</td><td>${escapeHtml(leave.reason || "-")}</td><td>${escapeHtml(leave.approval_note || "-")}</td></tr>`)
    .join("");
  return `<div class="table-wrap"><table><thead><tr><th>Tanggal</th><th>Jenis</th><th>Status</th><th>Keterangan</th><th>Catatan Admin</th></tr></thead><tbody>${rows || emptyRow(5)}</tbody></table></div>`;
}

function renderParentHistory() {
  const student = parentStudent();
  if (!student) return logoutApp();
  const filter = state.filters.parentHistoryRange || "month";
  const start = state.filters.parentHistoryStart || "";
  const end = state.filters.parentHistoryEnd || "";
  let records = filterParentRecords(parentAttendanceRecords(), filter, start, end);
  const totals = attendanceTotals(records);
  const percent = totals.total ? (((totals.hadir + totals.terlambat) / totals.total) * 100).toFixed(1) : "0.0";
  const rows = records.sort((a, b) => String(b.date).localeCompare(String(a.date))).map(record => `
    <tr>
      <td>${escapeHtml(record.date || "")}</td>
      <td>${badge(record.status)}</td>
      <td>${escapeHtml(record.scan_time || "-")}</td>
      <td>${escapeHtml(record.checkout_time || record.end_time || "-")}</td>
      <td>${escapeHtml(record.note || "-")}</td>
      <td>${record.status === "terlambat" ? "Ya" : "Tidak"}</td>
    </tr>`).join("");
  byId("view").innerHTML = `
    <section class="panel">
      <div class="panel-head"><div><h2>Riwayat Absensi ${escapeHtml(student.name)}</h2><p class="muted">Data ini hanya untuk anak yang dipilih saat login wali murid.</p></div></div>
      <div class="filters">
        <select id="parent-history-range">
          <option value="today" ${filter === "today" ? "selected" : ""}>Hari ini</option>
          <option value="week" ${filter === "week" ? "selected" : ""}>Minggu ini</option>
          <option value="month" ${filter === "month" ? "selected" : ""}>Bulan ini</option>
          <option value="custom" ${filter === "custom" ? "selected" : ""}>Rentang tanggal</option>
        </select>
        <input type="date" id="parent-history-start" value="${escapeHtml(start)}">
        <input type="date" id="parent-history-end" value="${escapeHtml(end)}">
      </div>
    </section>
    <section class="cards">
      ${card("Hadir", totals.hadir)}
      ${card("Izin", totals.izin)}
      ${card("Sakit", totals.sakit)}
      ${card("Alfa", totals.alfa)}
      ${card("Terlambat", totals.terlambat)}
      ${card("Kehadiran", `${percent}%`)}
    </section>
    <section class="panel">
      <div class="table-wrap"><table><thead><tr><th>Tanggal</th><th>Status</th><th>Jam Masuk</th><th>Jam Pulang</th><th>Keterangan</th><th>Terlambat</th></tr></thead><tbody>${rows || emptyRow(6)}</tbody></table></div>
    </section>`;
  byId("parent-history-range").onchange = e => {
    state.filters.parentHistoryRange = e.target.value;
    renderParentHistory();
  };
  byId("parent-history-start").onchange = e => {
    state.filters.parentHistoryStart = e.target.value;
    state.filters.parentHistoryRange = "custom";
    renderParentHistory();
  };
  byId("parent-history-end").onchange = e => {
    state.filters.parentHistoryEnd = e.target.value;
    state.filters.parentHistoryRange = "custom";
    renderParentHistory();
  };
}

function filterParentRecords(records, filter, start, end) {
  const nowDate = new Date(today());
  if (filter === "today") return records.filter(record => record.date === today());
  if (filter === "week") {
    const day = nowDate.getDay() || 7;
    const first = new Date(nowDate);
    first.setDate(nowDate.getDate() - day + 1);
    const startDate = first.toISOString().slice(0, 10);
    return records.filter(record => record.date >= startDate && record.date <= today());
  }
  if (filter === "custom") {
    return records.filter(record => (!start || record.date >= start) && (!end || record.date <= end));
  }
  const month = today().slice(0, 7);
  return records.filter(record => String(record.date || "").startsWith(month));
}

function renderRankings() {
  const user = currentUser();
  if (user.role === "siswa") return renderStudentRankings(user.student_id);
  if (user.role === "wali_murid") return renderStudentRankings(user.murid_id, true);
  const q = state.filters.rankClassOverview || "";
  const unitFilter = activeUnit() || state.filters.rankClassUnit || "";
  const levelFilter = normalizeClassLevelFilter(unitFilter, state.filters.rankClassLevel || "");
  let classes = rankingClassesForUser();
  classes = filterClassListByUnitLevel(classes, unitFilter, levelFilter);
  if (q) classes = classes.filter(cls => JSON.stringify({
    ...cls,
    homeroom: displayName("teachers", findById("teachers", cls.homeroom_teacher_id)),
    semester: displayName("semesters", findById("semesters", cls.semester_id))
  }).toLowerCase().includes(q));
  const cards = classes.map(rankClassCard).join("");
  byId("view").innerHTML = `
    <section class="panel admin-workflow ranking-workflow">
      <div class="panel-head workflow-head">
        <div>
          <span class="eyebrow">Peringkat Manual</span>
          <h2>Peringkat Kelas</h2>
          <p class="muted">Wali kelas menginput nilai akhir secara manual. Sistem hanya mengurutkan, menyimpan arsip, dan menampilkan hasil setelah dipublikasikan.</p>
        </div>
        <div class="actions workflow-actions">${academicYearSwitcher("rankings")}</div>
      </div>
      <div class="filters workflow-search class-filter-tools">
        ${unitLevelFilterControls("rankClass", unitFilter, levelFilter)}
        <input data-search-rank-class placeholder="Cari kelas, unit, semester, atau wali kelas..." value="${escapeHtml(q)}">
      </div>
      <div class="class-management-grid ranking-class-grid">${cards || `<div class="empty-state">Belum ada kelas yang dapat dikelola untuk peringkat.</div>`}</div>
    </section>`;
  bindAcademicYearSwitcher(renderRankings);
  bindUnitLevelFilter(byId("view"), "rankClass", renderRankings);
  byId("view").querySelector("[data-search-rank-class]")?.addEventListener("input", e => {
    state.filters.rankClassOverview = e.target.value.toLowerCase();
    renderRankings();
  });
  byId("view").querySelectorAll("[data-open-ranking-class]").forEach(button => button.onclick = () => openClassRanking(button.dataset.openRankingClass));
}

function rankingClassesForUser() {
  const user = currentUser();
  let classes = classesForSelectedYear();
  if (user.role === "wali_kelas") classes = classes.filter(cls => cls.homeroom_teacher_id === user.teacher_id);
  if (user.role === "kepala_sekolah" && activeUnit()) classes = classes.filter(cls => classUnit(cls) === activeUnit());
  return classes.sort((a, b) => `${classUnit(a)}${classLevelValue(a)}${a.name}`.localeCompare(`${classUnit(b)}${classLevelValue(b)}${b.name}`));
}

function rankClassCard(cls) {
  const period = rankingPeriodForClass(cls.id);
  const results = period ? rankResultsForPeriod(period.id) : [];
  const filled = results.filter(result => result.score !== "" && result.score != null).length;
  const published = period?.status === "published";
  return `<article class="class-management-card ranking-class-card">
    <div class="class-card-main">
      <div>
        <span class="class-label">${escapeHtml(classUnit(cls))}</span>
        <h3>${escapeHtml(displayName("classes", cls) || "-")}</h3>
        <p>${escapeHtml(displayName("teachers", findById("teachers", cls.homeroom_teacher_id)) || "Wali kelas belum diatur")}</p>
      </div>
      <div class="student-count rank-count"><strong>${filled}</strong><span>Nilai</span></div>
    </div>
    <div class="class-meta-grid">
      <span><small>Tahun Ajaran</small><strong>${escapeHtml(selectedAcademicYearName())}</strong></span>
      <span><small>Semester</small><strong>${escapeHtml(displayName("semesters", findById("semesters", cls.semester_id)) || "-")}</strong></span>
      <span><small>Status</small><strong>${published ? "Publish" : "Draft"}</strong></span>
    </div>
    <div class="class-card-actions">
      <button class="primary" data-open-ranking-class="${cls.id}">Kelola Peringkat</button>
    </div>
  </article>`;
}

function selectedSemesterForRanking(cls = null) {
  if (cls?.semester_id) return cls.semester_id;
  const yearId = selectedAcademicYearId();
  const todayDate = today();
  return state.db.semesters.find(sem => !sem.deleted_at && sem.academic_year_id === yearId && sem.start_date <= todayDate && sem.end_date >= todayDate)?.id
    || state.db.semesters.find(sem => !sem.deleted_at && sem.academic_year_id === yearId && sem.is_active === "true")?.id
    || state.db.semesters.find(sem => !sem.deleted_at && sem.academic_year_id === yearId)?.id
    || "";
}

function rankingPeriodForClass(classId, create = false) {
  const cls = findById("classes", classId);
  if (!cls) return null;
  let period = state.db.rank_periods.find(item =>
    !item.deleted_at &&
    item.class_id === classId &&
    item.academic_year_id === cls.academic_year_id &&
    item.semester_id === selectedSemesterForRanking(cls)
  );
  if (!period && create) {
    period = {
      id: uid("rkp"),
      class_id: classId,
      academic_year_id: cls.academic_year_id,
      semester_id: selectedSemesterForRanking(cls),
      title: `Peringkat ${displayName("classes", cls)}`,
      status: "draft",
      visible_students: "false",
      visible_parents: "false",
      locked: "false",
      created_at: now(),
      updated_at: now(),
      created_by: currentUser().id
    };
    state.db.rank_periods.push(period);
    saveDb();
  }
  return period;
}

function rankResultsForPeriod(periodId) {
  return state.db.rank_results.filter(result => !result.deleted_at && result.period_id === periodId);
}

function openClassRanking(classId) {
  const cls = findById("classes", classId);
  if (!cls || !canManageRankingClass(cls)) return toast("Kelas peringkat tidak dapat diakses.", "error");
  const period = rankingPeriodForClass(classId, true);
  const students = studentsInClass(classId).sort((a, b) => String(a.name || "").localeCompare(String(b.name || "")));
  ensureRankResults(period, students);
  const results = rankResultsForPeriod(period.id);
  const resultByStudent = new Map(results.map(result => [result.student_id, result]));
  const rows = students.map((student, index) => {
    const result = resultByStudent.get(student.id) || {};
    return `<tr>
      <td>${index + 1}</td>
      <td><strong>${escapeHtml(student.name || "-")}</strong><small>${escapeHtml(student.nis || "-")} / ${escapeHtml(student.nisn || "-")}</small></td>
      <td><input name="score_${student.id}" type="number" min="0" max="1000" step="0.01" value="${escapeHtml(result.score ?? "")}" placeholder="Nilai"></td>
      <td><input name="note_${student.id}" value="${escapeHtml(result.note || "")}" placeholder="Catatan singkat"></td>
      <td>${result.rank ? rankingBadge(result, "mini") : `<span class="muted">Belum dihitung</span>`}</td>
    </tr>`;
  }).join("");
  modal(`Peringkat ${escapeHtml(displayName("classes", cls))}`, `
    <form id="ranking-form" class="wide ranking-manager">
      <div class="summary-grid">
        ${card("Kelas", escapeHtml(displayName("classes", cls)))}
        ${card("Siswa", students.length)}
        ${card("Status", period.status === "published" ? "Dipublikasikan" : "Draft")}
      </div>
      <p class="muted">Masukkan nilai akhir secara manual. Klik hitung untuk mengurutkan peringkat. Hasil hanya tampil ke siswa/wali murid setelah dipublikasikan.</p>
      <div class="table-wrap compact-table ranking-input-table">
        <table><thead><tr><th>No</th><th>Siswa</th><th>Nilai Akhir</th><th>Catatan</th><th>Peringkat</th></tr></thead><tbody>${rows || emptyRow(5)}</tbody></table>
      </div>
      <label class="wide">Catatan Publikasi<textarea name="summary_note" placeholder="Catatan umum untuk hasil peringkat kelas">${escapeHtml(period.summary_note || "")}</textarea></label>
      <div class="wide actions ranking-actions">
        <button class="secondary" type="submit" data-rank-action="draft">Simpan Draft</button>
        <button class="primary" type="submit" data-rank-action="publish">Hitung & Publikasikan</button>
        ${period.status === "published" ? `<button class="ghost" type="button" data-unpublish-ranking>Sembunyikan</button>` : ""}
        <button class="ghost" type="button" data-close>Tutup</button>
      </div>
    </form>`);
  const form = byId("ranking-form");
  form.querySelectorAll("[data-rank-action]").forEach(button => {
    button.onclick = () => form.dataset.action = button.dataset.rankAction;
  });
  form.onsubmit = e => {
    e.preventDefault();
    saveRankingForm(period, students, form, form.dataset.action === "publish");
    closeModal({ fromPopState: true });
    openClassRanking(classId);
  };
  form.querySelector("[data-unpublish-ranking]")?.addEventListener("click", () => {
    period.status = "draft";
    period.visible_students = "false";
    period.visible_parents = "false";
    period.updated_at = now();
    period.updated_by = currentUser().id;
    saveDb();
    closeModal({ fromPopState: true });
    openClassRanking(classId);
    toast("Peringkat disembunyikan dari siswa dan wali murid.", "ok");
  });
}

function canManageRankingClass(cls) {
  const user = currentUser();
  if (user.role === "super_admin") return true;
  if (user.role === "kepala_sekolah") return !activeUnit() || classUnit(cls) === activeUnit();
  if (user.role === "wali_kelas") return cls.homeroom_teacher_id === user.teacher_id;
  return false;
}

function ensureRankResults(period, students) {
  const existing = new Set(rankResultsForPeriod(period.id).map(result => result.student_id));
  students.forEach(student => {
    if (existing.has(student.id)) return;
    state.db.rank_results.push({
      id: uid("rkr"),
      period_id: period.id,
      student_id: student.id,
      score: "",
      note: "",
      rank: "",
      badge: "",
      created_at: now(),
      updated_at: now(),
      created_by: currentUser().id
    });
  });
}

function saveRankingForm(period, students, form, publish = false) {
  const fd = formData(form);
  const resultByStudent = new Map(rankResultsForPeriod(period.id).map(result => [result.student_id, result]));
  students.forEach(student => {
    let result = resultByStudent.get(student.id);
    if (!result) {
      result = { id: uid("rkr"), period_id: period.id, student_id: student.id, created_at: now(), created_by: currentUser().id };
      state.db.rank_results.push(result);
    }
    result.score = fd[`score_${student.id}`] ?? "";
    result.note = fd[`note_${student.id}`] || "";
    result.updated_at = now();
    result.updated_by = currentUser().id;
  });
  calculateRanking(period.id);
  period.summary_note = fd.summary_note || "";
  period.status = publish ? "published" : "draft";
  period.visible_students = publish ? "true" : "false";
  period.visible_parents = publish ? "true" : "false";
  period.published_at = publish ? now() : period.published_at || "";
  period.updated_at = now();
  period.updated_by = currentUser().id;
  saveDb();
  toast(publish ? "Peringkat dihitung dan dipublikasikan." : "Draft peringkat disimpan.", "ok");
}

function calculateRanking(periodId) {
  const results = rankResultsForPeriod(periodId)
    .filter(result => result.score !== "" && result.score != null && !Number.isNaN(Number(result.score)))
    .sort((a, b) => Number(b.score) - Number(a.score) || String(displayName("students", findById("students", a.student_id))).localeCompare(String(displayName("students", findById("students", b.student_id)))));
  let lastScore = null;
  let lastRank = 0;
  results.forEach((result, index) => {
    const score = Number(result.score);
    const rank = score === lastScore ? lastRank : index + 1;
    result.rank = String(rank);
    result.badge = rankingBadgeName(rank);
    lastScore = score;
    lastRank = rank;
  });
}

function rankingBadgeName(rank) {
  if (Number(rank) === 1) return "Top Kelas";
  if (Number(rank) === 2) return "Runner Up";
  if (Number(rank) === 3) return "Third Place";
  if (Number(rank) <= 10) return "Top 10";
  return "Peringkat Kelas";
}

function rankingBadge(result, size = "normal") {
  const rank = Number(result?.rank || 0);
  const tier = rank === 1 ? "gold" : rank === 2 ? "silver" : rank === 3 ? "bronze" : rank <= 10 ? "top" : "base";
  return `<span class="rank-badge ${tier} ${size}">
    <i aria-hidden="true"></i>
    <strong>#${escapeHtml(result?.rank || "-")}</strong>
    <small>${escapeHtml(result?.badge || rankingBadgeName(rank))}</small>
  </span>`;
}

function publishedRankHistoryForStudent(studentId, forParent = false) {
  return state.db.rank_results
    .filter(result => !result.deleted_at && result.student_id === studentId && result.rank)
    .map(result => ({ result, period: findById("rank_periods", result.period_id) }))
    .filter(({ period }) => period && !period.deleted_at && period.status === "published" && (forParent ? period.visible_parents !== "false" : period.visible_students !== "false"))
    .sort((a, b) => String(b.period.published_at || b.period.updated_at || "").localeCompare(String(a.period.published_at || a.period.updated_at || "")));
}

function renderStudentRankings(studentId, forParent = false) {
  const student = findById("students", studentId);
  if (!student) return logoutApp();
  const history = publishedRankHistoryForStudent(student.id, forParent);
  const latest = history[0];
  byId("view").innerHTML = `
    <section class="panel rank-hero-panel">
      <div class="panel-head">
        <div>
          <span class="eyebrow">Riwayat Peringkat</span>
          <h2>${escapeHtml(student.name)}</h2>
          <p class="muted">Peringkat hanya tampil setelah wali kelas mempublikasikan hasil semester.</p>
        </div>
      </div>
      ${latest ? rankHistoryHero(latest) : `<div class="empty-state">Belum ada peringkat yang dipublikasikan.</div>`}
    </section>
    <section class="panel">
      <div class="panel-head"><div><h2>Arsip Badge Semester</h2><p class="muted">History tetap tersimpan walaupun siswa naik kelas atau lulus.</p></div></div>
      <div class="rank-history-grid">
        ${history.map(rankHistoryCard).join("") || `<div class="empty-state">Belum ada arsip peringkat.</div>`}
      </div>
    </section>`;
}

function rankHistoryHero(item) {
  const { result, period } = item;
  const cls = findById("classes", period.class_id);
  const total = rankResultsForPeriod(period.id).filter(row => row.rank).length;
  return `<div class="rank-hero-card">
    ${rankingBadge(result, "large")}
    <div>
      <h3>Peringkat ${escapeHtml(result.rank)} dari ${total || "-"} siswa</h3>
      <p>${escapeHtml(displayName("classes", cls) || "-")} · ${escapeHtml(displayName("semesters", findById("semesters", period.semester_id)) || "-")} · ${escapeHtml(displayName("academic_years", findById("academic_years", period.academic_year_id)) || "-")}</p>
      <strong>Nilai Akhir: ${escapeHtml(result.score || "-")}</strong>
      ${result.note ? `<small>${escapeHtml(result.note)}</small>` : ""}
    </div>
  </div>`;
}

function rankHistoryCard(item) {
  const { result, period } = item;
  const cls = findById("classes", period.class_id);
  const total = rankResultsForPeriod(period.id).filter(row => row.rank).length;
  return `<article class="rank-history-card">
    ${rankingBadge(result)}
    <div>
      <strong>${escapeHtml(displayName("semesters", findById("semesters", period.semester_id)) || "-")} ${escapeHtml(displayName("academic_years", findById("academic_years", period.academic_year_id)) || "")}</strong>
      <span>${escapeHtml(displayName("classes", cls) || "-")}</span>
      <small>Peringkat ${escapeHtml(result.rank || "-")} dari ${total || "-"} siswa · Nilai ${escapeHtml(result.score || "-")}</small>
      ${result.note ? `<p>${escapeHtml(result.note)}</p>` : ""}
    </div>
  </article>`;
}

function latestRankCardForStudent(studentId, forParent = false) {
  const latest = publishedRankHistoryForStudent(studentId, forParent)[0];
  if (!latest) return "";
  return `<section class="panel compact-rank-panel">
    <div class="panel-head"><div><span class="eyebrow">Peringkat Terbaru</span><h2>Badge Semester</h2></div><button class="ghost" data-open-rankings>Riwayat</button></div>
    ${rankHistoryHero(latest)}
  </section>`;
}

function bindRankingShortcut() {
  byId("view").querySelectorAll("[data-open-rankings]").forEach(button => button.onclick = () => navigate("rankings"));
}

function openCurrentUserRankingHistory() {
  const user = currentUser();
  const studentId = user.role === "wali_murid" ? user.murid_id : user.student_id;
  if (!studentId) return toast("Riwayat peringkat hanya tersedia untuk siswa atau wali murid.", "error");
  openRankingHistoryModal(studentId, user.role === "wali_murid");
}

function openRankingHistoryModal(studentId, forParent = false) {
  const student = findById("students", studentId);
  if (!student) return toast("Data siswa tidak ditemukan.", "error");
  const history = publishedRankHistoryForStudent(student.id, forParent);
  modal("Riwayat Peringkat", `
    <section class="rank-history-modal">
      <div class="rank-history-head">
        <div>
          <span class="eyebrow">Badge Peringkat</span>
          <h3>${escapeHtml(student.name || "-")}</h3>
          <p class="muted">Urutan terbaru ada di kiri. Semakin lama riwayatnya, opacity badge dibuat lebih rendah.</p>
        </div>
      </div>
      ${history.length ? rankingTimeline(history) : `<div class="empty-state">Belum ada peringkat yang dipublikasikan.</div>`}
    </section>`);
}

function rankingTimeline(history) {
  return `<div class="rank-timeline-wrap">
    <div class="rank-timeline">
      ${history.map((item, index) => `${rankTimelineCard(item, index)}${index < history.length - 1 ? `<span class="rank-timeline-arrow" aria-hidden="true">›</span>` : ""}`).join("")}
    </div>
  </div>`;
}

function rankTimelineCard(item, index) {
  const { result, period } = item;
  const cls = findById("classes", period.class_id);
  const total = rankResultsForPeriod(period.id).filter(row => row.rank).length;
  const opacity = Math.max(0.36, 1 - index * 0.16).toFixed(2);
  return `<article class="rank-season-card" style="--rank-opacity:${opacity}">
    <div class="rank-season-top">
      <strong>${escapeHtml(displayName("semesters", findById("semesters", period.semester_id)) || "-")}</strong>
      <small>${escapeHtml(displayName("academic_years", findById("academic_years", period.academic_year_id)) || "-")}</small>
    </div>
    ${rankingBadge(result, "season")}
    <div class="rank-season-copy">
      <b>${escapeHtml(displayName("classes", cls) || "-")}</b>
      <span>Peringkat ${escapeHtml(result.rank || "-")} dari ${total || "-"} siswa</span>
      <small>Nilai ${escapeHtml(result.score || "-")}</small>
      ${result.note ? `<em>${escapeHtml(result.note)}</em>` : ""}
    </div>
  </article>`;
}

function renderParentLeaveRequests() {
  const student = parentStudent();
  if (!student) return logoutApp();
  byId("view").innerHTML = `
    <section class="panel">
      <div class="panel-head">
        <div><h2>Pengajuan Izin/Sakit</h2><p class="muted">Pengajuan wali murid berstatus menunggu sampai disetujui guru, wali kelas, atau admin.</p></div>
        <button class="primary" data-parent-add-leave>Ajukan Izin/Sakit</button>
      </div>
      ${parentLeaveTable()}
    </section>`;
  byId("view").querySelector("[data-parent-add-leave]")?.addEventListener("click", openParentLeaveForm);
}

function renderParentLeaveAdmin() {
  const rows = visibleRows("leave_requests")
    .filter(leave => leave.created_by_role === "wali_murid")
    .sort((a, b) => String(b.created_at || b.start_date).localeCompare(String(a.created_at || a.start_date)));
  const body = rows.map(leave => {
    const student = findById("students", leave.student_id);
    const cls = findById("classes", leave.class_id);
    return `<tr>
      <td>${escapeHtml(leave.start_date || "")}</td>
      <td>${escapeHtml(student?.name || "-")}</td>
      <td>${escapeHtml(displayName("classes", cls) || "-")}</td>
      <td>${escapeHtml(statusLabels[leave.leave_type] || leave.leave_type || "-")}</td>
      <td>${escapeHtml(leave.reason || "-")}</td>
      <td>${evidenceLink(leave.attachment)}</td>
      <td>${badge(leave.status)}</td>
      <td>${escapeHtml(leave.approval_note || "-")}</td>
      <td class="row-actions">
        ${leave.status === "pending" && canApproveLeaveFor(leave.class_id) ? `<button class="secondary" data-approve="${leave.id}">Setujui</button><button class="ghost" data-reject="${leave.id}">Tolak</button>` : ""}
      </td>
    </tr>`;
  }).join("");
  byId("view").innerHTML = `
    <section class="panel">
      <div class="panel-head"><div><h2>Pengajuan Izin Wali</h2><p class="muted">Pengajuan dari wali murid tidak mengubah absensi sampai disetujui.</p></div></div>
      <div class="table-wrap"><table><thead><tr><th>Tanggal</th><th>Siswa</th><th>Kelas</th><th>Jenis</th><th>Keterangan</th><th>Bukti</th><th>Status</th><th>Catatan</th><th>Aksi</th></tr></thead><tbody>${body || emptyRow(9)}</tbody></table></div>
    </section>`;
  byId("view").querySelectorAll("[data-approve]").forEach(button => button.onclick = () => approveLeave(button.dataset.approve));
  byId("view").querySelectorAll("[data-reject]").forEach(button => button.onclick = () => openRejectLeave(button.dataset.reject));
  bindEvidenceLinks(byId("view"));
}

function openParentLeaveForm() {
  const student = parentStudent();
  const cls = student ? studentClassForSelectedYear(student) || findById("classes", student.active_class_id) : null;
  if (!student || !cls) return toast("Data siswa atau kelas tidak ditemukan.", "error");
  modal("Ajukan Izin/Sakit", `<form id="parent-leave-form" class="form-grid">
    <label>Tanggal<input name="date" type="date" value="${today()}" required></label>
    <label>Jenis<select name="type" required><option value="izin">Izin</option><option value="sakit">Sakit</option></select></label>
    <label class="wide">Keterangan<textarea name="reason" required></textarea></label>
    <label class="wide image-upload-field">Bukti
      <span class="image-upload-empty">Belum ada gambar</span>
      <input type="hidden" name="attachment" value="">
      <input name="attachment__file" type="file" accept="image/*" capture="environment">
      <small>Opsional. Upload atau foto surat/bukti jika ada.</small>
    </label>
    <div class="wide actions"><button class="primary">Kirim Pengajuan</button><button class="ghost" type="button" data-close>Batal</button></div>
  </form>`);
  byId("parent-leave-form").onsubmit = async e => {
    e.preventDefault();
    const fd = await formDataWithImages(e.target);
    const leave = {
      id: uid("lea"),
      student_id: student.id,
      class_id: cls.id,
      academic_year_id: cls.academic_year_id,
      semester_id: cls.semester_id,
      leave_type: fd.type,
      start_date: fd.date,
      end_date: fd.date,
      reason: fd.reason,
      attachment: fd.attachment || "",
      status: "pending",
      approval_note: "",
      created_by_role: "wali_murid",
      created_by_parent_name: currentUser().name,
      created_at: now(),
      updated_at: now()
    };
    state.db.leave_requests.push(leave);
    saveDb();
    closeModal({ fromPopState: true });
    renderParentLeaveRequests();
    toast("Pengajuan dikirim. Menunggu persetujuan.", "ok");
  };
}

function headmasterUnitSwitcher(mode = "desktop") {
  const user = currentUser();
  if (!["kepala_sekolah", "guru", "wali_kelas"].includes(user?.role)) return "";
  const units = accessUnitsForUser(user);
  if (!units.length) return "";
  const active = activeUnit(user);
  return `<label class="headmaster-unit-switcher ${mode === "mobile" ? "compact" : ""}">
    <span>Unit</span>
    <select data-headmaster-unit-switch ${units.length === 1 ? "disabled" : ""}>${units.map(unit => `<option value="${unit}" ${unit === active ? "selected" : ""}>${unit}</option>`).join("")}</select>
  </label>`;
}

function bindHeadmasterUnitSwitcher(root = document) {
  root.querySelectorAll("[data-headmaster-unit-switch]").forEach(select => {
    select.onchange = () => {
      const user = currentUser();
      localStorage.setItem(activeUnitStorageKey(user), select.value);
      if (user?.role === "kepala_sekolah") localStorage.setItem(headmasterUnitStorageKey(user), select.value);
      ["studentClassUnit", "subjectClassUnit", "leaveClassUnit"].forEach(key => state.filters[key] = "");
      if (state.filters.reportFilters) {
        state.filters.reportFilters.unit = select.value;
        ["class_id", "student_id", "subject_id", "teacher_id"].forEach(key => delete state.filters.reportFilters[key]);
      }
      updateMobileSchoolBar();
      navigate(state.page, { replaceHistory: true });
    };
  });
}

function maskStudentIdentity(value) {
  const text = String(value || "-");
  if (text === "-") return "-";
  return "*".repeat(Math.max(6, Math.min(text.length, 10)));
}

function bindStudentIdentityToggle() {
  byId("view").querySelector("[data-toggle-student-secret]")?.addEventListener("click", () => {
    state.filters.student_identity_hidden = state.filters.student_identity_hidden === "true" ? "false" : "true";
    renderStudentDashboard();
  });
}

function renderStudentToday() {
  const user = currentUser();
  const student = state.db.students.find(s => s.id === user.student_id);
  if (!student) return renderProfile();
  const cls = studentClassForSelectedYear(student) || findById("classes", student.active_class_id);
  const todayRecords = recordsForSelectedYear().filter(r => r.student_id === student.id && r.date === today());
  const todaySchedules = cls ? schedulesTodayForClass(cls.id) : [];
  byId("view").innerHTML = `
    <section class="panel">
      <div class="panel-head"><div><h2>Jadwal Hari Ini</h2><p class="muted">Jadwal mengikuti hari ini, guru pengajar, dan jam pelajaran yang sudah dibuat Administrator.</p></div></div>
      <div class="table-wrap"><table><thead><tr><th>Mapel</th><th>Guru</th><th>Jam Pelajaran</th><th>Ruang</th><th>Status</th></tr></thead><tbody>
        ${todaySchedules.map(s => studentTodayScheduleRow(s, student.id)).join("") || emptyRow(5)}
      </tbody></table></div>
    </section>
    <section class="panel">
      <div class="panel-head"><div><h2>Status Hari Ini</h2><p class="muted">Absensi hanya tercatat jika guru membuka sesi jadwal.</p></div></div>
      <div class="table-wrap"><table><thead><tr><th>Mapel</th><th>Guru</th><th>Jam</th><th>Status</th></tr></thead><tbody>
        ${todayRecords.map(r => `<tr><td>${refName("subjects")(r.subject_id)}</td><td>${refName("teachers")(r.teacher_id)}</td><td>${escapeHtml(r.start_time)} - ${escapeHtml(r.end_time)}</td><td>${badge(r.status)}</td></tr>`).join("") || emptyRow(4)}
      </tbody></table></div>
    </section>`;
}

function studentClassForSelectedYear(student) {
  if (student.active_academic_year_id === selectedAcademicYearId()) return findById("classes", student.active_class_id);
  const history = state.db.student_class_histories.find(item =>
    item.student_id === student.id &&
    item.academic_year_id === selectedAcademicYearId() &&
    !item.deleted_at
  );
  return history ? findById("classes", history.class_id) : null;
}

function studentLoginMessage(student) {
  const starts = [
    "Kalau malas datang",
    "Kalau buku masih tertutup",
    "Kalau catatan masih kosong",
    "Kalau niat belajar cuma jadi hiasan",
    "Kalau tugas mulai menatap balik",
    "Kalau otak masih mode hemat daya",
    "Kalau kelas terasa berat",
    "Kalau PR terasa seperti legenda",
    "Kalau semangat belum bangun",
    "Kalau fokus sedang kabur",
    "Kalau jadwal terlihat padat",
    "Kalau ujian terasa jauh",
    "Kalau nilai ingin naik",
    "Kalau guru sudah menjelaskan",
    "Kalau absensi sudah hadir",
    "Kalau masa depan belum punya peta",
    "Kalau satu halaman terasa banyak",
    "Kalau rumus terasa asing",
    "Kalau hafalan mulai menguap",
    "Kalau belajar terasa sepi"
  ];
  const middles = [
    "ingat nilai tidak naik karena kasihan",
    "ingat paham itu hasil berantem sehat dengan materi",
    "ingat scroll cepat tidak otomatis membuat otak cepat",
    "ingat ujian suka menagih yang dulu diremehkan",
    "ingat menunda itu cicilan panik",
    "ingat hadir saja belum cukup kalau pikiran parkir di luar",
    "ingat guru bukan mesin pengulang tanpa batas",
    "ingat catatan rapi lebih berguna daripada alasan rapi",
    "ingat masa depan jarang percaya janji kosong",
    "ingat satu konsep kecil bisa menyelamatkan satu soal besar",
    "ingat kelas bukan tempat numpang sinyal saja",
    "ingat belajar lima belas menit tetap lebih nyata dari niat dua jam",
    "ingat malas itu kreatif mencari alasan",
    "ingat nilai bagus punya hubungan dekat dengan latihan",
    "ingat ponsel bisa dicas, semangat juga bisa dipaksa mulai",
    "ingat tidak paham itu normal, tidak mencoba itu masalah",
    "ingat pelajaran kecil sering menyamar jadi soal besar",
    "ingat disiplin itu tabungan yang tidak kelihatan dulu",
    "ingat bertanya itu lebih murah daripada remedial",
    "ingat otak perlu bukti, bukan pidato motivasi"
  ];
  const endings = [
    "jadi buka bukunya sebelum drama dimulai.",
    "jadi catat dulu, panik belakangan tidak usah.",
    "jadi dengarkan sebentar, masa depanmu ikut menunggu.",
    "jadi mulai dari satu soal, bukan satu alasan.",
    "jadi hadirkan kepala, bukan cuma nama di absensi.",
    "jadi rapikan fokus sebelum pelajaran merapikanmu.",
    "jadi kerjakan yang bisa, lalu kejar yang belum.",
    "jadi gunakan hari ini sebelum jadi penyesalan besok.",
    "jadi jangan cuma siap ketika sudah terlambat.",
    "jadi buktikan niatmu punya tenaga.",
    "jadi simpan malasnya untuk libur resmi.",
    "jadi belajar dulu, gaya boleh menyusul.",
    "jadi jangan tunggu pintar untuk mulai belajar.",
    "jadi jadikan kelas ini investasi kecil.",
    "jadi kalau bingung, tanya sebelum tersesat jauh.",
    "jadi biarkan usahamu lebih lantang dari keluhan.",
    "jadi jangan berharap QR men-scan prestasi.",
    "jadi beri otak pekerjaan yang layak.",
    "jadi ambil poin kecil yang tersedia hari ini.",
    "jadi pulanglah dengan satu hal baru, minimal."
  ];
  const seed = state.session?.quoteSeed || `${today()}-${student.id}`;
  const hash = hashText(`${seed}-${student.id}-${student.nisn || ""}`);
  return `${starts[hash % starts.length]}, ${middles[Math.floor(hash / starts.length) % middles.length]}, ${endings[Math.floor(hash / (starts.length * middles.length)) % endings.length]}`;
}

function hashText(text) {
  let hash = 2166136261;
  for (const ch of String(text || "")) {
    hash ^= ch.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function showMyQr() {
  const user = currentUser();
  const student = state.db.students.find(s => s.id === user.student_id);
  if (!student) return toast("Data siswa tidak ditemukan.", "error");
  state.page = "my_qr";
  renderMenu();
  showQrCards([student]);
}

function renderTeacherDashboard() {
  const user = currentUser();
  const teacher = state.db.teachers.find(t => t.id === user.teacher_id);
  const date = today();
  const day = dayName(new Date());
  const schedules = schedulesForSelectedYear().filter(s => s.teacher_id === teacher?.id && s.day === day && s.active !== "false");
  const sessions = filterBySelectedAcademicYear("attendance_sessions", state.db.attendance_sessions).filter(s => s.teacher_id === teacher?.id && s.date === date);
  const records = recordsForSelectedYear().filter(r => r.teacher_id === teacher?.id && r.date === date);
  const totals = attendanceTotals(records);
  byId("view").innerHTML = `
    <section class="mobile-dashboard">
      <article class="session-hero">
        <span>Teacher Dashboard</span>
        <h2>${escapeHtml(teacher?.name || user.name)}</h2>
        <div><b>▦</b> ${schedules.length} jadwal hari ini <b>◷</b> ${sessions.filter(s => s.status === "open").length} sesi berjalan</div>
      </article>
      <div class="mini-stats">
        ${dashboardStatusCard("hadir", totals.hadir)}
        ${dashboardStatusCard("terlambat", totals.terlambat)}
        ${dashboardStatusCard("izin", totals.izin)}
        ${dashboardStatusCard("alfa", totals.alfa)}
      </div>
      <article class="pending-card"><strong>${sessions.filter(s => s.status === "open").length}</strong><span>Sesi Aktif</span></article>
    </section>
    <section class="panel">
      <div class="panel-head"><div><h2>Jadwal Mengajar Hari Ini</h2><p class="muted">Buka sesi dari jadwal hari ini, lalu scan QR siswa.</p></div></div>
      <div class="table-wrap"><table><thead><tr><th>Kelas</th><th>Mapel</th><th>Jam</th><th>Status</th></tr></thead><tbody>
        ${schedules.map(s => {
          const ses = state.db.attendance_sessions.find(x => x.schedule_id === s.id && x.date === date && x.status !== "cancelled");
          return `<tr><td>${refName("classes")(s.class_id)}</td><td>${refName("subjects")(s.subject_id)}</td><td>${escapeHtml(s.start_time)} - ${escapeHtml(s.end_time)}</td><td>${ses ? badge(ses.status) : scheduleOpenReason(s)}</td></tr>`;
        }).join("") || emptyRow(4)}
      </tbody></table></div>
    </section>`;
  bindDashboardStatusCards(records, "Dashboard Guru");
}

function schedulesTodayForClass(classId) {
  const day = dayName(new Date());
  return schedulesForSelectedYear()
    .filter(s => !s.deleted_at && s.active !== "false" && s.class_id === classId && s.day === day)
    .sort((a, b) => timeToMinutes(a.start_time) - timeToMinutes(b.start_time));
}

function studentTodayScheduleRow(schedule, studentId) {
  const session = todaySessionForSchedule(schedule.id);
  const record = session ? state.db.attendance_records.find(r => r.session_id === session.id && r.student_id === studentId) : null;
  const status = record ? badge(record.status) : studentScheduleStatusText(schedule, session);
  return `<tr>
    <td>${refName("subjects")(schedule.subject_id)}</td>
    <td>${refName("teachers")(schedule.teacher_id)}</td>
    <td>${escapeHtml(schedule.start_time)} - ${escapeHtml(schedule.end_time)}</td>
    <td>${escapeHtml(schedule.room || "-")}</td>
    <td>${status}</td>
  </tr>`;
}

function studentScheduleStatusText(schedule, session = null) {
  const timing = scheduleTimingState(schedule);
  if (timing === "wrong_day") return `Jadwal ${schedule.day}`;
  if (timing === "future") return "Sesi belum dibuka";
  if (timing === "active") return session ? "Pelajaran sedang dimulai" : "Pelajaran sedang dimulai, sesi belum dibuka guru";
  return "Sesi sudah lewat. Cek kehadiranmu di history";
}

function renderHomeroomDashboard() {
  const user = currentUser();
  const teacher = state.db.teachers.find(t => t.id === user.teacher_id);
  const classes = classesForSelectedYear().filter(c => c.homeroom_teacher_id === teacher?.id);
  const ids = new Set(classes.map(c => c.id));
  const students = visibleRows("students").filter(s => ids.has(s.active_class_id));
  const records = recordsForSelectedYear().filter(r => ids.has(r.class_id));
  const totals = attendanceTotals(records);
  const pendingLeaves = visibleRows("leave_requests").filter(l => ids.has(l.class_id) && l.status === "pending");
  const todaySchedules = schedulesForSelectedYear()
    .filter(s => s.active !== "false" && ids.has(s.class_id) && s.day === dayName(new Date()))
    .sort((a, b) => timeToMinutes(a.start_time) - timeToMinutes(b.start_time));
  byId("view").innerHTML = `
    <section class="mobile-dashboard">
      <article class="session-hero"><span>Homeroom</span><h2>${escapeHtml(classes.map(c => c.name).join(", ") || "Belum Ada Kelas")}</h2><div><b>♙</b> ${students.length} siswa aktif <b>▣</b> ${pendingLeaves.length} izin menunggu</div></article>
      <div class="mini-stats">
        ${dashboardStatusCard("hadir", totals.hadir)}
        ${dashboardStatusCard("terlambat", totals.terlambat)}
        ${dashboardStatusCard("izin", totals.izin)}
        ${dashboardStatusCard("alfa", totals.alfa)}
      </div>
    </section>
    <section class="panel">
      <div class="panel-head"><div><h2>Jadwal Kelas Hari Ini</h2><p class="muted">Jadwal hari ini untuk kelas yang dipegang wali kelas.</p></div></div>
      <div class="table-wrap"><table><thead><tr><th>Kelas</th><th>Mapel</th><th>Guru</th><th>Jam</th><th>Status Sesi</th></tr></thead><tbody>
        ${todaySchedules.map(s => `<tr><td>${refName("classes")(s.class_id)}</td><td>${refName("subjects")(s.subject_id)}</td><td>${refName("teachers")(s.teacher_id)}</td><td>${escapeHtml(s.start_time)} - ${escapeHtml(s.end_time)}</td><td>${todaySessionForSchedule(s.id) ? badge(todaySessionForSchedule(s.id).status) : studentScheduleStatusText(s)}</td></tr>`).join("") || emptyRow(5)}
      </tbody></table></div>
    </section>
    <section class="panel"><div class="panel-head"><div><h2>Siswa Perlu Perhatian</h2><p class="muted">Diurutkan dari jumlah alfa dan terlambat tertinggi.</p></div></div>${attentionTable(students, records)}</section>
    ${profileSummaryCard()}`;
  bindDashboardStatusCards(records, "Dashboard Wali Kelas");
  bindProfileSummaryActions();
}

function renderHeadmasterDashboard() {
  const records = recordsForSelectedYear();
  const totals = attendanceTotals(records);
  const pct = totals.total ? (((totals.hadir + totals.terlambat) / totals.total) * 100).toFixed(1) : "0.0";
  const todaySchedules = schedulesForSelectedYear().filter(s => !s.deleted_at && s.active !== "false" && s.day === dayName(new Date()));
  byId("view").innerHTML = `
    <section class="cards">
      ${card("Siswa Aktif", visibleRows("students").length)}
      ${card("Guru Aktif", visibleRows("teachers").length)}
      ${card("Kelas", classesForSelectedYear().length)}
      ${card("Kehadiran", `${pct}%`)}
    </section>
    <section class="mobile-dashboard">
      <article class="total-card"><span>Rekap Seluruh Sekolah</span><strong>${pct}%</strong><small>${totals.total} sesi tercatat</small></article>
      <div class="mini-stats">
        ${dashboardStatusCard("hadir", totals.hadir)}
        ${dashboardStatusCard("terlambat", totals.terlambat)}
        ${dashboardStatusCard("izin", totals.izin)}
        ${dashboardStatusCard("alfa", totals.alfa)}
      </div>
    </section>
    <section class="panel">
      <div class="panel-head"><div><h2>Jadwal Sekolah Hari Ini</h2><p class="muted">Kepala sekolah dapat memantau jadwal dan status sesi hari ini.</p></div><div class="actions"><button class="primary" data-headmaster-meeting>Rapat</button></div></div>
      <div class="table-wrap"><table><thead><tr><th>Kelas</th><th>Mapel</th><th>Guru</th><th>Jam</th><th>Status Sesi</th></tr></thead><tbody>
        ${todaySchedules.map(s => `<tr><td>${refName("classes")(s.class_id)}</td><td>${refName("subjects")(s.subject_id)}</td><td>${refName("teachers")(s.teacher_id)}</td><td>${escapeHtml(s.start_time)} - ${escapeHtml(s.end_time)}</td><td>${todaySessionForSchedule(s.id) ? badge(todaySessionForSchedule(s.id).status) : studentScheduleStatusText(s)}</td></tr>`).join("") || emptyRow(5)}
      </tbody></table></div>
    </section>`;
  byId("view").querySelector("[data-headmaster-meeting]")?.addEventListener("click", () => openMeetingForm());
  bindDashboardStatusCards(records, "Dashboard Kepala Sekolah");
}

function attendanceTotals(records) {
  return records.reduce((a, r) => {
    if (a[r.status] !== undefined) a[r.status]++;
    a.total++;
    return a;
  }, { hadir: 0, terlambat: 0, izin: 0, sakit: 0, alfa: 0, total: 0 });
}

function dashboardStatusCard(status, count) {
  const strongClass = status === "hadir" ? "ok-text" : status === "alfa" ? "danger-text" : "";
  return `<button type="button" class="status-stat-card" data-dashboard-status="${status}">
    <strong class="${strongClass}">${count}</strong>
    <span>${statusLabels[status] || titleCase(status)}</span>
  </button>`;
}

function bindDashboardStatusCards(records, scopeTitle) {
  byId("view").querySelectorAll("[data-dashboard-status]").forEach(card => {
    card.onclick = () => showDashboardStatusRecords(records, card.dataset.dashboardStatus, scopeTitle);
  });
}

function showDashboardStatusRecords(records, status, scopeTitle) {
  const rows = records
    .filter(r => r.status === status)
    .sort((a, b) => `${b.date || ""} ${b.scan_time || b.start_time || ""}`.localeCompare(`${a.date || ""} ${a.scan_time || a.start_time || ""}`))
    .map((r, i) => {
      const student = findById("students", r.student_id);
      return `<tr>
        <td>${i + 1}</td>
        <td>${escapeHtml(student?.name || "-")}</td>
        <td>${escapeHtml(student?.nisn || "-")}</td>
        <td>${refName("classes")(r.class_id)}</td>
        <td>${refName("subjects")(r.subject_id)}</td>
        <td>${refName("teachers")(r.teacher_id)}</td>
        <td>${escapeHtml(r.date || "-")}</td>
        <td>${escapeHtml(r.scan_time || r.start_time || "-")}</td>
        <td>${badge(r.status)}</td>
      </tr>`;
    })
    .join("");
  modal(`${statusLabels[status] || titleCase(status)} - ${scopeTitle}`, `
    <p class="muted">Data mengikuti tahun ajaran ${escapeHtml(selectedAcademicYearName())} dan cakupan akses role yang sedang login.</p>
    <div class="table-wrap dashboard-status-table">
      <table>
        <thead><tr><th>No</th><th>Siswa</th><th>NISN</th><th>Kelas</th><th>Mapel</th><th>Guru</th><th>Tanggal</th><th>Jam</th><th>Status</th></tr></thead>
        <tbody>${rows || emptyRow(9)}</tbody>
      </table>
    </div>
  `);
}

function profileSummaryCard() {
  const user = currentUser();
  if (!user || user.role === "super_admin") return "";
  const details = profileDetails(user);
  return `<section class="profile-summary-card">
    ${profileAvatarHtml(user)}
    <div class="profile-summary-body">
      <span>${escapeHtml(roles[user.role] || user.role)}</span>
      <h2>${escapeHtml(user.name || "-")}</h2>
      <div class="profile-biodata-grid">
        ${details.map(([label, value]) => `<p><small>${escapeHtml(label)}</small><strong>${escapeHtml(value || "-")}</strong></p>`).join("")}
      </div>
    </div>
    <div class="profile-summary-actions">
      <button class="secondary" data-go-profile>Profil</button>
      <button class="ghost" data-inline-logout>Keluar</button>
    </div>
  </section>`;
}

function profileAvatarHtml(user) {
  const student = ["siswa", "wali_murid"].includes(user.role) ? findById("students", user.student_id || user.murid_id) : null;
  const photo = student?.photo;
  return `<div class="profile-avatar">${photo ? `<img src="${escapeHtml(photo)}" alt="${escapeHtml(student.name || user.name || "Siswa")}">` : escapeHtml(initials(user.name || roles[user.role] || "U"))}</div>`;
}

function bindProfileSummaryActions(root = byId("view")) {
  root.querySelectorAll("[data-go-profile]").forEach(btn => btn.onclick = () => navigate("profile"));
  root.querySelectorAll("[data-inline-logout]").forEach(btn => btn.onclick = logoutApp);
}

function profileDetails(user) {
  if (["siswa", "wali_murid"].includes(user.role)) {
    const student = findById("students", user.student_id || user.murid_id) || {};
    const cls = studentClassForSelectedYear(student) || findById("classes", student.active_class_id);
    return [
      ["Nama Siswa", student.name],
      ["NISN", student.nisn],
      ["NIS", student.nis],
      ["Kelas", displayName("classes", cls)],
      ["Wali", parentNameForStudent(student)],
      ["Orang Tua", student.parent_phone]
    ];
  }
  const teacher = findById("teachers", user.teacher_id) || {};
  const homeroomClasses = state.db.classes.filter(c => c.homeroom_teacher_id === teacher.id && c.academic_year_id === selectedAcademicYearId());
  return [
    ["NIP", teacher.nip || user.nip],
    ["Telepon", teacher.phone],
    ["Wali Kelas", homeroomClasses.map(c => c.name).join(", ") || "Tidak"],
    ["Status", boolText(user.active)]
  ];
}

function attentionTable(students, records) {
  const rows = students.map(st => {
    const t = attendanceTotals(records.filter(r => r.student_id === st.id));
    return { st, score: t.alfa * 2 + t.terlambat, ...t };
  }).sort((a, b) => b.score - a.score).slice(0, 12).map((r, i) => `<tr><td>${i + 1}</td><td>${escapeHtml(r.st.name)}</td><td>${r.terlambat}</td><td>${r.alfa}</td><td>${r.score ? "Perlu pembinaan" : "Baik"}</td></tr>`).join("");
  return `<div class="table-wrap"><table><thead><tr><th>No</th><th>Siswa</th><th>Terlambat</th><th>Alfa</th><th>Keterangan</th></tr></thead><tbody>${rows || emptyRow(5)}</tbody></table></div>`;
}

function card(label, value) { return `<article class="card"><span>${label}</span><strong>${value}</strong></article>`; }
function resolveStoredAcademicYearId() {
  const stored = localStorage.getItem(YEAR_KEY);
  if (stored && state.db.academic_years.some(year => !year.deleted_at && year.id === stored)) return stored;
  const active = state.db.academic_years.find(year => !year.deleted_at && year.is_active === "true");
  return active?.id || state.db.academic_years.find(year => !year.deleted_at)?.id || "";
}

function selectedAcademicYearId() {
  if (!state.selectedAcademicYearId || !state.db.academic_years.some(year => !year.deleted_at && year.id === state.selectedAcademicYearId)) {
    state.selectedAcademicYearId = resolveStoredAcademicYearId();
  }
  return state.selectedAcademicYearId;
}

function selectedAcademicYearName() {
  return displayName("academic_years", findById("academic_years", selectedAcademicYearId())) || "-";
}

function activeAcademicYearName() {
  return selectedAcademicYearName();
}

function academicYearSwitcher(renderFnName = "") {
  const selected = selectedAcademicYearId();
  const options = state.db.academic_years
    .filter(year => !year.deleted_at)
    .sort((a, b) => String(b.start_date || b.name || "").localeCompare(String(a.start_date || a.name || "")))
    .map(year => `<option value="${year.id}" ${year.id === selected ? "selected" : ""}>${escapeHtml(displayName("academic_years", year))}</option>`)
    .join("");
  return `<label class="year-switcher">Tahun Ajaran<select data-academic-year-switch="${escapeHtml(renderFnName)}">${options}</select></label>`;
}

function bindAcademicYearSwitcher(renderFn) {
  byId("view").querySelectorAll("[data-academic-year-switch]").forEach(select => {
    select.onchange = () => {
      state.selectedAcademicYearId = select.value;
      localStorage.setItem(YEAR_KEY, select.value);
      state.filters.historyClass = "";
      renderFn();
      updateMobileSchoolBar();
    };
  });
}

function filterBySelectedAcademicYear(table, rows) {
  const yearId = selectedAcademicYearId();
  if (!yearId) return rows;
  if (["classes", "semesters", "schedules", "leave_requests", "attendance_records", "attendance_sessions", "rank_periods"].includes(table)) {
    return rows.filter(row => row.academic_year_id === yearId);
  }
  if (table === "students") return rows.filter(row => row.active_academic_year_id === yearId);
  return rows;
}

function classesForSelectedYear() {
  return filterClassesForRole(state.db.classes.filter(cls => !cls.deleted_at && cls.active !== "false" && cls.status !== "lulus" && cls.academic_year_id === selectedAcademicYearId()));
}

function activeStudentsForSelectedYear(rows = state.db.students) {
  return filterBySelectedAcademicYear("students", rows.filter(studentCanLogin));
}

function activeTeachersForDisplay(rows = state.db.teachers) {
  return rows.filter(teacherCanLogin);
}

function recordsForSelectedYear(records = state.db.attendance_records) {
  return records.filter(record => record.academic_year_id === selectedAcademicYearId());
}

function schedulesForSelectedYear(schedules = state.db.schedules) {
  const rows = schedules.filter(schedule => !schedule.deleted_at && schedule.academic_year_id === selectedAcademicYearId() && !isDeletedScheduleContext(schedule));
  const classIds = new Set(classesForSelectedYear().map(cls => cls.id));
  return activeUnit() ? rows.filter(schedule => classIds.has(schedule.class_id)) : rows;
}

function renderCrud(table) {
  const schema = schemas[table];
  if (!schema) return;
  if (table === "students" && canEditMaster()) return renderStudentClassOverview();
  if (table === "subjects" && canEditMaster()) return renderSubjectClassOverview();
  if (table === "leave_requests") return renderLeaveClassOverview();
  const canWrite = table === "settings" ? canEditMaster() : canEditMaster() || canCreateLeaveRequest(table);
  const data = visibleRows(table);
  const rows = data.map(row => `<tr>${schema.columns.map(([key, label, fmt]) => `<td data-label="${escapeHtml(label)}">${fmt ? fmt(row[key], row) : escapeHtml(row[key] ?? "")}</td>`).join("")}<td data-label="Aksi" class="row-actions">${crudActions(table, row, canWrite)}</td></tr>`).join("");
  byId("view").innerHTML = `
    <section class="panel">
      <div class="panel-head">
        <div><h2>${schema.title}</h2><p class="muted">${schema.subtitle}</p></div>
        <div class="actions crud-toolbar">
          ${["semesters"].includes(table) ? academicYearSwitcher("crud") : ""}
          ${canWrite ? `<button class="primary" data-add>Tambah ${schema.title}</button>` : ""}
          ${crudActionSelect(table)}
        </div>
      </div>
      <div class="filters"><input data-search placeholder="Cari data..." value="${escapeHtml(state.filters[table] || "")}"></div>
      <div class="table-wrap"><table><thead><tr>${schema.columns.map(c => `<th>${c[1]}</th>`).join("")}<th>Aksi</th></tr></thead><tbody>${rows || emptyRow(schema.columns.length + 1)}</tbody></table></div>
    </section>`;
  bindCrud(table);
  if (["semesters"].includes(table)) bindAcademicYearSwitcher(() => renderCrud(table));
}

function crudActionSelect(table) {
  return `<select class="table-action-select" data-table-action aria-label="Aksi data">
    <option value="">Aksi Data</option>
    ${canEditMaster() ? `<option value="import">Import CSV</option>` : ""}
    <option value="export">Export CSV</option>
    <option value="excel">Export Excel</option>
    <option value="print">Cetak / PDF</option>
    ${table === "students" && canEditMaster() ? `<option value="class-manager">Kelola Siswa per Kelas</option><option value="print-qr">Cetak QR Massal</option><option value="promote">Naik Kelas Massal</option>` : ""}
  </select>`;
}

function renderStudentClassOverview() {
  const q = state.filters.studentClassOverview || "";
  const unitFilter = activeUnit() || state.filters.studentClassUnit || "";
  const levelFilter = normalizeClassLevelFilter(unitFilter, state.filters.studentClassLevel || "");
  let classes = visibleRows("classes");
  classes = filterClassListByUnitLevel(classes, unitFilter, levelFilter);
  if (q) classes = classes.filter(cls => JSON.stringify({
    ...cls,
    academic_year: displayName("academic_years", findById("academic_years", cls.academic_year_id)),
    semester: displayName("semesters", findById("semesters", cls.semester_id)),
    homeroom: displayName("teachers", findById("teachers", cls.homeroom_teacher_id))
  }).toLowerCase().includes(q));
  classes = classes.sort((a, b) => `${a.level || ""}${a.name || ""}`.localeCompare(`${b.level || ""}${b.name || ""}`));
  const activeStudents = visibleRows("students");
  const cards = classes.map(cls => classManagementCard(cls)).join("");
  byId("view").innerHTML = `
    <section class="panel admin-workflow">
      <div class="panel-head workflow-head">
        <div>
          <span class="eyebrow">Pusat Kelola Siswa</span>
          <h2>Kelola Siswa Berdasarkan Kelas</h2>
          <p class="muted">Alur kerja dibuat sederhana: pilih kelas, kelola siswa, lalu gunakan aksi kenaikan hanya saat pergantian periode.</p>
        </div>
        <div class="actions workflow-actions">
          ${academicYearSwitcher("students")}
          <button class="primary" data-add-class>+ Kelas Baru</button>
          <button class="secondary" data-add-student>+ Siswa Baru</button>
          <button class="secondary" data-print-class>Cetak ID QR</button>
        </div>
      </div>
      <div class="workflow-stats">
        ${card("Kelas Aktif", classes.length)}
        ${card("Siswa Aktif", activeStudents.length)}
        ${card("Tahun Ajaran", escapeHtml(activeAcademicYearName()))}
      </div>
      <div class="filters workflow-search class-filter-tools">
        ${unitLevelFilterControls("studentClass", unitFilter, levelFilter)}
        <input data-search-class placeholder="Cari kelas, tahun ajaran, semester, atau wali kelas..." value="${escapeHtml(q)}">
      </div>
      <div class="class-management-grid">
        ${cards || `<div class="empty-state">Belum ada kelas yang sesuai pencarian.</div>`}
      </div>
    </section>`;
  bindStudentClassOverview();
  bindAcademicYearSwitcher(renderStudentClassOverview);
}

function classManagementCard(cls) {
  const count = studentsInClass(cls.id).length;
  const year = displayName("academic_years", findById("academic_years", cls.academic_year_id)) || "-";
  const semester = displayName("semesters", findById("semesters", cls.semester_id)) || "-";
  const homeroom = displayName("teachers", findById("teachers", cls.homeroom_teacher_id)) || "-";
  return `<article class="class-management-card">
    <div class="class-card-main">
      <div>
        <span class="class-label">Kelas</span>
        <h3>${escapeHtml(cls.name || "-")}</h3>
        <p>${escapeHtml(classUnit(cls))} ${escapeHtml(classLevelValue(cls) || "-")} ${cls.major ? "- " + escapeHtml(cls.major) : ""}</p>
      </div>
      <div class="student-count"><strong>${count}</strong><span>Siswa</span></div>
    </div>
    <div class="class-meta-grid">
      <span><small>Tahun Ajaran</small><strong>${escapeHtml(year)}</strong></span>
      <span><small>Semester</small><strong>${escapeHtml(semester)}</strong></span>
      <span><small>Wali Kelas</small><strong>${escapeHtml(homeroom)}</strong></span>
    </div>
    <div class="class-card-actions">
      <button class="primary" data-manage-class="${cls.id}">Kelola Siswa</button>
      <select data-class-action="${cls.id}" aria-label="Aksi kelas ${escapeHtml(cls.name || "")}">
        <option value="">Aksi Lainnya</option>
        <option value="semester">Kenaikan Semester</option>
        <option value="class">Kenaikan Kelas</option>
        <option value="graduate">Luluskan Kelas</option>
        <option value="edit">Edit Kelas</option>
        <option value="delete">Hapus Kelas</option>
      </select>
    </div>
  </article>`;
}

function bindStudentClassOverview() {
  const root = byId("view");
  root.querySelector("[data-add-class]")?.addEventListener("click", () => openForm("classes"));
  root.querySelector("[data-add-student]")?.addEventListener("click", () => openForm("students"));
  root.querySelector("[data-print-class]")?.addEventListener("click", () => openQrPrint());
  root.querySelector("[data-search-class]")?.addEventListener("input", e => {
    state.filters.studentClassOverview = e.target.value.toLowerCase();
    renderStudentClassOverview();
  });
  bindUnitLevelFilter(root, "studentClass", renderStudentClassOverview);
  root.querySelectorAll("[data-manage-class]").forEach(b => b.onclick = () => openClassStudents(b.dataset.manageClass));
  root.querySelectorAll("[data-class-action]").forEach(select => select.onchange = () => {
    const classId = select.dataset.classAction;
    const action = select.value;
    select.value = "";
    if (action === "semester") return openSemesterPromotion(classId);
    if (action === "class") return openClassPromotion(classId);
    if (action === "graduate") return openGraduation(classId);
    if (action === "edit") return openForm("classes", findById("classes", classId));
    if (action === "delete") return softDelete("classes", classId);
  });
}

function renderSubjectClassOverview() {
  const q = state.filters.subjectClassOverview || "";
  const unitFilter = activeUnit() || state.filters.subjectClassUnit || "";
  const levelFilter = normalizeClassLevelFilter(unitFilter, state.filters.subjectClassLevel || "");
  let classes = visibleRows("classes");
  classes = filterClassListByUnitLevel(classes, unitFilter, levelFilter);
  if (q) classes = classes.filter(cls => JSON.stringify({
    ...cls,
    academic_year: displayName("academic_years", findById("academic_years", cls.academic_year_id)),
    semester: displayName("semesters", findById("semesters", cls.semester_id)),
    homeroom: displayName("teachers", findById("teachers", cls.homeroom_teacher_id)),
    subjects: subjectsForClass(cls.id).map(subject => subject.name).join(" ")
  }).toLowerCase().includes(q));
  classes = classes.sort((a, b) => `${a.level || ""}${a.name || ""}`.localeCompare(`${b.level || ""}${b.name || ""}`));
  const activeSubjects = new Set(classes.flatMap(cls => subjectsForClass(cls.id).filter(subject => subject.active !== "false").map(subject => subject.id))).size;
  const activeSchedules = schedulesForSelectedYear(state.db.schedules).filter(schedule => !schedule.deleted_at && schedule.active !== "false");
  const cards = classes.map(cls => subjectClassCard(cls)).join("");
  byId("view").innerHTML = `
    <section class="panel admin-workflow">
      <div class="panel-head workflow-head">
        <div>
          <span class="eyebrow">Pusat Kelola Mapel & Jadwal</span>
          <h2>Mapel dan Jadwal Berdasarkan Kelas</h2>
          <p class="muted">Pilih kelas terlebih dahulu, lalu atur mapel, guru, hari, dan jam dalam satu tempat.</p>
        </div>
        <div class="actions workflow-actions">
          ${academicYearSwitcher("subjects")}
          <button class="primary" data-add-schedule>+ Jadwal Mapel</button>
        </div>
      </div>
      <div class="workflow-stats">
        ${card("Kelas Aktif", classes.length)}
        ${card("Mapel Aktif", activeSubjects)}
        ${card("Jadwal Aktif", activeSchedules.length)}
      </div>
      <div class="filters workflow-search class-filter-tools">
        ${unitLevelFilterControls("subjectClass", unitFilter, levelFilter)}
        <input data-search-subject-class placeholder="Cari kelas, mapel, tahun ajaran, semester, atau wali kelas..." value="${escapeHtml(q)}">
      </div>
      <div class="class-management-grid">
        ${cards || `<div class="empty-state">Belum ada kelas/mapel yang sesuai pencarian.</div>`}
      </div>
    </section>`;
  bindSubjectClassOverview();
  bindAcademicYearSwitcher(renderSubjectClassOverview);
}

function subjectClassCard(cls) {
  const schedules = schedulesForClass(cls.id);
  const subjects = subjectsForClass(cls.id);
  const year = displayName("academic_years", findById("academic_years", cls.academic_year_id)) || "-";
  const semester = displayName("semesters", findById("semesters", cls.semester_id)) || "-";
  const homeroom = displayName("teachers", findById("teachers", cls.homeroom_teacher_id)) || "-";
  const chips = subjects.slice(0, 4).map(subject => `<span>${escapeHtml(subject.name || subject.code || "-")}</span>`).join("");
  return `<article class="class-management-card subject-class-card">
    <div class="class-card-main">
      <div>
        <span class="class-label">Kelas</span>
        <h3>${escapeHtml(cls.name || "-")}</h3>
        <p>${escapeHtml(classUnit(cls))} ${escapeHtml(classLevelValue(cls) || "-")} ${cls.major ? "- " + escapeHtml(cls.major) : ""}</p>
      </div>
      <div class="student-count subject-count"><strong>${subjects.length}</strong><span>Mapel</span></div>
    </div>
    <div class="subject-chip-list">${chips || `<span>Belum ada mapel</span>`}${subjects.length > 4 ? `<span>+${subjects.length - 4}</span>` : ""}<span>${schedules.length} jadwal</span></div>
    <div class="class-meta-grid">
      <span><small>Tahun Ajaran</small><strong>${escapeHtml(year)}</strong></span>
      <span><small>Semester</small><strong>${escapeHtml(semester)}</strong></span>
      <span><small>Wali Kelas</small><strong>${escapeHtml(homeroom)}</strong></span>
    </div>
    <div class="class-card-actions">
      <button class="primary" data-manage-subject-class="${cls.id}">Kelola Jadwal</button>
      <select data-subject-class-action="${cls.id}" aria-label="Aksi mapel kelas ${escapeHtml(cls.name || "")}">
        <option value="">Aksi Lainnya</option>
        <option value="schedule">Tambah Jadwal Mapel</option>
        <option value="class">Edit Kelas</option>
      </select>
    </div>
  </article>`;
}

function bindSubjectClassOverview() {
  const root = byId("view");
  root.querySelector("[data-add-schedule]")?.addEventListener("click", () => openForm("schedules"));
  root.querySelector("[data-search-subject-class]")?.addEventListener("input", e => {
    state.filters.subjectClassOverview = e.target.value.toLowerCase();
    renderSubjectClassOverview();
  });
  bindUnitLevelFilter(root, "subjectClass", renderSubjectClassOverview);
  root.querySelectorAll("[data-manage-subject-class]").forEach(b => b.onclick = () => openClassSubjects(b.dataset.manageSubjectClass));
  root.querySelectorAll("[data-subject-class-action]").forEach(select => select.onchange = () => {
    const classId = select.dataset.subjectClassAction;
    const action = select.value;
    select.value = "";
    if (action === "schedule") return openScheduleForClass(classId);
    if (action === "class") return openForm("classes", findById("classes", classId));
  });
}

function renderLeaveClassOverview() {
  const q = state.filters.leaveClassOverview || "";
  const unitFilter = activeUnit() || state.filters.leaveClassUnit || "";
  const levelFilter = normalizeClassLevelFilter(unitFilter, state.filters.leaveClassLevel || "");
  let classes = accessibleLeaveClasses();
  classes = filterClassListByUnitLevel(classes, unitFilter, levelFilter);
  if (q) classes = classes.filter(cls => JSON.stringify({
    ...cls,
    homeroom: displayName("teachers", findById("teachers", cls.homeroom_teacher_id)),
    leaves: visibleRows("leave_requests").filter(leave => leave.class_id === cls.id).map(leave => displayName("students", findById("students", leave.student_id))).join(" ")
  }).toLowerCase().includes(q));
  const cards = classes.map(cls => leaveClassCard(cls)).join("");
  byId("view").innerHTML = `<section class="panel admin-workflow">
    <div class="panel-head workflow-head">
      <div><span class="eyebrow">Izin Per Kelas</span><h2>Izin dan Sakit</h2><p class="muted">Kelola izin/sakit berdasarkan kelas agar persetujuan lebih mudah dipantau.</p></div>
      <div class="actions"><button class="primary" data-add-leave-global>+ Izin/Sakit Baru</button></div>
    </div>
    <div class="filters workflow-search class-filter-tools">${unitLevelFilterControls("leaveClass", unitFilter, levelFilter)}<input data-search-leave-class placeholder="Cari kelas, wali kelas, atau siswa..." value="${escapeHtml(q)}"></div>
    <div class="class-management-grid">${cards || `<div class="empty-state">Belum ada kelas untuk izin/sakit.</div>`}</div>
  </section>`;
  bindLeaveClassOverview();
}

function leaveClassCard(cls) {
  const leaves = visibleRows("leave_requests").filter(leave => leave.class_id === cls.id);
  const pending = leaves.filter(leave => leave.status === "pending").length;
  const approved = leaves.filter(leave => leave.status === "approved").length;
  return `<article class="class-management-card leave-class-card">
    <div class="class-card-main">
      <div>
        <span class="class-label">Kelas</span>
        <h3>${escapeHtml(displayName("classes", cls) || "-")}</h3>
        <p>${escapeHtml(displayName("teachers", findById("teachers", cls.homeroom_teacher_id)) || "Wali kelas belum diatur")}</p>
      </div>
      <div class="student-count leave-count"><strong>${leaves.length}</strong><span>Izin</span></div>
    </div>
    <div class="class-meta-grid">
      <span><small>Menunggu</small><strong>${pending}</strong></span>
      <span><small>Disetujui</small><strong>${approved}</strong></span>
      <span><small>Siswa Aktif</small><strong>${studentsInClass(cls.id).length}</strong></span>
    </div>
    <div class="class-card-actions">
      <button class="primary" data-manage-leave-class="${cls.id}">Kelola Izin</button>
      <button class="secondary" data-add-leave-class="${cls.id}">+ Izin/Sakit</button>
    </div>
  </article>`;
}

function bindLeaveClassOverview() {
  const root = byId("view");
  root.querySelector("[data-add-leave-global]")?.addEventListener("click", () => openForm("leave_requests"));
  bindUnitLevelFilter(root, "leaveClass", renderLeaveClassOverview);
  root.querySelector("[data-search-leave-class]")?.addEventListener("input", e => {
    state.filters.leaveClassOverview = e.target.value.toLowerCase();
    renderLeaveClassOverview();
  });
  root.querySelectorAll("[data-manage-leave-class]").forEach(button => button.onclick = () => openClassLeaves(button.dataset.manageLeaveClass));
  root.querySelectorAll("[data-add-leave-class]").forEach(button => button.onclick = () => openLeaveForClass(button.dataset.addLeaveClass));
}

function filterClassListByUnitLevel(classes, unit, level) {
  return classes.filter(cls =>
    (!unit || classUnit(cls) === unit) &&
    (!level || classLevelValue(cls) === level)
  );
}

function unitLevelFilterControls(prefix, unitValue = "", levelValue = "") {
  const lockedUnit = activeUnit();
  const effectiveUnit = lockedUnit || unitValue;
  const unitOptions = lockedUnit ? educationUnitOptions().filter(([value]) => value === lockedUnit) : educationUnitOptions();
  const levelOptions = classLevelOptionsForUnit(effectiveUnit);
  const selectedLevel = levelOptions.some(([value]) => value === levelValue) ? levelValue : "";
  return `
    <select data-unit-filter="${prefix}" aria-label="Filter unit" ${lockedUnit ? "disabled" : ""}>
      ${lockedUnit ? "" : `<option value="">Semua Unit</option>`}
      ${unitOptions.map(([value, label]) => `<option value="${value}" ${effectiveUnit === value ? "selected" : ""}>${label}</option>`).join("")}
    </select>
    <select data-level-filter="${prefix}" aria-label="Filter tingkat">
      <option value="">Semua Tingkat</option>
      ${levelOptions.map(([value, label]) => `<option value="${value}" ${selectedLevel === value ? "selected" : ""}>${escapeHtml(label)}</option>`).join("")}
    </select>`;
}

function bindUnitLevelFilter(root, prefix, renderFn) {
  root.querySelector(`[data-unit-filter="${prefix}"]`)?.addEventListener("change", e => {
    state.filters[`${prefix}Unit`] = e.target.value;
    state.filters[`${prefix}Level`] = "";
    renderFn();
  });
  root.querySelector(`[data-level-filter="${prefix}"]`)?.addEventListener("change", e => {
    state.filters[`${prefix}Level`] = e.target.value;
    renderFn();
  });
}

function crudActions(table, row, canWrite) {
  const parts = [];
  if (table === "students") parts.push(`<button class="secondary" data-qr="${row.id}">QR</button>`);
  if (table === "students" && canWrite) parts.push(`<button class="secondary" data-move-student="${row.id}">Pindah Kelas</button>`);
  if (table === "classes" && canWrite) parts.push(`<button class="secondary" data-manage-class="${row.id}">Kelola Siswa</button>`);
  if (table === "leave_requests" && row.status === "pending" && canApproveLeaveFor(row.class_id)) {
    parts.push(`<button class="secondary" data-approve="${row.id}">Setujui</button>`);
    parts.push(`<button class="ghost" data-reject="${row.id}">Tolak</button>`);
  }
  if (canWrite) parts.push(`<button class="ghost" data-edit="${row.id}">Edit</button>`);
  if (canWrite && canDelete()) parts.push(`<button class="danger" data-delete="${row.id}">Hapus</button>`);
  return parts.join("");
}

function bindCrud(table, options = {}) {
  const root = byId("view");
  const rerender = options.renderAfterSave || (() => renderCrud(table));
  root.querySelector("[data-add]")?.addEventListener("click", () => openForm(table, null, {}, { renderAfterSave: rerender }));
  root.querySelector("[data-export]")?.addEventListener("click", () => exportCsv(table, visibleRows(table)));
  root.querySelector("[data-excel]")?.addEventListener("click", () => exportExcel(table, visibleRows(table)));
  root.querySelector("[data-pdf]")?.addEventListener("click", () => window.print());
  root.querySelector("[data-import]")?.addEventListener("click", () => openImport(table));
  root.querySelector("[data-table-action]")?.addEventListener("change", e => {
    const action = e.target.value;
    e.target.value = "";
    if (action === "import") return openImport(table);
    if (action === "export") return exportCsv(table, visibleRows(table));
    if (action === "excel") return exportExcel(table, visibleRows(table));
    if (action === "print") return window.print();
    if (action === "class-manager") return openClassManager();
    if (action === "print-qr") return openQrPrint();
    if (action === "promote") return openPromote();
  });
  root.querySelector("[data-class-manager]")?.addEventListener("click", () => openClassManager());
  root.querySelector("[data-print-class]")?.addEventListener("click", () => openQrPrint());
  root.querySelector("[data-promote]")?.addEventListener("click", () => openPromote());
  root.querySelector("[data-search]")?.addEventListener("input", e => {
    state.filters[table] = e.target.value.toLowerCase();
    rerender();
  });
  root.querySelectorAll("[data-edit]").forEach(b => b.onclick = () => openForm(table, findById(table, b.dataset.edit), {}, { renderAfterSave: rerender }));
  root.querySelectorAll("[data-delete]").forEach(b => b.onclick = () => softDelete(table, b.dataset.delete, rerender));
  root.querySelectorAll("[data-qr]").forEach(b => b.onclick = () => showStudentQr(findById("students", b.dataset.qr)));
  root.querySelectorAll("[data-move-student]").forEach(b => b.onclick = () => openMoveStudent(b.dataset.moveStudent));
  root.querySelectorAll("[data-manage-class]").forEach(b => b.onclick = () => openClassStudents(b.dataset.manageClass));
  root.querySelectorAll("[data-approve]").forEach(b => b.onclick = () => approveLeave(b.dataset.approve));
  root.querySelectorAll("[data-reject]").forEach(b => b.onclick = () => openRejectLeave(b.dataset.reject));
  bindEvidenceLinks(root);
}

function visibleRows(table) {
  let rows = state.db[table].filter(r => !r.deleted_at);
  const user = currentUser();
  const unit = activeUnit();
  rows = filterBySelectedAcademicYear(table, rows);
  if (table === "students") rows = rows.filter(studentCanLogin);
  if (table === "teachers") rows = rows.filter(teacherCanLogin);
  if (table === "classes") rows = filterClassesForRole(rows);
  if (table === "classes" && user.role === "guru") {
    const classIds = new Set(schedulesForSelectedYear().filter(s => s.teacher_id === user.teacher_id).map(s => s.class_id));
    rows = rows.filter(cls => classIds.has(cls.id));
  }
  if (table === "classes" && user.role === "wali_kelas") {
    rows = rows.filter(cls => cls.homeroom_teacher_id === user.teacher_id);
  }
  if (table === "teachers" && user.role === "kepala_sekolah" && unit) {
    rows = rows.filter(teacher => teacherMatchesHeadmasterUnit(teacher, unit));
  }
  if (table === "subjects" && ["kepala_sekolah", "guru", "wali_kelas"].includes(user.role) && unit) {
    const subjectIds = new Set(schedulesForSelectedYear().map(schedule => schedule.subject_id));
    rows = rows.filter(subject => subjectIds.has(subject.id));
  }
  if (table === "schedules" && ["kepala_sekolah", "guru", "wali_kelas"].includes(user.role) && unit) {
    const classIds = new Set(classesForSelectedYear().map(c => c.id));
    rows = rows.filter(schedule => classIds.has(schedule.class_id));
  }
  if (table === "students" && ["kepala_sekolah", "guru"].includes(user.role) && unit) {
    const classIds = new Set(classesForSelectedYear().map(c => c.id));
    rows = rows.filter(r => classIds.has(r.active_class_id));
  }
  if (table === "leave_requests" && ["kepala_sekolah"].includes(user.role) && unit) {
    const classIds = new Set(classesForSelectedYear().map(c => c.id));
    rows = rows.filter(r => classIds.has(r.class_id));
  }
  if (table === "leave_requests" && user.role === "wali_murid") {
    rows = rows.filter(r => r.student_id === user.murid_id);
  }
  if (table === "students" && user.role === "wali_kelas") {
    const classIds = new Set(classesForSelectedYear().filter(c => c.homeroom_teacher_id === user.teacher_id).map(c => c.id));
    rows = rows.filter(r => classIds.has(r.active_class_id));
  }
  if (table === "leave_requests" && user.role === "wali_kelas") {
    const classIds = new Set(classesForSelectedYear().filter(c => c.homeroom_teacher_id === user.teacher_id).map(c => c.id));
    rows = rows.filter(r => classIds.has(r.class_id));
  }
  if (table === "leave_requests" && user.role === "guru") {
    const classIds = new Set(schedulesForSelectedYear().filter(s => s.teacher_id === user.teacher_id).map(s => s.class_id));
    rows = rows.filter(r => classIds.has(r.class_id));
  }
  if (table === "schedules" && user.role === "guru") rows = rows.filter(r => r.teacher_id === user.teacher_id);
  const q = state.filters[table];
  if (q) rows = rows.filter(r => JSON.stringify(r).toLowerCase().includes(q));
  return rows;
}

function openForm(table, row = null, defaults = {}, options = {}) {
  const schema = schemas[table];
  const title = `${row ? "Edit" : "Tambah"} ${schema.title}`;
  const initial = row || defaults;
  const fields = schema.fields.map(f => fieldHtml(f, initial, { table, options })).join("");
  modal(title, `<form id="modal-form" class="form-grid">${fields}<div class="wide actions modal-form-actions"><button class="primary" type="submit">Simpan</button><button class="ghost" type="button" data-close>Batal</button></div></form>`);
  byId("modal-form").onsubmit = async e => {
    e.preventDefault();
    const wasNew = !row;
    const data = normalizeRecord(table, await formDataWithImages(e.target), row);
    if (!validateRecord(table, data, row)) return;
    if (row) Object.assign(row, data, { updated_at: now(), updated_by: currentUser().id });
    else state.db[table].push({ id: uid(table.slice(0, 3)), ...data, created_at: now(), updated_at: now(), created_by: currentUser().id });
    const savedRow = row || state.db[table].at(-1);
    let credentials = null;
    if (table === "students") syncStudentHistory(savedRow);
    if (table === "students") credentials = savedRow.login_enabled === "true" ? await syncStudentUser(savedRow) : disableLinkedUser("student_id", savedRow.id);
    if (table === "teachers") credentials = savedRow.login_enabled === "true" ? await syncTeacherUser(savedRow) : disableLinkedUser("teacher_id", savedRow.id);
    if (table === "leave_requests" && data.status === "approved") applyApprovedLeave(row || state.db.leave_requests.at(-1));
    if (options.afterSave) options.afterSave(savedRow);
    const renderTarget = table === "schedules" && currentUser().role === "super_admin" ? "subjects" : table;
    saveDb(); closeModal({ fromPopState: true });
    if (options.renderAfterSave) options.renderAfterSave(savedRow);
    else renderCrud(renderTarget);
    if (table === "settings") {
      applySchoolBrand();
      renderCrud("settings");
    }
    if (options.returnClassId && table === "students") {
      openClassStudents(options.returnClassId);
    }
    if (options.returnScheduleClassId && table === "schedules") {
      openClassDaySchedules(options.returnScheduleClassId, data.day || options.returnScheduleDay);
    }
    if (options.returnLeaveClassId && table === "leave_requests") {
      openClassLeaves(options.returnLeaveClassId);
    }
    if (table === "meetings") {
      renderMeetings();
    }
    if (table === "academic_years" && wasNew) {
      const summary = rolloverAcademicYear(savedRow.id);
      state.selectedAcademicYearId = savedRow.id;
      localStorage.setItem(YEAR_KEY, savedRow.id);
      saveDb();
      renderCrud("academic_years");
      toast(`Tahun ajaran baru disinkronkan: ${summary.classes} kelas, ${summary.promoted} siswa naik, ${summary.graduated} siswa lulus.`, "ok");
      return;
    }
    if (table === "classes" && wasNew) {
      openClassStudents(savedRow.id);
      toast("Kelas baru dibuat. Silakan pilih siswa untuk kelas ini.", "ok");
      return;
    }
    if (credentials) showGeneratedCredentials(credentials);
    else toast("Data disimpan.", "ok");
  };
}

function fieldHtml([key, label, type, required, options], row, context = {}) {
  const rawValue = row?.[key] ?? ((key === "academic_year_id" || key === "active_academic_year_id") ? selectedAcademicYearId() : defaultValue(type));
  const value = escapeHtml(rawValue);
  const req = required ? "required" : "";
  if (context.table === "students" && context.options?.returnClassId && ["active_class_id", "active_academic_year_id"].includes(key)) {
    const cls = findById("classes", context.options.returnClassId);
    const fixedValue = key === "active_class_id" ? cls?.id : cls?.academic_year_id;
    const displayTable = key === "active_class_id" ? "classes" : "academic_years";
    return `<label>${label}<input value="${escapeHtml(displayName(displayTable, findById(displayTable, fixedValue)) || fixedValue || "")}" disabled><input type="hidden" name="${key}" value="${escapeHtml(fixedValue || "")}"></label>`;
  }
  if (context.table === "schedules" && context.options?.returnScheduleClassId && ["academic_year_id", "semester_id", "class_id"].includes(key)) {
    return `<input type="hidden" name="${key}" value="${value}">`;
  }
  if (context.table === "leave_requests" && context.options?.returnLeaveClassId && ["class_id", "academic_year_id", "semester_id"].includes(key)) {
    const displayTable = key === "class_id" ? "classes" : key === "semester_id" ? "semesters" : "academic_years";
    return `<label>${label}<input value="${escapeHtml(displayName(displayTable, findById(displayTable, rawValue)) || rawValue)}" disabled><input type="hidden" name="${key}" value="${value}"></label>`;
  }
  if (type === "textarea") return `<label class="wide">${label}<textarea name="${key}" ${req}>${value}</textarea></label>`;
  if (type === "image") {
    const hasImage = rawValue && String(rawValue).startsWith("data:image/");
    return `<label class="wide image-upload-field">${label}
      ${hasImage ? `<img src="${escapeHtml(rawValue)}" alt="${escapeHtml(label)}">` : `<span class="image-upload-empty">Belum ada gambar</span>`}
      <input type="hidden" name="${key}" value="${value}">
      <input name="${key}__file" type="file" accept="image/*" ${["attachment", "photo"].includes(key) ? "capture=\"environment\"" : ""} ${req}>
      <small>Upload JPG/PNG. Gambar akan dikompres agar aman disimpan.</small>
    </label>`;
  }
  if (type === "unit_access") {
    const selected = new Set(String(rawValue || row?.unit || "").split(/[,\s|/]+/).map(unit => unit.trim().toUpperCase()).filter(Boolean));
    const unitOptions = currentUser()?.role === "kepala_sekolah"
      ? educationUnitOptions().filter(([unit]) => accessUnitsForUser().includes(unit))
      : educationUnitOptions();
    return `<fieldset class="wide unit-access-field"><legend>${escapeHtml(label)}</legend>
      <div class="unit-access-grid">
        ${unitOptions.map(([unit, text]) => `<label><input type="checkbox" name="${key}" value="${unit}" ${selected.has(unit) ? "checked" : ""}>${escapeHtml(text)}</label>`).join("")}
      </div>
      <small>Untuk jabatan Kepala Sekolah. Pilih satu atau beberapa unit yang boleh dikelola.</small>
    </fieldset>`;
  }
  if (context.table === "schedules" && key === "day" && context.options?.fixedDay) {
    return `<label>Hari<input value="${escapeHtml(context.options.fixedDay)}" disabled><input type="hidden" name="day" value="${escapeHtml(context.options.fixedDay)}"></label>`;
  }
  if (type === "lesson_hour") {
    const selected = row?.lesson_hour_id || lessonHourIdForSchedule(row);
    const opts = state.db.lesson_hours
      .filter(hour => !hour.deleted_at)
      .map(hour => `<option value="${hour.id}" ${selected === hour.id ? "selected" : ""}>${escapeHtml(lessonHourLabel(hour))}</option>`)
      .join("");
    return `<label>${label}<select name="${key}" ${req}><option value="">Pilih jam pelajaran...</option>${opts}</select></label>`;
  }
  if (type.startsWith("ref:")) {
    const table = type.split(":")[1];
    let rows = state.db[table].filter(r => !r.deleted_at);
    if (["classes", "semesters"].includes(table)) rows = filterBySelectedAcademicYear(table, rows);
    if (table === "students") rows = filterBySelectedAcademicYear("students", rows);
    if (["kepala_sekolah", "guru", "wali_kelas"].includes(currentUser()?.role) && activeUnit()) {
      if (table === "classes") rows = filterClassesForRole(rows);
      if (table === "students") {
        const classIds = new Set(classesForSelectedYear().map(cls => cls.id));
        rows = rows.filter(student => classIds.has(student.active_class_id));
      }
      if (table === "teachers" && currentUser()?.role === "kepala_sekolah") rows = rows.filter(teacher => teacherMatchesHeadmasterUnit(teacher, activeUnit()));
    }
    if (context.table === "leave_requests" && key === "student_id") {
      const classId = row?.class_id || context.options?.returnLeaveClassId;
      if (classId) {
        const allowed = new Set(studentsInClass(classId).map(student => student.id));
        rows = rows.filter(student => allowed.has(student.id));
      }
    }
    return `<label>${label}<select name="${key}" ${req}><option value="">Pilih...</option>${rows.map(r => `<option value="${r.id}" ${rawValue === r.id ? "selected" : ""}>${escapeHtml(table === "classes" ? classSimpleLabel(r) : displayName(table, r))}</option>`).join("")}</select></label>`;
  }
  if (type === "select" && key === "unit" && currentUser()?.role === "kepala_sekolah" && activeUnit() && ["classes", "teachers"].includes(context.table)) {
    const currentUnit = activeUnit();
    const labelText = educationUnitOptions(true).find(([value]) => value === currentUnit)?.[1] || currentUnit;
    return `<label>${label}<input value="${escapeHtml(labelText)}" disabled><input type="hidden" name="${key}" value="${escapeHtml(currentUnit)}"></label>`;
  }
  if (type === "select") return `<label>${label}<select name="${key}" ${req}>${options.map(([v, l]) => `<option value="${v}" ${String(row?.[key] ?? "") === v ? "selected" : ""}>${l}</option>`).join("")}</select></label>`;
  return `<label>${label}<input name="${key}" type="${type}" value="${value}" ${req}></label>`;
}

function defaultValue(type) { return type === "select" ? "true" : ""; }
function normalizeRecord(table, data, row) {
  if (table === "students" && !row) data.qr_token = generateQrToken();
  if (table === "students") {
    data.login_enabled ||= "true";
  }
  if (table === "teachers") {
    data.login_enabled ||= "true";
    data.staff_role ||= data.is_homeroom === "true" ? "wali_kelas" : "guru";
    data.identity_type ||= "NIP";
    data.identity_number = String(data.identity_number || data.nip || "").trim();
    data.nip = data.identity_number;
    data.units = normalizeUnitList(data.units || (data.staff_role === "kepala_sekolah" ? data.unit : ""));
    if (data.staff_role === "kepala_sekolah" && !data.units && data.unit) data.units = normalizeUnitList(data.unit);
    if (data.staff_role === "kepala_sekolah" && data.units) data.unit = data.units.split(",")[0] || data.unit || "";
    if (data.staff_role === "wali_kelas") data.is_homeroom = "true";
    if (data.staff_role === "kepala_sekolah") data.is_homeroom = "false";
  }
  if (table === "classes") {
    data.unit ||= classUnit(data);
  }
  if (table === "schedules") {
    applyLessonHourToSchedule(data);
  }
  if (table === "settings") data.late_tolerance_minutes = Number(data.late_tolerance_minutes || 15);
  if (table === "leave_requests" && data.status === "approved") {
    if (!canApproveLeaveFor(data.class_id)) data.status = "pending";
  }
  if (table === "leave_requests" && data.status === "approved") {
    data.approved_by = currentUser().id;
    data.approved_at = now();
  }
  return data;
}

function validateRecord(table, data, row) {
  if (table === "students") {
    if (!data.nis && !data.nisn) return toast("Isi minimal salah satu: NIS atau NISN.", "error"), false;
    if (data.status === "aktif" && !findById("classes", data.active_class_id)) return toast("Kelas aktif wajib valid.", "error"), false;
    const cls = findById("classes", data.active_class_id);
    if (cls && data.active_academic_year_id !== cls.academic_year_id) return toast("Tahun ajaran siswa harus sama dengan kelas aktif.", "error"), false;
    if (["kepala_sekolah", "guru", "wali_kelas"].includes(currentUser().role) && activeUnit() && (!cls || classUnit(cls) !== activeUnit())) return toast("Siswa hanya boleh disimpan pada unit aktif.", "error"), false;
    const duplicateNisn = data.nisn ? state.db.students.find(s => studentCanLogin(s) && s.nisn === data.nisn && s.id !== row?.id) : null;
    if (duplicateNisn) return toast("NISN sudah digunakan.", "error"), false;
    const duplicateNis = data.nis && cls ? state.db.students.find(s => {
      const otherClass = findById("classes", s.active_class_id);
      return studentCanLogin(s) && s.nis === data.nis && s.id !== row?.id && otherClass && classUnit(otherClass) === classUnit(cls);
    }) : null;
    if (duplicateNis) return toast("NIS sudah digunakan pada unit yang sama.", "error"), false;
  }
  if (table === "classes") {
    const semester = findById("semesters", data.semester_id);
    if (semester && semester.academic_year_id !== data.academic_year_id) return toast("Semester harus sesuai dengan tahun ajaran kelas.", "error"), false;
    if (currentUser().role === "kepala_sekolah" && activeUnit() && data.unit !== activeUnit()) return toast("Kelas hanya boleh disimpan pada unit aktif kepala sekolah.", "error"), false;
    const duplicateClass = state.db.classes.find(cls => !cls.deleted_at && cls.id !== row?.id && cls.academic_year_id === data.academic_year_id && classUnit(cls) === data.unit && String(cls.name || "").toLowerCase() === String(data.name || "").toLowerCase());
    if (duplicateClass) return toast("Nama kelas sudah digunakan pada unit dan tahun ajaran yang sama.", "error"), false;
  }
  if (table === "schedules") {
    if (!isActiveRef("teachers", data.teacher_id) || !isActiveRef("subjects", data.subject_id)) return toast("Guru dan mapel harus aktif.", "error"), false;
    const cls = findById("classes", data.class_id);
    if (cls && (data.academic_year_id !== cls.academic_year_id || data.semester_id !== cls.semester_id)) return toast("Tahun ajaran dan semester jadwal harus sama dengan kelas.", "error"), false;
    if (currentUser().role === "kepala_sekolah" && activeUnit()) {
      if (!cls || classUnit(cls) !== activeUnit()) return toast("Jadwal hanya boleh dibuat pada unit aktif kepala sekolah.", "error"), false;
      const teacher = findById("teachers", data.teacher_id);
      if (!teacherMatchesHeadmasterUnit(teacher, activeUnit())) return toast("Guru tidak sesuai dengan unit aktif kepala sekolah.", "error"), false;
    }
    if (!data.start_time || !data.end_time) return toast("Pilih jam pelajaran terlebih dahulu.", "error"), false;
    const conflict = scheduleConflict(data, row);
    if (conflict) return toast(conflict, "error"), false;
  }
  if (table === "teachers" && data.login_enabled === "true") {
    if (!data.identity_number) return toast("Nomor identitas wajib diisi.", "error"), false;
    const duplicateNip = state.db.teachers.find(t => !t.deleted_at && teacherIdentityMatches(t, String(data.identity_number || "").toLowerCase()) && t.id !== row?.id);
    if (duplicateNip) return toast("Nomor identitas sudah digunakan.", "error"), false;
  }
  if (table === "teachers" && currentUser().role === "kepala_sekolah" && activeUnit()) {
    const allowedUnits = new Set(headmasterUnits());
    const teacherUnits = normalizeUnitList(data.units || data.unit).split(",").filter(Boolean);
    if (data.unit && !allowedUnits.has(data.unit)) return toast("Guru hanya boleh disimpan pada unit kepala sekolah.", "error"), false;
    if (teacherUnits.some(unit => !allowedUnits.has(unit))) return toast("Unit akses kepala sekolah tidak boleh di luar unit Anda.", "error"), false;
  }
  if (table === "leave_requests" && data.end_date < data.start_date) return toast("Tanggal selesai tidak boleh sebelum tanggal mulai.", "error"), false;
  if (table === "leave_requests") {
    if (!canCreateLeaveRequest(table)) return toast("Anda tidak memiliki akses membuat pengajuan izin.", "error"), false;
    if (data.student_id && data.class_id && !studentsInClass(data.class_id).some(student => student.id === data.student_id)) return toast("Siswa tidak terdaftar pada kelas izin tersebut.", "error"), false;
    if (data.status === "approved" && !canApproveLeaveFor(data.class_id)) return toast("Hanya Administrator atau wali kelas terkait yang bisa menyetujui izin.", "error"), false;
    if (currentUser().role === "kepala_sekolah" && activeUnit()) {
      const cls = findById("classes", data.class_id);
      if (!cls || classUnit(cls) !== activeUnit()) return toast("Izin hanya boleh dikelola pada unit aktif kepala sekolah.", "error"), false;
    }
    if (currentUser().role === "wali_kelas" && !canApproveLeaveFor(data.class_id)) return toast("Wali kelas hanya boleh mengelola izin kelas binaannya.", "error"), false;
    if (currentUser().role === "guru") {
      const classIds = new Set(state.db.schedules.filter(s => !s.deleted_at && s.teacher_id === currentUser().teacher_id).map(s => s.class_id));
      if (!classIds.has(data.class_id)) return toast("Guru hanya boleh membuat pengajuan izin untuk kelas yang diajar.", "error"), false;
    }
  }
  return true;
}

function syncStudentHistory(student) {
  const cls = findById("classes", student.active_class_id);
  if (!cls) return;
  moveStudentToClass(student, cls.id);
}

function moveStudentToClass(student, classId) {
  const cls = findById("classes", classId);
  if (!student || !cls) return;
  state.db.student_class_histories.forEach(history => {
    if (history.student_id === student.id && history.status === "aktif" && history.class_id !== cls.id) {
      history.status = "selesai";
      history.end_date = history.end_date || today();
      history.updated_at = now();
    }
  });
  student.active_class_id = cls.id;
  student.active_academic_year_id = cls.academic_year_id;
  student.updated_at = now();
  ensureActiveStudentHistory(student, cls);
}

function ensureActiveStudentHistory(student, cls) {
  const active = state.db.student_class_histories.find(history =>
    history.student_id === student.id &&
    history.class_id === cls.id &&
    history.academic_year_id === cls.academic_year_id &&
    history.semester_id === cls.semester_id &&
    history.status === "aktif"
  );
  if (active) return;
  state.db.student_class_histories.push({
    id: uid("sch"),
    student_id: student.id,
    class_id: cls.id,
    academic_year_id: cls.academic_year_id,
    semester_id: cls.semester_id,
    status: "aktif",
    start_date: today(),
    end_date: "",
    created_at: now(),
    updated_at: now()
  });
}

async function syncTeacherUser(teacher) {
  if (teacher.login_enabled !== "true") return;
  const role = teacher.staff_role || (teacher.is_homeroom === "true" ? "wali_kelas" : "guru");
  return syncLinkedUser({
    role,
    linkKey: "teacher_id",
    linkId: teacher.id,
    name: teacher.name,
    active: teacher.active,
    identity_type: teacher.identity_type || "NIP",
    identity_number: teacher.identity_number || teacher.nip || "",
    nip: teacher.identity_number || teacher.nip || ""
  });
}

async function syncStudentUser(student) {
  if (student.login_enabled !== "true") return;
  return syncLinkedUser({
    role: "siswa",
    linkKey: "student_id",
    linkId: student.id,
    name: student.name,
    active: student.status === "aktif" ? "true" : "false"
  });
}

async function syncLinkedUser({ role, linkKey, linkId, name, active, identity_type = "", identity_number = "", nip = "" }) {
  let user = state.db.users.find(u => u[linkKey] === linkId);
  const password = makePassword();
  if (user) {
    Object.assign(user, { name, role, active, identity_type, identity_number, nip, updated_at: now() });
    delete user.email;
    return null;
  }
  user = { id: uid("usr"), name, role, [linkKey]: linkId, active, identity_type, identity_number, nip, password_hash: await hashPassword(password), created_at: now(), updated_at: now() };
  state.db.users.push(user);
  return { name, password, role };
}

function disableLinkedUser(linkKey, linkId) {
  const user = state.db.users.find(u => u[linkKey] === linkId);
  if (user) {
    user.active = "false";
    user.updated_at = now();
  }
  return null;
}

function makePassword() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
  const bytes = crypto.getRandomValues(new Uint8Array(10));
  return Array.from(bytes, b => alphabet[b % alphabet.length]).join("");
}

function syncLinkedRecordFromUser(user) {
  if (user.teacher_id) {
    const teacher = findById("teachers", user.teacher_id);
    if (teacher) {
      teacher.name = user.name;
      teacher.active = user.active;
      teacher.is_homeroom = user.role === "wali_kelas" ? "true" : teacher.is_homeroom;
      teacher.updated_at = now();
    }
  }
  if (user.student_id) {
    const student = findById("students", user.student_id);
    if (student) {
      student.name = user.name;
      student.status = user.active === "false" ? student.status : "aktif";
      student.updated_at = now();
    }
  }
}

function showGeneratedCredentials({ name, email, password, role }) {
  if (!loginNeedsPassword(role)) {
    toast(`Akun ${roles[role] || role} aktif. Login memakai ${role === "siswa" ? "NISN" : "NIP"}.`, "ok");
    return;
  }
  const loginId = role === "siswa" ? "NISN siswa" : ["guru", "wali_kelas", "kepala_sekolah"].includes(role) ? "NIP" : "Email";
  modal("Akun Login Dibuat", `
    <div class="panel" style="box-shadow:none">
      <p class="muted">Berikan kredensial ini ke pengguna. Password ditampilkan sekali pada saat akun dibuat.</p>
      <div class="table-wrap"><table><tbody>
        <tr><th>Nama</th><td>${escapeHtml(name)}</td></tr>
        <tr><th>Role</th><td>${escapeHtml(roles[role] || role)}</td></tr>
        <tr><th>Login</th><td>${escapeHtml(loginId)}</td></tr>
        <tr><th>Password</th><td><strong>${escapeHtml(password)}</strong></td></tr>
      </tbody></table></div>
      <div class="actions" style="margin-top:12px"><button class="primary" data-close>Mengerti</button></div>
    </div>`);
}

function generateQrToken() {
  let token;
  do token = `QR-${crypto.randomUUID().replaceAll("-", "").slice(0, 24).toUpperCase()}`;
  while (state.db.students.some(s => s.qr_token === token));
  return token;
}

function renderAttendance() {
  const user = currentUser();
  const teacher = state.db.teachers.find(t => t.id === user.teacher_id);
  const day = dayName(new Date());
  let schedules = schedulesForSelectedYear().filter(s => !s.deleted_at && s.active !== "false" && s.day === day && !isDeletedScheduleContext(s));
  if (user.role === "guru" && teacher) schedules = schedules.filter(s => s.teacher_id === teacher.id);
  byId("view").innerHTML = `
    <section class="panel">
      <div class="panel-head">
        <div><h2>Jadwal Hari Ini (${day})</h2><p class="muted">Pilih jadwal yang sesuai jam hari ini. QR siswa hanya menjadi identitas.</p></div>
      </div>
      <div class="table-wrap"><table><thead><tr><th>Kelas</th><th>Mapel</th><th>Guru</th><th>Jam</th><th>Status Sesi</th><th>Aksi</th></tr></thead><tbody>
        ${schedules.map(s => scheduleRow(s)).join("") || emptyRow(6)}
      </tbody></table></div>
    </section>
    <section id="session-panel"></section>`;
  byId("view").querySelectorAll("[data-open-session]").forEach(b => b.onclick = () => openSession(b.dataset.openSession));
  byId("view").querySelectorAll("[data-view-session]").forEach(b => b.onclick = () => renderSession(b.dataset.viewSession));
}

function scheduleRow(s) {
  const session = todaySessionForSchedule(s.id);
  if (session) autoCloseSessionIfPast(session, { silent: true });
  const canOpen = canOpenScheduleNow(s);
  const timing = scheduleTimingState(s);
  const status = session
    ? timing === "past" && session.status === "open" ? `${badge("closed")} Jam lewat, perlu tutup sesi` : badge(session.status)
    : scheduleOpenReason(s);
  const action = session
    ? `<button class="secondary" data-view-session="${session.id}">Buka Panel</button>`
    : canOpen ? `<button class="primary" data-open-session="${s.id}">Buka Sesi</button>` : `<button class="ghost" disabled>${timing === "past" ? "Ditutup" : "Belum Waktunya"}</button>`;
  return `<tr><td>${refName("classes")(s.class_id)}</td><td>${refName("subjects")(s.subject_id)}</td><td>${refName("teachers")(s.teacher_id)}</td><td>${s.start_time} - ${s.end_time}</td><td>${status}</td><td class="row-actions">${action}</td></tr>`;
}

function todaySessionForSchedule(scheduleId) {
  const schedule = findById("schedules", scheduleId);
  if (!schedule || schedule.deleted_at || isDeletedScheduleContext(schedule)) return null;
  return state.db.attendance_sessions.find(x => !x.deleted_at && x.schedule_id === scheduleId && x.date === today() && x.status !== "cancelled");
}

function isDeletedScheduleContext(schedule = {}) {
  const cls = findById("classes", schedule.class_id);
  const teacher = findById("teachers", schedule.teacher_id);
  const subject = findById("subjects", schedule.subject_id);
  return !cls || cls.deleted_at || cls.active === "false" || cls.status === "lulus" || !teacher || teacher.deleted_at || teacher.active === "false" || !subject || subject.deleted_at || subject.active === "false";
}

function renderHistory() {
  if (currentUser().role === "wali_murid") return renderParentHistory();
  const scopedRecords = scopedAttendanceRecords();
  const selectedDate = state.filters.historyDate || "";
  const selectedSubject = state.filters.historySubject || "";
  const selectedClass = state.filters.historyClass || "";
  const showSubjectFilter = currentUser().role === "siswa";
  let dateRecords = selectedDate ? scopedRecords.filter(r => r.date === selectedDate) : [];
  if (selectedSubject) dateRecords = dateRecords.filter(r => r.subject_id === selectedSubject);
  const classCards = selectedDate ? historyClassCards(dateRecords, selectedClass) : "";
  if (selectedClass) dateRecords = dateRecords.filter(r => r.class_id === selectedClass);
  const dateRecordIds = new Set(dateRecords.map(r => r.id));
  const dateStudentIds = new Set(dateRecords.map(r => r.student_id));
  const logs = selectedDate ? state.db.attendance_logs.filter(log => {
    const logDate = log.created_at?.slice(0, 10);
    return (dateRecordIds.has(log.attendance_record_id) || dateStudentIds.has(log.student_id)) && logDate === selectedDate;
  }).slice().reverse().map(log => {
    const student = findById("students", log.student_id);
    const user = findById("users", log.changed_by);
    return `<tr><td>${escapeHtml(log.created_at?.slice(0, 19).replace("T", " ") || "")}</td><td>${escapeHtml(student?.name || "-")}</td><td>${badge(log.old_status || "belum")}</td><td>${badge(log.new_status)}</td><td>${escapeHtml(user?.name || "-")}</td><td>${escapeHtml(log.reason || "")}</td></tr>`;
  }).join("") : "";
  const scans = dateRecords.slice().reverse().slice(0, 80).map(r => {
    const student = findById("students", r.student_id);
    return `<tr><td>${escapeHtml(r.date || "")}</td><td>${escapeHtml(r.scan_time || "-")}</td><td>${escapeHtml(student?.name || "-")}</td><td>${refName("classes")(r.class_id)}</td><td>${refName("subjects")(r.subject_id)}</td><td>${badge(r.status)}</td><td>${escapeHtml(r.input_method || "")}</td></tr>`;
  }).join("");
  byId("view").innerHTML = `
    <section class="panel">
      <div class="panel-head"><div><h2>Pilih Tanggal History</h2><p class="muted">Riwayat scan dan audit log ditampilkan setelah tanggal dipilih.</p></div></div>
      <div class="filters">
        ${academicYearSwitcher("history")}
        <input type="date" id="history-date" value="${escapeHtml(selectedDate)}">
        ${showSubjectFilter ? historySubjectSelect(selectedSubject) : ""}
      </div>
    </section>
    ${selectedDate ? `<section class="panel"><div class="panel-head"><div><h2>History Per Kelas</h2><p class="muted">Pilih card kelas untuk melihat rincian kelas tersebut.</p></div></div><div class="history-class-grid">${classCards || `<div class="empty-state">Belum ada data kelas pada tanggal ini.</div>`}</div></section>` : ""}
    <section class="panel">
      <div class="panel-head"><div><h2>Riwayat Scan</h2><p class="muted">Aktivitas absensi terbaru dari QR, manual, izin otomatis, dan sistem alfa.</p></div></div>
      ${selectedDate ? `<div class="table-wrap"><table><thead><tr><th>Tanggal</th><th>Jam</th><th>Siswa</th><th>Kelas</th><th>Mapel</th><th>Status</th><th>Metode</th></tr></thead><tbody>${scans || emptyRow(7)}</tbody></table></div>` : `<p class="muted">Pilih tanggal terlebih dahulu.</p>`}
    </section>
    <section class="panel">
      <div class="panel-head"><div><h2>Audit Log</h2><p class="muted">Perubahan status yang membutuhkan alasan tersimpan di sini.</p></div></div>
      ${selectedDate ? `<div class="table-wrap"><table><thead><tr><th>Waktu</th><th>Siswa</th><th>Dari</th><th>Ke</th><th>Diubah Oleh</th><th>Alasan</th></tr></thead><tbody>${logs || emptyRow(6)}</tbody></table></div>` : `<p class="muted">Pilih tanggal terlebih dahulu.</p>`}
    </section>`;
  byId("history-date").onchange = e => {
    state.filters.historyDate = e.target.value;
    state.filters.historyClass = "";
    renderHistory();
  };
  byId("history-subject")?.addEventListener("change", e => {
    state.filters.historySubject = e.target.value;
    state.filters.historyClass = "";
    renderHistory();
  });
  bindAcademicYearSwitcher(renderHistory);
  byId("view").querySelectorAll("[data-history-class]").forEach(button => {
    button.onclick = () => {
      state.filters.historyClass = state.filters.historyClass === button.dataset.historyClass ? "" : button.dataset.historyClass;
      renderHistory();
    };
  });
}

function historyClassCards(records, selectedClassId) {
  const grouped = new Map();
  records.forEach(record => {
    if (!grouped.has(record.class_id)) grouped.set(record.class_id, []);
    grouped.get(record.class_id).push(record);
  });
  return [...grouped.entries()].map(([classId, rows]) => {
    const totals = attendanceTotals(rows);
    return `<button class="history-class-card ${selectedClassId === classId ? "active" : ""}" data-history-class="${classId}">
      <span>${escapeHtml(displayName("classes", findById("classes", classId)) || "-")}</span>
      <strong>${rows.length}</strong>
      <small>Hadir ${totals.hadir + totals.terlambat} · Izin ${totals.izin + totals.sakit} · Alfa ${totals.alfa}</small>
    </button>`;
  }).join("");
}

function historySubjectSelect(selected) {
  const user = currentUser();
  const subjectIds = new Set(recordsForSelectedYear().filter(r => r.student_id === user.student_id).map(r => r.subject_id));
  const options = [...subjectIds].map(id => `<option value="${id}" ${selected === id ? "selected" : ""}>${escapeHtml(displayName("subjects", findById("subjects", id)))}</option>`).join("");
  return `<select id="history-subject"><option value="">Semua Pelajaran</option>${options}</select>`;
}

function scopedAttendanceRecords() {
  const user = currentUser();
  let rows = recordsForSelectedYear();
  const unit = activeUnit();
  if (unit) {
    const unitClassIds = new Set(classesForSelectedYear().filter(cls => classUnit(cls) === unit).map(cls => cls.id));
    rows = rows.filter(r => unitClassIds.has(r.class_id));
  }
  if (user.role === "siswa") return rows.filter(r => r.student_id === user.student_id);
  if (user.role === "guru") return rows.filter(r => r.teacher_id === user.teacher_id);
  if (user.role === "wali_kelas") {
    const classIds = new Set(classesForSelectedYear().filter(c => c.homeroom_teacher_id === user.teacher_id).map(c => c.id));
    return rows.filter(r => classIds.has(r.class_id));
  }
  return rows.slice();
}

function openSession(scheduleId) {
  const s = findById("schedules", scheduleId);
  if (!s || s.active === "false") return toast("Jadwal tidak aktif.", "error");
  if (!scheduleInActivePeriod(s)) return toast("Jadwal tidak sesuai tahun ajaran/semester aktif.", "error");
  if (currentUser().role === "guru" && s.teacher_id !== currentUser().teacher_id) return toast("Guru hanya bisa membuka jadwalnya sendiri.", "error");
  if (!canOpenScheduleNow(s)) return toast(scheduleOpenReason(s), "error");
  if (isHoliday(today())) return toast("Hari ini hari libur. Sesi tidak dibuat.", "error");
  const exists = state.db.attendance_sessions.find(x => x.schedule_id === s.id && x.date === today() && x.status !== "cancelled");
  if (exists) return renderSession(exists.id);
  if (!studentsInClass(s.class_id).length) return toast("Tidak ada siswa aktif pada kelas ini.", "error");
  const session = { id: uid("ses"), schedule_id: s.id, teacher_id: s.teacher_id, class_id: s.class_id, subject_id: s.subject_id, academic_year_id: s.academic_year_id, semester_id: s.semester_id, date: today(), start_time: s.start_time, end_time: s.end_time, status: "open", opened_by: currentUser().id, closed_by: "", opened_at: now(), closed_at: "" };
  state.db.attendance_sessions.push(session);
  studentsInClass(s.class_id).forEach(st => {
    const leave = approvedLeaveFor(st.id, today());
    if (leave) upsertRecord(session, st, leave.leave_type, "leave_auto", "Status awal dari izin/sakit disetujui.");
  });
  saveDb();
  renderAttendance();
  renderSession(session.id);
  toast("Sesi absensi dibuka.", "ok");
}

function scheduleInActivePeriod(schedule) {
  const ay = findById("academic_years", schedule.academic_year_id);
  const sem = findById("semesters", schedule.semester_id);
  return schedule.academic_year_id === selectedAcademicYearId() && !!ay && !!sem;
}

function canOpenScheduleNow(schedule) {
  if (!schedule) return false;
  if (currentUser().role === "guru" && schedule.teacher_id !== currentUser().teacher_id) return false;
  return scheduleTimingState(schedule) === "active";
}

function scheduleOpenReason(schedule) {
  if (!schedule) return "Jadwal sesi tidak ditemukan.";
  if (currentUser().role === "guru" && schedule.teacher_id !== currentUser().teacher_id) return "Jadwal ini bukan milik guru yang login.";
  const timing = scheduleTimingState(schedule);
  if (timing === "wrong_day") return `Sesi hanya bisa dibuka pada hari ${schedule.day}.`;
  if (timing === "future") return `Belum waktunya. Sesi dibuka saat ${schedule.start_time} - ${schedule.end_time}.`;
  if (timing === "past") return `Ditutup. Jam pelajaran ${schedule.start_time} - ${schedule.end_time} sudah lewat.`;
  return "Sesi siap dibuka.";
}

function scheduleTimingState(schedule) {
  if (!schedule) return "missing";
  if (schedule.day !== dayName(new Date())) return "wrong_day";
  const current = currentMinutes();
  if (current < timeToMinutes(schedule.start_time)) return "future";
  if (current > timeToMinutes(schedule.end_time)) return "past";
  return "active";
}

function isCurrentTimeWithinSchedule(schedule) {
  return scheduleTimingState(schedule) === "active";
}

function currentMinutes() {
  const nowDate = new Date();
  return nowDate.getHours() * 60 + nowDate.getMinutes();
}

function timeToMinutes(value) {
  const [h, m] = String(value || "00:00").split(":").map(Number);
  return (h || 0) * 60 + (m || 0);
}

function renderSession(sessionId) {
  const session = findById("attendance_sessions", sessionId);
  const schedule = findById("schedules", session.schedule_id);
  autoCloseSessionIfPast(session, { silent: true });
  const canScanNow = session.status === "open" && canOpenScheduleNow(schedule);
  const sessionNote = session.status === "open" && scheduleTimingState(schedule) === "past" ? "Jam pelajaran sudah lewat. Tutup sesi untuk memproses alfa." : statusText(session.status);
  const statusCards = sessionStatusCards(session);
  modal(`${displayName("classes", findById("classes", session.class_id))} - ${displayName("subjects", findById("subjects", session.subject_id))}`, `
    <section class="scan-popup-panel">
      <div class="scan-popup-head">
        <p class="muted">${session.date}, ${session.start_time} - ${session.end_time}. Status: ${escapeHtml(sessionNote)}</p>
      </div>
      <div class="scanner scanner-popup">
        <div>
          <div class="scan-focus-badge">Arahkan QR siswa ke area scanner</div>
          <video id="qr-video" muted playsinline></video>
        </div>
        <div class="scan-console">
          <label>Input Token QR Manual<input id="qr-token-input" placeholder="Tempel token QR siswa"></label>
          <button class="primary" data-scan-token ${!canScanNow ? "disabled" : ""}>Catat QR</button>
          ${!canScanNow && session.status === "open" ? `<p class="muted">${escapeHtml(scheduleOpenReason(schedule))}</p>` : ""}
          ${canScanNow ? `<button class="secondary" data-manual>Input Manual</button>` : ""}
        </div>
      </div>
      <div class="session-status-grid">${statusCards}</div>
      <div id="session-status-detail" class="session-status-detail">${sessionStatusDetail(session, "belum")}</div>
    </section>`);
  const root = byId("modal-backdrop");
  root.querySelector("[data-scan-token]")?.addEventListener("click", () => scanToken(session.id, byId("qr-token-input").value.trim()));
  root.querySelector("[data-manual]")?.addEventListener("click", () => openManualAttendance(session.id));
  root.querySelectorAll("[data-session-status]").forEach(button => {
    button.onclick = () => {
      root.querySelector("#session-status-detail").innerHTML = sessionStatusDetail(session, button.dataset.sessionStatus);
    };
  });
  if (canScanNow) startCamera(session.id);
}

function sessionStatusRows(session) {
  const records = state.db.attendance_records.filter(record => !record.deleted_at && record.session_id === session.id);
  const byStudent = new Map(records.map(record => [record.student_id, record]));
  return studentsInClass(session.class_id).map(student => {
    const record = byStudent.get(student.id);
    return { student, record, status: record?.status || "belum" };
  });
}

function sessionStatusCards(session) {
  const rows = sessionStatusRows(session);
  return ["hadir", "terlambat", "izin", "sakit", "alfa", "belum"].map(status => {
    const count = rows.filter(row => row.status === status).length;
    return `<button type="button" class="status-stat-card" data-session-status="${status}">
      <span>${escapeHtml(statusLabels[status] || titleCase(status))}</span>
      <strong>${count}</strong>
    </button>`;
  }).join("");
}

function sessionStatusDetail(session, status = "belum") {
  const rows = sessionStatusRows(session).filter(row => row.status === status);
  const body = rows.map((row, index) => `<tr>
    <td>${index + 1}</td>
    <td>${escapeHtml(row.student.name || "-")}</td>
    <td>${escapeHtml(row.student.nis || "-")}</td>
    <td>${escapeHtml(row.record?.scan_time || "-")}</td>
    <td>${badge(row.status)}</td>
  </tr>`).join("");
  return `<div class="table-wrap compact-table">
    <table><thead><tr><th>No</th><th>Siswa</th><th>NIS</th><th>Jam</th><th>Status</th></tr></thead><tbody>${body || emptyRow(5)}</tbody></table>
  </div>`;
}

function scanToken(sessionId, token) {
  const session = findById("attendance_sessions", sessionId);
  if (!token) return toast("Token QR wajib diisi.", "error");
  autoCloseSessionIfPast(session);
  if (!session || session.status !== "open") return toast("Sesi sudah tertutup.", "error");
  const schedule = findById("schedules", session.schedule_id);
  if (!canOpenScheduleNow(schedule)) return failBeep(), toast(scheduleOpenReason(schedule), "error");
  const student = state.db.students.find(s => s.qr_token === token && !s.deleted_at);
  if (!student) return failBeep(), toast("QR tidak valid.", "error");
  if (student.status !== "aktif") return failBeep(), toast("Siswa tidak aktif.", "error");
  if (!studentsInClass(session.class_id).some(s => s.id === student.id)) return failBeep(), toast("Siswa tidak terdaftar pada kelas ini.", "error");
  const existing = state.db.attendance_records.find(r => r.session_id === session.id && r.student_id === student.id);
  if (existing && ["hadir", "terlambat"].includes(existing.status)) return failBeep(), toast("Siswa sudah absen pada sesi ini.", "warn");
  const leave = approvedLeaveFor(student.id, session.date);
  if (leave && (!existing || ["izin", "sakit"].includes(existing.status))) {
    return confirmLeaveOverride(session, student, existing, leave);
  }
  const status = scanStatus(session);
  const oldStatus = existing?.status;
  const rec = upsertRecord(session, student, status, "qr", "Scan QR");
  if (oldStatus && oldStatus !== status) logChange(rec, oldStatus, status, "Scan QR mengubah status pada sesi terbuka.");
  saveDb(); successBeep(); renderSession(session.id); scanSuccessNotice(student, status, session);
}

function confirmLeaveOverride(session, student, existing, leave) {
  modal("Siswa Memiliki Izin/Sakit Aktif", `
    <p>${escapeHtml(student.name)} memiliki status ${statusLabels[leave.leave_type]} aktif.</p>
    <form id="leave-override" class="form-grid">
      <label>Pilihan<select name="choice" required><option value="keep">Tetap ${statusLabels[leave.leave_type]}</option><option value="hadir">Ubah menjadi Hadir</option><option value="terlambat">Ubah menjadi Terlambat</option></select></label>
      <label class="wide">Alasan<textarea name="reason" placeholder="Wajib jika mengubah ke hadir/terlambat"></textarea></label>
      <div class="wide actions"><button class="primary">Simpan</button><button class="ghost" type="button" data-close>Batal</button></div>
    </form>`);
  byId("leave-override").onsubmit = e => {
    e.preventDefault();
    const fd = formData(e.target);
    if (fd.choice !== "keep" && !fd.reason.trim()) return toast("Alasan wajib diisi.", "error");
    if (fd.choice !== "keep") {
      const rec = upsertRecord(session, student, fd.choice, "qr", fd.reason);
      logChange(rec, existing?.status || leave.leave_type, fd.choice, fd.reason);
    }
    saveDb(); closeModal({ fromPopState: true }); renderSession(session.id); toast("Status disimpan.", "ok");
  };
}

function scanStatus(session) {
  const tolerance = Number(state.db.settings[0]?.late_tolerance_minutes || 15);
  const limitMinutes = timeToMinutes(session.start_time) + tolerance;
  return currentMinutes() <= limitMinutes ? "hadir" : "terlambat";
}

function upsertRecord(session, student, status, method, note) {
  let rec = state.db.attendance_records.find(r => r.session_id === session.id && r.student_id === student.id);
  const payload = { session_id: session.id, student_id: student.id, class_id: session.class_id, subject_id: session.subject_id, teacher_id: session.teacher_id, schedule_id: session.schedule_id, academic_year_id: session.academic_year_id, semester_id: session.semester_id, date: session.date, start_time: session.start_time, end_time: session.end_time, scan_time: method === "qr" ? new Date().toTimeString().slice(0, 8) : "", status, input_method: method, note, updated_by: currentUser().id, updated_at: now() };
  if (rec) Object.assign(rec, payload);
  else {
    rec = { id: uid("rec"), ...payload, created_by: currentUser().id, created_at: now() };
    state.db.attendance_records.push(rec);
  }
  return rec;
}

function closeSession(sessionId) {
  const session = findById("attendance_sessions", sessionId);
  if (!session || session.status !== "open") return toast("Hanya sesi terbuka yang bisa ditutup.", "error");
  if (!processSessionClosure(session)) return;
  saveDb(); stopCamera(); renderAttendance(); renderSession(session.id); toast("Sesi ditutup dan alfa diproses.", "ok");
}

function autoCloseSessionIfPast(session, options = {}) {
  if (!session || session.status !== "open") return false;
  const schedule = findById("schedules", session.schedule_id);
  if (scheduleTimingState(schedule) !== "past") return false;
  if (!processSessionClosure(session)) return false;
  saveDb();
  stopCamera();
  if (!options.silent) toast("Sesi otomatis ditutup karena jam pelajaran sudah selesai.", "ok");
  return true;
}

function scheduleConflict(data, row = null) {
  const start = timeToMinutes(data.start_time);
  const end = timeToMinutes(data.end_time);
  if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) return "Jam selesai harus lebih besar dari jam mulai.";
  const samePeriod = schedule =>
    schedule.id !== row?.id &&
    !schedule.deleted_at &&
    schedule.active !== "false" &&
    schedule.academic_year_id === data.academic_year_id &&
    schedule.semester_id === data.semester_id &&
    schedule.day === data.day;
  const overlaps = schedule => {
    const otherStart = timeToMinutes(schedule.start_time);
    const otherEnd = timeToMinutes(schedule.end_time);
    return Number.isFinite(otherStart) && Number.isFinite(otherEnd) && start < otherEnd && end > otherStart;
  };
  const candidates = state.db.schedules.filter(schedule => samePeriod(schedule) && overlaps(schedule));
  const classConflict = candidates.find(schedule => schedule.class_id === data.class_id);
  if (classConflict) {
    return `Kelas ${displayName("classes", findById("classes", data.class_id))} sudah punya jadwal ${displayName("subjects", findById("subjects", classConflict.subject_id))} pada ${classConflict.start_time} - ${classConflict.end_time}.`;
  }
  const teacherConflict = candidates.find(schedule => schedule.teacher_id === data.teacher_id);
  if (teacherConflict) {
    return `Guru ${displayName("teachers", findById("teachers", data.teacher_id))} sudah mengajar ${displayName("classes", findById("classes", teacherConflict.class_id))} pada ${teacherConflict.start_time} - ${teacherConflict.end_time}.`;
  }
  return "";
}

function processSessionClosure(session, options = {}) {
  if (isHoliday(session.date)) {
    if (!options.silent) toast("Hari libur tidak diproses menjadi alfa.", "warn");
    return false;
  }
  studentsInClass(session.class_id).forEach(st => {
    const rec = state.db.attendance_records.find(r => r.session_id === session.id && r.student_id === st.id);
    if (rec && ["hadir", "terlambat"].includes(rec.status)) return;
    const leave = approvedLeaveFor(st.id, session.date);
    if (leave) upsertRecord(session, st, leave.leave_type, "leave_auto", "Diterapkan saat sesi ditutup.");
    else upsertRecord(session, st, "alfa", "system_auto", "Alfa otomatis saat sesi ditutup.");
  });
  Object.assign(session, { status: "closed", closed_by: currentUser().id, closed_at: now() });
  return true;
}

function openManualAttendance(sessionId) {
  const session = findById("attendance_sessions", sessionId);
  if (!session) return toast("Sesi tidak ditemukan.", "error");
  if (session.status !== "open" && currentUser().role !== "super_admin") return toast("Sesi sudah ditutup. Perubahan hanya bisa dilakukan Administrator.", "error");
  modal("Input Absensi Manual", `
    <form id="manual-form" class="form-grid">
      <label>Siswa<select name="student_id" required>${studentsInClass(session.class_id).map(s => `<option value="${s.id}">${escapeHtml(s.name)} - ${escapeHtml(s.nis || "")}</option>`).join("")}</select></label>
      <label>Status<select name="status" required><option value="hadir">Hadir</option><option value="terlambat">Terlambat</option><option value="izin">Izin</option><option value="sakit">Sakit</option><option value="alfa">Alfa</option></select></label>
      <label class="wide">Alasan<textarea name="reason" required></textarea></label>
      <div class="wide actions"><button class="primary">Simpan</button><button class="ghost" type="button" data-close>Batal</button></div>
    </form>`);
  byId("manual-form").onsubmit = e => {
    e.preventDefault();
    const fd = formData(e.target);
    const st = findById("students", fd.student_id);
    const existing = state.db.attendance_records.find(r => r.session_id === session.id && r.student_id === st.id);
    const rec = upsertRecord(session, st, fd.status, "manual", fd.reason);
    logChange(rec, existing?.status || "belum", fd.status, fd.reason);
    saveDb(); closeModal({ fromPopState: true }); renderSession(session.id); toast("Absensi manual disimpan.", "ok");
  };
}

function approveLeave(id) {
  const leave = findById("leave_requests", id);
  if (!leave || !canApproveLeaveFor(leave.class_id)) return toast("Anda tidak memiliki akses menyetujui izin ini.", "error");
  Object.assign(leave, { status: "approved", approved_by: currentUser().id, approved_at: now(), updated_at: now() });
  applyApprovedLeave(leave);
  saveDb();
  state.page === "parent_leave_requests" ? renderParentLeaveAdmin() : renderCrud("leave_requests");
  toast("Izin/sakit disetujui dan diterapkan.", "ok");
}

function openRejectLeave(id) {
  const leave = findById("leave_requests", id);
  if (!leave || !canApproveLeaveFor(leave.class_id)) return toast("Anda tidak memiliki akses menolak izin ini.", "error");
  modal("Tolak Pengajuan Izin", `<form id="reject-leave-form" class="form-grid">
    <label class="wide">Catatan Admin/Guru<textarea name="note" required placeholder="Tuliskan alasan penolakan"></textarea></label>
    <div class="wide actions"><button class="danger">Tolak Pengajuan</button><button class="ghost" type="button" data-close>Batal</button></div>
  </form>`);
  byId("reject-leave-form").onsubmit = e => {
    e.preventDefault();
    const fd = formData(e.target);
    Object.assign(leave, {
      status: "rejected",
      approval_note: fd.note,
      approved_by: currentUser().id,
      approved_at: now(),
      updated_at: now()
    });
    saveDb();
    closeModal({ fromPopState: true });
    state.page === "parent_leave_requests" ? renderParentLeaveAdmin() : renderCrud("leave_requests");
    toast("Pengajuan ditolak. Absensi utama tidak diubah.", "ok");
  };
}

function applyApprovedLeave(leave) {
  const touchedSessions = new Set();
  state.db.attendance_records.forEach(rec => {
    if (rec.student_id !== leave.student_id) return;
    if (rec.date < leave.start_date || rec.date > leave.end_date) return;
    touchedSessions.add(rec.session_id);
    if (["hadir", "terlambat"].includes(rec.status)) return;
    const old = rec.status;
    rec.status = leave.leave_type;
    rec.input_method = "leave_auto";
    rec.note = "Diperbarui otomatis dari izin/sakit disetujui.";
    rec.updated_by = currentUser().id;
    rec.updated_at = now();
    logChange(rec, old, rec.status, "Izin/sakit disetujui setelah absensi.");
  });
  state.db.attendance_sessions.forEach(session => {
    if (session.deleted_at || session.class_id !== leave.class_id) return;
    if (session.date < leave.start_date || session.date > leave.end_date) return;
    if (touchedSessions.has(session.id)) return;
    const student = findById("students", leave.student_id);
    if (!student) return;
    const rec = {
      id: uid("rec"),
      session_id: session.id,
      student_id: student.id,
      class_id: session.class_id,
      subject_id: session.subject_id,
      teacher_id: session.teacher_id,
      schedule_id: session.schedule_id,
      academic_year_id: session.academic_year_id,
      semester_id: session.semester_id,
      date: session.date,
      start_time: session.start_time,
      end_time: session.end_time,
      scan_time: "",
      status: leave.leave_type,
      input_method: "leave_auto",
      note: "Dibuat otomatis dari izin/sakit disetujui.",
      created_by: currentUser().id,
      updated_by: currentUser().id,
      created_at: now(),
      updated_at: now()
    };
    state.db.attendance_records.push(rec);
    logChange(rec, "belum", rec.status, "Izin/sakit disetujui sebelum siswa absen.");
  });
}

async function startCamera(sessionId) {
  if (!("BarcodeDetector" in window)) return toast("Browser ini belum mendukung scanner kamera. Gunakan input token manual.", "warn");
  stopCamera();
  const video = byId("qr-video");
  state.videoStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
  video.srcObject = state.videoStream;
  await video.play();
  const detector = new BarcodeDetector({ formats: ["qr_code"] });
  const loop = async () => {
    if (!state.videoStream || !video.srcObject) return;
    try {
      const codes = await detector.detect(video);
      if (codes[0]?.rawValue) scanToken(sessionId, codes[0].rawValue.trim());
    } catch {}
    setTimeout(loop, 900);
  };
  loop();
}

function stopCamera() {
  if (state.videoStream) state.videoStream.getTracks().forEach(t => t.stop());
  state.videoStream = null;
}

function renderReports() {
  const user = currentUser();
  const hideTeacherStudentFilters = ["guru", "wali_kelas"].includes(user.role);
  const hideClassFilter = user.role === "wali_kelas";
  const showUnitFilter = ["super_admin", "kepala_sekolah"].includes(user.role);
  const selectedMonth = state.filters.reportMonth || currentMonthValue();
  const reportFilters = reportFilterValues();
  byId("view").innerHTML = `
    <section class="panel">
      <div class="panel-head"><div><h2>Filter Laporan</h2><p class="muted">Persentase = (Hadir + Terlambat) / Total sesi wajib x 100.</p></div><div class="actions report-actions">${academicYearSwitcher("reports")}${reportExportSelect()}</div></div>
      <div class="report-filter-shell">
        <div class="report-filter-title"><span>Filter Bulan</span><button type="button" class="ghost" data-reset-report>Reset</button></div>
        <div class="report-auto-semester">Semester otomatis: <strong id="report-auto-semester">${escapeHtml(reportSemesterName(selectedMonth))}</strong></div>
        <div class="filters report-filters">
        ${reportMonthSelect(selectedMonth)}
        ${showUnitFilter ? reportUnitSelect() : ""}
        ${hideClassFilter ? "" : reportFilterSelect("class_id", "Kelas", "classes")}
        ${hideTeacherStudentFilters ? "" : reportFilterSelect("student_id", "Siswa", "students")}
        ${reportFilterSelect("subject_id", "Mapel", "subjects")}
        ${hideTeacherStudentFilters ? "" : reportFilterSelect("teacher_id", "Guru", "teachers")}
        </div>
      </div>
      <div id="report-output"></div>
    </section>`;
  byId("view").querySelectorAll("select,input").forEach(el => el.onchange = () => {
    if (el.id === "report-month") state.filters.reportMonth = el.value;
    else if (el.name) reportFilters[el.name] = el.value;
    if (el.name === "unit") {
      ["class_id", "student_id", "subject_id", "teacher_id"].forEach(key => delete reportFilters[key]);
      return renderReports();
    }
    if (["class_id", "subject_id", "teacher_id"].includes(el.name)) return renderReports();
    renderReportOutput();
  });
  byId("view").querySelector("[data-reset-report]")?.addEventListener("click", () => {
    byId("view").querySelectorAll(".report-filters select, .report-filters input").forEach(el => el.value = "");
    state.filters.reportMonth = currentMonthValue();
    state.filters.reportFilters = {};
    byId("report-month").value = state.filters.reportMonth;
    renderReports();
  });
  byId("view").querySelector("[data-report-export]")?.addEventListener("change", e => {
    const value = e.target.value;
    e.target.value = "";
    if (value === "csv") exportAttendanceMatrixCsv();
    if (value === "excel") exportAttendanceMatrixExcel();
    if (value === "pdf") window.print();
  });
  bindAcademicYearSwitcher(renderReports);
  renderReportOutput();
}

function reportExportSelect() {
  return `<select class="table-action-select export-select" data-report-export aria-label="Export laporan">
    <option value="">Export</option>
    <option value="csv">CSV</option>
    <option value="excel">Excel</option>
    <option value="pdf">Cetak / PDF</option>
  </select>`;
}

function currentMonthValue() {
  const options = reportMonthOptions();
  const current = new Date().toISOString().slice(0, 7);
  return options.find(option => option.value === current)?.value || options[0]?.value || String(new Date().getMonth() + 1).padStart(2, "0");
}

function reportMonthSelect(value) {
  const options = reportMonthOptions();
  const selected = options.some(option => option.value === value) ? value : options[0]?.value;
  if (selected && state.filters.reportMonth !== selected) state.filters.reportMonth = selected;
  return `<select id="report-month" aria-label="Bulan laporan">${options.map(option => {
    return `<option value="${option.value}" ${selected === option.value ? "selected" : ""}>${escapeHtml(option.label)}</option>`;
  }).join("")}</select>`;
}

function reportMonthOptions() {
  const ay = findById("academic_years", selectedAcademicYearId());
  const monthNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
  if (!ay?.start_date || !ay?.end_date) {
    return monthNames.map((name, index) => {
      const month = String(index + 1).padStart(2, "0");
      return { value: month, label: `${index + 1}. ${name}` };
    });
  }
  const options = [];
  const cursor = new Date(`${ay.start_date.slice(0, 7)}-01T00:00:00`);
  const end = new Date(`${ay.end_date.slice(0, 7)}-01T00:00:00`);
  while (cursor <= end && options.length <= 14) {
    const year = cursor.getFullYear();
    const monthIndex = cursor.getMonth();
    const month = String(monthIndex + 1).padStart(2, "0");
    options.push({ value: `${year}-${month}`, label: `${monthIndex + 1}. ${monthNames[monthIndex]} ${year}` });
    cursor.setMonth(cursor.getMonth() + 1);
  }
  return options;
}

function renderReportOutput() {
  const semesterLabel = byId("report-auto-semester");
  if (semesterLabel) semesterLabel.textContent = reportSemesterName();
  byId("report-output").innerHTML = attendanceMatrixHtml(attendanceMatrixReport());
}

function reportYearMonth(month = byId("report-month")?.value || state.filters.reportMonth || currentMonthValue()) {
  return reportMonthDate(month).slice(0, 7);
}

function reportMonthDate(month = byId("report-month")?.value || state.filters.reportMonth || currentMonthValue()) {
  const ay = findById("academic_years", selectedAcademicYearId());
  const rawMonth = String(month || currentMonthValue());
  if (/^\d{4}-\d{2}$/.test(rawMonth)) return `${rawMonth}-01`;
  const normalizedMonth = rawMonth.padStart(2, "0");
  const currentYear = new Date().getFullYear();
  if (!ay?.start_date || !ay?.end_date) return `${currentYear}-${normalizedMonth}-01`;
  const years = [...new Set([ay.start_date.slice(0, 4), ay.end_date.slice(0, 4)])];
  const match = years
    .map(year => `${year}-${normalizedMonth}-01`)
    .find(date => date >= ay.start_date && date <= ay.end_date);
  return match || `${years[0] || currentYear}-${normalizedMonth}-01`;
}

function reportSemester(month = byId("report-month")?.value || state.filters.reportMonth || currentMonthValue()) {
  const date = reportMonthDate(month);
  return state.db.semesters.find(semester =>
    !semester.deleted_at &&
    semester.academic_year_id === selectedAcademicYearId() &&
    (!semester.start_date || date >= semester.start_date) &&
    (!semester.end_date || date <= semester.end_date)
  ) || null;
}

function reportSemesterName(month) {
  const semester = reportSemester(month);
  return semester ? displayName("semesters", semester) : "Tidak ditemukan";
}

function filteredRecords() {
  const root = byId("view");
  let rows = scopedAttendanceRecords();
  const selectedUnit = root.querySelector('[name="unit"]')?.value || reportFilterValues().unit || activeUnit();
  if (selectedUnit) {
    const unitClassIds = new Set(classesForSelectedYear().filter(cls => classUnit(cls) === selectedUnit).map(cls => cls.id));
    rows = rows.filter(record => unitClassIds.has(record.class_id));
  }
  ["academic_year_id", "class_id", "student_id", "subject_id", "teacher_id"].forEach(k => {
    const v = root.querySelector(`[name="${k}"]`)?.value;
    if (v) rows = rows.filter(r => r[k] === v);
  });
  const from = byId("from-date")?.value;
  const to = byId("to-date")?.value;
  const yearMonth = reportYearMonth();
  const semesterId = reportSemester()?.id || "";
  if (yearMonth) rows = rows.filter(r => String(r.date || "").slice(0, 7) === yearMonth);
  if (semesterId) rows = rows.filter(r => r.semester_id === semesterId);
  if (from) rows = rows.filter(r => r.date >= from);
  if (to) rows = rows.filter(r => r.date <= to);
  return rows;
}

function teacherMatchesHeadmasterUnit(teacher, unit = headmasterUnit()) {
  if (!unit) return true;
  if (!teacherCanLogin(teacher)) return false;
  if (headmasterUnits(teacher).includes(unit)) return true;
  if (String(teacher.unit || "").toUpperCase() === unit) return true;
  const classIds = new Set(classesForSelectedYear().filter(cls => classUnit(cls) === unit).map(cls => cls.id));
  if (classesForSelectedYear().some(cls => cls.homeroom_teacher_id === teacher.id && classIds.has(cls.id))) return true;
  return schedulesForSelectedYear().some(schedule => schedule.teacher_id === teacher.id && classIds.has(schedule.class_id));
}

function attendanceMatrixReport() {
  const root = byId("view");
  const records = filteredRecords();
  const classId = root.querySelector('[name="class_id"]')?.value || "";
  const subjectId = root.querySelector('[name="subject_id"]')?.value || "";
  const semesterId = reportSemester()?.id || "";
  const setting = state.db.settings[0] || {};
  const classIds = classId ? [classId] : [...new Set(records.map(r => r.class_id).filter(Boolean))];
  let students = classId
    ? studentsInClass(classId)
    : activeStudentsForSelectedYear().filter(s => classIds.includes(s.active_class_id));
  if (!students.length) {
    const ids = [...new Set(records.map(r => r.student_id).filter(Boolean))];
    students = ids.map(id => findById("students", id)).filter(Boolean);
  }
  const sessionKeys = [];
  const sessionMap = new Map();
  records.forEach(record => {
    const key = record.session_id || `${record.date}_${record.class_id}_${record.subject_id}_${record.teacher_id}_${record.start_time}`;
    if (!sessionMap.has(key)) {
      sessionKeys.push(key);
      sessionMap.set(key, {
        key,
        date: record.date || "",
        start_time: record.start_time || "",
        end_time: record.end_time || "",
        subject_id: record.subject_id,
        teacher_id: record.teacher_id
      });
    }
  });
  sessionKeys.sort((a, b) => {
    const x = sessionMap.get(a);
    const y = sessionMap.get(b);
    return `${x.date}${x.start_time}`.localeCompare(`${y.date}${y.start_time}`);
  });
  const sessions = sessionKeys.slice(0, 31).map(key => sessionMap.get(key));
  const recordByStudentSession = new Map(records.map(record => [
    `${record.student_id}|${record.session_id || `${record.date}_${record.class_id}_${record.subject_id}_${record.teacher_id}_${record.start_time}`}`,
    record
  ]));
  const rows = students
    .slice()
    .sort((a, b) => String(a.name || "").localeCompare(String(b.name || "")))
    .map((student, index) => {
      const totals = { sakit: 0, izin: 0, alfa: 0 };
      const cells = sessions.map(session => {
        const record = recordByStudentSession.get(`${student.id}|${session.key}`);
        const mark = attendanceMark(record?.status);
        if (record?.status === "sakit") totals.sakit++;
        if (record?.status === "izin") totals.izin++;
        if (record?.status === "alfa") totals.alfa++;
        return mark;
      });
      return { index: index + 1, student, cells, totals };
    });
  const cls = findById("classes", classId) || (classIds.length === 1 ? findById("classes", classIds[0]) : null);
  const subject = findById("subjects", subjectId) || (sessions.length ? findById("subjects", sessions[0].subject_id) : null);
  const teacher = sessions.length ? findById("teachers", sessions[0].teacher_id) : null;
  return { setting, class: cls, subject, teacher, semesterId, sessions, rows };
}

function attendanceMark(status) {
  return ({ hadir: "H", terlambat: "T", izin: "I", sakit: "S", alfa: "A" })[status] || "";
}

function attendanceMatrixHtml(report) {
  const sessionCount = 31;
  const sessionCells = Array.from({ length: sessionCount }, (_, i) => `<th>${i + 1}</th>`).join("");
  const dateCells = Array.from({ length: sessionCount }, (_, i) => `<td>${escapeHtml(shortDate(report.sessions[i]?.date || ""))}</td>`).join("");
  const rowHtml = report.rows.map(row => `
    <tr>
      <td class="center">${row.index}.</td>
      <td>${escapeHtml(row.student.nis || "")}</td>
      <td>${escapeHtml(row.student.nisn || "")}</td>
      <td class="student-name">${escapeHtml(row.student.name || "")}</td>
      ${Array.from({ length: sessionCount }, (_, i) => `<td class="center">${escapeHtml(row.cells[i] || "")}</td>`).join("")}
      <td class="center">${row.totals.sakit}</td>
      <td class="center">${row.totals.izin}</td>
      <td class="center">${row.totals.alfa}</td>
    </tr>`).join("");
  const logo = report.setting.school_logo ? `<img src="${escapeHtml(report.setting.school_logo)}" alt="Logo">` : "";
  return `<div class="official-report">
    <div class="official-report-head">
      ${logo}
      <div>
        <h2>ABSENSI SISWA</h2>
        <p>${escapeHtml(report.setting.school_name || "Nama Sekolah")}</p>
      </div>
    </div>
    <div class="official-report-meta">
      <span>Kelas : <strong>${escapeHtml(displayName("classes", report.class) || "-")}</strong></span>
      <span>Mata Pelajaran : <strong>${escapeHtml(displayName("subjects", report.subject) || "Semua Mapel")}</strong></span>
    </div>
    <div class="table-wrap official-report-wrap">
      <table class="attendance-matrix">
        <thead>
          <tr>
            <th rowspan="3">Nomor Urut</th>
            <th rowspan="3">Nomor Induk</th>
            <th rowspan="3">NISN</th>
            <th rowspan="3">Nama Siswa</th>
            <th colspan="31">Kehadiran Siswa Pada Kegiatan Tatap Muka</th>
            <th colspan="3">Jumlah</th>
          </tr>
          <tr>
            ${sessionCells}
            <th>S</th><th>I</th><th>A</th>
          </tr>
          <tr>
            ${dateCells}
            <th></th><th></th><th></th>
          </tr>
        </thead>
        <tbody>${rowHtml || emptyRow(38)}</tbody>
      </table>
    </div>
    <div class="official-report-note">Keterangan: H = Hadir, T = Terlambat, S = Sakit, I = Izin, A = Alfa. Tanggal cetak: ${today()}.</div>
    <div class="signatures official-signatures">
      <div>Guru Mata Pelajaran<br><br><br><strong>${escapeHtml(report.teacher?.name || "(________________)")}</strong></div>
      <div>Kepala Sekolah<br><br><br><strong>${escapeHtml(report.setting.headmaster_name || "(________________)")}</strong></div>
    </div>
  </div>`;
}

function exportAttendanceMatrixCsv() {
  const report = attendanceMatrixReport();
  const header = ["No", "NIS", "NISN", "Nama Siswa", ...Array.from({ length: 31 }, (_, i) => `Pertemuan ${i + 1}`), "Sakit", "Izin", "Alfa"];
  const rows = report.rows.map(row => [row.index, row.student.nis || "", row.student.nisn || "", row.student.name || "", ...Array.from({ length: 31 }, (_, i) => row.cells[i] || ""), row.totals.sakit, row.totals.izin, row.totals.alfa]);
  const csv = [
    ["ABSENSI SISWA"],
    [`Kelas: ${displayName("classes", report.class) || "-"}`, `Mata Pelajaran: ${displayName("subjects", report.subject) || "Semua Mapel"}`],
    header,
    ...rows
  ].map(row => row.map(csvCell).join(",")).join("\n");
  downloadBlob(`absensi_siswa_${today()}.csv`, csv, "text/csv");
}

function exportAttendanceMatrixExcel() {
  const report = attendanceMatrixReport();
  const rows = [
    ["ABSENSI SISWA"],
    [report.setting.school_name || "Nama Sekolah"],
    [`Kelas: ${displayName("classes", report.class) || "-"}`, "", "", `Mata Pelajaran: ${displayName("subjects", report.subject) || "Semua Mapel"}`],
    ["No", "NIS", "NISN", "Nama Siswa", ...Array.from({ length: 31 }, (_, i) => String(i + 1)), "S", "I", "A"],
    ["", "", "", "Tanggal", ...Array.from({ length: 31 }, (_, i) => shortDate(report.sessions[i]?.date || "")), "", "", ""],
    ...report.rows.map(row => [
      row.index,
      row.student.nis || "",
      row.student.nisn || "",
      row.student.name || "",
      ...Array.from({ length: 31 }, (_, i) => row.cells[i] || ""),
      row.totals.sakit,
      row.totals.izin,
      row.totals.alfa
    ]),
    [],
    [`Keterangan: H = Hadir, T = Terlambat, S = Sakit, I = Izin, A = Alfa. Tanggal cetak: ${today()}.`],
    [],
    ["Guru Mata Pelajaran", "", "", "Kepala Sekolah"],
    [report.teacher?.name || "(________________)", "", "", report.setting.headmaster_name || "(________________)"]
  ];
  downloadXlsx(`absensi_siswa_${today()}.xlsx`, "Absensi Siswa", rows);
}

function shortDate(date) {
  if (!date) return "";
  const parts = String(date).split("-");
  return parts.length === 3 ? `${parts[2]}/${parts[1]}` : date;
}

function downloadBlob(filename, content, type) {
  const a = document.createElement("a");
  const blob = content instanceof Blob ? content : new Blob([content], { type });
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}

function downloadXlsx(filename, sheetName, rows) {
  downloadBlob(filename, createXlsxBlob(sheetName, rows), "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
}

function createXlsxBlob(sheetName, rows) {
  const files = {
    "[Content_Types].xml": `<?xml version="1.0" encoding="UTF-8"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
  <Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
</Types>`,
    "_rels/.rels": `<?xml version="1.0" encoding="UTF-8"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
</Relationships>`,
    "xl/workbook.xml": `<?xml version="1.0" encoding="UTF-8"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <sheets><sheet name="${xmlEscape(String(sheetName || "Sheet1").slice(0, 31) || "Sheet1")}" sheetId="1" r:id="rId1"/></sheets>
</workbook>`,
    "xl/_rels/workbook.xml.rels": `<?xml version="1.0" encoding="UTF-8"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>
</Relationships>`,
    "xl/worksheets/sheet1.xml": worksheetXml(rows)
  };
  return new Blob([zipStore(files)], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
}

function worksheetXml(rows) {
  const safeRows = rows.length ? rows : [["Belum ada data"]];
  const sheetRows = safeRows.map((row, rowIndex) => {
    const cells = row.map((value, colIndex) => {
      const ref = `${xlsxColumnName(colIndex + 1)}${rowIndex + 1}`;
      return `<c r="${ref}" t="inlineStr"><is><t>${xmlEscape(value ?? "")}</t></is></c>`;
    }).join("");
    return `<row r="${rowIndex + 1}">${cells}</row>`;
  }).join("");
  return `<?xml version="1.0" encoding="UTF-8"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <sheetData>${sheetRows}</sheetData>
</worksheet>`;
}

function xlsxColumnName(index) {
  let name = "";
  while (index > 0) {
    const mod = (index - 1) % 26;
    name = String.fromCharCode(65 + mod) + name;
    index = Math.floor((index - mod) / 26);
  }
  return name;
}

function xmlEscape(value) {
  return String(value ?? "").replace(/[<>&"']/g, char => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;", "'": "&apos;" }[char]));
}

function zipStore(files) {
  const encoder = new TextEncoder();
  const localParts = [];
  const centralParts = [];
  let offset = 0;
  Object.entries(files).forEach(([name, content]) => {
    const nameBytes = encoder.encode(name);
    const data = encoder.encode(content);
    const crc = crc32(data);
    const local = zipLocalHeader(nameBytes, data.length, crc);
    localParts.push(local, data);
    centralParts.push(zipCentralHeader(nameBytes, data.length, crc, offset));
    offset += local.length + data.length;
  });
  const centralSize = centralParts.reduce((sum, part) => sum + part.length, 0);
  const end = zipEndRecord(Object.keys(files).length, centralSize, offset);
  return concatBytes([...localParts, ...centralParts, end]);
}

function zipLocalHeader(nameBytes, size, crc) {
  const out = new Uint8Array(30 + nameBytes.length);
  const view = new DataView(out.buffer);
  view.setUint32(0, 0x04034b50, true);
  view.setUint16(4, 20, true);
  view.setUint16(6, 0x0800, true);
  view.setUint16(8, 0, true);
  view.setUint16(10, 0, true);
  view.setUint16(12, 0, true);
  view.setUint32(14, crc, true);
  view.setUint32(18, size, true);
  view.setUint32(22, size, true);
  view.setUint16(26, nameBytes.length, true);
  out.set(nameBytes, 30);
  return out;
}

function zipCentralHeader(nameBytes, size, crc, offset) {
  const out = new Uint8Array(46 + nameBytes.length);
  const view = new DataView(out.buffer);
  view.setUint32(0, 0x02014b50, true);
  view.setUint16(4, 20, true);
  view.setUint16(6, 20, true);
  view.setUint16(8, 0x0800, true);
  view.setUint16(10, 0, true);
  view.setUint16(12, 0, true);
  view.setUint16(14, 0, true);
  view.setUint32(16, crc, true);
  view.setUint32(20, size, true);
  view.setUint32(24, size, true);
  view.setUint16(28, nameBytes.length, true);
  view.setUint32(42, offset, true);
  out.set(nameBytes, 46);
  return out;
}

function zipEndRecord(count, centralSize, centralOffset) {
  const out = new Uint8Array(22);
  const view = new DataView(out.buffer);
  view.setUint32(0, 0x06054b50, true);
  view.setUint16(8, count, true);
  view.setUint16(10, count, true);
  view.setUint32(12, centralSize, true);
  view.setUint32(16, centralOffset, true);
  return out;
}

function concatBytes(parts) {
  const total = parts.reduce((sum, part) => sum + part.length, 0);
  const out = new Uint8Array(total);
  let cursor = 0;
  parts.forEach(part => {
    out.set(part, cursor);
    cursor += part.length;
  });
  return out;
}

function crc32(bytes) {
  const table = crc32.table || (crc32.table = Array.from({ length: 256 }, (_, index) => {
    let value = index;
    for (let bit = 0; bit < 8; bit++) value = value & 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1;
    return value >>> 0;
  }));
  let crc = 0xffffffff;
  for (const byte of bytes) crc = table[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

function renderUsers() {
  const access = loginAccessSummary();
  byId("view").innerHTML = `<section class="panel admin-workflow">
    <div class="panel-head workflow-head">
      <div><span class="eyebrow">Kontrol Akses Login</span><h2>Akses Login</h2><p class="muted">Akses aktif disinkronkan langsung dari data master siswa, guru, wali kelas, kepala sekolah, dan administrator.</p></div>
      <div class="actions"><button class="primary" data-add-user>Tambah Administrator</button></div>
    </div>
    <div class="workflow-stats">
      ${card("Administrator", access.admins.length)}
      ${card("Kepala Sekolah", access.headmasters.length)}
      ${card("Guru", access.teachers.length)}
      ${card("Wali Kelas", access.homerooms.length)}
      ${card("Siswa", access.students.length)}
      ${card("Akun Bermasalah", access.problemUsers.length)}
    </div>
    <div class="role-card-grid">
      ${access.activeRows.map(loginAccessCard).join("") || `<div class="empty-state">Belum ada akses aktif dari data master.</div>`}
    </div>
    ${access.problemUsers.length ? `<section class="panel-subsection">
      <div class="panel-head compact"><div><h3>Akun Bermasalah</h3><p class="muted">Akun berikut masih tersimpan untuk audit, tetapi master siswa/guru sudah tidak valid atau nonaktif.</p></div></div>
      <div class="role-card-grid problem-grid">${access.problemUsers.map(userRoleCard).join("")}</div>
    </section>` : ""}
  </section>`;
  byId("view").querySelector("[data-add-user]").onclick = () => openUserForm();
  byId("view").querySelectorAll("[data-user]").forEach(b => b.onclick = () => openUserForm(findById("users", b.dataset.user)));
  byId("view").querySelectorAll("[data-edit-master]").forEach(b => {
    b.onclick = () => {
      const [table, id] = b.dataset.editMaster.split(":");
      const row = findById(table, id);
      if (!row) return toast("Data master tidak ditemukan.", "error");
      if (table === "users") return openUserForm(row);
      openForm(table, row);
    };
  });
}

function loginAccessSummary() {
  const admins = state.db.users.filter(user => !user.deleted_at && user.role === "super_admin" && user.active !== "false");
  const activeTeachers = activeTeachersForDisplay();
  const headmasters = activeTeachers.filter(teacher => (teacher.staff_role || "") === "kepala_sekolah" || state.db.users.some(user => !user.deleted_at && user.active !== "false" && user.teacher_id === teacher.id && user.role === "kepala_sekolah"));
  const homerooms = activeTeachers.filter(teacher => teacher.is_homeroom === "true" || classesForSelectedYear().some(cls => cls.homeroom_teacher_id === teacher.id));
  const teacherRows = activeTeachers.filter(teacher => !headmasters.some(item => item.id === teacher.id) && !homerooms.some(item => item.id === teacher.id));
  const students = activeStudentsForSelectedYear();
  const activeRows = [
    ...admins.map(user => ({ type: "user", role: "super_admin", title: user.name, identity: user.email || "-", status: "Aktif", edit: `users:${user.id}` })),
    ...headmasters.map(teacher => ({ type: "teacher", role: "kepala_sekolah", title: teacher.name, identity: teacher.identity_number || teacher.nip || "-", status: "Aktif", edit: `teachers:${teacher.id}` })),
    ...homerooms.map(teacher => ({ type: "teacher", role: "wali_kelas", title: teacher.name, identity: teacher.identity_number || teacher.nip || "-", status: "Aktif", edit: `teachers:${teacher.id}` })),
    ...teacherRows.map(teacher => ({ type: "teacher", role: "guru", title: teacher.name, identity: teacher.identity_number || teacher.nip || "-", status: "Aktif", edit: `teachers:${teacher.id}` })),
    ...students.map(student => ({ type: "student", role: "siswa", title: student.name, identity: student.nisn || student.nis || "-", status: displayName("classes", findById("classes", student.active_class_id)) || "Aktif", edit: `students:${student.id}` }))
  ];
  const validUserIds = new Set(admins.map(user => user.id));
  state.db.users.filter(user => !user.deleted_at && user.student_id && studentCanLogin(findById("students", user.student_id))).forEach(user => validUserIds.add(user.id));
  state.db.users.filter(user => !user.deleted_at && user.teacher_id && teacherCanLogin(findById("teachers", user.teacher_id))).forEach(user => validUserIds.add(user.id));
  const problemUsers = state.db.users.filter(user => !user.deleted_at && user.role !== "super_admin" && !validUserIds.has(user.id));
  return { admins, headmasters, teachers: teacherRows, homerooms, students, activeRows, problemUsers };
}

function loginAccessCard(row) {
  return `<article class="role-card">
    <div>
      <span class="class-label">${escapeHtml(roles[row.role] || row.role)}</span>
      <h3>${escapeHtml(row.title || "-")}</h3>
      <p>${escapeHtml(row.identity || "-")}</p>
    </div>
    <div class="role-card-foot">
      <span class="badge open">${escapeHtml(row.status || "Aktif")}</span>
      <button class="ghost" data-edit-master="${escapeHtml(row.edit)}">Edit Master</button>
    </div>
  </article>`;
}

function userRoleCard(user) {
  const login = user.role === "siswa"
    ? findById("students", user.student_id)?.nisn || "-"
    : user.teacher_id ? findById("teachers", user.teacher_id)?.nip || user.nip || "-" : user.email || "-";
  return `<article class="role-card">
    <div>
      <span class="class-label">${escapeHtml(roles[user.role] || user.role)}</span>
      <h3>${escapeHtml(user.name || "-")}</h3>
      <p>${escapeHtml(login)}</p>
    </div>
    <div class="role-card-foot">
      <span class="badge ${user.active === "false" ? "closed" : "open"}">${boolText(user.active)}</span>
      <button class="ghost" data-user="${user.id}">Edit</button>
    </div>
  </article>`;
}

function renderProfile() {
  const user = currentUser();
  const adminProfile = user.role === "super_admin";
  const readOnlyProfile = ["siswa", "wali_murid"].includes(user.role);
  const linkedInfo = ["siswa", "wali_murid"].includes(user.role)
    ? `NISN: ${escapeHtml(findById("students", user.student_id || user.murid_id)?.nisn || "-")}`
    : user.teacher_id ? `NIP: ${escapeHtml(findById("teachers", user.teacher_id)?.nip || user.nip || "-")}` : "Akun administrator";
  const biodata = profileDetails(user);
  byId("view").innerHTML = `
    <section class="panel profile-page-panel">
      <div class="panel-head">
        <div><h2>Profil Saya</h2><p class="muted">${adminProfile ? "Administrator bisa mengubah email dan password." : user.role === "wali_murid" ? "Akses wali murid mengikuti siswa yang dipilih saat login." : "Login mengikuti NIP/NISN pada data Administrator."}</p></div>
        ${!adminProfile ? `<button class="ghost" data-inline-logout>Keluar</button>` : ""}
      </div>
      ${!adminProfile ? `<div class="profile-page-avatar">${profileAvatarHtml(user)}</div>` : ""}
      ${!adminProfile ? `<div class="profile-biodata-grid profile-biodata-page">
        ${biodata.map(([label, value]) => `<p><small>${escapeHtml(label)}</small><strong>${escapeHtml(value || "-")}</strong></p>`).join("")}
      </div>` : ""}
      ${readOnlyProfile ? `<div class="readonly-profile-note">${user.role === "wali_murid" ? "Profil wali murid hanya untuk memantau anak yang dipilih. Jika ingin mengganti anak, keluar lalu login dengan nama siswa lain." : "Profil siswa mengikuti data master Administrator. Jika ada data yang salah, hubungi wali kelas atau administrator."}</div>` : `
      <form id="profile-form" class="form-grid">
        <label>Nama<input name="name" value="${escapeHtml(user.name)}" required></label>
        <label>Role<input value="${escapeHtml(roles[user.role] || user.role)}" disabled></label>
        <label class="wide">Identitas Login<input value="${linkedInfo}" disabled></label>
        ${adminProfile ? `<label>Email Login<input type="email" name="email" value="${escapeHtml(user.email)}" required></label><label>Password Baru<input type="password" name="password" placeholder="Kosongkan jika tidak diubah"></label>` : ""}
        <div class="wide actions"><button class="primary">Simpan Profil</button></div>
      </form>`}
    </section>`;
  bindProfileSummaryActions();
  if (readOnlyProfile) return;
  byId("profile-form").onsubmit = async e => {
    e.preventDefault();
    const fd = formData(e.target);
    user.name = fd.name;
    if (adminProfile) {
      const duplicate = state.db.users.find(u => u.email?.toLowerCase() === fd.email.toLowerCase() && u.id !== user.id);
      if (duplicate) return toast("Email sudah dipakai pengguna lain.", "error");
      user.email = fd.email;
      if (fd.password) user.password_hash = await hashPassword(fd.password);
    }
    user.updated_at = now();
    syncLinkedRecordFromUser(user);
    saveDb();
    byId("active-user").textContent = user.name;
    toast("Profil diperbarui.", "ok");
  };
}

function openUserForm(row = null) {
  modal(row ? "Edit Pengguna" : "Tambah Pengguna", `<form id="user-form" class="form-grid">
    <label>Nama<input name="name" value="${escapeHtml(row?.name || "")}" required></label>
    <label>Email<input type="email" name="email" value="${escapeHtml(row?.email || "")}" required></label>
    <label>Role<select name="role"><option value="super_admin">Administrator</option></select></label>
    <label>Status<select name="active"><option value="true">Aktif</option><option value="false" ${row?.active === "false" ? "selected" : ""}>Nonaktif</option></select></label>
    <label class="wide">Password ${row ? "(kosongkan jika tidak diubah)" : "(kosongkan untuk dibuat otomatis)"}<input type="password" name="password"></label>
    <div class="wide actions"><button class="primary">Simpan</button><button class="ghost" type="button" data-close>Batal</button></div>
  </form>`);
  byId("user-form").onsubmit = async e => {
    e.preventDefault();
    const fd = formData(e.target);
    const duplicate = state.db.users.find(u => u.email?.toLowerCase() === fd.email.toLowerCase() && u.id !== row?.id);
    if (duplicate) return toast("Email sudah dipakai pengguna lain.", "error");
    const payload = { name: fd.name, email: fd.email, role: fd.role, active: fd.active, updated_at: now() };
    const generated = !row && !fd.password ? makePassword() : "";
    if (generated) fd.password = generated;
    if (fd.password) payload.password_hash = await hashPassword(fd.password);
    if (row) Object.assign(row, payload);
    else state.db.users.push({ id: uid("usr"), ...payload, created_at: now() });
    syncLinkedRecordFromUser(row || state.db.users.at(-1));
    saveDb(); closeModal({ fromPopState: true }); renderUsers();
    if (generated) showGeneratedCredentials({ name: fd.name, email: fd.email, password: generated, role: fd.role });
    else toast("Pengguna disimpan.", "ok");
  };
}

function openImport(table) {
  modal(`Import CSV ${schemas[table].title}`, `<form id="import-form" class="form-grid"><label class="wide">CSV<textarea name="csv" required placeholder="Header harus sesuai nama field, contoh: name,email"></textarea></label><div class="wide actions"><button class="primary">Import</button><button class="ghost" type="button" data-close>Batal</button></div></form>`);
  byId("import-form").onsubmit = e => {
    e.preventDefault();
    const rows = parseCsv(formData(e.target).csv);
    rows.forEach(r => state.db[table].push({ id: uid(table.slice(0, 3)), ...r, created_at: now(), updated_at: now(), created_by: currentUser().id }));
    saveDb(); closeModal({ fromPopState: true }); renderCrud(table); toast(`${rows.length} data diimport.`, "ok");
  };
}

function openQrPrint() {
  const options = classOptionList();
  modal("Cetak QR Massal", `<form id="qr-class-form" class="form-grid"><label>Kelas<select name="class_id" required>${options}</select></label><div class="wide actions"><button class="primary">Tampilkan QR</button><button class="ghost" type="button" data-close>Batal</button></div></form>`);
  byId("qr-class-form").onsubmit = e => { e.preventDefault(); const fd = formData(e.target); showQrCards(studentsInClass(fd.class_id)); };
}

function classOptionList(selectedId = "") {
  return visibleRows("classes")
    .map(cls => `<option value="${cls.id}" ${cls.id === selectedId ? "selected" : ""}>${escapeHtml(classSimpleLabel(cls))}</option>`)
    .join("");
}

function openClassManager() {
  const options = classOptionList();
  if (!options) return toast("Belum ada data kelas. Buat kelas terlebih dahulu.", "error");
  modal("Kelola Siswa per Kelas", `<form id="class-manager-form" class="form-grid">
    <label class="wide">Pilih Kelas / Semester<select name="class_id" required>${options}</select></label>
    <div class="wide actions"><button class="primary">Kelola Siswa</button><button class="ghost" type="button" data-close>Batal</button></div>
  </form>`);
  byId("class-manager-form").onsubmit = e => {
    e.preventDefault();
    const fd = formData(e.target);
    openClassStudents(fd.class_id);
  };
}

function openMoveStudent(studentId) {
  const student = findById("students", studentId);
  if (!student) return toast("Siswa tidak ditemukan.", "error");
  const options = classOptionList(student.active_class_id);
  if (!options) return toast("Belum ada data kelas. Buat kelas terlebih dahulu.", "error");
  modal(`Pindah Kelas ${escapeHtml(student.name)}`, `<form id="move-student-form" class="form-grid">
    <div class="wide summary-grid">
      ${card("NIS", escapeHtml(student.nis || "-"))}
      ${card("NISN", escapeHtml(student.nisn || "-"))}
      ${card("Kelas Saat Ini", escapeHtml(displayName("classes", findById("classes", student.active_class_id)) || "-"))}
    </div>
    <label class="wide">Kelas / Semester Tujuan<select name="class_id" required>${options}</select></label>
    <div class="wide actions"><button class="primary">Simpan Pindah Kelas</button><button class="ghost" type="button" data-close>Batal</button></div>
  </form>`);
  byId("move-student-form").onsubmit = e => {
    e.preventDefault();
    const fd = formData(e.target);
    moveStudentToClass(student, fd.class_id);
    saveDb();
    closeModal({ fromPopState: true });
    renderCrud("students");
    toast(`${student.name} dipindahkan ke ${displayName("classes", findById("classes", fd.class_id))}.`, "ok");
  };
}

function openSemesterPromotion(classId) {
  const source = findById("classes", classId);
  if (!source) return toast("Kelas tidak ditemukan.", "error");
  const nextSemester = nextSemesterForClass(source);
  if (!nextSemester) return toast("Semester berikutnya tidak ditemukan. Jika kelas sudah Genap, gunakan Kenaikan Kelas.", "error");
  const studentCount = studentsInClass(source.id).length;
  modal(`Kenaikan Semester ${escapeHtml(source.name)}`, `<form id="semester-promotion-form" class="form-grid">
    <div class="wide summary-grid">
      ${card("Dari", escapeHtml(displayName("classes", source)))}
      ${card("Ke Semester", escapeHtml(nextSemester.name))}
      ${card("Jumlah Siswa", studentCount)}
    </div>
    <p class="wide muted">Kelas tidak dibuat ulang. Sistem hanya mengganti semester aktif kelas ini, lalu menutup riwayat semester lama dan membuat riwayat aktif semester baru untuk siswa yang masih aktif.</p>
    <div class="wide actions"><button class="primary">Proses Kenaikan Semester</button><button class="ghost" type="button" data-close>Batal</button></div>
  </form>`);
  byId("semester-promotion-form").onsubmit = e => {
    e.preventDefault();
    const moved = promoteClassSemester(source, nextSemester.id);
    saveDb();
    closeModal({ fromPopState: true });
    renderCrud("students");
    toast(`${moved} siswa naik ke semester ${nextSemester.name}. Riwayat semester lama tetap tersimpan.`, "ok");
  };
}

function promoteClassSemester(cls, nextSemesterId) {
  const nextSemester = findById("semesters", nextSemesterId);
  if (!cls || !nextSemester) return 0;
  const oldSemesterId = cls.semester_id;
  const students = studentsInClass(cls.id);
  cls.semester_id = nextSemester.id;
  cls.academic_year_id = nextSemester.academic_year_id || cls.academic_year_id;
  cls.updated_at = now();
  cls.updated_by = currentUser().id;
  students.forEach(student => {
    closeActiveStudentHistoryForSemester(student.id, cls.id, oldSemesterId);
    student.active_class_id = cls.id;
    student.active_academic_year_id = cls.academic_year_id;
    student.status = "aktif";
    student.updated_at = now();
    ensureActiveStudentHistory(student, cls);
  });
  return students.length;
}

function closeActiveStudentHistoryForSemester(studentId, classId, semesterId) {
  state.db.student_class_histories.forEach(history => {
    if (history.student_id === studentId && history.class_id === classId && history.semester_id === semesterId && history.status === "aktif") {
      history.status = "selesai";
      history.end_date = history.end_date || today();
      history.updated_at = now();
    }
  });
}

function openClassPromotion(classId) {
  const source = findById("classes", classId);
  if (!source) return toast("Kelas tidak ditemukan.", "error");
  const options = visibleRows("classes")
    .filter(cls => cls.id !== source.id)
    .map(cls => `<option value="${cls.id}">${escapeHtml(displayName("classes", cls))}</option>`)
    .join("");
  if (!options) return toast("Belum ada kelas tujuan. Buat kelas tujuan terlebih dahulu.", "error");
  const studentCount = studentsInClass(source.id).length;
  modal(`Kenaikan Kelas ${escapeHtml(source.name)}`, `<form id="class-promotion-form" class="form-grid">
    <div class="wide summary-grid">
      ${card("Dari Kelas", escapeHtml(displayName("classes", source)))}
      ${card("Jumlah Siswa", studentCount)}
    </div>
    <label class="wide">Kelas Tujuan<select name="to" required>${options}</select></label>
    <div class="wide actions"><button class="primary">Proses Kenaikan Kelas</button><button class="ghost" type="button" data-close>Batal</button></div>
  </form>`);
  byId("class-promotion-form").onsubmit = e => {
    e.preventDefault();
    const fd = formData(e.target);
    const target = findById("classes", fd.to);
    const moved = promoteClassStudents(source.id, fd.to);
    saveDb();
    closeModal({ fromPopState: true });
    renderCrud("students");
    toast(`${moved} siswa dipindahkan ke ${displayName("classes", target)}.`, "ok");
  };
}

function promoteClassStudents(fromClassId, toClassId) {
  const students = studentsInClass(fromClassId);
  students.forEach(student => moveStudentToClass(student, toClassId));
  return students.length;
}

function nextSemesterForClass(cls) {
  const current = findById("semesters", cls.semester_id);
  if (!current) return null;
  const semesters = state.db.semesters
    .filter(semester => !semester.deleted_at && semester.academic_year_id === cls.academic_year_id)
    .sort((a, b) => String(a.start_date || "").localeCompare(String(b.start_date || "")));
  const currentName = String(current.name || "").toLowerCase();
  if (currentName.includes("ganjil")) return semesters.find(semester => String(semester.name || "").toLowerCase().includes("genap")) || null;
  const currentIndex = semesters.findIndex(semester => semester.id === current.id);
  return currentIndex >= 0 ? semesters[currentIndex + 1] || null : null;
}

function findMatchingClass(source, semesterId) {
  return state.db.classes.find(cls =>
    !cls.deleted_at &&
    cls.id !== source.id &&
    cls.name === source.name &&
    cls.level === source.level &&
    (cls.major || "") === (source.major || "") &&
    cls.academic_year_id === source.academic_year_id &&
    cls.semester_id === semesterId
  );
}

function createClassForSemester(source, semesterId) {
  const record = {
    id: uid("cla"),
    name: source.name,
    level: source.level,
    major: source.major,
    academic_year_id: source.academic_year_id,
    semester_id: semesterId,
    homeroom_teacher_id: source.homeroom_teacher_id,
    created_at: now(),
    updated_at: now(),
    created_by: currentUser().id
  };
  state.db.classes.push(record);
  return record;
}

function rolloverAcademicYear(newYearId) {
  const newYear = findById("academic_years", newYearId);
  const sourceYear = findPreviousAcademicYear(newYear);
  if (!newYear || !sourceYear) return { classes: 0, promoted: 0, graduated: 0, schedules: 0 };
  const semesters = ensureYearSemesters(newYear);
  const ganjil = semesters.find(semester => /ganjil/i.test(semester.name)) || semesters[0];
  if (!ganjil) return { classes: 0, promoted: 0, graduated: 0, schedules: 0 };
  const sourceSemester = sourceClosingSemester(sourceYear.id);
  const sourceClasses = state.db.classes.filter(cls =>
    !cls.deleted_at &&
    cls.active !== "false" &&
    cls.status !== "lulus" &&
    cls.academic_year_id === sourceYear.id &&
    (!sourceSemester || cls.semester_id === sourceSemester.id)
  );
  const classMap = new Map();
  let classCount = 0;
  let promoted = 0;
  let graduated = 0;
  let schedules = 0;

  sourceClasses.forEach(source => {
    const entryClass = ensureRolloverClass(source, ganjil, entryLevelForUnit(classUnit(source)), classMap);
    if (entryClass?._createdThisRun) classCount += 1;
    const nextLevel = nextLevelForUnit(classUnit(source), classLevelValue(source));
    if (!nextLevel) {
      graduated += graduateStudentsFromSourceClass(source);
      return;
    }
    const target = ensureRolloverClass(source, ganjil, nextLevel, classMap);
    if (target._createdThisRun) classCount += 1;
    promoted += promoteStudentsToNewYearClass(source.id, target.id);
    schedules += copySchedulesForRollover(source.id, target.id, newYear.id, ganjil.id);
  });

  sourceClasses.forEach(source => {
    if (classLevelValue(source) !== entryLevelForUnit(classUnit(source))) return;
    const entry = ensureRolloverClass(source, ganjil, entryLevelForUnit(classUnit(source)), classMap);
    schedules += copySchedulesForRollover(source.id, entry.id, newYear.id, ganjil.id);
  });

  [...classMap.values()].forEach(cls => delete cls._createdThisRun);
  return { classes: classCount, promoted, graduated, schedules };
}

function findPreviousAcademicYear(newYear) {
  return state.db.academic_years
    .filter(year => !year.deleted_at && year.id !== newYear?.id)
    .sort((a, b) => String(b.start_date || b.name || "").localeCompare(String(a.start_date || a.name || "")))
    .find(year => String(year.start_date || "") <= String(newYear?.start_date || "9999-99-99")) ||
    state.db.academic_years.find(year => !year.deleted_at && year.id !== newYear?.id);
}

function ensureYearSemesters(year) {
  const yearStart = new Date(year.start_date || `${new Date().getFullYear()}-07-01`);
  const yearEnd = new Date(year.end_date || `${yearStart.getFullYear() + 1}-06-30`);
  const genapStart = new Date(yearStart);
  genapStart.setMonth(yearStart.getMonth() + 6);
  const ganjilEnd = new Date(genapStart);
  ganjilEnd.setDate(ganjilEnd.getDate() - 1);
  [
    ["Ganjil", dateIso(yearStart), dateIso(ganjilEnd), "true"],
    ["Genap", dateIso(genapStart), dateIso(yearEnd), "false"]
  ].forEach(([name, startDate, endDate, active]) => {
    if (state.db.semesters.some(semester => !semester.deleted_at && semester.academic_year_id === year.id && String(semester.name || "").toLowerCase() === name.toLowerCase())) return;
    state.db.semesters.push({ id: uid("sem"), academic_year_id: year.id, name, start_date: startDate, end_date: endDate, is_active: active, created_at: now(), updated_at: now(), created_by: currentUser().id });
  });
  return state.db.semesters.filter(semester => !semester.deleted_at && semester.academic_year_id === year.id);
}

function sourceClosingSemester(yearId) {
  const semesters = state.db.semesters.filter(semester => !semester.deleted_at && semester.academic_year_id === yearId);
  return semesters.find(semester => /genap/i.test(semester.name)) || semesters.sort((a, b) => String(b.end_date || "").localeCompare(String(a.end_date || "")))[0] || null;
}

function ensureRolloverClass(source, semester, level, classMap) {
  if (!level) return null;
  const unit = classUnit(source);
  const key = [unit, level, source.major || "", semester.academic_year_id].join("|");
  if (classMap.has(key)) return classMap.get(key);
  let cls = state.db.classes.find(item =>
    !item.deleted_at &&
    item.academic_year_id === semester.academic_year_id &&
    item.semester_id === semester.id &&
    classUnit(item) === unit &&
    classLevelValue(item) === String(level) &&
    (item.major || "") === (source.major || "")
  );
  if (!cls) {
    cls = {
      id: uid("cla"),
      name: rolloverClassName(source, level),
      unit,
      level: String(level),
      major: source.major || "",
      academic_year_id: semester.academic_year_id,
      semester_id: semester.id,
      homeroom_teacher_id: source.homeroom_teacher_id || "",
      active: "true",
      status: "aktif",
      created_at: now(),
      updated_at: now(),
      created_by: currentUser().id,
      _createdThisRun: true
    };
    state.db.classes.push(cls);
  }
  classMap.set(key, cls);
  return cls;
}

function rolloverClassName(source, level) {
  const unit = classUnit(source);
  const oldName = String(source.name || "").trim();
  const oldLevel = classLevelValue(source);
  const suffix = (oldName.match(/[A-Z]$/i) || [""])[0];
  if (/^\d+[A-Z]?$/i.test(oldName)) return `${level}${suffix && !String(level).endsWith(suffix) ? suffix : ""}`;
  if (oldLevel && oldName.includes(oldLevel)) return oldName.replace(oldLevel, String(level));
  return `Kelas ${displayLevelForUnit(unit, level)}${suffix && !/^[IVXLCDM]$/i.test(suffix) ? suffix : ""}`;
}

function displayLevelForUnit(unit, level) {
  if (unit === "PAUD") return "PAUD";
  if (unit === "SMP") return { 7: "I", 8: "II", 9: "III" }[level] || level;
  if (unit === "SMA") return { 10: "X", 11: "XI", 12: "XII" }[level] || level;
  return String(level);
}

function entryLevelForUnit(unit) {
  if (unit === "PAUD") return "PAUD";
  if (unit === "MI") return "1";
  if (unit === "SMP") return "7";
  if (unit === "SMA") return "10";
  return "";
}

function nextLevelForUnit(unit, level) {
  if (unit === "PAUD") return null;
  const current = Number(level);
  const max = unit === "MI" ? 6 : unit === "SMP" ? 9 : unit === "SMA" ? 12 : 12;
  if (!Number.isFinite(current) || current >= max) return null;
  return String(current + 1);
}

function promoteStudentsToNewYearClass(fromClassId, toClassId) {
  const students = studentsInClass(fromClassId);
  students.forEach(student => moveStudentToClass(student, toClassId));
  return students.length;
}

function graduateStudentsFromSourceClass(source) {
  const students = studentsInClass(source.id);
  students.forEach(student => {
    student.status = "lulus";
    student.login_enabled = "false";
    student.updated_at = now();
    disableLinkedUser("student_id", student.id);
    state.db.student_class_histories.forEach(history => {
      if (history.student_id === student.id && history.class_id === source.id && history.status === "aktif") {
        history.status = "lulus";
        history.end_date = history.end_date || today();
        history.updated_at = now();
      }
    });
  });
  return students.length;
}

function copySchedulesForRollover(sourceClassId, targetClassId, academicYearId, semesterId) {
  let copied = 0;
  state.db.schedules.filter(schedule => !schedule.deleted_at && schedule.class_id === sourceClassId).forEach(schedule => {
    const exists = state.db.schedules.some(item =>
      !item.deleted_at &&
      item.class_id === targetClassId &&
      item.academic_year_id === academicYearId &&
      item.semester_id === semesterId &&
      item.subject_id === schedule.subject_id &&
      item.teacher_id === schedule.teacher_id &&
      item.day === schedule.day &&
      item.start_time === schedule.start_time &&
      item.end_time === schedule.end_time
    );
    if (exists) return;
    state.db.schedules.push({ id: uid("sch"), academic_year_id: academicYearId, semester_id: semesterId, class_id: targetClassId, subject_id: schedule.subject_id, teacher_id: schedule.teacher_id, day: schedule.day, start_time: schedule.start_time, end_time: schedule.end_time, room: schedule.room || "", active: schedule.active || "true", created_at: now(), updated_at: now(), created_by: currentUser().id });
    copied += 1;
  });
  return copied;
}

function dateIso(date) {
  return new Date(date).toISOString().slice(0, 10);
}

function openPromote() {
  modal("Naik Kelas Massal", `<form id="promote-form" class="form-grid">
    <label>Dari Kelas<select name="from" required>${classOptionList()}</select></label>
    <label>Ke Kelas<select name="to" required>${classOptionList()}</select></label>
    <div class="wide actions"><button class="primary">Proses Naik Kelas</button><button class="ghost" type="button" data-close>Batal</button></div>
  </form>`);
  byId("promote-form").onsubmit = e => {
    e.preventDefault();
    const fd = formData(e.target);
    studentsInClass(fd.from).forEach(student => moveStudentToClass(student, fd.to));
    saveDb(); closeModal({ fromPopState: true }); renderCrud("students"); toast("Naik kelas massal selesai. Riwayat kelas lama tetap tersimpan.", "ok");
  };
}

function openClassStudents(classId) {
  const cls = findById("classes", classId);
  if (!cls) return toast("Kelas tidak ditemukan.", "error");
  const students = state.db.students
    .filter(student => !student.deleted_at && student.status === "aktif" && student.active_class_id === classId)
    .sort((a, b) => (a.name || "").localeCompare(b.name || ""));
  const rows = students.map((student, index) => {
    const currentClass = displayName("classes", findById("classes", student.active_class_id)) || "-";
    return `<tr>
      <td><input type="checkbox" name="student_ids" value="${student.id}" ${student.active_class_id === cls.id ? "checked" : ""}></td>
      <td>${index + 1}</td>
      <td>${escapeHtml(student.nis || "-")}</td>
      <td>${escapeHtml(student.nisn || "-")}</td>
      <td>${escapeHtml(student.name)}</td>
      <td>${escapeHtml(currentClass)}</td>
      <td class="row-actions">
        <button class="ghost" type="button" data-edit-class-student="${student.id}">Edit</button>
        <button class="danger" type="button" data-delete-class-student="${student.id}">Hapus</button>
      </td>
    </tr>`;
  }).join("");
  modal(`Kelola Siswa ${escapeHtml(cls.name)}`, `<form id="class-students-form" class="form-grid">
    <div class="wide">
      <p class="muted">Centang siswa untuk memasukkan atau memindahkan ke kelas ini. Gunakan Edit/Hapus untuk mengelola data siswa langsung dari daftar ini.</p>
      <div class="summary-grid">
        ${card("Kelas", escapeHtml(displayName("classes", cls)))}
        ${card("Tahun Ajaran", escapeHtml(displayName("academic_years", findById("academic_years", cls.academic_year_id)) || "-"))}
        ${card("Semester", escapeHtml(classSemesterName(cls.id)))}
      </div>
      <div class="actions no-print" style="margin: 12px 0">
        <button class="primary" type="button" data-add-class-student="${cls.id}">+ Tambah Siswa</button>
      </div>
      <div class="table-wrap compact-table">
        <table>
          <thead><tr><th>Pilih</th><th>No</th><th>NIS</th><th>NISN</th><th>Nama</th><th>Kelas Saat Ini</th><th>Aksi</th></tr></thead>
          <tbody>${rows || emptyRow(7)}</tbody>
        </table>
      </div>
    </div>
    <div class="wide actions"><button class="primary">Simpan Kelas</button><button class="ghost" type="button" data-close>Batal</button></div>
  </form>`);
  byId("class-students-form").onsubmit = e => {
    e.preventDefault();
    const selected = Array.from(e.target.querySelectorAll('[name="student_ids"]:checked')).map(input => input.value);
    selected.forEach(studentId => moveStudentToClass(findById("students", studentId), cls.id));
    saveDb();
    closeModal({ fromPopState: true });
    renderCrud(state.page === "students" ? "students" : "classes");
    toast(`${selected.length} siswa tersimpan di ${cls.name}.`, "ok");
  };
  bindClassStudentActions(cls.id);
}

function bindClassStudentActions(classId) {
  const backdrop = byId("modal-backdrop");
  if (!backdrop) return;
  backdrop.querySelector("[data-add-class-student]")?.addEventListener("click", () => {
    const cls = findById("classes", classId);
    openForm("students", null, {
      active_class_id: cls.id,
      active_academic_year_id: cls.academic_year_id,
      login_enabled: "true",
      status: "aktif"
    }, { returnClassId: classId });
  });
  backdrop.querySelectorAll("[data-edit-class-student]").forEach(button => {
    button.onclick = () => {
      const student = findById("students", button.dataset.editClassStudent);
      openForm("students", student, {}, { returnClassId: classId });
    };
  });
  backdrop.querySelectorAll("[data-delete-class-student]").forEach(button => {
    button.onclick = () => {
      const student = findById("students", button.dataset.deleteClassStudent);
      if (!student || !confirm(`Hapus siswa ${student.name}?`)) return;
      markDeleted(student);
      cascadeSoftDelete("students", student);
      saveDb();
      closeModal({ fromPopState: true });
      openClassStudents(classId);
      toast("Siswa dihapus.", "ok");
    };
  });
}

function openClassSubjects(classId) {
  const cls = findById("classes", classId);
  if (!cls) return toast("Kelas tidak ditemukan.", "error");
  const schedules = schedulesForClass(classId);
  const days = scheduleDaysForClass(classId);
  const dayCards = days.map(day => scheduleDayCard(classId, day)).join("");
  const addDayDisabled = days.length >= 7 ? "disabled" : "";
  modal(`Kelola Jadwal ${escapeHtml(displayName("classes", cls))}`, `
    <div class="wide">
      <div class="summary-grid">
        ${card("Kelas", escapeHtml(displayName("classes", cls)))}
        ${card("Jumlah Mapel", subjectsForClass(classId).length)}
        ${card("Jumlah Jadwal", schedules.length)}
      </div>
      <div class="actions no-print" style="margin: 12px 0">
        <button class="primary" data-add-schedule-day="${cls.id}" ${addDayDisabled}>+ Hari</button>
      </div>
      <div class="schedule-day-grid">
        ${dayCards || `<div class="empty-state">Belum ada hari jadwal. Klik + Hari untuk mulai membuat jadwal kelas.</div>`}
      </div>
    </div>`);
  byId("modal-backdrop").querySelector("[data-add-schedule-day]")?.addEventListener("click", () => openAddScheduleDay(classId));
  byId("modal-backdrop").querySelectorAll("[data-open-schedule-day]").forEach(button => {
    button.onclick = () => openClassDaySchedules(classId, button.dataset.openScheduleDay);
  });
}

function openClassLeaves(classId) {
  const cls = findById("classes", classId);
  if (!cls) return toast("Kelas tidak ditemukan.", "error");
  const leaves = visibleRows("leave_requests").filter(leave => leave.class_id === classId);
  const rows = leaves.map((leave, index) => `<tr>
    <td>${index + 1}</td>
    <td>${escapeHtml(displayName("students", findById("students", leave.student_id)) || "-")}</td>
    <td>${escapeHtml(statusLabels[leave.leave_type] || titleCase(leave.leave_type || ""))}</td>
    <td>${escapeHtml(leave.start_date || "")}</td>
    <td>${escapeHtml(leave.end_date || "")}</td>
    <td>${evidenceLink(leave.attachment)}</td>
    <td>${badge(leave.status)}</td>
    <td class="row-actions">
      ${leave.status === "pending" && canApproveLeaveFor(classId) ? `<button class="secondary" data-approve-leave-class="${leave.id}">Setujui</button>` : ""}
      <button class="ghost" data-edit-leave-class="${leave.id}">Edit</button>
      <button class="danger" data-delete-leave-class="${leave.id}">Hapus</button>
    </td>
  </tr>`).join("");
  modal(`Izin & Sakit ${escapeHtml(displayName("classes", cls))}`, `
    <div class="wide">
      <div class="summary-grid">
        ${card("Kelas", escapeHtml(displayName("classes", cls)))}
        ${card("Pengajuan", leaves.length)}
        ${card("Menunggu", leaves.filter(leave => leave.status === "pending").length)}
      </div>
      <div class="actions no-print" style="margin:12px 0"><button class="primary" data-add-leave-class="${cls.id}">+ Izin/Sakit</button></div>
      <div class="table-wrap compact-table">
        <table><thead><tr><th>No</th><th>Siswa</th><th>Jenis</th><th>Mulai</th><th>Selesai</th><th>Bukti</th><th>Status</th><th>Aksi</th></tr></thead><tbody>${rows || emptyRow(8)}</tbody></table>
      </div>
    </div>`);
  const root = byId("modal-backdrop");
  root.querySelector("[data-add-leave-class]")?.addEventListener("click", () => {
    openLeaveForClass(classId);
  });
  root.querySelectorAll("[data-approve-leave-class]").forEach(button => button.onclick = () => {
    approveLeave(button.dataset.approveLeaveClass);
    closeModal({ fromPopState: true });
    openClassLeaves(classId);
  });
  root.querySelectorAll("[data-edit-leave-class]").forEach(button => button.onclick = () => {
    const leave = findById("leave_requests", button.dataset.editLeaveClass);
    openForm("leave_requests", leave, {}, { returnLeaveClassId: classId });
  });
  root.querySelectorAll("[data-delete-leave-class]").forEach(button => button.onclick = () => {
    const leave = findById("leave_requests", button.dataset.deleteLeaveClass);
    if (!leave || !confirm("Hapus pengajuan izin/sakit ini?")) return;
    leave.deleted_at = now();
    leave.deleted_by = currentUser().id;
    saveDb();
    closeModal({ fromPopState: true });
    openClassLeaves(classId);
    toast("Pengajuan dihapus.", "ok");
  });
  bindEvidenceLinks(root);
}

function openGraduation(classId) {
  const source = findById("classes", classId);
  if (!source) return toast("Kelas tidak ditemukan.", "error");
  const students = studentsInClass(source.id);
  modal(`Luluskan ${escapeHtml(source.name)}`, `<form id="graduation-form" class="form-grid">
    <div class="wide summary-grid">
      ${card("Kelas", escapeHtml(displayName("classes", source)))}
      ${card("Siswa Aktif", students.length)}
      ${card("Status Baru", "Lulus")}
    </div>
    <p class="wide muted">Semua siswa aktif di kelas ini akan berstatus lulus dan tidak masuk absensi aktif. Riwayat kelas, absensi, dan laporan lama tetap tersimpan.</p>
    <div class="wide actions"><button class="primary">Luluskan Kelas</button><button class="ghost" type="button" data-close>Batal</button></div>
  </form>`);
  byId("graduation-form").onsubmit = e => {
    e.preventDefault();
    const count = graduateClass(source);
    saveDb();
    closeModal({ fromPopState: true });
    renderCrud("students");
    toast(`${count} siswa dinyatakan lulus.`, "ok");
  };
}

function graduateClass(cls) {
  const students = studentsInClass(cls.id);
  students.forEach(student => {
    student.status = "lulus";
    student.login_enabled = "false";
    student.updated_at = now();
    disableLinkedUser("student_id", student.id);
    state.db.student_class_histories.forEach(history => {
      if (history.student_id === student.id && history.class_id === cls.id && history.status === "aktif") {
        history.status = "lulus";
        history.end_date = history.end_date || today();
        history.updated_at = now();
      }
    });
  });
  cls.status = "lulus";
  cls.active = "false";
  cls.graduated_at = today();
  cls.updated_at = now();
  cls.updated_by = currentUser().id;
  state.db.schedules.filter(schedule => schedule.class_id === cls.id && !schedule.deleted_at).forEach(schedule => closeSessionsForSchedule(schedule.id));
  return students.length;
}

function openLeaveForClass(classId) {
  const cls = findById("classes", classId);
  if (!cls) return toast("Kelas tidak ditemukan.", "error");
  openForm("leave_requests", null, {
    class_id: cls.id,
    academic_year_id: cls.academic_year_id,
    semester_id: cls.semester_id,
    status: "pending",
    start_date: today(),
    end_date: today()
  }, { returnLeaveClassId: classId });
}

function scheduleDayCard(classId, day) {
  const schedules = schedulesForClass(classId).filter(schedule => schedule.day === day);
  const subjects = [...new Set(schedules.map(schedule => displayName("subjects", findById("subjects", schedule.subject_id))).filter(Boolean))];
  const chips = subjects.slice(0, 3).map(subject => `<span>${escapeHtml(subject)}</span>`).join("");
  return `<article class="schedule-day-card">
    <div>
      <span class="class-label">Hari</span>
      <h3>${escapeHtml(day)}</h3>
      <p>${schedules.length} jadwal pelajaran</p>
    </div>
    <div class="subject-chip-list">${chips || `<span>Belum ada mapel</span>`}${subjects.length > 3 ? `<span>+${subjects.length - 3}</span>` : ""}</div>
    <button class="primary" data-open-schedule-day="${escapeHtml(day)}">Kelola Jadwal</button>
  </article>`;
}

function openAddScheduleDay(classId) {
  const existing = new Set(scheduleDaysForClass(classId));
  const options = schoolDays().filter(day => !existing.has(day)).map(day => `<option value="${day}">${day}</option>`).join("");
  if (!options) return toast("Semua 7 hari sudah digunakan.", "warn");
  modal("Tambah Hari Jadwal", `<form id="add-schedule-day-form" class="form-grid">
    <label class="wide">Pilih Hari<select name="day" required>${options}</select></label>
    <div class="wide actions"><button class="primary">Lanjut Kelola Jadwal</button><button class="ghost" type="button" data-close>Batal</button></div>
  </form>`);
  byId("add-schedule-day-form").onsubmit = e => {
    e.preventDefault();
    const fd = formData(e.target);
    openClassDaySchedules(classId, fd.day);
  };
}

function openClassDaySchedules(classId, day) {
  const cls = findById("classes", classId);
  if (!cls) return toast("Kelas tidak ditemukan.", "error");
  const schedules = schedulesForClass(classId).filter(schedule => schedule.day === day);
  const rows = schedules.map((schedule, index) => `<tr>
    <td>${index + 1}</td>
    <td>${escapeHtml(displayName("subjects", findById("subjects", schedule.subject_id)) || "-")}</td>
    <td>${escapeHtml(displayName("teachers", findById("teachers", schedule.teacher_id)) || "-")}</td>
    <td>${escapeHtml(`${schedule.start_time || "-"} - ${schedule.end_time || "-"}`)}</td>
    <td>${statusText(schedule.active)}</td>
    <td class="row-actions">
      <button class="ghost" data-edit-schedule="${schedule.id}">Edit</button>
      <button class="danger" data-delete-schedule="${schedule.id}">Hapus</button>
    </td>
  </tr>`).join("");
  modal(`${escapeHtml(day)} - ${escapeHtml(displayName("classes", cls))}`, `
    <div class="wide">
      <div class="summary-grid">
        ${card("Hari", escapeHtml(day))}
        ${card("Kelas", escapeHtml(displayName("classes", cls)))}
        ${card("Jumlah Jadwal", schedules.length)}
      </div>
      <div class="actions no-print" style="margin: 12px 0">
        <button class="primary" data-add-class-schedule="${cls.id}">+ Jadwal Mapel</button>
        <button class="secondary" data-back-schedule-days>Daftar Hari</button>
      </div>
      <div class="table-wrap compact-table">
        <table>
          <thead><tr><th>No</th><th>Mapel</th><th>Guru</th><th>Jam</th><th>Status</th><th>Aksi</th></tr></thead>
          <tbody>${rows || emptyRow(6)}</tbody>
        </table>
      </div>
    </div>`);
  byId("modal-backdrop").querySelector("[data-add-class-schedule]")?.addEventListener("click", () => {
    openScheduleForClass(classId, day);
  });
  byId("modal-backdrop").querySelector("[data-back-schedule-days]")?.addEventListener("click", () => {
    openClassSubjects(classId);
  });
  byId("modal-backdrop").querySelectorAll("[data-edit-schedule]").forEach(button => {
    button.onclick = () => {
      const schedule = findById("schedules", button.dataset.editSchedule);
      openForm("schedules", schedule, {}, { returnScheduleClassId: classId, returnScheduleDay: day, fixedDay: day });
    };
  });
  byId("modal-backdrop").querySelectorAll("[data-delete-schedule]").forEach(button => {
    button.onclick = () => {
      const schedule = findById("schedules", button.dataset.deleteSchedule);
      if (!schedule) return;
      markDeleted(schedule);
      cascadeSoftDelete("schedules", schedule);
      saveDb();
      closeModal({ fromPopState: true });
      openClassDaySchedules(classId, day);
      toast("Jadwal mapel dihapus.", "ok");
    };
  });
}

function openScheduleForClass(classId, day = "") {
  const cls = findById("classes", classId);
  if (!cls) return toast("Kelas tidak ditemukan.", "error");
  openForm("schedules", null, {
    academic_year_id: cls.academic_year_id,
    semester_id: cls.semester_id,
    class_id: cls.id,
    day,
    active: "true"
  }, { returnScheduleClassId: classId, returnScheduleDay: day, fixedDay: day });
}

function showStudentQr(student) { showQrCards([student]); }
function showQrCards(students) {
  modal("ID Card QR Siswa", `
    <section class="qr-popup-panel">
    <div class="actions no-print">
      <button class="secondary" onclick="window.print()">Cetak Semua</button>
    </div>
    <div class="qr-grid id-card-grid">
      ${students.map(s => studentIdCardHtml(s)).join("")}
    </div>
    </section>`);
  setTimeout(() => {
    document.querySelectorAll("[data-qrcode]").forEach(el => {
      if (window.QRCode) new QRCode(el, { text: el.dataset.qrcode, width: 156, height: 156, correctLevel: QRCode.CorrectLevel.H });
      else el.innerHTML = fallbackQr(el.dataset.qrcode);
    });
    document.querySelectorAll("[data-download-card]").forEach(btn => {
      btn.onclick = () => downloadStudentIdCard(btn.dataset.downloadCard);
    });
  }, 50);
}

function studentIdCardHtml(student) {
  const setting = state.db.settings[0] || {};
  return `
    <article class="id-card" data-student-card="${student.id}">
      <div class="id-card-brand">
        <span class="id-logo-mark">${schoolLogoHtml()}</span>
        <strong>${escapeHtml(setting.school_name || "EduAttend Pro")}</strong>
      </div>
      <div class="id-art">
        <span class="shape shape-left"></span>
        <span class="shape shape-right"></span>
        <span class="shape shape-dot-a"></span>
        <span class="shape shape-dot-b"></span>
        <span class="shape shape-star-a">✦</span>
        <span class="shape shape-star-b">✦</span>
        <div class="id-qr-frame">
          <div class="id-qr" data-qrcode="${escapeHtml(student.qr_token)}"></div>
        </div>
      </div>
      <div class="id-name-block">
        <h3>${escapeHtml(student.name)}</h3>
        <strong>Kartu Absensi Siswa</strong>
        <p>NIS ${escapeHtml(student.nis || "-")} · NISN ${escapeHtml(student.nisn || "-")}</p>
      </div>
      <div class="id-card-foot">
        <span>${escapeHtml(setting.school_website || "www.sekolah.sch.id")}</span>
        <span>${escapeHtml(setting.school_phone || "Nomor sekolah")}</span>
        <button class="secondary no-print" data-download-card="${student.id}">Download</button>
      </div>
    </article>`;
}

async function downloadStudentIdCard(studentId) {
  const student = findById("students", studentId);
  if (!student) return toast("Data siswa tidak ditemukan.", "error");
  const card = document.querySelector(`[data-student-card="${studentId}"]`);
  const qrCanvas = card?.querySelector(".id-qr canvas");
  if (!qrCanvas) return toast("QR belum selesai dibuat. Coba ulangi beberapa detik lagi.", "warn");

  const setting = state.db.settings[0] || {};
  const canvas = document.createElement("canvas");
  canvas.width = 638;
  canvas.height = 1013;
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "#111111";
  ctx.font = "900 40px Arial";
  ctx.textAlign = "center";
  ctx.fillText(setting.school_name || "EduAttend Pro", 340, 94);
  roundedRect(ctx, 142, 50, 42, 42, 8, "#111111");
  if (setting.school_logo) {
    try {
      const logo = await loadImage(setting.school_logo);
      ctx.save();
      roundedRectClip(ctx, 142, 50, 42, 42, 8);
      ctx.drawImage(logo, 142, 50, 42, 42);
      ctx.restore();
    } catch {
      drawCanvasLogoInitials(ctx, setting.school_name || "EA", 163, 77);
    }
  } else {
    drawCanvasLogoInitials(ctx, setting.school_name || "EA", 163, 77);
  }

  ctx.fillStyle = "#ff6500";
  ctx.beginPath();
  ctx.arc(104, 470, 92, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(560, 478, 98, 0, Math.PI * 2);
  ctx.fill();
  roundedRect(ctx, 0, 560, 72, 116, 0, "#ffb077");
  roundedRect(ctx, 484, 560, 70, 70, 20, "#ffb077");
  roundedRect(ctx, 562, 560, 70, 70, 20, "#ffb077");
  roundedRect(ctx, 484, 644, 70, 70, 20, "#ffb077");
  roundedRect(ctx, 562, 644, 70, 70, 20, "#ffb077");
  ctx.fillStyle = "#ff6500";
  ctx.font = "900 64px Arial";
  ctx.fillText("✦", 462, 386);
  ctx.fillText("✦", 594, 552);

  ctx.strokeStyle = "#8b48ff";
  ctx.lineWidth = 4;
  ctx.strokeRect(116, 186, 420, 420);
  roundedRect(ctx, 166, 236, 320, 320, 22, "#ffffff");
  ctx.drawImage(qrCanvas, 186, 256, 280, 280);

  ctx.fillStyle = "#111111";
  ctx.font = "900 50px Arial";
  wrapCanvasTextCentered(ctx, student.name, 319, 704, 520, 54);
  ctx.fillStyle = "#ff6500";
  ctx.font = "900 27px Arial";
  ctx.textAlign = "center";
  ctx.fillText("Kartu Absensi Siswa", 319, 794);
  ctx.fillStyle = "#111111";
  ctx.font = "700 20px Arial";
  ctx.fillText(`NIS ${student.nis || "-"}  ·  NISN ${student.nisn || "-"}`, 319, 834);
  ctx.font = "700 18px Arial";
  ctx.fillText(student.qr_token, 319, 872);

  ctx.fillStyle = "#111111";
  ctx.font = "800 18px Arial";
  ctx.textAlign = "left";
  ctx.fillText(`◎ ${setting.school_website || "www.sekolah.sch.id"}`, 88, 954);
  ctx.textAlign = "right";
  ctx.fillText(`☏ ${setting.school_phone || "Nomor sekolah"}`, 550, 954);
  ctx.textAlign = "left";

  const a = document.createElement("a");
  a.href = canvas.toDataURL("image/png");
  a.download = `id-card-${(student.nisn || student.nis || student.name).replace(/[^a-z0-9]+/gi, "-")}.png`;
  a.click();
}

function roundedRect(ctx, x, y, w, h, r, fill) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
}

function drawInfo(ctx, label, value, x, y) {
  ctx.fillStyle = "#667085";
  ctx.font = "700 18px Arial";
  ctx.fillText(label, x, y);
  ctx.fillStyle = "#111827";
  ctx.font = "800 26px Arial";
  ctx.fillText(value, x + 120, y);
}

function wrapCanvasText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = String(text).split(" ");
  let line = "";
  words.forEach((word, index) => {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      ctx.fillText(line, x, y);
      line = word;
      y += lineHeight;
    } else {
      line = test;
    }
    if (index === words.length - 1) ctx.fillText(line, x, y);
  });
}

function wrapCanvasTextCentered(ctx, text, centerX, y, maxWidth, lineHeight) {
  const words = String(text).split(" ");
  const lines = [];
  let line = "";
  words.forEach(word => {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = test;
    }
  });
  if (line) lines.push(line);
  lines.slice(0, 2).forEach((l, i) => ctx.fillText(l, centerX, y + i * lineHeight));
}

function initials(name) {
  return String(name || "ID").split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0]).join("").toUpperCase();
}

function fallbackQr(token) {
  let n = [...token].reduce((a, c) => a + c.charCodeAt(0), 0);
  return `<div class="qr-fallback">${Array.from({ length: 64 }, (_, i) => { n = (n * 1103515245 + 12345) & 0x7fffffff; return `<i class="${(n + i) % 3 ? "on" : ""}"></i>`; }).join("")}</div>`;
}

function softDelete(table, id, rerender = null) {
  if (!confirm("Hapus data ini? Data penting ditandai soft delete.")) return;
  const row = findById(table, id);
  if (!row) return toast("Data tidak ditemukan.", "error");
  markDeleted(row);
  cascadeSoftDelete(table, row);
  saveDb();
  if (rerender) rerender();
  else renderCrud(table);
  toast("Data dihapus dan akses terkait dinonaktifkan.", "ok");
}

function markDeleted(row) {
  row.deleted_at = now();
  row.deleted_by = currentUser().id;
  row.updated_at = now();
}

function cascadeSoftDelete(table, row) {
  if (table === "students") {
    row.status = "keluar";
    row.login_enabled = "false";
    disableLinkedUser("student_id", row.id);
    state.db.student_class_histories.forEach(history => {
      if (history.student_id === row.id && history.status === "aktif") {
        history.status = "selesai";
        history.end_date = history.end_date || today();
        history.updated_at = now();
      }
    });
    return;
  }
  if (table === "classes") {
    state.db.schedules.filter(schedule => schedule.class_id === row.id && !schedule.deleted_at).forEach(schedule => {
      markDeleted(schedule);
      closeSessionsForSchedule(schedule.id);
    });
    state.db.students.filter(student => student.active_class_id === row.id && !student.deleted_at).forEach(student => {
      markDeleted(student);
      student.active_class_id = "";
      student.status = "keluar";
      student.login_enabled = "false";
      disableLinkedUser("student_id", student.id);
    });
    state.db.student_class_histories.forEach(history => {
      if (history.class_id === row.id && history.status === "aktif") {
        history.status = "selesai";
        history.end_date = history.end_date || today();
        history.updated_at = now();
      }
    });
    return;
  }
  if (table === "schedules") {
    closeSessionsForSchedule(row.id);
    return;
  }
  if (table === "teachers") {
    disableLinkedUser("teacher_id", row.id);
    state.db.schedules.filter(schedule => schedule.teacher_id === row.id && !schedule.deleted_at).forEach(schedule => {
      markDeleted(schedule);
      closeSessionsForSchedule(schedule.id);
    });
    return;
  }
  if (table === "subjects") {
    state.db.schedules.filter(schedule => schedule.subject_id === row.id && !schedule.deleted_at).forEach(schedule => {
      markDeleted(schedule);
      closeSessionsForSchedule(schedule.id);
    });
  }
}

function closeSessionsForSchedule(scheduleId) {
  state.db.attendance_sessions
    .filter(session => session.schedule_id === scheduleId && !session.deleted_at && session.status !== "cancelled")
    .forEach(session => {
      session.status = "cancelled";
      session.closed_by = currentUser().id;
      session.closed_at = now();
      session.updated_at = now();
    });
}

function exportCsv(name, rows, type = "") {
  const prepared = prepareExportRows(name, rows, type);
  const keys = exportKeys(prepared);
  const csv = [keys.join(","), ...prepared.map(r => keys.map(k => csvCell(r[k])).join(","))].join("\n");
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
  a.download = `${name}_${today()}.csv`;
  a.click();
  URL.revokeObjectURL(a.href);
}

function exportExcel(name, rows, type = "") {
  const prepared = prepareExportRows(name, rows, type);
  const keys = exportKeys(prepared);
  const title = exportTitle(name, type);
  const worksheetRows = [
    [title],
    [`Tanggal Cetak: ${today()}`],
    keys,
    ...prepared.map(row => keys.map(key => row[key] ?? ""))
  ];
  downloadXlsx(`${name}_${today()}.xlsx`, title.slice(0, 31), worksheetRows);
}

function prepareExportRows(name, rows, type) {
  if (type === "attendance_report" || rows.some(r => "session_id" in r && "student_id" in r && "status" in r)) {
    return rows.map((r, i) => attendanceExportRow(r, i));
  }
  if (name === "students") return rows.map((s, i) => ({
    "No": i + 1,
    "NIS": s.nis || "",
    "NISN": s.nisn || "",
    "Nama Siswa": s.name || "",
    "Jenis Kelamin": s.gender === "L" ? "Laki-laki" : s.gender === "P" ? "Perempuan" : "",
    "Tempat Lahir": s.birth_place || "",
    "Tanggal Lahir": s.birth_date || "",
    "Kelas": displayName("classes", findById("classes", s.active_class_id)),
    "Tahun Ajaran": displayName("academic_years", findById("academic_years", s.active_academic_year_id)),
    "Nama Ayah": s.father_name || "",
    "Nama Ibu": s.mother_name || "",
    "HP Orang Tua": s.parent_phone || "",
    "Status": titleCase(s.status || ""),
    "QR Token": s.qr_token || ""
  }));
  if (name === "teachers") return rows.map((t, i) => ({
    "No": i + 1,
    "NIP": t.nip || "",
    "Nama Guru": t.name || "",
    "Jabatan Login": roleLabel(t.staff_role || (t.is_homeroom === "true" ? "wali_kelas" : "guru")),
    "Unit": t.unit || "",
    "Nomor HP": t.phone || "",
    "Alamat": t.address || "",
    "Status": t.active === "false" ? "Nonaktif" : "Aktif",
    "Wali Kelas": t.is_homeroom === "true" ? "Ya" : "Tidak"
  }));
  if (name === "schedules") return rows.map((s, i) => ({
    "No": i + 1,
    "Tahun Ajaran": displayName("academic_years", findById("academic_years", s.academic_year_id)),
    "Semester": displayName("semesters", findById("semesters", s.semester_id)),
    "Hari": s.day || "",
    "Kelas": displayName("classes", findById("classes", s.class_id)),
    "Mata Pelajaran": displayName("subjects", findById("subjects", s.subject_id)),
    "Guru": displayName("teachers", findById("teachers", s.teacher_id)),
    "Jam Mulai": s.start_time || "",
    "Jam Selesai": s.end_time || "",
    "Ruang": s.room || "",
    "Status": s.active === "false" ? "Nonaktif" : "Aktif"
  }));
  if (name === "classes") return rows.map((c, i) => ({
    "No": i + 1,
    "Nama Kelas": c.name || "",
    "Tingkat": c.level || "",
    "Jurusan": c.major || "",
    "Tahun Ajaran": displayName("academic_years", findById("academic_years", c.academic_year_id)),
    "Semester": displayName("semesters", findById("semesters", c.semester_id)),
    "Wali Kelas": displayName("teachers", findById("teachers", c.homeroom_teacher_id))
  }));
  if (name === "leave_requests") return rows.map((l, i) => ({
    "No": i + 1,
    "Nama Siswa": displayName("students", findById("students", l.student_id)),
    "Kelas": displayName("classes", findById("classes", l.class_id)),
    "Tahun Ajaran": displayName("academic_years", findById("academic_years", l.academic_year_id)),
    "Semester": displayName("semesters", findById("semesters", l.semester_id)),
    "Jenis": titleCase(l.leave_type || ""),
    "Tanggal Mulai": l.start_date || "",
    "Tanggal Selesai": l.end_date || "",
    "Alasan": l.reason || "",
    "Status": titleCase(l.status || ""),
    "Catatan": l.approval_note || ""
  }));
  return rows.map((row, i) => {
    const out = { "No": i + 1 };
    Object.entries(row).forEach(([k, v]) => {
      if (["id", "created_by", "updated_by", "deleted_by", "deleted_at"].includes(k)) return;
      out[humanizeKey(k)] = v;
    });
    return out;
  });
}

function attendanceExportRow(r, i) {
  const st = findById("students", r.student_id);
  return {
    "No": i + 1,
    "Tanggal": r.date || "",
    "NIS": st?.nis || "",
    "NISN": st?.nisn || "",
    "Nama Siswa": st?.name || "",
    "Kelas": displayName("classes", findById("classes", r.class_id)),
    "Mata Pelajaran": displayName("subjects", findById("subjects", r.subject_id)),
    "Guru": displayName("teachers", findById("teachers", r.teacher_id)),
    "Tahun Ajaran": displayName("academic_years", findById("academic_years", r.academic_year_id)),
    "Semester": displayName("semesters", findById("semesters", r.semester_id)),
    "Jam Pelajaran": `${r.start_time || ""} - ${r.end_time || ""}`,
    "Waktu Scan": r.scan_time || "-",
    "Status": statusLabels[r.status] || titleCase(r.status || ""),
    "Metode Input": methodLabel(r.input_method),
    "Keterangan": r.note || ""
  };
}

function exportKeys(rows) {
  return rows.length ? Object.keys(rows[0]) : ["No"];
}

function exportTitle(name, type) {
  if (type === "attendance_report") return "LAPORAN ABSENSI SISWA";
  return `DATA ${humanizeKey(name).toUpperCase()}`;
}

function methodLabel(method) {
  return ({ qr: "QR", manual: "Manual", leave_auto: "Izin/Sakit Otomatis", system_auto: "Sistem Alfa" })[method] || method || "";
}

function humanizeKey(key) {
  return String(key).replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
}

function titleCase(value) {
  return String(value || "").replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
}

function parseCsv(text) {
  const lines = text.trim().split(/\r?\n/).filter(Boolean);
  const headers = lines.shift().split(",").map(s => s.trim());
  return lines.map(line => Object.fromEntries(line.split(",").map((v, i) => [headers[i], v.trim()])));
}

function filterSelect(name, label, table) {
  const selected = name === "academic_year_id" ? selectedAcademicYearId() : "";
  let rows = state.db[table].filter(r => !r.deleted_at);
  if (table === "classes" || table === "semesters") rows = filterBySelectedAcademicYear(table, rows);
  if (table === "students") rows = activeStudentsForSelectedYear(rows);
  if (table === "teachers") rows = activeTeachersForDisplay(rows);
  return `<select name="${name}"><option value="">${label}</option>${rows.map(r => `<option value="${r.id}" ${selected === r.id ? "selected" : ""}>${escapeHtml(table === "classes" ? classSimpleLabel(r) : displayName(table, r))}</option>`).join("")}</select>`;
}

function reportFilterValues() {
  if (!state.filters.reportFilters) state.filters.reportFilters = {};
  return state.filters.reportFilters;
}

function reportUnitSelect() {
  const filters = reportFilterValues();
  const roleUnit = activeUnit();
  if (roleUnit) filters.unit = roleUnit;
  const selected = filters.unit || "";
  const options = educationUnitOptions().filter(([value]) => !roleUnit || value === roleUnit);
  return `<select name="unit" aria-label="Unit lembaga"><option value="">Semua Unit</option>${options.map(([value, label]) => `<option value="${value}" ${selected === value ? "selected" : ""}>${escapeHtml(label)}</option>`).join("")}</select>`;
}

function reportFilterSelect(name, label, table) {
  const filters = reportFilterValues();
  const selected = filters[name] || "";
  const rows = reportRowsForFilter(name, table);
  if (selected && !rows.some(row => row.id === selected)) {
    delete filters[name];
    return reportFilterSelect(name, label, table);
  }
  return `<select name="${name}"><option value="">${label}</option>${rows.map(r => `<option value="${r.id}" ${selected === r.id ? "selected" : ""}>${escapeHtml(table === "classes" ? classSimpleLabel(r) : displayName(table, r))}</option>`).join("")}</select>`;
}

function reportRowsForFilter(name, table) {
  const filters = reportFilterValues();
  let schedules = schedulesForSelectedYear().filter(schedule => !schedule.deleted_at && schedule.active !== "false");
  const user = currentUser();
  const unit = filters.unit || activeUnit();
  if (user.role === "guru") schedules = schedules.filter(schedule => schedule.teacher_id === user.teacher_id);
  if (user.role === "wali_kelas") {
    const classIds = new Set(classesForSelectedYear().filter(cls => cls.homeroom_teacher_id === user.teacher_id).map(cls => cls.id));
    schedules = schedules.filter(schedule => classIds.has(schedule.class_id));
  }
  if (unit) {
    const unitClassIds = new Set(classesForSelectedYear().filter(cls => classUnit(cls) === unit).map(cls => cls.id));
    schedules = schedules.filter(schedule => unitClassIds.has(schedule.class_id));
  }
  if (filters.class_id && name !== "class_id") schedules = schedules.filter(schedule => schedule.class_id === filters.class_id);
  if (filters.subject_id && name !== "subject_id") schedules = schedules.filter(schedule => schedule.subject_id === filters.subject_id);
  if (filters.teacher_id && name !== "teacher_id") schedules = schedules.filter(schedule => schedule.teacher_id === filters.teacher_id);
  if (table === "classes") {
    const ids = new Set(schedules.map(schedule => schedule.class_id));
    const shouldLimitBySchedule = filters.subject_id || filters.teacher_id;
    return classesForSelectedYear()
      .filter(cls => !unit || classUnit(cls) === unit)
      .filter(cls => !shouldLimitBySchedule || ids.has(cls.id) || cls.id === filters.class_id)
      .sort((a, b) => classSimpleLabel(a).localeCompare(classSimpleLabel(b)));
  }
  if (table === "subjects") {
    const ids = new Set(schedules.map(schedule => schedule.subject_id));
    return state.db.subjects.filter(subject => !subject.deleted_at && ids.has(subject.id)).sort((a, b) => displayName("subjects", a).localeCompare(displayName("subjects", b)));
  }
  if (table === "teachers") {
    const ids = new Set(schedules.map(schedule => schedule.teacher_id));
    return activeTeachersForDisplay(state.db.teachers).filter(teacher => ids.has(teacher.id)).sort((a, b) => displayName("teachers", a).localeCompare(displayName("teachers", b)));
  }
  if (table === "students") {
    const unitClassIds = new Set(classesForSelectedYear().filter(cls => !unit || classUnit(cls) === unit).map(cls => cls.id));
    const scheduledClassIds = new Set(schedules.map(schedule => schedule.class_id));
    const shouldLimitBySchedule = filters.subject_id || filters.teacher_id;
    const classIds = filters.class_id
      ? new Set([filters.class_id])
      : shouldLimitBySchedule ? scheduledClassIds : unitClassIds;
    return activeStudentsForSelectedYear(visibleRows("students"))
      .filter(student => classIds.has(student.active_class_id))
      .sort((a, b) => String(a.name || "").localeCompare(String(b.name || "")));
  }
  return [];
}

function studentsInClass(classId) {
  const histories = state.db.student_class_histories.filter(h => h.class_id === classId && h.status === "aktif");
  const ids = new Set(histories.map(h => h.student_id));
  return state.db.students.filter(s => studentCanLogin(s) && (s.active_class_id === classId || ids.has(s.id)));
}
function accessibleLeaveClasses() {
  const user = currentUser();
  let classes = classesForSelectedYear();
  if (user.role === "wali_kelas") classes = classes.filter(cls => cls.homeroom_teacher_id === user.teacher_id);
  if (user.role === "guru") {
    const ids = new Set(state.db.schedules.filter(schedule => !schedule.deleted_at && schedule.teacher_id === user.teacher_id).map(schedule => schedule.class_id));
    classes = classes.filter(cls => ids.has(cls.id));
  }
  return classes.sort((a, b) => `${a.level || ""}${a.name || ""}`.localeCompare(`${b.level || ""}${b.name || ""}`));
}
function lessonHourLabel(hour) {
  return `${hour.name || "Jam Pelajaran"} (${hour.start_time || "-"} - ${hour.end_time || "-"})`;
}
function lessonHourIdForSchedule(schedule = {}) {
  const hour = state.db.lesson_hours.find(h => !h.deleted_at && h.start_time === schedule.start_time && h.end_time === schedule.end_time);
  return hour?.id || "";
}
function applyLessonHourToSchedule(data) {
  const hour = findById("lesson_hours", data.lesson_hour_id);
  if (!hour) return;
  data.start_time = hour.start_time;
  data.end_time = hour.end_time;
  delete data.lesson_hour_id;
}
function schoolDays() {
  return ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"];
}
function scheduleDaysForClass(classId) {
  const order = schoolDays();
  return [...new Set(schedulesForClass(classId).map(schedule => schedule.day).filter(Boolean))]
    .sort((a, b) => order.indexOf(a) - order.indexOf(b));
}
function schedulesForClass(classId) {
  return state.db.schedules
    .filter(schedule => !schedule.deleted_at && schedule.class_id === classId)
    .sort((a, b) => `${a.day || ""}${a.start_time || ""}`.localeCompare(`${b.day || ""}${b.start_time || ""}`));
}
function subjectsForClass(classId) {
  const subjectIds = new Set(schedulesForClass(classId).filter(schedule => schedule.active !== "false").map(schedule => schedule.subject_id));
  return state.db.subjects.filter(subject => !subject.deleted_at && subjectIds.has(subject.id));
}
function approvedLeaveFor(studentId, date) { return state.db.leave_requests.find(l => l.student_id === studentId && l.status === "approved" && date >= l.start_date && date <= l.end_date); }
function isHoliday(date) { return state.db.holidays.some(h => h.date === date && !h.deleted_at); }
function isActiveRef(table, id) {
  const r = findById(table, id);
  if (!r || r.deleted_at || r.active === "false") return false;
  if (table === "teachers") return teacherCanLogin(r);
  if (table === "students") return studentCanLogin(r);
  return true;
}
function logChange(record, oldStatus, newStatus, reason) { state.db.attendance_logs.push({ id: uid("log"), attendance_record_id: record.id, student_id: record.student_id, old_status: oldStatus, new_status: newStatus, changed_by: currentUser().id, reason, created_at: now() }); }
function findById(table, id) { return state.db[table].find(r => r.id === id); }
function refName(table) { return id => escapeHtml(displayName(table, findById(table, id)) || "-"); }
function evidenceLink(value) {
  if (!value) return "-";
  return `<button type="button" class="ghost evidence-link" data-evidence="${escapeHtml(value)}">Lihat Bukti</button>`;
}

function bindEvidenceLinks(root = document) {
  root.querySelectorAll("[data-evidence]").forEach(button => {
    button.onclick = () => showEvidencePreview(button.dataset.evidence);
  });
}

function showEvidencePreview(value) {
  if (!value) return toast("Bukti tidak tersedia.", "warn");
  const isImage = String(value).startsWith("data:image/") || /\.(png|jpe?g|webp|gif)$/i.test(String(value).split("?")[0]);
  modal("Bukti Pengajuan Izin", `<div class="evidence-preview">
    ${isImage ? `<img src="${escapeHtml(value)}" alt="Bukti pengajuan izin">` : `<p class="muted">Bukti tersedia sebagai tautan.</p><a class="primary" href="${escapeHtml(value)}" target="_blank" rel="noopener">Buka Bukti</a>`}
  </div>`);
}
function classSemesterName(classId) {
  const cls = findById("classes", classId);
  return cls ? displayName("semesters", findById("semesters", cls.semester_id)) || "-" : "-";
}
function displayName(table, row) {
  if (!row) return "";
  if (table === "classes") return `${row.name || ""}${row.semester_id ? " - " + displayName("semesters", findById("semesters", row.semester_id)) : ""}`;
  if (table === "academic_years") return row.name;
  if (table === "semesters") return row.name;
  if (table === "subjects") return row.name || row.code;
  if (table === "teachers" || table === "students" || table === "users") return row.name;
  return row.name || row.id;
}
function roleLabel(value) { return roles[value] || (value === "guru" ? "Guru" : value === "wali_kelas" ? "Wali Kelas" : value || "-"); }
function dayName(date) { return ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"][date.getDay()]; }
function badge(status) { return `<span class="badge ${status}">${escapeHtml(statusLabels[status] || statusText(status))}</span>`; }
function statusText(v) { return ({ open: "Terbuka", closed: "Tertutup", cancelled: "Dibatalkan", scheduled: "Terjadwal", done: "Selesai", true: "Aktif", false: "Nonaktif" })[v] || v || "-"; }
function boolText(v) { return v === true || v === "true" ? "Aktif" : "Nonaktif"; }
function byId(id) { return document.getElementById(id); }
function formData(form) { return Object.fromEntries(new FormData(form).entries()); }
async function formDataWithImages(form) {
  const fd = new FormData(form);
  const out = Object.fromEntries(fd.entries());
  if (fd.has("units")) out.units = fd.getAll("units").join(",");
  const imageFiles = [...fd.entries()].filter(([key, value]) => key.endsWith("__file") && value instanceof File && value.size);
  for (const [key, file] of imageFiles) {
    out[key.replace(/__file$/, "")] = await imageFileToDataUrl(file);
    delete out[key];
  }
  Object.keys(out).forEach(key => {
    if (key.endsWith("__file")) delete out[key];
  });
  return out;
}

function renderMeetings() {
  const meetings = state.db.meetings.filter(m => !m.deleted_at).sort((a, b) => `${b.date || ""}${b.time || ""}`.localeCompare(`${a.date || ""}${a.time || ""}`));
  byId("view").innerHTML = `<section class="panel admin-workflow">
    <div class="panel-head workflow-head">
      <div><span class="eyebrow">Kepala Sekolah</span><h2>Rapat Pengajar</h2><p class="muted">Undangan rapat dikirim ke semua guru dan wali kelas sebagai notifikasi.</p></div>
      <div class="actions"><button class="primary" data-add-meeting>+ Rapat</button></div>
    </div>
    <div class="role-card-grid">${meetings.map(meetingCard).join("") || `<div class="empty-state">Belum ada rapat.</div>`}</div>
  </section>`;
  byId("view").querySelector("[data-add-meeting]")?.addEventListener("click", () => openMeetingForm());
  byId("view").querySelectorAll("[data-edit-meeting]").forEach(button => button.onclick = () => openMeetingForm(findById("meetings", button.dataset.editMeeting)));
  byId("view").querySelectorAll("[data-delete-meeting]").forEach(button => button.onclick = () => {
    const meeting = findById("meetings", button.dataset.deleteMeeting);
    if (!meeting || !confirm("Hapus rapat ini?")) return;
    meeting.deleted_at = now();
    meeting.updated_at = now();
    saveDb();
    renderMeetings();
    toast("Rapat dihapus.", "ok");
  });
}

function meetingCard(meeting) {
  return `<article class="role-card meeting-card">
    <div>
      <span class="class-label">${escapeHtml(meeting.date || "-")} ${escapeHtml(meeting.time || "")}</span>
      <h3>${escapeHtml(meeting.title || "Rapat")}</h3>
      <p>${escapeHtml(meeting.location || "Tempat belum diisi")}</p>
      <p>${escapeHtml(meeting.agenda || "")}</p>
    </div>
    <div class="role-card-foot">
      <span class="badge ${meeting.status || "scheduled"}">${escapeHtml(statusText(meeting.status) || meeting.status || "Terjadwal")}</span>
      <button class="ghost" data-edit-meeting="${meeting.id}">Edit</button>
      <button class="danger" data-delete-meeting="${meeting.id}">Hapus</button>
    </div>
  </article>`;
}

function openMeetingForm(row = null) {
  openForm("meetings", row, { date: today(), time: "09:00", status: "scheduled" }, { afterSave: saved => notifyMeeting(saved) });
}

function notifyMeeting(meeting) {
  state.db.users
    .filter(user => !user.deleted_at && user.active !== "false" && ["guru", "wali_kelas"].includes(user.role))
    .forEach(user => {
      const key = `${user.id}|meeting|${meeting.id}`;
      state.db.notifications = state.db.notifications.filter(n => n.key !== key);
      state.db.notifications.push({
        id: uid("not"),
        key,
        user_id: user.id,
        title: `Undangan rapat: ${meeting.title}`,
        body: `${meeting.date} ${meeting.time} - ${meeting.location || "Lokasi menyusul"}. ${meeting.agenda || ""}`,
        type: "meeting",
        ref_id: meeting.id,
        read_at: "",
        created_at: now()
      });
    });
}

function roundedRectClip(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
  ctx.clip();
}

function drawCanvasLogoInitials(ctx, name, x, y) {
  ctx.fillStyle = "#ffffff";
  ctx.font = "900 17px Arial";
  ctx.textAlign = "center";
  ctx.fillText(initials(name), x, y);
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function imageFileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error);
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => resolve(reader.result);
      img.onload = () => {
        const max = 900;
        const scale = Math.min(1, max / Math.max(img.width, img.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round(img.width * scale));
        canvas.height = Math.max(1, Math.round(img.height * scale));
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.82));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}
function emptyRow(cols) { return `<tr><td colspan="${cols}" class="muted">Belum ada data.</td></tr>`; }
function escapeHtml(v) { return String(v ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])); }
function csvCell(v) { const s = String(v ?? ""); return /[",\n]/.test(s) ? `"${s.replaceAll('"', '""')}"` : s; }
function modal(title, body) {
  closeModal({ fromPopState: true });
  const el = document.createElement("div");
  el.className = "modal-backdrop";
  el.id = "modal-backdrop";
  el.innerHTML = `<section class="modal"><div class="modal-head"><h2>${escapeHtml(title)}</h2><button class="icon-btn" data-close aria-label="Tutup">&times;</button></div>${body}</section>`;
  document.body.appendChild(el);
  if (history.pushState && state.session) {
    history.pushState({ app: "alhikmah", page: state.page, modal: true }, "", location.href);
    state.modalHistoryOpen = true;
  }
  el.querySelectorAll("[data-close]").forEach(b => b.onclick = closeModal);
  decorateResponsiveTables(el);
}
function closeModal(options = {}) {
  stopCamera();
  const hadModal = !!byId("modal-backdrop");
  byId("modal-backdrop")?.remove();
  if (hadModal && state.modalHistoryOpen && !options.fromPopState && history.back) {
    state.modalHistoryOpen = false;
    history.back();
    return;
  }
  if (hadModal && options.fromPopState) state.modalHistoryOpen = false;
}
function toast(msg, type = "ok") {
  const t = byId("toast");
  t.textContent = msg; t.className = `toast ${type} show`;
  setTimeout(() => t.classList.remove("show"), 2800);
}
function scanSuccessNotice(student, status, session) {
  document.querySelector(".scan-success-toast")?.remove();
  const el = document.createElement("div");
  el.className = "scan-success-toast show";
  el.innerHTML = `
    <div class="scan-success-icon">OK</div>
    <div>
      <span>Scan QR Berhasil</span>
      <strong>${escapeHtml(student.name)}</strong>
      <small>${statusLabels[status]} - ${escapeHtml(displayName("classes", findById("classes", session.class_id)))} - ${new Date().toTimeString().slice(0, 8)}</small>
    </div>
  `;
  document.body.appendChild(el);
  setTimeout(() => el.classList.remove("show"), 3200);
  setTimeout(() => el.remove(), 3600);
}
function successBeep() { beep(660, 80); }
function failBeep() { beep(180, 150); }
function beep(freq, ms) {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.value = freq; osc.connect(gain); gain.connect(ctx.destination); osc.start();
    setTimeout(() => { osc.stop(); ctx.close(); }, ms);
  } catch {}
}
