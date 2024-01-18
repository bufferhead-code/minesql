# MineSQL

**You can learn more about how it works and how i made it [here](http://www.youtube.com/watch?v=x7LJ0CO45MY)**

[![Youtube Video about how this project was made](http://img.youtube.com/vi/x7LJ0CO45MY/0.jpg)](http://www.youtube.com/watch?v=x7LJ0CO45MY 'Using a MySQL Database to Mine Bitcoins')

## Setup

Download mysql enterprise from oracle here https://www.oracle.com/mysql/technologies/mysql-enterprise-edition-downloads.html 

Make sure to have `mysql-enterprise-8.2.0-javascript_el9_x86_64_bundle.tar` in the root of the project before building the Docker image

## Running the project

```bash
docker-compose up -d

npm run build
```

After that there is a `bundle.js` file which contains the MySQL Commands that can be executed on the MySQL Server to run the Bitcoin Miner.

## FAQ

### Why?

Spieltrieb.