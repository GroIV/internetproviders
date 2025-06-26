#!/bin/bash

# Script to push the Internet Provider Analytics project to GitHub
# This script will force push to replace all existing files

echo "🚀 Preparing to push Internet Provider Analytics to GitHub..."
echo ""
echo "This will REPLACE ALL FILES in the repository at:"
echo "https://github.com/Pablo305/internetproviders"
echo ""
echo "⚠️  WARNING: This will overwrite everything in the remote repository!"
echo ""
read -p "Are you sure you want to continue? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo "❌ Push cancelled."
    exit 1
fi

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Not in the project root directory"
    echo "Please run this script from the InternetProviderAnalytics folder"
    exit 1
fi

# Check git status
echo ""
echo "📊 Current git status:"
git status --short

# Make sure we have the correct remote
echo ""
echo "🔗 Setting up remote repository..."
git remote remove origin 2>/dev/null
git remote add origin https://github.com/Pablo305/internetproviders.git

# Show what we're about to push
echo ""
echo "📦 Ready to push the following commit:"
git log --oneline -1

echo ""
echo "🔑 GitHub Authentication Required"
echo "You'll need to enter your GitHub username and personal access token"
echo "(Note: GitHub no longer accepts passwords - use a personal access token)"
echo ""
echo "To create a token: GitHub Settings → Developer settings → Personal access tokens"
echo ""

# Push to GitHub
echo "⬆️  Pushing to GitHub..."
git push -f origin main

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Successfully pushed to GitHub!"
    echo "🌐 View your repository at: https://github.com/Pablo305/internetproviders"
else
    echo ""
    echo "❌ Push failed. Please check your credentials and try again."
    echo ""
    echo "Alternative: You can manually push using:"
    echo "  git remote set-url origin git@github.com:Pablo305/internetproviders.git"
    echo "  git push -f origin main"
fi