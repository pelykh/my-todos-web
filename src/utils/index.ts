export function isMobile() {
	return typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches
}
