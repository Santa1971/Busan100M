/**
 * Busan Galmaetgil 100M - Google Apps Script Backend
 * Deploy as Web App for API access
 */

// ============================================
// CONFIGURATION
// ============================================
const SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID'; // Replace with actual ID
const SHEETS = {
  CONFIG: 'Config',
  NOTICES: 'Notices',
  CHECKPOINTS: 'Checkpoints',
  SCHEDULE: 'Schedule',
  REGISTRATIONS: 'Registrations',
  RESULTS: 'Results',
  CARPOOL: 'Carpool',
  EMERGENCY: 'Emergency'
};

// ============================================
// UTILITY FUNCTIONS
// ============================================
function getSheet(name) {
  return SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(name);
}

function sheetToJSON(sheet) {
  const data = sheet.getDataRange().getValues();
  if (data.length < 2) return [];
  const headers = data[0];
  return data.slice(1).map(row => {
    const obj = {};
    headers.forEach((h, i) => obj[h] = row[i]);
    return obj;
  });
}

function sanitize(str) {
  if (typeof str !== 'string') return str;
  return str.replace(/[<>\"\'&]/g, c => ({
    '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;', '&': '&amp;'
  }[c]));
}

function jsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

// ============================================
// GET HANDLERS
// ============================================
function doGet(e) {
  const action = e.parameter.action;
  
  try {
    switch (action) {
      case 'getConfig':
        return getConfig();
      case 'getNotices':
        return getNotices();
      case 'getCheckpoints':
        return getCheckpoints();
      case 'getSchedule':
        return getSchedule();
      case 'getCarpool':
        return getCarpool();
      case 'checkStatus':
        return checkStatus(e.parameter.name, e.parameter.phone4);
      case 'getResult':
        return getResult(e.parameter.name, e.parameter.phone4);
      default:
        return jsonResponse({ error: 'Invalid action' });
    }
  } catch (err) {
    return jsonResponse({ error: err.message });
  }
}

function getConfig() {
  const sheet = getSheet(SHEETS.CONFIG);
  const data = sheet.getDataRange().getValues();
  const config = {};
  data.slice(1).forEach(row => config[row[0]] = row[1]);
  return jsonResponse(config);
}

function getNotices() {
  const data = sheetToJSON(getSheet(SHEETS.NOTICES));
  return jsonResponse(data);
}

function getCheckpoints() {
  const data = sheetToJSON(getSheet(SHEETS.CHECKPOINTS));
  return jsonResponse(data);
}

function getSchedule() {
  const data = sheetToJSON(getSheet(SHEETS.SCHEDULE));
  return jsonResponse(data);
}

function getCarpool() {
  const data = sheetToJSON(getSheet(SHEETS.CARPOOL));
  // Mask phone numbers for privacy
  const masked = data.map(item => ({
    ...item,
    contact: item.contact ? item.contact.replace(/(\d{3})-?\d{4}-?(\d{4})/, '$1-****-$2') : ''
  }));
  return jsonResponse(masked);
}

// Secure: Requires name + phone last 4 digits
function checkStatus(name, phone4) {
  if (!name || !phone4) {
    return jsonResponse({ error: 'Name and phone4 required' });
  }
  
  const data = sheetToJSON(getSheet(SHEETS.REGISTRATIONS));
  const match = data.find(r => 
    r.name === name && r.phone && r.phone.slice(-4) === phone4
  );
  
  if (match) {
    return jsonResponse({
      found: true,
      status: match.status,
      course: match.course
    });
  }
  return jsonResponse({ found: false });
}

// Secure: Requires name + phone last 4 digits
function getResult(name, phone4) {
  if (!name || !phone4) {
    return jsonResponse({ error: 'Name and phone4 required' });
  }
  
  const data = sheetToJSON(getSheet(SHEETS.RESULTS));
  const match = data.find(r => r.name === name && r.phone_last4 === phone4);
  
  if (match) {
    return jsonResponse({
      bib: match.bib,
      name: match.name,
      course: match.course,
      time: match.time,
      rank: match.rank
    });
  }
  return jsonResponse(null);
}

// ============================================
// POST HANDLERS
// ============================================
function doPost(e) {
  const action = e.parameter.action;
  
  try {
    switch (action) {
      case 'register':
        return register(e);
      case 'submitCarpool':
        return submitCarpool(e);
      case 'deleteCarpool':
        return deleteCarpool(e);
      case 'submitSOS':
        return submitSOS(e);
      default:
        return jsonResponse({ error: 'Invalid action' });
    }
  } catch (err) {
    return jsonResponse({ error: err.message });
  }
}

function register(e) {
  const p = e.parameter;
  const sheet = getSheet(SHEETS.REGISTRATIONS);
  
  // Sanitize all inputs
  const row = [
    new Date(),
    sanitize(p.name),
    sanitize(p.birth),
    sanitize(p.phone),
    sanitize(p.course),
    sanitize(p.bloodType),
    sanitize(p.emergencyContact),
    sanitize(p.emergencyPhone),
    '신청완료'
  ];
  
  sheet.appendRow(row);
  return jsonResponse({ success: true, message: '참가 신청이 완료되었습니다.' });
}

function submitCarpool(e) {
  const p = e.parameter;
  const sheet = getSheet(SHEETS.CARPOOL);
  
  const row = [
    Date.now(),
    sanitize(p.type),
    sanitize(p.origin),
    sanitize(p.contact),
    sanitize(p.seats),
    sanitize(p.time),
    sanitize(p.password) // Hashed in production
  ];
  
  sheet.appendRow(row);
  return jsonResponse({ success: true });
}

function deleteCarpool(e) {
  const { id, password } = e.parameter;
  const sheet = getSheet(SHEETS.CARPOOL);
  const data = sheet.getDataRange().getValues();
  
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(id) && data[i][6] === password) {
      sheet.deleteRow(i + 1);
      return jsonResponse({ success: true });
    }
  }
  return jsonResponse({ success: false, message: '비밀번호가 일치하지 않습니다.' });
}

function submitSOS(e) {
  const { lat, lon } = e.parameter;
  const sheet = getSheet(SHEETS.EMERGENCY);
  
  sheet.appendRow([new Date(), lat, lon, 'RECEIVED']);
  
  // Optional: Send email notification to safety team
  // MailApp.sendEmail('safety@example.com', 'SOS Alert', `Location: ${lat}, ${lon}`);
  
  return jsonResponse({ success: true, message: 'SOS 신호가 접수되었습니다.' });
}

// ============================================
// SETUP FUNCTION - Run once to create sheets
// ============================================
function setupSpreadsheet() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  
  const sheetsConfig = {
    'Config': ['Key', 'Value'],
    'Notices': ['id', 'date', 'title', 'content', 'image_url'],
    'Checkpoints': ['id', 'name', 'km', 'cutoff', 'lat', 'lon'],
    'Schedule': ['id', 'time', 'title', 'location', 'icon'],
    'Registrations': ['timestamp', 'name', 'birth', 'phone', 'course', 'bloodType', 'emergencyContact', 'emergencyPhone', 'status'],
    'Results': ['bib', 'name', 'phone_last4', 'course', 'time', 'rank'],
    'Carpool': ['id', 'type', 'origin', 'contact', 'seats', 'time', 'password'],
    'Emergency': ['timestamp', 'lat', 'lon', 'status']
  };
  
  for (const [name, headers] of Object.entries(sheetsConfig)) {
    let sheet = ss.getSheetByName(name);
    if (!sheet) {
      sheet = ss.insertSheet(name);
    }
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  }
  
  Logger.log('Setup complete!');
}
