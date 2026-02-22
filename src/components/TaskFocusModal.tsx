import { ActionIcon, Badge, Button, Menu, Popover, Select, Textarea } from "@mantine/core";
import { CheckCircle2, Ellipsis, FolderKanban, Trash2, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  useFocusedTaskActions,
  useFocusedTaskId,
  useTask,
  useTaskActions,
} from "@/store";
import { useTheme } from "@/theme";
import type { Context, Area } from "@/types";

const CONTEXTS: Context[] = ["deep_work", "admin", "home", "agenda"];
const AREAS: Area[] = ["work", "personal", "health", "learning"];
const DURATION_OPTIONS = [
  { value: "5", label: "5'" },
  { value: "15", label: "15'" },
  { value: "30", label: "30'" },
  { value: "45", label: "45'" },
  { value: "60", label: "1h" },
  { value: "120", label: "2h" },
];

export function TaskFocusModal() {
  const { t } = useTranslation();
  const { colorScheme } = useTheme();
  const isDark = colorScheme === "dark";

  const navigate = useNavigate();
  const focusedTaskId = useFocusedTaskId();
  const setFocusedTaskId = useFocusedTaskActions();
  const task = useTask(focusedTaskId ?? "");
  const project = useTask(task?.projectId ?? "");
  const { editTask, removeTask, addTask } = useTaskActions();

  const [visible, setVisible] = useState(false);
  const [titleValue, setTitleValue] = useState("");
  const [notesValue, setNotesValue] = useState("");
  const [notesEditMode, setNotesEditMode] = useState(false);
  const [contextOpen, setContextOpen] = useState(false);
  const [areaOpen, setAreaOpen] = useState(false);
  const [timeOpen, setTimeOpen] = useState(false);
  const titleRef = useRef<HTMLInputElement>(null);
  const checkboxIndexRef = useRef(0);

  // Animate open/close
  useEffect(() => {
    if (focusedTaskId) {
      setVisible(true);
    }
  }, [focusedTaskId]);

  // Sync local state when task changes
  useEffect(() => {
    if (task) {
      setTitleValue(task.title);
      setNotesValue(task.notes ?? "");
      setNotesEditMode(false);
    }
  }, [task]);

  // Focus title input when modal opens
  useEffect(() => {
    if (visible && task) {
      setTimeout(() => titleRef.current?.focus(), 50);
    }
  }, [visible, task]);

  // Close on Escape
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") handleClose();
    }
    if (focusedTaskId) {
      window.addEventListener("keydown", handleKey);
      return () => window.removeEventListener("keydown", handleKey);
    }
  }, [focusedTaskId]);

  function handleClose() {
    setVisible(false);
    setTimeout(() => setFocusedTaskId(null), 250);
  }

  function handleTitleBlur() {
    if (task && titleValue.trim() && titleValue.trim() !== task.title) {
      editTask(task.id, { title: titleValue.trim() });
    }
  }

  function handleTitleKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") e.currentTarget.blur();
  }

  function handleNotesBlur() {
    if (task && notesValue !== (task.notes ?? "")) {
      editTask(task.id, { notes: notesValue });
    }
    setNotesEditMode(false);
  }

  function handleComplete() {
    if (!task) return;
    editTask(task.id, { status: "done" });
    handleClose();
  }

  function handleDelete() {
    if (!task) return;
    removeTask(task.id);
    handleClose();
  }

  function handlePromoteToProject() {
    if (!task) return;
    editTask(task.id, { isProject: true, status: "next_action" });
    handleClose();
  }

  function handleContextChange(value: string | null) {
    if (!task) return;
    editTask(task.id, { context: (value as Context) ?? undefined });
    setContextOpen(false);
  }

  function handleAreaChange(value: string | null) {
    if (!task) return;
    editTask(task.id, { area: (value as Area) ?? undefined });
    setAreaOpen(false);
  }

  function handleTimeChange(value: string | null) {
    if (!task) return;
    const mins = value ? parseInt(value, 10) : undefined;
    editTask(task.id, { estimatedMinutes: mins });
    setTimeOpen(false);
  }

  function toggleCheckbox(index: number) {
    if (!task) return;
    let count = 0;
    const updated = (task.notes ?? "").replace(
      /^(\s*[-*+]\s+)\[([ x])\]/gm,
      (match, prefix, state) => {
        const result =
          count === index
            ? `${prefix}[${state === " " ? "x" : " "}]`
            : match;
        count++;
        return result;
      },
    );
    setNotesValue(updated);
    editTask(task.id, { notes: updated });
  }

  if (!focusedTaskId && !visible) return null;

  const overlay: React.CSSProperties = {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    backgroundColor: "var(--mantine-color-body)",
    zIndex: 500,
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "center",
    opacity: visible ? 1 : 0,
    transition: "opacity 0.25s ease",
  };

  const modal: React.CSSProperties = {
    width: "100%",
    maxWidth: 640,
    height: "100%",
    backgroundColor: "var(--mantine-color-body)",
    borderRadius: 0,
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    transform: visible
      ? "translateY(0) scale(1)"
      : "translateY(16px) scale(0.97)",
    transition: "transform 0.25s ease, opacity 0.25s ease",
    opacity: visible ? 1 : 0,
    paddingTop: "10%",
  };

  if (!task) return null;

  checkboxIndexRef.current = 0;

  const timeLabel = task.estimatedMinutes
    ? task.estimatedMinutes >= 60
      ? `${(task.estimatedMinutes / 60).toFixed(task.estimatedMinutes % 60 === 0 ? 0 : 1)}${t("hourSuffix")}`
      : `${task.estimatedMinutes}${t("minutesSuffix")}`
    : null;

  const contextOptions = CONTEXTS.map((c) => ({ value: c, label: t(`context.${c}`) }));
  const areaOptions = AREAS.map((a) => ({ value: a, label: t(`area.${a}`) }));

  return (
    <div style={overlay}>
      <div style={modal} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div
          style={{
            padding: "20px 20px 16px",
            borderBottom: `1px solid ${isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)"}`,
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          {/* Title row */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <input
              ref={titleRef}
              value={titleValue}
              onChange={(e) => setTitleValue(e.target.value)}
              onBlur={handleTitleBlur}
              onKeyDown={handleTitleKey}
              style={{
                flex: 1,
                fontSize: 18,
                fontWeight: 600,
                background: "transparent",
                border: "none",
                outline: "none",
                color: "var(--mantine-color-text)",
                padding: "2px 0",
                minWidth: 0,
              }}
            />
            <Button
              onClick={handleComplete}
              variant="filled"
              color="green"
              size="sm"
              radius="md"
              leftSection={<CheckCircle2 size={16} />}
            >
              {t("focusModalComplete")}
            </Button>
            <Menu withinPortal zIndex={600} position="bottom-end">
              <Menu.Target>
                <ActionIcon variant="subtle" color="gray" size="lg" radius="md">
                  <Ellipsis size={18} />
                </ActionIcon>
              </Menu.Target>
              <Menu.Dropdown>
                {!task.isProject && (
                  <Menu.Item
                    leftSection={<FolderKanban size={14} />}
                    onClick={handlePromoteToProject}
                  >
                    {t("focusModalPromoteToProject")}
                  </Menu.Item>
                )}
                <Menu.Divider />
                <Menu.Item
                  leftSection={<Trash2 size={14} />}
                  color="red"
                  onClick={handleDelete}
                >
                  {t("focusModalDelete")}
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
            <ActionIcon
              onClick={handleClose}
              variant="subtle"
              color="gray"
              size="lg"
              radius="md"
              aria-label={t("focusModalClose")}
            >
              <X size={18} />
            </ActionIcon>
          </div>

          {/* Tags row */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {/* Context badge */}
            <Popover opened={contextOpen} onChange={setContextOpen} width={160} position="bottom-start" withinPortal zIndex={600}>
              <Popover.Target>
                <Badge
                  variant={task.context ? "light" : "outline"}
                  color="blue"
                  size="sm"
                  radius="sm"
                  style={{ cursor: "pointer" }}
                  onClick={() => setContextOpen((o) => !o)}
                >
                  {task.context
                    ? t(`context.${task.context}`, { defaultValue: task.context })
                    : t("focusModalContext")}
                </Badge>
              </Popover.Target>
              <Popover.Dropdown p="xs">
                <Select
                  data={contextOptions}
                  value={task.context ?? ""}
                  onChange={handleContextChange}
                  size="xs"
                  comboboxProps={{ withinPortal: false }}
                  allowDeselect={false}
                />
              </Popover.Dropdown>
            </Popover>

            {/* Area badge */}
            <Popover opened={areaOpen} onChange={setAreaOpen} width={160} position="bottom-start" withinPortal zIndex={600}>
              <Popover.Target>
                <Badge
                  variant={task.area ? "light" : "outline"}
                  color="violet"
                  size="sm"
                  radius="sm"
                  style={{ cursor: "pointer" }}
                  onClick={() => setAreaOpen((o) => !o)}
                >
                  {task.area
                    ? t(`area.${task.area}`, { defaultValue: task.area })
                    : t("focusModalArea")}
                </Badge>
              </Popover.Target>
              <Popover.Dropdown p="xs">
                <Select
                  data={areaOptions}
                  value={task.area ?? ""}
                  onChange={handleAreaChange}
                  size="xs"
                  comboboxProps={{ withinPortal: false }}
                  allowDeselect={false}
                />
              </Popover.Dropdown>
            </Popover>

            {/* Time badge */}
            <Popover opened={timeOpen} onChange={setTimeOpen} width={140} position="bottom-start" withinPortal zIndex={600}>
              <Popover.Target>
                <Badge
                  variant={timeLabel ? "light" : "outline"}
                  color="gray"
                  size="sm"
                  radius="sm"
                  style={{ cursor: "pointer" }}
                  onClick={() => setTimeOpen((o) => !o)}
                >
                  {timeLabel ?? t("focusModalTime")}
                </Badge>
              </Popover.Target>
              <Popover.Dropdown p="xs">
                <Select
                  data={DURATION_OPTIONS}
                  value={task.estimatedMinutes ? String(task.estimatedMinutes) : ""}
                  onChange={handleTimeChange}
                  size="xs"
                  comboboxProps={{ withinPortal: false }}
                  allowDeselect={false}
                />
              </Popover.Dropdown>
            </Popover>
          </div>
        </div>

        {/* Notes */}
        <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px 20px" }}>
          {notesEditMode ? (
            <Textarea
              autoFocus
              value={notesValue}
              onChange={(e) => setNotesValue(e.currentTarget.value)}
              onBlur={handleNotesBlur}
              placeholder={t("focusModalNotesPlaceholder")}
              autosize
              minRows={5}
              styles={{
                input: {
                  fontSize: 14,
                  background: "transparent",
                  border: `1px solid ${isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.12)"}`,
                  fontFamily: "monospace",
                },
              }}
            />
          ) : (
            <div
              onDoubleClick={() => setNotesEditMode(true)}
              style={{
                minHeight: 80,
                cursor: "text",
                borderRadius: 8,
                padding: "6px 4px",
                color: notesValue
                  ? "var(--mantine-color-text)"
                  : "var(--mantine-color-dimmed)",
                fontSize: 14,
                lineHeight: 1.6,
              }}
            >
              {notesValue ? (
                <div className="markdown-preview">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      input({ checked }) {
                        const index = checkboxIndexRef.current++;
                        return (
                          <input
                            type="checkbox"
                            checked={checked ?? false}
                            onChange={() => toggleCheckbox(index)}
                            style={{ cursor: "pointer", marginRight: 4 }}
                          />
                        );
                      },
                    }}
                  >
                    {notesValue}
                  </ReactMarkdown>
                </div>
              ) : (
                <span style={{ fontStyle: "italic", opacity: 0.5 }}>
                  {t("focusModalNotesPlaceholder")}
                </span>
              )}
            </div>
          )}

          {project && (
            <>
              <div
                style={{
                  borderTop: `1px solid ${isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)"}`,
                  margin: "16px 0 14px",
                }}
              />
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    color: "var(--mantine-color-dimmed)",
                  }}
                >
                  {t("project")}
                </span>
                <Button
                  onClick={() => {
                    handleClose();
                    navigate({ to: "/project/$projectId", params: { projectId: project.id } });
                  }}
                  variant="subtle"
                  color="gray"
                  size="xs"
                  radius="md"
                  justify="start"
                  style={{ alignSelf: "flex-start" }}
                >
                  {project.title}
                </Button>
                {project.notes && (
                  <div
                    className="markdown-preview"
                    style={{
                      fontSize: 13,
                      color: "var(--mantine-color-dimmed)",
                      lineHeight: 1.6,
                    }}
                  >
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{project.notes}</ReactMarkdown>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
