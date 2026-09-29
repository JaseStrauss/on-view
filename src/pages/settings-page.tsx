import { type FormEvent, useEffect, useState } from 'react'
import { Check } from 'lucide-react'
import { AppLoader } from '@/components/app-loader'
import { PageBackLink } from '@/components/page-back-link'
import { toast } from 'sonner'
import { useAuth } from '@/contexts/auth-context'
import {
  fetchProfile,
  updatePassword,
  updateProfile,
} from '@/services/profile'
import type { ProfileFormData } from '@/types/profile'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

export function SettingsPage() {
  const { user } = useAuth()
  const [profileForm, setProfileForm] = useState<ProfileFormData>({
    display_name: '',
    studio_name: '',
  })
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loadingProfile, setLoadingProfile] = useState(true)
  const [savingProfile, setSavingProfile] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)
  const [profileSaved, setProfileSaved] = useState(false)
  const [passwordSaved, setPasswordSaved] = useState(false)
  const [profileError, setProfileError] = useState<string | null>(null)
  const [passwordError, setPasswordError] = useState<string | null>(null)

  useEffect(() => {
    if (!user) return

    fetchProfile(user.id)
      .then((profile) => {
        setProfileForm({
          display_name: profile.display_name ?? '',
          studio_name: profile.studio_name ?? '',
        })
      })
      .catch((err) => {
        setProfileError(
          err instanceof Error ? err.message : 'Could not load profile',
        )
      })
      .finally(() => setLoadingProfile(false))
  }, [user])

  async function handleProfileSubmit(event: FormEvent) {
    event.preventDefault()
    if (!user) return

    setSavingProfile(true)
    setProfileError(null)
    setProfileSaved(false)

    try {
      await updateProfile(user.id, profileForm)
      setProfileSaved(true)
      toast.success('Profile saved')
    } catch (err) {
      setProfileError(
        err instanceof Error ? err.message : 'Could not save profile',
      )
    } finally {
      setSavingProfile(false)
    }
  }

  async function handlePasswordSubmit(event: FormEvent) {
    event.preventDefault()
    setPasswordError(null)
    setPasswordSaved(false)

    if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters.')
      return
    }

    if (password !== confirmPassword) {
      setPasswordError('Passwords do not match.')
      return
    }

    setSavingPassword(true)

    const message = await updatePassword(password)
    if (message) {
      setPasswordError(message)
      setSavingPassword(false)
      return
    }

    setPassword('')
    setConfirmPassword('')
    setPasswordSaved(true)
    setSavingPassword(false)
    toast.success('Password updated')
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <PageBackLink to="/studio" className="mb-4">
        Exhibitions
      </PageBackLink>
      <div className="mb-8">
        <h1 className="font-serif text-4xl italic">Settings</h1>
        <p className="mt-2 text-muted-foreground">
          Manage your presenter profile and account security.
        </p>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Presenter profile</CardTitle>
            <CardDescription>
              Your gallery or studio name appears as &ldquo;Presented by
              [Name]&rdquo; on open exhibitions. Display name is used if this
              field is empty.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loadingProfile ? (
              <AppLoader layout="inline" label="Loading profile…" className="py-4" />
            ) : (
              <form onSubmit={handleProfileSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    value={user?.email ?? ''}
                    disabled
                    className="bg-muted/50"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="display-name">Display name</Label>
                  <Input
                    id="display-name"
                    value={profileForm.display_name}
                    onChange={(e) =>
                      setProfileForm((current) => ({
                        ...current,
                        display_name: e.target.value,
                      }))
                    }
                    placeholder="Jase Strauss"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="studio-name">Gallery or studio name</Label>
                  <Input
                    id="studio-name"
                    value={profileForm.studio_name}
                    onChange={(e) =>
                      setProfileForm((current) => ({
                        ...current,
                        studio_name: e.target.value,
                      }))
                    }
                    placeholder="e.g. North Gallery"
                  />
                </div>

                {profileError && (
                  <p className="text-sm text-destructive">{profileError}</p>
                )}
                {profileSaved && (
                  <p className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Check className="size-4" />
                    Profile saved
                  </p>
                )}

                <Button type="submit" disabled={savingProfile}>
                  {savingProfile ? 'Saving…' : 'Save profile'}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Password</CardTitle>
            <CardDescription>Update your sign-in password.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="new-password">New password</Label>
                <Input
                  id="new-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  minLength={6}
                  autoComplete="new-password"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  minLength={6}
                  autoComplete="new-password"
                />
              </div>

              {passwordError && (
                <p className="text-sm text-destructive">{passwordError}</p>
              )}
              {passwordSaved && (
                <p className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Check className="size-4" />
                  Password updated
                </p>
              )}

              <Button type="submit" disabled={savingPassword}>
                {savingPassword ? 'Updating…' : 'Update password'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
