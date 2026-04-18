# Youtube Video Sharing App

## Introduction

Web to post your favorite Youtube embed link Save and History them.
Project structure:
- apps/web: React frontend
- apps/service: Rails backend (with ActionCable)
https://www.youtube.com/watch?v=pRdv7lDoqIo&list=RDMMH4BB9eGUEaE&index=8
https://www.youtube.com/embed/pRdv7lDoqIo?si=l43z5RVM1Df8ioYD

---

## Prerequisites

Docker Desktop (If win10/win11) or Docker Linux (Ubuntu)
Git git version 2.53.0.windows.2
NPM 11.12.1
NodeJS v25.9.0
Ubuntu Subsystem Win11
VSCode 1.115.0
ruby "4.0.2"
Rails version: 8.1.3

---

## Installation & Configuration:
```
git clone git@github.com:maearon/remitano-test.git
```
install Docker Desktop (If win10/win11) https://www.docker.com/products/docker-desktop/ 
install Linux on Windows with WSL https://learn.microsoft.com/vi-vn/windows/wsl/install
install ruby "3.4.2" Rails version: 8.0.2 https://gorails.com/setup/windows/11
```
cd /mnt/c/Users/manhn/CODE/REMITANO-TEST/apps
rails new service -d postgresql --api
bundle add dotenv-rails
bundle add jwt
mkdir -p app/services/jwt/user
touch app/services/jwt/user/encode_token_service.rb
touch app/services/jwt/user/decode_token_service.rb
touch app/models/concerns/user_jwt_claims.rb
mkdir -p app/views/api/sessions
touch app/views/api/sessions/create.json.jbuilder
touch app/views/api/sessions/index.json.jbuilder
mkdir -p app/views/api/static_pages
touch app/views/api/static_pages/home.json.jbuilder
bundle add kaminari
```
Create API key on https://console.cloud.google.com/apis/credentials to get Data From Youtube API V3

---

## Database Setup
no need action create one if you need a new on https://neon.com/
```
postgres://default:z9GYTlrXa8Qx@ep-bold-voice-a4yp8xc9-pooler.us-east-1.aws.neon.tech:5432/verceldb?sslmode=require
```

---

## Running the Application
Way1:
In VSCode run npm start in terminal
In UbuntuWin11 run rails s in terminal
Way2:
docker-compose build
docker-compose up

---

## (BE/FS) Docker Deployment
deploy Frontend apps/web to Vercel
deploy Backend apps/service to Render with docker mode

---

## Usage

---

## Troubleshooting

```
sudo apt clean
sudo apt update
sudo apt --fix-missing update
sudo apt upgrade -y
sudo apt install xdg-utils
xdg-open .
explorer.exe .
manhn@DESKTOP-96F067C:/mnt/c/Users/manhn/CODE/REMITANO-TEST/apps/service$ ls
Gemfile
rm -rf apps/service/.git
git rm -r --cached .
```
Reload VSCode
```
Ctrl + Shift + P → Reload Window
```
👉 In the new Ruby/Rails (Rails 8 + Ruby 4),
`get` now only accepts one argument, unlike the previous method of passing multiple symbols.
```
member do
  get :following, :followers
end
```
need to
```
member do
  get :following
  get :followers
end
```