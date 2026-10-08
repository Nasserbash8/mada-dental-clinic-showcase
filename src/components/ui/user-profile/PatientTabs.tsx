'use client'
/**
 * PatientTabs (patient portal shell, abridged sample)
 * Read-only account area: personal info, sessions & treatments, logout.
 * Tabs are vertical on desktop and horizontal/scrollable on small screens.
 */
import { useState } from 'react'
import { Box, useMediaQuery, Tabs, Tab } from '@mui/material'
import { signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import TabPanel from './TabPanel'

// Heavy tab contents are loaded on demand.
const UserInfoTabs = dynamic(() => import('./PatientTabsUserInfo'))
const UserSessions = dynamic(() => import('./PatientTabsUserSessions'))

type Props = { patient: { name: string; code: string } & Record<string, any> }

export default function PatientTabs({ patient }: Props) {
  const isMobile = useMediaQuery('(max-width:1000px)')
  const [value, setValue] = useState(0)
  const router = useRouter()

  const logout = async () => {
    await signOut({ redirect: false }) // end the session without a full page reload
    router.push('/login')
  }

  return (
    <Box sx={{ width: '100%', display: isMobile ? 'block' : 'flex', gap: 5 }}>
      <aside className={isMobile ? 'w-full' : 'w-1/4'}>
        <div className="text-center p-5">
          <img className="mx-auto h-[70px] object-contain mb-4" src="/images/mada_icon.svg" alt="Logo" />
          <h4 className="text-2xl font-bold">{patient.name}</h4>
          <h5 className="text-sm">{patient.code}</h5>
        </div>

        <Tabs
          orientation={isMobile ? 'horizontal' : 'vertical'}
          value={value}
          onChange={(_, v) => setValue(v)}
          variant="scrollable"
          scrollButtons="auto"
          TabIndicatorProps={{ style: { backgroundColor: '#d1922b' } }} // brand accent
        >
          <Tab label="Personal Info" />
          <Tab label="Sessions & Treatments" />
          <Tab label="Logout" />
        </Tabs>
      </aside>

      <div className="w-full">
        <TabPanel value={value} index={0}><UserInfoTabs patient={patient as any} /></TabPanel>
        <TabPanel value={value} index={1}><UserSessions patient={patient as any} /></TabPanel>
        <TabPanel value={value} index={2}>
          <div className="p-5">
            <h1 className="text-lg md:text-2xl font-semibold mb-4">Are you sure you want to log out?</h1>
            <button onClick={logout} className="bg-brand-900 text-white px-6 py-3 rounded-md font-semibold text-sm">
              Logout
            </button>
          </div>
        </TabPanel>
      </div>
    </Box>
  )
}
