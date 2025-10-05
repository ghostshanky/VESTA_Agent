import { useState } from 'react';

export default function CSVUploadTest() {
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setMessage('Please select a file');
      return;
    }
    setMessage('File ready to be uploaded: ' + file.name);
  };

  return (
    <div style={{ padding: '20px', backgroundColor: '#f3f4f6', maxWidth: '400px', margin: '20px auto', borderRadius: '8px' }}>
      <h2>CSV Upload Test</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '10px' }}>
          <label htmlFor="csvFile" style={{ display: 'block', marginBottom: '4px' }}>CSV File</label>
          <input
            id="csvFile"
            type="file"
            accept=".csv"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
        </div>
        <button type="submit" style={{ padding: '10px 20px', backgroundColor: '#22c55e', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          Submit
        </button>
      </form>
      {message && <p style={{ marginTop: '10px' }}>{message}</p>}
    </div>
  );
}
