import { useQuery } from "@tanstack/react-query";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface StatsData {
  totalAmount: number;
  totalCount: number;
  averageAmount: number;
  weeklyStats: Array<{
    id: number;
    date: string;
    totalAmount: number;
    count: number;
  }>;
}

const formatCurrency = (amount: number) => {
  // Format kopecks to rubles
  const rubles = amount / 100;
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 0,
  }).format(rubles);
};

const days = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];

const StatisticsSection = () => {
  const { data: stats, isLoading, error } = useQuery<StatsData>({
    queryKey: ['/api/stats'],
  });

  // Prepare weekly chart data
  const chartData = stats?.weeklyStats.map(day => ({
    name: days[new Date(day.date).getDay()],
    amount: day.totalAmount / 100, // Convert kopecks to rubles
  })) || [];

  return (
    <section id="stats" className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Статистика проекта</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Здесь вы можете увидеть, сколько людей уже присоединились к нашему доброму делу.
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          <Card>
            <CardContent className="p-6 text-center">
              {isLoading ? (
                <Skeleton className="h-10 w-32 mb-2 mx-auto" />
              ) : (
                <p className="text-4xl font-bold text-primary mb-2">
                  {formatCurrency(stats?.totalAmount || 0)}
                </p>
              )}
              <p className="text-gray-600">Общая сумма донатов</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 text-center">
              {isLoading ? (
                <Skeleton className="h-10 w-24 mb-2 mx-auto" />
              ) : (
                <p className="text-4xl font-bold text-secondary mb-2">
                  {stats?.totalCount || 0}
                </p>
              )}
              <p className="text-gray-600">Всего донатов</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 text-center">
              {isLoading ? (
                <Skeleton className="h-10 w-20 mb-2 mx-auto" />
              ) : (
                <p className="text-4xl font-bold text-accent mb-2">
                  {formatCurrency(stats?.averageAmount || 0)}
                </p>
              )}
              <p className="text-gray-600">Средняя сумма доната</p>
            </CardContent>
          </Card>
        </div>
        
        <Card className="mt-12">
          <CardContent className="p-6">
            <h3 className="text-xl font-semibold mb-6 text-center">Недельная статистика</h3>
            {isLoading ? (
              <div className="h-64 flex items-center justify-center">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[200px]" />
                  <Skeleton className="h-4 w-[200px]" />
                </div>
              </div>
            ) : (
              <div className="h-64 px-6" id="chart-container">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={chartData}
                    margin={{
                      top: 20,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value) => [`${value} ₽`, 'Сумма']}
                      labelFormatter={(name) => `День: ${name}`}
                    />
                    <Bar dataKey="amount" fill="hsl(var(--primary))" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default StatisticsSection;
