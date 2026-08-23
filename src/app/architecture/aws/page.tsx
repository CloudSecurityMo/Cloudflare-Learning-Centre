import { CloudArchitecturePage } from "@/components/architecture/cloud-architecture-page";

export default function Page() {
  return (
    <CloudArchitecturePage
      title="AWS + Cloudflare"
      description="Fronting an ALB-based AWS workload with Cloudflare's edge — DNS flow, TLS, security group hardening, and where WAF responsibility should live."
      modelId="aws"
      scenarioSlug="aws-hosted-application"
    />
  );
}
