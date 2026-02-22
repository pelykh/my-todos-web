import {
  ActionIcon,
  Badge,
  Button,
  Card,
  Container,
  Group,
  RingProgress,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useTaskActions, useTasks } from "@/store";
import type { Area, Context } from "@/types";

export const Route = createFileRoute("/process-inbox")({
  component: ProcessInbox,
});

type Step =
  | "actionable"
  | "not-actionable"
  | "reference"
  | "twoMin"
  | "do-it"
  | "delegate"
  | "project"
  | "clarify";

const COUNTDOWN_SECONDS = 120;

const AREAS: Area[] = ["work", "personal", "health", "learning"];
const CONTEXTS: Context[] = ["deep_work", "admin", "home", "agenda"];
const DURATIONS: { label: string; value: number | null }[] = [
  { label: "duration.any", value: null },
  { label: "duration.lt5", value: 5 },
  { label: "duration.lt15", value: 15 },
  { label: "duration.lt45", value: 45 },
  { label: "duration.lt1h", value: 60 },
  { label: "duration.lt2h", value: 120 },
];

function Countdown({ onDone }: { onDone: () => void }) {
  const { t } = useTranslation();
  const [remaining, setRemaining] = useState(COUNTDOWN_SECONDS);

  useEffect(() => {
    const id = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          clearInterval(id);
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, []);

  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;
  const label = `${minutes}:${String(seconds).padStart(2, "0")}`;
  const progress = ((COUNTDOWN_SECONDS - remaining) / COUNTDOWN_SECONDS) * 100;

  return (
    <Stack align="center" gap="lg">
      <Text size="lg" fw={500}>
        {t("processDoItLabel")}
      </Text>
      <RingProgress
        size={160}
        thickness={10}
        roundCaps
        sections={[
          { value: progress, color: remaining === 0 ? "green" : "orange" },
        ]}
        label={
          <Text
            ta="center"
            fw={700}
            size="xl"
            style={{ fontVariantNumeric: "tabular-nums" }}
          >
            {label}
          </Text>
        }
      />
      <Button
        onClick={onDone}
        variant="filled"
        color="green"
        size="md"
        fullWidth
      >
        {t("processDoItDone")}
      </Button>
    </Stack>
  );
}

function ProcessInbox() {
  const { t } = useTranslation();
  const inboxTasks = useTasks({ status: "inbox" });
  const { editTask, removeTask } = useTaskActions();

  const [processedCount, setProcessedCount] = useState(0);
  const [stepHistory, setStepHistory] = useState<Step[]>(["actionable"]);

  const [selectedArea, setSelectedArea] = useState<Area | null>(null);
  const [selectedContext, setSelectedContext] = useState<Context | null>(null);
  const [selectedDuration, setSelectedDuration] = useState<number | null | undefined>(undefined);

  // Total is fixed at mount time so the progress counter doesn't jump around
  const [total] = useState(() => inboxTasks.length);

  // After a task is acted on, its status changes and inboxTasks shrinks.
  // The current task is always at index 0 of the remaining list.
  const task = inboxTasks[0];
  const done = task === undefined;

  const step = stepHistory[stepHistory.length - 1];
  const canGoBack = stepHistory.length > 1;

  function goTo(next: Step) {
    setStepHistory((h) => [...h, next]);
  }

  function goBack() {
    setStepHistory((h) => h.slice(0, -1));
  }

  function advance() {
    setProcessedCount((c) => c + 1);
    setStepHistory(["actionable"]);
    setSelectedArea(null);
    setSelectedContext(null);
    setSelectedDuration(undefined);
  }

  function handleActionable(yes: boolean) {
    goTo(yes ? "twoMin" : "not-actionable");
  }

  function handleNotActionable(action: "reference" | "someday" | "trash") {
    if (action === "reference") {
      goTo("reference");
    } else if (action === "trash") {
      removeTask(task.id);
      advance();
    } else {
      editTask(task.id, { status: "someday" });
      advance();
    }
  }

  function handleReferenceDone() {
    editTask(task.id, { status: "reference" });
    advance();
  }

  function handleTwoMin(yes: boolean) {
    if (yes) {
      goTo("do-it");
    } else {
      goTo("delegate");
    }
  }

  function handleDoItDone() {
    editTask(task.id, { status: "done" });
    advance();
  }

  function handleDelegate(yes: boolean) {
    if (yes) {
      editTask(task.id, { status: "waiting_for" });
      advance();
    } else {
      goTo("project");
    }
  }

  function handleProject(isProject: boolean) {
    if (isProject) {
      editTask(task.id, { status: "next_action" });
      advance();
    } else {
      goTo("clarify");
    }
  }

  function handleClarifyConfirm() {
    editTask(task.id, {
      status: "next_action",
      ...(selectedArea ? { area: selectedArea } : {}),
      ...(selectedContext ? { context: selectedContext } : {}),
      ...(selectedDuration !== undefined ? { estimatedMinutes: selectedDuration ?? undefined } : {}),
    });
    advance();
  }

  if (done || total === 0) {
    return (
      <Container size="sm" py="xl">
        <Stack align="center" gap="lg" mt="xl">
          <CheckCircle2 size={48} color="var(--mantine-color-green-6)" />
          <Title order={2} ta="center">
            {t("processInboxEmpty")}
          </Title>
          <Button component={Link} to="/" variant="light">
            {t("processInboxBack")}
          </Button>
        </Stack>
      </Container>
    );
  }

  return (
    <>
      <Group style={{ position: "fixed", top: 16, left: 16, zIndex: 200 }}>
        <ActionIcon
          component={Link}
          to="/"
          variant="default"
          size="lg"
          radius="md"
          aria-label={t("processInboxBack")}
        >
          <ArrowLeft size={18} />
        </ActionIcon>
      </Group>

      <Container size="sm" py="xl">
        <Stack gap="xl" mt={60}>
          <Group justify="space-between" align="center">
            <Title order={3}>{t("processInboxTitle")}</Title>
            <Badge variant="light" color="gray" size="lg">
              {t("processInboxProgress", {
                current: processedCount + 1,
                total,
              })}
            </Badge>
          </Group>

          <Card withBorder radius="md" p="xl">
            <Stack gap="sm">
              <Text fw={600} size="lg" style={{ lineHeight: 1.4 }}>
                {task.title}
              </Text>
              {task.notes && (
                <Text size="sm" c="dimmed" style={{ whiteSpace: "pre-wrap" }}>
                  {task.notes}
                </Text>
              )}
            </Stack>
          </Card>

          {step === "actionable" && (
            <Stack gap="md">
              <Text size="md" fw={500}>
                {t("processQ1")}
              </Text>
              <Group gap="sm">
                <Button
                  onClick={() => handleActionable(true)}
                  variant="filled"
                  color="blue"
                  flex={1}
                >
                  {t("processYes")}
                </Button>
                <Button
                  onClick={() => handleActionable(false)}
                  variant="light"
                  color="gray"
                  flex={1}
                >
                  {t("processNo")}
                </Button>
              </Group>
            </Stack>
          )}

          {step === "not-actionable" && (
            <Stack gap="md">
              <Text size="sm" c="dimmed">
                {t("processQ1")} → {t("processNo")}
              </Text>
              <Stack gap="sm">
                <Button
                  onClick={() => handleNotActionable("reference")}
                  variant="light"
                  color="blue"
                  fullWidth
                >
                  {t("processActionReference")}
                </Button>
                <Button
                  onClick={() => handleNotActionable("someday")}
                  variant="light"
                  color="violet"
                  fullWidth
                >
                  {t("processActionSomeday")}
                </Button>
                <Button
                  onClick={() => handleNotActionable("trash")}
                  variant="light"
                  color="red"
                  fullWidth
                >
                  {t("processActionTrash")}
                </Button>
              </Stack>
            </Stack>
          )}

          {step === "reference" && (
            <Stack gap="md">
              <Text size="md" c="dimmed">
                {t("processReferenceHint")}
              </Text>
              <Button
                onClick={handleReferenceDone}
                variant="filled"
                color="blue"
                fullWidth
              >
                {t("processReferenceDone")}
              </Button>
            </Stack>
          )}

          {step === "twoMin" && (
            <Stack gap="md">
              <Text size="md" fw={500}>
                {t("processQ2")}
              </Text>
              <Group gap="sm">
                <Button
                  onClick={() => handleTwoMin(true)}
                  variant="filled"
                  color="green"
                  flex={1}
                >
                  {t("processActionDo")}
                </Button>
                <Button
                  onClick={() => handleTwoMin(false)}
                  variant="light"
                  color="gray"
                  flex={1}
                >
                  {t("processNo")}
                </Button>
              </Group>
            </Stack>
          )}

          {step === "do-it" && (
            <Countdown key={task.id} onDone={handleDoItDone} />
          )}

          {step === "delegate" && (
            <Stack gap="md">
              <Text size="md" fw={500}>
                {t("processQ3")}
              </Text>
              <Group gap="sm">
                <Button
                  onClick={() => handleDelegate(true)}
                  variant="filled"
                  color="orange"
                  flex={1}
                >
                  {t("processYes")} — {t("processActionDelegate")}
                </Button>
                <Button
                  onClick={() => handleDelegate(false)}
                  variant="light"
                  color="gray"
                  flex={1}
                >
                  {t("processNo")}
                </Button>
              </Group>
            </Stack>
          )}

          {step === "project" && (
            <Stack gap="md">
              <Text size="md" fw={500}>
                {t("processQ4")}
              </Text>
              <Group gap="sm">
                <Button
                  onClick={() => handleProject(true)}
                  variant="light"
                  color="blue"
                  flex={1}
                >
                  {t("processActionNextProject")}
                </Button>
                <Button
                  onClick={() => handleProject(false)}
                  variant="filled"
                  color="blue"
                  flex={1}
                >
                  {t("processActionNextSingle")}
                </Button>
              </Group>
            </Stack>
          )}

          {step === "clarify" && (
            <Stack gap="lg">
              <Text size="md" fw={500}>{t("processClarifyTitle")}</Text>

              <Stack gap="xs">
                <Text size="xs" fw={600} tt="uppercase" c="dimmed" style={{ letterSpacing: "0.05em" }}>
                  {t("processClarifyArea")}
                </Text>
                <Group gap="xs">
                  {AREAS.map((a) => (
                    <Button
                      key={a}
                      size="xs"
                      radius="xl"
                      variant={selectedArea === a ? "filled" : "light"}
                      color="blue"
                      onClick={() => setSelectedArea(selectedArea === a ? null : a)}
                    >
                      {t(`area.${a}`)}
                    </Button>
                  ))}
                </Group>
              </Stack>

              <Stack gap="xs">
                <Text size="xs" fw={600} tt="uppercase" c="dimmed" style={{ letterSpacing: "0.05em" }}>
                  {t("processClarifyContext")}
                </Text>
                <Group gap="xs">
                  {CONTEXTS.map((c) => (
                    <Button
                      key={c}
                      size="xs"
                      radius="xl"
                      variant={selectedContext === c ? "filled" : "light"}
                      color="teal"
                      onClick={() => setSelectedContext(selectedContext === c ? null : c)}
                    >
                      {t(`context.${c}`)}
                    </Button>
                  ))}
                </Group>
              </Stack>

              <Stack gap="xs">
                <Text size="xs" fw={600} tt="uppercase" c="dimmed" style={{ letterSpacing: "0.05em" }}>
                  {t("processClarifyDuration")}
                </Text>
                <Group gap="xs">
                  {DURATIONS.map(({ label, value }) => (
                    <Button
                      key={label}
                      size="xs"
                      radius="xl"
                      variant={selectedDuration === value ? "filled" : "light"}
                      color="violet"
                      onClick={() => setSelectedDuration(selectedDuration === value ? undefined : value)}
                    >
                      {t(label)}
                    </Button>
                  ))}
                </Group>
              </Stack>

              <Button onClick={handleClarifyConfirm} variant="filled" color="blue" fullWidth>
                {t("processClarifyConfirm")}
              </Button>
            </Stack>
          )}

          {canGoBack && (
            <Group>
              <Button
                onClick={goBack}
                variant="subtle"
                color="gray"
                size="xs"
                leftSection={<ArrowLeft size={14} />}
              >
                {t("processInboxBack")}
              </Button>
            </Group>
          )}
        </Stack>
      </Container>
    </>
  );
}
