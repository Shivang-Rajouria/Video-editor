# Video Uploader and Merger Application

This application allows users to upload videos, trim them, and merge multiple videos together. It consists of a React-based frontend and an Express.js-based backend.

## Functionality

1. **Video Upload**: Users can select and upload video files to the server.
2. **Video Trimming**: Uploaded videos can be trimmed by specifying start time and duration.
3. **Video Merging**: Multiple uploaded videos can be merged into a single video file.

## Tech Stack

### Frontend
- React.js
- Axios for HTTP requests

### Backend
- Express.js
- Multer for handling file uploads
- FFmpeg (fluent-ffmpeg) for video processing

## Dependencies

### Frontend
- React
- axios

### Backend
- express
- multer
- cors
- fluent-ffmpeg

### Development Dependencies
- Jest
- Supertest

## Setup and Running Instructions

### Backend (Server)

1. Navigate to the server directory:
   ```
   cd server
   ```

2. Install the required npm packages:
   ```
   npm install
   ```

3. Ensure FFmpeg is installed on your system.

4. Run the Express server:
   ```
   node server.js
   ```

The server should now be running on `http://localhost:5000`.

### Frontend (Client)

1. Navigate to the client directory:
   ```
   cd client
   ```

2. Install the required npm packages:
   ```
   npm install
   ```

3. Start the React development server:
   ```
   npm start
   ```

The client should now be accessible at `http://localhost:3000`.

## Testing the Application

### Backend Tests

The backend includes unit tests using Jest and Supertest. To run the tests:

1. Navigate to the server directory:
   ```
   cd server
   ```

2. Run the test command:
   ```
   npm test
   ```

The tests cover the following API endpoints:
- POST /upload
- POST /trim
- POST /merge

### Manual Testing

1. Open your web browser and go to `http://localhost:3000`.

2. To test video upload:
   - Click on "Choose File" and select a video file.
   - Click "Upload Video".
   - You should see a success message and the uploaded video path.

3. To test video trimming:
   - After uploading a video, enter a start time and duration in the respective input fields.
   - Click "Trim Video".
   - You should see a message with the path of the trimmed video.

4. To test video merging:
   - Upload at least two videos.
   - Click "Merge Selected Videos".
   - You should see a message with the path of the merged video.

## Server API Endpoints

- POST /upload: Upload a video file
- POST /trim: Trim a video file
- POST /merge: Merge multiple video files

## Note

Make sure both the client and server are running simultaneously for the application to work properly. The server handles video processing operations, while the client provides the user interface for interacting with these functionalities.
