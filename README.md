# PrivyLens
Privacy-Preserving Analytics Dashboard 
Deliver actionable user insights without ever exposing individual data. This project combines differential privacy with a cloud-native stack to ensure mathematically guaranteed privacy.

Key features:

Real-time ingestion via AWS Kinesis or API Gateway, persisting raw events to S3

Differential privacy engine that applies calibrated Laplace noise and tracks per-tenant ε budgets in DynamoDB

Secure compute layer on AWS Fargate/Lambda, with KMS-encrypted storage and audit logging via CloudTrail

Next.js dashboard showing noisy aggregates, confidence intervals, and remaining privacy budget

Monitoring & alerts through CloudWatch for usage patterns, budget exhaustion, and system health


#DEPLOYING SOON!
