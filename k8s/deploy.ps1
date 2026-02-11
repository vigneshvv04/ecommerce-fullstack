# Kubernetes Cluster Deployment Script for Windows PowerShell

Write-Host "========================================" -ForegroundColor Yellow
Write-Host "Kubernetes Cluster Deployment" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Yellow
Write-Host ""

# Docker images are pre-configured from GitHub Actions
$DOCKER_USERNAME = "vigneshvijayakumarnagarro"
Write-Host "Using Docker username: $DOCKER_USERNAME" -ForegroundColor Green
Write-Host ""

# Create namespaces
Write-Host "Creating namespaces..." -ForegroundColor Yellow
kubectl apply -f k8s/namespaces/namespaces.yaml
Write-Host "✓ Namespaces created" -ForegroundColor Green
Write-Host ""

# Apply backend secrets and configmaps
Write-Host "Creating backend secrets and configurations..." -ForegroundColor Yellow
kubectl apply -f k8s/secrets/backend-secrets.yaml
kubectl apply -f k8s/secrets/backend-configmap.yaml
Write-Host "✓ Backend secrets and ConfigMaps created" -ForegroundColor Green
Write-Host ""

# Deploy backend services
Write-Host "Deploying backend services..." -ForegroundColor Yellow
kubectl apply -f k8s/backend/backend-services.yaml
Write-Host "✓ Backend services deployed" -ForegroundColor Green
Write-Host ""

# Deploy network policies
Write-Host "Applying network policies..." -ForegroundColor Yellow
kubectl apply -f k8s/backend/network-policies.yaml
Write-Host "✓ Network policies applied" -ForegroundColor Green
Write-Host ""

# Deploy frontend with HPA
Write-Host "Deploying frontend application..." -ForegroundColor Yellow
kubectl apply -f k8s/frontend/frontend-deployment.yaml
kubectl apply -f k8s/frontend/frontend-hpa.yaml
Write-Host "✓ Frontend deployed with HPA" -ForegroundColor Green
Write-Host ""

# Wait for deployments to be ready
Write-Host "Waiting for deployments to be ready..." -ForegroundColor Yellow
kubectl rollout status deployment/frontend -n frontend --timeout=5m
kubectl rollout status deployment/api-gateway -n backend --timeout=5m
Write-Host "✓ Deployments are ready" -ForegroundColor Green
Write-Host ""

# Display service information
Write-Host "========================================" -ForegroundColor Yellow
Write-Host "Deployment Summary" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Yellow
Write-Host ""

Write-Host "Frontend Services (External Access):" -ForegroundColor Green
kubectl get svc -n frontend

Write-Host "`nBackend Services (Internal Only):" -ForegroundColor Green
kubectl get svc -n backend

Write-Host "`nFrontend Deployments & HPA:" -ForegroundColor Green
kubectl get deployment,hpa -n frontend

Write-Host "`nBackend Deployments:" -ForegroundColor Green
kubectl get deployment -n backend

Write-Host "`nTo access the frontend:" -ForegroundColor Yellow
$FRONTEND_IP = kubectl get svc frontend -n frontend -o jsonpath='{.status.loadBalancer.ingress[0].ip}' 2>$null
if ($FRONTEND_IP -and $FRONTEND_IP -ne "") {
  Write-Host "Frontend URL: http://$FRONTEND_IP" -ForegroundColor Green
} else {
  Write-Host "Frontend LoadBalancer IP: PENDING" -ForegroundColor Yellow
  Write-Host "Check with: kubectl get svc -n frontend" -ForegroundColor Yellow
}

Write-Host "`nTo monitor HPA scaling:" -ForegroundColor Yellow
Write-Host "kubectl get hpa -n frontend --watch" -ForegroundColor Green

Write-Host "`nTo view logs:" -ForegroundColor Yellow
Write-Host "kubectl logs -f deployment/frontend -n frontend" -ForegroundColor Green
Write-Host "kubectl logs -f deployment/api-gateway -n backend" -ForegroundColor Green

Write-Host "`n✓ Deployment complete!" -ForegroundColor Green
Write-Host ""
