// script.js - Perbaikan perhitungan hari total dan mobile responsive

// Konfigurasi Google Apps Script Web App
const WEB_APP_URL =
  "https://script.google.com/macros/s/AKfycbxWZw0YmJ1Mhb2vS3nv4Pc4mrazt3TCJo-UV1fuOa9Y7GoMTRK3koRmmsVWlws_ANIT8A/exec";

// FLAG untuk menggunakan data dummy (true = pakai dummy, false = pakai API)
const USE_DUMMY_DATA = true;

// Fungsi untuk mengkonversi jam ke hari berdasarkan jenis kegiatan
function convertToDays(hours, activityType) {
  let hoursPerDay = 1;
  const lowerActivity = activityType.toLowerCase();
  if (lowerActivity.includes("kbm")) {
    hoursPerDay = 8;
  } else if (
    lowerActivity.includes("pembiasaan") ||
    lowerActivity.includes("pkb") ||
    lowerActivity.includes("sholat")
  ) {
    hoursPerDay = 1;
  }
  const days = hours / hoursPerDay;
  return days;
}

// FUNGSI BARU: Konversi jam ke hari berdasarkan kombinasi kegiatan dalam sehari
function convertHoursToDaysByActivity(hours, activityType, hariAktif) {
  const activeDays = hariAktif || 22;
  let hoursPerDay = 1;
  const lowerActivity = activityType.toLowerCase();
  if (lowerActivity.includes("kbm")) {
    hoursPerDay = 8;
  } else if (
    lowerActivity.includes("pembiasaan") ||
    lowerActivity.includes("pkb") ||
    lowerActivity.includes("sholat")
  ) {
    hoursPerDay = 1;
  }
  const days = hours / hoursPerDay;
  return Math.min(days, activeDays);
}

// FUNGSI BARU: Menghitung total hari keseluruhan dengan benar
function calculateTotalDays(activities, hariAktif) {
  const monthlyData = {};

  activities.forEach((act) => {
    if (!monthlyData[act.month]) {
      monthlyData[act.month] = {
        kbm: 0,
        pkb: 0,
        sholat: 0,
        other: 0,
      };
    }

    const lowerActivity = act.activity.toLowerCase();
    if (lowerActivity.includes("kbm")) {
      monthlyData[act.month].kbm += act.present || 0;
    } else if (
      lowerActivity.includes("pembiasaan") ||
      lowerActivity.includes("pkb")
    ) {
      monthlyData[act.month].pkb += act.present || 0;
    } else if (lowerActivity.includes("sholat")) {
      monthlyData[act.month].sholat += act.present || 0;
    } else {
      monthlyData[act.month].other += act.present || 0;
    }
  });

  let totalDays = 0;
  let totalHours = 0;

  for (const [month, data] of Object.entries(monthlyData)) {
    let activeDays = 22;
    if (hariAktif) {
      const foundDays = getActiveDaysForMonth(hariAktif, month);
      if (foundDays !== null) {
        activeDays = foundDays;
      }
    }

    const hoursPerDay = 8 + 1 + 1;
    const totalHoursInMonth = data.kbm + data.pkb + data.sholat + data.other;
    const daysInMonth = totalHoursInMonth / hoursPerDay;
    const limitedDays = Math.min(daysInMonth, activeDays);

    totalDays += limitedDays;
    totalHours += totalHoursInMonth;
  }

  return {
    totalDays: totalDays,
    totalHours: totalHours,
    monthlyBreakdown: monthlyData,
  };
}

// Fungsi untuk format tampilan hari
function formatDays(days) {
  if (days === 0) return "0 hari";
  if (Number.isInteger(days)) {
    return days + " hari";
  }
  return days.toFixed(1) + " hari";
}

// DATA DUMMY
const DUMMY_DATA = [
  {
    id: "111",
    name: "ACHMAD IQBAL NUSANTARA",
    class: "FA 1",
    year: "2025/2026",
    status: "Aktif",
    hari_aktif: {
      agustus: 22,
    },
    activities: [
      {
        month: "Agustus",
        activity: "Pembiasaan Karakter Baik",
        present: 22,
        absent: 0,
        permission: 0,
        sick: 0,
        late: 0,
        detail: [],
      },
      {
        month: "Agustus",
        activity: "Sholat Berjama'ah",
        present: 22,
        absent: 0,
        permission: 0,
        sick: 0,
        late: 0,
        detail: [],
      },
      {
        month: "Agustus",
        activity: "KBM",
        present: 172,
        absent: 0,
        permission: 0,
        sick: 0,
        late: 0,
      },
    ],
  },
  {
    id: "222",
    name: "Sulthon Muzakky Amrullah Al Ikhwan",
    class: "VII AGAMA 1",
    year: "2025",
    status: "Aktif",
    hari_aktif: {
      agustus: 22,
      september: 20,
    },
    activities: [
      {
        month: "Agustus",
        activity: "KBM",
        present: 150,
        absent: 2,
        permission: 1,
        sick: 0,
        late: 3,
      },
      {
        month: "Agustus",
        activity: "Pembiasaan Karakter Baik",
        present: 18,
        absent: 1,
        permission: 0,
        sick: 0,
        late: 1,
      },
      {
        month: "Agustus",
        activity: "Sholat Berjama'ah",
        present: 19,
        absent: 0,
        permission: 0,
        sick: 0,
        late: 1,
      },
      {
        month: "September",
        activity: "KBM",
        present: 160,
        absent: 0,
        permission: 0,
        sick: 0,
        late: 0,
      },
      {
        month: "September",
        activity: "Pembiasaan Karakter Baik",
        present: 20,
        absent: 0,
        permission: 0,
        sick: 0,
        late: 0,
      },
      {
        month: "September",
        activity: "Sholat Berjama'ah",
        present: 20,
        absent: 0,
        permission: 0,
        sick: 0,
        late: 0,
      },
    ],
  },
  {
    id: "333",
    name: "Siti Rahayu",
    class: "X IPA 2",
    year: "2023/2024",
    status: "Aktif",
    hari_aktif: {
      januari: 22,
      februari: 20,
    },
    activities: [
      {
        month: "Januari",
        activity: "KBM",
        present: 150,
        absent: 2,
        permission: 0,
        sick: 0,
        late: 2,
      },
      {
        month: "Januari",
        activity: "Pembiasaan Karakter Baik",
        present: 18,
        absent: 0,
        permission: 0,
        sick: 0,
        late: 0,
      },
      {
        month: "Januari",
        activity: "Sholat Berjama'ah",
        present: 20,
        absent: 0,
        permission: 0,
        sick: 0,
        late: 0,
      },
      {
        month: "Februari",
        activity: "KBM",
        present: 170,
        absent: 0,
        permission: 1,
        sick: 0,
        late: 0,
      },
      {
        month: "Februari",
        activity: "Pembiasaan Karakter Baik",
        present: 20,
        absent: 0,
        permission: 0,
        sick: 0,
        late: 0,
      },
      {
        month: "Februari",
        activity: "Sholat Berjama'ah",
        present: 20,
        absent: 0,
        permission: 0,
        sick: 0,
        late: 0,
      },
    ],
  },
];

async function searchStudent(studentId) {
  const spinner = document.getElementById("loadingSpinner");
  const resultBox = document.querySelector(".result-box");

  if (spinner) spinner.style.display = "block";
  if (resultBox) resultBox.style.display = "none";

  try {
    let student = null;
    let hariAktif = null;

    if (USE_DUMMY_DATA) {
      console.log("Menggunakan data dummy untuk testing...");

      const foundStudent = DUMMY_DATA.find((s) => s.id === studentId);

      if (foundStudent) {
        student = JSON.parse(JSON.stringify(foundStudent));
        hariAktif = student.hari_aktif || null;

        if (student.activities) {
          student.activities.forEach((act) => {
            act.presentDays = convertToDays(act.present, act.activity);
            act.absentDays = convertToDays(act.absent, act.activity);
            act.permissionDays = convertToDays(act.permission, act.activity);
            act.sickDays = convertToDays(act.sick, act.activity);
            act.lateDays = convertToDays(act.late, act.activity);

            if (!act.detail) {
              act.detail = [];
            }
          });
        }
      }
    } else {
      const response = await fetch(`${WEB_APP_URL}?niup=${studentId}`);
      const data = await response.json();

      console.log("Response API:", data);

      if (
        data.status === "success" &&
        Array.isArray(data.data) &&
        data.data.length > 0
      ) {
        student = data.data[0];

        if (data.hari_aktif) {
          hariAktif = data.hari_aktif;
        }

        if (student && student.activities) {
          student.activities.forEach((act) => {
            act.presentDays = convertToDays(act.present, act.activity);
            act.absentDays = convertToDays(act.absent, act.activity);
            act.permissionDays = convertToDays(act.permission, act.activity);
            act.sickDays = convertToDays(act.sick, act.activity);
            act.lateDays = convertToDays(act.late, act.activity);

            if (!act.detail) {
              act.detail = [];
            }
          });
        }
      } else if (data.id && !data.error) {
        student = data;

        if (student.activities) {
          student.activities.forEach((act) => {
            act.presentDays = convertToDays(act.present, act.activity);
            act.absentDays = convertToDays(act.absent, act.activity);
            act.permissionDays = convertToDays(act.permission, act.activity);
            act.sickDays = convertToDays(act.sick, act.activity);
            act.lateDays = convertToDays(act.late, act.activity);

            if (!act.detail) {
              act.detail = [];
            }
          });
        }
      } else if (data.error) {
        console.error("Error dari API:", data.error);
        if (spinner) spinner.style.display = "none";
        return null;
      }
    }

    if (!student) {
      console.log("Siswa tidak ditemukan untuk ID:", studentId);
      if (spinner) spinner.style.display = "none";
      return null;
    }

    if (hariAktif) {
      student.hari_aktif = hariAktif;
    }

    const monthOrder = [
      "Januari",
      "Februari",
      "Maret",
      "April",
      "Mei",
      "Juni",
      "Juli",
      "Agustus",
      "September",
      "Oktober",
      "November",
      "Desember",
    ];

    if (student.activities) {
      student.activities.sort((a, b) => {
        return monthOrder.indexOf(a.month) - monthOrder.indexOf(b.month);
      });
    }

    console.log("Data siswa berhasil diproses:", student);
    if (spinner) spinner.style.display = "none";
    return student;
  } catch (error) {
    console.error("Error fetching student data:", error);
    if (spinner) spinner.style.display = "none";
    return null;
  }
}

// FUNGSI BARU: Menghitung total statistik dengan perhitungan hari yang benar
function calculateTotalStats(activities, hariAktif = null) {
  const totals = activities.reduce(
    (totals, activity) => {
      totals.present += activity.present;
      totals.absent += activity.absent;
      totals.permission += activity.permission;
      totals.sick += activity.sick;
      totals.late += activity.late || 0;

      totals.presentDays += activity.presentDays || 0;
      totals.absentDays += activity.absentDays || 0;
      totals.permissionDays += activity.permissionDays || 0;
      totals.sickDays += activity.sickDays || 0;
      totals.lateDays += activity.lateDays || 0;

      if (activity.detail && activity.detail.length > 0) {
        totals.details = totals.details.concat(activity.detail);
      }

      return totals;
    },
    {
      present: 0,
      absent: 0,
      permission: 0,
      sick: 0,
      late: 0,
      presentDays: 0,
      absentDays: 0,
      permissionDays: 0,
      sickDays: 0,
      lateDays: 0,
      details: [],
      activities: activities,
    },
  );

  const totalDaysResult = calculateTotalDays(activities, hariAktif);
  totals.correctPresentDays = totalDaysResult.totalDays;
  totals.correctPresentHours = totalDaysResult.totalHours;
  totals.monthlyBreakdown = totalDaysResult.monthlyBreakdown;

  if (hariAktif) {
    let totalActiveDays = 0;
    const uniqueMonths = getUniqueMonths(activities);
    uniqueMonths.forEach((month) => {
      const activeDays = getActiveDaysForMonth(hariAktif, month);
      if (activeDays !== null) {
        totalActiveDays += activeDays;
      }
    });

    if (totalActiveDays > 0) {
      const totalIdealHours = totalActiveDays * 10;
      totals.totalPercentage =
        totalIdealHours > 0
          ? Math.round((totals.present / totalIdealHours) * 100)
          : 0;
    } else {
      const totalEffective = totals.present + totals.absent + totals.permission;
      totals.totalPercentage =
        totalEffective > 0
          ? Math.round((totals.present / totalEffective) * 100)
          : 0;
    }
  } else {
    const totalEffective = totals.present + totals.absent + totals.permission;
    totals.totalPercentage =
      totalEffective > 0
        ? Math.round((totals.present / totalEffective) * 100)
        : 0;
  }

  return totals;
}

// Fungsi menghitung persentase
function calculatePercentage(present, absent, permission, sick, late) {
  const total = present + absent + permission;
  return total > 0 ? Math.round((present / total) * 100) : 0;
}

// Fungsi menghitung persentase dengan hari_aktif
function calculatePercentageWithActiveDays(
  present,
  absent,
  permission,
  sick,
  late,
  activeDays,
  activityType,
) {
  if (!activeDays || activeDays === 0) {
    return calculatePercentage(present, absent, permission, sick, late);
  }

  let hoursPerDay = 1;
  const lowerActivity = activityType.toLowerCase();
  if (lowerActivity.includes("kbm")) {
    hoursPerDay = 8;
  }

  const totalPossibleHours = activeDays * hoursPerDay;
  return totalPossibleHours > 0
    ? Math.round((present / totalPossibleHours) * 100)
    : 0;
}

// Fungsi membuat chart kehadiran
function createAttendanceChart(present, absent, permission, sick, late) {
  const total = present + absent + permission + sick + late;
  const presentPercent = total > 0 ? (present / total) * 100 : 0;
  const absentPercent = total > 0 ? (absent / total) * 100 : 0;
  const permissionPercent = total > 0 ? (permission / total) * 100 : 0;
  const sickPercent = total > 0 ? (sick / total) * 100 : 0;
  const latePercent = total > 0 ? (late / total) * 100 : 0;

  const maxHeight = 100;

  const formatValue = (num, percent) => {
    if (num === 0) return "";
    return `<div>${num}</div><div class="chart-percent">${Math.round(percent)}%</div>`;
  };

  return `
    <div class="chart-bar bg-success" style="height: ${(presentPercent / 100) * maxHeight}%" 
         data-tooltip="Hadir: ${present} jam (${Math.round(presentPercent)}%)">
      <div class="chart-value">${formatValue(present, presentPercent)}</div>
      <div class="chart-label mb-3">Hadir</div>
    </div>
    <div class="chart-bar bg-danger" style="height: ${(absentPercent / 100) * maxHeight}%" 
         data-tooltip="Alpa: ${absent} jam (${Math.round(absentPercent)}%)">
      <div class="chart-value">${formatValue(absent, absentPercent)}</div>
      <div class="chart-label mb-3">Alpa</div>
    </div>
    <div class="chart-bar bg-warning" style="height: ${(permissionPercent / 100) * maxHeight}%" 
         data-tooltip="Izin: ${permission} jam (${Math.round(permissionPercent)}%)">
      <div class="chart-value">${formatValue(permission, permissionPercent)}</div>
      <div class="chart-label mb-3">Izin</div>
    </div>
    <div class="chart-bar bg-info" style="height: ${(sickPercent / 100) * maxHeight}%" 
         data-tooltip="Sakit: ${sick} jam (${Math.round(sickPercent)}%)">
      <div class="chart-value">${formatValue(sick, sickPercent)}</div>
      <div class="chart-label mb-3">Sakit</div>
    </div>
    <div class="chart-bar bg-secondary" style="height: ${(latePercent / 100) * maxHeight}%" 
         data-tooltip="Terlambat: ${late} jam (${Math.round(latePercent)}%)">
      <div class="chart-value">${formatValue(late, latePercent)}</div>
      <div class="chart-label mb-3"><small>Terlambat</small></div>
    </div>
  `;
}

// Fungsi menghitung total per kegiatan
function calculateTotalPerActivity(activities) {
  const totals = {};

  activities.forEach((activity) => {
    const key = activity.activity;
    if (!totals[key]) {
      totals[key] = {
        activity: key,
        present: 0,
        absent: 0,
        permission: 0,
        sick: 0,
        late: 0,
        presentDays: 0,
        absentDays: 0,
        permissionDays: 0,
        sickDays: 0,
        lateDays: 0,
        count: 0,
        details: [],
      };
    }

    totals[key].present += activity.present;
    totals[key].absent += activity.absent;
    totals[key].permission += activity.permission;
    totals[key].sick += activity.sick;
    totals[key].late += activity.late || 0;
    totals[key].presentDays += activity.presentDays || 0;
    totals[key].absentDays += activity.absentDays || 0;
    totals[key].permissionDays += activity.permissionDays || 0;
    totals[key].sickDays += activity.sickDays || 0;
    totals[key].lateDays += activity.lateDays || 0;
    totals[key].count += 1;

    if (activity.detail && activity.detail.length > 0) {
      totals[key].details = totals[key].details.concat(activity.detail);
    }
  });

  return Object.values(totals);
}

// Fungsi mendapatkan bulan unik
function getUniqueMonths(activities) {
  const months = [...new Set(activities.map((a) => a.month))];
  const monthOrder = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
  ];
  return months.sort((a, b) => monthOrder.indexOf(a) - monthOrder.indexOf(b));
}

// Fungsi mendapatkan ikon kegiatan
function getActivityIcon(activity) {
  const lowerActivity = activity.toLowerCase();
  if (lowerActivity.includes("kbm")) return "fa-book";
  if (lowerActivity.includes("pembiasaan") || lowerActivity.includes("pkb"))
    return "fa-hand-holding-heart";
  if (lowerActivity.includes("sholat")) return "fa-mosque";
  if (lowerActivity.includes("ekstra")) return "fa-futbol";
  return "fa-tasks";
}

// Fungsi mendapatkan warna badge
function getActivityBadgeColor(activity) {
  const lowerActivity = activity.toLowerCase();
  if (lowerActivity.includes("kbm")) return "badge-primary";
  if (lowerActivity.includes("pembiasaan") || lowerActivity.includes("pkb"))
    return "badge-success";
  if (lowerActivity.includes("sholat")) return "badge-info";
  if (lowerActivity.includes("ekstra")) return "badge-warning";
  return "badge-secondary";
}

// Fungsi mendapatkan info konversi
function getActivityHoursInfo(activity) {
  const lowerActivity = activity.toLowerCase();
  // if (lowerActivity.includes("kbm")) {
  //   return "1 hari = 8 jam";
  // } else if (
  //   lowerActivity.includes("pembiasaan") ||
  //   lowerActivity.includes("pkb") ||
  //   lowerActivity.includes("sholat")
  // ) {
  //   return "1 hari = 1 jam";
  // }
  return "";
}

// Fungsi mendapatkan hari_aktif untuk bulan tertentu
function getActiveDaysForMonth(hariAktif, month) {
  if (!hariAktif) return null;

  const monthLower = month.toLowerCase();

  for (const [key, value] of Object.entries(hariAktif)) {
    if (key.toLowerCase() === monthLower) {
      return value;
    }
  }
  return null;
}

// Fungsi render detail ketidakhadiran
function renderAttendanceDetails(details) {
  if (!details || details.length === 0) {
    return '<span class="text-muted">Tidak ada catatan detail</span>';
  }

  const grouped = {};
  details.forEach((d) => {
    if (!grouped[d.keterangan]) {
      grouped[d.keterangan] = [];
    }
    grouped[d.keterangan].push(d.tanggal);
  });

  let html = '<div class="detail-list">';
  for (const [keterangan, dates] of Object.entries(grouped)) {
    const badgeColor =
      keterangan === "Alpa"
        ? "danger"
        : keterangan === "Izin"
          ? "warning"
          : keterangan === "Sakit"
            ? "info"
            : "secondary";
    html += `
      <div class="detail-item mb-1">
        <span class="badge bg-${badgeColor} me-1">${keterangan}</span>
        <span class="text-muted">${dates.join(", ")}</span>
      </div>
    `;
  }
  html += "</div>";
  return html;
}

// FUNGSI BARU: Menampilkan statistik total dengan perhitungan hari yang benar
function displayTotalStatistics(totals, hariAktif = null) {
  const container = document.getElementById("totalStatistics");

  if (!container) {
    console.error("Element #totalStatistics tidak ditemukan!");
    return;
  }

  container.innerHTML = "";

  let html = `
    <div class="card mt-3 mb-4">
      <div class="card-header bg-primary text-white">
        <h5 class="mb-0"><i class="fas fa-chart-bar me-2"></i>Statistik Total Keseluruhan</h5>
      </div>
      <div class="card-body">
        <div class="row">
          <div class="col-md-3 mb-3">
            <div class="stat-box bg-success text-white rounded p-3 text-center">
              <h6><i class="fas fa-check-circle me-2"></i>Total Hadir</h6>
              <h3>${totals.present} jam</h3>
              <small>
                ${formatDays(totals.correctPresentDays || totals.presentDays)}
                
              </small>
            </div>
          </div>
          <div class="col-md-3 mb-3">
            <div class="stat-box bg-danger text-white rounded p-3 text-center">
              <h6><i class="fas fa-times-circle me-2"></i>Total Alpa</h6>
              <h3>${totals.absent} jam</h3>
              <small>${formatDays(totals.absentDays)}</small>
            </div>
          </div>
          <div class="col-md-3 mb-3">
            <div class="stat-box bg-warning text-white rounded p-3 text-center">
              <h6><i class="fas fa-file-alt me-2"></i>Total Izin</h6>
              <h3>${totals.permission} jam</h3>
              <small>${formatDays(totals.permissionDays)}</small>
            </div>
          </div>
          <div class="col-md-3 mb-3">
            <div class="stat-box bg-info text-white rounded p-3 text-center">
              <h6><i class="fas fa-ambulance me-2"></i>Total Sakit</h6>
              <h3>${totals.sick} jam</h3>
              <small>${formatDays(totals.sickDays)}</small>
            </div>
          </div>
        </div>
        <div class="row">
          <div class="col-md-6 mb-3">
            <div class="stat-box bg-secondary text-white rounded p-3 text-center">
              <h6><i class="fas fa-clock me-2"></i>Total Terlambat</h6>
              <h3>${totals.late} jam</h3>
              <small>${formatDays(totals.lateDays)}</small>
            </div>
          </div>
          <div class="col-md-6">
            <div class="stat-box ${totals.totalPercentage >= 80 ? "bg-success" : totals.totalPercentage >= 60 ? "bg-warning text-dark" : "bg-danger"} text-white rounded p-3 text-center">
              <h6><i class="fas fa-percent me-2"></i>Persentase Kehadiran Total</h6>
              <h3>${totals.totalPercentage}%</h3>
              <small>
                ${totals.totalPercentage >= 80 ? "✅ Kehadiran Baik" : totals.totalPercentage >= 60 ? "⚠️ Perlu Ditingkatkan" : "❌ Perlu Perhatian Khusus"}
                ${hariAktif ? "| Berdasarkan hari aktif" : ""}
              </small>
            </div>
          </div>
        </div>
        
        ${
          totals.details && totals.details.length > 0
            ? `
        <div class="row mt-3">
          <div class="col-12">
            <div class="card bg-light">
              <div class="card-body">
                <h6><i class="fas fa-list me-2"></i>Rekapitulasi Ketidakhadiran</h6>
                ${renderAttendanceDetails(totals.details)}
              </div>
            </div>
          </div>
        </div>
        `
            : ""
        }
        
       
      </div>
    </div>
  `;

  container.innerHTML = html;
}

// Fungsi menampilkan total per kegiatan - Diperbaiki untuk mobile
function displayTotalPerActivity(activities, hariAktif = null) {
  const container = document.getElementById("totalPerActivity");
  container.innerHTML = "";

  const totals = calculateTotalPerActivity(activities);

  if (totals.length === 0) {
    container.innerHTML =
      '<div class="alert alert-info">Tidak ada data kegiatan</div>';
    return;
  }

  // Cek apakah perangkat mobile
  const isMobile = window.innerWidth < 576;
  const isTablet = window.innerWidth < 768;

  let html = `
    <div class="card mt-4">
      <div class="card-header bg-secondary text-white d-flex justify-content-between align-items-center mb-1">
        <h5 class="mb-0"><i class="fas fa-chart-pie me-2"></i>Rekapitulasi Total Per Kegiatan</h5>
      
      </div>
      <div class="card-body p-0">
        <div class="table-responsive" style="overflow-x: auto; -webkit-overflow-scrolling: touch;">
          <table class="table table-striped table-hover mb-0" style="min-width: ${isMobile ? "650px" : "auto"};">
            <thead class="table-dark">
              <tr>
                <th style="position: sticky; left: 0; background: #212529; z-index: 2; min-width: 20px;">No</th>
                <th style="position: sticky; left: 16px; background: #212529; z-index: 2; width: ${isMobile ? "30px" : "auto"};">Kegiatan</th>
                ${
                  !isMobile
                    ? `
                <th>Total Hadir</th>
                <th>Total Alpa</th>
                <th>Total Izin</th>
                <th>Total Sakit</th>
                <th>Total Terlambat</th>
                `
                    : `
                <th>Hadir / Alpa / Izin</th>
                `
                }
                <th>Jml Bulan</th>
                <th style="min-width: ${isMobile ? "120px" : "auto"};">Rata-rata %</th>
                ${!isMobile ? `<th>Detail</th>` : ""}
              </tr>
            </thead>
            <tbody>
  `;

  totals.forEach((item, index) => {
    let activeDays = null;
    if (hariAktif) {
      const months = activities
        .filter((a) => a.activity === item.activity)
        .map((a) => a.month);

      const activeDaysList = months
        .map((month) => getActiveDaysForMonth(hariAktif, month))
        .filter((days) => days !== null);

      if (activeDaysList.length > 0) {
        activeDays = Math.round(
          activeDaysList.reduce((a, b) => a + b, 0) / activeDaysList.length,
        );
      }
    }

    let percentage;
    if (activeDays !== null && activeDays > 0) {
      percentage = calculatePercentageWithActiveDays(
        item.present,
        item.absent,
        item.permission,
        item.sick,
        item.late,
        activeDays,
        item.activity,
      );
    } else {
      percentage = calculatePercentage(
        item.present,
        item.absent,
        item.permission,
        item.sick,
        item.late,
      );
    }

    const icon = getActivityIcon(item.activity);
    const badgeColor = getActivityBadgeColor(item.activity);
    const hoursInfo = getActivityHoursInfo(item.activity);
    const detailHtml = renderAttendanceDetails(item.details);

    // Tentukan warna progress bar
    const progressColor =
      percentage >= 80
        ? "bg-success"
        : percentage >= 60
          ? "bg-warning"
          : "bg-danger";

    html += `
      <tr>
        <td style="position: sticky; left: 0; background: white; z-index: 1; font-weight: bold;">${index + 1}</td>
        <td style="position: sticky; left: 10px; background: white; z-index: 1;">
          <span class="badge ${badgeColor} badge-activity" style="font-size: ${isMobile ? "0.4rem" : "0.85rem"};">
            <i class="fas ${icon} me-1"></i>${isMobile ? item.activity.substring(0, 15) + (item.activity.length > 15 ? "..." : "") : item.activity}
          </span>
          <br>
          <small class="text-muted" style="font-size: ${isMobile ? "0.55rem" : "0.75rem"};">${hoursInfo}</small>
          ${activeDays ? `<small class="text-primary" style="font-size: ${isMobile ? "0.5rem" : "0.7rem"};">Hari aktif: ${activeDays}</small>` : ""}
        </td>
        ${
          !isMobile
            ? `
        <td>
          <strong>${item.present}</strong> jam<br>
          <small class="text-muted" style="font-size: 0.7rem;">${formatDays(item.presentDays)}</small>
        </td>
        <td>
          ${item.absent} jam<br>
          <small class="text-muted" style="font-size: 0.7rem;">${formatDays(item.absentDays)}</small>
        </td>
        <td>
          ${item.permission} jam<br>
          <small class="text-muted" style="font-size: 0.7rem;">${formatDays(item.permissionDays)}</small>
        </td>
        <td>
          ${item.sick} jam<br>
          <small class="text-muted" style="font-size: 0.7rem;">${formatDays(item.sickDays)}</small>
        </td>
        <td>
          ${item.late} jam<br>
          <small class="text-muted" style="font-size: 0.7rem;">${formatDays(item.lateDays)}</small>
        </td>
        `
            : `
        <td style="font-size: 0.7rem;">
          <div><span class="text-success">✔ ${item.present}</span> / <span class="text-danger">✘ ${item.absent}</span> / <span class="text-warning">📝 ${item.permission}</span></div>
          <small class="text-muted">Sakit: ${item.sick} | Telat: ${item.late}</small>
        </td>
        `
        }
        <td>${item.count}</td>
        <td>
          <div class="d-flex align-items-center" style="flex-direction: ${isMobile ? "column" : "row"}; gap: ${isMobile ? "2px" : "0"};">
            <span class="fw-bold me-${isMobile ? "0" : "2"}" style="font-size: ${isMobile ? "0.7rem" : "1rem"};">${percentage}%</span>
            <div class="progress" style="height: ${isMobile ? "6px" : "10px"}; width: ${isMobile ? "100%" : "60px"};">
              <div class="progress-bar ${progressColor}" 
                   role="progressbar" style="width: ${percentage}%;" 
                   aria-valuenow="${percentage}" aria-valuemin="0" aria-valuemax="100"></div>
            </div>
          </div>
        </td>
        ${
          !isMobile
            ? `
        <td style="max-width: 150px;">
          ${detailHtml}
        </td>
        `
            : ""
        }
      </tr>
    `;
  });

  html += `
            </tbody>
          </table>
        </div>
        ${
          isMobile
            ? `
       
        `
            : ""
        }
      </div>
    </div>
  `;

  container.innerHTML = html;
}

// Fungsi menampilkan data per bulan
function displayMonthlyData(activities, activeMonth = null, hariAktif = null) {
  const monthlyDataContainer = document.getElementById("monthlyData");
  monthlyDataContainer.innerHTML = "";

  let filteredActivities = activities;
  if (activeMonth) {
    filteredActivities = activities.filter((a) => a.month === activeMonth);
  }

  if (filteredActivities.length === 0) {
    monthlyDataContainer.innerHTML = `
      <div class="alert alert-info">Tidak ada data kegiatan untuk bulan ini</div>
    `;
    return;
  }

  let activeDaysForMonth = null;
  if (hariAktif && activeMonth) {
    activeDaysForMonth = getActiveDaysForMonth(hariAktif, activeMonth);
  }

  if (activeDaysForMonth !== null) {
    const infoHtml = `
      <div class="alert alert-info mb-3">
        <i class="fas fa-calendar-alt me-2"></i>
        <strong>Hari Aktif ${activeMonth}:</strong> ${activeDaysForMonth} hari
        <small class="text-muted ms-2">(1 hari = 10 jam: 8j KBM + 1j PKB + 1j Sholat)</small>
      </div>
    `;
    monthlyDataContainer.innerHTML += infoHtml;
  }

  filteredActivities.forEach((activity) => {
    let percentage;
    if (activeDaysForMonth !== null && activeDaysForMonth > 0) {
      percentage = calculatePercentageWithActiveDays(
        activity.present,
        activity.absent,
        activity.permission,
        activity.sick,
        activity.late || 0,
        activeDaysForMonth,
        activity.activity,
      );
    } else {
      percentage = calculatePercentage(
        activity.present,
        activity.absent,
        activity.permission,
        activity.sick,
        activity.late || 0,
      );
    }

    const totalEffective =
      activity.present + activity.absent + activity.permission;
    const icon = getActivityIcon(activity.activity);
    const badgeColor = getActivityBadgeColor(activity.activity);
    const hoursInfo = getActivityHoursInfo(activity.activity);

    let statusText, statusIcon, statusClass;
    if (percentage >= 80) {
      statusText = "Kehadiran Baik";
      statusIcon = "✅";
      statusClass = "text-success";
    } else if (percentage >= 60) {
      statusText = "Perlu Ditingkatkan";
      statusIcon = "⚠️";
      statusClass = "text-warning";
    } else {
      statusText = "Perlu Perhatian Khusus";
      statusIcon = "❌";
      statusClass = "text-danger";
    }

    const presentDisplay = formatDays(activity.presentDays);
    const absentDisplay = formatDays(activity.absentDays);
    const permissionDisplay = formatDays(activity.permissionDays);
    const sickDisplay = formatDays(activity.sickDays);
    const lateDisplay = formatDays(activity.lateDays);
    const detailHtml = renderAttendanceDetails(activity.detail);

    const activityCard = `
      <div class="card month-card fade-in mb-3">
        <div class="card-header month-card-header d-flex justify-content-between align-items-center">
          <div>
            <span class="badge badge-month me-2">${activity.month}</span>
            <span class="badge ${badgeColor} badge-activity">
              <i class="fas ${icon} me-1"></i>${activity.activity}
            </span>
            <span class="badge badge-light ms-2" style="font-size: 0.7rem;">
              <i class="fas fa-clock me-1"></i>${hoursInfo}
            </span>
            ${
              activeDaysForMonth
                ? `<span class="badge badge-info ms-2" style="font-size: 0.7rem;">
              <i class="fas fa-calendar me-1"></i>Hari aktif: ${activeDaysForMonth}
            </span>`
                : ""
            }
          </div>
          <div>
            <span class="text-muted me-3">Persentase: ${percentage}%</span>
            <span class="${statusClass}">${statusIcon} ${statusText}</span>
          </div>
        </div>
        <div class="card-body">
          <div class="row">
            <div class="col-md-6">
              <table class="table table-borderless">
                <tr>
                  <th width="60%"><i class="fas fa-check-circle text-success me-1"></i>Kehadiran:</th>
                  <td><strong>${activity.present} jam</strong> <span class="text-muted"><small>- ${presentDisplay}</small></span></td>
                </tr>
                <tr>
                  <th><i class="fas fa-times-circle text-danger me-1"></i>Alpa:</th>
                  <td>${activity.absent} jam <span class="text-muted"><small>- ${absentDisplay}</small></span> </td>
                </tr>
                <tr>
                  <th><i class="fas fa-clock text-secondary me-1"></i>Terlambat:</th>
                  <td>${activity.late || 0} jam <span class="text-muted"><small>- ${lateDisplay}</small></span> </td>
                </tr>
              </table>
            </div>
            <div class="col-md-6">
              <table class="table table-borderless">
                <tr>
                  <th width="60%"><i class="fas fa-file-alt text-warning me-1"></i>Izin:</th>
                  <td>${activity.permission} jam <span class="text-muted"><small>- ${permissionDisplay}</small></span> </td>
                </tr>
                <tr>
                  <th><i class="fas fa-ambulance text-info me-1"></i>Sakit:</th>
                  <td>${activity.sick} jam <span class="text-muted"><small>- ${sickDisplay}</small></span> </td>
                </tr>
                <tr>
                  <th><i class="fas fa-calculator text-primary me-1"></i>Total Efektif:</th>
                  <td><strong>${totalEffective}</strong> jam</td>
                </tr>
              </table>
            </div>
          </div>
          
          ${
            activity.detail && activity.detail.length > 0
              ? `
          <div class="row mt-3">
            <div class="col-12">
              <div class="card bg-light">
                <div class="card-body">
                  <h6><i class="fas fa-list me-2"></i>Detail Ketidakhadiran</h6>
                  ${detailHtml}
                </div>
              </div>
            </div>
          </div>
          `
              : ""
          }
          
          <div class="row mt-4">
            <div class="col-md-6">
              <div class="card bg-light">
                <div class="card-body text-center">
                  <h5>Persentase Kehadiran</h5>
                  <div class="percentage-display">${percentage}%</div>
                  <div class="progress mt-3" style="height: 20px;">
                    <div class="progress-bar ${
                      percentage >= 80
                        ? "bg-success"
                        : percentage >= 60
                          ? "bg-warning"
                          : "bg-danger"
                    }" 
                         role="progressbar" style="width: ${percentage}%;" 
                         aria-valuenow="${percentage}" aria-valuemin="0" aria-valuemax="100"></div>
                  </div>
                  <small class="mt-2 d-block">
                    <span class="${statusClass}">${statusIcon} ${statusText}</span>
                  </small>
                  <small class="text-muted d-block">
                    * ${hoursInfo}
                    ${activeDaysForMonth ? `| Hari aktif: ${activeDaysForMonth} hari` : ""}
                  </small>
                </div>
              </div>
            </div>
            <div class="col-md-6">
              <div class="card bg-light">
                <div class="card-body">
                  <h5 class="text-center">Statistik Kehadiran</h5>
                  <div class="attendance-chart">
                    ${createAttendanceChart(
                      activity.present,
                      activity.absent,
                      activity.permission,
                      activity.sick,
                      activity.late || 0,
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    monthlyDataContainer.innerHTML += activityCard;
  });

  displayTotalPerActivity(filteredActivities, hariAktif);
}

// Fungsi membuat pemilih bulan
function createMonthSelector(activities, activeMonth = null, hariAktif = null) {
  const monthSelector = document.getElementById("monthSelector");
  monthSelector.innerHTML = "";

  const allButton = document.createElement("button");
  allButton.type = "button";
  allButton.className = `month-btn ${!activeMonth ? "active" : ""}`;
  allButton.textContent = "📋 Semua Kegiatan";
  allButton.addEventListener("click", () => {
    document.querySelectorAll(".month-btn").forEach((btn) => {
      btn.classList.remove("active");
    });
    allButton.classList.add("active");
    displayMonthlyData(activities, null, hariAktif);
  });
  monthSelector.appendChild(allButton);

  const uniqueMonths = getUniqueMonths(activities);
  uniqueMonths.forEach((month) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `month-btn ${month === activeMonth ? "active" : ""}`;

    let monthLabel = `📅 ${month}`;
    if (hariAktif) {
      const activeDays = getActiveDaysForMonth(hariAktif, month);
      // if (activeDays !== null) {
      //   monthLabel += ` (${activeDays} hari)`;
      // }
    }
    button.textContent = monthLabel;

    button.addEventListener("click", () => {
      document.querySelectorAll(".month-btn").forEach((btn) => {
        btn.classList.remove("active");
      });
      button.classList.add("active");
      displayMonthlyData(activities, month, hariAktif);
    });
    monthSelector.appendChild(button);
  });
}

// Fungsi reset pencarian
function resetSearch() {
  const resultBox = document.querySelector(".result-box");
  const studentId = document.getElementById("studentId");

  if (resultBox) resultBox.style.display = "none";
  if (studentId) {
    studentId.value = "";
    studentId.focus();
  }
}

// Event listener untuk form pencarian
document.addEventListener("DOMContentLoaded", function () {
  const searchForm = document.getElementById("searchForm");
  const studentIdInput = document.getElementById("studentId");

  if (studentIdInput) {
    studentIdInput.focus();
  }

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      resetSearch();
    }
  });

  // Detect resize untuk refresh tabel
  let resizeTimeout;
  window.addEventListener("resize", function () {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(function () {
      const resultBox = document.querySelector(".result-box");
      if (resultBox && resultBox.style.display === "block") {
        const studentId = studentIdInput ? studentIdInput.value.trim() : "";
        if (studentId) {
          searchForm.dispatchEvent(new Event("submit"));
        }
      }
    }, 500);
  });

  if (searchForm) {
    searchForm.addEventListener("submit", async function (e) {
      e.preventDefault();

      const studentId = studentIdInput ? studentIdInput.value.trim() : "";

      if (!studentId) {
        alert("Silakan masukkan NIUP santri");
        return;
      }

      console.log("Mencari siswa dengan ID:", studentId);

      const student = await searchStudent(studentId);

      if (student) {
        console.log("Data ditemukan:", student);

        const resultId = document.getElementById("resultId");
        const resultName = document.getElementById("resultName");
        const resultClass = document.getElementById("resultClass");
        const resultYear = document.getElementById("resultYear");
        const resultStatus = document.getElementById("resultStatus");

        if (resultId) resultId.textContent = student.id;
        if (resultName) resultName.textContent = student.name;
        if (resultClass) resultClass.textContent = student.class;
        if (resultYear) resultYear.textContent = student.year;
        if (resultStatus) resultStatus.textContent = student.status;

        const totals = calculateTotalStats(
          student.activities,
          student.hari_aktif || null,
        );

        displayTotalStatistics(totals, student.hari_aktif || null);

        createMonthSelector(
          student.activities,
          null,
          student.hari_aktif || null,
        );

        displayMonthlyData(
          student.activities,
          null,
          student.hari_aktif || null,
        );

        const resultBox = document.querySelector(".result-box");
        if (resultBox) {
          resultBox.style.display = "block";
          resultBox.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      } else {
        alert(
          "Data siswa tidak ditemukan. Silakan periksa kembali NIUP yang dimasukkan.\n\n" +
            "Data dummy yang tersedia:\n" +
            DUMMY_DATA.map((s) => `- ${s.id}: ${s.name}`).join("\n"),
        );
      }
    });
  } else {
    console.error("Form #searchForm tidak ditemukan!");
  }
});
