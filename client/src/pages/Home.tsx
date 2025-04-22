import Hero from "@/components/Hero";
import DonationForm from "@/components/DonationForm";
import AboutSection from "@/components/AboutSection";
import StatisticsSection from "@/components/StatisticsSection";
import TelegramBotSection from "@/components/TelegramBotSection";

const Home = () => {
  return (
    <>
      <Hero />
      <DonationForm />
      <AboutSection />
      <StatisticsSection />
      <TelegramBotSection />
    </>
  );
};

export default Home;
