import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// Cloudflare R2 configuration
// R2 is S3-compatible, so we use the AWS SDK
export const r2Client = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT!, // e.g., https://<account-id>.r2.cloudflarestorage.com
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

/**
 * Upload a file to Cloudflare R2 storage (private bucket)
 * @param file - The file buffer to upload
 * @param fileName - The name/key for the file in R2
 * @param contentType - The MIME type of the file
 * @returns The file key (path) in R2
 */
export async function uploadToR2(
  file: Buffer,
  fileName: string,
  contentType: string
): Promise<string> {
  const bucketName = process.env.R2_BUCKET_NAME!;
  
  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: fileName,
    Body: file,
    ContentType: contentType,
  });

  await r2Client.send(command);

  // aplicationID/uniqueresumename/userresumename.pdf -> resumeUrl

  // Return just the file key (not a public URL)
  // This will be stored in the database
  return fileName;
}

/**
 * Generate a presigned URL for secure, temporary access to a file
 * @param fileKey - The file key (path) in R2
 * @param expiresIn - Time in seconds until the URL expires (default: 1 hour)
 * @returns A presigned URL that expires after the specified time
 */
export async function getPresignedUrl(
  fileKey: string,
  expiresIn: number = 3600 // 1 hour default
): Promise<string> {
  console.log("fileKey", fileKey);
  
  const bucketName = process.env.R2_BUCKET_NAME!;
  console.log("bucketName", bucketName);

  const command = new GetObjectCommand({
    Bucket: bucketName,
    Key: fileKey,
  });

  // Generate a presigned URL that expires
  const presignedUrl = await getSignedUrl(r2Client, command, {
    expiresIn,
  });

  return presignedUrl;
}

/**
 * Generate a unique filename for the resume
 * @param originalName - The original filename
 * @param userId - The user's ID
 * @returns A unique filename
 */
export function generateResumeFileName(originalName: string, userId: string): string {
  const timestamp = Date.now();
  const extension = originalName.split('.').pop();
  return `resumes/${userId}/${originalName}/${timestamp}.${extension}`;
}

