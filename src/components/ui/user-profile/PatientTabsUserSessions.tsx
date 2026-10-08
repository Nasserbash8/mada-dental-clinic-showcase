'use client'
/**
 * Sessions & treatments tab (patient portal, abridged sample).
 * For every treatment: names, total cost, the dental map of treated teeth and a session log
 * where each payment is shown with its own currency.
 */
import { Handshake, CalendarDays, CircleDollarSign } from 'lucide-react'
import { DentalMap } from '../teeth/DentalMap'

interface Session { sessionId: string; sessionDate: Date; Payments: string; paymentCurrency?: string; PaymentsDate: Date }
interface Treatment {
  treatmentNames: { name: string }[]
  cost: number
  currency?: string
  teeth: { id: string; value: string; customTreatment?: string }[]
  sessions: Session[]
}

const fmt = (d: Date | string) => new Date(d).toLocaleDateString('en-US')

export default function UserSessions({ patient }: { patient: { treatments: Treatment[] } }) {
  return (
    <div className="space-y-2">
      <h4 className="text-2xl font-bold mb-10">Sessions & Treatments</h4>

      {patient.treatments.map((t, i) => (
        <div key={i} className="p-5 border rounded-2xl lg:p-6 mb-6">
          <p className="font-semibold mb-2">
            Treatment: <span className="font-normal">{t.treatmentNames.map((n) => n.name).join(' - ')}</span>
          </p>
          <p className="font-semibold mb-6 flex items-center gap-2">
            <CircleDollarSign className="w-5 h-5 text-brand-800" /> Total Cost:
            <span className="font-normal">{t.cost} {t.currency || 'SYP'}</span>
          </p>

          {/* Visual map: custom per-tooth treatments are marked inside DentalMap */}
          <DentalMap treatedTeeth={t.teeth} />

          <h4 className="text-lg font-bold my-6">Sessions Log:</h4>
          {t.sessions.map((s, j) => (
            <div key={s.sessionId || j} className="mb-8 last:mb-0">
              <p className="flex items-center gap-2 font-semibold mb-3">
                <Handshake className="w-5 h-5 text-brand-800" /> Session {j + 1}
              </p>
              <div className="grid sm:grid-cols-3 gap-4 text-sm">
                <span className="flex items-center gap-2"><CalendarDays className="w-5 h-5" /> {fmt(s.sessionDate)}</span>
                {/* Each payment keeps its own currency, independent of the treatment currency */}
                <span className="flex items-center gap-2"><CircleDollarSign className="w-5 h-5" /> {s.Payments} {s.paymentCurrency || 'SYP'}</span>
                <span className="flex items-center gap-2"><CalendarDays className="w-5 h-5" /> {fmt(s.PaymentsDate)}</span>
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}
