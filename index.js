const express = require("express");
const app = express();
const dblib = require("./dblib.js");

const multer = require("multer");
const upload = multer();

app.use(express.urlencoded({ extended: false }));

// Setup EJS
app.set("view engine", "ejs");

// Enable CORS (see https://enable-cors.org/server_expressjs.html)
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

// Application folders
app.use(express.static("public"));

// Serve content of the "public and css" subfolder directly
app.use(express.static("css"));

// Add database package and connection string (can remove ssl)
const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Start listener
app.listen(process.env.PORT || 3000, () => {
  console.log("Server started (http://localhost:3000/) !");
});

// Setup routes
app.get("/", (req, res) => {
  //res.send("Root resource - Up and running!")
  res.render("index");
});

app.get("/managecustomer", async (req, res) => {
  // Omitted validation check
  const totRecs = await dblib.getTotalRecords();
  res.render("managecustomer", {
    totRecs: totRecs.totRecords,
  });
});

app.post("/managecustomer", upload.array(), async (req, res) => {
  dblib.findCustomers(req.body)
    .then(result => res.send(result))
    .catch(err => res.send({ trans: "Error", result: err.message }));

});

app.get("/createcustomer", async (req, res) => {
  res.render("createcustomer");
});

app.post("/createcustomer", upload.array(), async (req, res) => {
  console.log(req.body)
  dblib.insertCustomer(req.body)
    .then(result => res.send(result))
    .catch(err => res.send({ trans: "Error", result: err.message }));

});


app.get("/delete/:id", async (req, res) => {
  const id = req.params.id;
  const sql = "SELECT * FROM customer WHERE cusid = $1";

  const result = await pool.query(sql, [id]);
  res.render("deletecustomer", {
    model: result.rows[0],
    type: "get",
  });

  app.post("/delete/:id", async (req, res) => {

    const id = req.params.id;
    const sql = `DELETE FROM customer where cusid = $1`;


    const sql1 = "SELECT * FROM customer WHERE cusid = $1";

    const result = await pool.query(sql1, [id])
      .then(result => {
        return {
          msg1: "success",
          totRecords: result.rows[0]
        }
      })
      .catch(err => {
        return {
          msg1: `Error: ${err.message}`
        }
      })

 
    const result2 = await pool.query(sql, [id])
      .then(result => {
        return {
          msg: "success",
        }
      })
      .catch(err => {
        return {
          msg: `Error: ${err.message}`
        }
      })




    res.render("deletecustomer", {
      model: result.totRecords,
      type: "post",
      msg: result2.msg,
    });

  });

});


app.get("/edit/:id", async (req, res) => {
  const id = req.params.id;
  const sql = "SELECT * FROM customer WHERE cusid = $1";

  const result = await pool.query(sql, [id]);
  res.render("editcustomer", {
    model: result.rows[0],
    type: "get",
  });


});



app.post("/edit/:id", async (req, res) => {

  const id = req.params.id;
  const customer = [req.body.cusfname, req.body.cuslname, req.body.cusstate, req.body.cussalesytd, req.body.cussalesprev, req.body.cusid];
  const sql = `UPDATE CUSTOMER SET cusfname = $1, cuslname = $2, cusstate = $3, cussalesytd = $4, cussalesprev = $5  WHERE cusid = $6`;



  const result1 = await pool.query(sql, customer)
    .then(result => {
      return {
        msg: "success",

      }
    })
    .catch(err => {
      return {
        msg: `Error: ${err.message}`
      }
    })

  if (result1.msg === "success") {
    const sql2 = "SELECT * FROM customer WHERE cusid = $1";

    const result = await pool.query(sql2, [id])
      .then(result => {
        return {
          msg: "success",
          totRecords: result.rows[0]
        }
      })
      .catch(err => {
        return {
          msg: `Error: ${err.message}`
        }
      })



    res.render("editcustomer", {
      model: result.totRecords,
      type: "post",
      msg: result.msg,
      errorMsg: result1.msg,
    });
  } else {
    res.render("editcustomer", {
      model: "",
      msg: "error",
      type: "post",
      errorMsg: result1.msg,
    })
  };

});

app.get("/import", async (req, res) => {
  const totRecs = await dblib.getTotalRecords();
  res.render("import", {
    totRecs: totRecs.totRecords,
  });
});

app.post("/import", upload.single('filename'), (req, res) => {
  if (!req.file || Object.keys(req.file).length === 0) {
    message = "Error: Import file not uploaded";
    return res.send(message);
  };

  const buffer = req.file.buffer;
  const lines = buffer.toString().split(/\r?\n/);

  lines.forEach(line => {

    product = line.split(",");
  
    const sql = `INSERT INTO CUSTOMER (cusid, cusfname, cuslname, cusstate, cussalesytd, cussalesprev) VALUES ($1, $2, $3, $4, $5, $6)`;
    pool.query(sql, product, (err, result) => {
      if (err) {
        console.log(`Insert Error.  Error message: ${err.message}`);
      } else {
        console.log(`Inserted successfully`);
      }
    });
  });
  message = `Processing Complete - Processed ${lines.length} records`;
  res.send(message);
});

app.get("/export", async (req, res) => {
  var message = "";
  const totRecs = await dblib.getTotalRecords();
  res.render("export", {
    totRecs: totRecs.totRecords,
    message: message,
  });
});

app.post("/export", async (req, res) => {
  const sql = "SELECT * FROM CUSTOMER ORDER BY cusid";
  const totRecs = await dblib.getTotalRecords();
  pool.query(sql, [], (err, result) => {
    var message = "";
    if (err) {
      message = `Error - ${err.message}`;
      res.render("export", {
        totRecs: totRecs.totRecords,
        message: message
      })
    } else {
      var output = "";
      result.rows.forEach(customer => {
        output += `${customer.cusid},${customer.cusfname},${customer.cuslname},${customer.cusstate},${customer.cussalesytd},${customer.cussalesprev}\r\n`;
      });
      res.header("Content-Type", "text/csv");
      res.attachment("export.csv");
      return res.send(output);
    };
  });
});