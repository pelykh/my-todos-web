import { useNavigate } from '@tanstack/react-router'
import { Command } from 'cmdk'
import { X } from 'lucide-react'
import { forwardRef, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { TaskListItem } from '@/components/TaskListItem'
import { useFilteredTasks, useTaskActions } from '@/store/taskStore'
import { useTheme } from '@/theme'
import { isMobile } from '@/utils'

interface CommandPaletteProps {
	open: boolean
	onClose: () => void
}

export const CommandPalette = forwardRef<HTMLInputElement, CommandPaletteProps>(
	function CommandPalette({ open, onClose }, inputRef) {
		const { t } = useTranslation()
		const { colorScheme } = useTheme()
		const allTasks = useFilteredTasks()
		const { addTask } = useTaskActions()
		const navigate = useNavigate()
		const [search, setSearch] = useState('')
		const mobile = isMobile()

		useEffect(() => {
			if (open) {
				if (!mobile) setTimeout(() => inputRef.current?.focus(), 0)
			} else {
				setSearch('')
			}
		}, [open])

		const isDark = colorScheme === 'dark'
		const border = `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`

		const overlay: React.CSSProperties = mobile
			? {
					position: 'fixed',
					inset: 0,
					backgroundColor: isDark ? 'rgba(0,0,0,0.6)' : 'rgba(0,0,0,0.3)',
					zIndex: 1000,
					display: open ? 'flex' : 'none',
					flexDirection: 'column',
				}
			: {
					position: 'fixed',
					inset: 0,
					backgroundColor: isDark ? 'rgba(0,0,0,0.6)' : 'rgba(0,0,0,0.3)',
					zIndex: 1000,
					display: open ? 'flex' : 'none',
					alignItems: 'flex-start',
					justifyContent: 'center',
					paddingTop: '15vh',
				}

		const dialog: React.CSSProperties = mobile
			? {
					width: '100%',
					flex: 1,
					backgroundColor: 'var(--mantine-color-body)',
					overflow: 'hidden',
					border,
					display: 'flex',
					flexDirection: 'column',
				}
			: {
					width: '100%',
					maxWidth: 560,
					backgroundColor: 'var(--mantine-color-body)',
					borderRadius: 12,
					boxShadow: '0 16px 70px rgba(0,0,0,0.2)',
					overflow: 'hidden',
					border,
				}

		const inputStyle: React.CSSProperties = {
			width: '100%',
			padding: '16px 20px',
			fontSize: 15,
			background: 'transparent',
			border: 'none',
			outline: 'none',
			color: 'var(--mantine-color-text)',
			borderBottom: open ? border : 'none',
		}

		const listStyle: React.CSSProperties = mobile
			? { flex: 1, overflowY: 'auto', padding: '8px 0' }
			: { maxHeight: 360, overflowY: 'auto', padding: '8px 0' }

		const itemStyle: React.CSSProperties = {
			padding: '0 12px',
			cursor: 'pointer',
			borderRadius: 0,
		}

		return (
			<div style={overlay} onClick={onClose}>
				<div style={dialog} onClick={(e) => e.stopPropagation()}>
					<Command label={t('cmdPlaceholder')} shouldFilter={true} style={mobile ? { display: 'flex', flexDirection: 'column', height: '100%' } : undefined}>
						<div style={{ position: 'relative' }}>
							<Command.Input
								ref={inputRef}
								value={search}
								onValueChange={setSearch}
								placeholder={t('cmdPlaceholder')}
								style={{ ...inputStyle, paddingRight: mobile ? 52 : undefined }}
							/>
							{mobile && open && (
								<button
									onClick={onClose}
									style={{
										position: 'absolute',
										right: 12,
										top: '50%',
										transform: 'translateY(-50%)',
										background: 'none',
										border: 'none',
										cursor: 'pointer',
										color: 'var(--mantine-color-dimmed)',
										padding: 4,
										display: 'flex',
										alignItems: 'center',
										justifyContent: 'center',
									}}
								>
									<X size={20} />
								</button>
							)}
						</div>
						{open && (
							<Command.List style={listStyle}>
								{allTasks.map((task) => (
									<Command.Item
										key={task.id}
										value={task.title}
										onSelect={() => {
											onClose()
											if (task.isProject) {
												navigate({ to: '/project/$projectId', params: { projectId: task.id } })
											} else {
												navigate({ to: '/task/$taskId', params: { taskId: task.id } })
											}
										}}
										style={itemStyle}
										keywords={task.isProject ? ['project', 'проєкт'] : []}
									>
										<TaskListItem
											taskId={task.id}
											displayMeta={['area', 'duration']}
											href={task.isProject ? `/project/${task.id}` : `/task/${task.id}`}
											onClick={onClose}
										/>
									</Command.Item>
								))}
								<Command.Item
									value={`add-to-inbox ${search}`}
									onSelect={() => {
										addTask({
											title: search.trim() || t('cmdAddToInbox'),
											status: 'inbox',
										})
										onClose()
									}}
									style={itemStyle}
									forceMount
								>
									<div className="flex items-center gap-2.5 px-2 py-1.5">
										<span className="text-[13.5px] font-normal truncate text-(--mantine-color-dimmed) italic">
											+ {t('cmdAddToInbox')}
											{search.trim() ? ` "${search.trim()}"` : ''}
										</span>
									</div>
								</Command.Item>
							</Command.List>
						)}
					</Command>
				</div>
			</div>
		)
	},
)
