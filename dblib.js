// Add packages
require("dotenv").config();
// Add database package and connection string
const { Pool } = require('pg');
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});


// Function to find total number of records
const getTotalRecords = () => {
    sql = "SELECT COUNT(*) FROM CUSTOMER";
    return pool.query(sql)
        .then(result => {
            return {
                msg: "success",
                totRecords: result.rows[0].count
            }
        })
        .catch(err => {
            return {
                msg: `Error: ${err.message}`
            }
        });
};

const getAll = async () => {
    console.log("--- STEP 2: Inside getAll() ---");
    sql = "SELECT * FROM customer";
    try {
        const result =  await pool.query(sql, []);
        console.log("--- STEP 3: No Error ---");
        return (result).rows;
    } catch (err) {
        console.log("--- STEP 3: Error ---");
        return err.message;
    };
};

// Insert function
const insertCustomer = (customer) => {
    console.log("Running insert customer")

    if (customer.cussalesytd == "") {
        customer.cussalesytd = 0;
    };
    console.log(`prev yr sale is ${customer.cusSalesPrev}`)
    if (customer.cussalesprev == "") {
        customer.cussalesprev = 0;
    };

    
    // Will accept either a customer array or customer object
    if (customer instanceof Array) {
        params = customer;
    } else {
        params = Object.values(customer);
    };

    console.log(`params is ${params}`)
    const sql = `INSERT INTO CUSTOMER (cusid, cusfname, cuslname, cusstate, cussalesytd, cussalesprev)
                 VALUES ($1, $2, $3, $4, $5, $6)`;

    console.log(`sql is ${sql}`)
    return pool.query(sql, params)
        .then(res => {
            console.log("pool query ran")
            return {
                trans: "success", 
                msg: `customer id ${params[0]} successfully inserted`
            };
        })
        .catch(err => {
            return {
                trans: "fail", 
                msg: `Error on insert of customer id ${params[0]}.  ${err.message}`
            };
        });
};

const findCustomers = (customer) => {

    // Declare variables
    var i = 1;
    params = [];
    sql = "SELECT * FROM CUSTOMER WHERE true";

    // print variables to test
    console.log("running find customers");

    // Check data provided and build query as necessary
    if (customer.cusid !== "") {
        params.push(parseInt(customer.cusid));
        sql += ` AND cusid = $${i}`;
        i++;
    };
    if (customer.cusfname !== "") {
        params.push(`${customer.cusfname}%`);
        sql += ` AND UPPER(cusfname) LIKE UPPER($${i})`;
        i++;
    };
    if (customer.cuslname !== "") {
        params.push(`${customer.cuslname}%`);
        sql += ` AND UPPER(cuslname) LIKE UPPER($${i})`;
        i++;
    };
    if (customer.cusstate !== "") {
        params.push(`${customer.cusstate}%`);
        sql += ` AND UPPER(cusstate) LIKE UPPER($${i})`;
        i++;
    };
    if (customer.cussalesytd !== "") {
        params.push(parseFloat(customer.cussalesytd));
        sql += ` AND cussalesytd >= $${i}`;
        i++;
    };
    if (customer.cussalesprev !== "") {
        params.push(parseFloat(customer.cussalesprev));
        sql += ` AND cussalesprev >= $${i}`;
        i++;
    };

    sql += ` ORDER BY cusid`;
    // for debugging
     console.log("sql: " + sql);
     console.log("params: " + params);

     // testing

    return pool.query(sql, params)
        .then(result => {
            return { 
                trans: "success",
                result: result.rows
            }
        })
        .catch(err => {
            return {
                trans: "Error",
                result: `Error: ${err.message}`
            }
        });
};



// Export functions
module.exports.insertCustomer = insertCustomer;
module.exports.getAll = getAll;
module.exports.getTotalRecords = getTotalRecords;
module.exports.findCustomers = findCustomers;