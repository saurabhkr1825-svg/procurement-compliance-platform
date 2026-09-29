import * as React from "react"
import { Sidebar } from "./sidebar"
import { Header } from "./header"

export function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 font-sans text-slate-900">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden w-full">
        <Header />
        <main className="flex-1 overflow-y-auto bg-slate-50 p-6 md:p-8">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
