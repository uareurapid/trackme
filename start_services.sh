#!/bin/bash
nohup mongod -dbpath data/db/ &
node server/app.js
#sh nodemon
