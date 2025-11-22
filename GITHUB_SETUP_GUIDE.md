# 🚀 GitHub Setup Guide

## Prerequisites

### 1. Install Git
**Windows:**
- Download from: https://git-scm.com/download/win
- Run the installer with default settings
- Restart your terminal/IDE after installation

**Verify Installation:**
```bash
git --version
```

### 2. Create GitHub Account
- Go to https://github.com
- Sign up for a free account if you don't have one

## Step-by-Step Guide

### Step 1: Initialize Git Repository

Open your terminal in the project root directory and run:

```bash
git init
```

### Step 2: Create .gitignore File

Create a `.gitignore` file to exclude unnecessary files:

```bash
# See the .gitignore file I've created for you
```

### Step 3: Configure Git (First Time Only)

```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

### Step 4: Add All Files

```bash
git add .
```

### Step 5: Create First Commit

```bash
git commit -m "Initial commit: Trading Dashboard with LEAP features"
```

### Step 6: Create GitHub Repository

1. Go to https://github.com/new
2. Repository name: `trading-dashboard` (or your preferred name)
3. Description: "Professional trading journal with discipline tracking, position calculator, and smart reminders"
4. Choose **Public** or **Private**
5. **DO NOT** initialize with README (we already have one)
6. Click "Create repository"

### Step 7: Connect to GitHub

Copy the commands from GitHub (they'll look like this):

```bash
git remote add origin https://github.com/YOUR_USERNAME/trading-dashboard.git
git branch -M main
git push -u origin main
```

Replace `YOUR_USERNAME` with your actual GitHub username.

### Step 8: Push Your Code

```bash
git push -u origin main
```

You may be prompted to log in to GitHub.

## Future Updates

After making changes to your code:

```bash
# Check what changed
git status

# Add all changes
git add .

# Commit with a message
git commit -m "Add new feature: XYZ"

# Push to GitHub
git push
```

## Quick Commands Reference

```bash
# Check status
git status

# Add specific file
git add filename.js

# Add all files
git add .

# Commit changes
git commit -m "Your message here"

# Push to GitHub
git push

# Pull latest changes
git pull

# View commit history
git log --oneline

# Create new branch
git checkout -b feature-name

# Switch branches
git checkout main
```

## Recommended Repository Settings

### Repository Description
```
Professional trading journal with discipline tracking, position calculator, and smart reminders. Built with React, Node.js, and Express.
```

### Topics (Tags)
- trading
- forex
- trading-journal
- position-calculator
- react
- nodejs
- express
- trading-dashboard
- risk-management

### README Badges (Optional)
Add these to your README.md:

```markdown
![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D14.0.0-brightgreen.svg)
![React](https://img.shields.io/badge/react-18.x-blue.svg)
```

## Troubleshooting

### Authentication Issues
If you have trouble pushing:
1. Use GitHub Personal Access Token instead of password
2. Go to: GitHub Settings → Developer settings → Personal access tokens
3. Generate new token with `repo` scope
4. Use token as password when prompted

### Large Files Warning
If you get warnings about large files:
```bash
# Remove node_modules if accidentally added
git rm -r --cached node_modules
git commit -m "Remove node_modules"
```

## Project Structure for GitHub

Your repository will include:
- ✅ Frontend (React + Vite)
- ✅ Backend (Node.js + Express)
- ✅ MT4/MT5 Expert Advisors
- ✅ Documentation (Multiple guides)
- ✅ Sample data
- ✅ Configuration examples

## Next Steps After Upload

1. **Add a LICENSE file** (MIT recommended)
2. **Update README.md** with screenshots
3. **Create GitHub Pages** for documentation (optional)
4. **Set up GitHub Actions** for CI/CD (optional)
5. **Add CONTRIBUTING.md** if accepting contributions

## Sharing Your Project

Once uploaded, share your repository:
```
https://github.com/YOUR_USERNAME/trading-dashboard
```

People can clone it with:
```bash
git clone https://github.com/YOUR_USERNAME/trading-dashboard.git
```
