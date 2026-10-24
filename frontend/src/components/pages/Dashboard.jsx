// Dashboard.jsx
import { useState } from "react";
import ResumeUpload from "../ResumeUpload";
import JobDescriptionCard from "../JobDescription";
import JobMatchResult from "../Jobmatchresult";
import ATSScoreCard from "../ATSScoreCard";

export default function Dashboard() {
  const [resumeId, setResumeId] = useState(null);
  const [matchResult, setMatchResult] = useState(null);
  const [IsUpload, setUploaded] = useState(false);

  function handleUploaded(id) {
    setResumeId(id);
    setMatchResult(null); // an old comparison no longer belongs to this resume
  }

  return (
    <div className="container mx-auto px-50 py-8 mt-16">
      <div className="flex grid gap-5 md:grid-cols-2 mb-6">
        <ResumeUpload onUploaded={handleUploaded} Isupload={setUploaded} />
        <JobDescriptionCard resumeId={resumeId} onResult={setMatchResult} />
      </div>
      <div className="flex-col">
        {IsUpload && <ATSScoreCard resumeId={resumeId} />}
        {matchResult && <JobMatchResult result={matchResult} />}
      </div>
    </div>
  );
}
// container flex gap-4 mx-auto px-50 py-8
