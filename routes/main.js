module.exports = function(app, shopData) {
    // Redirect Login
    const redirectLogin = (req,res,next) => {
        if (!req.session.userId) {
            res.redirect('./login')
        } else {next ();}
    }

const { check, validationResult } = require ('express-validator');

    // Handle our routes
    app.get('/',function(req,res){
        res.render('index.ejs', shopData)
    });
    app.get('/about',function(req,res){
        res.render('about.ejs', shopData);
    });
    app.get('/search',function(req,res){
        res.render("search.ejs", shopData);
    });
    app.get('/search-result', function (req, res) {
        //searching in the database
        //res.send("You searched for: " + req.query.keyword);
        let sqlquery= "SELECT * FROM books WHERE name LIKE '%" + req.query.keyword + "%'";
        db.query(sqlquery, (err, result) => {
            if (err) {
                res.redirect('./');
            }
            let searchData = Object.assign({}, shopData, {searchBooks: result});
            console.log(searchData)
            res.render("search-result.ejs", searchData);
        });
    });
    app.get('/register', function (req,res) {
        res.render('register.ejs', shopData);                                                                     
    });                                                                                                 
    app.post('/registered', [check('email').isEmail()], function (req,res) {
        // saving data in database
       // res.send(' Hello '+ req.body.first + ' '+ req.body.last +' you are now registered!  We will send an email to you at ' + req.body.email);
        const errors = validationResult(req);
        const bcrypt = require('bcrypt');
        const saltRounds = 10;
        const plainPassword = req.body.password;
        if(!errors.isEmpty()) {
            res.redirect('./register');
        }
        else {
            bcrypt.hash(plainPassword, saltRounds, function(err, hashedPassword) {
                if (err) {
                  return console.error(err.message)
                }
                let sqlquery = "INSERT INTO userdetails (firstname,lastname,email,username,hashedpassword) VALUES (?,?,?,?,?)";
                let newrecord = [req.sanitize(req.body.first),req.body.last,req.body.email,req.body.username,hashedPassword];
      
                db.query(sqlquery,newrecord, (err, result) => {
                  if(err) {
                      return console.error(err.message);
                  }
                  else {
                      result = 'Hello '+ req.sanitize(req.body.first) + ' '+ req.body.last +' you are now registered!  We will send an email to you at ' + req.body.email;
                      result += 'Your password is: '+ req.body.password +' and your hashed password is: '+ hashedPassword;
                      res.send(result);
      
      
                  }
                })
      
      
              })
        } 
        
    });

    //Login Page
    app.get('/login', function (req,res) {
        res.render('login.ejs', shopData);                                                                     
    }); 

    app.post('/loggedin', function (req,res) {

        const bcrypt = require('bcrypt');

        let sqlquery = "SELECT hashedpassword FROM userdetails WHERE username =?";
        
        let userdata = req.body.username;//SELECT hashedpassword FROM userdetails WHERE username = "abc"

        db.query(sqlquery, userdata, (err, result) => {
            if (err) {
                console.log(err);
            }
            else {
                //hashedPassword = result[0].hashedpassword;
                //console.log(hashedpassword);
                console.log(req.body.password);
                console.log(result);
                bcrypt.compare(req.body.password, result[0].hashedpassword, function(err, result) {
                    if (err) {
                      // TODO: Handle error
                      res.send( 'There is an error');
                    }
                    else if (result == true) {

                      req.session.userId = req.body.username;
                      res.send('That is the correct password');
                      //<a href=' + '/' + '>HOME</a>'
                    
                    }
                    else {
                      // TODO: Send message
                      res.send('That is the wrong password');
                    }
                  });
            }
        })
    })

    app.get('/logout', redirectLogin, (req,res) => {
        req.session.destroy(err => {
            if (err) {
                return res.redirect('./')
            }
            res.send('you are now logged out. <a href='+'./'+'>Home</a>');
        })
    })   

        // hashedPassword = sqlquery

        // bcrypt.compare(req.body.password, hashedPassword, function(err, result) {
        //     if (err) {
        //       // TODO: Handle error
        //       res.send( 'There is an error')
        //     }
        //     else if (result == true) {
        //       // TODO: Send message
        //       res.send('That is the correct password')
        //     }
        //     else {
        //       // TODO: Send message
        //       res.send('That is the wrong password')
        //     }
        //   });
      
    

    
    app.post('/delete', function (req,res) {
        let sqlquery = 'DELETE FROM userdetails WHERE username = "' + req.body.username +'"'
        let DeleteUsername = req.body.username

        db.query(sqlquery, (err, result) => {
            if (err) {
                res.send('there was an error')
            }
            else {
                if(result.affectedRows == 0) {
                    res.send("No user with that username")
                }
                else{
                    res.send("User " + DeleteUsername + "delete successfully!")
                }
            }
    })
})

    
    
    //Delete Page
    app.get('/deleteuser', function (req,res) {
        res.render('deleteuser.ejs', shopData);                                                                     
    }); 

    //List of Users
    app.get('/listusers', function(req, res) {
        let sqlquery = "SELECT firstname, lastname, email, username FROM userdetails"; // query database to get all users
        // exxecute sql query
        db.query(sqlquery, (err, result) => {
            if(err) {
                res.redirect('./');
            }
            let newData = Object.assign({}, shopData, {availableusers: result});
            console.log(newData)
            res.render("listusers.ejs", newData)

        })
    })


    // Weather Forecast
    app.get('/weather', function(req,res) {
        const request = require('request');

        let apiKey = '4066b0791a9932795eb1fe9004cb04f7';
        let city = 'london';
        let url = `http://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`

        request(url, function (err,response, body) {
            if(err){
                console.log('error:', error);
            } else {
                // res.send(body);
                var weather = JSON.parse(body)
                if (weather!==undefined && weather.main!== undefined) {
                var wmsg = 'It is ' + weather.main.temp + ' degrees in ' + weather.name +  ' The maximum temp is ' + weather.main.temp_max + ' And the minimum temp is ' + weather.main.temp_min + '! <br> The humidity now is: ' + weather.main.humidity +  '! <br> The pressure now is: ' + weather.main.pressure;
                res.send(wmsg);
                }
                else {
                    res.send("No data found");
                }
            }
        });
    })

    //List of books
    app.get('/list',redirectLogin, function(req, res) {
        let sqlquery = "SELECT * FROM books"; //query database to get all the books
        // execute sql query
        db.query(sqlquery, (err, result) => {
            if (err) {
                return res.redirect('/');
            }

            let allusers = Object.assign({}, shopData, {availableBooks: result});
            console.log(allusers)
            res.render("list.ejs", allusers)
        });
    });      
    app.get('/addbook', function (req,res) {
        //Adding book
        res.render('addbook.ejs', shopData);
    })

    app.post('/bookadded', function (req,res) {
        // saving data in database
        let sqlquery = "INSERT INTO books (name, price) VALUES (?,?)";
        // execute sql query
        let newrecord = [req.body.name, req.body.price];
        db.query(sqlquery, newrecord, (err, result) => {
        if (err) {
            return console.error(err.message);
        }
        else
        res.send(' This book is added to database, name: '+ req.body.name + ' price '+ req.body.price);
        });
    
    });

    app.get('/api', function (req,res) {
        
        // Query database to get all the books
        let sqlquery = "SELECT * FROM books";

        // Excute the sql query
        db.query(sqlquery, (err, result) => {
            if (err) {
                res.redirect('./');
            }
            // Return results as a JSON object
            res.json(result);
        });
    });

    //Bargain books
    app.get('/bargainbooks', function(req, res) {
        let sqlquery = "SELECT * FROM books"; //query database to get all the books
        // execute sql query
        db.query(sqlquery, (err, result) => {
            if (err) {
                res.redirect('./');
            }
            let newData = Object.assign({}, shopData, {availableBooks: result});
            console.log(newData)
            res.render("bargainbooks.ejs", newData)
        });
    });
}


// 1 -  sql query - Select hashed password from userdetails where username = ? 
// 2 - bcrypt compare the password to the userdetails hashed password
//req.session.userId = req.body.username