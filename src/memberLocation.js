export function hasMemberLocation(member) {
  if (!member) return false
  const lat = Number(member.location_lat)
  const lng = Number(member.location_lng)
  return Number.isFinite(lat) && Number.isFinite(lng)
}

export function mapsUrl(lat, lng) {
  return `https://www.google.com/maps?q=${lat},${lng}`
}

export function openMemberInMaps(member) {
  if (!hasMemberLocation(member)) return
  window.open(mapsUrl(member.location_lat, member.location_lng), '_blank', 'noopener,noreferrer')
}

export function captureCurrentLocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('المتصفح لا يدعم تحديد الموقع'))
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        resolve({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        }),
      (err) => {
        const messages = {
          1: 'تم رفض إذن الموقع — فعّل الموقع من إعدادات المتصفح',
          2: 'تعذر تحديد الموقع',
          3: 'انتهت مهلة تحديد الموقع — حاول مرة أخرى',
        }
        reject(new Error(messages[err.code] || 'فشل تحديد الموقع'))
      },
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 0 },
    )
  })
}
