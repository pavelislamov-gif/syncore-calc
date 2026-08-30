export function scrollToMillingResult() {
  window.setTimeout(() => {
    document.getElementById('milling-result')?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    })
  }, 40)
}
