#!/bin/bash

echo "🐳 Docker-based GitHub Push Solution"
echo "===================================="
echo ""

# Check if Docker is running
docker version > /dev/null 2>&1
if [ $? -ne 0 ]; then
    echo "❌ Docker is not running. Please start Docker Desktop first."
    exit 1
fi

echo "Building Docker image..."
docker build -f Dockerfile.push -t git-pusher .

echo ""
echo "Now you have several options:"
echo ""
echo "Option 1 - Use Personal Access Token (Easiest):"
echo "-----------------------------------------------"
echo "1. Create a token at: https://github.com/settings/tokens"
echo "2. Run this command (replace YOUR_TOKEN):"
echo ""
echo "   git push https://YOUR_TOKEN@github.com/Pablo305/internetproviders.git main -f"
echo ""
echo "Option 2 - Use Docker with mounted SSH key:"
echo "-------------------------------------------"
echo "If you know where your SSH key is located, run:"
echo ""
echo "   docker run -v /path/to/your/.ssh:/root/.ssh git-pusher"
echo ""
echo "Option 3 - Use GitHub CLI directly:"
echo "-----------------------------------"
echo "1. Install: https://cli.github.com/"
echo "2. Run: gh auth login"
echo "3. Run: git push -f origin main"
echo ""

# Try a different approach - create a temporary script that uses git credentials
echo "Option 4 - Automated Token Push:"
echo "-------------------------------"
read -p "Do you have a GitHub Personal Access Token? (yes/no): " has_token

if [ "$has_token" = "yes" ]; then
    echo ""
    echo "⚠️  Security Note: The token will only be used for this push and not stored"
    read -s -p "Paste your GitHub Personal Access Token: " token
    echo ""
    echo ""
    echo "Pushing to GitHub..."
    git push https://${token}@github.com/Pablo305/internetproviders.git main -f
    
    if [ $? -eq 0 ]; then
        echo ""
        echo "✅ Successfully pushed to GitHub!"
        echo "🌐 View at: https://github.com/Pablo305/internetproviders"
    else
        echo ""
        echo "❌ Push failed. Please check your token permissions."
    fi
fi