#!/usr/bin/env bash
# Cross-platform Kubernetes Deployment Script

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}========================================${NC}"
echo -e "${YELLOW}Kubernetes Cluster Deployment${NC}"
echo -e "${YELLOW}========================================${NC}\n"

# Docker images are pre-configured
DOCKER_USERNAME="vigneshvijayakumarnagarro"
echo -e "${GREEN}✓ Docker images configured: $DOCKER_USERNAME${NC}\n"

# Create namespaces
echo -e "${YELLOW}Creating namespaces...${NC}"
kubectl apply -f k8s/namespaces/namespaces.yaml
echo -e "${GREEN}✓ Namespaces created${NC}\n"

# Apply backend secrets and configmaps
echo -e "${YELLOW}Creating backend secrets and configurations...${NC}"
kubectl apply -f k8s/secrets/backend-secrets.yaml
kubectl apply -f k8s/secrets/backend-configmap.yaml
echo -e "${GREEN}✓ Backend secrets and ConfigMaps created${NC}\n"

# Deploy backend services
echo -e "${YELLOW}Deploying backend services...${NC}"
kubectl apply -f k8s/backend/backend-services.yaml
echo -e "${GREEN}✓ Backend services deployed${NC}\n"

# Deploy network policies
echo -e "${YELLOW}Applying network policies...${NC}"
kubectl apply -f k8s/backend/network-policies.yaml
echo -e "${GREEN}✓ Network policies applied${NC}\n"

# Deploy frontend with HPA
echo -e "${YELLOW}Deploying frontend application...${NC}"
kubectl apply -f k8s/frontend/frontend-deployment.yaml
kubectl apply -f k8s/frontend/frontend-hpa.yaml
echo -e "${GREEN}✓ Frontend deployed with HPA${NC}\n"

# Wait for deployments to be ready
echo -e "${YELLOW}Waiting for deployments to be ready...${NC}"
kubectl rollout status deployment/frontend -n frontend --timeout=5m
kubectl rollout status deployment/api-gateway -n backend --timeout=5m
echo -e "${GREEN}✓ Deployments are ready${NC}\n"

# Display service information
echo -e "${YELLOW}========================================${NC}"
echo -e "${YELLOW}Deployment Summary${NC}"
echo -e "${YELLOW}========================================${NC}\n"

echo -e "${GREEN}Frontend Services (External Access):${NC}"
kubectl get svc -n frontend

echo -e "\n${GREEN}Backend Services (Internal Only):${NC}"
kubectl get svc -n backend

echo -e "\n${GREEN}Frontend Deployments & HPA:${NC}"
kubectl get deployment,hpa -n frontend

echo -e "\n${GREEN}Backend Deployments:${NC}"
kubectl get deployment -n backend

echo -e "\n${YELLOW}To access the frontend:${NC}"
FRONTEND_IP=$(kubectl get svc frontend -n frontend -o jsonpath='{.status.loadBalancer.ingress[0].ip}' 2>/dev/null || echo "PENDING")
if [ "$FRONTEND_IP" != "PENDING" ] && [ ! -z "$FRONTEND_IP" ]; then
  echo -e "${GREEN}Frontend URL: http://${FRONTEND_IP}${NC}"
else
  echo -e "${YELLOW}Frontend LoadBalancer IP: PENDING${NC}"
  echo -e "${YELLOW}Check with: kubectl get svc -n frontend${NC}"
fi

echo -e "\n${YELLOW}To monitor HPA scaling:${NC}"
echo -e "${GREEN}kubectl get hpa -n frontend --watch${NC}"

echo -e "\n${YELLOW}To view logs:${NC}"
echo -e "${GREEN}kubectl logs -f deployment/frontend -n frontend${NC}"
echo -e "${GREEN}kubectl logs -f deployment/api-gateway -n backend${NC}"

echo -e "\n${GREEN}✓ Deployment complete!${NC}\n"
