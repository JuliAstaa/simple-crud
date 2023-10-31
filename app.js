const express = require("express");
const app = express();
const port = 3000;

//view engine ejs
const ejs = require("ejs");
app.set("view engine", "ejs");

//method override
const methodOverride = require("method-override");
app.use(methodOverride("_method"));

//express layout
const expressLayouts = require("express-ejs-layouts");
const qs = require("qs");
app.use(expressLayouts);
app.use(express.urlencoded());

//config flash
const cookieParser = require("cookie-parser");
const expressSession = require("express-session");
const flash = require("connect-flash");
app.use(cookieParser("secret"));
app.use(
  expressSession({
    secret: "secret",
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 6000 },
  })
);
app.use(flash());

//mysql database
const mysql = require("mysql");
const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "buku",
});

// main menu
app.get("/", (req, res) => {
  res.render("index", {
    layout: "layout/main-layout",
    title: "Main Menu",
  });
});

//book
app.get("/data-buku", (req, res) => {
  connection.query("SELECT * FROM buku", (err, results, fields) => {
    if (err) throw err;

    res.render("pages/data-buku", {
      title: "Data Buku",
      layout: "layout/main-layout",
      dataBuku: results,
      msg: req.flash("msg"),
    });
  });
});

//add book
app.get("/add-book", (req, res) => {
  res.render("pages/add", {
    layout: "layout/main-layout",
    title: "Add book",
  });
});

app.post("/add-book", (req, res, next) => {
  connection.query(
    `INSERT INTO buku VALUES(${null}, '${req.body.judulBuku}' , '${
      req.body.deskripsi
    }' , '${req.body.pengarang}' , '${req.body.tahunTerbit}')`,
    (err, results, fields) => {
      if (err) throw err;
      console.log("data added");
    }
  );
  req.flash("msg", "New data has been added");
  res.redirect("/data-buku");
});

//edit book
app.get("/edit/:id?", (req, res) => {
  connection.query(
    `SELECT * FROM buku WHERE id_buku = ${req.query.id}`,
    (err, results, fields) => {
      if (err) throw err;
      res.render("pages/edit", {
        title: "Edit Buku",
        layout: "layout/main-layout",
        dataBuku: results,
      });
    }
  );
});

app.put("/edit/:id?", (req, res) => {
  connection.query(
    `UPDATE buku SET id_buku = ${req.body.idBuku}, judul_buku = '${req.body.judulBuku}', deskripsi = '${req.body.deskripsi}', nama_pengarang = '${req.body.pengarang}', tahun_terbit = '${req.body.tahunTerbit}' WHERE id_buku = ${req.query.id}`,
    (err, results, fields) => {
      if (err) throw err;
    }
  );
  req.flash("msg", `Book with id ${req.query.id} has been edited`);
  res.redirect("/data-buku");
});

//delete book
app.delete("/delete/:id?", (req, res) => {
  connection.query(
    `DELETE FROM buku WHERE id_buku = ${req.query.id}`,
    (err, results, fields) => {
      if (err) throw err;
    }
  );
  req.flash("msg", `Book with id ${req.query.id} has been deleted`);
  res.redirect("/data-buku");
});

//error 404 notfound
app.use("/", (req, res) => {
  res.status(404);
  res.send("404");
});

//server
app.listen(port, () => {
  console.log(`Listening at port http://localhost:${port}`);
});
