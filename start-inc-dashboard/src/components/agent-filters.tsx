'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Separator } from '@/components/ui/separator'
import { Filter, X } from 'lucide-react'

type FilterState = {
    search: string
    levels: string[]
    autonomy: string[]
    models: string[]
}

type AgentFiltersProps = {
    onFilterChange: (filters: FilterState) => void
    activeFilters: FilterState
}

export function AgentFilters({ onFilterChange, activeFilters }: AgentFiltersProps) {
    const [open, setOpen] = useState(false)

    const toggleFilter = (category: keyof Omit<FilterState, 'search'>, value: string) => {
        const current = activeFilters[category]
        const updated = current.includes(value)
            ? current.filter(v => v !== value)
            : [...current, value]

        onFilterChange({ ...activeFilters, [category]: updated })
    }

    const clearFilters = () => {
        onFilterChange({
            search: '',
            levels: [],
            autonomy: [],
            models: []
        })
    }

    const activeFilterCount =
        activeFilters.levels.length +
        activeFilters.autonomy.length +
        activeFilters.models.length +
        (activeFilters.search ? 1 : 0)

    const FilterBadge = ({ active, onClick, children }: { active: boolean, onClick: () => void, children: React.ReactNode }) => (
        <Badge
            variant={active ? "default" : "outline"}
            className="cursor-pointer hover:bg-blue-500/20"
            onClick={onClick}
        >
            {children}
        </Badge>
    )

    return (
        <div className="flex gap-3 items-center flex-wrap">
            <Input
                placeholder="🔍 Buscar agente..."
                value={activeFilters.search}
                onChange={(e) => onFilterChange({ ...activeFilters, search: e.target.value })}
                className="max-w-xs bg-slate-900/50 border-slate-700"
            />

            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button variant="outline" className="gap-2 bg-slate-900/50 border-slate-700">
                        <Filter className="h-4 w-4" />
                        Filtros
                        {activeFilterCount > 0 && (
                            <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 flex items-center justify-center">
                                {activeFilterCount}
                            </Badge>
                        )}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 bg-slate-900 border-slate-700" align="start">
                    <div className="space-y-4">
                        <div>
                            <h4 className="font-semibold mb-2 text-sm">Nível Hierárquico</h4>
                            <div className="flex gap-2 flex-wrap">
                                <FilterBadge
                                    active={activeFilters.levels.includes('strategic')}
                                    onClick={() => toggleFilter('levels', 'strategic')}
                                >
                                    Estratégico
                                </FilterBadge>
                                <FilterBadge
                                    active={activeFilters.levels.includes('tactical')}
                                    onClick={() => toggleFilter('levels', 'tactical')}
                                >
                                    Tático
                                </FilterBadge>
                                <FilterBadge
                                    active={activeFilters.levels.includes('operational')}
                                    onClick={() => toggleFilter('levels', 'operational')}
                                >
                                    Operacional
                                </FilterBadge>
                            </div>
                        </div>

                        <Separator />

                        <div>
                            <h4 className="font-semibold mb-2 text-sm">Autonomia</h4>
                            <div className="flex gap-2 flex-wrap">
                                <FilterBadge
                                    active={activeFilters.autonomy.includes('high')}
                                    onClick={() => toggleFilter('autonomy', 'high')}
                                >
                                    Alta
                                </FilterBadge>
                                <FilterBadge
                                    active={activeFilters.autonomy.includes('medium')}
                                    onClick={() => toggleFilter('autonomy', 'medium')}
                                >
                                    Média
                                </FilterBadge>
                                <FilterBadge
                                    active={activeFilters.autonomy.includes('low')}
                                    onClick={() => toggleFilter('autonomy', 'low')}
                                >
                                    Baixa
                                </FilterBadge>
                            </div>
                        </div>

                        <Separator />

                        <div>
                            <h4 className="font-semibold mb-2 text-sm">Modelo de IA</h4>
                            <div className="flex gap-2 flex-wrap">
                                <FilterBadge
                                    active={activeFilters.models.includes('claude')}
                                    onClick={() => toggleFilter('models', 'claude')}
                                >
                                    Claude
                                </FilterBadge>
                                <FilterBadge
                                    active={activeFilters.models.includes('zai')}
                                    onClick={() => toggleFilter('models', 'zai')}
                                >
                                    ZAI
                                </FilterBadge>
                                <FilterBadge
                                    active={activeFilters.models.includes('gemini')}
                                    onClick={() => toggleFilter('models', 'gemini')}
                                >
                                    Gemini
                                </FilterBadge>
                            </div>
                        </div>

                        {activeFilterCount > 0 && (
                            <>
                                <Separator />
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={clearFilters}
                                    className="w-full gap-2"
                                >
                                    <X className="h-4 w-4" />
                                    Limpar Filtros
                                </Button>
                            </>
                        )}
                    </div>
                </PopoverContent>
            </Popover>

            {activeFilterCount > 0 && (
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    className="gap-2"
                >
                    <X className="h-4 w-4" />
                    Limpar
                </Button>
            )}
        </div>
    )
}
