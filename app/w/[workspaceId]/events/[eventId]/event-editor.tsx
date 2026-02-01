'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import { updateEventDoc } from './actions'
import { useState, useEffect } from 'react'
import { Check, Loader2 } from 'lucide-react'

// Simple debounce implementation if package not desired, but cleaner to use a utility. 
// I'll implement a simple internal debounce logic to avoid extra deps for now if I can, 
// but actually I'll use a timer.

export function EventEditor({
    workspaceId,
    eventId,
    initialContent
}: {
    workspaceId: string,
    eventId: string,
    initialContent: any
}) {
    const [saving, setSaving] = useState(false)
    const [lastSaved, setLastSaved] = useState<Date | null>(null)

    const handleSave = async (json: any) => {
        setSaving(true)
        await updateEventDoc(workspaceId, eventId, json)
        setSaving(false)
        setLastSaved(new Date())
    }

    // Debounce Save (1.5s)
    const debouncedSave = (json: any) => {
        // Simple timeout clearing logic
        const handler = setTimeout(() => handleSave(json), 1500)
        return () => clearTimeout(handler)
    }

    // We need a ref to hold the debounce timer to clear it, 
    // but React guarantees functional updates. 
    // Actually, let's use a simpler approach relying on useEffect dependency implies.
    // Ideally I'd use `use-debounce` package but I didn't install it. 
    // I will use a simple custom hook logic inside or just relying on `onUpdate` with a let variable 
    // is tricky in React. 
    // Let's assume standard behavior: triggers save, but we debounce it.

    // Better:
    const [contentToSave, setContentToSave] = useState<any>(null)

    useEffect(() => {
        if (contentToSave) {
            const timer = setTimeout(() => {
                handleSave(contentToSave)
            }, 1000)
            return () => clearTimeout(timer)
        }
    }, [contentToSave])

    const editor = useEditor({
        immediatelyRender: false,
        extensions: [
            StarterKit,
            Placeholder.configure({
                placeholder: 'Type "/" for commands, or just start writing notes, meeting minutes, or additional operational details...',
            }),
        ],
        content: initialContent || {},
        editorProps: {
            attributes: {
                class: 'prose prose-invert max-w-none focus:outline-none min-h-[500px] p-4',
            },
        },
        onUpdate: ({ editor }) => {
            setContentToSave(editor.getJSON())
        },
    })

    if (!editor) {
        return null
    }

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-muted-foreground px-2 h-6">
                <div></div>
                <div className="flex items-center gap-2">
                    {saving && <span className="flex items-center gap-1"><Loader2 className="w-3 h-3 animate-spin" /> Saving...</span>}
                    {!saving && lastSaved && <span className="flex items-center gap-1 text-green-500/80"><Check className="w-3 h-3" /> Saved {lastSaved.toLocaleTimeString()}</span>}
                </div>
            </div>
            <div className="border border-border rounded-xl bg-card min-h-[500px] shadow-sm overflow-hidden">
                {/* Toolbar could go here */}
                <div className="border-b border-border p-2 bg-secondary/20 flex gap-2">
                    <button onClick={() => editor.chain().focus().toggleBold().run()} className={`p-1 rounded ${editor.isActive('bold') ? 'bg-white/10' : 'hover:bg-white/5'}`}>B</button>
                    <button onClick={() => editor.chain().focus().toggleItalic().run()} className={`p-1 rounded ${editor.isActive('italic') ? 'bg-white/10' : 'hover:bg-white/5'}`}>I</button>
                    <button onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} className={`p-1 rounded ${editor.isActive('heading', { level: 1 }) ? 'bg-white/10' : 'hover:bg-white/5'}`}>H1</button>
                    <button onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={`p-1 rounded ${editor.isActive('heading', { level: 2 }) ? 'bg-white/10' : 'hover:bg-white/5'}`}>H2</button>
                    <button onClick={() => editor.chain().focus().toggleBulletList().run()} className={`p-1 rounded ${editor.isActive('bulletList') ? 'bg-white/10' : 'hover:bg-white/5'}`}>List</button>
                </div>
                <EditorContent editor={editor} />
            </div>
        </div>
    )
}
