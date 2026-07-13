export function openConversionWindow() {
  const width = 560
  const height = 700
  const left = window.screenX + (window.outerWidth - width) / 2
  const top = window.screenY + (window.outerHeight - height) / 2
  window.open('/conversion-request', '_blank', `width=${width},height=${height},left=${left},top=${top}`)
}
