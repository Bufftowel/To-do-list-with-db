let express = require("express"); 
let app = express();
let mysql = require("mysql");
let bodyparser = require("body-parser");
let cookieParser = require("cookie-parser");
let characters = 'ABC@DEFG!HIJK@LM#NOPQRS%TUVW$XYZ^abc&defghi*jklmnopq&rstuvwxyz';
let unique_id = 0;
let users = new Map();
require("dotenv").config();

let con = mysql.createConnection({
    host: "db4free.net", 
    user: process.env.USER,
    port: 3306,
    password: process.env.PASS,
    database: "sql12341900"
});

let port;
if(process.env.PORT)
    port = process.env.PORT;
else port = 3000;

app.use(cookieParser());
app.use(bodyparser.urlencoded({extended: true}));

app.listen(port, () => {
    console.log("Server Started");
});

app.use(express.static("public"));

con.connect((err) => {
    if(!err)
        console.log("Connected to Database!");
    else console.log(`Error : ${err}`);
})

function generateRandomString()
{
    let s = "";
    let n = Math.floor(Math.random() * 10) + 10;
    for(let i = 0; i < n; i++)
        s += characters[Math.floor(Math.random() * characters.length)];
    s += String(unique_id);
    ++unique_id;
    return s;
}

function createNewTable(user) {
    return `CREATE TABLE ${user} (task varchar(100) NOT NULL, description text, link varchar(200), priority int, id 
            int PRIMARY KEY AUTO_INCREMENT)`;
}

app.get("/", (req, res) => {
    if(req.cookies.u_id)
    {
        if(users.has(req.cookies.u_id))
            res.redirect(`/user/${users.get(req.cookies.u_id)}`);
        else {
            res.clearCookie("u_id");
            res.render("login.ejs", {err: ""});
        }
    }
    else res.render("login.ejs", {err: ""});
});

app.post("/login", (req, res) => {
    con.query(`SELECT * FROM users WHERE username = "${req.body.username}"`, (err, result, field) => {
        if(err)
        {
            console.log(`Error : ${err}`);
            throw err;
        }
        if(result.length === 0 || result[0].password != req.body.password || result[0].username != req.body.username)
            res.render("login.ejs", {err: "Incorrect username/password"});
        else
        {
            let s = generateRandomString();
            users.set(s, req.body.username);
            res.cookie("u_id", s);
            res.redirect(`/user/${req.body.username}`);
        }
    });
});

app.post("/signup", (req, res) => {
    con.query(`SELECT * FROM users WHERE username="${req.body.username}"`, (err, result, field) => {
        if(err)
        {
            console.log(`Error : ${err}`);
            throw err;
        }
        if(result.length > 0)
            res.render("login.ejs", {err : "UserName Already Taken!"});
        else
        {
            con.query(`INSERT INTO users VALUES("${req.body.username}", "${req.body.password}")`, (err, result, field) => {
                if(err)
                {
                    console.log(`Error : ${err}`);
                    throw err;
                }
                con.query(createNewTable(req.body.username), (err, result, field) => {
                    if(err)
                    {
                        console.log(`Error : ${err}`);
                        throw err;
                    }
                    let s = generateRandomString();
                    users.set(s, req.body.username);
                    res.cookie("u_id", s);
                    res.redirect(`/user/${req.body.username}`);
                });
            });
        }
    });    
});

app.get("/user/:user", (req, res) => {
    if(req.cookies.u_id)
    {
        if(users.has(req.cookies.u_id) && users.get(req.cookies.u_id) === req.params.user)
        {
            con.query(`SELECT * FROM ${req.params.user}`, (err, result, field) =>  {
                if(err)
                {
                    throw err;
                }
                res.render("home.ejs", {tasks : result, user: req.params.user});
            });
        }
        else res.redirect("/");
    }
    else
        res.redirect("/");
});

app.post("/data", (req, res) => {
    let data = req.body;
    let s = data.description, desc = "";
    for(let i = 0; i < s.length; i++)
    {
        if(s[i] == '"')
            desc = desc + "\\" + '"';
        else desc += s[i];
    }
    let curUser = users.get(req.cookies.u_id);
    desc = desc.replace(/(?:\r\n|\r|\n)/g, '<br>');
    con.query(`INSERT INTO ${curUser} (task, description, link, priority) values("${data.title}","${desc}", "${data.link}", ${data.priority})`);
    res.redirect("/");
});

app.post("/del", (req, res) => {
    let curUser = users.get(req.cookies.u_id);
    con.query(`DELETE FROM ${curUser} where id=${req.body.id}`);
    res.redirect("/");
});

app.get("/logout", (req, res) => {
    res.clearCookie("u_id");
    res.redirect("/");
});

app.post("/changepass", (req, res) => {
    con.query(`SELECT password FROM users where username="${users.get(req.cookies.u_id)}"`, (err, result, field) =>  {
        if(err)
        {
            throw err;
        }
        if(result[0].password != req.body.oldpass)
            res.send("Wrong password!");
        else if(req.body.newpass1 != req.body.newpass2)
            res.send("New Password do not match!");
        else
        {
            con.query(`UPDATE users set password="${req.body.newpass1}" WHERE username="${users.get(req.cookies.u_id)}"`, (err, result, field) => {
                if(err)
                    console.log(err);
                else res.redirect("/");
            });
        }
    });
});

app.get("/user", (req, res) => {
    if(req.cookies.u_id)
    {
        if(users.has(req.cookies.u_id))
        {
            con.query(`SELECT * FROM ${users.get(req.cookies.u_id)}`, (err, result, field) =>  {
                if(err)
                {
                    throw err;
                }
                res.render("home.ejs", {tasks : result, user: users.get(req.cookies.u_id)});
            });
        }
        else res.redirect("/");
    }
    else res.redirect("/");
});


