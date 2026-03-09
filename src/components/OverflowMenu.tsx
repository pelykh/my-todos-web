import { ActionIcon, Menu, SegmentedControl, Stack, Text } from '@mantine/core'
import { MoreHorizontal, Settings } from 'lucide-react'
import { useTranslation } from 'react-i18next'

interface OverflowMenuProps {
  onSettings: () => void
}

const LANGS = [
  { value: 'en', label: 'EN' },
  { value: 'uk', label: 'UK' },
]

export function OverflowMenu({ onSettings }: OverflowMenuProps) {
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
