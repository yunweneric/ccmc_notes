"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { useAuthContext } from "@/lib/features/auth"
import { Role } from "@/lib/features/auth/data/interfaces/auth"

export default function DashboardUsersPage() {
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
        <div className="flex flex-1 flex-col">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            <div className="px-4 lg:px-6">
              <div className="space-y-2">
                <h1 className="text-2xl font-semibold tracking-tight">
                  Users Management
                </h1>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  Manage user accounts, roles, and permissions.
                </p>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

