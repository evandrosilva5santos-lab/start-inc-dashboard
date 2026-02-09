'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { RefreshCw, Download, Upload, AlertCircle, CheckCircle2 } from 'lucide-react'
import { supabase, type Agent } from '@/lib/supabase'

export function OpenClawSync() {
    const [syncing, setSyncing] = useState(false)
    const [exporting, setExporting] = useState(false)
    const [status, setStatus] = useState<{ type: 'success' | 'error' | null, message: string }>({ type: null, message: '' })

    async function syncFromOpenClaw() {
        setSyncing(true)
        setStatus({ type: null, message: '' })

        try {
            // Fetch openclaw.json from server via SSH
            const response = await fetch('/api/openclaw/sync', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'import' })
            })

            if (!response.ok) throw new Error('Falha ao sincronizar')

            const data = await response.json()
            setStatus({ type: 'success', message: `${data.count} agentes sincronizados com sucesso!` })
        } catch (error) {
            setStatus({ type: 'error', message: 'Erro ao sincronizar com OpenClaw' })
            console.error(error)
        } finally {
            setSyncing(false)
        }
    }

    async function exportToOpenClaw() {
        setExporting(true)
        setStatus({ type: null, message: '' })

        try {
            // Get all agents from Supabase
            const { data: agents, error } = await supabase
                .from('agents')
                .select('*')
                .order('level', { ascending: true })

            if (error) throw error

            // Generate OpenClaw-compatible JSON
            const openclawConfig = {
                meta: { lastTouchedVersion: new Date().toISOString().split('T')[0] },
                agents: {
                    defaults: {
                        model: { primary: 'zai/glm-4.7', fallbacks: ['google/gemini-2.5-flash'] },
                        workspace: '/root/clawd'
                    },
                    list: agents?.map(agent => ({
                        id: agent.name.toLowerCase().replace(/\s+/g, '-'),
                        name: agent.name,
                        workspace: agent.workspace_path,
                        model: agent.model ? { primary: agent.model } : undefined
                    })) || []
                }
            }

            // Download as JSON file
            const blob = new Blob([JSON.stringify(openclawConfig, null, 2)], { type: 'application/json' })
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = 'openclaw.json'
            a.click()
            URL.revokeObjectURL(url)

            setStatus({ type: 'success', message: 'Configuração exportada com sucesso!' })
        } catch (error) {
            setStatus({ type: 'error', message: 'Erro ao exportar configuração' })
            console.error(error)
        } finally {
            setExporting(false)
        }
    }

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline" className="gap-2 bg-slate-900/50 border-slate-700">
                    <RefreshCw className="h-4 w-4" />
                    Sincronizar OpenClaw
                </Button>
            </DialogTrigger>
            <DialogContent className="bg-slate-900 border-slate-700 max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Sincronização com OpenClaw</DialogTitle>
                    <DialogDescription>
                        Sincronize os agentes entre o Supabase e o OpenClaw
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    {status.type && (
                        <Card className={status.type === 'success' ? 'border-green-500/50 bg-green-500/10' : 'border-red-500/50 bg-red-500/10'}>
                            <CardContent className="pt-6">
                                <div className="flex items-center gap-3">
                                    {status.type === 'success' ? (
                                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                                    ) : (
                                        <AlertCircle className="h-5 w-5 text-red-500" />
                                    )}
                                    <p className={status.type === 'success' ? 'text-green-500' : 'text-red-500'}>
                                        {status.message}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    <Card className="bg-slate-800/50 border-slate-700">
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Download className="h-5 w-5 text-blue-500" />
                                Importar do OpenClaw
                            </CardTitle>
                            <CardDescription>
                                Lê o arquivo openclaw.json do servidor e atualiza o Supabase
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button
                                onClick={syncFromOpenClaw}
                                disabled={syncing}
                                className="w-full"
                            >
                                {syncing ? (
                                    <>
                                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                        Sincronizando...
                                    </>
                                ) : (
                                    <>
                                        <Download className="h-4 w-4 mr-2" />
                                        Importar Agentes
                                    </>
                                )}
                            </Button>
                        </CardContent>
                    </Card>

                    <Card className="bg-slate-800/50 border-slate-700">
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Upload className="h-5 w-5 text-purple-500" />
                                Exportar para OpenClaw
                            </CardTitle>
                            <CardDescription>
                                Gera um arquivo openclaw.json compatível com os agentes do Supabase
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button
                                onClick={exportToOpenClaw}
                                disabled={exporting}
                                variant="secondary"
                                className="w-full"
                            >
                                {exporting ? (
                                    <>
                                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                        Exportando...
                                    </>
                                ) : (
                                    <>
                                        <Upload className="h-4 w-4 mr-2" />
                                        Baixar openclaw.json
                                    </>
                                )}
                            </Button>
                        </CardContent>
                    </Card>

                    <Card className="bg-blue-500/10 border-blue-500/50">
                        <CardContent className="pt-6">
                            <div className="flex items-start gap-3">
                                <AlertCircle className="h-5 w-5 text-blue-500 mt-0.5" />
                                <div className="space-y-2 text-sm">
                                    <p className="text-blue-400 font-semibold">Importante:</p>
                                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                                        <li>A importação sobrescreve os dados do Supabase</li>
                                        <li>A exportação não altera o servidor, apenas baixa o arquivo</li>
                                        <li>Sempre faça backup antes de importar</li>
                                    </ul>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </DialogContent>
        </Dialog>
    )
}
