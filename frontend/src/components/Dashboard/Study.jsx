import FileUploadBox from "../FileUpload/FileUpload.jsx"

export default function Study() {
  return (
    <>
      <h1 className="text-xl font-semibold mb-4">
        Record / Upload Study Session
      </h1>
      <FileUploadBox />
      <p className="text-sm text-gray-500 mt-2">
        Upload raw video (2–5 hrs). We auto-compress & track time.
      </p>
    </>
  );
}
