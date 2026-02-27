import { RingProgress, Stack, Text } from '@mantine/core'
import { useEffect, useRef, useState } from 'react'

type Props = {
	seconds: number
}

export function CountdownTimer({ seconds: total }: Props) {
	const [remaining, setRemaining] = useState(total)
	const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

	useEffect(() => {
		setRemaining(total)
		intervalRef.current = setInterval(() => {
			setRemaining((r) => {
				if (r <= 1) {
					clearInterval(intervalRef.current!)
					return 0
				}
				return r - 1
			})
		}, 1000)
		return () => clearInterval(intervalRef.current!)
	}, [total])

	const minutes = Math.floor(remaining / 60)
	const secs = remaining % 60
	const label = `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
	const progress = (remaining / total) * 100
	const done = remaining === 0
	const color = done ? 'red' : remaining < total * 0.25 ? 'orange' : 'blue'

	return (
		<Stack align="center" gap={4}>
			<RingProgress
				size={100}
				thickness={6}
				roundCaps
				sections={[{ value: progress, color }]}
				label={
					<Text ta="center" fw={600} size="lg" ff="monospace">
						{label}
					</Text>
				}
			/>
		</Stack>
	)
}
