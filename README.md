# iac-pulumi

InfraStructureasCode-Pulumi

# iac-pulumi

Pulumi- Iaas

## Assignment

- In this assignment we are setting up the AWS infrastructure using Pulumi.

# We are doing the below activities with the help of Pulumi

- Create Virtual Private Cloud (VPC).

- Create subnets in your VPC. You must create 3 public subnets and 3 private subnets, each in a different availability zone in the same region in the same VPC.

- Create an Internet Gateway resource and attach the Internet Gateway to the VPC.

- Create a public route table. Attach all public subnets created to the route table.

- Create a private route table. Attach all private subnets created to the route table.

- Create a public route in the public route table created above with the destination CIDR block 0.0.0.0/0 and the internet gateway

- Created Security Group -allowing incoming traffic on port 8080, 80,443,22 for Ipv4 and Ipv6 address.
  Outbound rule all traffic for Ipv4 and Ipv6.
  -Security Group is attached the Non defualt VPC created, the same security group is attached to EC2 instances created from Input AMI ID

- Created 3 Security Groups Application Load Balancer Security Group(ALBSG), Application Security Group(ASG), Database Security Group(DSG)
  ALBSG

ingress rules
port 80,443 --> All traffic
egress rules
all traffic http and https.

ASG
ingress rules
port 22 from SSH, Custom TCP port for Application 8080 source of traffic is ALBSG.

eggress rules
all traffic http and https.

DSG
ingress rules
port 5432 source is ASG

No egress rules

We have Load Balancer, Listener , Target Group and Autoscaling group to handle the Scaling up and down of application instances.
LoadBalancer listener listens on 80 for all HTTP requests and directs the incoming requests based on Target Group.
All the Ec2 instances are created from Launch template.

Infra For Assignment Submission #09.
In order to send Notification to assignment submitter , we built SNS which would be a trigger for Lambda Function to trigger notification mails using MailGun.
The assignment submission are being stored in stored in GCP bucket(Infra built using Pulumi) and notification emails data are being stored in AWS-DynamoDB(Iac-Pulumi)

## Switch to specific member account

`export AWS_PROFILE=dev`

`pulumi stack select dev`

`export AWS_PROFILE=demo`

`pulumi stack select demo`

## To start the infrastructure

`pulumi up`

## To destroy the infrastructure

`pulumi destroy`

- A proper .gitignore is created for ignoring node & vscode related build and config files which are not necessary to be checked in to the version control.

- When we run this application using the pulumi up command, it will create AWS infrastrcuture automatically from our code.

- To verify the Infrastructure we can goto AWS console and check the VPC, Subnets, Internet gateway

- Also, branch protection rule is added in the upstream repo where unless all the workflows run successfully, it doesn't allow the Pull Request to merge to the main branch.

- Command to import the SSL certificate in AWS Certificate manager demo account 

aws acm import-certificate --profile=demo --certificate file:///Users/ajitpatil/Desktop/ThirdSemester/CSYE6225-Network\ Structures\ \&\ Cloud\ Compt/Assignment\ 10/demo_ajitpatil_me/demo_ajitpatil_me64.crt --certificate-chain file:///Users/ajitpatil/Desktop/ThirdSemester/CSYE6225-Network\ Structures\ \&\ Cloud\ Compt/Assignment\ 10/demo_ajitpatil_me/demo_ajitpatil_me64.ca-bundle --private-key file:///Users/ajitpatil/Desktop/ThirdSemester/CSYE6225-Network\ Structures\ \&\ Cloud\ Compt/Assignment\ 10/demo_ajitpatil_me/private64.key