import { notFound } from "next/navigation";
import { LEARN_TOPICS, getLearnTopic } from "@/content/learn";
import { TopicPage } from "@/components/learn/topic-page";

export function generateStaticParams() {
  return LEARN_TOPICS.map((t) => ({ slug: t.slug }));
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const topic = getLearnTopic(slug);
  if (!topic) notFound();
  return <TopicPage topic={topic} />;
}
