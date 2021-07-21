const express = require('express');
const morgan = require('morgan');
const { Prohairesis } = require('prohairesis');
const dotenv = require('dotenv');
dotenv.config();

const app = express();
const port= process.env.PORT || 8080; // Horoku going to use npm start command and port 8080
const mySQLstring = process.env.CLEARDB_DATABASE_URL;
const database = new Prohairesis(mySQLstring);

app.use(morgan('dev'))
app.use(express.static('public')) // 


app.use(express.urlencoded({
        extended: false
    }));
app.use(express.json());
app.get('/api/user', async(req,res) => { // list of all users in array
    const users = await database.query(`
        SELECT
            *
        FROM
            user
        ORDER BY
            date_added DESC 
    `)

    // res.json(users); // gives array of all users
    res.contentType('html'); 

    res.end(`
    ${users.map((user) => {
        return `<p>${user.first_name} ${user.last_name} is ${user.age} years old</p>`;
    }).join(``)}
    `)
})      // gives your html from server in <p>

app.post('/api/user', async (req, res) =>{
    const body = req.body;
    await database.execute(`
    INSERT INTO User (
        first_name,
        last_name,
        age,
        date_added
    ) VALUES (
        @firstName,
        @lastName,
        @age,
        NOW()
    )
    `, {
        firstName: body.first,
        lastName: body.last,
        age: body.age,
    });

    res.end('Added user');
});

app.listen(port, () => console.log('Server listening on port ${port}'));
    