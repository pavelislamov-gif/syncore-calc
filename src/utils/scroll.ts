export function scrollToResult(elementId: string) {
  window.setTimeout(() => {
    document.getElementById(elementId)?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    })
  }, 40)
}

export function scrollToMillingResult() {
  scrollToResult('milling-result')
}
