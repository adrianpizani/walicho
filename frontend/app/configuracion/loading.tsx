import { Skeleton } from "@/components/ui/skeleton"

export default function ConfiguracionLoading() {
  return (
    <div className="h-screen overflow-y-auto p-6">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-96" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-40" />
          </div>
        </div>
        <Skeleton className="h-[600px] w-full" />
      </div>
    </div>
  )
}
