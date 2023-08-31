const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const fs = require("fs");
const axios = require("axios");
const port = 6000;
const mountingVolume = "../Pratik_PV_dir/";
var result;

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

// defining the Express app
const app = express();
// adding Helmet to enhance your Rest API's security
app.use(helmet());
// using bodyParser to parse JSON bodies into JS objects
app.use(express.json());
// enabling CORS for all requests
app.use(cors());
// adding morgan to log HTTP requests
app.use(morgan("combined"));

app.get("/", (req, res) => {
  res.send(
    "<h1>How the food</h1>"
  );
});

function validateJSON(json) {
  const requiredKeys = ["file", "product"];
  const parsedJSON = JSON.parse(json);
  const availableKeys = Object.keys(parsedJSON).map((key) => key.toLowerCase());
  if (requiredKeys.length !== availableKeys.length) {
    return false; // Different lengths, arrays don't match
  }

  for (let i = 0; i < availableKeys.length; i++) {
    if (!requiredKeys.includes(availableKeys[i])) {
      return false;
    }
  }
  const desiredKey = "file";
  const keys = Object.keys(parsedJSON);
  const foundKey = keys.find((key) => key.toLowerCase() === desiredKey);
  const fileValue = parsedJSON[foundKey];
  if (!fileValue) {
    return false;
  }

  return true; // All elements match, arrays match
}

// defining an endpoint to return all ads
app.post("/calculate", async (req, res) => {
  result = null;
  var fileName = null;
  // Access the JSON data sent in the request body
  jsonString = JSON.stringify(req.body);
  // Process the JSON data as needed
  if (validateJSON(jsonString)) {
    fileName = req.body.file.trim();
    const filePath = mountingVolume + fileName;
    try {
      const data = await fs.promises.readFile(filePath, "utf8");
      try {
        const response = await axios.post(
          "http://sum-producer:6001/fetch",
          req.body
        );
        result = response.data;
      } catch (error) {
        console.error("Error:", error);
      }
    } catch (err) {
      result = {
        file: fileName,
        error: "File not found.",
      };
    }
  } else {
    result = {
      file: fileName,
      error: "Invalid JSON input.",
    };
  }
  res.status(200).json(result);
});

app.post("/store-file", async (req, res) => {
  const { file, data } = req.body;
  if (file === null || file === "" || data === null || data === "" || !req.body.hasOwnProperty('data')) {
    const result = {
      file: null,
      error: "Invalid JSON input.",
    };
    res.status(200).json(result);
    return;
  }
  try {
    await fs.promises.writeFile(mountingVolume + file, data);
    const result = {
      file: file,
      message: "Success.",
    };
    res.status(200).json(result);
  } catch (err) {
    console.error(err);
    const result = {
      file: file,
      error: "Error while storing the file to the storage.",
    };
    res.status(200).json(result);
  }
});

// starting the server
app.listen(port, () => {
  console.log("listening on port " + port);
});