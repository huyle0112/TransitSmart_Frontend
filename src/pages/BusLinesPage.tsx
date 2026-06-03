import { useState } from 'react';
import BusRouteSearch from '@/components/BusRouteSearch';
import BusRouteDetail from '@/components/BusRouteDetail';
import TransitTips from '@/components/TransitTips';
import ReviewSection from '@/components/ReviewSection';
import { BusFront } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function BusLinesPage() {
  const [selectedRoute, setSelectedRoute] = useState<any>(null);
  const { t } = useTranslation();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center mb-8">
        <div className="p-3 bg-orange/10 rounded-full mr-4">
          <BusFront className="w-8 h-8 text-orange" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-navy">{t('lines.title')}</h1>
          <p className="text-gray-500 mt-1">{t('lines.subtitle')}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-4 self-start h-fit">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold text-navy mb-4">{t('lines.searchTitle')}</h2>
            <BusRouteSearch onSelect={setSelectedRoute} />
          </div>

          {selectedRoute && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-4 bg-orange/5 border-b border-gray-100">
                <h3 className="font-semibold text-navy">{t('lines.reviewTitle')}</h3>
                <p className="text-xs text-gray-500">{selectedRoute.name}</p>
              </div>
              <div className="p-4">
                <ReviewSection
                  targetType="route"
                  targetId={selectedRoute.sampleId}
                  title=""
                />
              </div>
            </div>
          )}

          <TransitTips />
        </div>

        <div className="lg:col-span-8">
          {selectedRoute ? (
            <BusRouteDetail routeName={selectedRoute.name} />
          ) : (
            <div className="h-[400px] flex flex-col items-center justify-center bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
              <BusFront className="w-16 h-16 text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-400">{t('lines.selectRoutePrompt')}</h3>
              <p className="text-sm text-gray-400 mt-1">{t('lines.searchPlaceholderPrompt')}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

