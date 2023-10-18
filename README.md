# iac-pulumi

InfraStructureasCode-Pulumi

# iac-pulumi

Pulumi- Iaas

## Assignment 4

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
