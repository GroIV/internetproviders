#!/bin/bash

echo "🔑 SSH Key Setup and Push Script for Internet Provider Analytics"
echo "================================================="
echo ""

# Check if .ssh directory exists
if [ ! -d "$HOME/.ssh" ]; then
    echo "📁 Creating .ssh directory..."
    mkdir -p "$HOME/.ssh"
    chmod 700 "$HOME/.ssh"
fi

echo "📋 Instructions for setting up your SSH key:"
echo ""
echo "1. First, make sure your 'internetproviders_deploy' SSH key is added to GitHub:"
echo "   - Go to: https://github.com/settings/keys"
echo "   - Click 'New SSH key'"
echo "   - Add your public key content"
echo ""
echo "2. Locate your SSH key files on your system"
echo "   - Private key: internetproviders_deploy (no extension)"
echo "   - Public key: internetproviders_deploy.pub"
echo ""

read -p "Do you know the location of your SSH key files? (yes/no): " know_location

if [ "$know_location" = "yes" ]; then
    read -p "Enter the full path to your private key (internetproviders_deploy): " key_path
    
    if [ -f "$key_path" ]; then
        echo "✅ Found private key!"
        
        # Copy the key to .ssh directory
        cp "$key_path" "$HOME/.ssh/internetproviders_deploy"
        chmod 600 "$HOME/.ssh/internetproviders_deploy"
        
        # Create SSH config
        echo "📝 Setting up SSH config..."
        cat >> "$HOME/.ssh/config" << EOF

Host github.com
    HostName github.com
    User git
    IdentityFile ~/.ssh/internetproviders_deploy
    IdentitiesOnly yes
EOF
        
        echo "✅ SSH configuration complete!"
    else
        echo "❌ Could not find the key at that location"
        exit 1
    fi
else
    echo ""
    echo "📍 Please locate your SSH key files and run this script again"
    echo "   OR"
    echo "   Copy your key files to: $HOME/.ssh/"
    echo "   Then run: chmod 600 $HOME/.ssh/internetproviders_deploy"
    exit 1
fi

echo ""
echo "🧪 Testing SSH connection to GitHub..."
ssh -T git@github.com -o StrictHostKeyChecking=no

if [ $? -eq 1 ]; then
    echo "✅ SSH connection successful!"
    
    echo ""
    echo "🚀 Ready to push to GitHub..."
    echo "Repository: https://github.com/Pablo305/internetproviders"
    echo ""
    
    # Set the remote to use SSH
    git remote set-url origin git@github.com:Pablo305/internetproviders.git
    
    # Show what we're pushing
    echo "📦 Pushing commit:"
    git log --oneline -1
    echo ""
    
    read -p "Proceed with force push? This will REPLACE everything in the remote repo (yes/no): " push_confirm
    
    if [ "$push_confirm" = "yes" ]; then
        echo "⬆️  Pushing to GitHub..."
        git push -f origin main
        
        if [ $? -eq 0 ]; then
            echo ""
            echo "🎉 Successfully pushed to GitHub!"
            echo "🌐 View at: https://github.com/Pablo305/internetproviders"
        else
            echo "❌ Push failed. Check the error message above."
        fi
    else
        echo "❌ Push cancelled."
    fi
else
    echo "❌ SSH connection failed."
    echo ""
    echo "Please make sure:"
    echo "1. Your public key is added to GitHub"
    echo "2. Your private key has the correct permissions (chmod 600)"
    echo "3. The key fingerprint matches: SHA256:K+ptjc3NPAxRMl6D4zxc84ZE8jdAtZLV3tRpr90Gnao"
fi