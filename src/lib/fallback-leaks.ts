/**
 * Verified 30-leak offline catalog.
 *
 * This dataset is the resilience backbone of CloudTrim AI: whenever
 * PostgreSQL is unreachable, the whole console renders from this catalog.
 * Every `wasteScore` is computed live from raw metrics via the WasteScore
 * formula in `waste-score.ts` — no hand-typed scores.
 */

import { computeWasteScore } from "./waste-score";
import type {
  CloudLeak,
  LeakCategory,
  Provider,
  RiskLevel,
  WasteMetrics,
} from "./types";

export const CATALOG_VERSION = "2026.02-r1";

interface RawLeak {
  id: string;
  resourceName: string;
  provider: Provider;
  region: string;
  service: string;
  category: LeakCategory;
  monthlyWasteUsd: number;
  detectionReason: string;
  riskLevel: RiskLevel;
  firstSeenAt: string;
  metrics: WasteMetrics;
  tf: string;
  cli: string;
}

const RAW: RawLeak[] = [
  // ─── 1. COMPUTE WASTE ────────────────────────────────────────────────
  {
    id: "ec2-m5-2xlarge-idle-us-east-1",
    resourceName: "i-0f3a9c21e77d2b40c",
    provider: "aws",
    region: "us-east-1",
    service: "EC2",
    category: "compute",
    monthlyWasteUsd: 42_800,
    detectionReason:
      "m5.2xlarge at 1.8% avg CPU for 10 straight days; 500 GB gp3 root volume never read",
    riskLevel: "safe_to_terminate",
    firstSeenAt: "2026-01-18T04:12:00.000Z",
    metrics: { idleCpuHours: 240, orphanGb: 500, egressCostMonthly: 45, overprovisionedRamGb: 0, zeroIoDays: 0, environment: "dev" },
    tf: `# i-0f3a9c21e77d2b40c — CPU < 3% for 10 days
removed {
  from = aws_instance.dev_app_worker
}
resource "aws_instance" "dev_app_worker" {
  count = 0 # replaced by a spot fleet sized to real traffic
}`,
    cli: `aws ec2 terminate-instances --instance-ids i-0f3a9c21e77d2b40c --region us-east-1`,
  },
  {
    id: "ec2-dev-bastion-zombie-us-west-2",
    resourceName: "i-077d21aab4c9e8f12",
    provider: "aws",
    region: "us-west-2",
    service: "EC2",
    category: "compute",
    monthlyWasteUsd: 9_600,
    detectionReason:
      "Zombie bastion host: 0 SSH sessions and zero network I/O for 15 days",
    riskLevel: "safe_to_terminate",
    firstSeenAt: "2026-01-25T11:40:00.000Z",
    metrics: { idleCpuHours: 96, orphanGb: 0, egressCostMonthly: 0, overprovisionedRamGb: 0, zeroIoDays: 15, environment: "dev" },
    tf: `# i-077d21aab4c9e8f12 — 0 SSH sessions in 15 days
resource "aws_instance" "dev_bastion" {
  count = 0 # SSM Session Manager already covers this account
}`,
    cli: `aws ec2 terminate-instances --instance-ids i-077d21aab4c9e8f12 --region us-west-2`,
  },
  {
    id: "eks-nodegroup-overprovisioned-eu-west-1",
    resourceName: "eks-workers-legacy-6x-m5xl",
    provider: "aws",
    region: "eu-west-1",
    service: "EKS",
    category: "compute",
    monthlyWasteUsd: 61_000,
    detectionReason:
      "6× m5.xlarge workers at 4% CPU watermark; 128 GB RAM never touched",
    riskLevel: "production_review",
    firstSeenAt: "2026-01-12T09:00:00.000Z",
    metrics: { idleCpuHours: 72, orphanGb: 0, egressCostMonthly: 90, overprovisionedRamGb: 128, zeroIoDays: 0, environment: "staging" },
    tf: `# eks-workers-legacy — CPU watermark stuck under 4%
resource "aws_eks_node_group" "workers" {
  scaling_config {
    desired_size = 2 # was 6
    min_size     = 1
    max_size     = 3
  }
  instance_types = ["m6i.large"] # right-sized from m5.xlarge
}`,
    cli: `aws eks update-nodegroup-config --cluster-name prod-legacy --nodegroup-name workers --scaling-config minSize=1,maxSize=3,desiredSize=2`,
  },
  {
    id: "lambda-provisioned-concurrency-stale",
    resourceName: "fn-report-generator:live",
    provider: "aws",
    region: "us-east-1",
    service: "Lambda",
    category: "compute",
    monthlyWasteUsd: 18_700,
    detectionReason:
      "Provisioned concurrency holding 40 warm slots; 0 invocations in 11 days",
    riskLevel: "safe_to_terminate",
    firstSeenAt: "2026-01-29T15:22:00.000Z",
    metrics: { idleCpuHours: 168, orphanGb: 0, egressCostMonthly: 20, overprovisionedRamGb: 32, zeroIoDays: 0, environment: "dev" },
    tf: `# fn-report-generator — 0 invocations in 11 days
resource "aws_lambda_provisioned_concurrency_config" "report_generator" {
  count = 0 # drop to on-demand; cold starts acceptable for reports
}`,
    cli: `aws lambda delete-provisioned-concurrency-config --function-name report-generator --qualifier live --region us-east-1`,
  },
  {
    id: "gke-nodepool-idle-asia-south1",
    resourceName: "gke-analytics-pool-7f2c",
    provider: "gcp",
    region: "asia-south1",
    service: "GKE",
    category: "compute",
    monthlyWasteUsd: 34_200,
    detectionReason:
      "n2-standard-8 pool idles at 2% CPU outside demo hours; 96 GB RAM unused",
    riskLevel: "needs_snapshot",
    firstSeenAt: "2026-01-21T07:55:00.000Z",
    metrics: { idleCpuHours: 200, orphanGb: 0, egressCostMonthly: 60, overprovisionedRamGb: 96, zeroIoDays: 0, environment: "staging" },
    tf: `# gke-analytics-pool-7f2c — idle outside demo hours
resource "google_container_node_pool" "analytics" {
  autoscaling {
    min_node_count = 0 # let the autoscaler drain the pool nightly
    max_node_count = 3
  }
}`,
    cli: `gcloud container node-pools update analytics-pool --cluster analytics-gke --zone asia-south1-a --enable-autoscaling --min-nodes 0 --max-nodes 3`,
  },
  {
    id: "azure-vm-d4s-v5-idle-centralus",
    resourceName: "vm-loadtest-runner-04",
    provider: "azure",
    region: "centralus",
    service: "VM",
    category: "compute",
    monthlyWasteUsd: 28_900,
    detectionReason:
      "Load-test VM running 24/7 since last sprint; zero I/O for 14 days",
    riskLevel: "needs_snapshot",
    firstSeenAt: "2026-01-16T18:03:00.000Z",
    metrics: { idleCpuHours: 120, orphanGb: 200, egressCostMonthly: 0, overprovisionedRamGb: 0, zeroIoDays: 14, environment: "staging" },
    tf: `# vm-loadtest-runner-04 — zero I/O for 14 days
resource "azurerm_dev_test_global_vm_shutdown_schedule" "loadtest" {
  virtual_machine_id    = azurerm_linux_virtual_machine.loadtest_runner.id
  daily_recurrence_time = "1900"
  timezone              = "UTC"
  enabled               = true
}`,
    cli: `az vm deallocate --resource-group rg-loadtest --name vm-loadtest-runner-04`,
  },
  {
    id: "ec2-gpu-p3-nightly-idle-us-west-2",
    resourceName: "i-0c91fe77a3d5b8201",
    provider: "aws",
    region: "us-west-2",
    service: "EC2",
    category: "compute",
    monthlyWasteUsd: 93_400,
    detectionReason:
      "p3.2xlarge GPU box burning $1.29/hr for 14 nights with no training jobs",
    riskLevel: "production_review",
    firstSeenAt: "2026-01-08T02:31:00.000Z",
    metrics: { idleCpuHours: 336, orphanGb: 400, egressCostMonthly: 240, overprovisionedRamGb: 0, zeroIoDays: 15, environment: "staging" },
    tf: `# i-0c91fe77a3d5b8201 — GPU idle 14 consecutive nights
resource "aws_instance" "gpu_trainer" {
  count = 0 # move training to spot + checkpointed jobs
}`,
    cli: `aws ec2 stop-instances --instance-ids i-0c91fe77a3d5b8201 --region us-west-2`,
  },

  // ─── 2. STORAGE LEAKS ────────────────────────────────────────────────
  {
    id: "ebs-gp3-unattached-500gb",
    resourceName: "vol-092bc311",
    provider: "aws",
    region: "ap-south-1",
    service: "EBS",
    category: "storage",
    monthlyWasteUsd: 6_200,
    detectionReason:
      "500 GB gp3 volume unattached for 30 days; last write a month ago",
    riskLevel: "needs_snapshot",
    firstSeenAt: "2026-01-05T22:14:00.000Z",
    metrics: { idleCpuHours: 0, orphanGb: 500, egressCostMonthly: 90, overprovisionedRamGb: 0, zeroIoDays: 30, environment: "dev" },
    tf: `# vol-092bc311 — unattached 30 days
resource "aws_ebs_snapshot" "vol_092bc311_archive" {
  volume_id = "vol-092bc311"
  tags      = { SnapshotReason = "cloudtrim-pre-delete" }
}
resource "aws_ebs_volume" "orphan_500gb" {
  count = 0 # snapshot kept above, volume deleted
}`,
    cli: `aws ec2 delete-volume --volume-id vol-092bc311 --region ap-south-1`,
  },
  {
    id: "ebs-io2-orphaned-legacy-eu-central-1",
    resourceName: "vol-0e44aa09f7b21cd33",
    provider: "aws",
    region: "eu-central-1",
    service: "EBS",
    category: "storage",
    monthlyWasteUsd: 21_400,
    detectionReason:
      "io2 block-express volume (700 GB) orphaned after migration; $0.125/GB-mo",
    riskLevel: "needs_snapshot",
    firstSeenAt: "2026-01-03T13:47:00.000Z",
    metrics: { idleCpuHours: 0, orphanGb: 700, egressCostMonthly: 150, overprovisionedRamGb: 0, zeroIoDays: 16, environment: "legacy" },
    tf: `# vol-0e44aa09f7b21cd33 — orphaned io2 after migration
resource "aws_ebs_volume" "legacy_io2" {
  count = 0 # 700 GB at premium io2 pricing; snapshot then delete
}`,
    cli: `aws ec2 create-snapshot --volume-id vol-0e44aa09f7b21cd33 --tag-specifications ResourceType=snapshot,Tags=[{Key=keep,Value=30d}] && aws ec2 delete-volume --volume-id vol-0e44aa09f7b21cd33 --region eu-central-1`,
  },
  {
    id: "s3-versioning-bloat-logs-us-east-1",
    resourceName: "logs-platform-raw-archive",
    provider: "aws",
    region: "us-east-1",
    service: "S3",
    category: "storage",
    monthlyWasteUsd: 15_800,
    detectionReason:
      "Versioning keeps 11 copies of immutable log objects; no lifecycle rule",
    riskLevel: "safe_to_terminate",
    firstSeenAt: "2026-01-10T16:26:00.000Z",
    metrics: { idleCpuHours: 0, orphanGb: 800, egressCostMonthly: 210, overprovisionedRamGb: 0, zeroIoDays: 18, environment: "dev" },
    tf: `# logs-platform-raw-archive — 11 noncurrent versions per object
resource "aws_s3_bucket_lifecycle_configuration" "raw_logs" {
  bucket = "logs-platform-raw-archive"
  rule {
    id     = "expire-noncurrent-versions"
    status = "Enabled"
    noncurrent_version_expiration { noncurrent_days = 30 }
  }
}`,
    cli: `aws s3api put-bucket-lifecycle-configuration --bucket logs-platform-raw-archive --lifecycle-configuration '{"Rules":[{"ID":"trim-versions","Status":"Enabled","NoncurrentVersionExpiration":{"NoncurrentDays":30}}]}'`,
  },
  {
    id: "orphaned-ebs-snapshots-12tb",
    resourceName: "snap-0f11a2b3c4d5e6f78 (x412)",
    provider: "aws",
    region: "us-east-1",
    service: "EBS",
    category: "storage",
    monthlyWasteUsd: 61_400,
    detectionReason:
      "412 orphaned snapshots (12 TB) older than 90 days; source volumes gone",
    riskLevel: "safe_to_terminate",
    firstSeenAt: "2025-12-28T10:05:00.000Z",
    metrics: { idleCpuHours: 0, orphanGb: 12_000, egressCostMonthly: 120, overprovisionedRamGb: 0, zeroIoDays: 45, environment: "legacy" },
    tf: `# 412 orphaned snapshots — source volumes deleted long ago
resource "aws_ebs_snapshot" "legacy" {
  count = 0 # 12 TB at $0.05/GB-mo; archive tier not needed
}`,
    cli: `aws ec2 describe-snapshots --owner-ids self --filters Name=tag:keep,Values=false --query Snapshots[].SnapshotId --output text | xargs -n1 aws ec2 delete-snapshot --snapshot-id`,
  },
  {
    id: "gcp-pd-unattached-2tb",
    resourceName: "pd-staging-disk-0419",
    provider: "gcp",
    region: "asia-south1",
    service: "Persistent Disk",
    category: "storage",
    monthlyWasteUsd: 17_000,
    detectionReason:
      "2 TB pd-balanced disk unattached for 21 days after VM deletion",
    riskLevel: "needs_snapshot",
    firstSeenAt: "2026-01-14T08:38:00.000Z",
    metrics: { idleCpuHours: 0, orphanGb: 900, egressCostMonthly: 75, overprovisionedRamGb: 0, zeroIoDays: 21, environment: "staging" },
    tf: `# pd-staging-disk-0419 — unattached 21 days
resource "google_compute_disk" "staging_0419" {
  count = 0 # image exported to GCS archive before deletion
}`,
    cli: `gcloud compute disks delete pd-staging-disk-0419 --zone asia-south1-a --quiet`,
  },
  {
    id: "azure-disk-orphaned-premium-westeurope",
    resourceName: "disk-aks-nodecache-07",
    provider: "azure",
    region: "westeurope",
    service: "Disk",
    category: "storage",
    monthlyWasteUsd: 13_800,
    detectionReason:
      "Premium SSD (P30) unattached for 19 days after AKS node pool scale-in",
    riskLevel: "safe_to_terminate",
    firstSeenAt: "2026-01-17T12:52:00.000Z",
    metrics: { idleCpuHours: 0, orphanGb: 600, egressCostMonthly: 105, overprovisionedRamGb: 0, zeroIoDays: 19, environment: "staging" },
    tf: `# disk-aks-nodecache-07 — orphaned premium SSD
resource "azurerm_managed_disk" "aks_nodecache_07" {
  count = 0 # node cache disk; no data classification concerns
}`,
    cli: `az disk delete --resource-group rg-aks-westeurope --name disk-aks-nodecache-07 --yes`,
  },
  {
    id: "s3-glacier-misclassified-eu-west-1",
    resourceName: "archive-ci-artifacts",
    provider: "aws",
    region: "eu-west-1",
    service: "S3",
    category: "storage",
    monthlyWasteUsd: 9_600,
    detectionReason:
      "Cold CI artifacts sit in STANDARD; zero reads in 25 days — belongs in Glacier",
    riskLevel: "safe_to_terminate",
    firstSeenAt: "2026-01-11T19:20:00.000Z",
    metrics: { idleCpuHours: 0, orphanGb: 450, egressCostMonthly: 180, overprovisionedRamGb: 0, zeroIoDays: 25, environment: "legacy" },
    tf: `# archive-ci-artifacts — STANDARD storage, 0 reads in 25 days
resource "aws_s3_bucket_lifecycle_configuration" "ci_artifacts" {
  bucket = "archive-ci-artifacts"
  rule {
    id     = "move-to-glacier"
    status = "Enabled"
    transition { days = 7   storage_class = "GLACIER" }
    expiration { days = 120 }
  }
}`,
    cli: `aws s3api put-bucket-lifecycle-configuration --bucket archive-ci-artifacts --lifecycle-configuration '{"Rules":[{"ID":"glacier-tier","Status":"Enabled","Transitions":[{"Days":7,"StorageClass":"GLACIER"}],"Expiration":{"Days":120}}]}'`,
  },

  // ─── 3. NETWORKING DRAIN ─────────────────────────────────────────────
  {
    id: "nat-gateway-us-east-1-idle",
    resourceName: "nat-0a81f3e7",
    provider: "aws",
    region: "us-east-1",
    service: "NAT Gateway",
    category: "networking",
    monthlyWasteUsd: 34_800,
    detectionReason:
      "NAT gateway routed 0 bytes in 16 days while billing $0.045/hr + processing",
    riskLevel: "production_review",
    firstSeenAt: "2026-01-07T05:59:00.000Z",
    metrics: { idleCpuHours: 72, orphanGb: 0, egressCostMonthly: 348, overprovisionedRamGb: 0, zeroIoDays: 16, environment: "staging" },
    tf: `# nat-0a81f3e7 — 0 bytes routed in 16 days
resource "aws_nat_gateway" "us_east_1a" {
  count = 0 # private subnets re-routed via S3 VPC endpoint
}
resource "aws_route" "private_to_s3" {
  gateway_id = aws_vpc_endpoint.s3.id
}`,
    cli: `aws ec2 delete-nat-gateway --nat-gateway-id nat-0a81f3e7 --region us-east-1`,
  },
  {
    id: "nat-gateway-eu-west-1-underutilized",
    resourceName: "nat-0b44c9d2",
    provider: "aws",
    region: "eu-west-1",
    service: "NAT Gateway",
    category: "networking",
    monthlyWasteUsd: 29_200,
    detectionReason:
      "Second NAT in eu-west-1 carries 0.4% of traffic; consolidate on nat-0c11",
    riskLevel: "production_review",
    firstSeenAt: "2026-01-19T14:11:00.000Z",
    metrics: { idleCpuHours: 24, orphanGb: 0, egressCostMonthly: 290, overprovisionedRamGb: 0, zeroIoDays: 14, environment: "staging" },
    tf: `# nat-0b44c9d2 — 0.4% traffic share
resource "aws_nat_gateway" "eu_west_1c" {
  count = 0 # consolidate on the surviving NAT; saves $292/mo
}`,
    cli: `aws ec2 delete-nat-gateway --nat-gateway-id nat-0b44c9d2 --region eu-west-1`,
  },
  {
    id: "elastic-ip-unattached-trio-us-east-1",
    resourceName: "eipalloc-0f3d9a71 (+2)",
    provider: "aws",
    region: "us-east-1",
    service: "Elastic IP",
    category: "networking",
    monthlyWasteUsd: 2_700,
    detectionReason:
      "3 unattached Elastic IPs billing idle-hour rates; zero I/O for 21 days",
    riskLevel: "safe_to_terminate",
    firstSeenAt: "2026-01-23T03:44:00.000Z",
    metrics: { idleCpuHours: 96, orphanGb: 0, egressCostMonthly: 15, overprovisionedRamGb: 0, zeroIoDays: 21, environment: "legacy" },
    tf: `# 3 unattached EIPs — billing since instances died
resource "aws_eip" "legacy_release" {
  count = 0 # release all three allocations
}`,
    cli: `aws ec2 release-address --allocation-id eipalloc-0f3d9a71 --region us-east-1`,
  },
  {
    id: "cross-region-vpc-peering-loop",
    resourceName: "pcx-0a1b2c3d",
    provider: "aws",
    region: "us-east-1",
    service: "VPC Peering",
    category: "networking",
    monthlyWasteUsd: 41_200,
    detectionReason:
      "Misrouted service mesh loops 412 GB/mo across regions; fleets idle-waiting",
    riskLevel: "production_review",
    firstSeenAt: "2026-01-09T20:36:00.000Z",
    metrics: { idleCpuHours: 60, orphanGb: 0, egressCostMonthly: 412, overprovisionedRamGb: 0, zeroIoDays: 15, environment: "staging" },
    tf: `# pcx-0a1b2c3d — looping cross-region mesh traffic
resource "aws_vpc_peering_connection" "hub_loop" {
  count = 0 # replace with regional endpoints; routes pinned below
}`,
    cli: `aws ec2 delete-vpc-peering-connection --vpc-peering-connection-id pcx-0a1b2c3d --region us-east-1`,
  },
  {
    id: "cross-az-data-transfer-eks",
    resourceName: "vpc-0f9e8d7c / etl ↔ s3",
    provider: "aws",
    region: "us-west-2",
    service: "Data Transfer",
    category: "networking",
    monthlyWasteUsd: 23_300,
    detectionReason:
      "ETL pods in az-b pull 233 GB/mo from S3 gateway in az-a; idle-between-jobs",
    riskLevel: "safe_to_terminate",
    firstSeenAt: "2026-01-15T06:18:00.000Z",
    metrics: { idleCpuHours: 72, orphanGb: 0, egressCostMonthly: 233, overprovisionedRamGb: 0, zeroIoDays: 0, environment: "staging" },
    tf: `# vpc-0f9e8d7c — cross-AZ chatter between ETL and S3
resource "aws_eks_node_group" "etl" {
  subnet_ids = [aws_subnet.az_a.id] # pin workloads next to the data
}`,
    cli: `aws eks update-nodegroup-config --cluster-name prod-core --nodegroup-name etl --subnets subnet-0a1f2b3c`,
  },
  {
    id: "gcp-cloud-nat-idle-europe-west1",
    resourceName: "nat-gw-staging-01",
    provider: "gcp",
    region: "europe-west1",
    service: "Cloud NAT",
    category: "networking",
    monthlyWasteUsd: 8_900,
    detectionReason:
      "Cloud NAT port allocations idle 17 days; staging uses Private Google Access",
    riskLevel: "safe_to_terminate",
    firstSeenAt: "2026-01-20T17:29:00.000Z",
    metrics: { idleCpuHours: 48, orphanGb: 0, egressCostMonthly: 89, overprovisionedRamGb: 0, zeroIoDays: 17, environment: "staging" },
    tf: `# nat-gw-staging-01 — no egress for 17 days
resource "google_compute_router_nat" "staging" {
  count = 0 # Private Google Access already covers staging
}`,
    cli: `gcloud compute routers nats delete nat-gw-staging-01 --router router-staging --region europe-west1 --quiet`,
  },

  // ─── 4. DATABASE & CACHE WASTE ───────────────────────────────────────
  {
    id: "rds-postgres-dev-replica",
    resourceName: "appdb-dev-replica-01",
    provider: "aws",
    region: "ap-south-1",
    service: "RDS",
    category: "database",
    monthlyWasteUsd: 21_400,
    detectionReason:
      "0 active connections for 14 days, bleeding $214/month",
    riskLevel: "safe_to_terminate",
    firstSeenAt: "2026-01-06T09:47:00.000Z",
    metrics: { idleCpuHours: 0, orphanGb: 250, egressCostMonthly: 60, overprovisionedRamGb: 96, zeroIoDays: 14, environment: "dev" },
    tf: `# appdb-dev-replica-01 — 0 connections for 14 days
resource "aws_db_instance" "appdb_dev_replica" {
  count = 0 # dev read replica nobody queries
}`,
    cli: `aws rds delete-db-instance --db-instance-identifier appdb-dev-replica-01 --skip-final-snapshot --region ap-south-1`,
  },
  {
    id: "rds-mysql-multi-az-overprovisioned",
    resourceName: "orders-db-mirror",
    provider: "aws",
    region: "eu-west-1",
    service: "RDS",
    category: "database",
    monthlyWasteUsd: 56_800,
    detectionReason:
      "db.r5.4xlarge mirror at 4% RAM watermark with Multi-AZ on a dev schema",
    riskLevel: "production_review",
    firstSeenAt: "2026-01-04T21:08:00.000Z",
    metrics: { idleCpuHours: 168, orphanGb: 0, egressCostMonthly: 120, overprovisionedRamGb: 256, zeroIoDays: 0, environment: "staging" },
    tf: `# orders-db-mirror — db.r5.4xlarge at 4% RAM watermark
resource "aws_db_instance" "orders_mirror" {
  instance_class = "db.r6g.large" # right-sized
  multi_az       = false          # dev mirror needs no Multi-AZ
}`,
    cli: `aws rds modify-db-instance --db-instance-identifier orders-db-mirror --db-instance-class db.r6g.large --no-multi-az --apply-immediately`,
  },
  {
    id: "elasticache-redis-idle-cluster",
    resourceName: "cache-sessions-redis-001",
    provider: "aws",
    region: "us-east-1",
    service: "ElastiCache",
    category: "database",
    monthlyWasteUsd: 18_600,
    detectionReason:
      "cache.r6g.large with 0 gets/sets for 15 days; sessions moved to JWT",
    riskLevel: "safe_to_terminate",
    firstSeenAt: "2026-01-13T11:33:00.000Z",
    metrics: { idleCpuHours: 120, orphanGb: 0, egressCostMonthly: 0, overprovisionedRamGb: 128, zeroIoDays: 15, environment: "dev" },
    tf: `# cache-sessions-redis-001 — 0 gets/sets for 15 days
resource "aws_elasticache_cluster" "sessions" {
  count = 0 # sessions now stateless JWTs
}`,
    cli: `aws elasticache delete-cache-cluster --cache-cluster-id cache-sessions-redis-001 --region us-east-1`,
  },
  {
    id: "dynamodb-unindexed-gsi-table",
    resourceName: "events-firehose-v2",
    provider: "aws",
    region: "us-east-1",
    service: "DynamoDB",
    category: "database",
    monthlyWasteUsd: 14_200,
    detectionReason:
      "Provisioned WCU feeding a GSI with 0 useful reads in 20 days",
    riskLevel: "production_review",
    firstSeenAt: "2026-01-22T08:51:00.000Z",
    metrics: { idleCpuHours: 36, orphanGb: 0, egressCostMonthly: 210, overprovisionedRamGb: 0, zeroIoDays: 20, environment: "staging" },
    tf: `# events-firehose-v2 — dead GSI write throughput
resource "aws_dynamodb_table" "events_firehose" {
  billing_mode = "PAY_PER_REQUEST"
  attribute    { name = "userId" type = "S" }
  global_secondary_index {
    name            = "by-user"
    hash_key        = "userId"
    projection_type = "ALL"
  }
}`,
    cli: `aws dynamodb update-table --table-name events-firehose-v2 --billing-mode PAY_PER_REQUEST`,
  },
  {
    id: "gcp-cloudsql-staging-idle",
    resourceName: "sql-staging-orders-9d1",
    provider: "gcp",
    region: "asia-south1",
    service: "Cloud SQL",
    category: "database",
    monthlyWasteUsd: 24_600,
    detectionReason:
      "8 vCPU / 30 GB Cloud SQL with 0 connections for 12 days",
    riskLevel: "needs_snapshot",
    firstSeenAt: "2026-01-02T15:57:00.000Z",
    metrics: { idleCpuHours: 190, orphanGb: 0, egressCostMonthly: 45, overprovisionedRamGb: 96, zeroIoDays: 0, environment: "staging" },
    tf: `# sql-staging-orders-9d1 — 0 connections for 12 days
resource "google_sql_database_instance" "staging_orders" {
  count = 0 # export dumped to GCS before teardown
}`,
    cli: `gcloud sql instances delete sql-staging-orders-9d1 --quiet`,
  },

  // ─── 5. SERVERLESS & AI DRIFT ────────────────────────────────────────
  {
    id: "sagemaker-endpoint-stale-forecast",
    resourceName: "endpoint-forecast-prod-v1",
    provider: "aws",
    region: "us-east-1",
    service: "SageMaker",
    category: "serverless-ai",
    monthlyWasteUsd: 73_000,
    detectionReason:
      "ml.m5.xlarge endpoint v1 superseded by v3; 0 invocations in 12 days",
    riskLevel: "safe_to_terminate",
    firstSeenAt: "2026-01-01T00:41:00.000Z",
    metrics: { idleCpuHours: 400, orphanGb: 500, egressCostMonthly: 240, overprovisionedRamGb: 128, zeroIoDays: 12, environment: "staging" },
    tf: `# endpoint-forecast-prod-v1 — superseded, 0 invocations
resource "aws_sagemaker_endpoint" "forecast_v1" {
  count = 0
}
resource "aws_sagemaker_endpoint_configuration" "forecast_v1" {
  count = 0
}`,
    cli: `aws sagemaker delete-endpoint --endpoint-name endpoint-forecast-prod-v1 --region us-east-1`,
  },
  {
    id: "ecs-fargate-task-abandoned-batch",
    resourceName: "svc-nightly-etl-old",
    provider: "aws",
    region: "eu-west-1",
    service: "ECS Fargate",
    category: "serverless-ai",
    monthlyWasteUsd: 26_700,
    detectionReason:
      "Abandoned Fargate service looping on dead queue; zero I/O for 16 days",
    riskLevel: "safe_to_terminate",
    firstSeenAt: "2026-01-05T19:15:00.000Z",
    metrics: { idleCpuHours: 240, orphanGb: 0, egressCostMonthly: 30, overprovisionedRamGb: 0, zeroIoDays: 16, environment: "legacy" },
    tf: `# svc-nightly-etl-old — replacement ships via Step Functions
resource "aws_ecs_service" "nightly_etl_old" {
  desired_count = 0
}`,
    cli: `aws ecs update-service --cluster batch-core --service svc-nightly-etl-old --desired-count 0`,
  },
  {
    id: "cloudwatch-log-group-unpurged",
    resourceName: "/aws/lambda/legacy-checkout",
    provider: "aws",
    region: "us-east-1",
    service: "CloudWatch",
    category: "serverless-ai",
    monthlyWasteUsd: 17_300,
    detectionReason:
      "1.8 TB of cold lambda logs with retention = never; 0 queries in 22 days",
    riskLevel: "safe_to_terminate",
    firstSeenAt: "2025-12-30T14:02:00.000Z",
    metrics: { idleCpuHours: 0, orphanGb: 1_800, egressCostMonthly: 105, overprovisionedRamGb: 0, zeroIoDays: 22, environment: "legacy" },
    tf: `# /aws/lambda/legacy-checkout — retention "never"
resource "aws_cloudwatch_log_group" "legacy_checkout" {
  name              = "/aws/lambda/legacy-checkout"
  retention_in_days = 14
}`,
    cli: `aws logs put-retention-policy --log-group-name /aws/lambda/legacy-checkout --retention-in-days 14`,
  },
  {
    id: "azure-function-premium-idle-southindia",
    resourceName: "func-billing-webhook-old",
    provider: "azure",
    region: "southindia",
    service: "Functions",
    category: "serverless-ai",
    monthlyWasteUsd: 11_800,
    detectionReason:
      "Premium EP1 plan always-warm for a deprecated webhook; zero I/O for 14 days",
    riskLevel: "safe_to_terminate",
    firstSeenAt: "2026-01-24T10:26:00.000Z",
    metrics: { idleCpuHours: 168, orphanGb: 0, egressCostMonthly: 0, overprovisionedRamGb: 32, zeroIoDays: 14, environment: "legacy" },
    tf: `# func-billing-webhook-old — deprecated webhook on EP1
resource "azurerm_service_plan" "billing_webhook" {
  sku_name = "Y1" # consumption tier; or delete the app entirely
}`,
    cli: `az functionapp delete --resource-group rg-billing-southindia --name func-billing-webhook-old`,
  },
  {
    id: "sagemaker-notebook-running-24x7",
    resourceName: "nb-ml-exploratory-03",
    provider: "aws",
    region: "us-west-2",
    service: "SageMaker",
    category: "serverless-ai",
    monthlyWasteUsd: 31_200,
    detectionReason:
      "ml.t3.2xlarge notebook up 24/7 for 21 days; no cell executed since",
    riskLevel: "needs_snapshot",
    firstSeenAt: "2026-01-03T23:12:00.000Z",
    metrics: { idleCpuHours: 500, orphanGb: 0, egressCostMonthly: 60, overprovisionedRamGb: 64, zeroIoDays: 0, environment: "dev" },
    tf: `# nb-ml-exploratory-03 — no cell executed in 21 days
resource "aws_sagemaker_notebook_instance" "exploratory_03" {
  count = 0 # notebooks are ephemeral; store notebooks in git
}`,
    cli: `aws sagemaker stop-notebook-instance --notebook-instance-name nb-ml-exploratory-03`,
  },
];

export const FALLBACK_LEAKS: CloudLeak[] = RAW.map((r) => ({
  id: r.id,
  resourceName: r.resourceName,
  provider: r.provider,
  region: r.region,
  service: r.service,
  category: r.category,
  monthlyWasteUsd: r.monthlyWasteUsd,
  wasteScore: computeWasteScore(r.metrics),
  detectionReason: r.detectionReason,
  riskLevel: r.riskLevel,
  remediationScriptTerraform: r.tf,
  remediationScriptCli: r.cli,
  metrics: r.metrics,
  firstSeenAt: r.firstSeenAt,
}));

export function getFallbackLeak(id: string): CloudLeak | undefined {
  return FALLBACK_LEAKS.find((l) => l.id === id);
}

export const ALL_PROVIDERS: Provider[] = ["aws", "gcp", "azure"];

export function allServices(): string[] {
  return Array.from(new Set(FALLBACK_LEAKS.map((l) => l.service))).sort();
}

/** URL-safe slug for service hub routes ("NAT Gateway" -> "nat-gateway"). */
export function serviceSlug(service: string): string {
  return service
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Resolve a hub slug back to its canonical service name. */
export function serviceFromSlug(slug: string): string | null {
  for (const s of allServices()) {
    if (serviceSlug(s) === slug) return s;
  }
  return null;
}

export function providerServicePairs(): {
  provider: Provider;
  service: string;
}[] {
  const seen = new Set<string>();
  const pairs: { provider: Provider; service: string }[] = [];
  for (const l of FALLBACK_LEAKS) {
    const k = `${l.provider}/${l.service}`;
    if (!seen.has(k)) {
      seen.add(k);
      pairs.push({ provider: l.provider, service: l.service });
    }
  }
  return pairs.sort((a, b) =>
    a.provider === b.provider
      ? a.service.localeCompare(b.service)
      : a.provider.localeCompare(b.provider),
  );
}

export const CATEGORY_META: Record<
  LeakCategory,
  { label: string; blurb: string }
> = {
  compute: {
    label: "Compute Waste",
    blurb:
      "Idle EC2 & VM fleets, overprovisioned EKS/GKE workers, stale Lambda provisioned concurrency.",
  },
  storage: {
    label: "Storage Leaks",
    blurb:
      "Unattached gp3/io2 volumes, unreferenced S3 versions, orphaned snapshots bleeding monthly.",
  },
  networking: {
    label: "Networking Drain",
    blurb:
      "Idle NAT gateways, unattached Elastic IPs, cross-region peering loops and cross-AZ chatter.",
  },
  database: {
    label: "Database & Cache Waste",
    blurb:
      "Zero-connection RDS replicas, idle ElastiCache clusters, unindexed DynamoDB spend.",
  },
  "serverless-ai": {
    label: "Serverless & AI Drift",
    blurb:
      "Stale SageMaker endpoints, abandoned Fargate tasks, unpurged CloudWatch log groups.",
  },
};

export const RISK_LEVELS: RiskLevel[] = [
  "safe_to_terminate",
  "needs_snapshot",
  "production_review",
];
