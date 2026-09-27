import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function SettingsPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your account and platform preferences.</p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>Update your personal information.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">Profile settings will be available in Phase 3.</p>
            <Button disabled>Save Changes</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Organization</CardTitle>
            <CardDescription>Manage organization details and team members.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">Organization settings will be implemented later.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Application</CardTitle>
            <CardDescription>Configure system-wide preferences.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">Application settings will be implemented later.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
