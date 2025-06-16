// PromoCompetition.tsx
// Page for Promotion and Competitor Analysis using Yummy/RetailBot
import React from 'react';
import { YummyPromotionPanel } from '../components/yummy/YummyPromotionPanel';
import { YummyCompetitorPanel } from '../components/yummy/YummyCompetitorPanel';

const PromoCompetition: React.FC = () => (
  <div className="space-y-12">
    <YummyPromotionPanel />
    <YummyCompetitorPanel />
  </div>
);

export default PromoCompetition;
