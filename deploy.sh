#!/bin/bash

# Configura el proyecto de Google Cloud
gcloud config set project umhbackend
gcloud config set run/region us-west1

# Envía la imagen Docker al Container Registry de Google Cloud
gcloud builds submit --tag gcr.io/umhbackend/umhbackend

# Despliega el contenedor en Cloud Run
gcloud run deploy umhbackend \
  --image gcr.io/umhbackend/umhbackend \
  --platform managed \
  --region us-west1 \
  --project umhbackend \
  --allow-unauthenticated
