# Cloudflare R2 Storage Setup Guide

This guide will help you set up Cloudflare R2 for storing resume files.

## Prerequisites

- A Cloudflare account
- Access to Cloudflare R2 (available on all plans, including free tier)

## Step 1: Create an R2 Bucket

1. Log in to your [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Navigate to **R2** from the left sidebar
3. Click **"Create bucket"**
4. Enter a unique bucket name (e.g., `maven-jobs-resumes`)
5. Select a location (choose the closest to your users)
6. Click **"Create bucket"**

## Step 2: Generate R2 API Tokens

1. In the R2 dashboard, click **"Manage R2 API Tokens"**
2. Click **"Create API token"**
3. Give your token a name (e.g., `maven-jobs-upload`)
4. Set permissions to **"Object Read & Write"**
5. Optionally, restrict to your specific bucket
6. Click **"Create API token"**
7. **Important:** Copy and save the following values immediately (they won't be shown again):
   - Access Key ID
   - Secret Access Key
   - Endpoint URL (formatted as `https://<account-id>.r2.cloudflarestorage.com`)

## Step 3: Configure Public Access

You have two options for making files publicly accessible:

### Option A: Custom Domain (Recommended)

1. In your bucket settings, go to **"Settings"** tab
2. Click **"Connect Domain"**
3. Enter a subdomain (e.g., `resumes.yourdomain.com`)
4. Follow the DNS configuration instructions
5. Use this domain as your `R2_PUBLIC_URL`

### Option B: R2.dev Subdomain (Quick Setup)

1. In your bucket settings, go to **"Settings"** tab
2. Under **"Public access"**, click **"Allow Access"**
3. Enable **"Public R2.dev subdomain"**
4. Your public URL will be `https://pub-<id>.r2.dev`
5. Use this URL as your `R2_PUBLIC_URL`

## Step 4: Update Environment Variables

Add these variables to your `.env.local` file:

```env
# Cloudflare R2 Storage
R2_ENDPOINT="https://<your-account-id>.r2.cloudflarestorage.com"
R2_ACCESS_KEY_ID="your-access-key-id"
R2_SECRET_ACCESS_KEY="your-secret-access-key"
R2_BUCKET_NAME="your-bucket-name"
R2_PUBLIC_URL="https://resumes.yourdomain.com"  # or your R2.dev URL
```

## Step 5: Test the Upload

1. Restart your development server
2. Navigate to the profile page
3. Try uploading a resume file
4. The file should be uploaded to R2 and the URL should be saved to the database

## Security Best Practices

1. **Never commit `.env.local` to version control**
2. **Rotate API tokens regularly**
3. **Use custom domains** instead of R2.dev for production
4. **Set CORS policies** if accessing from different domains
5. **Enable bucket encryption** for sensitive data
6. **Monitor usage** to prevent unexpected costs

## CORS Configuration (If Needed)

If you need to access files directly from the browser:

1. Go to your bucket settings
2. Navigate to **"CORS policy"**
3. Add a policy:

```json
[
  {
    "AllowedOrigins": ["https://yourdomain.com"],
    "AllowedMethods": ["GET", "HEAD"],
    "AllowedHeaders": ["*"],
    "MaxAgeSeconds": 3000
  }
]
```

## Troubleshooting

### Upload fails with "Unauthorized"
- Check that your R2 API credentials are correct
- Verify the endpoint URL format
- Ensure the API token has write permissions

### Files upload but can't be accessed
- Verify your bucket has public access enabled
- Check your R2_PUBLIC_URL is configured correctly
- Ensure the custom domain DNS is properly configured

### "File not found" errors
- Verify the bucket name is correct
- Check that the file path format is correct (`resumes/{userId}/{timestamp}.{ext}`)

## Cost Considerations

Cloudflare R2 pricing (as of 2024):
- **Storage**: $0.015 per GB/month
- **Class A Operations** (writes): $4.50 per million requests
- **Class B Operations** (reads): $0.36 per million requests
- **No egress fees** (unlike S3)

The free tier includes:
- 10 GB storage
- 1 million Class A operations per month
- 10 million Class B operations per month

## Additional Resources

- [Cloudflare R2 Documentation](https://developers.cloudflare.com/r2/)
- [R2 API Reference](https://developers.cloudflare.com/r2/api/s3/)
- [Pricing Details](https://www.cloudflare.com/products/r2/)

