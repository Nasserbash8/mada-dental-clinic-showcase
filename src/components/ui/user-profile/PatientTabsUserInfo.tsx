'use client'
/**
 * Personal info tab (patient portal, abridged sample).
 * Shows who the patient is, the access code, medicines/illnesses and the next appointment.
 */
import { Phone, HeartPulse, IdCard, Calendar1, Pill } from 'lucide-react'

interface PatientType {
  name: string
  age: number
  work: string
  phone: string
  code: string
  illnesses: { illness: string }[]
  Medicines: { medicine: string }[]
  nextSessionDate?: string
}

/** Small reusable "icon + label + value" row. */
function Row({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 text-sm font-semibold">
      {icon}
      <span>{label}</span>
      <span className="font-normal text-[#666666]">{children}</span>
    </div>
  )
}

const list = (items: string[]) => (items.length ? items.join(', ') : 'None')

export default function UserInfoTabs({ patient }: { patient: PatientType }) {
  const icon = 'w-5 h-5 text-brand-800'

  return (
    <div className="p-3 border rounded-2xl lg:p-6">
      <div className="text-center mb-10">
        <h4 className="text-2xl font-bold mb-2">{patient.name}</h4>
        <p className="text-sm text-[#666666]">{patient.work} · {patient.age} Years Old</p>
      </div>

      <div className="flex flex-col gap-8 max-w-md">
        <Row icon={<IdCard className={icon} />} label="Patient Code:">{patient.code}</Row>
        <Row icon={<Phone className={icon} />} label="Phone Number:">{patient.phone}</Row>
        <Row icon={<Pill className={icon} />} label="Medicines:">{list(patient.Medicines.map((m) => m.medicine))}</Row>
        <Row icon={<HeartPulse className={icon} />} label="Illnesses:">{list(patient.illnesses.map((i) => i.illness))}</Row>
        <Row icon={<Calendar1 className={icon} />} label="Next Session:">
          {patient.nextSessionDate
            ? new Date(patient.nextSessionDate).toLocaleString('en-US', { dateStyle: 'full', timeStyle: 'short' })
            : 'Not scheduled'}
        </Row>
      </div>
    </div>
  )
}
