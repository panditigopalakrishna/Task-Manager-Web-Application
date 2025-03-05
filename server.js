const sql = require('mssql');
const express = require('express')
const { v4: uuidv4 } = require('uuid');
const cors = require('cors');
const { NVarChar } = require('msnodesqlv8');

// Apply CORS middleware

// Your existing code

app = express()
app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

function generateShortId() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 10; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

// Configuration for your SQL Server
const config = {
    server: 'LAPTOP-VJ6G4S3S\\GOPALSERVER',  // Use double backslashes
    database: 'toList',
    user: 'gopal123',     // If using SQL authentication
    password: '09102000', // If using SQL authentication
    options: {
        encrypt: true,  // For Azure
        trustServerCertificate: true,  // For local dev / self-signed certs
        connectionTimeout: 30000,  // Increase timeout to 30 seconds
        instanceName: 'GOPALSERVER'
    }
}

// Connect to the database
async function connectToDatabase() {
    try {
        const pool = await sql.connect(config);
        return pool
        console.log('Connected to SQL Server!');
    } catch (err) {
        console.error('Error connecting to SQL Server:', err);
    } 
}
connectToDatabase()

// Add this after your existing POST endpoint
app.get('/api/register', async (req, res) => {
    res.json({ message: 'API is working' });
});
app.post('/api/registered', async (req, res) => {
    try {
        const pool = await connectToDatabase();
        const { name, phoneNumber, password } = req.body;

        // Generate a random user ID
        const userId = generateShortId();

        // Get a database connection

        // Insert the new record into the database
        const result = await pool.request()
            .input('userId', sql.VarChar(36), userId) // Add userId (varchar(10))
            .input('name', sql.VarChar(20), name) // Add name (varchar(20))
            .input('phoneNumber', sql.VarChar(15), phoneNumber) // Add phoneNumber (varchar(15))
            .input('password', sql.VarChar(10), password) // Add password (varchar(10))
            .query(`
                INSERT INTO UserDetails (userId, name, phoneNumber, password)
                VALUES (@userId, @name, @phoneNumber, @password);
            `);

        // Send the response with the new record details
        res.status(201).json({
            Id:true,
            userId,
            name,
            phoneNumber,
            password,
        });
    } catch (error) {
        // Handle errors
        res.status(500).json({ error: error.message });
    }

})

app.post('/api/checklogin', async (req, res) => {
    try { 
    const pool = await connectToDatabase()
    const { name, password } = req.body
    const result = await pool.request()
            .input('name', sql.VarChar(20), name)
            .input('password', sql.VarChar(10), password)
            .query(`
                SELECT userid, name, phoneNumber 
                FROM UserDetails 
                WHERE name = @name AND password = @password
            `);

        if (result.recordset.length > 0) {
            // User found, login successful
            res.json({
                success: true,
                message: 'Login successful',
                user: {
                    userid: result.recordset[0].userid,
                    name: result.recordset[0].name,
                    phoneNumber: result.recordset[0].phoneNumber
                }
            });
        } else {
            // No user found with those credentials
            res.status(401).json({
                success: false,
                message: 'Invalid name or password'
            });
        }

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during login',
            error: error.message
        });
    }
})

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
app.post('/api/updatelist', async (req, res) => {
    try {
        const pool = await connectToDatabase();
        const { userid, items, imp, date, status } = req.body;
        const result = await pool.request()
            .input('userid', sql.VarChar(10), userid) // Corrected data type and parameter name
            .input('items', sql.VarChar(150), items) // Corrected parameter name and data type
            .input('imp', sql.Int, imp) // Correct data type
            .input('date', sql.Date, date) // Corrected data type
            .input('status', sql.VarChar(10), status) // Correct data type
            .query(`
            INSERT INTO List (userid, items, imp, date, status)
            VALUES (@userid, @items, @imp, @date, @status);
        `);
        console.log(result)
        res.status(201).json({
            sucesss: true,
            message: 'data added'
        })
    }
    catch (error) {
        // Handle errors
        res.status(500).json({ error: error.message });
    }
})
app.get('/api/getuserlist', async (req, res) => {
    try {
        const pool = await connectToDatabase();
        const userid = req.headers['custom-header'];
        console.log(userid)
        const result = await pool.request()
            .input('userid', sql.VarChar(10), userid)
            .query(`select * from List where userid=@userid and status!='Deleted'`)
        if (result.recordset.length > 0) {
            list = []

            for (let record of result.recordset) {
                const item = {
                    itemName: record.Items,
                    itemImportance: record.imp == 3 ? 'high' : record.imp == 2 ? 'medium' : 'low',
                    itemdate: record.date,
                }
                list.push(item)

            }
            res.json({
                success: true,
                message: 'extracted sucessfully',
                List: list
            })
        }
        else {
            res.status(401).json({
                sucess: false,
                message: 'Empty',
            })
        }
    }
    catch (err) {
        res.status(500).json({
            success: false,
            message:'Not able to extract', 
            error: err

        })
    }
})
app.post('/api/editlist', async (req, res) => {
        const pool = await connectToDatabase();
        const { userid, items, imp, date, status, olditem } = req.body;

        try {
            const result = await pool.request()
                .input('userid', sql.NVarChar, userid) // Adjust data type if needed
                .input('olditem', sql.NVarChar, olditem) // Adjust data type if needed
                .input('items', sql.NVarChar, items)
                .input('imp', sql.Int, imp)
                .input('date', sql.Date, date)
                .input('status', sql.NVarChar, status)
                .query(`
            UPDATE List 
            SET items = @items, imp = @imp, date = @date, status = @status
            WHERE userid = @userid AND items = @olditem
        `);

            if (result.rowsAffected[0] > 0) {
                res.status(200).json({ message: "Update successful" });
            } else {
                res.status(404).json({ message: "No matching record found" });
            }
        }
        catch (error) {
            console.log("Database error:", error);
            res.status(500).json({ message: "Internal Server Error", error: error, userid,imp,date,status,olditem,items });
        }
})
app.post('/api/delete', async (req, res) => {
    const pool = await connectToDatabase()
    const { userid, items, status } = req.body
    try {
        const result = await pool.request()
            .input('userid', sql.NVarChar, userid)
            .input('items', sql.NVarChar, items)
            .input('status', sql.NVarChar, status)
            .query(`update List
                     set status=@status where userid=@userid and items=@items`);
            console.log(result)
        if (result.rowsAffected.length > 0) {
            res.status(200).json({ message: "Deleted Sucessfully" })
        }
        else {
            res.ststus(404).json({ message: "No record found" })
        }

    }
    catch (err) {
        console.error("Database error:", err);
        res.status(500).json({ message: "Internal Server Error" ,err});
    }
})