const express = require('express');
const session = require('express-session');
const connection = require('./config/db')
const path = require('path');
const app = express();
const bodyParser = require('body-parser');

app.use(session({
    secret: "secretkey",
    resave : false,
    saveUninitialized : false
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public'))).set('views', path.join(__dirname, 'views')).set('view engine', 'ejs')
const PORT = process.env.PORT || 8080;
const users = [
    { id: 1, username: 'admin', password: 'password' },
    { id: 2, username: 'user', password: 'password123' }
  ];
  
app.listen(PORT, () => {
    console.log(`Server is runnning on http://localhost:${PORT}`);
})
app.get("/", (req, res) => {
    res.render('index')
})
app.get("/login", (req, res) => {
    res.render('login')
})
app.post('/login', (req, res) => {
// Get username and password from the request body
const { username, password } = req.body;

// Find the user with the given username
const user = users.find(u => u.username === username);

// If no user is found or the password is incorrect, return an error
if (!user || user.password !== password) {
    return res.status(401).json({ error: 'Invalid username or password' });
}
req.session.user = user;
// If the user is found and the password is correct, you can generate a token or session
// and return it to the client. In this example, we'll just return a success message.
// Redirect the user to the dashboard
res.redirect('/dashboard');
});

app.get('/dashboard', (req, res)=>{
if (req.session.user != null){
    res.render('dashboard', { user: req.session.user })
} else {
    res.redirect('/login')
}
})

app.get('/logout', (req, res) => {
req.session.destroy((err) => {
    if (err) {
        console.error(err);
        res.status(500).send('Error logging out');
    } else {
        res.send('Logged out');
    }
})

})

app.get('/criteria', (req, res) => {
connection.query('SELECT * FROM criteria', (err, results) => {
    if (err) throw err;
    res.json(results);
});
});

app.post('/criteria', (req, res) => {
const { name, description, type } = req.body;
connection.query('INSERT INTO criteria (criteria_name, criteria_bobot, Benefit) VALUES (?, ?, ?)', [name, description, type], (err, results) => {
    if (err) throw err;
    res.json({ id: results.insertId });
});
});

app.put('/criteria/:id', (req, res) => {
const id = req.params.id;
const { name, description, type } = req.body;
connection.query('UPDATE criteria SET criteria_name = ?, criteria_bobot = ?, Benefit = ? WHERE id_criteria = ?', [name, description, type, id], (err, results) => {
    if (err) throw err;
    res.json({ message: 'Criteria updated' });
});
});

app.delete('/criteria/:id', (req, res) => {
const id = req.params.id;
connection.query('DELETE FROM criteria WHERE id_criteria = ?', [id], (err, results) => {
    if (err) throw err;
    res.json({ message: 'Criteria deleted' });
});
});
  