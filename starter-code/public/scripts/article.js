'use strict';

// REVIEW: Check out all of the functions that we've cleaned up with arrow function syntax.


// Pass in to the IIFE a module, upon which objects can be attached for later access.
function Article(opts) {
  // REVIEW: Lets review what's actually happening here, and check out some new syntax!!
  Object.keys(opts).forEach(e => this[e] = opts[e]);
}

Article.all = [];

Article.prototype.toHtml = function() {
  var template = Handlebars.compile($('#article-template').text());

  this.daysAgo = parseInt((new Date() - new Date(this.publishedOn))/60/60/24/1000);
  this.publishStatus = this.publishedOn ? `published ${this.daysAgo} days ago` : '(draft)';
  this.body = marked(this.body);

  return template(this);
};

Article.loadAll = rows => {
  rows.sort((a,b) => (new Date(b.publishedOn)) - (new Date(a.publishedOn)));

  rows.map(function (a){
    Article.all.push(new Article(a));
  });


  // DONE! TODO: Refactor this forEach code, by using a `.map` call instead, since want we are trying to accomplish
  // is the transformation of one colleciton into another.



  // rows.forEach(function(ele) {
  //   Article.all.push(new Article(ele));
  // });


};

Article.fetchAll = callback => {
  $.get('/articles')
  .then(
    results => {
      Article.loadAll(results);
      callback();
    }
  )
};

// DONE TODO: Chain together a `map` and a `reduce` call to get a rough count of all words in all articles.
Article.numWordsAll = () => {
  return Article.all.map(function(a){
    return a.body.split(' ');
  }).reduce(function(acc, name){
    return acc + name.length;
  }, 0);
};

// DONE TODO: Chain together a `map` and a `reduce` call to produce an array of unique author names.
Article.allAuthors = () => {
  var filter = [];
  var arr = Article.all.map(function(a){
    return a.author;
  });

  for (var i = 0; i < arr.length; i++){
    if (filter.includes(arr[i]) === false) {
      filter.push(arr[i]);
    }
  }
  return filter;
};

Article.numWordsByAuthor = () => {
  return Article.allAuthors().map(name => {
    // DONE TODO: Transform each author string into an object with properties for
    // the author's name, as well as the total number of words across all articles
    // written by the specified author.
    var sum = 0;
    for (var i = 0; i < Article.all.length; i++){
      if(Article.all[i].author === name) {
        var arr = Article.all[i].body.split(' ');
        sum += arr.length;
      }
    }
    return {
      name: name,
      wordsWritten: sum
    }
  })
};

Article.truncateTable = callback => {
  $.ajax({
    url: '/articles',
    method: 'DELETE',
  })
  .then(console.log) // REVIEW: Check out this clean syntax for just passing 'assumend' data into a named function!
  .then(callback);
};

Article.prototype.insertRecord = function(callback) {
  $.post('/articles', {author: this.author, authorUrl: this.authorUrl, body: this.body, category: this.category, publishedOn: this.publishedOn, title: this.title})
  .then(console.log)
  .then(callback);
};

Article.prototype.deleteRecord = function(callback) {
  $.ajax({
    url: `/articles/${this.article_id}`,
    method: 'DELETE'
  })
  .then(console.log)
  .then(callback);
};

Article.prototype.updateRecord = function(callback) {
  $.ajax({
    url: `/articles/${this.article_id}`,
    method: 'PUT',
    data: {
      author: this.author,
      authorUrl: this.authorUrl,
      body: this.body,
      category: this.category,
      publishedOn: this.publishedOn,
      title: this.title,
      author_id: this.author_id
    }
  })
  .then(console.log)
  .then(callback);
};
