import React from 'react';
import { Card, CardContent } from "@/components/ui/card";

export default function StatsCard({ title, value, icon: Icon, color, subtitle }) {
  const colorClasses = {
    red: 'from-red-500 to-red-600',
    green: 'from-green-500 to-green-600',
    yellow: 'from-yellow-500 to-yellow-600',
    blue: 'from-blue-500 to-blue-600',
    purple: 'from-purple-500 to-purple-600'
  };

  return (
    <Card className="overflow-hidden group hover:shadow-xl transition-all duration-300 bg-white/90 backdrop-blur-sm border-0">
      <CardContent className="p-0">
        <div className={`bg-gradient-to-br ${colorClasses[color]} p-4`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/80 text-sm">{title}</p>
              <p className="text-3xl font-bold text-white mt-1">{value}</p>
              {subtitle && <p className="text-white/70 text-xs mt-1">{subtitle}</p>}
            </div>
            <div className="bg-white/20 p-3 rounded-xl group-hover:scale-110 transition-transform">
              <Icon className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}