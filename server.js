const express = require('express');
const path = require('path');
const app = express();
app.use(express.static(path.join(__dirname, 'public'))).set('views', path.join(__dirname, 'views')).set('view engine', 'ejs')
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Server is runnning on http://localhost:${PORT}`);
})
app.get("/", (req, res) => {
    res.render('index')
})