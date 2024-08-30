# Backend for the project
This is the backend for the project. It is a RESTful API that is built using Node.js and Express.js. It is connected to a Firebase database.

## Installation
To install the backend you need to clone the repository and then run the following commands:
```bash
cd umh-backend
npm install
```
Then you can run the server with the following command:
```bash
npm run dev
```
You need to have a .env file with the following variables:
```bash
// JWT Authentication
USERNAME
SECRET_KEY
USER_ID

// Firebase cofiguration
FIREBASE_TYPE
FIREBASE_PROJECT_ID
FIREBASE_PRIVATE_KEY_ID
FIREBASE_PRIVATE_KEY
FIREBASE_CLIENT_EMAIL
FIREBASE_CLIENT_ID
FIREBASE_AUTH_URI
FIREBASE_TOKEN_URI
FIREBASE_AUTH_PROVIDER_X509_CERT_URL
FIREBASE_CLIENT_X509_CERT_URL
FIREBASE_UNIVERSE_DOMAIN
OCMP_SUBSCRIPTION_KEY
PORT
MOBILEUSERCOLLECTIONNAME
BACKUPCOLLECTIONNAME
BLOCKEDIPCOLLECTIONNAME
EMAILSCOLLECTION
CONFIGURATIONVALUESCOLLECTION
CARDSTYPESSUBCOLLECTION
STATESSUBCOLLECTION
STATESFIELD
FAMILIARSUBCOLLECTION
LETTERSSUBCOLLECTION
CONTACTSSUBCOLLECTION
FAVORITESSUBCOLLECTION
DISTRIBUTIONSSUBCOLLECTION
GIFTSSUBCOLLECTION
NOTESSUBCOLLECTION
TASKSSUBCOLLECTION
LEGACYSUBCOLLECTION
LINKSSUBCOLLECTION
MEXICOLANGUAGECODE
UNITEDSTATESLANGUAGECODE
MEXICOSTATESFIELDCOLLECTION
UNITEDSATTESSTATESFIELDCOLLECTION
CONTACTSTYPESSUBCOLLECTION
FAMILYMEMBERMEXICO
FAMILYMEMBERSUNITEDSTATES
CONTACTTYPESMEXICO
CONTACTTYPESUNITEDSTATES
CATEGORYTYPESSUBCOLLECTION
CategoryTypeEN
CategoryTypeES
GIFTSCONFIGURATIONVALUESSUBCOLLECTION
```

PLEASE, REMOVE THE // FROM THE .ENV FILE, THIS IS JUST FOR THE README
In order to get all the firebase configuration you need to create a new project in firebase and then go to the settings of the project and then to the service accounts tab, there you can generate a new private key and you will get a json file with all the configuration.

## Deployment in Google Cloud Run
We use Docker and the ./deploy.sh script to deploy the backend in Google Cloud Run. The Dockerfile is used to create the image that is deployed in Google Cloud Run.
```bash
./deploy.sh
```

# Docker configuration
To run locally using Docker you can use the following commands:
```bash
docker build -t umhbackend .
docker run -p 8080:8080 umhbackend
```

To stop the container you can run the following command:
```bash
docker stop $(docker ps -a -q)
```

Or just use the id of the container to stop it:
```bash
docker stop <container_id>
```

Example: 
```bash
docker stop 123456789
```

# Google cloud cache cleaning
If you have any problem with the cache in Google Cloud Run, you can run the following command:
```bash
gcloud run revisions list --filter="status.conditions.type:Active AND status.conditions.status:'False'" --format='value(metadata.name)' | xargs -r -L1 gcloud run revisions delete --quiet
```


## Errors solutions
If I have any error on deployment, can I run 
```bash
gcloud run deploy umhbackend --source . --region=us-west1 --project=umhbackend
```

## Alternative to deploy in Google Cloud Run using bash script
You can use the following bash script to deploy the backend in Google Cloud Run:
```bash
./deploy.sh
```

If you receive a permission error, you can run the following command:
```bash
chmod +x deploy.sh
```

Note: Use the server 37 region us-east1 to deploy the backend.

Youu need to have the environment variables in Railway.