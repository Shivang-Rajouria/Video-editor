const express = require('express');
const multer = require('multer');
const cors = require('cors');


const app=express();

const PORT = 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));