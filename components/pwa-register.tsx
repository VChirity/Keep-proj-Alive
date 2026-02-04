"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { X, Download } from "lucide-react"

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

export function PwaRegister() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showInstallBanner, setShowInstallBanner] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)

  useEffect(() => {
    if (typeof window === "undefined") return

    // Check if already installed as PWA
    const standalone = window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as Navigator & { standalone?: boolean }).standalone === true

    setIsStandalone(standalone)

    // Check if iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as Window & { MSStream?: unknown }).MSStream
    setIsIOS(iOS)

    // Register service worker
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js", { scope: "/" })
        .then((registration) => {
          // Check for updates
          registration.addEventListener("updatefound", () => {
            const newWorker = registration.installing
            if (newWorker) {
              newWorker.addEventListener("statechange", () => {
                if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
                  // New content is available, show refresh prompt if needed
                  console.log("New content available")
                }
              })
            }
          })
        })
        .catch((error) => {
          console.error("Service Worker registration failed:", error)
        })
    }

    // Listen for beforeinstallprompt event (Android/Desktop Chrome)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setInstallPrompt(e as BeforeInstallPromptEvent)
      // Show install banner after a delay
      setTimeout(() => {
        if (!standalone) {
          setShowInstallBanner(true)
        }
      }, 3000)
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt)

    // Show iOS install instructions after delay
    if (iOS && !standalone) {
      setTimeout(() => {
        setShowInstallBanner(true)
      }, 5000)
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
    }
  }, [])

  const handleInstall = async () => {
    if (!installPrompt) return

    try {
      await installPrompt.prompt()
      const { outcome } = await installPrompt.userChoice
      
      if (outcome === "accepted") {
        setShowInstallBanner(false)
        setInstallPrompt(null)
      }
    } catch (error) {
      console.error("Install prompt error:", error)
    }
  }

  const dismissBanner = () => {
    setShowInstallBanner(false)
    // Don't show again for this session
    sessionStorage.setItem("pwa-banner-dismissed", "true")
  }

  // Don't show if already installed or banner was dismissed
  if (isStandalone || !showInstallBanner) return null
  if (typeof window !== "undefined" && sessionStorage.getItem("pwa-banner-dismissed")) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-background border-t shadow-lg safe-area-bottom">
      <div className="max-w-md mx-auto flex items-center gap-3">
        <div className="flex-1">
          <p className="font-medium text-sm">Instalar Massagem da Lu</p>
          {isIOS ? (
            <p className="text-xs text-muted-foreground mt-1">
              Toque em <span className="font-semibold">Compartilhar</span> e depois em{" "}
              <span className="font-semibold">Adicionar a Tela de Inicio</span>
            </p>
          ) : (
            <p className="text-xs text-muted-foreground mt-1">
              Instale o app para acesso rapido
            </p>
          )}
        </div>
        {!isIOS && installPrompt && (
          <Button size="sm" onClick={handleInstall} className="bg-coral hover:bg-coral/90 text-white">
            <Download className="h-4 w-4 mr-1" />
            Instalar
          </Button>
        )}
        <Button variant="ghost" size="icon" onClick={dismissBanner}>
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
