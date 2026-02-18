"use client";

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { motion } from "framer-motion";
import { File, Folder, FileText } from "lucide-react";

export function WorkspaceView({ agentId }: { agentId: string }) {
    // const files = useQuery(api.workspace.listFiles, { agentId });
    const files: any[] = []; // Fallback temporário

    if (!files) return <div className="text-slate-500 text-xs animate-pulse">Escaneando workspace...</div>;
    if (files.length === 0) return <div className="text-slate-500 text-xs italic">Nenhum arquivo detectado no workspace.</div>;

    return (
        <div className="space-y-2">
            <h4 className="text-slate-500 text-[10px] uppercase font-bold tracking-widest mb-2">Monitoramento de Arquivos Live</h4>
            <div className="grid grid-cols-1 gap-1">
                {files.map((file: any) => (
                    <div
                        key={file._id}
                        className="flex items-center gap-3 p-2 rounded bg-white/5 border border-white/5 hover:bg-white/10 transition-colors group"
                    >
                        {file.type === 'directory' ? <Folder className="w-4 h-4 text-blue-400" /> :
                            file.type === 'log' ? <FileText className="w-4 h-4 text-rose-400 animate-pulse" /> :
                                <File className="w-4 h-4 text-slate-400" />}

                        <div className="flex-1 min-w-0">
                            <div className="text-xs text-slate-200 truncate font-mono">{file.name}</div>
                            <div className="text-[9px] text-slate-500 uppercase tracking-tighter">
                                {file.type} • {file.size ? `${(file.size / 1024).toFixed(1)} KB` : '--'} • {new Date(file.lastModified).toLocaleTimeString()}
                            </div>
                        </div>

                        {file.content && (
                            <div className="hidden group-hover:block absolute right-4 bg-slate-900 border border-white/10 p-2 rounded-lg max-w-xs shadow-2xl z-50">
                                <div className="text-[10px] text-rose-400 font-bold mb-1 uppercase">Live Log Tail:</div>
                                <pre className="text-[9px] text-slate-300 font-mono whitespace-pre-wrap">{file.content}</pre>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
