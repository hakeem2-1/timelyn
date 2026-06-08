"use client";

import { MessageSquare, Send } from "lucide-react";
import { useState } from "react";
import { useApp } from "@/context/AppProvider";
import { formatRelativeTime } from "@/lib/utils";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import type { Task } from "@/types";

interface TaskCommentsProps {
  task: Task;
}

export function TaskComments({ task }: TaskCommentsProps) {
  const { addTaskComment, getEmployeeById } = useApp();
  const [text, setText] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    addTaskComment(task.id, text.trim());
    setText("");
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-violet-400" />
          <h3 className="font-semibold text-zinc-100">
            Comments ({task.comments.length})
          </h3>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {task.comments.length === 0 ? (
          <p className="text-sm text-zinc-500">No comments yet. Start the discussion.</p>
        ) : (
          <div className="space-y-4">
            {task.comments.map((comment) => {
              const author = getEmployeeById(comment.authorId);
              return (
                <div key={comment.id} className="flex gap-3">
                  <Avatar initials={author?.avatar ?? "??"} size="sm" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline gap-2">
                      <span className="text-sm font-medium text-zinc-200">
                        {comment.authorName}
                      </span>
                      <span className="text-xs text-zinc-600">
                        {formatRelativeTime(comment.createdAt)}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-zinc-400">{comment.text}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex gap-2 border-t border-zinc-800/60 pt-4">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Add a comment..."
            className="flex-1 rounded-lg border border-zinc-800 bg-zinc-900/80 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-violet-500/50 focus:outline-none focus:ring-1 focus:ring-violet-500/30"
          />
          <Button type="submit" size="sm" disabled={!text.trim()}>
            <Send className="h-3.5 w-3.5" />
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
