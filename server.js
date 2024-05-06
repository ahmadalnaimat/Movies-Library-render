const express = require("express");
const axios = require('axios');
const moviesdata= require('./Movie Data/data.json');
const pg = require('pg');
const cors = require('cors');
require('dotenv').config();
const app = express();
app.use(express.json());
app.use(cors());
const ApiKey=process.env.Key;
const Database=process.env.PG_DATABASE
const User=process.env.PG_USER
const Password=process.env.PG_PASSWORD
const Host=process.env.PG_HOST
const Port=process.env.PG_PORT
const client = new pg.Client(`postgresql://${User}:${Password}@${Host}:${Port}/${Database}`)
const PORT = 8081;

app.get('/',Homehandler)
app.get('/favorite',Favoritehandler)
app.get('/trending',trendinghandler)
app.get('/search',searchhandler)
app.get('/toprated',topRated)
app.get('/nowplaying',nowplaying)
app.get('/getmovies',getAllMoviehandler)
app.get('/getmovies/:id',getMoviehandler)
app.post('/getmovies',addMoviehandler)
app.put('/UPDATE/:id',updateMoviehandler)
app.delete('/DELETE/:id',deleteMoviehandler)

app.use(serverErrorHandler)
app.use(pageErrorHandler)

function updateMoviehandler(req,res) {
    const {id} = req.params;
    const sql = `UPDATE movies SET comment = $1 WHERE id = ${id};`
    const {comment} = req.body;
    const value = [comment];
    client.query(sql,value)
    .then(()=>{
        res.send("comment updated")
    })
    .catch(serverErrorHandler)
}

function deleteMoviehandler(req,res) {
    const {id} = req.params
    const sql = `DELETE FROM movies WHERE id=${id};`
    client.query(sql)
    .then(()=>{
        res.send("movie deleted successfully")
    })
    .catch(serverErrorHandler)
}

function getMoviehandler(req,res) {
    const {id} = req.params
    const sql = `SELECT * from movies WHERE id= ${id};`
    client.query(sql)
    .then(data=> {
        res.send(data.rows)
    })
    .catch(serverErrorHandler)
}

function getAllMoviehandler(req,res) {
    const sql = 'SELECT * from movies;'
    client.query(sql)
    .then(data=> {
        res.send(data.rows)
    })
    .catch(serverErrorHandler)
}

function addMoviehandler(req,res) {
    const addmovies=req.body;
    const sql = 'INSERT INTO movies(title,release_date,poster_path,comment) VALUES ($1, $2, $3, $4) RETURNING *;'
    const values = [addmovies.title , addmovies.release_date , addmovies.poster_path , addmovies.comment]
    client.query(sql,values)
    .then(data=>{
        res.send("you data was added")
    })
    .catch(serverErrorHandler)}

function Homehandler(req,res) {
    let newMovies = new Movies(moviesdata.title,moviesdata.poster_path,moviesdata.overview)
    res.send(newMovies)
}

function Favoritehandler(req,res) {
    res.send("Welcome to Favorite Page")
}
function trendinghandler(req,res){
    axios.get(`https://api.themoviedb.org/3/trending/all/week?api_key=${ApiKey}&language=en-US`)
    .then(Mdata => {
        const trending = Mdata.data.results.map(movie => {
            return new Movies(
                movie.id, 
                movie.title, 
                movie.release_date, 
                movie.poster_path, 
                movie.overview
            )
        })
        res.json(trending);
    })
    .catch(serverErrorHandler)
}
function searchhandler(req,res) {
    const query = req.query.query;
    axios.get(`https://api.themoviedb.org/3/search/movie?api_key=${ApiKey}&language=en-US&query=${query}&page=2`)
    .then(Sresult=>{
        res.json(Sresult.data.results)
    })
    .catch(serverErrorHandler)
}
function topRated(req,res) {
    axios.get(`https://api.themoviedb.org/3/movie/top_rated?api_key=${ApiKey}&language=en-US&page=1`)
    .then(Mdata=>{
        const toprated= Mdata.data.results.map(movie=>{
            return new RatingMovies(
            movie.id,
            movie.title,
            movie.release_date,
            movie.vote_average,
            movie.poster_path,
            movie.overview
            )
        })
        res.json(toprated)
    })
    .catch(serverErrorHandler)
}
function nowplaying(req,res) {
    axios.get(`https://api.themoviedb.org/3/movie/now_playing?api_key=${ApiKey}&language=en-US&page=1`)
    .then(Mdata=>{
        const nowplaying= Mdata.data.results.map(movie=>{
            return new RatingMovies(
            movie.id,
            movie.title,
            movie.release_date,
            movie.vote_average,
            movie.poster_path,
            movie.overview
            )
        })
        res.json(nowplaying)
    })
    .catch(serverErrorHandler)
}

function Movies(id,title,release_date,poster_path,overview) {
    this.id= id
    this.title= title
    this.release_date= release_date
    this.poster_path= poster_path
    this.overview= overview
    
}
function RatingMovies(id,title,release_date,vote_average,poster_path,overview) {
    this.id= id
    this.title= title
    this.release_date= release_date
    this.rating= vote_average
    this.poster_path= poster_path
    this.overview= overview
    
}

function serverErrorHandler(error,req,res,next) {
    res.status(500).json({
        Status: 500,
        ResponseText: "something went wrong with server"
    })
}
function pageErrorHandler(err,req,res,next) {
    res.status(404).json({
        Status: 404,
        ResponseText: "something went wrong with page"
    })
}

client.connect()
.then(()=>{
    app.listen(PORT,()=>{
    console.log(`server is running ${PORT}`)
})
})

