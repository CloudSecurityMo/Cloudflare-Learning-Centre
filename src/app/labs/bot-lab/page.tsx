import { BotLab } from "@/components/labs/bot-lab";

export default function BotLabPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight">Bot Detection Lab</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Work through a scraping scenario and reason about the trade-offs of each possible response.
        </p>
      </div>
      <BotLab />
    </div>
  );
}
