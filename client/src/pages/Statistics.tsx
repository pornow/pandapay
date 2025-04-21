import StatisticsSection from "@/components/StatisticsSection";

const Statistics = () => {
  return (
    <>
      <div className="py-12 bg-gradient-to-br from-primary/5 to-accent/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 text-center">Статистика проекта</h2>
        </div>
      </div>
      <StatisticsSection />
    </>
  );
};

export default Statistics;
