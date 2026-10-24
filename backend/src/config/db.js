import dns from "node:dns";
import mongoose from "mongoose";

// Atlas "mongodb+srv://" strings need a DNS SRV lookup. Some ISP/router DNS
// servers refuse those (error: querySrv ECONNREFUSED), so ask Google and
// Cloudflare DNS directly. Safe to delete if your network handles it fine.
dns.setServers(["8.8.8.8", "1.1.1.1"]);

let bucket;

export async function connectDB() {
  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI is missing. Add it to your .env file.");
  }

  await mongoose.connect(process.env.MONGODB_URI);

  // GridFS stores files in two collections: resumes.files and resumes.chunks
  bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
    bucketName: "resumes",
  });

  console.log("MongoDB connected");
}

export function getBucket() {
  if (!bucket) throw new Error("Database is not connected yet");
  return bucket;
}
