# Creates the Docker secret files used by docker-compose.yml in .\secrets.
# Existing files are never overwritten, so re-running is safe.

$ErrorActionPreference = 'Stop'

$secretsDir = Join-Path (Split-Path -Parent $PSScriptRoot) 'secrets'
New-Item -ItemType Directory -Force -Path $secretsDir | Out-Null

$alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'

function New-RandomSecret {
  param([int]$Length = 48)
  $rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
  $buffer = New-Object byte[] 64
  $result = New-Object System.Text.StringBuilder
  try {
    while ($result.Length -lt $Length) {
      $rng.GetBytes($buffer)
      foreach ($b in $buffer) {
        # Rejection sampling: 248 is the largest multiple of 62 below 256.
        if ($b -lt 248 -and $result.Length -lt $Length) {
          [void]$result.Append($alphabet[$b % $alphabet.Length])
        }
      }
    }
  }
  finally {
    $rng.Dispose()
  }
  $result.ToString()
}

function Write-Secret {
  param([string]$Name, [string]$Value)
  $file = Join-Path $secretsDir "$Name.txt"
  if (Test-Path -LiteralPath $file) {
    Write-Host "Keeping existing $file"
    return
  }
  # No trailing newline; WriteAllText writes UTF-8 without a BOM.
  [System.IO.File]::WriteAllText($file, $Value)
  Write-Host "Created $file"
}

foreach ($name in 'postgres_password', 'app_db_password', 'admin_password', 'session_secret') {
  Write-Secret -Name $name -Value (New-RandomSecret)
}
Write-Secret -Name 'email_password' -Value ''

Write-Host @'

secrets\email_password.txt is empty. If email is enabled, put the SMTP
password in it (for example: Set-Content -NoNewline secrets\email_password.txt 'your-password').
The admin login is "admin"; its password is in secrets\admin_password.txt.
On a Linux Docker host, make the files readable by the containers: chmod 644 secrets/*.txt
'@
