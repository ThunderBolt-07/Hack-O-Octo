import axios from "axios";
import puppeteer from "puppeteer";
import express from "express";
import bodyParser from "body-parser";
const app = express();
const port = 3000;
app.use(bodyParser.json());
app.use(express.static("public"));

const apiKey = "AIzaSyC6yAVqf4Eyt5nzJ-fVuq89LWmh2YVzLfk"; // Replace with your Google API key
const searchEngineId = "4196c58fc17fb443b";

var searchQuery = " company news"; // Replace with your search query
var resultLinks = [];
var snd = [];

console.log("hi");

app.use(bodyParser.urlencoded({ extended: true }));

app.listen(port, () => {
  console.log("set up at port " + port);
});
app.get("/", (req, res) => {
  res.render("StockSnap.ejs");
});

app.post("/search", async (req, res) => {
  let cname = req.body.cname;
  searchQuery = cname + searchQuery;

  const url = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${searchEngineId}&q=${searchQuery}`;

  try {
    const ar = await f(url, cname);
    console.log(`Type: ${typeof ar}`);
    //console.log(ar[1][0])

    res.render("news.ejs",{ message: ar });
  } catch (error) {
    console.error("Error in app.post:", error);
    res.status(500).json({ message: "An error occurred" });
  }
});

async function f(url, cname) {
  const arr = [];
  try {
    const response = await axios.get(url);
    console.log("making calls to google");

    const searchResults = response.data.items;
    if (searchResults) {
      for (const result of searchResults) {
        resultLinks.push(result.link);
      }
    }

    resultLinks.splice(Math.floor(resultLinks.length/3))
    

    for (const site of resultLinks) {
      const browser = await puppeteer.launch({
        headless: false,
        args: ["--headless"],
      });
      console.log(site + " is visited " + cname);

      const page = await browser.newPage();

      await page.goto(site, { timeout: 120000 });

      const validHeadlines = await page.evaluate((site, cname) => {
        function Anchor(a, h, m) {
          this.a = a;
          this.href = h;
          this.s = m;
        }

        const anchorElements = document.querySelectorAll("body a");
        const validAnchors = [];

        anchorElements.forEach((a) => {
          if (
            a.textContent.trim().length > 60 &&
            a.textContent.trim().length < 120 &&
            a.textContent.trim().toLowerCase().includes(cname)
          ) {
            const aobj = new Anchor(a.textContent, a.getAttribute("href"), site);
            validAnchors.push(aobj);
          }
        });

        return validAnchors;
      }, site, cname);

      arr.push(validHeadlines);
      await browser.close();
    }

    return arr;
  } catch (error) {
    console.error("Error fetching search results:", error.message);
    throw error; // Rethrow the error for proper error handling
  }
}


function cleanString(inputString) {
  // Define a regular expression to match newline, tab, and double quotation mark
  const regex = /[\n\t"]/g;

  // Use the replace method to remove matching characters
  const cleanedString = inputString.replace(regex, "");

  return cleanedString;
}

app.get("/profile", (req, res) => {
  res.render("profile.ejs");
});
app.get("/news", (req, res) => {
  res.render("news.ejs");
});
app.get("/signin", (req, res) => {
  res.render("signin.ejs");
});
app.get("/wallet", (req, res) => {
  res.render("wallet.ejs");
});




// // Example usage
