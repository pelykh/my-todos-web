import { ActionIcon, Menu, SegmentedControl, Stack, Text } from '@mantine/core'
import { Link } from '@tanstack/react-router'
import {
  Archive,
  CheckCircle2,
  FolderKanban,
  Hourglass,
  MoreHorizontal,
  Search,
  Settings,
  ShoppingCart,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'

interface OverflowMenuProps {
  onSettings: () => void
  onSearch?: () => void
}

const LANGS = [
  { value: 'en', label: 'EN' },
  { value: 'uk', label: 'UK' },
]

export function OverflowMenu({ onSettings, onSearch }: OverflowMenuProps) {
  const { i18n, t } = useTranslation()
  const current = LANGS.some((l) => l.value === i18n.language) ? i18n.language : 'en'

  return (
    <Menu shadow="md" width={200} position="bottom-end">
      <Menu.Target>
        <ActionIcon variant="default" size="lg" radius="md" aria-label="More options">
          <MoreHorizontal size={18} />
        </ActionIcon>
      </Menu.Target>
      <Menu.Dropdown>
        <Menu.Item component={Link} to="/shopping-list" leftSection={<ShoppingCart size={16} />}>
          {t('shoppingList')}
        </Menu.Item>
        <Menu.Item component={Link} to="/waiting-for" leftSection={<Hourglass size={16} />}>
          {t('waitingFor')}
        </Menu.Item>
        <Menu.Item component={Link} to="/someday" leftSection={<Archive size={16} />}>
          {t('status.someday')}
        </Menu.Item>
        <Menu.Item component={Link} to="/done" leftSection={<CheckCircle2 size={16} />}>
          {t('status.done')}
        </Menu.Item>
        <Menu.Item component={Link} to="/projects" leftSection={<FolderKanban size={16} />}>
          {t('navProjects', { defaultValue: 'Projects' })}
        </Menu.Item>
        {onSearch && (
          <Menu.Item leftSection={<Search size={16} />} onClick={onSearch}>
            {t('cmdPlaceholder')}
          </Menu.Item>
        )}
        <Menu.Divider />
        <Menu.Item closeMenuOnClick={false}>
          <Stack gap={4}>
            <Text size="xs" c="dimmed">
              {t('ariaLangSelect')}
            </Text>
            <SegmentedControl
              size="xs"
              value={current}
              onChange={(val) => void i18n.changeLanguage(val)}
              data={LANGS}
            />
          </Stack>
        </Menu.Item>
        <Menu.Divider />
        <Menu.Item leftSection={<Settings size={16} />} onClick={onSettings}>
          Settings
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  )
}
