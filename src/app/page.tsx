import { Footer } from "@/components/site/footer";
import { Hero } from "@/components/site/hero";
import { Navbar } from "@/components/site/navbar";
import { Compare, Cta, Faq, MemoSpec, Pipeline, Privacy, Safety, Stats } from "@/components/site/sections";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Stats />
        <Pipeline />
        <MemoSpec />
        <Privacy />
        <Compare />
        <Safety />
        <Faq />
        <Cta />
      </main>
      <Footer />
    </>
  );
}
