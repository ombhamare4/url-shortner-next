import UrlShortenerForm from "@/components/url-shortener-form";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex w-full max-w-3xl flex-1 flex-col items-center justify-center gap-10 px-6 py-24 sm:px-12">
        <div className="flex flex-col items-center gap-3 text-center">
          <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
            URL Shortener
          </h1>
          <p className="max-w-md text-base text-muted-foreground">
            Paste a long URL to generate a short, shareable link.
          </p>
        </div>
        <UrlShortenerForm />
      </main>
    </div>
  );
}
