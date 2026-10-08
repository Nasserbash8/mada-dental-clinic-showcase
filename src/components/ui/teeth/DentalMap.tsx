'use client'
/**
 * DentalMap (abridged sample)
 * Read-only chart of the four quadrants. A tooth is highlighted when it is
 * treated directly, or through a quadrant / smile group id. Teeth that carry a
 * custom treatment get a small red marker.
 */
import { ToothShape } from '@/icons'
import { TOOTH_GROUPS } from '@/utils/toothGroups'

interface DentalMapProps {
  treatedTeeth: { id: string; value: string; customTreatment?: string }[]
}

export const DentalMap = ({ treatedTeeth }: DentalMapProps) => {
  const treated = new Set(treatedTeeth.map((t) => t.id))
  const custom = new Set(treatedTeeth.filter((t) => t.customTreatment?.trim()).map((t) => t.id))

  // A tooth is "treated" if it is listed itself or belongs to any listed group.
  const isTreated = (id: string) =>
    treated.has(id) || Object.entries(TOOTH_GROUPS).some(([gid, ids]) => treated.has(gid) && ids.includes(id))

  const quadrant = (q: 'LU' | 'RU' | 'LD' | 'RD') => {
    // Left quadrants are drawn from the back teeth to the front, mirroring the real mouth.
    const numbers = Array.from({ length: 8 }, (_, i) => i + 1)
    if (q.startsWith('L')) numbers.reverse()

    return (
      <div key={q} className="flex gap-1 flex-wrap items-center justify-center">
        {numbers.map((n) => {
          const id = `${q}${n}`
          return (
            <div key={id} className="flex flex-col items-center space-y-1">
              <span className="text-[10px] text-gray-600">{id}</span>
              <div className="relative">
                <ToothShape fill="#d1922b" stroke="#d1922b" className={`w-5 h-7 md:w-8 md:h-10 ${isTreated(id) ? '' : 'fill-gray-100'}`} />
                {custom.has(id) && <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full border border-white" />}
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div className="py-4 text-center space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">{(['LU', 'RU'] as const).map(quadrant)}</div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">{(['LD', 'RD'] as const).map(quadrant)}</div>
    </div>
  )
}
