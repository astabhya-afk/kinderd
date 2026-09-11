"use client"

import { useEffect, useRef, useState } from "react"
import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport } from "ai"
import { Sparkles, X, Send, Loader2, Target, TrendingUp } from "lucide-react"
import { cn } from "@/lib/utils"
import type { UserProfile } from "@/lib/kindred-data"

function ToolResultView({ toolName, output }: { toolName: string; output: unknown }) {
  if ((toolName === "getRecommendations" || toolName === "getClubRecommendations") && Array.isArray(output)) {
    return (
      <div className="mt-2 flex flex-col gap-2">
        {output.map((rec) => (
          <div key={rec.id} className="rounded-xl border border-border bg-background p-3">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-semibold text-foreground">{rec.title}</p>
              <span className="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary">
                {rec.score}% fit
              </span>
            </div>
            <p className="text-xs text-muted-foreground">{rec.org}</p>
            {rec.matchedSkills.length > 0 ? (
              <p className="mt-1.5 text-xs text-muted-foreground">
                <span className="font-medium text-foreground">Matched:</span>{" "}
                {rec.matchedSkills.join(", ")}
              </p>
            ) : null}
          </div>
        ))}
      </div>
    )
  }

  if (toolName === "getSkillGaps" && Array.isArray(output)) {
    return (
      <div className="mt-2 flex flex-wrap gap-1.5">
        {output.map((skill: string) => (
          <span
            key={skill}
            className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-1 text-xs font-medium text-amber-600 dark:text-amber-400"
          >
            <TrendingUp className="size-3" />
            {skill}
          </span>
        ))}
      </div>
    )
  }

  return null
}

export function CareerCoach({ profile }: { profile: UserProfile }) {
  const [open, setOpen] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const [input, setInput] = useState("")

  const { messages, sendMessage, status, error } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/career-coach",
      body: () => ({ profile }),
    }),
  })

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" })
  }, [messages])

  const isBusy = status === "streaming" || status === "submitted"

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = input.trim()
    if (!trimmed || isBusy) return
    sendMessage({ text: trimmed })
    setInput("")
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing && e.keyCode !== 229) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  const suggestions = [
    "What should I apply to first?",
    "What skills am I missing?",
    "What clubs should I join?",
  ]

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Open Kindred AI recommendation coach"
        className={cn(
          "fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-full bg-primary px-4 py-3.5 text-sm font-semibold text-primary-foreground shadow-lg transition-transform hover:scale-105",
          open && "hidden",
        )}
      >
        <Sparkles className="size-4" />
        AI Coach
      </button>

      <div
        className={cn(
          "fixed bottom-6 right-6 z-50 flex h-[560px] w-[380px] flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl transition-all",
          open ? "opacity-100" : "pointer-events-none translate-y-4 opacity-0",
        )}
        role="dialog"
        aria-hidden={!open}
        aria-label="AI recommendation coach"
      >
        <header className="flex items-center justify-between border-b border-border bg-primary px-4 py-3.5 text-primary-foreground">
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-full bg-primary-foreground/15">
              <Sparkles className="size-4" />
            </div>
            <div>
              <p className="text-sm font-bold leading-tight">Recommendation Coach</p>
              <p className="text-[11px] leading-tight opacity-80">Jobs, internships & clubs — matched to you</p>
            </div>
          </div>
          <button
            onClick={() => setOpen(false)}
            aria-label="Close"
            className="flex size-7 items-center justify-center rounded-full transition-colors hover:bg-primary-foreground/15"
          >
            <X className="size-4" />
          </button>
        </header>

        <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4">
          {messages.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
              <div className="flex size-12 items-center justify-center rounded-full bg-accent text-accent-foreground">
                <Target className="size-5" />
              </div>
              <p className="text-sm font-semibold text-foreground">Ask me about your matches</p>
              <p className="max-w-[240px] text-xs text-muted-foreground">
                I rank jobs, internships, and campus clubs against your real skill data and explain why they fit.
              </p>
              <div className="mt-2 flex flex-col gap-1.5">
                {suggestions.map((s) => (
                  <button
                    key={s}
                    onClick={() => sendMessage({ text: s })}
                    className="rounded-full border border-border px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn("flex", message.role === "user" ? "justify-end" : "justify-start")}
                >
                  <div
                    className={cn(
                      "max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm",
                      message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-foreground",
                    )}
                  >
                    {message.parts.map((part, i) => {
                      if (part.type === "text") {
                        return (
                          <p key={i} className="whitespace-pre-wrap leading-relaxed">
                            {part.text}
                          </p>
                        )
                      }
                      if (
                        part.type === "tool-getRecommendations" ||
                        part.type === "tool-getClubRecommendations" ||
                        part.type === "tool-getSkillGaps"
                      ) {
                        if (part.state === "output-available") {
                          return (
                            <ToolResultView
                              key={i}
                              toolName={part.type.replace("tool-", "")}
                              output={part.output}
                            />
                          )
                        }
                        return (
                          <p key={i} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Loader2 className="size-3 animate-spin" />
                            Scoring your opportunities...
                          </p>
                        )
                      }
                      return null
                    })}
                  </div>
                </div>
              ))}
              {isBusy && messages[messages.length - 1]?.role === "user" ? (
                <div className="flex justify-start">
                  <div className="flex items-center gap-1.5 rounded-2xl bg-muted px-3.5 py-2.5 text-sm text-muted-foreground">
                    <Loader2 className="size-3.5 animate-spin" />
                    Thinking...
                  </div>
                </div>
              ) : null}
            </div>
          )}
          {error ? (
            <div className="mt-3 rounded-xl border border-destructive/30 bg-destructive/10 px-3.5 py-2.5 text-xs text-destructive">
              Something went wrong: {error.message || "the coach couldn't respond. Please try again."}
            </div>
          ) : null}
        </div>

        <form onSubmit={handleSubmit} className="flex items-end gap-2 border-t border-border p-3">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about your matches..."
            rows={1}
            className="flex-1 resize-none rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/30"
          />
          <button
            type="submit"
            disabled={isBusy || !input.trim()}
            aria-label="Send"
            className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground transition-opacity disabled:opacity-40"
          >
            <Send className="size-4" />
          </button>
        </form>
      </div>
    </>
  )
}
