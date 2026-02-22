import { useEffect, useRef, useState } from 'react'
import { Command } from 'cmdk'
import { useTranslation } from 'react-i18next'
import { useTasks, useTaskActions } from '@/store'
import { useTheme } from '@/theme'
import type { Task } from '@/types'

interface CommandPaletteProps {
  open: boolean
  onClose: () => void
}

const today = new Date().toISOString().slice(0, 10)

function isToday(task: Task) {
  return task.scheduledDate?.slice(0, 10) === today || task.dueDate?.slice(0, 10) === today
}

export function CommandPalette({ open, onClose }: CommandPaletteProps) {
  const { t } = useTranslation()
  const { colorScheme } = useTheme()
  const allTasks = useTasks()
  const { addTask } = useTaskActions()
  const [search, setSearch] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 0)
    } else {
      setSearch('')
    }
  }, [open])

  const isDark = colorScheme === 'dark'

  const overlay: React.CSSProperties = {
    position: 'fixed',
    inset: 0,
    backgroundColor: isDark ? 'rgba(0,0,0,0.6)' : 'rgba(0,0,0,0.3)',
    zIndex: 1000,
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'center',
    paddingTop: '15vh',
  }

  const dialog: React.CSSProperties = {
    width: '100%',
    maxWidth: 560,
    backgroundColor: 'var(--mantine-color-body)',
    borderRadius: 12,
    boxShadow: '0 16px 70px rgba(0,0,0,0.2)',
    overflow: 'hidden',
    border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '16px 20px',
    fontSize: 15,
    background: 'transparent',
    border: 'none',
    outline: 'none',
    color: 'var(--mantine-color-text)',
    borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
  }

  const listStyle: React.CSSProperties = {
    maxHeight: 360,
    overflowY: 'auto',
    padding: '8px 0',
  }

  const itemStyle: React.CSSProperties = {
    padding: '8px 20px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    fontSize: 13.5,
    color: 'var(--mantine-color-text)',
    userSelect: 'none',
    borderRadius: 0,
  }

  const dotStyle = (today: boolean): React.CSSProperties => ({
    width: 6,
    height: 6,
    borderRadius: 1.5,
    flexShrink: 0,
    background: today ? 'var(--mantine-color-orange-6)' : 'rgb(216,216,212)',
  })

  const metaStyle: React.CSSProperties = {
    marginLeft: 'auto',
    fontSize: 11,
    color: isDark ? 'rgb(150,150,148)' : 'rgb(200,200,196)',
    fontStyle: 'italic',
    flexShrink: 0,
  }

  if (!open) return null

  return (
    <div style={overlay} onClick={onClose}>
      <div style={dialog} onClick={(e) => e.stopPropagation()}>
        <Command label={t('cmdPlaceholder')} shouldFilter={true}>
          <Command.Input
            ref={inputRef}
            value={search}
            onValueChange={setSearch}
            placeholder={t('cmdPlaceholder')}
            style={inputStyle}
          />
          <Command.List style={listStyle}>
{allTasks.map((task) => (
              <Command.Item
                key={task.id}
                value={task.title}
                onSelect={onClose}
                style={itemStyle}
                data-selected-style=""
              >
                <div style={dotStyle(isToday(task))} />
                <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {task.title}
                </span>
                {task.area && (
                  <span style={metaStyle}>{t(`area.${task.area}`, { defaultValue: task.area })}</span>
                )}
              </Command.Item>
            ))}
            <Command.Item
              value={`add-to-inbox ${search}`}
              onSelect={() => {
                addTask({ title: search.trim() || t('cmdAddToInbox'), status: 'inbox' })
                onClose()
              }}
              style={{ ...itemStyle, color: 'var(--mantine-color-dimmed)', fontStyle: 'italic' }}
              forceMount
            >
              <span>+ {t('cmdAddToInbox')}{search.trim() ? ` "${search.trim()}"` : ''}</span>
            </Command.Item>
          </Command.List>
        </Command>
      </div>
    </div>
  )
}
