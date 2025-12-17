"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { AppSidebar } from "@/components/app-sidebar"
import { ChartAreaInteractive } from "@/components/chart-area-interactive"
import { DataTable } from "@/components/data-table"
import { SectionCards } from "@/components/section-cards"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { CalendarPreview } from "@/lib/features/calendar"
import { useAuthContext } from "@/lib/features/auth"
import { Role } from "@/lib/features/auth/data/interfaces/auth"

import data from "./data.json"

export default function Page() {
  const { user, loading } = useAuthContext()
  const router = useRouter()
  const canEdit = user?.role?.name === Role.ADMIN

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
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <SectionCards />
              <div className="px-4 lg:px-6">
                <ChartAreaInteractive />
              </div>
              <DataTable data={data} />
              <div className="px-4 lg:px-6">
                <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden">
                  <div className="border-b border-zinc-200 dark:border-zinc-800 px-6 py-4">
                    <h2 className="text-lg font-semibold">Calendar Preview</h2>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">
                      {canEdit ? "Manage your calendar schedule" : "View calendar schedule"}
                    </p>
                  </div>
                  <div className="h-[600px]">
                    <CalendarPreview canEdit={canEdit} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
