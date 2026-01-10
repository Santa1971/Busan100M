// ============================================
// Busan Galmaetgil 100M - Common App Logic
// ============================================

const USE_MOCK = false;  // API 연결 전까지 Mock 데이터 사용
const API_URL = 'https://script.google.com/macros/s/AKfycbwzcVDqBzkd3uF7hHWJpv2bCHZwiWVrilULi3CbuE24BaiXQt_t9zkD8LyRhzdMeSGt/exec';

// ============================================
// MOCK DATA
// ============================================
const MOCK_DATA = {
    config: {
        eventDate: '2026-03-01',
        eventName: '부산 갈맷길 100M',
        registrationOpen: true,
        maxParticipants: 500
    },
    schedule: [
        { id: 1, time: '15:00', title: '접수 개시', location: '다대포해수욕장', icon: '📋' },
        { id: 2, time: '16:00', title: '100M 출발', location: '다대포해수욕장', icon: '🏃' },
        { id: 3, time: '19:00', title: 'CP1 컷오프', location: '화명생태공원', icon: '⏰' },
        { id: 4, time: '23:00', title: 'CP2 컷오프', location: '기장군청', icon: '⏰' },
        { id: 5, time: '02:00', title: 'CP3 컷오프', location: '해운대해수욕장', icon: '⏰' },
        { id: 6, time: '10:00', title: '완주 마감', location: '다대포해수욕장', icon: '🏁' },
        { id: 7, time: '11:00', title: '시상식', location: '다대포해수욕장', icon: '🏆' }
    ],
    checkpoints: [
        { id: 1, name: '출발 (다대포해수욕장)', km: 0, cutoff: '16:00', lat: 35.0465, lon: 128.9660, elevation: 5 },
        { id: 2, name: 'CP1 화명생태공원', km: 20, cutoff: '19:00', lat: 35.2103, lon: 129.0156, elevation: 15 },
        { id: 3, name: 'CP2 기장군청', km: 45, cutoff: '23:00', lat: 35.2447, lon: 129.2222, elevation: 45 },
        { id: 4, name: 'CP3 해운대해수욕장', km: 60, cutoff: '02:00', lat: 35.1587, lon: 129.1604, elevation: 5 },
        { id: 5, name: 'CP4 송도해수욕장', km: 80, cutoff: '05:00', lat: 35.0753, lon: 129.0237, elevation: 5 },
        { id: 6, name: '완주 (다대포해수욕장)', km: 100, cutoff: '10:00', lat: 35.0465, lon: 128.9660, elevation: 5 }
    ],
    notices: [
        { id: 1, date: '2026-01-09', title: '🎉 2026년 대회 참가 신청 오픈!', content: '안녕하세요! 부산 갈맷길 100M 2026 대회 참가 신청이 시작되었습니다. 선착순 500명 마감이오니 서둘러 신청해 주세요! 자세한 내용은 참가 신청 페이지를 확인하세요.', image_url: null },
        { id: 2, date: '2026-01-05', title: '📍 코스 사전 답사 안내', content: '대회 전 코스 사전 답사를 진행합니다.\n\n일시: 1월 20일(토) 오전 9시\n장소: 해운대 해수욕장 집합\n참가비: 무료\n준비물: 운동화, 물, 간식\n\n많은 참여 부탁드립니다!', image_url: null },
        { id: 3, date: '2025-12-28', title: '⚠️ 필수 안전 장비 안내', content: '본 대회는 산악 구간이 포함되어 있어 다음 안전 장비가 필수입니다:\n\n✅ 헤드램프 (야간 구간)\n✅ 호루라기\n✅ 보온용품 (긴급 담요)\n✅ 휴대폰 (완충 상태)\n✅ 최소 1L 물\n\n장비 미비 시 출발이 제한될 수 있습니다.', image_url: null },
        { id: 4, date: '2025-12-20', title: '🏆 2025년 대회 결과 공개', content: '2025년 대회 결과가 공개되었습니다. 결과 페이지에서 확인하세요!', image_url: null }
    ],
    carpool: [
        { id: 1, type: '카풀', origin: '서울 강남역', contact: '010-****-1234', seats: 3, time: '04/24 저녁' },
        { id: 2, type: '숙소', origin: '해운대 민박 (4인실)', contact: '010-****-5678', seats: 4, time: '04/24-25' },
        { id: 3, type: '카풀', origin: '대구 동대구역', contact: '010-****-9012', seats: 2, time: '04/24 오후' },
        { id: 4, type: '숙소', origin: '서면 게스트하우스', contact: '010-****-3456', seats: 6, time: '04/24-25' }
    ],
    cheers: [
        '아빠 화이팅! 완주하세요! 💪',
        '부산 갈맷길 최고! 🏔️',
        '100M 도전자들 모두 힘내세요! 🔥',
        '엄마가 응원해요~ 사랑해! ❤️',
        '포기하지 마세요! 할 수 있어요! 💯',
        '부산 트레일러닝 화이팅! 🏃‍♂️',
        '완주는 시작이다! 💫'
    ],
    weather: {
        start: { temp: 12, icon: '🌙', desc: '맑음', humidity: 65 },
        summit: { temp: 5, icon: '❄️', desc: '강풍', humidity: 80 },
        finish: { temp: 18, icon: '☀️', desc: '맑음', humidity: 55 }
    },
    results: [
        { bib: '001', name: '김철수', phone_last4: '1234', course: '100M', time: '12:34:56', rank: 1 },
        { bib: '002', name: '이영희', phone_last4: '5678', course: '100M', time: '13:45:23', rank: 2 },
        { bib: '003', name: '박민수', phone_last4: '9012', course: '50M', time: '06:12:45', rank: 1 }
    ]
};

// ============================================
// API FUNCTIONS
// ============================================
async function fetchData(action, params = {}) {
    if (USE_MOCK) {
        return new Promise(resolve => {
            setTimeout(() => {
                switch (action) {
                    case 'getConfig': resolve(MOCK_DATA.config); break;
                    case 'getSchedule': resolve(MOCK_DATA.schedule); break;
                    case 'getNotices': resolve(MOCK_DATA.notices); break;
                    case 'getCheckpoints': resolve(MOCK_DATA.checkpoints); break;
                    case 'getCarpool': resolve(MOCK_DATA.carpool); break;
                    case 'getCheers': resolve(MOCK_DATA.cheers); break;
                    case 'getWeather': resolve(MOCK_DATA.weather); break;
                    default: resolve(null);
                }
            }, 200);
        });
    }
    const url = `${API_URL}?action=${action}&${new URLSearchParams(params)}`;
    const res = await fetch(url);
    return res.json();
}

async function checkRegistrationStatus(name, phone4) {
    if (USE_MOCK) {
        return new Promise(resolve => {
            setTimeout(() => {
                if (name === '김철수' && phone4 === '1234') {
                    resolve({ found: true, status: '입금완료', course: '100M' });
                } else {
                    resolve({ found: false });
                }
            }, 500);
        });
    }
    return fetchData('checkStatus', { name, phone4 });
}

async function searchResult(name, phone4) {
    if (USE_MOCK) {
        const result = MOCK_DATA.results.find(r => r.name === name && r.phone_last4 === phone4);
        return new Promise(resolve => setTimeout(() => resolve(result || null), 500));
    }
    return fetchData('getResult', { name, phone4 });
}

// ============================================
// UI HELPERS
// ============================================
function getCurrentPage() {
    const path = window.location.pathname;
    const page = path.split('/').pop().replace('.html', '') || 'index';
    return page;
}

function initMobileMenu() {
    const hamburger = document.querySelector('.nav-hamburger');
    const mobileMenu = document.querySelector('.mobile-menu');

    if (hamburger && mobileMenu) {
        hamburger.addEventListener('click', () => {
            mobileMenu.classList.toggle('open');
            hamburger.textContent = mobileMenu.classList.contains('open') ? '✕' : '☰';
        });
    }
}

function initActiveNav() {
    const currentPage = getCurrentPage();
    document.querySelectorAll('.nav-links a, .bottom-nav a, .mobile-menu a').forEach(link => {
        const href = link.getAttribute('href');
        if (href && (href.includes(currentPage) || (currentPage === 'index' && href === 'index.html'))) {
            link.classList.add('active');
        }
    });
}

function initCheerMarquee() {
    const marquee = document.querySelector('.cheer-marquee-inner');
    if (marquee) {
        fetchData('getCheers').then(cheers => {
            if (cheers && cheers.length) {
                marquee.innerHTML = cheers.map(c => `<span>${c}</span>`).join('');
            }
        });
    }
}

function initSOS() {
    const sosBtn = document.querySelector('.sos-btn');
    if (sosBtn) {
        sosBtn.addEventListener('click', handleSOS);
    }
}

function handleSOS() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(pos => {
            const { latitude, longitude } = pos.coords;
            if (USE_MOCK) {
                alert(`🚨 SOS 신호 전송됨!\n\n위치: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}\n\n(Mock 모드 - 실제 신호는 전송되지 않습니다)`);
            } else {
                fetch(`${API_URL}?action=submitSOS&lat=${latitude}&lon=${longitude}`, { method: 'POST' });
                alert('🚨 SOS 신호가 전송되었습니다. 구호팀이 출동합니다.');
            }
        }, () => alert('위치 정보를 가져올 수 없습니다.'));
    } else {
        alert('이 브라우저에서는 위치 서비스를 지원하지 않습니다.');
    }
}

// ============================================
// INITIALIZATION
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    initMobileMenu();
    initActiveNav();
    initCheerMarquee();
    initSOS();
});
