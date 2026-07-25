// Konfigurasi Google Sheets - GANTI DENGAN DATA ANDA
const SPREADSHEET_ID = "1PlYtWISua88svLpf5HqVNCHxo89zrNiikrT6bSiDAfk"; // Ganti dengan ID spreadsheet Anda
const API_KEY = "AIzaSyDEif5uDoVmYUxrthp8AT1v3aurWdJgLfo"; // Ganti dengan API key Anda

// Fungsi untuk mengkonversi jam ke hari berdasarkan jenis kegiatan
function convertToDays(hours, activityType) {
  let hoursPerDay = 1; // default

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

// Fungsi untuk format tampilan hari dengan 1 desimal
function formatDays(days) {
  if (days === 0) return "0 hari";
  if (Number.isInteger(days)) {
    return days + " hari";
  }
  return days.toFixed(1) + " hari";
}

// Data dummy untuk development (jika tidak menggunakan Google Sheets)
const DUMMY_DATA = [
  {
    id: "12520321230",
    name: "Sulthon Muzakky Amrullah Al Ikhwan",
    class: "VII AGAMA 1",
    year: "2025",
    status: "Aktif",
    activities: [
      {
        month: "Oktober",
        activity: "KBM",
        present: 200,
        absent: 0,
        permission: 0,
        sick: 0,
        late: 20,
      },
      {
        month: "Oktober",
        activity: "Pembiasaan Karakter Baik",
        present: 30,
        absent: 0,
        permission: 0,
        sick: 0,
        late: 2,
      },
      {
        month: "Oktober",
        activity: "Sholat Berjama'ah",
        present: 40,
        absent: 0,
        permission: 0,
        sick: 0,
        late: 5,
      },
    ],
  },
  {
    id: "2023002",
    name: "Siti Rahayu",
    class: "X IPA 2",
    year: "2023/2024",
    status: "Aktif",
    activities: [
      {
        month: "Januari",
        activity: "KBM",
        present: 19,
        absent: 1,
        permission: 1,
        sick: 0,
        late: 1,
      },
      {
        month: "Januari",
        activity: "Pembiasaan Karakter Baik",
        present: 14,
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
        present: 20,
        absent: 0,
        permission: 0,
        sick: 0,
        late: 0,
      },
      {
        month: "Februari",
        activity: "Pembiasaan Karakter Baik",
        present: 18,
        absent: 0,
        permission: 1,
        sick: 0,
        late: 0,
      },
      {
        month: "Februari",
        activity: "Sholat Berjama'ah",
        present: 22,
        absent: 0,
        permission: 0,
        sick: 0,
        late: 0,
      },
    ],
  },
];

// Fungsi untuk mengambil data dari Google Sheets
async function fetchSheetData(range) {
  try {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${range}?key=${API_KEY}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.values;
  } catch (error) {
    console.error("Error fetching data:", error);
    return null;
  }
}

// Fungsi untuk mencari data siswa dari 1 sheet
async function searchStudent(studentId) {
  // Tampilkan loading spinner
  document.getElementById("loadingSpinner").style.display = "block";
  document.querySelector(".result-box").style.display = "none";

  try {
    // Coba ambil data dari Google Sheets
    const allData = await fetchSheetData("A2:L");

    let student;

    if (allData) {
      // Filter data untuk siswa dengan NIUP yang dicari
      const studentRecords = allData.filter((row) => row[0] === studentId);

      if (studentRecords.length === 0) {
        document.getElementById("loadingSpinner").style.display = "none";
        return null;
      }

      // Ambil data dasar siswa dari record pertama
      const firstRecord = studentRecords[0];
      student = {
        id: firstRecord[0],
        name: firstRecord[1],
        class: firstRecord[2],
        year: firstRecord[4],
        status: firstRecord[5],
        activities: [],
      };

      // Proses data kegiatan dengan konversi nama kegiatan
      studentRecords.forEach((record) => {
        let activityName = record[3]; // kolom kegiatan

        // Konversi nama kegiatan jika diperlukan
        if (activityName === "pkb" || activityName === "PKB") {
          activityName = "Pembiasaan Karakter Baik";
        } else if (activityName === "sholat" || activityName === "Sholat") {
          activityName = "Sholat Berjama'ah";
        }

        const presentHours = parseInt(record[7]) || 0;
        const sickHours = parseInt(record[8]) || 0;
        const permissionHours = parseInt(record[9]) || 0;
        const absentHours = parseInt(record[10]) || 0;
        const lateHours = parseInt(record[11]) || 0;

        student.activities.push({
          month: record[6],
          activity: activityName,
          present: presentHours,
          sick: sickHours,
          permission: permissionHours,
          absent: absentHours,
          late: lateHours,
          // Konversi ke hari
          presentDays: convertToDays(presentHours, activityName),
          sickDays: convertToDays(sickHours, activityName),
          permissionDays: convertToDays(permissionHours, activityName),
          absentDays: convertToDays(absentHours, activityName),
          lateDays: convertToDays(lateHours, activityName),
        });
      });
    } else {
      // Gunakan data dummy
      student = DUMMY_DATA.find((s) => s.id === studentId);
      if (!student) {
        document.getElementById("loadingSpinner").style.display = "none";
        return null;
      }
    }

    // Kelompokkan aktivitas berdasarkan bulan
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

    // Urutkan aktivitas berdasarkan bulan
    student.activities.sort((a, b) => {
      return monthOrder.indexOf(a.month) - monthOrder.indexOf(b.month);
    });

    document.getElementById("loadingSpinner").style.display = "none";
    return student;
  } catch (error) {
    console.error("Error processing student data:", error);
    document.getElementById("loadingSpinner").style.display = "none";
    return null;
  }
}

// Fungsi untuk menghitung persentase kehadiran
// HANYA ALPA DAN IZIN YANG MENGURANGI PERSENTASE
function calculatePercentage(present, absent, permission, sick, late) {
  // Total pertemuan = hadir + alpa + izin (sakit dan terlambat tidak dihitung)
  const total = present + absent + permission;
  return total > 0 ? Math.round((present / total) * 100) : 0;
}

// Fungsi untuk membuat chart kehadiran dengan angka dan persentase
function createAttendanceChart(present, absent, permission, sick, late) {
  // Untuk chart, total semua termasuk sakit dan terlambat
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
      <div class="chart-label">Hadir</div>
    </div>
    <div class="chart-bar bg-danger" style="height: ${(absentPercent / 100) * maxHeight}%" 
         data-tooltip="Alpa: ${absent} jam (${Math.round(absentPercent)}%)">
      <div class="chart-value">${formatValue(absent, absentPercent)}</div>
      <div class="chart-label">Alpa</div>
    </div>
    <div class="chart-bar bg-warning" style="height: ${(permissionPercent / 100) * maxHeight}%" 
         data-tooltip="Izin: ${permission} jam (${Math.round(permissionPercent)}%)">
      <div class="chart-value">${formatValue(permission, permissionPercent)}</div>
      <div class="chart-label">Izin</div>
    </div>
    <div class="chart-bar bg-info" style="height: ${(sickPercent / 100) * maxHeight}%" 
         data-tooltip="Sakit: ${sick} jam (${Math.round(sickPercent)}%)">
      <div class="chart-value">${formatValue(sick, sickPercent)}</div>
      <div class="chart-label">Sakit</div>
    </div>
    <div class="chart-bar bg-secondary" style="height: ${(latePercent / 100) * maxHeight}%" 
         data-tooltip="Terlambat: ${late} jam (${Math.round(latePercent)}%)">
      <div class="chart-value">${formatValue(late, latePercent)}</div>
      <div class="chart-label">Terlambat</div>
    </div>
  `;
}

// Fungsi untuk menghitung total statistik
function calculateTotalStats(activities) {
  return activities.reduce(
    (totals, activity) => {
      totals.present += activity.present;
      totals.absent += activity.absent;
      totals.permission += activity.permission;
      totals.sick += activity.sick;
      totals.late += activity.late || 0;
      // Total hari
      totals.presentDays += activity.presentDays || 0;
      totals.absentDays += activity.absentDays || 0;
      totals.permissionDays += activity.permissionDays || 0;
      totals.sickDays += activity.sickDays || 0;
      totals.lateDays += activity.lateDays || 0;
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
    },
  );
}

// FUNGSI BARU: Menghitung total per kegiatan
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
  });

  return Object.values(totals);
}

// Fungsi untuk mendapatkan daftar bulan unik
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

// Fungsi untuk mendapatkan ikon kegiatan
function getActivityIcon(activity) {
  const lowerActivity = activity.toLowerCase();
  if (lowerActivity.includes("kbm")) return "fa-book";
  if (lowerActivity.includes("pembiasaan") || lowerActivity.includes("pkb"))
    return "fa-hand-holding-heart";
  if (lowerActivity.includes("sholat")) return "fa-mosque";
  if (lowerActivity.includes("ekstra")) return "fa-futbol";
  return "fa-tasks";
}

// Fungsi untuk mendapatkan warna badge kegiatan
function getActivityBadgeColor(activity) {
  const lowerActivity = activity.toLowerCase();
  if (lowerActivity.includes("kbm")) return "badge-primary";
  if (lowerActivity.includes("pembiasaan") || lowerActivity.includes("pkb"))
    return "badge-success";
  if (lowerActivity.includes("sholat")) return "badge-info";
  if (lowerActivity.includes("ekstra")) return "badge-warning";
  return "badge-secondary";
}

// Fungsi untuk mendapatkan info konversi per kegiatan
function getActivityHoursInfo(activity) {
  const lowerActivity = activity.toLowerCase();
  if (lowerActivity.includes("kbm")) {
    return "1 hari = 8 jam";
  } else if (
    lowerActivity.includes("pembiasaan") ||
    lowerActivity.includes("pkb") ||
    lowerActivity.includes("sholat")
  ) {
    return "1 hari = 1 jam";
  }
  return "";
}

// FUNGSI BARU: Menampilkan total per kegiatan
function displayTotalPerActivity(activities) {
  const container = document.getElementById("totalPerActivity");
  container.innerHTML = "";

  const totals = calculateTotalPerActivity(activities);

  if (totals.length === 0) {
    container.innerHTML =
      '<div class="alert alert-info">Tidak ada data kegiatan</div>';
    return;
  }

  let html = `
    <div class="card mt-4">
      <div class="card-header bg-secondary text-white">
        <h5 class="mb-0"><i class="fas fa-chart-pie me-2"></i>Rekapitulasi Total Per Kegiatan</h5>
      </div>
      <div class="card-body">
        <div class="table-responsive">
          <table class="table table-striped table-hover">
            <thead class="table-dark">
              <tr>
                <th>No</th>
                <th>Kegiatan</th>
                <th>Total Hadir</th>
                <th>Total Alpa</th>
                <th>Total Izin</th>
                <th>Total Sakit</th>
                <th>Total Terlambat</th>
                <th>Jumlah Bulan</th>
                <th>Rata-rata Persentase</th>
              </tr>
            </thead>
            <tbody>
  `;

  totals.forEach((item, index) => {
    const percentage = calculatePercentage(
      item.present,
      item.absent,
      item.permission,
      item.sick,
      item.late,
    );

    const icon = getActivityIcon(item.activity);
    const badgeColor = getActivityBadgeColor(item.activity);
    const hoursInfo = getActivityHoursInfo(item.activity);

    html += `
      <tr>
        <td>${index + 1}</td>
        <td>
          <span class="badge ${badgeColor} badge-activity">
            <i class="fas ${icon} me-1"></i>${item.activity}
          </span>
          <br>
          <small class="text-muted">${hoursInfo}</small>
        </td>
        <td>
          <strong>${item.present}</strong> jam<br>
          <small class="text-muted">(${formatDays(item.presentDays)})</small>
        </td>
        <td>
          ${item.absent} jam<br>
          <small class="text-muted">(${formatDays(item.absentDays)})</small>
        </td>
        <td>
          ${item.permission} jam<br>
          <small class="text-muted">(${formatDays(item.permissionDays)})</small>
        </td>
        <td>
          ${item.sick} jam<br>
          <small class="text-muted">(${formatDays(item.sickDays)})</small>
        </td>
        <td>
          ${item.late} jam<br>
          <small class="text-muted">(${formatDays(item.lateDays)})</small>
        </td>
        <td>${item.count}</td>
        <td>
          <div class="d-flex align-items-center">
            <span class="fw-bold me-2">${percentage}%</span>
            <div class="progress flex-grow-1" style="height: 10px; width: 60px;">
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
          </div>
        </td>
      </tr>
    `;
  });

  html += `
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;

  container.innerHTML = html;
}

// Fungsi untuk menampilkan data kegiatan per bulan
function displayMonthlyData(activities, activeMonth = null) {
  const monthlyDataContainer = document.getElementById("monthlyData");
  monthlyDataContainer.innerHTML = "";

  // Filter kegiatan berdasarkan bulan yang dipilih
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

  // Tampilkan setiap kegiatan
  filteredActivities.forEach((activity, index) => {
    const percentage = calculatePercentage(
      activity.present,
      activity.absent,
      activity.permission,
      activity.sick,
      activity.late || 0,
    );

    // Hitung total pertemuan efektif untuk info
    const totalEffective =
      activity.present + activity.absent + activity.permission;

    const icon = getActivityIcon(activity.activity);
    const badgeColor = getActivityBadgeColor(activity.activity);
    const hoursInfo = getActivityHoursInfo(activity.activity);

    // Tentukan status berdasarkan persentase
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

    // Format tampilan hari
    const presentDisplay = formatDays(activity.presentDays);
    const absentDisplay = formatDays(activity.absentDays);
    const permissionDisplay = formatDays(activity.permissionDays);
    const sickDisplay = formatDays(activity.sickDays);
    const lateDisplay = formatDays(activity.lateDays);

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
                  <td><strong>${activity.present} jam</strong> <span class="text-muted">(${presentDisplay})</span></td>
                </tr>
                <tr>
                  <th><i class="fas fa-times-circle text-danger me-1"></i>Alpa:</th>
                  <td>${activity.absent} jam <span class="text-muted">(${absentDisplay})</span> </td>
                </tr>
                <tr>
                  <th><i class="fas fa-clock text-secondary me-1"></i>Terlambat:</th>
                  <td>${activity.late || 0} jam <span class="text-muted">(${lateDisplay})</span> </td>
                </tr>
              </table>
            </div>
            <div class="col-md-6">
              <table class="table table-borderless">
                <tr>
                  <th width="60%"><i class="fas fa-file-alt text-warning me-1"></i>Izin:</th>
                  <td>${activity.permission} jam <span class="text-muted">(${permissionDisplay})</span> </td>
                </tr>
                <tr>
                  <th><i class="fas fa-ambulance text-info me-1"></i>Sakit:</th>
                  <td>${activity.sick} jam <span class="text-muted">(${sickDisplay})</span> </td>
                </tr>
                <tr>
                  <th><i class="fas fa-calculator text-primary me-1"></i>Total Efektif:</th>
                  <td><strong>${totalEffective}</strong> jam</td>
                </tr>
              </table>
            </div>
          </div>
          
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
                  <div class="row mt-2 text-center mb-2">
                    <div class="col-6">
                      <small class="text-danger"></small>
                    </div>
                    <div class="col-6">
                      <small class="text-success"></small>
                    </div>
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

  // TAMPILKAN TOTAL PER KEGIATAN DI BAWAH DATA BULANAN
  displayTotalPerActivity(filteredActivities);
}

// Fungsi untuk membuat tombol pemilih bulan
function createMonthSelector(activities, activeMonth = null) {
  const monthSelector = document.getElementById("monthSelector");
  monthSelector.innerHTML = "";

  // Tambahkan tombol "Semua"
  const allButton = document.createElement("button");
  allButton.type = "button";
  allButton.className = `month-btn ${!activeMonth ? "active" : ""}`;
  allButton.textContent = "📋 Semua Kegiatan";
  allButton.addEventListener("click", () => {
    document.querySelectorAll(".month-btn").forEach((btn) => {
      btn.classList.remove("active");
    });
    allButton.classList.add("active");
    displayMonthlyData(activities, null);
  });
  monthSelector.appendChild(allButton);

  // Tambahkan tombol per bulan unik
  const uniqueMonths = getUniqueMonths(activities);
  uniqueMonths.forEach((month) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `month-btn ${month === activeMonth ? "active" : ""}`;
    button.textContent = `📅 ${month}`;
    button.addEventListener("click", () => {
      document.querySelectorAll(".month-btn").forEach((btn) => {
        btn.classList.remove("active");
      });
      button.classList.add("active");
      displayMonthlyData(activities, month);
    });
    monthSelector.appendChild(button);
  });
}

// Fungsi untuk reset pencarian
function resetSearch() {
  document.querySelector(".result-box").style.display = "none";
  document.getElementById("studentId").value = "";
  document.getElementById("studentId").focus();
}

// Event listener untuk form pencarian
document
  .getElementById("searchForm")
  .addEventListener("submit", async function (e) {
    e.preventDefault();

    const studentId = document.getElementById("studentId").value.trim();

    if (!studentId) {
      alert("Silakan masukkan NIUP santri");
      return;
    }

    const student = await searchStudent(studentId);

    if (student) {
      // Menampilkan data siswa
      document.getElementById("resultId").textContent = student.id;
      document.getElementById("resultName").textContent = student.name;
      document.getElementById("resultClass").textContent = student.class;
      document.getElementById("resultYear").textContent = student.year;
      document.getElementById("resultStatus").textContent = student.status;

      // Hitung dan tampilkan total statistik
      const totals = calculateTotalStats(student.activities);
      document.getElementById("totalPresent").textContent =
        totals.present + " jam (" + formatDays(totals.presentDays) + ")";
      document.getElementById("totalAbsent").textContent =
        totals.absent + " jam (" + formatDays(totals.absentDays) + ")";
      document.getElementById("totalPermission").textContent =
        totals.permission + " jam (" + formatDays(totals.permissionDays) + ")";
      document.getElementById("totalSick").textContent =
        totals.sick + " jam (" + formatDays(totals.sickDays) + ")";
      document.getElementById("totalLate").textContent =
        totals.late + " jam (" + formatDays(totals.lateDays) + ")";

      // Buat pemilih bulan
      createMonthSelector(student.activities);

      // Tampilkan semua kegiatan
      displayMonthlyData(student.activities);

      // Menampilkan hasil pencarian
      document.querySelector(".result-box").style.display = "block";

      // Scroll ke hasil
      document
        .querySelector(".result-box")
        .scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      alert(
        "Data siswa tidak ditemukan. Silakan periksa kembali NIUP yang dimasukkan.",
      );
    }
  });

// Focus ke input field saat halaman dimuat
document.addEventListener("DOMContentLoaded", function () {
  document.getElementById("studentId").focus();

  // Tambahkan event listener untuk tutup dengan ESC
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      resetSearch();
    }
  });
});
