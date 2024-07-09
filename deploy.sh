#!/bin/bash

# Configura el proyecto de Google Cloud
#!/bin/bash

# ANSI Colors
COLOR_RESET="\033[0m"
COLOR_YELLOW="\033[0;33m"
COLOR_GREEN="\033[0;32m"
COLOR_BLUE="\033[0;34m"

# Set Google Cloud project and region
echo -e "${COLOR_BLUE}Setting Google Cloud project and region...${COLOR_RESET}"
gcloud config set project umhbackend
gcloud config set run/region us-west1

# Submit Docker image to Container Registry
echo -e "${COLOR_YELLOW}Submitting Docker image to Container Registry...${COLOR_RESET}"
gcloud builds submit --tag gcr.io/umhbackend/umhbackend

# Deploy container to Cloud Run
echo -e "${COLOR_YELLOW}Deploying container to Cloud Run...${COLOR_RESET}"
gcloud run deploy umhbackend \
  --image gcr.io/umhbackend/umhbackend \
  --platform managed \
  --region us-west1 \
  --project umhbackend \
  --allow-unauthenticated

echo -e "${COLOR_GREEN}Deployment completed successfully!${COLOR_RESET}"
