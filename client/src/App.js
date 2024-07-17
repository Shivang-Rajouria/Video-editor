import React, { useState } from 'react';
import axios from 'axios';
import './App.css'; 


const VideoUploader = () => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [videoPaths, setVideoPaths] = useState([]);
    const [trimOptions, setTrimOptions] = useState({ startTime: '', duration: '' });
    const [message, setMessage] = useState('');

    const handleFileChange = (e) => {
        setSelectedFile(e.target.files[0]);
    };

    const handleUpload = async () => {
        if (!selectedFile) return;

        const formData = new FormData();
        formData.append('video', selectedFile);

        try {
            const response = await axios.post('http://localhost:5000/upload', formData);
            setVideoPaths([...videoPaths, response.data.path]);
            setMessage('Video uploaded successfully.');
        } catch (error) {
            setMessage('Error uploading video.');
        }
    };

    const handleTrim = async () => {
        const { startTime, duration } = trimOptions;
        const videoPath = videoPaths[0]; // Assuming we trim the first video

        try {
            const response = await axios.post('http://localhost:5000/trim', {
                videoPath,
                startTime,
                duration,
            });
            setMessage(`Trimmed video saved at: ${response.data.outputPath}`);
        } catch (error) {
            setMessage('Error trimming video.');
        }
    };

    const handleMerge = async () => {
        if (videoPaths.length < 2) {
            setMessage('Need at least two videos to merge.');
            return;
        }

        try {
            const response = await axios.post('http://localhost:5000/merge', {
                videoPaths,
            });
            setMessage(`Merged video saved at: ${response.data.outputPath}`);
        } catch (error) {
            setMessage('Error merging videos.');
        }
    };

    return (
        <div>
            <h1>Video Uploader and Merger</h1>
            <input type="file" accept="video/*" onChange={handleFileChange} />
            <button onClick={handleUpload}>Upload Video</button>

            <h2>Upload Status</h2>
            <p>{message}</p>

            <h2>Trim Video</h2>
            <input
                type="text"
                placeholder="Start Time (e.g., 00:00:10)"
                onChange={(e) => setTrimOptions({ ...trimOptions, startTime: e.target.value })}
            />
            <input
                type="text"
                placeholder="Duration (e.g., 00:00:30)"
                onChange={(e) => setTrimOptions({ ...trimOptions, duration: e.target.value })}
            />
            <button onClick={handleTrim}>Trim Video</button>

            <h2>Merge Videos</h2>
            <button onClick={handleMerge}>Merge Selected Videos</button>

            <h2>Uploaded Videos</h2>
            <ul>
                {videoPaths.map((path, index) => (
                    <li key={index}>{path}</li>
                ))}
            </ul>
        </div>
    );
};

export default VideoUploader;
