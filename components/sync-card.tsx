"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Textarea } from "@/components/ui/textarea"
import { 
  RefreshCw, 
  Settings, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Database,
  Clock,
  HardDrive,
  Loader2,
  Trash2,
  Calendar,
  Square
} from "lucide-react"
import { storageService, type AuthConfig, type SyncHistory } from "@/lib/storage"
import { syncService, type SyncProgress } from "@/lib/sync-service"

interface SyncCardProps {
  onSyncComplete?: () => void;
}

export function SyncCard({ onSyncComplete }: SyncCardProps) {
  const [authConfig, setAuthConfig] = useState<AuthConfig | null>(null)
  const [syncHistory, setSyncHistory] = useState<SyncHistory | null>(null)
  const [storageUsage, setStorageUsage] = useState({ used: 0, percentage: 0, isNearLimit: false })
  const [submissionDateRange, setSubmissionDateRange] = useState<{ oldest: string; newest: string } | null>(null)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [syncProgress, setSyncProgress] = useState<SyncProgress>({ 
    status: 'idle', 
    currentOffset: 0, 
    totalFetched: 0, 
    newSubmissions: 0, 
    message: '' 
  })
  const [alertMessage, setAlertMessage] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null)

  // Form state for authentication settings
  const [csrfToken, setCsrfToken] = useState('')
  const [sessionCookie, setSessionCookie] = useState('')

  // Load initial data
  useEffect(() => {
    loadData()
  }, [])

  const loadData = () => {
    const auth = storageService.getAuthConfig()
    const history = storageService.getSyncHistory()
    const usage = storageService.getStorageUsage()
    const dateRange = storageService.getSubmissionDateRange()
    
    setAuthConfig(auth)
    setSyncHistory(history)
    setStorageUsage(usage)
    setSubmissionDateRange(dateRange)
    
    // Pre-fill form if auth exists
    if (auth) {
      setCsrfToken(auth.csrftoken)
      // Extract just the session value from the stored cookie string
      const sessionValue = auth.sessionCookie.replace('LEETCODE_SESSION=', '').split(';')[0]
      setSessionCookie(sessionValue)
    }
  }

  const handleSaveAuth = () => {
    if (!csrfToken.trim() || !sessionCookie.trim()) {
      setAlertMessage({ 
        type: 'error', 
        message: 'Please enter both CSRF token and session cookie value.' 
      })
      return
    }

    // Construct the full cookie string from the session value
    const fullSessionCookie = `LEETCODE_SESSION=${sessionCookie.trim()}`

    const success = storageService.saveAuthConfig({
      csrftoken: csrfToken.trim(),
      sessionCookie: fullSessionCookie
    })

    if (success) {
      setAlertMessage({ 
        type: 'success', 
        message: 'Authentication settings saved successfully!' 
      })
      setIsSettingsOpen(false)
      loadData() // Refresh data
    } else {
      setAlertMessage({ 
        type: 'error', 
        message: 'Failed to save authentication settings.' 
      })
    }
  }

  const handleSync = async () => {
    // Check if authentication is configured
    if (!storageService.isAuthConfigured()) {
      // Open settings dialog automatically
      setIsSettingsOpen(true)
      setAlertMessage({ 
        type: 'info', 
        message: 'Please configure your authentication credentials to start syncing.' 
      })
      return
    }

    // Prevent multiple concurrent syncs
    if (isSyncing) {
      setAlertMessage({ 
        type: 'info', 
        message: 'Sync is already in progress. Please wait for it to complete.' 
      })
      return
    }

    setAlertMessage(null)
    
    const result = await syncService.syncSubmissions((progress) => {
      setSyncProgress(progress)
      
      // Update storage usage and date range if provided in progress
      if (progress.storageUsage) {
        setStorageUsage(progress.storageUsage)
      }
      if (progress.submissionDateRange !== undefined) {
        setSubmissionDateRange(progress.submissionDateRange)
      }
    })

    if (result.success) {
      setAlertMessage({ 
        type: 'success', 
        message: `Sync completed! Added ${result.newSubmissions} new submissions.` 
      })
      loadData() // Refresh data
      onSyncComplete?.() // Notify parent component
    } else {
      const errorMessage = result.error || 'Sync failed with unknown error.'
      
      setAlertMessage({ 
        type: 'error', 
        message: errorMessage
      })
    }
  }

  const handleClearSubmissions = () => {
    const success = storageService.clearSubmissions()
    if (success) {
      setAlertMessage({ 
        type: 'success', 
        message: 'All submissions have been cleared from local storage.' 
      })
      loadData() // Refresh data
      onSyncComplete?.() // Notify parent component
    } else {
      setAlertMessage({ 
        type: 'error', 
        message: 'Failed to clear submissions from local storage.' 
      })
    }
  }

  const handleStopSync = () => {
    syncService.cancelSync()
    setAlertMessage({ 
      type: 'info', 
      message: 'Sync cancellation requested. Please wait for the current request to complete.' 
    })
  }

  const getStatusIcon = (status: SyncHistory['syncStatus']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'error':
        return <XCircle className="h-4 w-4 text-red-600" />
      default:
        return <Clock className="h-4 w-4 text-gray-600" />
    }
  }

  const getStatusBadge = (status: SyncHistory['syncStatus']) => {
    switch (status) {
      case 'success':
        return <Badge variant="outline" className="text-green-600 border-green-600">Success</Badge>
      case 'error':
        return <Badge variant="outline" className="text-red-600 border-red-600">Error</Badge>
      default:
        return <Badge variant="outline" className="text-gray-600 border-gray-600">Never</Badge>
    }
  }

  const isAuthConfigured = storageService.isAuthConfigured()
  const submissionCount = storageService.getSubmissionCount()
  const isSyncing = syncProgress.status === 'syncing'
  const isDemoData = storageService.isDemoData()

  return (
    <div className="space-y-4">
      {/* Alert Messages */}
      {alertMessage && (
        <Alert variant="default">
          {alertMessage.type === 'error' ? <XCircle className="h-4 w-4" /> : 
           alertMessage.type === 'success' ? <CheckCircle className="h-4 w-4" /> : 
           <AlertCircle className="h-4 w-4" />}
          <AlertTitle>
            {alertMessage.type === 'error' ? 'Error' : 
             alertMessage.type === 'success' ? 'Success' : 'Info'}
          </AlertTitle>
          <AlertDescription className="whitespace-pre-line">
            {alertMessage.message}
          </AlertDescription>
        </Alert>
      )}

      {/* Main Sync Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Submission Sync{isDemoData ? ' (demo data)' : ''}
          </CardTitle>
          <CardDescription>
            Sync your latest submissions from LeetCode
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Status Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Database className="h-4 w-4" />
                Total Submissions
              </div>
              <div className="text-2xl font-semibold">{submissionCount.toLocaleString()}</div>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                Submissions Range
              </div>
              <div className="text-sm font-medium">
                {submissionDateRange ? `${submissionDateRange.oldest} to ${submissionDateRange.newest}` : 'None'}
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <HardDrive className="h-4 w-4" />
                Storage Used
              </div>
              <div className="text-sm font-medium">
                {storageService.formatStorageSize(storageUsage.used)}
              </div>
              <div className="text-xs text-muted-foreground">
                {storageUsage.percentage.toFixed(1)}% of 5MB limit
              </div>
            </div>
          </div>

          {/* Storage Progress Bar */}
          <div className="space-y-2">
            <Progress 
              value={storageUsage.percentage} 
              className={`h-2 ${storageUsage.isNearLimit ? 'bg-yellow-100' : 'bg-gray-100'}`}
            />
            {storageUsage.isNearLimit && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Storage is nearly full. Oldest submissions will be automatically removed when limit is reached.
                </AlertDescription>
              </Alert>
            )}
          </div>

          {/* Last Sync Info */}
          {syncHistory && syncHistory.syncStatus !== 'never' && (
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div className="flex items-center gap-2">
                {getStatusIcon(syncHistory.syncStatus)}
                <div>
                  <div className="text-sm font-medium">Last Sync</div>
                  <div className="text-xs text-muted-foreground">{syncHistory.lastSyncDate}</div>
                </div>
              </div>
              <div className="text-right">
                {getStatusBadge(syncHistory.syncStatus)}
                {syncHistory.syncStatus === 'success' && (
                  <div className="text-xs text-muted-foreground mt-1">
                    +{syncHistory.newSubmissionsSynced} new
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Sync Progress */}
          {isSyncing && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm font-medium">Syncing...</span>
              </div>
              <div className="text-sm text-muted-foreground">{syncProgress.message}</div>
              {syncProgress.totalFetched > 0 && (
                <div className="text-xs text-muted-foreground">
                  Fetched: {syncProgress.totalFetched} | New: {syncProgress.newSubmissions}
                </div>
              )}
            </div>
          )}
        </CardContent>

        <CardFooter className="flex gap-2">
          <Button 
            onClick={handleSync} 
            disabled={isSyncing}
            className="flex-1"
            variant={!isAuthConfigured ? "outline" : "default"}
          >
            {isSyncing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Syncing...
              </>
            ) : !isAuthConfigured ? (
              <>
                <Settings className="h-4 w-4 mr-2" />
                Setup Authentication
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Start Sync
              </>
            )}
          </Button>
          
          <Button 
            onClick={handleStopSync}
            disabled={!isSyncing}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Square className="h-4 w-4" />
            Stop
          </Button>
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button 
                variant="outline" 
                disabled={isSyncing || submissionCount === 0 || isDemoData}
                className="flex items-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Remove
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Clear All Submissions</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently remove all {submissionCount.toLocaleString()} submissions from local storage. 
                  This action cannot be undone. You can sync again to restore your submissions.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleClearSubmissions} className="bg-red-600 hover:bg-red-700">
                  Clear All Submissions
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardFooter>
      </Card>

      {/* Settings Dialog */}
      <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Authentication Settings</DialogTitle>
                  <DialogDescription>
                    Configure your LeetCode authentication to enable submission syncing.
                  </DialogDescription>
                </DialogHeader>
                
                {/* Security Notice */}
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Security Notice</AlertTitle>
                  <AlertDescription>
                    Your credentials are safe here. This open-source app runs on your own server and stores data only in your browser's local storage.
                  </AlertDescription>
                </Alert>
                
                <div className="grid gap-4">
                  <div className="grid gap-3">
                    <Label htmlFor="csrf-token">CSRF Token</Label>
                    <Input
                      id="csrf-token"
                      placeholder="kLYiVTvSBwxjmEX7JnzSIru5..."
                      value={csrfToken}
                      onChange={(e) => setCsrfToken(e.target.value)}
                      className="font-mono text-sm"
                    />
                  </div>
                  <div className="grid gap-3">
                    <Label htmlFor="session-cookie">LEETCODE_SESSION</Label>
                    <Textarea
                      id="session-cookie"
                      placeholder="eyJ0eXAiOiJKV1Q..."
                      value={sessionCookie}
                      onChange={(e) => setSessionCookie(e.target.value)}
                      className="font-mono text-sm resize-y min-h-[80px]"
                    />
                  </div>
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Step-by-step instructions:</AlertTitle>
                    <AlertDescription className="space-y-2 text-sm">
                      <div><strong>1.</strong> Go to leetcode.com and log in</div>
                      <div><strong>2.</strong> Open Developer Tools (F12)</div>
                      <div><strong>3.</strong> Go to <strong>Application</strong> → <strong>Cookies</strong> → <strong>https://leetcode.com</strong></div>
                      <div><strong>4.</strong> Find the <strong>csrftoken</strong> row, copy just the <strong>Value</strong> (not the name)</div>
                      <div><strong>5.</strong> Find the <strong>LEETCODE_SESSION</strong> row, copy just the <strong>Value</strong> (not the name)</div>
                      <div className="mt-3 p-3 bg-muted rounded text-xs overflow-x-auto">
                        <div className="whitespace-nowrap">
                          <strong>Example:</strong>
                        </div>
                        <div className="mt-2 space-y-1">
                          <div className="break-all">
                            <strong>CSRF Token Value:</strong><br/>
                            <code className="text-xs">kLYiVTvSBwxjmEX7JnzSIru5tQthaonmL6jSD1t6LBAtolS4bOQBR68WyP7RgDxx</code>
                          </div>
                          <div className="break-all">
                            <strong>Session Cookie Value:</strong><br/>
                            <code className="text-xs">eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VybmFtZSI6InVzZXJuYW1lIiwidXNlcl9pZCI6MTIzNDU2fQ...</code>
                          </div>
                        </div>
                      </div>
                    </AlertDescription>
                  </Alert>
                </div>
                <DialogFooter className="gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => setIsSettingsOpen(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleSaveAuth} className="flex-1">
                    Save Authentication
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
    </div>
  )
} 