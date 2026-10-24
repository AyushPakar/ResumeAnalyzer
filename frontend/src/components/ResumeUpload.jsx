import { useRef, useState } from "react";
import axios from "axios";
import { Upload, FileText, X, CheckCircle, AlertCircle } from "lucide-react";

export default function ResumeUpload({ onUploaded, Isupload }) {
  const fileInputRef = useRef(null);

  const [data, setData] = useState(null);
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState(false);
  const [error, setError] = useState("");

  const validateFile = (selectedFile) => {
    if (!selectedFile) return false;

    const allowedTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!allowedTypes.includes(selectedFile.type)) {
      setError("Only PDF and DOCX files are allowed.");
      return false;
    }

    if (selectedFile.size > maxSize) {
      setError("File size must be less than 5MB.");
      return false;
    }

    return true;
  };

  const handleFile = (selectedFile) => {
    setError("");
    setUploaded(false);

    if (!validateFile(selectedFile)) {
      setFile(null);
      return;
    }

    setFile(selectedFile);
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];

    if (selectedFile) {
      handleFile(selectedFile);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);

    const droppedFile = e.dataTransfer.files?.[0];

    if (droppedFile) {
      handleFile(droppedFile);
    }
  };

  const removeFile = () => {
    setFile(null);
    setUploaded(false);
    setError("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const uploadResume = async () => {
    if (!file) {
      setError("Please select a resume first.");
      return;
    }

    try {
      setUploading(true);
      setError("");
      setUploaded(false);

      const formData = new FormData();
      formData.append("resume", file);

      const testData = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/upload-resume`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      setData(testData.data);
      console.log("Resume uploaded and analyzed successfully:", testData.data);
      onUploaded(testData.data.resumeId);
      setUploaded(true);
      Isupload(true);
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
          "Something went wrong while uploading your resume.",
      );
    } finally {
      setUploading(false);
    }
  };

  return (
    <section className="card w-full p-4 h-100 overflow-y-auto">
      {/* Header */}
      <div className="mb-6">
        <h2 className="font-space text-xl font-bold text-[var(--ink)]">
          Upload your resume
        </h2>

        <p className="mt-1 text-sm text-[var(--muted)]">
          Upload your resume to analyze your ATS score and identify areas for
          improvement.
        </p>
      </div>

      {/* Upload Area */}
      {!file ? (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`flex min-h-[220px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 text-center transition-colors ${
            isDragging
              ? "border-[var(--good)] bg-[var(--good-bg)]"
              : "border-[var(--border)] bg-[var(--paper)] hover:border-[var(--good)]"
          }`}
        >
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--good-bg)]">
            <Upload className="h-6 w-6 text-[var(--good)]" />
          </div>

          <p className="font-semibold text-[var(--ink)]">
            Drop your resume here
          </p>

          <p className="mt-1 text-sm text-[var(--muted)]">
            or click to browse your files
          </p>

          <p className="mt-4 text-xs text-[var(--muted)]">
            PDF or DOCX • Maximum 5MB
          </p>

          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.docx"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      ) : (
        /* Selected File */
        <div className="rounded-xl border border-[var(--border)] bg-[var(--paper)] p-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[var(--good-bg)]">
                <FileText className="h-5 w-5 text-[var(--good)]" />
              </div>

              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-[var(--ink)]">
                  {file.name}
                </p>

                <p className="mt-1 text-xs text-[var(--muted)]">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={removeFile}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[var(--muted)] transition-colors hover:bg-[var(--card)] hover:text-[var(--ink)]"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Upload Button */}
          <button
            type="button"
            onClick={uploadResume}
            disabled={uploading || uploaded}
            className="mt-4 w-full rounded-lg bg-[var(--good)] px-4 py-3 text-sm font-semibold text-[var(--paper)] transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {uploading
              ? "Uploading..."
              : uploaded
                ? "Resume uploaded"
                : "Upload resume"}
          </button>
        </div>
      )}

      {/* Success Message */}
      {uploaded && (
        <div className="mt-4 flex items-center gap-2 rounded-lg border border-[var(--good)] bg-[var(--good-bg)] px-4 py-3 text-sm text-[var(--good)]">
          <CheckCircle className="h-4 w-4 shrink-0" />
          <span> Successfull </span>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mt-4 flex items-center gap-2 rounded-lg border border-[var(--bad)] bg-[var(--bad-bg)] px-4 py-3 text-sm text-[var(--bad)]">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </section>
  );
}
