import { getBucket } from "../config/db.js";

// Streams an in-memory file buffer into GridFS and resolves with the new file's _id
export function uploadToGridFS(buffer, filename, contentType) {
  return new Promise((resolve, reject) => {
    const stream = getBucket().openUploadStream(filename, { contentType });
    stream.on("error", reject);
    stream.on("finish", () => resolve(stream.id));
    stream.end(buffer);
  });
}

// Reads a stored file back into memory (used by "Retry")
export async function downloadFromGridFS(fileId) {
  const chunks = [];
  for await (const chunk of getBucket().openDownloadStream(fileId)) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

// Deletes a stored file. A file that's already gone is not an error.
export async function deleteFromGridFS(fileId) {
  try {
    await getBucket().delete(fileId);
  } catch (err) {
    if (!String(err.message).includes("FileNotFound")) throw err;
  }
}
