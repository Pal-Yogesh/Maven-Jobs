# Resume Upload Implementation

This document describes the implementation of resume upload functionality using Cloudflare R2 storage.

## Overview

The resume upload feature allows candidates to upload their resume files (PDF, DOC, DOCX) which are securely stored in Cloudflare R2 storage. The resume URL is then saved to the user's profile in the database.

## Architecture

### Components

1. **Frontend Component** (`app/profile/page.tsx`)
   - `ResumeForm` component with drag-and-drop upload
   - File validation and upload progress indication
   - Display and removal of uploaded resumes

2. **API Route** (`app/api/upload-resume/route.ts`)
   - Handles file upload requests
   - Validates file type and size
   - Uploads to R2 storage
   - Updates database with resume URL

3. **R2 Utility** (`lib/r2.ts`)
   - S3-compatible client configuration for R2
   - Upload helper functions
   - Filename generation utilities

## Features

### File Upload
- ✅ Drag and drop support
- ✅ Click to browse file selection
- ✅ Real-time upload progress indicator
- ✅ File type validation (PDF, DOC, DOCX only)
- ✅ File size validation (max 5MB)
- ✅ Unique filename generation (prevents collisions)

### Security
- ✅ Authentication required (NextAuth session check)
- ✅ File type validation on server
- ✅ File size limits enforced
- ✅ User-specific file paths (`resumes/{userId}/{timestamp}.{ext}`)

### User Experience
- ✅ Visual feedback during upload
- ✅ Success/error notifications
- ✅ View uploaded resume in new tab
- ✅ Remove resume functionality
- ✅ Responsive design

## File Structure

```
├── app/
│   ├── api/
│   │   └── upload-resume/
│   │       └── route.ts           # Upload API endpoint
│   └── profile/
│       └── page.tsx                # Profile page with ResumeForm
├── lib/
│   └── r2.ts                       # R2 client and utilities
├── prisma/
│   └── schema.prisma               # Database schema (includes resumeUrl)
└── CLOUDFLARE_R2_SETUP.md         # Setup instructions
```

## API Endpoint

### POST `/api/upload-resume`

**Authentication:** Required (NextAuth session)

**Request:**
- Content-Type: `multipart/form-data`
- Body: FormData with `file` field

**Response:**
```json
{
  "success": true,
  "message": "Resume uploaded successfully",
  "data": {
    "resumeUrl": "https://your-domain.com/resumes/user-id/timestamp.pdf"
  }
}
```

**Error Responses:**

401 Unauthorized:
```json
{
  "success": false,
  "message": "Unauthorized"
}
```

400 Bad Request (Invalid file type):
```json
{
  "success": false,
  "message": "Invalid file type. Only PDF, DOC, and DOCX are allowed."
}
```

400 Bad Request (File too large):
```json
{
  "success": false,
  "message": "File size too large. Maximum size is 5MB."
}
```

## Database Schema

The `resumeUrl` field is already included in the `Profile` model:

```prisma
model Profile {
  id              String   @id @default(uuid())
  userId          String   @unique
  user            user     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  // ... other fields ...
  
  resumeUrl       String?  // URL to the uploaded resume in R2
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@map("profiles")
}
```

## Environment Variables

Required environment variables (see `.env.example`):

```env
# Cloudflare R2 Storage
R2_ENDPOINT="https://<account-id>.r2.cloudflarestorage.com"
R2_ACCESS_KEY_ID="your-r2-access-key-id"
R2_SECRET_ACCESS_KEY="your-r2-secret-access-key"
R2_BUCKET_NAME="your-bucket-name"
R2_PUBLIC_URL="https://resumes.yourdomain.com"
```

## Setup Instructions

1. **Follow the R2 setup guide:**
   ```bash
   # See CLOUDFLARE_R2_SETUP.md for detailed instructions
   ```

2. **Install dependencies** (already included):
   ```bash
   pnpm install
   ```
   The `@aws-sdk/client-s3` package is already in `package.json`

3. **Configure environment variables:**
   - Copy `.env.example` to `.env.local`
   - Fill in your R2 credentials

4. **Test the upload:**
   - Start the dev server: `pnpm dev`
   - Navigate to `/profile`
   - Upload a resume file

## Usage

### For Developers

To use the upload functionality in other parts of the app:

```typescript
// 1. Upload file
const formData = new FormData()
formData.append('file', file)

const response = await fetch('/api/upload-resume', {
  method: 'POST',
  body: formData,
})

const result = await response.json()

if (result.success) {
  const resumeUrl = result.data.resumeUrl
  // Use the URL as needed
}

// 2. Use R2 utilities directly
import { uploadToR2, generateResumeFileName } from '@/lib/r2'

const fileName = generateResumeFileName(originalName, userId)
const url = await uploadToR2(buffer, fileName, contentType)
```

### For Users

1. Navigate to the profile page
2. Click on the resume upload area or drag a file
3. Select a PDF, DOC, or DOCX file (max 5MB)
4. Wait for the upload to complete
5. Click "View Current Resume" to open in a new tab
6. Click "Remove" to delete the resume

## Technical Details

### File Storage Path

Files are stored with the following path structure:
```
resumes/{userId}/{timestamp}.{extension}
```

Example:
```
resumes/550e8400-e29b-41d4-a716-446655440000/1699564800000.pdf
```

This ensures:
- ✅ No filename collisions
- ✅ Easy user-specific file management
- ✅ Chronological ordering of uploads

### Supported File Types

| Type | MIME Type | Extension |
|------|-----------|-----------|
| PDF | application/pdf | .pdf |
| Word (old) | application/msword | .doc |
| Word (new) | application/vnd.openxmlformats-officedocument.wordprocessingml.document | .docx |

### File Size Limit

- Maximum: 5 MB (5,242,880 bytes)
- Configurable in `app/api/upload-resume/route.ts`

## Error Handling

The implementation includes comprehensive error handling:

1. **Frontend Validation:**
   - File type check (via accept attribute)
   - User feedback during upload

2. **Backend Validation:**
   - Authentication check
   - File type verification
   - File size verification
   - R2 upload error handling

3. **User Feedback:**
   - Toast notifications for success/errors
   - Visual upload progress
   - Clear error messages

## Future Enhancements

Potential improvements:

- [ ] Resume versioning (keep history of uploads)
- [ ] Resume preview/viewer
- [ ] File compression before upload
- [ ] Multiple resume uploads (different versions)
- [ ] Resume parsing (extract text for search)
- [ ] Thumbnail generation for PDF resumes
- [ ] OCR for image-based resumes
- [ ] Resume templates
- [ ] Download count tracking

## Troubleshooting

### Common Issues

**1. Upload fails immediately**
- Check R2 credentials in `.env.local`
- Verify bucket name is correct
- Ensure API token has write permissions

**2. Upload succeeds but file not accessible**
- Check R2_PUBLIC_URL is configured
- Verify bucket public access settings
- Check custom domain DNS configuration

**3. "Unauthorized" error**
- Ensure user is logged in
- Check NextAuth configuration
- Verify session is active

**4. TypeScript errors**
- Run `pnpm install` to ensure dependencies are installed
- Check that `@aws-sdk/client-s3` is in package.json

## Performance Considerations

- Files are streamed directly to R2 (not stored on server)
- 5MB file size limit prevents memory issues
- Efficient buffer handling
- No intermediate file system writes

## Security Considerations

- Authentication required for uploads
- File type validation (client and server)
- User-specific storage paths
- No executable file types allowed
- Size limits prevent abuse
- API tokens kept in environment variables

## Monitoring

To monitor R2 usage:

1. Go to Cloudflare Dashboard > R2
2. View analytics for:
   - Storage usage
   - Request counts
   - Bandwidth usage

## Support

For issues related to:
- **R2 Setup**: See `CLOUDFLARE_R2_SETUP.md`
- **Code Issues**: Check this document
- **Cloudflare R2**: [R2 Documentation](https://developers.cloudflare.com/r2/)

---

**Last Updated:** October 9, 2025
**Version:** 1.0.0

