import { Extension } from "@tiptap/core"
import { Plugin, PluginKey } from "@tiptap/pm/state"
import { Decoration, DecorationSet } from "@tiptap/pm/view"

export interface LinkCopyButtonOptions {
  onCopy?: (href: string) => void
}

export const LinkCopyButton = Extension.create<LinkCopyButtonOptions>({
  name: "linkCopyButton",

  addOptions() {
    return {
      onCopy: undefined,
    }
  },

  addProseMirrorPlugins() {
    const { options } = this

    return [
      new Plugin({
        key: new PluginKey("linkCopyButton"),
        props: {
          decorations(state) {
            const { doc } = state
            const decorations: Decoration[] = []

            doc.descendants((node, pos) => {
              if (!node.isText) return

              const linkMark = node.marks.find((m) => m.type.name === "link")
              if (!linkMark) return

              const end = pos + node.nodeSize

              // Wait until the end of the full link range
              const nextNode = doc.nodeAt(end)
              const nextHasLink = nextNode?.marks.some(
                (m) =>
                  m.type.name === "link" &&
                  m.attrs.href === linkMark.attrs.href,
              )
              if (nextHasLink) return

              const href = linkMark.attrs.href as string

              const button = document.createElement("button")
              button.className = "link-copy-button"
              button.setAttribute("contenteditable", "false")
              button.setAttribute("data-href", href)
              button.innerHTML = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <rect width="14" height="14" x="8" y="8" rx="2" ry="2"/>
                <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
              </svg>`

              button.addEventListener("click", (e) => {
                e.preventDefault()
                e.stopPropagation()
                navigator.clipboard.writeText(href)

                button.classList.add("link-copy-button--copied")
                setTimeout(() => {
                  button.classList.remove("link-copy-button--copied")
                }, 400)

                options.onCopy?.(href)
              })

              decorations.push(
                Decoration.widget(end, button, {
                  side: 1,
                  key: `link-copy-${end}`,
                }),
              )
            })

            return DecorationSet.create(doc, decorations)
          },
        },
      }),
    ]
  },
})
