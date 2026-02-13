Go to AWS cloud shell and execute following commands

1) Download Kubectl

curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"

sudo install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl

2) Install the eksctl command-line tool

create a eksctl.sh file

paste the content present in eksctl.sh

Give required access to those script by executing following commands

chmod +x eksctl.sh

sudo sh eksctl.sh

3) Create EKS Cluster

eksctl create cluster --name my-eks-cluster --region us-east-1 --nodegroup-name my-nodegroup --node-type t2.small --nodes 3 --nodes-min 1 --nodes-max 5 --managed

------------- To test this locally using minikube --------------------


1) minikube start
2) kubectl apply -f deployment.yml
