# PowerShell script to deploy Axicov with proper config loading
# This temporarily handles the ES module conflict

$apiKey = $args[0]
if (-not $apiKey) {
    Write-Host "Usage: .\deploy-axicov.ps1 <api-key>"
    Write-Host "Or set environment variable: `$env:AXICOV_API_KEY"
    exit 1
}

Write-Host "Backing up package.json..."
Copy-Item package.json package.json.backup

Write-Host "Temporarily removing 'type: module' for Axicov deployment..."
$packageJson = Get-Content package.json | ConvertFrom-Json
$packageJson.PSObject.Properties.Remove('type')
$packageJson | ConvertTo-Json -Depth 10 | Set-Content package.json.temp
Move-Item -Force package.json.temp package.json

Write-Host "Deploying to Axicov..."
axicov deploy -k $apiKey

Write-Host "Restoring package.json..."
Move-Item -Force package.json.backup package.json

Write-Host "Deployment complete!"

