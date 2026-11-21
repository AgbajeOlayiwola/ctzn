param([switch]$Remove)
$ErrorActionPreference = 'Stop'
$ctznTaskName = 'ctzn - Morning Sources (Local)'
$ctznTaskMarker = 'ctzn local public-source reader; no deployment or email sending'
$ctznExistingTask = Get-ScheduledTask -TaskName $ctznTaskName -ErrorAction SilentlyContinue
if ($ctznExistingTask -and $ctznExistingTask.Description -ne $ctznTaskMarker) { throw 'A different task uses this name. Nothing was changed.' }
if ($Remove) {
  if ($ctznExistingTask) { Unregister-ScheduledTask -TaskName $ctznTaskName -Confirm:$false }
  Write-Output 'ctzn morning task removed.'
  return
}
if ((Get-TimeZone).BaseUtcOffset.TotalHours -ne 1) { throw 'The current Windows timezone is not UTC+1. Configure a 07:00 Africa/Lagos trigger before installing.' }
$ctznWorkspace = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
$ctznNode = (Get-Command node.exe -ErrorAction Stop).Source
$ctznCrawler = Join-Path $ctznWorkspace 'scripts/crawl.mjs'
if (-not (Test-Path -LiteralPath $ctznCrawler)) { throw 'ctzn crawler script is missing.' }
$ctznShell = Join-Path $env:SystemRoot 'System32/WindowsPowerShell/v1.0/powershell.exe'
$ctznCommand = "& '" + $ctznNode.Replace("'", "''") + "' '" + $ctznCrawler.Replace("'", "''") + "'; exit `$LASTEXITCODE"
$ctznAction = New-ScheduledTaskAction -Execute $ctznShell -Argument ('-NoProfile -NonInteractive -WindowStyle Hidden -Command "' + $ctznCommand + '"') -WorkingDirectory $ctznWorkspace
$ctznTrigger = New-ScheduledTaskTrigger -Daily -At '07:00'
$ctznIdentity = [Security.Principal.WindowsIdentity]::GetCurrent().Name
$ctznPrincipal = New-ScheduledTaskPrincipal -UserId $ctznIdentity -LogonType Interactive -RunLevel Limited
$ctznSettings = New-ScheduledTaskSettingsSet -StartWhenAvailable -MultipleInstances IgnoreNew -ExecutionTimeLimit (New-TimeSpan -Minutes 20) -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries
Register-ScheduledTask -TaskName $ctznTaskName -Action $ctznAction -Trigger $ctznTrigger -Settings $ctznSettings -Principal $ctznPrincipal -Description $ctznTaskMarker -Force | Select-Object TaskName,State
Write-Output 'Runs daily at 07:00 Lagos time while signed in. Missed runs are eligible to start when the laptop is available. No wake-from-sleep or password was configured.'
