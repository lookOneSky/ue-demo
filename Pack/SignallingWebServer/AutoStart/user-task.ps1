param(
    [Parameter(Mandatory = $true)]
    [ValidateSet('install', 'uninstall', 'start', 'stop', 'restart', 'status', 'log', 'run')]
    [string]$Action
)

$ErrorActionPreference = 'Stop'
$TaskName = 'PixelStreamingSignallingUser'
$ServiceName = 'PixelStreamingSignallingServer'
$ServerRoot = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
$ServerExe = Join-Path $ServerRoot 'dist\SignallingWebServer.exe'
$ServerConfig = Join-Path $ServerRoot 'dist\config.json'
$LogDir = Join-Path $PSScriptRoot 'logs'
$PidFile = Join-Path $LogDir 'server.pid.json'

function Assert-ServerFiles {
    foreach ($File in @($ServerExe, $ServerConfig)) {
        if (-not (Test-Path -LiteralPath $File -PathType Leaf)) {
            throw "Required file not found: $File"
        }
    }
}

function Assert-NoService {
    $Service = Get-Service -Name $ServiceName -ErrorAction SilentlyContinue
    if ($null -ne $Service) {
        throw "Legacy service $ServiceName is installed. Stop and delete it with administrator rights before installing this task."
    }
}

function Assert-PortsFree {
    $Config = Get-Content -LiteralPath $ServerConfig -Raw | ConvertFrom-Json
    foreach ($Port in @([int]$Config.StreamerPort, [int]$Config.HttpPort)) {
        $Listener = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue
        if ($null -ne $Listener) {
            throw "Port $Port is already listening. Stop the other signalling server first."
        }
    }
}

function Stop-UserServer {
    if (-not (Test-Path -LiteralPath $PidFile -PathType Leaf)) {
        return
    }

    $SavedProcess = Get-Content -LiteralPath $PidFile -Raw | ConvertFrom-Json
    $Process = Get-Process -Id ([int]$SavedProcess.Id) -ErrorAction SilentlyContinue
    if ($null -ne $Process -and
        [System.StringComparer]::OrdinalIgnoreCase.Equals($Process.Path, $ServerExe) -and
        $Process.StartTime.ToUniversalTime().Ticks -eq [long]$SavedProcess.StartTicks) {
        & taskkill.exe /F /T /PID $Process.Id | Out-Null
        if ($LASTEXITCODE -ne 0) {
            throw "Could not stop signalling server PID $($Process.Id)."
        }
    }
    Remove-Item -LiteralPath $PidFile -Force
}

function Get-UserTask {
    $Task = Get-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue
    if ($null -eq $Task) {
        throw "Task $TaskName is not installed. Run install-user-autostart.bat first."
    }
    return $Task
}

function Stop-UserTask {
    $Task = Get-UserTask
    if ($Task.State -eq 'Running') {
        Stop-ScheduledTask -TaskName $TaskName
    }
    Stop-UserServer
    for ($Attempt = 0; $Attempt -lt 20; $Attempt++) {
        $Task = Get-UserTask
        if ($Task.State -ne 'Running') {
            return
        }
        Start-Sleep -Milliseconds 500
    }
    throw "Task $TaskName did not stop."
}

# 把进程优先级设为“高”，已退出或无权限的进程跳过
function Set-HighPriority {
    param([System.Diagnostics.Process[]]$Processes)
    foreach ($Item in $Processes) {
        try {
            if ($Item.PriorityClass -ne 'High') {
                $Item.PriorityClass = 'High'
            }
        }
        catch {
        }
    }
}

function Start-UserServer {
    New-Item -ItemType Directory -Path $LogDir -Force | Out-Null
    $Stamp = Get-Date -Format 'yyyyMMdd-HHmmss'
    $OutLog = Join-Path $LogDir "SignallingUser-$Stamp.out.log"
    $ErrLog = Join-Path $LogDir "SignallingUser-$Stamp.err.log"

    try {
        Assert-ServerFiles
        $Service = Get-Service -Name $ServiceName -ErrorAction SilentlyContinue
        if ($null -ne $Service -and $Service.Status -eq 'Running') {
            throw "Legacy service $ServiceName is running."
        }

        $OldLogs = @(Get-ChildItem -LiteralPath $LogDir -Filter 'SignallingUser-*.out.log' -File |
            Sort-Object Name -Descending | Select-Object -Skip 9)
        foreach ($OldLog in $OldLogs) {
            $OldErrLog = $OldLog.FullName -replace '\.out\.log$', '.err.log'
            Remove-Item -LiteralPath $OldLog.FullName -Force
            Remove-Item -LiteralPath $OldErrLog -Force -ErrorAction SilentlyContinue
        }

        Set-HighPriority ([System.Diagnostics.Process]::GetCurrentProcess())
        $UEProgram = (Get-Content -LiteralPath $ServerConfig -Raw -Encoding UTF8 | ConvertFrom-Json).UEProgram
        $UEName = if ($UEProgram) { [System.IO.Path]::GetFileNameWithoutExtension($UEProgram) }

        $Arguments = @('--configFile', ('"' + $ServerConfig + '"'))
        $Process = Start-Process -FilePath $ServerExe -ArgumentList $Arguments `
            -WorkingDirectory $ServerRoot -NoNewWindow -PassThru `
            -RedirectStandardOutput $OutLog -RedirectStandardError $ErrLog
        @{ Id = $Process.Id; StartTicks = $Process.StartTime.ToUniversalTime().Ticks } |
            ConvertTo-Json | Set-Content -LiteralPath $PidFile -Encoding ASCII
        # “高”不会继承给子进程，UE 启动器还会再拉起实际进程，所以每 2 秒按名称补设一次
        do {
            Set-HighPriority $Process
            if ($UEName) {
                Set-HighPriority (Get-Process -Name "$UEName*")
            }
        } while (-not $Process.WaitForExit(2000))
        $ExitCode = $Process.ExitCode
        if (Test-Path -LiteralPath $PidFile) {
            $SavedProcess = Get-Content -LiteralPath $PidFile -Raw | ConvertFrom-Json
            if ([int]$SavedProcess.Id -eq $Process.Id) {
                Remove-Item -LiteralPath $PidFile -Force
            }
        }
        exit $ExitCode
    }
    catch {
        $_ | Out-File -LiteralPath $ErrLog -Append -Encoding UTF8
        exit 1
    }
}

try {
    switch ($Action) {
        'run' {
            Start-UserServer
        }
        'install' {
            Assert-ServerFiles
            Assert-NoService
            if ($null -ne (Get-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue)) {
                Stop-UserTask
            }
            Assert-PortsFree

            $Account = "$env:USERDOMAIN\$env:USERNAME"
            $PowerShellExe = Join-Path $PSHOME 'powershell.exe'
            # conhost --headless 不创建窗口；-WindowStyle Hidden 在 Windows Terminal 下藏不住窗口
            $ConhostExe = Join-Path $env:SystemRoot 'System32\conhost.exe'
            $TaskArguments = '--headless "' + $PowerShellExe + '" -NoProfile -ExecutionPolicy Bypass -File "' + $PSCommandPath + '" run'
            $TaskAction = New-ScheduledTaskAction -Execute $ConhostExe `
                -Argument $TaskArguments -WorkingDirectory $ServerRoot
            $Trigger = New-ScheduledTaskTrigger -AtLogOn -User $Account
            $Principal = New-ScheduledTaskPrincipal -UserId $Account `
                -LogonType Interactive -RunLevel Limited
            # 默认 Priority 7 会让子进程继承低于正常的 CPU、低 I/O 和低内存优先级，4 为正常
            $Settings = New-ScheduledTaskSettingsSet -ExecutionTimeLimit ([TimeSpan]::Zero) `
                -RestartCount 3 -RestartInterval (New-TimeSpan -Minutes 1) `
                -MultipleInstances IgnoreNew -StartWhenAvailable `
                -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -Priority 4

            Register-ScheduledTask -TaskName $TaskName -Action $TaskAction `
                -Trigger $Trigger -Principal $Principal -Settings $Settings `
                -Description 'Start Pixel Streaming in the signed-in user session.' `
                -Force | Out-Null
            Start-ScheduledTask -TaskName $TaskName
            Write-Output "Installed and started $TaskName for $Account."
            Write-Output "Logs: $LogDir"
        }
        'uninstall' {
            $ExistingTask = Get-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue
            if ($null -ne $ExistingTask) {
                Disable-ScheduledTask -TaskName $TaskName | Out-Null
                Stop-UserTask
                Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false
            }
            Write-Output "Removed $TaskName. Logs were kept at $LogDir."
        }
        'start' {
            Assert-ServerFiles
            Assert-NoService
            $Task = Get-UserTask
            if ($Task.State -eq 'Running') {
                Write-Output "$TaskName is already running."
                break
            }
            Assert-PortsFree
            Start-ScheduledTask -TaskName $TaskName
            Write-Output "Started $TaskName."
        }
        'stop' {
            Stop-UserTask
            Write-Output "Stopped $TaskName."
        }
        'restart' {
            Stop-UserTask
            Assert-ServerFiles
            Assert-NoService
            Assert-PortsFree
            Start-ScheduledTask -TaskName $TaskName
            Write-Output "Restarted $TaskName."
        }
        'status' {
            Get-ScheduledTask -TaskName $TaskName -ErrorAction Stop |
                Select-Object TaskName, State, TaskPath
            Get-ScheduledTaskInfo -TaskName $TaskName |
                Select-Object LastRunTime, LastTaskResult, NextRunTime
        }
        'log' {
            $OutLog = Get-ChildItem -LiteralPath $LogDir -Filter 'SignallingUser-*.out.log' -File `
                -ErrorAction SilentlyContinue | Sort-Object Name -Descending | Select-Object -First 1
            if ($null -eq $OutLog) {
                throw "No signalling log found in $LogDir."
            }
            $ErrLog = $OutLog.FullName -replace '\.out\.log$', '.err.log'
            Write-Output "Showing $($OutLog.FullName). Reopen this viewer after a task restart."
            if (Test-Path -LiteralPath $ErrLog) {
                Get-Content -LiteralPath $ErrLog -Tail 30
            }
            Get-Content -LiteralPath $OutLog.FullName -Tail 200 -Wait
        }
    }
}
catch {
    Write-Error $_
    exit 1
}
