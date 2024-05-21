#bin/bash
gcloud config set project umhbackend
gcloud config set run/region us-west1
gcloud builds submit --tag gcr.io/umhbackend/umhbackend
gcloud run deploy umhbackend --source . --region=us-west1 --project=umhbackend