const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const fs = require("fs");
const port = 6001;
const mountingVolume = "../Pratik_PV_dir/";
var result;
var sum = 0;
var productIndex;
var amountIndex;

function isCSVDataValid(data) {
  const lines = data.split("\n");
  if (lines.length > 0) {
    // Check if the header line is present
    const headerLine = lines[0].toLowerCase().trim();
    if (!headerLine.includes("product") || !headerLine.includes("amount")) {
      return false;
    }
    const header = headerLine.split(",").map((item) => item.trim());
    const amountIndex = header.indexOf("amount");
    for (let i = 1; i < lines.length; i++) {
      const row = lines[i].split(",");
      const amount = row[amountIndex];
      if (isNaN(amount)) {
        return false; // Return false to indicate invalid data
      }
    }
    // Validate the data lines
    for (let i = 0; i < lines.length; i++) {
      const columns = lines[i].split(",");
      if (
        columns.length !== 2 ||
        columns.some((column) => column.trim().length === 0)
      ) {
        return false;
      }
    }
    return true;
  } else {
    return false;
  }
}

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

// defining an endpoint to return all ads

app.get("/", (req, res) => {
  res.send(
    "<h1>Happy Night!</h1>"
  );
});

app.post("/fetch", async (req, res) => {
  result = null;
  const fileName = req.body.file.trim();
  const filePath = mountingVolume + fileName;
  try {
    const data = (await fs.promises.readFile(filePath, "utf8")).trim();
    if (isCSVDataValid(data)) {
      const lines = data.split("\n").filter(Boolean);
      if (req.body.product !== null) {
        if (lines.length > 1) {
          const headerLine = lines[0].toLowerCase().trim();
          const headings = headerLine.split(",").map((item) => item.trim());
          amountIndex = headings.indexOf("amount");
          productIndex = headings.indexOf("product");
          for (let i = 1; i < lines.length; i++) {
            const columns = lines[i].split(",");
            if (
              columns[productIndex].trim().toLowerCase() ===
              req.body.product.trim().toLowerCase()
            ) {
              if (!isNaN(columns[amountIndex].trim())) {
                sum += parseInt(columns[amountIndex].trim());
              }
            }
          }
        }
      } else {
        sum = 0;
      }
      var sumString = sum.toString();
      result = { file: fileName, sum: sumString };
      sum = 0;
    } else {
      result = {
        file: fileName,
        error: "Input file not in CSV format.",
      };
    }
  } catch (err) {
    console.log(err);
  }
  res.status(200).json(result);
});

// starting the server
app.listen(port, () => {
  console.log("listening on port " + port);
});