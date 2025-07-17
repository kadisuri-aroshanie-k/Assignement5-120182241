/********************************************************************************
* WEB700 – Assignment 04
*
* I declare that this assignment is my own work in accordance with Seneca's
* Academic Integrity Policy:
*
* https://www.senecapolytechnic.ca/about/policies/academic-integrity-policy.html
*
* Name: Kuruwita Arachchige Dona Isuri Aroshanie Kuruwita Student ID: 120182241 Date: 17-07-2025
*
* Published URL: ___________________________________________________________
*
********************************************************************************/
const express = require('express');
const app = express();
const path = require('path');
const LegoData = require('./modules/legoSets'); // Require the class directly

const legoData = new LegoData();
const HTTP_PORT = process.env.PORT || 8080;


app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '/views'));

// Routes
app.get('/', (req, res) => {
    res.render("home", { page: "/" }); 
});

app.get('/about', (req, res) => {
    res.render("about", { page: "/about" });
});

app.get('/lego/sets', (req, res) => {
    if (req.query.theme) {
        legoData.getSetsByTheme(req.query.theme)
            .then(data => {
                res.render("sets", { sets: data, page: "/lego/sets" }); 
            })
            .catch(err => {
                res.status(404).render("404", { message: err, page: "" }); 
            });
    } else {
        legoData.getAllSets()
            .then(data => {
                res.render("sets", { sets: data, page: "/lego/sets" }); 
            })
            .catch(err => {
                res.status(404).render("404", { message: err, page: "" }); 
            });
    }
});

app.get('/lego/sets/:setNum', (req, res) => {
    legoData.getSetByNum(req.params.setNum)
        .then(data => {
            res.render("set", { set: data, page: "" }); 
        })
        .catch(err => {
            res.status(404).render("404", { message: err, page: "" }); 
        });
});

app.get("/lego/addSet", (req, res) => {
  legoData.getAllThemes() 
    .then(themes => {
      res.render("addSet", { themes: themes, page: "/lego/addSet" }); 
    })
    .catch(err => {
      
      res.status(500).render("404", { message: "Error fetching themes: " + err, page: "" });
    });
});


app.post("/lego/addSet", (req, res) => {
  
  legoData.getThemeById(req.body.theme_id)
    .then(foundTheme => {      
      req.body.theme = foundTheme.name;       
      return legoData.addSet(req.body);
    })
    .then(() => {
      res.redirect("/lego/sets"); 
    })
    .catch(err => {
      // Handle error if adding fails
      res.status(500).send("Error adding set: " + err); 
    });
});


app.get("/lego/deleteSet/:set_num", async (req, res) => {
    try {
        await legoData.deleteSetByNum(req.params.set_num);
        res.redirect("/lego/sets");
    } catch (err) {
        res.status(404).render("404", { message: err, page: "" });
    }
});


app.use((req, res) => {
    res.status(404).render("404", { page: "" }); 
});

legoData.initialize()
    .then(() => {
        app.listen(HTTP_PORT, () => {
            console.log(`server listening on: http://localhost:${HTTP_PORT}`);
        });
    })
    .catch(err => {
        console.error(`Error initializing data: ${err}`);
    });
