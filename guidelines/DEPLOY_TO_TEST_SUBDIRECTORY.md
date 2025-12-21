# Deploying Zaytoonz NGO to zaytoonz.com/Test

This guide explains how to deploy your Next.js application to the `/Test` subdirectory on Hostinger.

## ⚠️ Important Considerations

Since your Next.js app uses **API routes** (server-side functionality), you have a few options:

### Option 1: Hostinger Shared Hosting with Node.js Support (Recommended)
If your Hostinger plan supports Node.js applications:
- Deploy the app to the `/Test` directory
- Configure Node.js to run from that directory
- The app will be accessible at `zaytoonz.com/Test`

### Option 2: Use a Subdomain Instead
If subdirectory deployment isn't possible:
- Deploy to `test.zaytoonz.com` (easier setup)
- No basePath configuration needed

### Option 3: Hostinger VPS
If you have VPS access:
- Deploy to VPS and configure Nginx to proxy `/Test` to your app

## 🚀 Deployment Steps

### Step 1: Configure Environment Variables

Create a `.env.local` file (or update existing one) with:

```env
# Base path for subdirectory deployment
NEXT_PUBLIC_BASE_PATH=/Test

# Your existing environment variables
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key
NODE_ENV=production
```

### Step 2: Build the Application

```bash
# Set the base path
export NEXT_PUBLIC_BASE_PATH=/Test

# Build the application
npm run build
```

Or on Windows PowerShell:
```powershell
$env:NEXT_PUBLIC_BASE_PATH="/Test"
npm run build
```

### Step 3: Deploy to Hostinger

#### Method A: Using FTP/File Manager

1. **Connect to Hostinger** via FTP or File Manager (hPanel)

2. **Navigate to your domain's root directory** (usually `public_html`)

3. **Create the Test directory** if it doesn't exist:
   ```
   public_html/Test/
   ```

4. **Upload the following files/folders**:
   - `.next/` folder (entire build output)
   - `public/` folder
   - `package.json`
   - `package-lock.json`
   - `node_modules/` (or install on server)
   - `.env.local` (with your environment variables)

5. **Create a `server.js` file** in the `/Test` directory:

```javascript
const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = process.env.PORT || 3001; // Use different port for subdirectory

const app = next({ 
  dev, 
  hostname, 
  port,
  basePath: '/Test' // Important: set basePath
});

const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('internal server error');
    }
  }).listen(port, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://${hostname}:${port}`);
  });
});
```

6. **Install dependencies** (if not uploaded):
   ```bash
   cd /path/to/public_html/Test
   npm install --production
   ```

7. **Start the application** using PM2 or Hostinger's Node.js manager:
   ```bash
   pm2 start server.js --name zaytoonz-test
   ```

#### Method B: Using Hostinger's Node.js App Manager

1. **Log into hPanel** → **Node.js** section

2. **Create a new Node.js application**:
   - **App name**: `zaytoonz-test`
   - **App directory**: `/Test` or `/public_html/Test`
   - **Node.js version**: 18.x or 20.x
   - **Startup file**: `server.js`

3. **Upload your files** to the `/Test` directory

4. **Set environment variables** in hPanel:
   ```
   NEXT_PUBLIC_BASE_PATH=/Test
   NODE_ENV=production
   NEXT_PUBLIC_SUPABASE_URL=...
   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
   ```

5. **Start the application** from hPanel

#### Method C: Using Hostinger API (Automated)

Use the provided deployment script:
```powershell
.\guidelines\deploy-to-test-subdirectory.ps1
```

## 🔧 Configuration Files

### server.js (for subdirectory deployment)

Create this file in your project root:

```javascript
const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');

const dev = process.env.NODE_ENV !== 'production';
const hostname = process.env.HOSTNAME || 'localhost';
const port = parseInt(process.env.PORT || '3001', 10);
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '/Test';

const app = next({ 
  dev, 
  hostname, 
  port,
  basePath 
});

const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('internal server error');
    }
  }).listen(port, hostname, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://${hostname}:${port}${basePath}`);
  });
});
```

### .htaccess (if using Apache)

If Hostinger uses Apache and you need URL rewriting, create `.htaccess` in `/Test`:

```apache
RewriteEngine On
RewriteBase /Test/

# Handle Next.js routes
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ /Test/$1 [L]
```

## 📝 Alternative: Deploy to Subdomain (Easier)

If subdirectory deployment is too complex, consider deploying to a subdomain:

1. **Create subdomain** `test.zaytoonz.com` in Hostinger
2. **Remove basePath** from `next.config.js`
3. **Deploy normally** to the subdomain's directory
4. **Access at** `https://test.zaytoonz.com`

This is often easier and doesn't require basePath configuration.

## ✅ Verification

After deployment, verify:

1. **Homepage loads**: `https://zaytoonz.com/Test`
2. **API routes work**: `https://zaytoonz.com/Test/api/opportunities`
3. **Static assets load**: Check browser console for 404 errors
4. **Navigation works**: Test internal links

## 🐛 Troubleshooting

### Issue: 404 errors on routes
**Solution**: Ensure `basePath` is set correctly in both `next.config.js` and environment variables

### Issue: API routes return 404
**Solution**: Check that the server is running and the basePath is configured correctly

### Issue: Static assets (images, CSS) not loading
**Solution**: Verify `basePath` is set and assets are in the correct location

### Issue: Port conflicts
**Solution**: Use a different port (3001, 3002, etc.) for the subdirectory app

## 📞 Need Help?

If you encounter issues:
1. Check Hostinger's Node.js documentation
2. Verify your hosting plan supports Node.js
3. Contact Hostinger support for subdirectory deployment guidance

---

**Note**: Hostinger shared hosting may have limitations for Node.js apps in subdirectories. If you encounter issues, consider:
- Using a subdomain instead (`test.zaytoonz.com`)
- Upgrading to VPS hosting
- Using Hostinger's managed Node.js hosting feature

