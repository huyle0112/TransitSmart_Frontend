import { useState } from 'react';
import NearbyStops from '@/components/NearbyStops';
import ReviewSection from '@/components/ReviewSection';
import { MapPin } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function StopsPage() {
  const { t } = useTranslation();
  const [selectedStop, setSelectedStop] = useState<any>(null);

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-orange/10 rounded-full">
          <MapPin className="h-6 w-6 text-orange" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-navy">{t('stopsPage.title')}</h1>
          <p className="text-gray-500 text-sm">{t('stopsPage.subtitle')}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <NearbyStops onSelectStop={setSelectedStop} />

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 h-fit">
          {!selectedStop ? (
            <p className="text-gray-500 text-center py-10">
              {t('stopsPage.selectStopToReview')}
            </p>
          ) : (
            <>
              <div className="mb-4">
                <p className="text-sm font-semibold text-orange uppercase tracking-wider">{t('stopsPage.reviewing')}</p>
                <h2 className="text-xl font-bold text-navy">{selectedStop.name}</h2>
                <p className="text-sm text-gray-500">{selectedStop.distanceText} · {Math.round(selectedStop.walkingDuration)} {t('stops.minutesWalk')}</p>
              </div>
              <ReviewSection
                targetType="stop"
                targetId={selectedStop.id}
                title={t('stopsPage.reviewStatusTitle')}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
