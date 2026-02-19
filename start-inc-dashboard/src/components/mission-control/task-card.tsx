"use client";

import { motion } from "framer-motion";
import { AlertCircle, Calendar, Users, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface Task {
  _id: string;
  title: string;
  description?: string;
  status: "inbox" | "assigned" | "in_progress" | "review" | "done";
  priority: "critical" | "high" | "medium" | "low";
  assigneeIds: string[];
  createdAt: number;
  updatedAt: number;
}

interface TaskCardProps {
  task: Task;
  index: number;
  onDragStart: (task: Task) => void;
  onDragEnd: () => void;
}

export default function TaskCard({ task, index, onDragStart, onDragEnd }: TaskCardProps) {
  const colorScheme = task.priority === 'critical' ? {
    bg: "bg-red-500/20",
    border: "border-red-500/30",
    text: "text-red-400",
    glow: "shadow-red-500/20 shadow-lg",
  } : task.priority === 'high' ? {
    bg: "bg-orange-500/20",
    border: "border-orange-500/30",
    text: "text-orange-400",
    glow: "shadow-orange-500/20 shadow-lg",
  } : {
    bg: "bg-indigo-500/20",
    border: "border-indigo-500/30",
    text: "text-indigo-400",
    glow: "shadow-indigo-500/20 shadow-lg",
  };

  return (
    <motion.div
      key={task._id}
      layout
      initial={{ opacity: 0, y: 20 * index, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration: 0.3,
        layout: { x: 0, y: 0 },
      }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onDragStart={() => onDragStart(task)}
      onDragEnd={onDragEnd}
      drag
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      dragElastic={0.1}
      className={cn(
        "p-4 rounded-xl cursor-grab active:scale-[0.98] backdrop-blur-sm border-2",
        colorScheme.bg,
        colorScheme.border,
        colorScheme.text,
        colorScheme.glow,
        "hover:brightness-110"
      )}
      style={{
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.2)',
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-bold leading-snug text-slate-100 truncate pr-2">
            {task.title}
          </h3>
          <div className="flex items-center gap-2 mt-1">
            <span className={cn(
              "px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider font-medium",
              task.priority === 'critical' ? "bg-red-500/30 text-red-400" :
              task.priority === 'high' ? "bg-orange-500/20 text-orange-400" :
              "bg-indigo-500/20 text-indigo-400"
            )}>
              {task.priority}
            </span>
            {task.status !== 'done' && task.status !== 'inbox' && (
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>{new Date(task.createdAt * 1000).toLocaleDateString('pt-BR')}</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Description */}
      {task.description && (
        <p className="text-sm leading-relaxed mb-3 line-clamp-2 opacity-90 text-slate-200">
          {task.description}
        </p>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between">
        {/* Assignees */}
        {task.assigneeIds && task.assigneeIds.length > 0 && (
          <div className="flex items-center gap-2">
            <Users className="w-3 h-3 text-slate-500" />
            <span className="text-xs text-slate-500 font-medium">
              {task.assigneeIds.length}
            </span>
          </div>
        )}

        {/* Time */}
        <div className="flex items-center gap-1 text-xs text-slate-600">
          <Calendar className="w-3 h-3" />
          <span>
            {new Date(task.createdAt * 1000).toLocaleString('pt-BR', {
              day: '2-digit',
              month: 'short',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
