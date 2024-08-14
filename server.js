const mongoose = require('mongoose');
const fs = require('fs');

const express = require('express');
const app = express();

require('dotenv').config();

app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));

app.get('/', function(req, res){
    res.render('index');
});

app.get('/about', function(req, res){
    res.render('about');
});

app.get('/projects', function(req, res){
    res.render('projects');
});

app.get('/contact', function(req, res){
    res.render('contact');
});

app.get('/blog', async function(req, res){
    var posts = await get_latest_posts(5);

    res.render('blog', { 
        posts : (await posts)
    });
});

app.get('/resume', function(req, res){
    var data = fs.readFileSync('public/Resume-Alex-Steiner.pdf');
    res.contentType("application/pdf");
    res.send(data);
});

async function Connect() {
    mongoose.set('strictQuery', true);
    await mongoose.connect(process.env.MONGO_STRING);

    console.log('Connected to database!');
}

const postSchema = new mongoose.Schema({
    title : String,
    subTitle : String,
    date : String, 
    author : String, 
    summary : String,
    logo : String,
    text : String,
    arguments : Array
});

const Post = mongoose.model('post', postSchema);

function reload_posts(){
    Post.find({}, function(err,posts) {
        if(!err){
            posts.forEach(post => {
                app.get(`/blog/${post._id}`, function(req, res){
                    res.render('post', {
                        post : post
                    });
                });
            });

            console.log('All posts were updated!');
        }
    });
}

async function get_latest_posts(amount){
    var x = await Post.find().sort({ _id: -1 }).limit(amount);
    var y = [];

    await x.forEach(z =>{
        y.push(z);
    });

    console.log("Latests posts where loaded!");
    
    return y;
}

function upload_new_post(title, subTitle, author, text, arguments, logo){
    const newPost = new Post({
        title : title,
        subTitle : subTitle,
        date : new Date().toJSON().slice(0,10).replace(/-/g,'/'), 
        author : author, 
        text : text,
        logo : logo,
        arguments : arguments
    });

    newPost.save();

    console.log(`A new post has been added! Check it out! https://alexsteiner.dev/blog/${newPost._id}`);

    reload_posts();
}


app.listen(port=process.env.PORT, async function(){
    console.log('Server running on port ' + process.env.PORT);
    Connect().catch(err => console.log(err));
    
    reload_posts();
});
