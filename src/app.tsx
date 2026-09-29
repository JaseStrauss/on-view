import { lazy, Suspense } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppLoader } from '@/components/app-loader'
import { Layout } from '@/components/layout'
import { ProtectedRoute } from '@/components/protected-route'
import { AuthProvider } from '@/contexts/auth-context'
import { LandingPage } from '@/pages/landing-page'
import { LoginPage } from '@/pages/login-page'
import { SignUpPage } from '@/pages/sign-up-page'
import { StudioPage } from '@/pages/studio-page'
import { DemoStudioPage } from '@/pages/demo-studio-page'
import { SettingsPage } from '@/pages/settings-page'

const PublicShowPage = lazy(() =>
  import('@/pages/public-show-page').then((module) => ({
    default: module.PublicShowPage,
  })),
)

const ExhibitionEditorPage = lazy(() =>
  import('@/pages/exhibition-editor-page').then((module) => ({
    default: module.ExhibitionEditorPage,
  })),
)

const NewArtworkPage = lazy(() =>
  import('@/pages/new-artwork-page').then((module) => ({
    default: module.NewArtworkPage,
  })),
)

const BulkArtworkImportPage = lazy(() =>
  import('@/pages/bulk-artwork-import-page').then((module) => ({
    default: module.BulkArtworkImportPage,
  })),
)

const NewExhibitionPage = lazy(() =>
  import('@/pages/new-exhibition-page').then((module) => ({
    default: module.NewExhibitionPage,
  })),
)

const DemoSandboxEditorPage = lazy(() =>
  import('@/pages/demo-sandbox-editor-page').then((module) => ({
    default: module.DemoSandboxEditorPage,
  })),
)

function RouteFallback() {
  return <AppLoader />
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public exhibition: no studio nav */}
          <Route
            path="/show/:slug"
            element={
              <Suspense fallback={<RouteFallback />}>
                <PublicShowPage />
              </Suspense>
            }
          />

          <Route
            path="/*"
            element={
              <Layout>
                <Routes>
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/signup" element={<SignUpPage />} />
                  <Route path="/studio/demo" element={<DemoStudioPage />} />
                  <Route
                    path="/studio/demo/artworks/new"
                    element={
                      <Suspense fallback={<RouteFallback />}>
                        <NewArtworkPage demoMode />
                      </Suspense>
                    }
                  />
                  <Route
                    path="/studio/demo/artworks/bulk"
                    element={
                      <Suspense fallback={<RouteFallback />}>
                        <BulkArtworkImportPage demoMode />
                      </Suspense>
                    }
                  />
                  <Route
                    path="/studio/demo/exhibitions/new"
                    element={
                      <Suspense fallback={<RouteFallback />}>
                        <NewExhibitionPage demoMode />
                      </Suspense>
                    }
                  />
                  <Route
                    path="/studio/demo/build"
                    element={
                      <Suspense fallback={<RouteFallback />}>
                        <DemoSandboxEditorPage />
                      </Suspense>
                    }
                  />
                  <Route
                    path="/studio/demo/sandbox"
                    element={<Navigate to="/studio/demo/build" replace />}
                  />
                  <Route
                    path="/studio"
                    element={
                      <ProtectedRoute>
                        <StudioPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/studio/artworks/new"
                    element={
                      <ProtectedRoute>
                        <Suspense fallback={<RouteFallback />}>
                          <NewArtworkPage />
                        </Suspense>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/studio/import"
                    element={<Navigate to="/studio/artworks/bulk" replace />}
                  />
                  <Route
                    path="/studio/artworks/bulk"
                    element={
                      <ProtectedRoute>
                        <Suspense fallback={<RouteFallback />}>
                          <BulkArtworkImportPage />
                        </Suspense>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/studio/settings"
                    element={
                      <ProtectedRoute>
                        <SettingsPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/studio/exhibitions/:id"
                    element={
                      <ProtectedRoute>
                        <Suspense fallback={<RouteFallback />}>
                          <ExhibitionEditorPage />
                        </Suspense>
                      </ProtectedRoute>
                    }
                  />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </Layout>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
