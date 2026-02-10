# Deployment Guide

This document explains how to deploy the LINE Mini App to GitHub Pages.

## Prerequisites

1. **LINE Developers Account**
   - Create a LINE Login Channel at https://developers.line.biz/
   - Create a LIFF app under your channel
   - Note down your LIFF ID

2. **GitHub Repository**
   - This code is already in a git repository
   - Push to GitHub if not already done

## Step 1: Configure GitHub Repository

### 1.1 Enable GitHub Pages

1. Go to your repository on GitHub
2. Click **Settings** → **Pages**
3. Under "Source", select **GitHub Actions**

### 1.2 Add GitHub Secrets

1. Go to **Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret**
3. Add the following secret:

```
Name: VITE_LIFF_ID
Value: <your-liff-id-from-line-developers>
```

## Step 2: Update Configuration

### 2.1 Update Base URL in vite.config.js

Open `vite.config.js` and update the base URL to match your repository name:

```javascript
base: process.env.NODE_ENV === 'production'
  ? '/your-repo-name/'  // ← Change this to your actual repo name
  : '/',
```

For example, if your repository is `https://github.com/username/lineminiapp`, use:
```javascript
base: process.env.NODE_ENV === 'production'
  ? '/lineminiapp/'
  : '/',
```

### 2.2 Update LIFF Endpoint URL

1. Go to LINE Developers Console
2. Select your LIFF app
3. Set the **Endpoint URL** to:
   ```
   https://<username>.github.io/<repo-name>/
   ```

## Step 3: Deploy

### Automatic Deployment (Recommended)

Simply push to the main branch:

```bash
git add .
git commit -m "Deploy to GitHub Pages"
git push origin main
```

The GitHub Actions workflow will automatically:
1. Install dependencies
2. Build the app
3. Deploy to GitHub Pages

### Manual Deployment

You can also trigger deployment manually:
1. Go to **Actions** tab on GitHub
2. Select "Deploy to GitHub Pages"
3. Click **Run workflow**

## Step 4: Verify Deployment

1. Wait for the GitHub Actions workflow to complete (usually 2-3 minutes)
2. Visit your app at: `https://<username>.github.io/<repo-name>/`
3. Open the URL in LINE browser or use LIFF inspector for testing

## Testing

### Local Testing with LIFF

Since LIFF requires HTTPS, use one of these methods for local testing:

#### Option 1: ngrok (Recommended)

```bash
# Start dev server
npm run dev

# In another terminal
ngrok http 3000

# Use the ngrok HTTPS URL as your LIFF endpoint
```

#### Option 2: Vite HTTPS

```bash
# Start with HTTPS (self-signed certificate)
npm run dev -- --https
```

### Mock Mode

For development without LIFF:

1. Open `.env.development`
2. Set `VITE_LIFF_MOCK=true`
3. Run `npm run dev`

This will use a fake user profile for testing.

## Troubleshooting

### Build Fails

**Error: Missing VITE_LIFF_ID**
- Make sure you added the secret in GitHub Settings
- Check the secret name is exactly `VITE_LIFF_ID`

**Error: Node version mismatch**
- Workflow uses Node 18, ensure compatibility

### Deployment Succeeds but App Doesn't Work

**Blank page**
- Check the base URL in `vite.config.js` matches your repo name
- Open browser console for errors

**LIFF initialization fails**
- Verify LIFF ID is correct in GitHub Secrets
- Check LIFF Endpoint URL in LINE Developers Console
- Make sure the URL includes the base path

**404 errors for assets**
- The base URL might be incorrect
- Rebuild and redeploy after fixing base URL

### LIFF Testing Issues

**"LIFF ID is not configured"**
- Check your `.env.production` or GitHub Secret

**"LIFF init failed: Invalid LIFF ID"**
- Verify the LIFF ID in LINE Developers Console
- Ensure no extra spaces or characters

**Works locally but not on GitHub Pages**
- Different LIFF IDs for dev/prod? Use production LIFF ID
- Check CORS settings in LINE Developers Console

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_LIFF_ID` | LIFF ID from LINE Developers | Yes |
| `VITE_LIFF_MOCK` | Enable mock mode (true/false) | No (default: false) |
| `VITE_APP_TITLE` | App title | No (default: 日程管理) |

## Monitoring

Check deployment status:
- **Actions tab**: View build logs and deployment status
- **Environments**: See deployment history and URLs

## Rollback

To rollback to a previous version:
1. Go to **Actions** tab
2. Find the successful deployment you want to rollback to
3. Click **Re-run all jobs**

Or use git:
```bash
git revert <commit-hash>
git push origin main
```

## Custom Domain (Optional)

To use a custom domain:
1. Go to **Settings** → **Pages**
2. Enter your custom domain
3. Configure DNS according to GitHub's instructions
4. Update LIFF Endpoint URL to your custom domain

## Security Notes

- ✅ LIFF ID is safe to expose in client code
- ✅ All data is stored locally in browser
- ✅ No sensitive secrets in repository
- ❌ Never commit `.env.local` files
- ❌ Don't expose LINE Channel Secret

## Support

For issues:
- Check GitHub Actions logs
- Review browser console errors
- Verify LINE Developers Console settings
- Check LIFF documentation: https://developers.line.biz/en/docs/liff/

## Next Steps

After successful deployment:
1. Test all features in LINE browser
2. Request notification permissions
3. Create test schedules
4. Verify data persistence
5. Share LIFF URL with users!
