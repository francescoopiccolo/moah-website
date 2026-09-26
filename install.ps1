$ErrorActionPreference = 'Stop'

function Install-MoAH {
    if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
        throw 'Node.js >=22.19 is required. Install Node.js LTS from https://nodejs.org and run this installer again.'
    }
    & node -e 'const [major,minor] = process.versions.node.split(".").map(Number); process.exit(major > 22 || (major === 22 && minor >= 19) ? 0 : 1)'
    if ($LASTEXITCODE -ne 0) { throw 'Node.js >=22.19 is required. Update Node.js and try again.' }
    $npmCommand = Get-Command npm.cmd -ErrorAction SilentlyContinue
    if (-not $npmCommand) { throw 'npm is required. Install Node.js LTS with npm from https://nodejs.org.' }
    $installDir = if ($env:MOAH_INSTALL_DIR) { $env:MOAH_INSTALL_DIR } else { Join-Path $env:LOCALAPPDATA 'MoAH\cli' }
    $installDir = [IO.Path]::GetFullPath($installDir)
    Write-Host "Installing MoAH from npm into $installDir..."
    & $npmCommand.Source install --global --prefix $installDir --no-audit --no-fund 'moah-ai@latest'
    if ($LASTEXITCODE -ne 0) { throw 'MoAH installation failed. Check the npm error above and retry.' }
    & node (Join-Path $installDir 'node_modules\moah-ai\bin\moah.mjs') about
    if ($LASTEXITCODE -ne 0) { throw 'MoAH was installed but could not start. Check the error above.' }
    if ($env:MOAH_NO_PATH_UPDATE -ne '1') {
        $userPath = [Environment]::GetEnvironmentVariable('Path', 'User')
        $entries = @($userPath -split ';' | Where-Object { $_ -and $_.TrimEnd('\') -ine $installDir.TrimEnd('\') })
        [Environment]::SetEnvironmentVariable('Path', (@($installDir) + $entries -join ';'), 'User')
        $env:Path = "$installDir;$env:Path"
    }
    Write-Host 'MoAH is ready. Open a new terminal, enter your project, and run moah.'
    Write-Host 'If PowerShell blocks moah.ps1, use moah.cmd instead.'
}

Install-MoAH
