"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { CalendarPreview } from "@/lib/features/calendar"
import { useAuthContext } from "@/lib/features/auth"
import { Role } from "@/lib/features/auth/data/interfaces/auth"

export default function DashboardTimetablePage() {
  const { user, loading } = useAuthContext()
  const router = useRouter()

  useEffect(() => {
    if (loading) return
    if (!user || user.role?.name !== Role.ADMIN) {
      router.replace("/")
    }
  }, [user, loading, router])

  if (loading || !user || user.role?.name !== Role.ADMIN) {
    return null
  }

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col overflow-hidden">
          <div className="flex-1 p-4">
            <CalendarPreview canEdit={true} />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

