export function isMobile() {
  // return true
	return typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches
}
