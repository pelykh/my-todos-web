import { useCurrentEditor } from "@tiptap/react"
import { LayoutTemplate } from "lucide-react"
import { useState } from "react"

import { Button } from "@/components/tiptap-ui-primitive/button"
import { Input } from "@/components/tiptap-ui-primitive/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/tiptap-ui-primitive/popover"
import { useFilteredTasks } from "@/store/taskStore"
import type { Task } from "@/types"

export function TemplateInsertButton() {
  const { editor } = useCurrentEditor()
  const templates = useFilteredTasks({ tags: ["template"] })
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")

  const filtered = templates.filter((t) =>
    t.title.toLowerCase().includes(search.toLowerCase())
  )

  function handleSelect(template: Task) {
    if (!editor || !template.notes) return
    editor.chain().focus().insertContent(template.notes).run()
    setOpen(false)
    setSearch("")
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" tooltip="Insert template">
          <LayoutTemplate className="tiptap-button-icon" style={{ width: 16, height: 16 }} />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" style={{ width: 240, padding: 8, background: "var(--mantine-color-body)", borderRadius: "var(--tt-radius-lg)", border: "1px solid var(--mantine-color-default-border)", boxShadow: "var(--tt-shadow-elevated-md)" }}>
        <Input
          placeholder="Search templates..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          autoFocus
          className="dark:text-white! dark:border-white/20! dark:placeholder-white/40!"
        />
        <div style={{ maxHeight: 200, overflowY: "auto", marginTop: 4 }}>
          {filtered.map((template) => (
            <button
              key={template.id}
              className="tiptap-button dark:text-white! dark:hover:bg-white/10! rounded"
              data-style="ghost"
              onClick={() => handleSelect(template)}
              style={{ width: "100%", justifyContent: "flex-start", padding: "4px 8px" }}
            >
              {template.title}
            </button>
          ))}
          {filtered.length === 0 && (
            <span className="dark:text-white/50" style={{ display: "block", padding: "4px 8px", fontSize: "0.8125rem" }}>
              No templates found
            </span>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
