# Pub tracker
Semestral project for the A4M33VIA subject at FEE CTU.

The goal of this application is to easily find nearby restaurants visited by the user and his facebook friends. While visiting a restaurant user can rate it and add a comment about it. He can also see a restaurant with at least one review from his facebook friends. The application will show to the user a restaurants average review and commentary from his friends.

Application can be visited [here](https://kucharo2.github.io/via_project/).

### Features
 - Facebook interaction (login and friends)
 - Review and comment a visited restaurant
 - Find a restaurant visited by your friends
 - Check friends average review and comments for restaurant
 - Basic restaurants information (website, address, location)

## Branches
This application is implemented in two branches, which dived it to server and client part.

### master
Server (backend) part is implemented with [Node.js](https://nodejs.org/en/). It's purpose is to store user's reviews and comments into the document database [MongoDB](https://www.mongodb.com/). It provide an RestFull API to work with this database.  

Server is deployed on [Heroku](https://dashboard.heroku.com/) cloud platform and it's available on [this address](https://salty-woodland-34826.herokuapp.com/). It is communicating with database deployed on [mLab](https://mlab.com/welcome/) platform.

#### API
#####  GET user info
```bash
/user/:fbId
```
Returns info about the user by it's facebookId

##### POST create user
```bash
/user
```
Create a user from post data. Post data must be in this format and all of shown fields are required.
```json
{
    "fbId": "testId",
    "name": "testName",
    "email": "test@email.com"
}
```

##### POST add visited place by user
```bash
/user/:fbId/addPlace
```
Add a visited place to specific user defined by it's facebookId. Post data must be in this format and all of shown field are required.
```json
{
    "placeId": "placeId from google API", 
    "comment": "test comment", 
    "stars": "3"
}
```

##### POST visited by friends
```bash
/friends/visited
```
This endpoint execute a mapReduce function to map a visited restaurants by facebookIds of your facebook friends and match their reviews and comments to it. Required post parameter is list of facebookIds as an example. 
```json
["testFbId1", "testFbId2", "testFbId3"]
```

### gh-pages
Client (frontend) part is implemented with [jQuery](https://jquery.com/) framework and it uses another available APIs from Google and Facebook.

#### Facebook API
[Facebook API](https://developers.facebook.com/) is used to login user into the application and get basic information from him and his friends as Name, email and profile picture.

#### Google Maps API
[Google Maps API](https://developers.google.com/maps/) is used to show current user location and nearby restaurants/pubs based on browser geolocation and render a markers for restaurant visited by the user and his friends.

#### Google Places API
[Google places API](https://developers.google.com/places/) is used to get more detailed information about restaurants. 

