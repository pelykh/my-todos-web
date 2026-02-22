import { useTranslation } from "react-i18next";
import { useTask } from "@/store";
import type { Task } from "@/types";

interface TaskListItemProps {
  task: Task;
  isToday?: boolean;
}

export function TaskListItem({ task, isToday }: TaskListItemProps) {
  const { t } = useTranslation();
  const project = useTask(task.projectId ?? "");

  return (
    <div
      style={{
        padding: "6px 8px",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        gap: 10,
        background: "transparent",
        borderRadius: 6,
        transition: "background 0.1s",
        margin: "1px 0",
        userSelect: "none",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "var(--mantine-color-default-hover)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "transparent";
      }}
    >
      {/* Square icon container */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: 20,
          flexShrink: 0,
        }}
      >
        <div
          style={{
            width: 6,
            height: 6,
            borderRadius: 1.5,
            flexShrink: 0,
            background: isToday
              ? "var(--mantine-color-orange-6)"
              : "rgb(216, 216, 212)",
          }}
        />
      </div>

      {/* Content */}
      <div
        style={{
          flex: "1 1 0%",
          minWidth: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        <span
          style={{
            fontSize: 13.5,
            fontWeight: 400,
            color: "var(--mantine-color-text)",
            textDecoration: "none",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {task.title}
        </span>

        {(task.projectId || task.estimatedMinutes) && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              flexShrink: 0,
            }}
          >
            {task.projectId && (
              <span
                style={{
                  fontSize: 11,
                  color: "rgb(200, 200, 196)",
                  fontStyle: "italic",
                }}
              >
                {project?.title ?? t("projectNamePlaceholder")}
              </span>
            )}
            {task.projectId && task.estimatedMinutes && (
              <span style={{ fontSize: 9, color: "rgb(221, 221, 221)" }}>
                ·
              </span>
            )}
            {task.estimatedMinutes && (
              <span style={{ fontSize: 11, color: "rgb(208, 208, 204)" }}>
                {task.estimatedMinutes >= 60
                  ? `${(task.estimatedMinutes / 60).toFixed(task.estimatedMinutes % 60 === 0 ? 0 : 1)}${t("hourSuffix")}`
                  : `${task.estimatedMinutes}${t("minutesSuffix")}`}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
