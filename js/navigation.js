// ============================================
// Busan Galmaetgil 100M - GPX Navigation Module
// ============================================

class GPXNavigation {
    constructor() {
        this.gpxData = [];
        this.map = null;
        this.chart = null;
        this.userMarker = null;
        this.routeLine = null;
        this.isNavigating = false;
        this.watchId = null;
        this.currentPosition = null;
        this.nearestPointIndex = 0;
        this.offRouteThreshold = 50; // meters
        this.checkpoints = [];
    }

    // Parse GPX file
    async loadGPX(url) {
        try {
            const response = await fetch(url);
            const gpxText = await response.text();
            this.parseGPX(gpxText);
            return true;
        } catch (error) {
            console.error('GPX 로드 실패:', error);
            console.log('Mock 고도 데이터로 대체합니다.');
            return false;
        }
    }

    // Generate mock elevation data from checkpoints (fallback)
    generateMockElevationData(checkpoints) {
        if (!checkpoints || checkpoints.length === 0) return;

        this.gpxData = [];

        // Create interpolated points between checkpoints
        for (let i = 0; i < checkpoints.length; i++) {
            const cp = checkpoints[i];
            this.gpxData.push({
                lat: cp.lat,
                lon: cp.lon,
                elevation: cp.elevation || 0,
                distance: cp.km,
                index: i * 10
            });

            // Add intermediate points for smoother chart
            if (i < checkpoints.length - 1) {
                const nextCp = checkpoints[i + 1];
                const steps = 5;
                for (let j = 1; j < steps; j++) {
                    const ratio = j / steps;
                    const km = cp.km + (nextCp.km - cp.km) * ratio;
                    const ele = cp.elevation + (nextCp.elevation - cp.elevation) * ratio;
                    // Add some randomness for realistic effect
                    const variance = Math.sin(km * 0.5) * 30 + Math.random() * 20;

                    this.gpxData.push({
                        lat: cp.lat + (nextCp.lat - cp.lat) * ratio,
                        lon: cp.lon + (nextCp.lon - cp.lon) * ratio,
                        elevation: Math.max(0, ele + variance),
                        distance: km,
                        index: i * 10 + j
                    });
                }
            }
        }

        // Sort by distance
        this.gpxData.sort((a, b) => a.distance - b.distance);
        console.log(`Mock 고도 데이터 생성 완료: ${this.gpxData.length} 포인트`);
    }

    parseGPX(gpxText) {
        const parser = new DOMParser();
        const gpx = parser.parseFromString(gpxText, 'text/xml');
        const trkpts = gpx.querySelectorAll('trkpt');

        this.gpxData = [];
        let totalDistance = 0;
        let prevLat = null, prevLon = null;

        trkpts.forEach((pt, index) => {
            const lat = parseFloat(pt.getAttribute('lat'));
            const lon = parseFloat(pt.getAttribute('lon'));
            const eleNode = pt.querySelector('ele');
            const ele = eleNode ? parseFloat(eleNode.textContent) : 0;

            if (prevLat !== null) {
                totalDistance += this.calculateDistance(prevLat, prevLon, lat, lon);
            }

            // Sample every 100th point for performance (large GPX file)
            if (index % 100 === 0 || index === trkpts.length - 1) {
                this.gpxData.push({
                    lat,
                    lon,
                    elevation: ele,
                    distance: totalDistance / 1000, // km
                    index
                });
            }

            prevLat = lat;
            prevLon = lon;
        });

        console.log(`GPX 파싱 완료: ${this.gpxData.length} 포인트 (총 ${(totalDistance / 1000).toFixed(2)}km)`);
    }

    // Haversine formula for distance calculation
    calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371000; // Earth radius in meters
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    // Initialize Leaflet map
    initMap(containerId, checkpoints = []) {
        this.checkpoints = checkpoints;

        if (this.map) {
            this.map.remove();
        }

        // Center on route center or default to Busan
        const center = this.gpxData.length > 0
            ? [this.gpxData[Math.floor(this.gpxData.length / 2)].lat, this.gpxData[Math.floor(this.gpxData.length / 2)].lon]
            : [35.1, 129.0];

        this.map = L.map(containerId).setView(center, 11);

        // OpenTopoMap layer
        L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
            maxZoom: 17,
            attribution: 'OpenTopoMap'
        }).addTo(this.map);

        // Draw route
        if (this.gpxData.length > 0) {
            this.drawRoute();
        }

        // Add checkpoints
        this.addCheckpointMarkers();

        return this.map;
    }

    drawRoute() {
        if (this.routeLine) {
            this.map.removeLayer(this.routeLine);
        }

        const coords = this.gpxData.map(p => [p.lat, p.lon]);

        // Gradient polyline based on elevation
        const segments = [];
        for (let i = 0; i < coords.length - 1; i++) {
            const ele1 = this.gpxData[i].elevation;
            const ele2 = this.gpxData[i + 1].elevation;
            const gradient = ele2 - ele1;

            // Color based on slope
            let color;
            if (gradient > 5) color = '#ef4444'; // Uphill - Red
            else if (gradient < -5) color = '#3b82f6'; // Downhill - Blue
            else color = '#22c55e'; // Flat - Green

            segments.push(L.polyline([coords[i], coords[i + 1]], {
                color: color,
                weight: 4,
                opacity: 0.8
            }));
        }

        this.routeLine = L.layerGroup(segments).addTo(this.map);

        // Fit map to route
        const bounds = L.latLngBounds(coords);
        this.map.fitBounds(bounds, { padding: [50, 50] });
    }

    addCheckpointMarkers() {
        this.checkpoints.forEach((cp, i) => {
            const isStart = i === 0;
            const isFinish = i === this.checkpoints.length - 1;

            const color = isStart ? '#22c55e' : isFinish ? '#ef4444' : '#3b82f6';
            const icon = L.divIcon({
                html: `<div style="background:${color}; width:32px; height:32px; border-radius:50%; 
                       display:flex; align-items:center; justify-content:center; 
                       color:white; font-weight:bold; border:3px solid white;
                       box-shadow: 0 2px 8px rgba(0,0,0,0.3);">${i + 1}</div>`,
                className: 'checkpoint-marker',
                iconSize: [32, 32],
                iconAnchor: [16, 16]
            });

            L.marker([cp.lat, cp.lon], { icon })
                .bindPopup(`
                    <div style="text-align:center;">
                        <strong>${cp.name}</strong><br>
                        ${cp.km}km | 컷오프 ${cp.cutoff}<br>
                        고도 ${cp.elevation}m
                    </div>
                `)
                .addTo(this.map);
        });
    }

    // Initialize elevation chart
    initChart(canvasId) {
        const ctx = document.getElementById(canvasId);
        if (!ctx) return null;

        const labels = this.gpxData.map(p => p.distance.toFixed(1) + 'km');
        const elevations = this.gpxData.map(p => p.elevation);

        this.chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels,
                datasets: [{
                    label: '고도 (m)',
                    data: elevations,
                    fill: true,
                    borderColor: '#ef4444',
                    backgroundColor: 'rgba(239, 68, 68, 0.2)',
                    tension: 0.4,
                    pointRadius: 0,
                    pointHoverRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    intersect: false,
                    mode: 'index'
                },
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            title: (items) => {
                                const idx = items[0].dataIndex;
                                return `${this.gpxData[idx].distance.toFixed(2)}km`;
                            },
                            label: (item) => {
                                return `고도: ${item.raw.toFixed(0)}m`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        grid: { color: 'rgba(255,255,255,0.1)' },
                        ticks: {
                            color: '#9ca3af',
                            maxTicksLimit: 10
                        }
                    },
                    y: {
                        grid: { color: 'rgba(255,255,255,0.1)' },
                        ticks: { color: '#9ca3af' },
                        title: {
                            display: true,
                            text: '고도 (m)',
                            color: '#9ca3af'
                        }
                    }
                },
                onClick: (e, elements) => {
                    if (elements.length > 0) {
                        const idx = elements[0].index;
                        this.focusMapOnPoint(idx);
                    }
                }
            }
        });

        return this.chart;
    }

    focusMapOnPoint(index) {
        if (!this.map || !this.gpxData[index]) return;

        const point = this.gpxData[index];
        this.map.setView([point.lat, point.lon], 15);

        // Add temporary marker
        const marker = L.circleMarker([point.lat, point.lon], {
            radius: 10,
            fillColor: '#fbbf24',
            color: '#fff',
            weight: 2,
            fillOpacity: 1
        }).addTo(this.map);

        setTimeout(() => this.map.removeLayer(marker), 3000);
    }

    // Start navigation mode
    startNavigation() {
        if (this.isNavigating) return;

        this.isNavigating = true;
        document.body.classList.add('nav-mode-active');

        if (navigator.geolocation) {
            this.watchId = navigator.geolocation.watchPosition(
                (pos) => this.updatePosition(pos),
                (err) => {
                    console.error('GPS 오류:', err);
                    alert('GPS 신호를 받을 수 없습니다.');
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 0
                }
            );
        } else {
            alert('이 기기에서는 GPS를 지원하지 않습니다.');
        }
    }

    stopNavigation() {
        this.isNavigating = false;
        document.body.classList.remove('nav-mode-active');

        if (this.watchId) {
            navigator.geolocation.clearWatch(this.watchId);
            this.watchId = null;
        }

        if (this.userMarker) {
            this.map.removeLayer(this.userMarker);
            this.userMarker = null;
        }

        // Hide off-route warning
        const warning = document.querySelector('.off-route-warning');
        if (warning) warning.remove();
    }

    updatePosition(position) {
        const { latitude, longitude, accuracy } = position.coords;
        this.currentPosition = { lat: latitude, lon: longitude, accuracy };

        // Update user marker
        if (this.userMarker) {
            this.userMarker.setLatLng([latitude, longitude]);
        } else {
            const icon = L.divIcon({
                html: '<div class="user-location-marker"></div>',
                className: '',
                iconSize: [20, 20],
                iconAnchor: [10, 10]
            });
            this.userMarker = L.marker([latitude, longitude], { icon }).addTo(this.map);
        }

        // Find nearest point on route
        const nearest = this.findNearestPoint(latitude, longitude);
        this.nearestPointIndex = nearest.index;

        // Check if off route
        if (nearest.distance > this.offRouteThreshold) {
            this.showOffRouteWarning(nearest.distance);
        } else {
            this.hideOffRouteWarning();
        }

        // Update navigation info
        this.updateNavInfo(nearest);

        // Center map on user (optional)
        this.map.panTo([latitude, longitude]);
    }

    findNearestPoint(lat, lon) {
        let minDist = Infinity;
        let nearestIdx = 0;

        this.gpxData.forEach((point, idx) => {
            const dist = this.calculateDistance(lat, lon, point.lat, point.lon);
            if (dist < minDist) {
                minDist = dist;
                nearestIdx = idx;
            }
        });

        return {
            index: nearestIdx,
            distance: minDist,
            point: this.gpxData[nearestIdx]
        };
    }

    updateNavInfo(nearest) {
        const navPanel = document.querySelector('.nav-panel');
        if (!navPanel) return;

        // Find next checkpoint
        const currentKm = nearest.point.distance;
        const nextCP = this.checkpoints.find(cp => cp.km > currentKm);

        const distanceToNextCP = nextCP ? (nextCP.km - currentKm).toFixed(1) : '-';
        const elevationChange = nextCP ? (nextCP.elevation - nearest.point.elevation) : 0;

        document.getElementById('nav-distance').textContent = `${distanceToNextCP} km`;
        document.getElementById('nav-elevation').textContent =
            elevationChange >= 0 ? `+${elevationChange.toFixed(0)}m` : `${elevationChange.toFixed(0)}m`;
        document.getElementById('nav-next-cp').textContent = nextCP ? nextCP.name : '완주!';

        // Update chart position indicator
        this.updateChartPosition(nearest.index);
    }

    updateChartPosition(index) {
        if (!this.chart) return;

        // Clear previous annotation
        this.chart.options.plugins.annotation = {
            annotations: {
                line1: {
                    type: 'line',
                    xMin: index,
                    xMax: index,
                    borderColor: '#fbbf24',
                    borderWidth: 2,
                    label: {
                        display: true,
                        content: '현재 위치',
                        position: 'start'
                    }
                }
            }
        };
        this.chart.update();
    }

    showOffRouteWarning(distance) {
        let warning = document.querySelector('.off-route-warning');
        if (!warning) {
            warning = document.createElement('div');
            warning.className = 'off-route-warning';
            warning.innerHTML = `
                <h3>⚠️ 경로 이탈!</h3>
                <p>코스에서 <strong>${Math.round(distance)}m</strong> 벗어났습니다.</p>
                <p>경로로 돌아가 주세요.</p>
            `;
            document.body.appendChild(warning);
        } else {
            warning.querySelector('strong').textContent = `${Math.round(distance)}m`;
        }
    }

    hideOffRouteWarning() {
        const warning = document.querySelector('.off-route-warning');
        if (warning) warning.remove();
    }

    // Get current location once (not navigation)
    getCurrentLocation() {
        return new Promise((resolve, reject) => {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (pos) => {
                        const { latitude, longitude } = pos.coords;

                        // Add marker
                        if (this.userMarker) {
                            this.map.removeLayer(this.userMarker);
                        }

                        const icon = L.divIcon({
                            html: '<div class="user-location-marker"></div>',
                            className: '',
                            iconSize: [20, 20],
                            iconAnchor: [10, 10]
                        });
                        this.userMarker = L.marker([latitude, longitude], { icon }).addTo(this.map);
                        this.map.setView([latitude, longitude], 14);

                        resolve({ lat: latitude, lon: longitude });
                    },
                    (err) => reject(err),
                    { enableHighAccuracy: true, timeout: 10000 }
                );
            } else {
                reject(new Error('Geolocation not supported'));
            }
        });
    }
}

// Export for use in other files
window.GPXNavigation = GPXNavigation;
