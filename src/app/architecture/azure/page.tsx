import { CloudArchitecturePage } from "@/components/architecture/cloud-architecture-page";

export default function Page() {
  return (
    <CloudArchitecturePage
      title="Azure + Cloudflare"
      description="Fronting an Application Gateway-based Azure workload with Cloudflare's edge — DNS flow, TLS, NSG hardening, and single-source-of-truth WAF policy."
      modelId="azure"
      scenarioSlug="azure-hosted-application"
    />
  );
}
