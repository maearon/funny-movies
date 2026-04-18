# README

This README would normally document whatever steps are necessary to get the
application up and running.

Things you may want to cover:

* Ruby version

* System dependencies

* Configuration

* Database creation

* Database initialization

* How to run the test suite

* Services (job queues, cache servers, search engines, etc.)

* Deployment instructions

* ...

```
rails g model User name:string email:string password_digest:string
rails g model Micropost content:string title:string youtube_id:string user:references
rails g model Relationship follower_id:integer followed_id:integer
```
