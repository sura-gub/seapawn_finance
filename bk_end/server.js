const express = require("express");
const path = require("path");
const mysql = require("mysql");
const bodyParser = require("body-parser");
const fileUpload = require("express-fileupload");
const { v4: uuidv4 } = require("uuid");
const cors = require("cors"); // Import cors
const fs = require("fs");
const util = require("util");

const app = express();
const port = process.env.PORT || 5000;

app.use(cors()); // Enable CORS

app.use(express.static(path.join(__dirname, "build")));
app.use("/log", express.static(path.join(__dirname, "log")));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(fileUpload());

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "ffinance",
});

db.connect((err) => {
  if (err) {
    console.error("Database connection error:", err);
  } else {
    console.log("Connected to the database");
  }
});

const queryAsync = util.promisify(db.query).bind(db);
// Define a separate route for checking company details
app.get("/check-company", (req, res) => {
  const checkCompanyQuery = `SELECT COUNT(*) as count FROM cmpany_details`;

  // Check if there are any rows in cmpany_details
  db.query(checkCompanyQuery, (err, result) => {
    if (err) {
      console.error("Error checking company details:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }

    const rowCount = result[0].count;
    console.log(rowCount);

    if (rowCount === 0) {
      // If no rows are present, send a response to redirect to login.js page
      return res.status(200).json({ message: "No redirection needed" });
    } else {
      // If rows are present, send a response with no redirection
      return res.status(200).json({ message: "Redirect to login" });
    }
  });
});

app.get("/company-logo", (req, res) => {
  const getLogoQuery = "SELECT clogo FROM cmpany_details LIMIT 1"; // Assuming you only have one row in cmpany_details

  db.query(getLogoQuery, (err, result) => {
    if (err) {
      console.error("Error fetching company logo:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }

    if (result.length > 0) {
      const logoFileName = result[0].clogo || "seapawn_logo.png";
      // console.log("logo", logoFileName);
      const logoPath = path.join(__dirname, "log", logoFileName); // Construct absolute path

      // Send the image as a response
      res.sendFile(logoPath, (err) => {
        if (err) {
          console.error("Error sending company logo:", err);
          return res.status(500).json({ error: "Internal Server Error" });
        }
      });
    } else {
      return res.status(404).json({ error: "Company logo not found" });
    }
  });
});

// Handle request to fetch pawn settings
app.get("/pawn-settings", (req, res) => {
  const query = "SELECT * FROM pawn_settings LIMIT 1";

  db.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching pawn settings:", err);
      res.status(500).send("Internal Server Error");
    } else {
      const settings = results[0] || {};
      res.json(settings);
    }
  });
});

app.get("/company-details", (req, res) => {
  const getCompanyDetailsQuery =
    "SELECT nm as name FROM cmpany_details LIMIT 1"; // Assuming you only have one row in cmpany_details

  db.query(getCompanyDetailsQuery, (err, result) => {
    if (err) {
      console.error("Error fetching company details:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }

    if (result.length > 0) {
      const companyDetails = {
        name: result[0].name,
      };

      // Send the company details as a JSON response
      return res.status(200).json(companyDetails);
    } else {
      return res.status(404).json({ error: "Company details not found" });
    }
  });
});

app.post("/regis", async (req, res) => {
  const { companyName, username, password, rdate } = req.body;
  const logo = req.files && req.files.logo;
  console.log(companyName);
  console.log(username);
  console.log(password);
  console.log(rdate);

  if (!logo) {
    return res.status(400).json({ error: "Logo file is required" });
  }

  const logoFileName = `${uuidv4()}.png`;
  const logoPath = path.join(__dirname, "log", logoFileName);
  console.log(logoFileName);
  console.log(logoPath);
  logo.mv(logoPath, async (err) => {
    if (err) {
      console.error("Error saving logo file:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }

    const checkCompanyQuery = `SELECT COUNT(*) as count FROM cmpany_details`;

    // Check if there are any rows in cmpany_details
    db.query(checkCompanyQuery, async (err, result) => {
      if (err) {
        console.error("Error checking company details:", err);
        return res.status(500).json({ error: "Internal Server Error" });
      }

      const rowCount = result[0].count;

      if (rowCount === 0) {
        // If no rows are present, insert new data
        const insertCompanyQuery = `INSERT INTO cmpany_details (id, nm, clogo, doj) VALUES ('1', ?, ?, ?)`;
        db.query(
          insertCompanyQuery,
          [companyName, logoFileName, rdate],
          async (err, result) => {
            if (err) {
              console.error("Error inserting company details:", err);
              return res.status(500).json({ error: "Internal Server Error" });
            }

            const insertLoginQuery = `INSERT INTO login (id, us_nm, paswd, dept, brch_id, active_dactive, name) VALUES ('1', ?, ?, 'admin', '0', 'active', ?)`;
            db.query(
              insertLoginQuery,
              [username, password, username],
              async (err, result) => {
                if (err) {
                  console.error("Error inserting login details:", err);
                  return res
                    .status(500)
                    .json({ error: "Internal Server Error" });
                }

                return res
                  .status(200)
                  .json({ message: "Registration successful" });
              }
            );
          }
        );
      } else {
        // If rows are present, redirect to login.js page
        return res.status(200).json({ message: "Redirect to login" });
      }
    });
  });
});

app.post("/login", (req, res) => {
  const { userType, username, password, branch } = req.body;

  // Validate input parameters
  if (!userType || !username || !password) {
    return res.status(400).json({ error: "Invalid input parameters" });
  }

  let loginQuery;
  let queryParams;

  if (userType === "admin") {
    // If userType is 'admin', no need to check the branch
    loginQuery =
      "SELECT * FROM login WHERE us_nm = ? AND paswd = ? AND dept = ?";
    queryParams = [username, password, userType];
  } else if (userType === "staff") {
    // If userType is 'staff', check for missing branch
    if (!branch) {
      return res
        .status(400)
        .json({ error: "Branch is required for staff login" });
    }

    loginQuery =
      "SELECT * FROM login WHERE us_nm = ? AND paswd = ? AND dept = ? AND brch_id = ?";
    queryParams = [username, password, userType, branch];
  } else {
    // Invalid userType
    return res.status(400).json({ error: "Invalid userType" });
  }

  // Execute the query
  db.query(loginQuery, queryParams, (err, result) => {
    if (err) {
      console.error("Error during login:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }

    if (result.length > 0) {
      if (result[0].active_dactive === "deactive") {
        // User is inactive
        return res
          .status(401)
          .json({ error: "Inactive user not allowed to login" });
      } else {
        // User authenticated successfully
        const userName = result[0].name;
        return res
          .status(200)
          .json({ message: "Login successful", name: userName });
      }
    } else {
      // Invalid credentials
      return res.status(401).json({ error: "Invalid credentials" });
    }
  });
});

// Fetch articles data
app.get("/getArticles", (req, res) => {
  db.query("SELECT * FROM articles", (error, results) => {
    if (error) {
      console.error("Error fetching articles:", error);
      res.status(500).send("Internal Server Error");
    } else {
      res.json(results);
    }
  });
});

app.get("/get-last-gl-no", (req, res) => {
  const query = "SELECT gl_no FROM pawn_ticket ORDER BY id DESC LIMIT 1";

  db.query(query, (err, result) => {
    if (err) {
      console.error("Error executing query:", err);
      res.status(500).json({ error: "Internal Server Error" });
    } else {
      const lastGlNo = result.length > 0 ? result[0].gl_no : 0;
      res.json({ lastGlNo });
    }
  });
});

app.post("/submit-loan-application", async (req, res) => {
  try {
    const formData = req.body;

    // Log the incoming data to the console
    console.log("Received loan application data:", formData);

    // Split gl_no into serial number (gl_no_sl) and current year (gl_no_yr)
    const glNoParts = formData.glNo.split("/");
    const glNoSl = glNoParts[0];
    const currentYear = new Date().getFullYear();
    const glNoYr = glNoParts[1] || currentYear;

    const getTotalDaysInYear = (year) => {
      const startDate = new Date(year, 0, 1); // January 1st of the current year
      const endDate = new Date(year + 1, 0, 1); // January 1st of the next year

      const differenceInMilliseconds = endDate - startDate;
      const totalDays1 = Math.floor(
        differenceInMilliseconds / (24 * 60 * 60 * 1000)
      );

      return totalDays1;
    };

    const currentYearTotalDays = getTotalDaysInYear(currentYear);
    const principal = formData.amount;
    const interest = formData.monthlyInterest;
    const iyear = Math.round(principal * ((interest / 100) * 12));
    const imonth = Math.round(principal * (interest / 100));
    const iday = Math.round(
      principal * ((((interest / 100) * 12) / currentYearTotalDays) * 1.0139)
    );
    const hmonth = Math.round(iday * 15);

    // Fetch the last id from the pawn_ticket table
    const lastIdQuery = "SELECT * FROM pawn_ticket ORDER BY id DESC LIMIT 1";
    const lastIdResult = await queryAsync(lastIdQuery);

    let newId;

    if (lastIdResult.length === 0) {
      // If there are no rows, set id to 1
      newId = 1;
    } else {
      // Increment the last id for the new entry
      newId = lastIdResult[0].id + 1;
    }

    // Insert data into the pawn_ticket table
    const insertQuery =
      "INSERT INTO pawn_ticket (id, gl_no, gl_no_sl, gl_no_yr, dt, nm, place, addr, post_off, pincode, amt, pawn_intrest, aadhar, cust_mob, nomi_nm, nomi_rela, status, period_agree, third_mnth_interest_yes_or_no, third_mnth_interest_per_mnth, kootuvatti_yes_or_no, koottuvatti_intrest, aprox_value, tot_amt_with_kootuvatti, one_yr_amt, one_mnth_amt, one_day_amt, seven_day_amt, cmp_ln_no, cmp_off_mob, brch_id, cmp_nm, article, weight, cur_bala, cust_pic, closed_dt, tot_paid, kootuvatti_amt, third_mnth_start_dt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, '', '0000-00-00', '0', '0', current_date)";
    const values = [
      newId, // Use the calculated newId
      formData.glNo,
      glNoSl,
      glNoYr,
      formData.date,
      formData.name,
      formData.place,
      formData.address,
      formData.postOffice,
      formData.pincode,
      formData.amount,
      formData.monthlyInterest,
      formData.aadharNumber,
      formData.mobileNumber,
      formData.nominee,
      formData.nomineeRelationship,
      formData.status,
      formData.period_agree,
      formData.third_mnth_interest_yes_or_no,
      formData.third_mnth_interest_per_mnth,
      formData.kootuvatti_yes_or_no,
      formData.koottuvatti_intrest,
      iyear,
      iyear,
      iyear,
      imonth,
      iday,
      hmonth,
      formData.lnno,
      formData.omob,
      formData.brch_id,
      formData.cname,
      formData.articlesDetails,
      formData.weight,
      formData.amount,
    ];

    const result = await queryAsync(insertQuery, values);

    // Sum up the weights
    let totalWeight = 0;
    const articleDetailsArray = formData.articlesDetails.split(",");
    const weightValues = [];
    articleDetailsArray.forEach((article, index) => {
      const weightKey = `weight_${index}`;
      const weightValue = parseFloat(formData[weightKey] || 0);
      console.log(
        `Article ${index + 1}: ${article.trim()}, Weight: ${weightValue}`
      );
      totalWeight += weightValue;
      weightValues.push(weightValue);
    });

    // Subtract formData.weight from totalWeight
    const remainingWeight = parseFloat(formData.weight) - totalWeight;
    console.log("remainingWeight:", remainingWeight);

    // Fetch the last id from the pawn_ticket table
    const lastIdQuery1 =
      "SELECT id FROM memb_article_list ORDER BY id DESC LIMIT 1";
    const lastIdResult1 = await queryAsync(lastIdQuery1);

    let newId1 = 0;

    if (lastIdResult1.length === 0) {
      // If there are no rows, set id to 1
      newId1 = 1;
    } else {
      // Increment the last id for the new entry
      newId1 = lastIdResult1[0].id + 1;
    }

    // Insert data into memb_article_list table
    for (let i = 0; i < articleDetailsArray.length; i++) {
      const insertArticleQuery =
        "INSERT INTO memb_article_list (row_id, date, gl_no, arti, grm, drop_stus, drop_dt, close_dt) VALUES (?, ?, ?, ?, ?, '', '0000-00-00', '0000-00-00')";
      let grmValue;
      if (i === 0) {
        // For the first iteration, insert remaining weight
        grmValue = remainingWeight.toFixed(2);
      } else {
        // For subsequent iterations, insert weight from weightValues if available
        grmValue =
          i < weightValues.length ? weightValues[i - 1].toFixed(2) : "0.00";
      }
      const articleValues = [
        newId,
        formData.date,
        formData.glNo,
        `${articleDetailsArray[i].trim()}`, // Use articleDetailsArray directly
        grmValue,
      ];
      await queryAsync(insertArticleQuery, articleValues);
    }

    // Fetch the last id from the income_expense_bill_items table
    const lastIdQuery2 =
      "SELECT * FROM income_expence_bill_items ORDER BY id DESC LIMIT 1";
    const lastIdResult2 = await queryAsync(lastIdQuery2);

    let newId2;
    let billno;

    if (lastIdResult2.length === 0) {
      // If there are no rows, set id to 1
      newId2 = 1;
      billno = 1;
    } else {
      // Increment the last id for the new entry
      newId2 = lastIdResult2[0].id + 1;
      billno = (lastIdResult2[0].bill_no % 10000000000) + 1;
    }

    // Construct the SQL insert query for income_expense_bill_items
    const insertBillItemQuery = `
      INSERT INTO income_expence_bill_items (id, bill_no, item_nm, amt, qty, qty_amt, bill_amt, bill_kind, bill_dt, pawn_ticket_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values2 = [
      newId2, // Use the calculated newId2
      billno, // Assuming newId corresponds to bill_no
      "Gl.No : " + formData.glNo + ", Mob : " + formData.mobileNumber,
      formData.amount, // Use formData.amount for amt, qty_amt, and bill_amt
      1, // Set qty to 1
      formData.amount, // Set qty_amt and bill_amt to formData.amount
      formData.amount,
      "exp", // Set bill_kind to 'exp'
      formData.date, // Use formData.date for bill_dt
      newId,
    ];

    // Execute the insert query asynchronously
    const result2 = await queryAsync(insertBillItemQuery, values2);

    console.log(
      "Data inserted into income_expense_bill_items successfully:",
      values2,
      result2
    );

    // Fetch the last id from the income_expense_bill_items table
    const lastIdQuery3 =
      "SELECT * FROM income_expence ORDER BY id DESC LIMIT 1";
    const lastIdResult3 = await queryAsync(lastIdQuery3);

    let newId3;
    let billno1;

    if (lastIdResult3.length === 0) {
      // If there are no rows, set id to 1
      newId3 = 1;
      billno1 = 1;
    } else {
      // Increment the last id for the new entry
      newId3 = lastIdResult3[0].id + 1;
      billno1 = (lastIdResult3[0].bill_no % 10000000000) + 1;
    }

    // Construct the SQL insert query for income_expense_bill_items
    const insertBillItemQuery1 = `
      INSERT INTO income_expence (id, bill_no, bill_title, no_of_item, tot_amt, bill_typ, bill_kind, bill_dt, pawn_ticket_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values3 = [
      newId3, // Use the calculated newId2
      billno1, // Assuming newId corresponds to bill_no
      "Voucher - New Loan. " + formData.name,
      1,
      formData.amount, // Use formData.amount for amt, qty_amt, and bill_amt
      "voucher",
      "exp", // Set bill_kind to 'exp'
      formData.date, // Use formData.date for bill_dt
      newId,
    ];

    // Execute the insert query asynchronously
    const result3 = await queryAsync(insertBillItemQuery1, values3);

    console.log(
      "Data inserted into income_expense successfully:",
      values3,
      result3
    );

    console.log("Data inserted successfully:", result);

    return res
      .status(200)
      .json({ message: "Loan application submitted successfully" });
  } catch (error) {
    console.error("Exception during loan application submission:", error);
    return res
      .status(500)
      .json({ error: "Internal Server Error", details: error.message });
  }
});

// Fetch loan data
app.get("/getLoan", (req, res) => {
  db.query(
    "SELECT * FROM pawn_ticket ORDER BY id DESC LIMIT 1",
    (error, results) => {
      if (error) {
        console.error("Error fetching loan:", error);
        res.status(500).send("Internal Server Error");
      } else {
        res.json(results);
      }
    }
  );
});

// Fetch loan data
app.get("/getLoans", (req, res) => {
  db.query(
    'SELECT * FROM pawn_ticket WHERE status = "active" ORDER BY id DESC',
    (error, results) => {
      if (error) {
        console.error("Error fetching loan5:", error);
        res.status(500).send("Internal Server Error");
      } else {
        res.json(results);
      }
    }
  );
});

// Route to fetch loan by ID
app.get("/getLoanById/:id", (req, res) => {
  const loanId = req.params.id;
  const query = "SELECT * FROM pawn_ticket WHERE id = ?";

  console.log("Executing SQL query:", query, "with ID:", loanId);

  db.query(query, [loanId], (err, results) => {
    if (err) {
      console.error("Error fetching loan by ID:", err);
      res.status(500).json({ error: "Failed to fetch loan by ID" });
      return;
    }

    if (results.length === 0) {
      res.status(404).json({ error: "Loan not found" });
      return;
    }

    const loanData = results[0]; // Assuming loan ID is unique, so we take the first result
    // console.log(loanData);
    res.status(200).json(loanData);
  });
});

app.get("/getLoanBySearch", (req, res) => {
  const { mode, value } = req.query;

  let query = "";
  switch (mode) {
    case "mob":
      query = `SELECT * FROM pawn_ticket WHERE cust_mob = '${value}' ORDER BY id DESC LIMIT 1`;
      break;
    case "glno":
      query = `SELECT * FROM pawn_ticket WHERE gl_no = '${value}' ORDER BY id DESC LIMIT 1`;
      break;
    case "name":
      query = `SELECT * FROM pawn_ticket WHERE nm = '${value}' ORDER BY id DESC LIMIT 1`;
      break;
    default:
      res.status(400).json({ error: "Invalid search mode" });
      return;
  }

  db.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching loan by search:", err);
      res.status(500).json({ error: "Internal server error" });
      return;
    }

    res.json(results);
  });
});

app.get("/get-search-options", (req, res) => {
  const { mode } = req.query;

  let query = "";
  switch (mode) {
    case "mob":
      query = "SELECT DISTINCT cust_mob FROM pawn_ticket";
      break;
    case "glno":
      query = "SELECT DISTINCT gl_no FROM pawn_ticket";
      break;
    case "name":
      query = "SELECT DISTINCT nm FROM pawn_ticket";
      break;
    default:
      res.status(400).json({ error: "Invalid search mode" });
      return;
  }

  db.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching search options:", err);
      res.status(500).json({ error: "Internal server error" });
      return;
    }

    const options = results.map((result) => result[Object.keys(result)[0]]);
    res.json({ options });
  });
});

app.get("/fetch-articles", (req, res) => {
  const fetchArticlesQuery = "SELECT id, nm FROM articles"; // Adjust the query based on your actual table structure

  db.query(fetchArticlesQuery, (err, result) => {
    if (err) {
      console.error("Error fetching articles:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }

    // Process the result and send it as a JSON response
    const articles = result.map((row) => ({
      id: row.id,
      articleName: row.nm,
    }));

    return res.status(200).json(articles);
  });
});

//server.js
app.post("/insert-article", (req, res) => {
  try {
    const { articleName } = req.body;

    // Validate input parameters
    if (!articleName) {
      return res.status(400).json({ error: "Invalid input parameters" });
    }

    // Fetch the last article ID
    const fetchLastArticleIdQuery =
      "SELECT id FROM articles ORDER BY id DESC LIMIT 1";

    db.query(fetchLastArticleIdQuery, (err, result) => {
      if (err) {
        console.error("Error fetching last article ID:", err);
        return res.status(500).json({ error: "Internal Server Error" });
      }

      // Determine the new article ID
      const lastArticleId = result.length > 0 ? result[0].id : 0;
      const newArticleId = lastArticleId + 1;

      // Perform the insertion logic
      const insertArticleQuery = "INSERT INTO articles (id, nm) VALUES (?, ?)";
      const values = [newArticleId, articleName];

      db.query(insertArticleQuery, values, (err, result) => {
        if (err) {
          console.error("Error inserting article:", err);
          return res.status(500).json({ error: "Internal Server Error" });
        }

        return res
          .status(200)
          .json({ message: "Article inserted successfully" });
      });
    });
  } catch (error) {
    console.error("Exception during article insertion:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/fetch-article/:id", (req, res) => {
  const { id } = req.params;
  const fetchArticleQuery =
    "SELECT nm as articleName FROM articles WHERE id = ?";

  db.query(fetchArticleQuery, [id], (err, result) => {
    if (err) {
      console.error("Error fetching article details:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }

    if (result.length > 0) {
      return res.status(200).json(result[0]);
    } else {
      return res.status(404).json({ error: "Article not found" });
    }
  });
});

app.post("/update-article-name/:id", (req, res) => {
  const { id } = req.params;
  const { updatedName } = req.body;

  const updateArticleQuery = "UPDATE articles SET nm = ? WHERE id = ?";
  const values = [updatedName, id];

  db.query(updateArticleQuery, values, (err, result) => {
    if (err) {
      console.error("Error updating article name:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }

    return res
      .status(200)
      .json({ message: "Article name updated successfully" });
  });
});

app.delete("/delete-article/:id", (req, res) => {
  const { id } = req.params;

  const deleteArticleQuery = "DELETE FROM articles WHERE id = ?";

  db.query(deleteArticleQuery, [id], (err, result) => {
    if (err) {
      console.error("Error deleting article:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }

    return res.status(200).json({ message: "Article deleted successfully" });
  });
});

app.post("/update-pawn-settings", (req, res) => {
  try {
    const { minterest, ainterest, gr, Koottuvatti, kinterest, postc } =
      req.body;

    // Validate input parameters
    if (
      minterest === undefined ||
      ainterest === undefined ||
      gr === undefined ||
      Koottuvatti === undefined ||
      kinterest === undefined ||
      postc === undefined
    ) {
      return res.status(400).json({ error: "Invalid input parameters" });
    }

    // Check if there are any rows in pawn_settings
    const checkPawnSettingsQuery =
      "SELECT COUNT(*) as count FROM pawn_settings";

    db.query(checkPawnSettingsQuery, (err, result) => {
      if (err) {
        console.error("Error checking pawn_settings:", err);
        return res.status(500).json({ error: "Internal Server Error" });
      }

      const rowCount = result[0].count;

      if (rowCount === 0) {
        // If no rows are present, insert new data
        const insertPawnSettingsQuery =
          "INSERT INTO pawn_settings (id, pawn_intrest, afterthree_intrest, gold_rate, kootuvatti_for_all_mem_yes_no, kootuvatti_intrest_for_all_mem, postalchrge) VALUES ('1', ?, ?, ?, ?, ?, ?)";
        const values = [
          minterest,
          ainterest,
          gr,
          Koottuvatti,
          kinterest,
          postc,
        ];

        db.query(insertPawnSettingsQuery, values, (err, result) => {
          if (err) {
            console.error("Error inserting pawn_settings:", err);
            return res.status(500).json({ error: "Internal Server Error" });
          }

          return res
            .status(200)
            .json({ message: "Pawn settings inserted successfully" });
        });
      } else {
        // If rows are present, update existing data
        const updatePawnSettingsQuery =
          "UPDATE pawn_settings SET pawn_intrest = ?, afterthree_intrest = ?, gold_rate = ?, kootuvatti_for_all_mem_yes_no = ?, kootuvatti_intrest_for_all_mem = ?, postalchrge = ? WHERE id = 1";
        const values = [
          minterest,
          ainterest,
          gr,
          Koottuvatti,
          kinterest,
          postc,
        ];

        db.query(updatePawnSettingsQuery, values, (err, result) => {
          if (err) {
            console.error("Error updating pawn_settings:", err);
            return res.status(500).json({ error: "Internal Server Error" });
          }

          return res
            .status(200)
            .json({ message: "Pawn settings updated successfully" });
        });
      }
    });
  } catch (error) {
    console.error("Exception during pawn_settings operation:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/fetch-pawn-settings", (req, res) => {
  const fetchPawnSettingsQuery = "SELECT * FROM pawn_settings LIMIT 1";

  db.query(fetchPawnSettingsQuery, (err, result) => {
    if (err) {
      console.error("Error fetching pawn settings:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }

    if (result.length > 0) {
      const pawnSettingsData = {
        pawn_intrest: result[0].pawn_intrest,
        afterthree_intrest: result[0].afterthree_intrest,
        gold_rate: result[0].gold_rate,
        kootuvatti_for_all_mem_yes_no: result[0].kootuvatti_for_all_mem_yes_no,
        kootuvatti_intrest_for_all_mem:
          result[0].kootuvatti_intrest_for_all_mem,
        postalchrge: result[0].postalchrge,
      };

      // Send the pawn settings data as a JSON response
      return res.status(200).json(pawnSettingsData);
    } else {
      return res.status(404).json({ error: "Pawn settings not found" });
    }
  });
});

app.post("/update-company-details", (req, res) => {
  const { cname, rdate, cmob, omob, lnno, caddr } = req.body;

  console.log(req.body);
  // Assuming you have logic to update the company details in the database
  const updateCompanyDetailsQuery =
    "UPDATE cmpany_details SET nm = ?, mob = ?, off_mob = ?, ln_no = ?, doj = ?, addr = ? WHERE id = 1"; // Assuming you want to update the first row

  const values = [cname, cmob, omob, lnno, rdate, caddr];
  console.log(values);
  db.query(updateCompanyDetailsQuery, values, (err, result) => {
    if (err) {
      console.error("Error updating company details:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }

    return res
      .status(200)
      .json({ message: "Company details updated successfully" });
  });
});

app.post("/upload-logo", (req, res) => {
  const logoFile = req.files && req.files.file;

  if (!logoFile) {
    return res.status(400).json({ error: "Logo file is required" });
  }

  const logoFileName = `${uuidv4()}.png`;
  const logoPath = path.join(__dirname, "log", logoFileName);

  // Assuming you have logic to get the old logo filename from the database
  const getOldLogoQuery = "SELECT clogo FROM cmpany_details WHERE id = 1"; // Assuming you want to get the logo filename from the first row

  db.query(getOldLogoQuery, (err, result) => {
    if (err) {
      console.error("Error getting old logo filename:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }

    const oldLogoFileName = result[0].clogo;

    if (oldLogoFileName) {
      // Unlink the old logo file
      const oldLogoPath = path.join(__dirname, "log", oldLogoFileName);
      fs.unlink(oldLogoPath, (unlinkErr) => {
        if (unlinkErr && unlinkErr.code !== "ENOENT") {
          // Check if the file exists before unlinking
          console.error("Error unlinking old logo file:", unlinkErr);
          return res.status(500).json({ error: "Internal Server Error" });
        }
        moveNewLogo();
      });
    } else {
      moveNewLogo();
    }

    function moveNewLogo() {
      // Move the new logo file
      logoFile.mv(logoPath, async (mvErr) => {
        if (mvErr) {
          console.error("Error saving new logo file:", mvErr);
          return res.status(500).json({ error: "Internal Server Error" });
        }

        // Update the logo filename in the database
        const updateLogoQuery =
          "UPDATE cmpany_details SET clogo = ? WHERE id = 1"; // Assuming you want to update the first row

        db.query(updateLogoQuery, [logoFileName], (updateErr) => {
          if (updateErr) {
            console.error("Error updating logo filename:", updateErr);
            return res.status(500).json({ error: "Internal Server Error" });
          }

          return res
            .status(200)
            .json({ message: "Logo uploaded successfully" });
        });
      });
    }
  });
});

// API endpoint to get company details
app.get("/get-company-details", (req, res) => {
  const query = "SELECT * FROM cmpany_details LIMIT 1";

  db.query(query, (error, results) => {
    if (error) {
      console.error("Error getting company details from database:", error);
      res
        .status(500)
        .json({ message: "Internal Server Error", error: error.message });
    } else {
      const dbCompanyDetails = results[0]; // Assuming you only want one row

      // Map database fields to companyDetails fields
      let companyDetails = {
        cname: dbCompanyDetails.nm || "",
        rdate: dbCompanyDetails.doj || "",
        cmob: dbCompanyDetails.mob || "",
        omob: dbCompanyDetails.off_mob || "",
        lnno: dbCompanyDetails.ln_no || "",
        caddr: dbCompanyDetails.addr || "",
        // Add other fields as needed
      };

      res.json({
        message: "Company details retrieved successfully",
        data: companyDetails,
      });
    }
  });
});

app.post("/update-password", (req, res) => {
  const { username, oldPassword, newPassword, confirmPassword } = req.body;

  // Validate input parameters
  if (!username || !oldPassword || !newPassword || !confirmPassword) {
    return res.status(400).json({ error: "Invalid input parameters" });
  }

  // Check if old password is correct
  const checkPasswordQuery =
    "SELECT COUNT(*) as count FROM login WHERE us_nm = ? AND paswd = ?";
  db.query(checkPasswordQuery, [username, oldPassword], (err, result) => {
    if (err) {
      console.error("Error checking old password:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }

    const rowCount = result[0].count;

    if (rowCount === 0) {
      return res.status(401).json({ error: "Incorrect old password" });
    }

    // Update password in the database
    const updatePasswordQuery =
      "UPDATE login SET paswd = ?, dte = CURRENT_DATE WHERE us_nm = ?";
    db.query(
      updatePasswordQuery,
      [newPassword, username],
      (updateErr, updateResult) => {
        if (updateErr) {
          console.error("Error updating password:", updateErr);
          return res.status(500).json({ error: "Internal Server Error" });
        }

        return res
          .status(200)
          .json({ message: "Password updated successfully" });
      }
    );
  });
});

// Fetch branches data
app.get("/getBranches", (req, res) => {
  db.query("SELECT * FROM branches", (error, results) => {
    if (error) {
      console.error("Error fetching branches:", error);
      res.status(500).send("Internal Server Error");
    } else {
      res.json(results);
    }
  });
});

// Add a new endpoint to update the status of a branch
app.put("/updateBranchStatus/:id", (req, res) => {
  const branchId = req.params.id;
  const { sts } = req.body;

  db.query(
    "UPDATE branches SET sts = ? WHERE id = ?",
    [sts, branchId],
    (error, results) => {
      if (error) {
        console.error("Error updating branch status:", error);
        res.status(500).send("Internal Server Error");
      } else {
        res.status(200).send("Status updated successfully");
      }
    }
  );
});

app.post("/addBranch", (req, res) => {
  const branchData = req.body;

  // Get the current maximum id from the table
  db.query(
    "SELECT IFNULL(MAX(id), 0) + 1 AS next_id FROM branches",
    (error, results) => {
      if (error) {
        console.error("Error retrieving max id:", error);
        res.status(500).send("Internal Server Error");
      } else {
        const nextId = results[0].next_id;

        // Set the id for the new branch data
        branchData.id = nextId;
        branchData.brch_code = "BRH000" + nextId;

        // Insert the new branch data
        db.query("INSERT INTO branches SET ?", branchData, (insertError) => {
          if (insertError) {
            console.error("Error inserting branch:", insertError);
            res.status(500).send("Internal Server Error");
          } else {
            console.log("Branch added successfully");
            res.status(200).send("OK");
          }
        });
      }
    }
  );
});

// New endpoint to handle branch deletion
app.delete("/deleteBranch/:id", (req, res) => {
  const branchId = req.params.id;

  db.query(
    "DELETE FROM branches WHERE id = ?",
    [branchId],
    (error, results) => {
      if (error) {
        console.error("Error deleting branch:", error);
        res.status(500).send("Internal Server Error");
      } else {
        console.log("Branch deleted successfully");
        res.status(200).send("OK");
      }
    }
  );
});

app.get("/getBranch/:id", (req, res) => {
  const branchId = req.params.id;

  db.query(
    "SELECT * FROM branches WHERE id = ?",
    [branchId],
    (error, results) => {
      if (error) {
        console.error("Error fetching branch data:", error);
        res.status(500).send("Internal Server Error");
      } else {
        if (results.length > 0) {
          const branchData = results[0];
          res.json(branchData);
        } else {
          res.status(404).send("Branch not found");
        }
      }
    }
  );
});

// Add a new endpoint to handle branch updates
app.put("/updateBranch/:id", (req, res) => {
  const branchId = req.params.id;
  const { newBranchName, newPlace, newAddress, newContact, newManager } =
    req.body;

  db.query(
    "UPDATE branches SET brch_nm = ?, plc = ?, addr = ?, contact = ?, manager = ? WHERE id = ?",
    [newBranchName, newPlace, newAddress, newContact, newManager, branchId],
    (error, results) => {
      if (error) {
        console.error("Error updating branch details:", error);
        res.status(500).send("Internal Server Error");
      } else {
        console.log("Branch details updated successfully");
        res.status(200).send("OK");
      }
    }
  );
});

app.post("/addStaff", (req, res) => {
  const staffData = req.body;

  // Get the current maximum id from the table
  db.query(
    'SELECT IFNULL(MAX(id), 0) + 1 AS next_id FROM login WHERE dept = "staff"',
    (error, results) => {
      if (error) {
        console.error("Error retrieving max id:", error);
        res.status(500).send("Internal Server Error");
      } else {
        const nextId = results[0].next_id + 1;
        const nextId1 = results[0].next_id;
        const nextId2 = results[0].next_id - 1;
        // console.log(nextId);
        // console.log(nextId1);
        // console.log(nextId2);

        if (nextId1 === 1) {
          // Set the id for the new branch data
          staffData.id = nextId;
          staffData.us_nm = "STF000" + nextId1;
        } else {
          // Set the id for the new branch data
          staffData.id = nextId1;
          staffData.us_nm = "STF000" + nextId2;
        }
        // Insert the new branch data
        db.query("INSERT INTO login SET ?", staffData, (insertError) => {
          if (insertError) {
            console.error("Error inserting branch:", insertError);
            res.status(500).send("Internal Server Error");
          } else {
            console.log("Staff added successfully");
            res.status(200).send("OK");
          }
        });
      }
    }
  );
});

// Fetch branches data
app.get("/getStaffs", (req, res) => {
  db.query("SELECT * FROM login", (error, results) => {
    if (error) {
      console.error("Error fetching branches:", error);
      res.status(500).send("Internal Server Error");
    } else {
      res.json(results);
    }
  });
});

// Add a new endpoint to update the status of a staff
app.put("/updateStaffStatus/:id", (req, res) => {
  const staffId = req.params.id;
  const { active_dactive } = req.body;
  console.log(staffId);

  db.query(
    "UPDATE login SET active_dactive = ? WHERE id = ?",
    [active_dactive, staffId],
    (error, results) => {
      if (error) {
        console.error("Error updating branch status:", error);
        res.status(500).send("Internal Server Error");
      } else {
        res.status(200).send("Status updated successfully");
      }
    }
  );
});

// Fetch branch details by ID
app.get("/getBranchh/:id", (req, res) => {
  const branchId = req.params.id;

  db.query(
    "SELECT * FROM branches WHERE id = ?",
    [branchId],
    (error, results) => {
      if (error) {
        console.error("Error fetching branch details:", error);
        res.status(500).send("Internal Server Error");
      } else {
        const branchDetails = results[0];
        res.json(branchDetails);
      }
    }
  );
});

// Add a new endpoint to delete a staff
app.delete("/deleteStaff/:id", (req, res) => {
  const staffId = req.params.id;
  console.log(staffId);

  db.query("DELETE FROM login WHERE us_nm = ?", [staffId], (error, results) => {
    if (error) {
      console.error("Error deleting staff:", error);
      res.status(500).send("Internal Server Error");
    } else {
      res.status(200).send("Staff deleted successfully");
    }
  });
});

// Add a new endpoint to update staff details
app.put("/updateStaff/:id", (req, res) => {
  const staffId = req.params.id;
  const updatedStaffData = req.body;
  console.log(updatedStaffData);
  // console.log(staffId);

  db.query(
    "UPDATE login SET ? WHERE us_nm = ?",
    [updatedStaffData, staffId],
    (error, results) => {
      if (error) {
        console.error("Error updating staff details:", error);
        res.status(500).send("Internal Server Error");
      } else {
        res.status(200).send("Staff details updated successfully");
      }
    }
  );
});

// extra amount
// Endpoint for updating loan amount
app.post("/updateLoanAmount", async (req, res) => {
  const { newAmount, examount, pawn_intrest, gl_no, cust_mob, nm, id } =
    req.body;

  // Check if there are any rows in payment_details for the given pawn_ticket_id
  const checkPaymentDetailsSQL = `SELECT COUNT(*) as rowCount FROM payment_details WHERE pawn_ticked_id = ?`;

  db.query(checkPaymentDetailsSQL, [id], async (checkErr, checkResult) => {
    if (checkErr) {
      console.error("Error checking payment details:", checkErr);
      res.status(500).json({ message: "Failed to check payment details" });
      return;
    }

    const rowCount = checkResult[0].rowCount;

    if (rowCount > 0) {
      // There are rows in payment_details, don't proceed with the update and insertion
      res
        .status(400)
        .json({ message: "Cannot update loan amount. Payment details exist." });
      return;
    }

    const currentYear = new Date().getFullYear(); // Get the current year

    const getTotalDaysInYear = (year) => {
      const startDate = new Date(year, 0, 1); // January 1st of the current year
      const endDate = new Date(year + 1, 0, 1); // January 1st of the next year

      const differenceInMilliseconds = endDate - startDate;
      const totalDays1 = Math.floor(
        differenceInMilliseconds / (24 * 60 * 60 * 1000)
      );

      return totalDays1;
    };

    const currentYearTotalDays = getTotalDaysInYear(currentYear);
    const principal = parseFloat(newAmount); // Parse newAmount as a float
    const interest = parseFloat(pawn_intrest); // Parse pawn_intrest as a float
    const iyear = Math.round(principal * ((interest / 100) * 12)); // Calculate yearly interest
    const imonth = Math.round(principal * (interest / 100)); // Calculate monthly interest
    const iday = Math.round(
      principal * ((((interest / 100) * 12) / currentYearTotalDays) * 1.0139)
    ); // Calculate daily interest
    const hmonth = Math.round(iday * 15); // Calculate 15-day interest

    console.log(iyear);
    console.log(imonth);
    console.log(iday);
    console.log(hmonth);
    console.log(interest);
    console.log(principal);
    console.log(currentYearTotalDays);

    // Update the loan amount in the database based on the provided 'id'
    db.query(
      "UPDATE pawn_ticket SET amt = ?, one_yr_amt = ?, one_mnth_amt = ?, one_day_amt = ?, seven_day_amt = ?, aprox_value = ?, tot_amt_with_kootuvatti = ? WHERE id = ?",
      [newAmount, iyear, imonth, iday, hmonth, iyear, iyear, id],
      async (error, results) => {
        if (error) {
          console.error("Error updating loan amount:", error);
          res.status(500).json({ message: "Failed to update loan amount" });
        } else {
          console.log("Loan amount updated successfully");
          res.status(200).json({ message: "Loan amount updated successfully" });

          try {
            // Fetch the last id from the income_expense_bill_items table
            const lastIdQuery2 =
              "SELECT * FROM income_expence_bill_items ORDER BY id DESC LIMIT 1";
            const lastIdResult2 = await queryAsync(lastIdQuery2);

            let newId2;
            let billno1;

            if (lastIdResult2.length === 0) {
              // If there are no rows, set id to 1
              newId2 = 1;
              billno1 = 1;
            } else {
              // Increment the last id for the new entry
              newId2 = lastIdResult2[0].id + 1;
              billno1 = (lastIdResult2[0].bill_no % 10000000000) + 1;
            }

            // Construct the SQL insert query for income_expence_bill_items
            const insertBillItemQuery = `
              INSERT INTO income_expence_bill_items (id, bill_no, item_nm, amt, qty, qty_amt, bill_amt, bill_kind, bill_dt, pawn_ticket_id)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;

            const values2 = [
              newId2, // Use the calculated newId2
              billno1, // Assuming newId corresponds to bill_no
              "Gl.No : " + gl_no + ", Mob : " + cust_mob,
              examount, // Use examount for amt, qty_amt, and bill_amt
              1, // Set qty to 1
              examount, // Set qty_amt and bill_amt to examount
              examount,
              "exp", // Set bill_kind to 'exp'
              new Date(), // Use current date for bill_dt
              id,
            ];

            // Execute the insert query asynchronously
            const result2 = await queryAsync(insertBillItemQuery, values2);

            console.log(
              "Data inserted into income_expense_bill_items successfully:",
              values2,
              result2
            );

            // Fetch the last id from the income_expense table
            const lastIdQuery3 =
              "SELECT * FROM income_expence ORDER BY id DESC LIMIT 1";
            const lastIdResult3 = await queryAsync(lastIdQuery3);

            let newId3;
            let billno2;

            if (lastIdResult3.length === 0) {
              // If there are no rows, set id to 1
              newId3 = 1;
              billno2 = 1;
            } else {
              // Increment the last id for the new entry
              newId3 = lastIdResult3[0].id + 1;
              billno2 = (lastIdResult3[0].bill_no % 10000000000) + 1;
            }

            // Construct the SQL insert query for income_expence
            const insertBillItemQuery1 = `
              INSERT INTO income_expence (id, bill_no, bill_title, no_of_item, tot_amt, bill_typ, bill_kind, bill_dt, pawn_ticket_id)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;

            const values3 = [
              newId3, // Use the calculated newId3
              billno2, // Assuming newId corresponds to bill_no
              "Voucher Extra amount to. " + nm,
              1,
              examount, // Use formData.amount for amt, qty_amt, and bill_amt
              "voucher",
              "exp", // Set bill_kind to 'exp'
              new Date(), // Use current date for bill_dt
              id,
            ];

            // Execute the insert query asynchronously
            const result3 = await queryAsync(insertBillItemQuery1, values3);

            console.log(
              "Data inserted into income_expense successfully:",
              values3,
              result3
            );
          } catch (err) {
            console.error(
              "Error inserting data into income_expense_bill_items and income_expense:",
              err
            );
            res.status(500).json({
              message:
                "Failed to insert data into income_expense_bill_items and income_expense",
            });
          }
        }
      }
    );
  });
});

// Route to update loan details by ID
app.post("/updateLoan", (req, res) => {
  // const loanId = req.params.id;
  const { idd, kootuvatti, kootuvattiInt } = req.body;
  console.log(idd);

  // Assuming you are using a database connection pool named 'db'
  const query =
    "UPDATE pawn_ticket SET kootuvatti_yes_or_no = ?, koottuvatti_intrest = ? WHERE id = ?";

  db.query(query, [kootuvatti, kootuvattiInt, idd], (err, results) => {
    if (err) {
      console.error("Error updating loan:", err);
      res.status(500).json({ error: "Failed to update loan" });
      return;
    }

    if (results.affectedRows === 0) {
      res.status(404).json({ error: "Loan not found" });
      return;
    }

    res.status(200).json({ message: "Loan updated successfully" });
  });
});

app.get("/getLoanBySearches/:id", (req, res) => {
  const loanId = req.params.id;

  db.query(
    "SELECT * FROM pawn_ticket WHERE id = ?",
    [loanId],
    (error, results) => {
      if (error) {
        console.error("Error fetching branch data:", error);
        res.status(500).send("Internal Server Error");
      } else {
        if (results.length > 0) {
          const loanData = results[0];
          res.json(loanData);
        } else {
          res.status(404).send("Branch not found");
        }
      }
    }
  );
});

app.delete("/deleteLoan/:id", (req, res) => {
  const staffId = req.params.id;
  console.log(staffId);

  // Check if there are any rows in payment_details for the given pawn_ticket_id
  const checkPaymentDetailsSQL = `SELECT COUNT(*) as rowCount FROM payment_details WHERE pawn_ticked_id = ?`;

  db.query(checkPaymentDetailsSQL, [staffId], (checkErr, checkResult) => {
    if (checkErr) {
      console.error("Error checking payment details:", checkErr);
      res.status(500).json({ error: "Failed to check payment details" });
      return;
    }

    const rowCount = checkResult[0].rowCount;

    if (rowCount > 0) {
      // There are rows in payment_details, don't proceed with the update
      res
        .status(400)
        .json({ error: "Cannot delete loan data. Payment details exist." });
      return;
    }

    // Continue with the deletion process

    db.query(
      "DELETE FROM pawn_ticket WHERE id = ?",
      [staffId],
      (error, results) => {
        if (error) {
          console.error("Error deleting loan Entry:", error);
          res.status(500).send("Internal Server Error");
        } else {
          // After deleting from pawn_ticket, delete corresponding row from memb_article_list
          db.query(
            "DELETE FROM memb_article_list WHERE row_id = ?",
            [staffId],
            (error2, results2) => {
              if (error2) {
                console.error(
                  "Error deleting corresponding memb_article_list entry:",
                  error2
                );
                res.status(500).send("Internal Server Error");
              } else {
                // After deleting from memb_article_list, delete corresponding rows from income_expence
                db.query(
                  "DELETE FROM income_expence WHERE pawn_ticket_id = ?",
                  [staffId],
                  (error3, results3) => {
                    if (error3) {
                      console.error(
                        "Error deleting corresponding income_expense entry:",
                        error3
                      );
                      res.status(500).send("Internal Server Error");
                    } else {
                      // After deleting from memb_article_list, delete corresponding rows from income_expence_bill_items
                      db.query(
                        "DELETE FROM income_expence_bill_items WHERE pawn_ticket_id = ?",
                        [staffId],
                        (error4, results4) => {
                          if (error4) {
                            console.error(
                              "Error deleting corresponding income_expense_bill_items entry:",
                              error4
                            );
                            res.status(500).send("Internal Server Error");
                          } else {
                            res
                              .status(200)
                              .send(
                                "Loan entry and corresponding memb_article_list, income_expense, and income_expense_bill_items entries deleted successfully"
                              );
                          }
                        }
                      );
                    }
                  }
                );
              }
            }
          );
        }
      }
    );
  });
});

// Update loan data endpoint
app.post("/updateLoanData", (req, res) => {
  const { id, name, place, amount, interest, glno, mobile, periodAgree } =
    req.body;

  // Check if there are any rows in payment_details for the given pawn_ticket_id
  const checkPaymentDetailsSQL = `SELECT COUNT(*) as rowCount FROM payment_details WHERE pawn_ticked_id = ?`;

  db.query(checkPaymentDetailsSQL, [id], (checkErr, checkResult) => {
    if (checkErr) {
      console.error("Error checking payment details:", checkErr);
      res.status(500).json({ error: "Failed to check payment details" });
      return;
    }

    const rowCount = checkResult[0].rowCount;

    if (rowCount > 0) {
      // There are rows in payment_details, don't proceed with the update
      res
        .status(400)
        .json({ error: "Cannot update loan data. Payment details exist." });
      return;
    }

    const currentYears = new Date().getFullYear();
    const getTotalDaysInYears = (year) => {
      const startDate = new Date(year, 0, 1); // January 1st of the current year
      const endDate = new Date(year + 1, 0, 1); // January 1st of the next year

      const differenceInMilliseconds = endDate - startDate;
      const totalDays1 = Math.floor(
        differenceInMilliseconds / (24 * 60 * 60 * 1000)
      );

      return totalDays1;
    };

    const currentYearTotalDay = getTotalDaysInYears(currentYears);
    const principal = amount;
    const iyear = Math.round(principal * ((interest / 100) * 12));
    const imonth = Math.round(principal * (interest / 100));
    const iday = Math.round(
      principal * ((((interest / 100) * 12) / currentYearTotalDay) * 1.0139)
    );
    const hmonth = Math.round(iday * 15);

    // Update query for pawn_ticket table
    const loanUpdateSQL = `
    UPDATE pawn_ticket
    SET nm = ?, place = ?, amt = ?, pawn_intrest = ?, period_agree = ?, one_mnth_amt = ?, one_day_amt = ?, seven_day_amt = ?, one_yr_amt = ?, aprox_value = ?, tot_amt_with_kootuvatti = ? WHERE id = ?`;

    // Update query for income_expence_bill_items table
    const billUpdateSQL = `
    UPDATE income_expence_bill_items SET item_nm = ?, amt = ?, qty_amt = ?, bill_amt = ? WHERE pawn_ticket_id = ?`;

    // Update query for income_expence table
    const incomeUpdateSQL = `
    UPDATE income_expence SET bill_title = ?, tot_amt = ? WHERE pawn_ticket_id = ?`;

    console.log(req.body);

    // Run the update query for pawn_ticket table
    db.query(
      loanUpdateSQL,
      [
        name,
        place,
        amount,
        interest,
        periodAgree,
        imonth,
        iday,
        hmonth,
        iyear,
        iyear,
        iyear,
        id,
      ],
      (err, result) => {
        if (err) {
          console.error("Error updating loan data:", err);
          res.status(500).json({ error: "Failed to update loan data" });
          return;
        }
        console.log("Loan data updated successfully");

        // Run the update query for income_expence_bill_items table
        db.query(
          billUpdateSQL,
          [`Gl No : ${glno}, Mob : ${mobile}`, amount, amount, amount, id],
          (billErr, billResult) => {
            if (billErr) {
              console.error("Error updating bill item:", billErr);
              res.status(500).json({ error: "Failed to update bill item" });
              return;
            }
            console.log("Bill item updated successfully");

            // Run the update query for income_expence table
            db.query(
              incomeUpdateSQL,
              [`Voucher - New Loan. ${name}`, amount, id],
              (incomeErr, incomeResult) => {
                if (incomeErr) {
                  console.error("Error updating income expense:", incomeErr);
                  res
                    .status(500)
                    .json({ error: "Failed to update income expense" });
                  return;
                }
                console.log("Income expense updated successfully");
                res.status(200).json({
                  message:
                    "Loan data, bill item, and income expense updated successfully",
                });
              }
            );
          }
        );
      }
    );
  });
});

// Fetch loan data
app.get("/getLoanss", (req, res) => {
  db.query(
    'SELECT * FROM pawn_ticket WHERE status != "active" ORDER BY id DESC',
    (error, results) => {
      if (error) {
        console.error("Error fetching loan1:", error);
        res.status(500).send("Internal Server Error");
      } else {
        res.json(results);
      }
    }
  );
});

// Fetch loan data
app.get("/getLoansss", (req, res) => {
  db.query("SELECT * FROM pawn_ticket ORDER BY id DESC", (error, results) => {
    if (error) {
      console.error("Error fetching loan2:", error);
      res.status(500).send("Internal Server Error");
    } else {
      res.json(results);
    }
  });
});

app.get("/getLoanBySearchess/:id", (req, res) => {
  const loanId = req.params.id;

  db.query(
    "SELECT * FROM memb_article_list WHERE row_id = ?",
    [loanId],
    (error, results) => {
      if (error) {
        console.error("Error fetching branch data:", error);
        res.status(500).send("Internal Server Error");
      } else {
        if (results.length > 0) {
          const loanData = results;
          res.json(loanData);
        } else {
          res.status(404).send("Branch not found");
        }
      }
    }
  );
});

app.post("/updateArtData", async (req, res) => {
  const updatedData = req.body; // Assuming req.body contains the updated loan data array

  // Check if there are any rows in payment_details for the given pawn_ticket_id
  const checkPaymentDetailsSQL = `SELECT COUNT(*) as rowCount FROM payment_details WHERE pawn_ticked_id = ?`;

  db.query(
    checkPaymentDetailsSQL,
    [updatedData[0].row_id],
    (checkErr, checkResult) => {
      if (checkErr) {
        console.error("Error checking payment details:", checkErr);
        res.status(500).json({ error: "Failed to check payment details" });
        return;
      }
      // console.log(checkResult);
      const rowCount = checkResult[0].rowCount;
      // console.log(rowCount);
      if (rowCount > 0) {
        // There are rows in payment_details, don't proceed with the update
        res
          .status(400)
          .json({ error: "Cannot update loan data. Payment details exist." });
        return;
      }
      // Iterate through the updated data array and update the database for each item
      updatedData.forEach(async (loan) => {
        const { id, arti, grm, row_id } = loan;
        try {
          // Update memb_article_list table
          await db.query(
            "UPDATE memb_article_list SET arti = ?, grm = ? WHERE id = ?",
            [arti, grm, id]
          );

          // Calculate the sum of grm values
          const totalWeight = updatedData
            .reduce((acc, cur) => acc + parseFloat(cur.grm), 0)
            .toFixed(2);

          // Concatenate all article names
          const articleNames = updatedData.map((item) => item.arti).join(", ");

          // Update pawn_ticket table
          await db.query(
            "UPDATE pawn_ticket SET article = ?, weight = ? WHERE id = ?",
            [articleNames, totalWeight, row_id]
          );
        } catch (error) {
          console.error(`Error updating data for ID ${id}:`, error);
        }
      });

      res.sendStatus(200); // Send success response
    }
  );
});

//Opening Balance
// Route to handle the POST request from the React component
app.post("/insertOpeningBalance", (req, res) => {
  const { amount, date, name } = req.body;

  // Validate input parameters
  if (!amount || !date || !name) {
    return res.status(400).json({ error: "Invalid input parameters" });
  }

  // Fetch the last ID from the opening_bala table
  const lastIdQuery = "SELECT id FROM opening_bala ORDER BY id DESC LIMIT 1";
  db.query(lastIdQuery, (err, result) => {
    if (err) {
      console.error("Error fetching last ID:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }

    let newId;

    if (result.length === 0) {
      // If there are no rows, set ID to 1
      newId = 1;
    } else {
      // Increment the last ID for the new entry
      newId = result[0].id + 1;
    }

    // Extract day, month, and year from the provided date
    const [year, month, day] = date.split("-");

    // Check if the day is 1
    if (day === "01") {
      return res.status(409).json({
        message:
          "You should only store the closing balance on this day; the opening balance cannot be stored.",
      });
    }

    // Check if a record already exists for the provided month and year
    const checkRecordQuery = "SELECT * FROM opening_bala WHERE dt = ?";
    db.query(checkRecordQuery, [date], (err, result) => {
      if (err) {
        console.error("Error checking existing record:", err);
        return res.status(500).json({ error: "Internal Server Error" });
      }

      if (result.length > 0) {
        // Record already exists for the provided month and year
        return res.status(409).json({
          message: "Deposit detail is already inserted for this Date",
        });
      } else {
        // Insert data into the opening_bala table
        const insertQuery =
          "INSERT INTO opening_bala (id, amt, mnth, yr, dt, nm) VALUES (?, ?, ?, ?, ?, ?)";
        const values = [newId, amount, month, year, date, name];
        db.query(insertQuery, values, (err, result) => {
          if (err) {
            console.error("Error inserting data:", err);
            return res.status(500).json({ error: "Internal Server Error" });
          }
          console.log("Data inserted successfully:", result);
          return res
            .status(200)
            .json({ message: "Opening balance inserted successfully" });
        });
      }
    });
  });
});

// Fetch loan data
app.get("/getOpeningBalance", (req, res) => {
  db.query("SELECT * FROM opening_bala ORDER BY id DESC", (error, results) => {
    if (error) {
      console.error("Error fetching loan3:", error);
      res.status(500).send("Internal Server Error");
    } else {
      res.json(results);
    }
  });
});

app.delete("/deleteLoan1/:id", (req, res) => {
  const loanId = req.params.id; // Corrected parameter name from staffId to loanId
  console.log(loanId);

  db.query(
    "DELETE FROM opening_bala WHERE id = ?",
    [loanId],
    (error, results) => {
      if (error) {
        console.error("Error deleting loan Entry:", error);
        res.status(500).send("Internal Server Error");
      } else {
        res.status(200).send("Opening balance entry deleted successfully");
      }
    }
  );
});

app.get("/getOpeningDetails/:id", (req, res) => {
  const loanId = req.params.id;

  db.query(
    "SELECT * FROM opening_bala WHERE id = ?",
    [loanId],
    (error, results) => {
      if (error) {
        console.error("Error fetching branch data:", error);
        res.status(500).send("Internal Server Error");
      } else {
        if (results.length > 0) {
          const loanData = results[0];
          res.json(loanData);
        } else {
          res.status(404).send("Branch not found");
        }
      }
    }
  );
});

app.post("/updateOpeningDetail", (req, res) => {
  const { id, name, date, amount } = req.body;

  // Validate input parameters
  if (!amount || !date || !name) {
    return res.status(500).json({ error: "Invalid input parameters" });
  }

  // Parse the date string into a JavaScript Date object
  const parsedDate = new Date(date);

  // Extract the month, year, and day from the Date object
  const month = ("0" + (parsedDate.getMonth() + 1)).slice(-2); // Format with two digits
  const year = parsedDate.getFullYear();
  const day = ("0" + parsedDate.getDate()).slice(-2); // Format with two digits
  console.log(day);

  // Check if the day is 1
  if (day === "01") {
    return res.status(409).json({
      message: "You can't modify the closing balance value.",
    });
  }

  // Update query
  const sql = `
    UPDATE opening_bala
    SET nm = ?, dt = ?, amt = ?, mnth = ?, yr = ?
    WHERE id = ?`;

  // Run the update query
  db.query(sql, [name, date, amount, month, year, id], (err, result) => {
    if (err) {
      console.error("Error updating Opening Detail:", err);
      res.status(500).json({ error: "Failed to update Opening Detail" });
      return;
    }
    console.log("Opening Detail updated successfully");
    res.status(200).json({ message: "Opening Detail updated successfully" });
  });
});

app.post("/saveData", async (req, res) => {
  let newId = 0;
  let bill_no = 0;

  try {
    const { values1, values } = req.body;

    // Fetch the last row to get the last id value
    const lastRecord = await queryAsync(
      "SELECT * FROM income_expence_bill_items ORDER BY id DESC LIMIT 1"
    );
    let lastId = 0;
    let lastBillNo = 0;
    if (lastRecord.length > 0) {
      lastId = lastRecord[0].id;
      lastBillNo = lastRecord[0].bill_no;
      newId = lastId + 1;
      bill_no = (lastBillNo % 10000000000) + 1;
    } else {
      newId = 1;
      bill_no = 1;
    }

    // Calculate the next id values based on the last id value and the length of the values array
    const idValues = Array.from(
      { length: values.length },
      (_, i) => lastId + i + 1
    );
    const length = values.length;
    console.log("Length of values array:", length);
    console.log("Received data:", {
      idValues,
      bill_no,
      values1,
      values,
      newId,
    });

    // Now you can insert the data into your database
    // For each item in values array, insert a row into the database with the corresponding id value
    for (let i = 0; i < values.length; i++) {
      const item = values[i];
      const id = idValues[i];
      await queryAsync(
        "INSERT INTO income_expence_bill_items (id, bill_no, item_nm, amt, qty, qty_amt, bill_amt, bill_kind, bill_dt, pawn_ticket_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, '')",
        [
          id,
          bill_no,
          item.description,
          item.amount,
          item.quantity,
          item.total1,
          values1.total,
          values1.billType,
          values1.billDate,
        ]
      );
    }

    // After successful insertion, insert data into income_expence table
    await queryAsync(
      "INSERT INTO income_expence (id, bill_no, bill_title, no_of_item, tot_amt, bill_dt, bill_typ, bill_kind, pawn_ticket_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, '')",
      [
        bill_no,
        bill_no,
        values1.billTitle,
        length,
        values1.total,
        values1.billDate,
        "bill",
        values1.billType,
      ]
    );

    res.status(200).json({ message: "Data saved successfully" });
  } catch (error) {
    console.error("Error saving data:", error);
    res.status(500).json({ error: "An error occurred while saving data" });
  }
});

//pay
app.get("/getLoanBySearchh", (req, res) => {
  const { mode, value } = req.query;

  let query = "";
  switch (mode) {
    case "mob":
      query = `SELECT * FROM pawn_ticket WHERE cust_mob = '${value}' and status = 'active' ORDER BY id DESC LIMIT 1`;
      break;
    case "glno":
      query = `SELECT * FROM pawn_ticket WHERE gl_no = '${value}' and status = 'active' ORDER BY id DESC LIMIT 1`;
      break;
    case "name":
      query = `SELECT * FROM pawn_ticket WHERE nm = '${value}' and status = 'active' ORDER BY id DESC LIMIT 1`;
      break;
    default:
      res.status(400).json({ error: "Invalid search mode" });
      return;
  }

  db.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching loan by search:", err);
      res.status(500).json({ error: "Internal server error" });
      return;
    }

    res.json(results);
  });
});

app.post("/pay", async (req, res) => {
  try {
    const {
      pawn_ticket_id,
      glno,
      nm,
      num,
      pint,
      amt,
      date,
      artDetail,
      intamount,
      paidamount,
      total_paid,
      kvatti,
      kvattiamt,
      kvattiint,
    } = req.body;

    console.log(req.body);
    console.log(artDetail);

    const parsedDate = new Date(date);
    const month = parsedDate.getMonth() + 1;
    const year = parsedDate.getFullYear();

    const lastRecord = await queryAsync(
      "SELECT * FROM payment_details ORDER BY id DESC LIMIT 1"
    );
    let newId;
    if (lastRecord.length > 0) {
      newId = lastRecord[0].id + 1;
    } else {
      newId = 1;
    }

    const lastRecord1 = await queryAsync(
      "SELECT * FROM income_expence ORDER BY id DESC LIMIT 1"
    );
    let newId1, bill_no;
    if (lastRecord1.length > 0) {
      newId1 = lastRecord1[0].id + 1;
      bill_no = (lastRecord1[0].bill_no % 10000000000) + 1;
    } else {
      newId1 = 1;
      bill_no = 1;
    }

    const lastRecord2 = await queryAsync(
      "SELECT * FROM income_expence_bill_items ORDER BY id DESC LIMIT 1"
    );
    let newId2, bill_no1;
    if (lastRecord2.length > 0) {
      newId2 = lastRecord2[0].id + 1;
      bill_no1 = (lastRecord2[0].bill_no % 10000000000) + 1;
    } else {
      newId2 = 1;
      bill_no1 = 1;
    }

    const fetchTotPaidQuery = `SELECT tot_paid FROM pawn_ticket WHERE id = ?`;
    const [fetchTotPaidResult] = await queryAsync(fetchTotPaidQuery, [
      pawn_ticket_id,
    ]);
    const currentTotPaid = fetchTotPaidResult.tot_paid;

    const newTotPaid = parseInt(currentTotPaid) + parseInt(paidamount);
    const total_paid1 = parseInt(total_paid) + parseInt(paidamount);
    const bal_amt = amt - paidamount;
    let paymentQuery, updateQuery, updateValues;

    if (artDetail === "adv") {
      paymentQuery = `
        INSERT INTO payment_details (id, pawn_ticked_id, gl_no, name, mob, interest_perc, payable_amt, paid_date, mn, yr, interest, paid_amt, tot_paid, bal_amt, koottu_vatti, koottu_vatti_intrst, koottu_vatti_amt, koottu_vatti_intrst_amt, article, weight, drop_article, drop_date, closed_stus, closed_dt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, '', '0', '', '0000-00-00', '', '0000-00-00')
      `;
      const paymentValues = [
        newId,
        pawn_ticket_id,
        glno,
        nm,
        num,
        pint,
        amt,
        date,
        month,
        year,
        intamount,
        paidamount,
        total_paid1,
        bal_amt,
        kvatti,
        kvattiint,
        kvattiamt,
        amt,
      ];
      await queryAsync(paymentQuery, paymentValues);

      updateQuery = `
        UPDATE pawn_ticket
        SET cur_bala = ?,
            tot_paid = ?
        WHERE id = ?
      `;
      updateValues = [bal_amt, newTotPaid, pawn_ticket_id];
      await queryAsync(updateQuery, updateValues);

      const updateQuery1 = `
        INSERT INTO income_expence (id, bill_no, bill_title, no_of_item, tot_amt, bill_dt, bill_typ, bill_kind, pawn_ticket_id) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      const updateValues1 = [
        newId1,
        bill_no,
        "Jewel Advance Received. " + nm,
        "1",
        paidamount,
        date,
        "jewel",
        "inc",
        pawn_ticket_id,
      ];
      await queryAsync(updateQuery1, updateValues1);

      const updateQuery2 = `
        INSERT INTO income_expence_bill_items (id, bill_no, item_nm, amt, qty, qty_amt, bill_amt, bill_kind, bill_dt, pawn_ticket_id) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      const updateValues2 = [
        newId2,
        bill_no1,
        "Gl_no : " + glno + ",Mob : " + num,
        paidamount,
        "1",
        paidamount,
        paidamount,
        "inc",
        date,
        pawn_ticket_id,
      ];
      await queryAsync(updateQuery2, updateValues2);
    } else if (artDetail === "rall") {
      const fetchArticlesQuery = `SELECT arti, grm FROM memb_article_list WHERE row_id = ? AND drop_stus != 'yes'`;
      const fetchArticlesResults = await queryAsync(fetchArticlesQuery, [
        pawn_ticket_id,
      ]);

      let articles = [];
      let totalWeight = 0;
      fetchArticlesResults.forEach((result) => {
        articles.push(result.arti);
        totalWeight += parseFloat(result.grm);
      });
      const formattedWeight = totalWeight.toFixed(2);
      const article = articles.join(", ");

      if (bal_amt !== 0) {
        return res.status(400).json({
          error: "You can't take all articles before paying the debts",
        });
      } else {
        const paymentQuery = `
          INSERT INTO payment_details (id, pawn_ticked_id, gl_no, name, mob, interest_perc, payable_amt, paid_date, mn, yr, interest, paid_amt, tot_paid, bal_amt, koottu_vatti, koottu_vatti_intrst, koottu_vatti_amt, koottu_vatti_intrst_amt, article, weight, drop_article, drop_date, closed_dt, closed_stus)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const paymentValues = [
          newId,
          pawn_ticket_id,
          glno,
          nm,
          num,
          pint,
          amt,
          date,
          month,
          year,
          intamount,
          paidamount,
          total_paid1,
          bal_amt,
          kvatti,
          kvattiint,
          kvattiamt,
          amt,
          article,
          formattedWeight,
          article,
          date,
          date,
          "closed",
        ];
        await queryAsync(paymentQuery, paymentValues);

        // Update drop_stus and drop_dt for all articles
        const updateQueries = fetchArticlesResults.map((result) => {
          const updateQuery = `
            UPDATE memb_article_list
            SET drop_stus = 'yes',
                drop_dt = ?
            WHERE arti = ?
          `;
          const updateValues = [date, result.arti];
          return queryAsync(updateQuery, updateValues);
        });

        // Execute all the update queries in parallel using Promise.all
        await Promise.all(updateQueries);

        // Update close_dt for all articles in the row
        const updateCloseDtQuery = `
          UPDATE memb_article_list
          SET close_dt = ?
          WHERE row_id = ?
        `;
        await queryAsync(updateCloseDtQuery, [date, pawn_ticket_id]);

        // Insert into income_expense table
        const insertIncomeExpenseQuery = `
          INSERT INTO income_expence (id, bill_no, bill_title, no_of_item, tot_amt, bill_dt, bill_typ, bill_kind, pawn_ticket_id) 
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const insertIncomeExpenseValues = [
          newId1,
          bill_no,
          `Jewel Advance Received. ${nm}`,
          "1",
          paidamount,
          date,
          "jewel",
          "inc",
          pawn_ticket_id,
        ];
        await queryAsync(insertIncomeExpenseQuery, insertIncomeExpenseValues);

        // Insert into income_expense_bill_items table
        const insertIncomeExpenseBillItemsQuery = `
          INSERT INTO income_expence_bill_items (id, bill_no, item_nm, amt, qty, qty_amt, bill_amt, bill_kind, bill_dt, pawn_ticket_id) 
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const insertIncomeExpenseBillItemsValues = [
          newId2,
          bill_no1,
          `Gl_no : ${glno}, Mob : ${num}`,
          paidamount,
          "1",
          paidamount,
          paidamount,
          "inc",
          date,
          pawn_ticket_id,
        ];
        await queryAsync(
          insertIncomeExpenseBillItemsQuery,
          insertIncomeExpenseBillItemsValues
        );

        // Update pawn_ticket
        const updatePawnTicketQuery = `
          UPDATE pawn_ticket
          SET cur_bala = ?,
              tot_paid = ?,
              closed_dt = ?,
              status = 'inactive'
          WHERE id = ?
        `;
        const updatePawnTicketValues = [
          bal_amt,
          newTotPaid,
          date,
          pawn_ticket_id,
        ];
        await queryAsync(updatePawnTicketQuery, updatePawnTicketValues);
      }
    } else {
      const fetchArticleQuery = `SELECT * FROM memb_article_list WHERE id = ?`;
      const [fetchArticleResult] = await queryAsync(fetchArticleQuery, [
        artDetail,
      ]);
      const article = fetchArticleResult.arti;
      const weight = fetchArticleResult.grm;

      const countQuery = `SELECT COUNT(*) AS rowCount FROM memb_article_list WHERE row_id = ? AND drop_stus != 'yes'`;
      const [countResult] = await queryAsync(countQuery, [pawn_ticket_id]);
      const rowCount = countResult.rowCount;

      if (rowCount === 1) {
        if (bal_amt !== 0) {
          return res.status(400).json({
            error: "You can't take all article before paying the debts",
          });
        } else {
          paymentQuery = `
            INSERT INTO payment_details (id, pawn_ticked_id, gl_no, name, mob, interest_perc, payable_amt, paid_date, mn, yr, interest, paid_amt, tot_paid, bal_amt, koottu_vatti, koottu_vatti_intrst, koottu_vatti_amt, koottu_vatti_intrst_amt, article, weight, drop_article, drop_date, closed_dt, closed_stus)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `;
          const paymentValues = [
            newId,
            pawn_ticket_id,
            glno,
            nm,
            num,
            pint,
            amt,
            date,
            month,
            year,
            intamount,
            paidamount,
            total_paid1,
            bal_amt,
            kvatti,
            kvattiint,
            kvattiamt,
            amt,
            article,
            weight,
            article,
            date,
            date,
            "closed",
          ];
          await queryAsync(paymentQuery, paymentValues);

          updateQuery = `
            UPDATE pawn_ticket
            SET cur_bala = ?,
                tot_paid = ?,
                closed_dt = ?,
                status = 'inactive'
            WHERE id = ?
          `;
          const updateQuery2 = `
            UPDATE memb_article_list
            SET drop_stus = 'yes',
                drop_dt = ?
            WHERE id = ?
          `;
          const updateValues2 = [date, artDetail];
          await queryAsync(updateQuery2, updateValues2);
          const updateQuery1 = `
            INSERT INTO income_expence (id, bill_no, bill_title, no_of_item, tot_amt, bill_dt, bill_typ, bill_kind, pawn_ticket_id) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
          `;
          const updateValues1 = [
            newId1,
            bill_no,
            "Jewel Advance Received. " + nm,
            "1",
            paidamount,
            date,
            "jewel",
            "inc",
            pawn_ticket_id,
          ];
          await queryAsync(updateQuery1, updateValues1);
          const updateQuery4 = `
            INSERT INTO income_expence_bill_items (id, bill_no, item_nm, amt, qty, qty_amt, bill_amt, bill_kind, bill_dt, pawn_ticket_id) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `;
          const updateValues4 = [
            newId2,
            bill_no1,
            "Gl_no : " + glno + ",Mob : " + num,
            paidamount,
            "1",
            paidamount,
            paidamount,
            "inc",
            date,
            pawn_ticket_id,
          ];
          await queryAsync(updateQuery4, updateValues4);
          updateValues = [bal_amt, newTotPaid, date, pawn_ticket_id];
          await queryAsync(updateQuery, updateValues);
        }
      } else {
        paymentQuery = `
          INSERT INTO payment_details (id, pawn_ticked_id, gl_no, name, mob, interest_perc, payable_amt, paid_date, mn, yr, interest, paid_amt, tot_paid, bal_amt, koottu_vatti, koottu_vatti_intrst, koottu_vatti_amt, koottu_vatti_intrst_amt, article, weight, drop_article, drop_date, closed_stus, closed_dt)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, '0000-00-00', '0000-00-00')
        `;
        const paymentValues = [
          newId,
          pawn_ticket_id,
          glno,
          nm,
          num,
          pint,
          amt,
          date,
          month,
          year,
          intamount,
          paidamount,
          total_paid1,
          bal_amt,
          kvatti,
          kvattiint,
          kvattiamt,
          amt,
          article,
          weight,
          article,
          date,
        ];
        await queryAsync(paymentQuery, paymentValues);

        updateQuery = `
          UPDATE pawn_ticket
          SET cur_bala = ?,
              tot_paid = ?
          WHERE id = ?
        `;
        const updateQuery2 = `
          UPDATE memb_article_list
          SET drop_stus = 'yes',
              drop_dt = ?
          WHERE id = ?
        `;
        const updateValues2 = [date, artDetail];
        await queryAsync(updateQuery2, updateValues2);
        const updateQuery1 = `
          INSERT INTO income_expence (id, bill_no, bill_title, no_of_item, tot_amt, bill_dt, bill_typ, bill_kind, pawn_ticket_id) 
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const updateValues1 = [
          newId1,
          bill_no,
          "Jewel Advance Received. " + nm,
          "1",
          paidamount,
          date,
          "jewel",
          "inc",
          pawn_ticket_id,
        ];
        await queryAsync(updateQuery1, updateValues1);
        const updateQuery4 = `
          INSERT INTO income_expence_bill_items (id, bill_no, item_nm, amt, qty, qty_amt, bill_amt, bill_kind, bill_dt, pawn_ticket_id) 
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const updateValues4 = [
          newId2,
          bill_no1,
          "Gl_no : " + glno + ",Mob : " + num,
          paidamount,
          "1",
          paidamount,
          paidamount,
          "inc",
          date,
          pawn_ticket_id,
        ];
        await queryAsync(updateQuery4, updateValues4);
        updateValues = [bal_amt, newTotPaid, pawn_ticket_id];
        await queryAsync(updateQuery, updateValues);
      }
    }

    res.json({ message: "Payment details saved successfully" });
  } catch (error) {
    console.error("Error inserting payment details:", error);
    if (
      error.message === "You can't take all article before paying the debts"
    ) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: "Failed to insert payment details" });
    }
  }
});

app.get("/getPayBySearch/:id", (req, res) => {
  const loanId = req.params.id;

  db.query(
    "SELECT * FROM payment_details WHERE pawn_ticked_id = ? ORDER BY id DESC",
    [loanId],
    (error, results) => {
      if (error) {
        console.error("Error fetching branch data:", error);
        res.status(500).send("Internal Server Error");
      } else {
        if (results.length > 0) {
          const loanData = results;
          res.json(loanData);
        } else {
          res.status(404).send("Branch not found");
        }
      }
    }
  );
});

app.post("/deletePayment", async (req, res) => {
  try {
    await queryAsync("START TRANSACTION");

    const deletedPayment = req.body;
    console.log(deletedPayment);

    // Get the paid date from the request body
    const formattedPaidDate = new Date(deletedPayment.paid_date);

    // Adjust the date by adding one day
    formattedPaidDate.setDate(formattedPaidDate.getDate() + 1);

    // Convert the adjusted date to ISO string and extract the date part
    const paidDate = formattedPaidDate.toISOString().split("T")[0];

    console.log(paidDate);
    // 1st query: Delete payment_details
    const sql1 =
      "DELETE FROM payment_details WHERE pawn_ticked_id = ? AND id = ? AND DATE(paid_date) = ? AND paid_amt = ?";
    const result1 = await queryAsync(sql1, [
      deletedPayment.pawn_ticked_id,
      deletedPayment.id,
      paidDate,
      deletedPayment.paid_amt,
    ]);
    console.log("Deleted from payment_details:", result1.affectedRows);

    // Fetch and log the rows data values from the last pawn_ticket_id in payment_details
    const sqlFetchLastPawnTicketRows =
      "SELECT * FROM payment_details WHERE pawn_ticked_id = ? ORDER BY id DESC LIMIT 5"; // Adjust the LIMIT as needed
    const lastPawnTicketRowsResult = await queryAsync(
      sqlFetchLastPawnTicketRows,
      [deletedPayment.pawn_ticked_id]
    );
    const lastPawnTicketRows = lastPawnTicketRowsResult.map((row) => ({
      id: row.id,
      paid_date: row.paid_date,
      paid_amt: row.paid_amt,
      int: row.interest /* Add other relevant columns */,
    }));

    console.log(
      "Last rows data from payment_details for pawn_ticket_id:",
      deletedPayment.pawn_ticked_id
    );
    // console.log(lastPawnTicketRows.length);
    // console.log(lastPawnTicketRows.length > 0 ? parseInt(lastPawnTicketRows[0].int, 10) : 0,);
    // console.log(deletedPayment.paid_amt);
    // console.log(deletedPayment.interest);
    // const hiii = 131860 + (deletedPayment.paid_amt - deletedPayment.interest + (lastPawnTicketRows.length > 0 ? parseInt(lastPawnTicketRows[0].int, 10) : 0));

    // console.log("tot",hiii);

    // 2nd query: Update pawn_ticket
    const sql2 =
      "UPDATE pawn_ticket SET cur_bala = cur_bala + (? - ? + ?), tot_paid = tot_paid - ? WHERE id = ?";
    const result2 = await queryAsync(sql2, [
      deletedPayment.paid_amt,
      deletedPayment.interest,
      lastPawnTicketRows.length > 0
        ? parseInt(lastPawnTicketRows[0].int, 10)
        : 0,
      deletedPayment.paid_amt,
      deletedPayment.pawn_ticked_id,
    ]);
    console.log("Updated pawn_ticket:", result2.affectedRows);

    // 3rd query: Update memb_article_list
    const sql3 =
      'UPDATE memb_article_list SET drop_dt = "0000-00-00", drop_stus = "" WHERE row_id = ? AND arti = ? AND grm = ?';
    const result3 = await queryAsync(sql3, [
      deletedPayment.pawn_ticked_id,
      deletedPayment.article,
      deletedPayment.weight,
    ]);
    console.log("Updated memb_article_list:", result3.affectedRows);

    // 4th query: Delete the last income_expense record
    const sql4 =
      "DELETE FROM income_expence WHERE pawn_ticket_id = ? AND tot_amt = ? AND DATE(bill_dt) = ? ORDER BY id DESC LIMIT 1";
    const result4 = await queryAsync(sql4, [
      deletedPayment.pawn_ticked_id,
      deletedPayment.paid_amt,
      paidDate,
    ]);
    console.log("Deleted from income_expence:", result4.affectedRows);

    // 5th query: Delete the last income_expense_bill_items record
    const sql5 =
      "DELETE FROM income_expence_bill_items WHERE pawn_ticket_id = ? AND amt = ? AND qty_amt = ? AND bill_amt = ? AND DATE(bill_dt) = ? ORDER BY id DESC LIMIT 1";
    const result5 = await queryAsync(sql5, [
      deletedPayment.pawn_ticked_id,
      deletedPayment.paid_amt,
      deletedPayment.paid_amt,
      deletedPayment.paid_amt,
      paidDate,
    ]);
    console.log(
      "Deleted from income_expence_bill_items:",
      result5.affectedRows
    );

    await queryAsync("COMMIT");
    res.status(200).json({
      message: "Payment details and related last records deleted successfully",
    });
  } catch (err) {
    await queryAsync("ROLLBACK");
    console.error("Error:", err);
    res.status(500).json({ error: "An error occurred" });
  }
});

app.post("/deletePayment1", async (req, res) => {
  try {
    await queryAsync("START TRANSACTION");

    const deletedPayment = req.body;
    console.log(deletedPayment);

    // Get the paid date from the request body
    const formattedPaidDate = new Date(deletedPayment.paid_date);

    // Adjust the date by adding one day
    formattedPaidDate.setDate(formattedPaidDate.getDate() + 1);

    // Convert the adjusted date to ISO string and extract the date part
    const paidDate = formattedPaidDate.toISOString().split("T")[0];

    console.log(paidDate);
    // 1st query: Delete payment_details
    const sql1 =
      "DELETE FROM payment_details WHERE pawn_ticked_id = ? AND id = ? AND DATE(paid_date) = ? AND paid_amt = ?";
    const result1 = await queryAsync(sql1, [
      deletedPayment.pawn_ticked_id,
      deletedPayment.id,
      paidDate,
      deletedPayment.paid_amt,
    ]);
    console.log("Deleted from payment_details:", result1.affectedRows);

    // Fetch and log the rows data values from the last pawn_ticket_id in payment_details
    const sqlFetchLastPawnTicketRows =
      "SELECT * FROM payment_details WHERE pawn_ticked_id = ? ORDER BY id DESC LIMIT 5"; // Adjust the LIMIT as needed
    const lastPawnTicketRowsResult = await queryAsync(
      sqlFetchLastPawnTicketRows,
      [deletedPayment.pawn_ticked_id]
    );
    const lastPawnTicketRows = lastPawnTicketRowsResult.map((row) => ({
      id: row.id,
      paid_date: row.paid_date,
      paid_amt: row.paid_amt,
      int: row.interest /* Add other relevant columns */,
    }));

    console.log(
      "Last rows data from payment_details for pawn_ticket_id:",
      deletedPayment.pawn_ticked_id
    );
    console.log(lastPawnTicketRows);

    // 2nd query: Update pawn_ticket
    const sql2 =
      'UPDATE pawn_ticket SET cur_bala = cur_bala + (? - ? + ?), tot_paid = tot_paid - ?, closed_dt = "0000-00-00", status = "active" WHERE id = ?';
    const result2 = await queryAsync(sql2, [
      deletedPayment.paid_amt,
      deletedPayment.interest,
      lastPawnTicketRows.length > 0
        ? parseInt(lastPawnTicketRows[0].int, 10)
        : 0,
      deletedPayment.paid_amt,
      deletedPayment.pawn_ticked_id,
    ]);
    console.log("Updated pawn_ticket:", result2.affectedRows);

    // 3rd query: Update memb_article_list
    const articles = deletedPayment.article
      .split(",")
      .map((article) => article.trim()); // Split the string into an array
    const placeholders = articles.map(() => "?").join(","); // Create placeholders for SQL query

    const sql3 = `UPDATE memb_article_list SET drop_dt = "0000-00-00", drop_stus = "", close_dt = "0000-00-00" WHERE row_id = ? AND arti IN (${placeholders})`;
    const values3 = [deletedPayment.pawn_ticked_id, ...articles];

    const result3 = await queryAsync(sql3, values3);
    console.log("Updated memb_article_list:", result3.affectedRows);

    // 4th query: Delete the last income_expense record
    const sql4 =
      "DELETE FROM income_expence WHERE pawn_ticket_id = ? AND tot_amt = ? AND DATE(bill_dt) = ? ORDER BY id DESC LIMIT 1";
    const result4 = await queryAsync(sql4, [
      deletedPayment.pawn_ticked_id,
      deletedPayment.paid_amt,
      paidDate,
    ]);
    console.log("Deleted from income_expence:", result4.affectedRows);

    // 5th query: Delete the last income_expense_bill_items record
    const sql5 =
      "DELETE FROM income_expence_bill_items WHERE pawn_ticket_id = ? AND amt = ? AND qty_amt = ? AND bill_amt = ? AND DATE(bill_dt) = ? ORDER BY id DESC LIMIT 1";
    const result5 = await queryAsync(sql5, [
      deletedPayment.pawn_ticked_id,
      deletedPayment.paid_amt,
      deletedPayment.paid_amt,
      deletedPayment.paid_amt,
      paidDate,
    ]);
    console.log(
      "Deleted from income_expence_bill_items:",
      result5.affectedRows
    );

    await queryAsync("COMMIT");
    res.status(200).json({
      message: "Payment details and related last records deleted successfully",
    });
  } catch (err) {
    await queryAsync("ROLLBACK");
    console.error("Error:", err);
    res.status(500).json({ error: "An error occurred" });
  }
});

// Fetch payment data
app.get("/getRecord", (req, res) => {
  const { year, month } = req.query;
  let query;

  if (year && month && month !== "all") {
    // Filter by both year and month
    query = `SELECT * FROM payment_details WHERE yr = ${year} AND mn = ${month}`;
  } else if (year && month === "all") {
    // Only filter by year
    query = `SELECT * FROM payment_details WHERE yr = ${year}`;
  }
  // console.log(query);
  db.query(query, (error, results) => {
    if (error) {
      // console.error("Error fetching loan4:", error);
      res.status(500).send("Internal Server Error");
    } else {
      res.json(results);
    }
  });
});

app.get("/getIE", (req, res) => {
  const { year, month, date } = req.query;
  let query = ""; // Initialize query with a default value

  if (year && month && date) {
    // Filter by year, month, and date
    query = `SELECT * FROM income_expence WHERE YEAR(bill_dt) = ${year} AND MONTH(bill_dt) = ${month} AND DATE(bill_dt) = '${date}'`;
  } else if (year && month) {
    // Filter by year and month
    query = `SELECT * FROM income_expence WHERE YEAR(bill_dt) = ${year} AND MONTH(bill_dt) = ${month}`;
  } else if (date) {
    // Filter by date
    query = `SELECT * FROM income_expence WHERE DATE(bill_dt) = '${date}'`;
  }

  if (query !== "") {
    // Only execute the query if it's not empty
    db.query(query, (error, results) => {
      if (error) {
        console.error("Error fetching income expense:", error);
        res.status(500).send("Internal Server Error");
      } else {
        res.json(results);
      }
    });
  } else {
    // Handle the case when query is empty
    res.status(400).send("Please provide valid parameters");
  }
});

app.get("/getOB", (req, res) => {
  const { date } = req.query;
  let query = ""; // Initialize query with a default value

  if (date) {
    // Filter by date
    query = `SELECT * FROM opening_bala WHERE mnth = ${date}`;
  }
  // console.log(query);
  if (query !== "") {
    // Only execute the query if it's not empty
    db.query(query, (error, results) => {
      if (error) {
        console.error("Error fetching Opening balance:", error);
        res.status(500).send("Internal Server Error");
      } else {
        res.json(results);
        // console.log(results);
      }
    });
  } else {
    // Handle the case when query is empty
    res.status(400).send("Please provide valid parameters");
  }
});

// Route to save closing balance
app.post("/saveClosingBalance", async (req, res) => {
  try {
    const { date, closingBalance } = req.body;

    // Calculate the next month's date based on the provided month value
    const nextMonthDate = new Date(new Date().getFullYear(), parseInt(date), 1);

    // Extract year, month, and day components
    const yr = nextMonthDate.getFullYear();
    const mnth = (nextMonthDate.getMonth() + 1).toString().padStart(2, "0"); // Months are zero-based in JavaScript
    const dt = `${yr}-${mnth}-01`; // Use the 1st day of the next month

    // Check if the dt value already exists in the opening_bala table
    const checkIfExistsQuery = "SELECT id FROM opening_bala WHERE dt = ?";
    const existingIdResult = await queryAsync(checkIfExistsQuery, [dt]);

    if (existingIdResult.length > 0) {
      // If the dt value exists, update the corresponding row
      const existingId = existingIdResult[0].id;
      const updateQuery = "UPDATE opening_bala SET amt = ? WHERE id = ?";

      // Execute the update query
      await queryAsync(updateQuery, [closingBalance, existingId]);
    } else {
      // If the dt value doesn't exist, insert a new row

      // Find the last ID in the opening balance
      const getLastIdQuery = "SELECT MAX(id) AS lastId FROM opening_bala";
      const lastIdResult = await queryAsync(getLastIdQuery);
      const lastId = lastIdResult[0].lastId || 0; // If lastId is null, set it to 0

      // Increment the last ID
      const newId = lastId + 1;

      // Adjust the query based on your database schema
      const insertQuery =
        'INSERT INTO opening_bala (id, dt, mnth, yr, amt, nm) VALUES (?, ?, ?, ?, ?, "opening_balance")';

      // Execute the insert query
      await queryAsync(insertQuery, [newId, dt, mnth, yr, closingBalance]);
    }

    console.log(dt);
    console.log(mnth);
    console.log(yr);
    console.log(closingBalance);

    res.status(200).json({ message: "Closing balance saved successfully" });
  } catch (error) {
    console.error("Error saving closing balance:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Route to handle file upload
app.post("/uploadImage", async (req, res) => {
  try {
    // Check if files were uploaded
    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).json({ error: "No files were uploaded." });
    }

    const uploadedFile = req.files.file;
    const id = req.query.id;

    const fileName = `${uuidv4()}_${uploadedFile.name}`;

    // Fetch the current cust_pic value for the specified pawn_ticket ID
    const selectQuery = "SELECT cust_pic FROM pawn_ticket WHERE id = ?";
    const result = await queryAsync(selectQuery, [id]);

    // Check if there is an existing image
    if (result.length > 0 && result[0].cust_pic) {
      // If an existing image is found, delete it from the log folder
      const existingFileName = result[0].cust_pic;
      const existingFilePath = path.join(__dirname, "log", existingFileName);

      fs.unlink(existingFilePath, (err) => {
        if (err) {
          console.error("Error deleting existing file:", err);
        } else {
          console.log("Existing file deleted successfully.");
        }
      });
    }

    // Store the uploaded file locally
    const filePath = path.join(__dirname, "log", fileName);
    uploadedFile.mv(filePath, async (err) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      // Update the pawn_ticket table with the new file name and specific pawn_ticket ID
      const updateQuery = "UPDATE pawn_ticket SET cust_pic = ? WHERE id = ?";
      await queryAsync(updateQuery, [fileName, id]);

      res.json({ fileName: fileName });
      console.log(fileName);
    });
  } catch (error) {
    console.error("Error uploading file:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Route to update pawn_ticket table with the file name and pawn ticket ID
app.put("/updatePawnTicket", async (req, res) => {
  try {
    const { id, fileName } = req.query;
    console.log(id);
    console.log(fileName);

    // Update the pawn_ticket table with the file name and specific pawn_ticket ID
    const updateQuery = "UPDATE pawn_ticket SET cust_pic = ? WHERE id = ?";
    await queryAsync(updateQuery, [fileName, id]);

    res.status(200).json({ message: "Pawn ticket updated successfully" });
  } catch (error) {
    console.error("Error updating pawn ticket:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Add a new endpoint to fetch bill details
app.get("/getBillDetails", async (req, res) => {
  try {
    const billNo = req.query.billNo;
    console.log(billNo);

    // Assuming you have a table named 'bills' with columns 'bill_no', 'bill_title', 'tot_amt', etc.
    const query = `SELECT * FROM income_expence_bill_items WHERE bill_no = ?`;
    const billDetails = await queryAsync(query, [billNo]);
    console.log(billDetails);

    if (billDetails.length > 0) {
      res.json(billDetails); // Send the first (and only) result as JSON
    } else {
      res.status(404).json({ error: "Bill not found" });
    }
  } catch (error) {
    console.error("Error fetching bill details:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Add a new endpoint to fetch bill details
app.get("/getIncDetails", async (req, res) => {
  try {
    const billNo = req.query.billNo;

    // Assuming you have a table named 'bills' with columns 'bill_no', 'bill_title', 'tot_amt', etc.
    const query = `SELECT * FROM income_expence WHERE bill_no = ?`;
    const billDetails = await queryAsync(query, [billNo]);

    if (billDetails.length > 0) {
      res.json(billDetails); // Send the first (and only) result as JSON
    } else {
      res.status(404).json({ error: "Bill not found" });
    }
  } catch (error) {
    console.error("Error fetching bill details:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/custPic/:id", (req, res) => {
  const picId = req.params.id;
  const getLogoQuery = "SELECT cust_pic FROM pawn_ticket WHERE id = ?";

  db.query(getLogoQuery, [picId], (err, result) => {
    if (err) {
      console.error("Error fetching customer picture:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }

    if (result.length > 0) {
      let logoFileName = result[0].cust_pic;

      // Check if logoFileName is empty
      if (logoFileName === "") {
        // Set default avatar file name
        logoFileName = "default-avatar.png";
      }

      const logoPath = path.join(__dirname, "log", logoFileName);
      // console.log(logoPath);

      // Send the image as a response
      res.sendFile(logoPath, (err) => {
        if (err) {
          console.error("Error sending customer picture:", err);
          return res.status(500).json({ error: "Internal Server Error" });
        }
      });
    } else {
      return res.status(404).json({ error: "Customer picture not found" });
    }
  });
});

// Handle any other requests by serving the React app
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});