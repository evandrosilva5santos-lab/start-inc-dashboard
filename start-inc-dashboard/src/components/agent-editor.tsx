'use client'

import { useState, useEffect } from 'react'
import { supabase, type Agent } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { toast } from 'sonner'
import { Loader2, Save } from 'lucide-react'

type AgentEditorProps = {
    agent: Agent | null
    isOpen: boolean
    onClose: () => void
    onSave: () => void
}

export function AgentEditor({ agent, isOpen, onClose, onSave }: AgentEditorProps) {
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState<Partial<Agent>>({})
    const [respText, setRespText] = useState('')

    useEffect(() => {
        if (agent) {
            setFormData(agent)
            setRespText(Array.isArray(agent.responsibilities) ? agent.responsibilities.join(', ') : '')
        }
    }, [agent])

    const handleSave = async () => {
        if (!agent) return
        setLoading(true)

        try {
            const responsibilities = respText.split(',').map(s => s.trim()).filter(s => s !== '')

            const { error } = await supabase
                .from('[OpenClaw] Dashboard - Agents')
                .update({
                    name: formData.name,
                    role: formData.role,
                    emoji: formData.emoji,
                    level: formData.level,
                    autonomy: formData.autonomy,
                    model: formData.model,
                    profile: formData.profile,
                    responsibilities: responsibilities
                })
                .eq('id', agent.id)

            if (error) throw error

            toast.success('Agente atualizado com sucesso!')
            onSave()
            onClose()
        } catch (error) {
            console.error('Erro ao salvar agente:', error)
            toast.error('Erro ao salvar as alterações.')
        } finally {
            setLoading(false)
        }
    }

    if (!agent) return null

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[600px] bg-slate-900 border-slate-700 text-white">
                <DialogHeader>
                    <DialogTitle>Editar Agente: {agent.name}</DialogTitle>
                    <DialogDescription className="text-slate-400">
                        Altere as propriedades do agente. As mudanças serão salvas no Supabase.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto pr-2">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Nome</Label>
                            <Input
                                id="name"
                                value={formData.name || ''}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="bg-slate-800 border-slate-700"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="emoji">Emoji</Label>
                            <Input
                                id="emoji"
                                value={formData.emoji || ''}
                                onChange={(e) => setFormData({ ...formData, emoji: e.target.value })}
                                className="bg-slate-800 border-slate-700"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="role">Cargo / Função</Label>
                        <Input
                            id="role"
                            value={formData.role || ''}
                            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                            className="bg-slate-800 border-slate-700"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Nível</Label>
                            <Select
                                value={formData.level}
                                onValueChange={(v: any) => setFormData({ ...formData, level: v })}
                            >
                                <SelectTrigger className="bg-slate-800 border-slate-700">
                                    <SelectValue placeholder="Selecione o nível" />
                                </SelectTrigger>
                                <SelectContent className="bg-slate-900 border-slate-700 text-white">
                                    <SelectItem value="strategic">Estratégico</SelectItem>
                                    <SelectItem value="tactical">Tático</SelectItem>
                                    <SelectItem value="operational">Operacional</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Autonomia</Label>
                            <Select
                                value={formData.autonomy}
                                onValueChange={(v: any) => setFormData({ ...formData, autonomy: v })}
                            >
                                <SelectTrigger className="bg-slate-800 border-slate-700">
                                    <SelectValue placeholder="Selecione a autonomia" />
                                </SelectTrigger>
                                <SelectContent className="bg-slate-900 border-slate-700 text-white">
                                    <SelectItem value="high">Alta</SelectItem>
                                    <SelectItem value="medium">Média</SelectItem>
                                    <SelectItem value="low">Baixa</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="model">Modelo de IA</Label>
                        <Input
                            id="model"
                            value={formData.model || ''}
                            onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                            className="bg-slate-800 border-slate-700"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="profile">Perfil / Personalidade</Label>
                        <Textarea
                            id="profile"
                            value={formData.profile || ''}
                            onChange={(e) => setFormData({ ...formData, profile: e.target.value })}
                            className="bg-slate-800 border-slate-700 min-h-[100px]"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="responsibilities">Responsabilidades (separadas por vírgula)</Label>
                        <Textarea
                            id="responsibilities"
                            value={respText}
                            onChange={(e) => setRespText(e.target.value)}
                            className="bg-slate-800 border-slate-700"
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose} className="border-slate-700 text-slate-300">
                        Cancelar
                    </Button>
                    <Button onClick={handleSave} disabled={loading} className="bg-blue-600 hover:bg-blue-700">
                        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                        Salvar Alterações
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
