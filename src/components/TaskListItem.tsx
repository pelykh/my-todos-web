import { useTranslation } from "react-i18next";
import type { Task } from "@/types";
import { cn } from "@/utils/cn";
import { formatDuration } from "@/utils/duration";

type DisplayMeta = "area" | "duration" | "project" | "context";

type TaskListItemProps = {
  task: Task;
  status?: "important";
  displayMeta?: DisplayMeta[];
  onClick?: () => void;
};

export function TaskListItem({
  task,
  status,
  displayMeta = ["project", "duration"],
  onClick,
}: TaskListItemProps) {
  const { t } = useTranslation();
  const isImportant = status === "important";

  const getMetaLabel = (metaKey: DisplayMeta) => {
    if (metaKey === "area") {
      return task[metaKey];
    }

    if (metaKey === "duration") {
      return task.estimatedMinutes
        ? formatDuration(
            task.estimatedMinutes,
            t("hourSuffix"),
            t("minutesSuffix"),
          )
        : null;
    }
  };

  return (
    // biome-ignore lint/a11y/useSemanticElements: TODO
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onClick?.();
      }}
      className="flex items-center gap-2.5 px-2 py-1.5 rounded-md cursor-pointer select-none transition-[background] duration-100 my-px hover:bg-(--mantine-color-default-hover)"
    >
      {/* Status dot */}
      <div className="flex items-center justify-center w-5 shrink-0">
        <div
          className={cn(
            "w-1.5 h-1.5 rounded-[1.5px] shrink-0",
            isImportant
              ? "bg-(--mantine-color-orange-6)"
              : "bg-[rgb(216,216,212)]",
          )}
        />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 flex items-center justify-between gap-3">
        <span className="text-[13.5px] font-normal truncate text-(--mantine-color-text)">
          {task.title}
        </span>

        <div className="flex items-center gap-1.5 shrink-0">
          {displayMeta?.map((metaKey) => {
            const label = getMetaLabel(metaKey);
            if (!label) return null;

            return (
              <span
                key={metaKey}
                className="text-[11px] text-(rgb(200, 200, 196))"
              >
                {label}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}
