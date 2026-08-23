import { CloudArchitecturePage } from "@/components/architecture/cloud-architecture-page";

export default function Page() {
  return (
    <CloudArchitecturePage
      title="Kubernetes + Cloudflare"
      description="Fronting a cluster's Ingress with Cloudflare's edge for public services, or removing public exposure entirely with an in-cluster Tunnel connector."
      modelId="kubernetes"
      scenarioSlug="kubernetes-application"
    />
  );
}
