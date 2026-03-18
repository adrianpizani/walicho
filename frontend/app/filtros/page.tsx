"use client"

import { useState } from "react"
import { ArrowLeft, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Slider } from "@/components/ui/slider"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

export default function AdvancedFiltersPage() {
  const [selectedRegions, setSelectedRegions] = useState<string[]>([])
  const [selectedParties, setSelectedParties] = useState<string[]>([])
  const [selectedCandidates, setSelectedCandidates] = useState<string[]>([])
  const [voteRange, setVoteRange] = useState([0, 100000])
  const [participationRange, setParticipationRange] = useState([0, 100])
  const [electionType, setElectionType] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")

  const regions = [
    { id: "norte", name: "Región Norte" },
    { id: "centro", name: "Región Centro" },
    { id: "sur", name: "Región Sur" },
    { id: "este", name: "Región Este" },
    { id: "oeste", name: "Región Oeste" },
  ]

  const parties = [
    { id: "A", name: "Partido A", color: "#3b82f6" },
    { id: "B", name: "Partido B", color: "#ef4444" },
    { id: "C", name: "Partido C", color: "#22c55e" },
    { id: "D", name: "Partido D", color: "#f59e0b" },
  ]

  const candidates = [
    { id: "1", name: "Juan Pérez", party: "A" },
    { id: "2", name: "María García", party: "B" },
    { id: "3", name: "Carlos López", party: "C" },
    { id: "4", name: "Ana Martínez", party: "D" },
  ]

  const toggleRegion = (regionId: string) => {
    setSelectedRegions((prev) => (prev.includes(regionId) ? prev.filter((id) => id !== regionId) : [...prev, regionId]))
  }

  const toggleParty = (partyId: string) => {
    setSelectedParties((prev) => (prev.includes(partyId) ? prev.filter((id) => id !== partyId) : [...prev, partyId]))
  }

  const toggleCandidate = (candidateId: string) => {
    setSelectedCandidates((prev) =>
      prev.includes(candidateId) ? prev.filter((id) => id !== candidateId) : [...prev, candidateId],
    )
  }

  const clearAllFilters = () => {
    setSelectedRegions([])
    setSelectedParties([])
    setSelectedCandidates([])
    setVoteRange([0, 100000])
    setParticipationRange([0, 100])
    setElectionType("all")
    setSearchTerm("")
  }

  const activeFiltersCount =
    selectedRegions.length +
    selectedParties.length +
    selectedCandidates.length +
    (electionType !== "all" ? 1 : 0) +
    (voteRange[0] !== 0 || voteRange[1] !== 100000 ? 1 : 0) +
    (participationRange[0] !== 0 || participationRange[1] !== 100 ? 1 : 0)

  return (
    <div className="flex h-screen flex-col">
      {/* Header */}
      <div className="border-b border-border bg-card px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button asChild variant="ghost" size="icon">
              <Link href="/">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-semibold">Filtros Avanzados</h1>
              <p className="text-sm text-muted-foreground">Configure filtros detallados para el análisis electoral</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="h-6">
                {activeFiltersCount} filtros activos
              </Badge>
            )}
            <Button variant="outline" onClick={clearAllFilters}>
              Limpiar todo
            </Button>
            <Button asChild>
              <Link href="/">Aplicar filtros</Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto bg-muted/30 p-6">
        <div className="mx-auto max-w-5xl space-y-6">
          <Tabs defaultValue="geographic" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="geographic">Geográfico</TabsTrigger>
              <TabsTrigger value="political">Político</TabsTrigger>
              <TabsTrigger value="demographic">Demográfico</TabsTrigger>
              <TabsTrigger value="temporal">Temporal</TabsTrigger>
            </TabsList>

            {/* Geographic Filters */}
            <TabsContent value="geographic" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Filtros Geográficos</CardTitle>
                  <CardDescription>Seleccione regiones y áreas específicas para analizar</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label className="mb-3 block text-sm font-medium">Regiones</Label>
                    <div className="grid grid-cols-2 gap-3">
                      {regions.map((region) => (
                        <div key={region.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={region.id}
                            checked={selectedRegions.includes(region.id)}
                            onCheckedChange={() => toggleRegion(region.id)}
                          />
                          <label
                            htmlFor={region.id}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            {region.name}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <Label className="mb-3 block text-sm font-medium">Tipo de Área</Label>
                    <RadioGroup defaultValue="all">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="all" id="area-all" />
                        <Label htmlFor="area-all">Todas las áreas</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="urban" id="area-urban" />
                        <Label htmlFor="area-urban">Áreas urbanas</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="rural" id="area-rural" />
                        <Label htmlFor="area-rural">Áreas rurales</Label>
                      </div>
                    </RadioGroup>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Political Filters */}
            <TabsContent value="political" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Filtros Políticos</CardTitle>
                  <CardDescription>Filtre por partidos políticos y candidatos</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label className="mb-3 block text-sm font-medium">Partidos Políticos</Label>
                    <div className="grid grid-cols-2 gap-3">
                      {parties.map((party) => (
                        <div key={party.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`party-${party.id}`}
                            checked={selectedParties.includes(party.id)}
                            onCheckedChange={() => toggleParty(party.id)}
                          />
                          <label
                            htmlFor={`party-${party.id}`}
                            className="flex items-center gap-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            <div className="h-3 w-3 rounded-sm" style={{ backgroundColor: party.color }} />
                            {party.name}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <div className="mb-3 flex items-center justify-between">
                      <Label className="text-sm font-medium">Candidatos</Label>
                      <div className="relative w-64">
                        <Search className="absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          placeholder="Buscar candidato..."
                          className="h-8 pl-8 text-xs"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      {candidates
                        .filter((candidate) => candidate.name.toLowerCase().includes(searchTerm.toLowerCase()))
                        .map((candidate) => (
                          <div key={candidate.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={`candidate-${candidate.id}`}
                              checked={selectedCandidates.includes(candidate.id)}
                              onCheckedChange={() => toggleCandidate(candidate.id)}
                            />
                            <label
                              htmlFor={`candidate-${candidate.id}`}
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              {candidate.name}
                              <span className="ml-2 text-xs text-muted-foreground">({candidate.party})</span>
                            </label>
                          </div>
                        ))}
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <Label className="mb-3 block text-sm font-medium">
                      Rango de Votos: {voteRange[0].toLocaleString()} - {voteRange[1].toLocaleString()}
                    </Label>
                    <Slider
                      min={0}
                      max={100000}
                      step={1000}
                      value={voteRange}
                      onValueChange={setVoteRange}
                      className="w-full"
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Demographic Filters */}
            <TabsContent value="demographic" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Filtros Demográficos</CardTitle>
                  <CardDescription>Analice datos según características demográficas</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label className="mb-3 block text-sm font-medium">
                      Participación Electoral: {participationRange[0]}% - {participationRange[1]}%
                    </Label>
                    <Slider
                      min={0}
                      max={100}
                      step={1}
                      value={participationRange}
                      onValueChange={setParticipationRange}
                      className="w-full"
                    />
                  </div>

                  <Separator />

                  <div>
                    <Label className="mb-3 block text-sm font-medium">Rango de Edad</Label>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox id="age-18-25" />
                        <label htmlFor="age-18-25" className="text-sm font-medium">
                          18-25 años
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="age-26-40" />
                        <label htmlFor="age-26-40" className="text-sm font-medium">
                          26-40 años
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="age-41-60" />
                        <label htmlFor="age-41-60" className="text-sm font-medium">
                          41-60 años
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="age-60plus" />
                        <label htmlFor="age-60plus" className="text-sm font-medium">
                          60+ años
                        </label>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <Label className="mb-3 block text-sm font-medium">Género</Label>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox id="gender-male" />
                        <label htmlFor="gender-male" className="text-sm font-medium">
                          Masculino
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="gender-female" />
                        <label htmlFor="gender-female" className="text-sm font-medium">
                          Femenino
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="gender-other" />
                        <label htmlFor="gender-other" className="text-sm font-medium">
                          Otro
                        </label>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Temporal Filters */}
            <TabsContent value="temporal" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Filtros Temporales</CardTitle>
                  <CardDescription>Configure rangos de fechas y períodos electorales</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label className="mb-3 block text-sm font-medium">Tipo de Elección</Label>
                    <RadioGroup value={electionType} onValueChange={setElectionType}>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="all" id="election-all" />
                        <Label htmlFor="election-all">Todas las elecciones</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="presidential" id="election-presidential" />
                        <Label htmlFor="election-presidential">Presidenciales</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="legislative" id="election-legislative" />
                        <Label htmlFor="election-legislative">Legislativas</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="municipal" id="election-municipal" />
                        <Label htmlFor="election-municipal">Municipales</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <Separator />

                  <div>
                    <Label className="mb-3 block text-sm font-medium">Años Electorales</Label>
                    <div className="grid grid-cols-3 gap-3">
                      {[2024, 2023, 2022, 2021, 2020, 2019].map((year) => (
                        <div key={year} className="flex items-center space-x-2">
                          <Checkbox id={`year-${year}`} />
                          <label htmlFor={`year-${year}`} className="text-sm font-medium">
                            {year}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <Label className="mb-3 block text-sm font-medium">Rondas Electorales</Label>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox id="round-first" />
                        <label htmlFor="round-first" className="text-sm font-medium">
                          Primera vuelta
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="round-second" />
                        <label htmlFor="round-second" className="text-sm font-medium">
                          Segunda vuelta
                        </label>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
