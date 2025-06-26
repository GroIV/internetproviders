# PowerShell script to push to GitHub

Write-Host "🚀 Preparing to push Internet Provider Analytics to GitHub..." -ForegroundColor Green
Write-Host ""
Write-Host "This will REPLACE ALL FILES in the repository at:" -ForegroundColor Yellow
Write-Host "https://github.com/Pablo305/internetproviders" -ForegroundColor Cyan
Write-Host ""
Write-Host "⚠️  WARNING: This will overwrite everything in the remote repository!" -ForegroundColor Red
Write-Host ""

$confirm = Read-Host "Are you sure you want to continue? (yes/no)"

if ($confirm -ne "yes") {
    Write-Host "❌ Push cancelled." -ForegroundColor Red
    exit
}

# Check git status
Write-Host ""
Write-Host "📊 Current git status:" -ForegroundColor Green
git status --short

# Show what we're about to push
Write-Host ""
Write-Host "📦 Ready to push the following commit:" -ForegroundColor Green
git log --oneline -1

Write-Host ""
Write-Host "🔑 GitHub Authentication Required" -ForegroundColor Yellow
Write-Host "You have several options:" -ForegroundColor Cyan
Write-Host ""
Write-Host "Option 1: Use GitHub CLI (gh)" -ForegroundColor Green
Write-Host "  - Install from: https://cli.github.com/" 
Write-Host "  - Run: gh auth login"
Write-Host "  - Then: git push -f origin main"
Write-Host ""
Write-Host "Option 2: Use Personal Access Token" -ForegroundColor Green
Write-Host "  - Create token at: https://github.com/settings/tokens"
Write-Host "  - Use token as password when prompted"
Write-Host ""
Write-Host "Option 3: Use Git Credential Manager" -ForegroundColor Green
Write-Host "  - Should prompt automatically"
Write-Host ""

$method = Read-Host "Press Enter to continue with git push, or type 'gh' to use GitHub CLI"

if ($method -eq "gh") {
    Write-Host ""
    Write-Host "⬆️  Pushing with GitHub CLI..." -ForegroundColor Green
    gh repo clone Pablo305/internetproviders temp_check 2>$null
    if ($LASTEXITCODE -eq 0) {
        Remove-Item -Recurse -Force temp_check 2>$null
        git push -f origin main
    } else {
        Write-Host "Please login first with: gh auth login" -ForegroundColor Yellow
    }
} else {
    Write-Host ""
    Write-Host "⬆️  Pushing to GitHub..." -ForegroundColor Green
    Write-Host "When prompted:" -ForegroundColor Yellow
    Write-Host "  - Username: Your GitHub username" -ForegroundColor Cyan
    Write-Host "  - Password: Your Personal Access Token (NOT your password)" -ForegroundColor Cyan
    Write-Host ""
    
    git push -f origin main
}

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Successfully pushed to GitHub!" -ForegroundColor Green
    Write-Host "🌐 View your repository at: https://github.com/Pablo305/internetproviders" -ForegroundColor Cyan
} else {
    Write-Host ""
    Write-Host "❌ Push failed." -ForegroundColor Red
    Write-Host ""
    Write-Host "Try these alternatives:" -ForegroundColor Yellow
    Write-Host "1. Install and use GitHub Desktop" -ForegroundColor Cyan
    Write-Host "2. Use GitHub CLI: gh auth login && git push -f origin main" -ForegroundColor Cyan
    Write-Host "3. Create a Personal Access Token at GitHub.com" -ForegroundColor Cyan
}