import React, { useState, useEffect } from 'react';
import Joyride, { CallBackProps, STATUS } from 'react-joyride';

interface TutorialProps {
  runTutorial: boolean;
  onTutorialComplete: () => void;
}

const Tutorial: React.FC<TutorialProps> = ({ runTutorial, onTutorialComplete }) => {
  const [steps, setSteps] = useState([
    {
      target: 'body', // Fallback target, will be updated with more specific selectors
      content: 'Welcome to your Scout Analytics Dashboard! This quick tour will show you around.',
      placement: 'center',
      disableBeacon: true,
    },
    {
      target: '#kpi_total_revenue', // Assuming IDs based on your YAML
      content: 'This is your Total Revenue KPI. You can see your overall sales performance here.',
      placement: 'bottom',
    },
    {
      target: '#chart_revenue_trend_30d', // Assuming IDs based on your YAML
      content: 'Explore your 30-Day Revenue Trend to understand sales patterns over time.',
      placement: 'right',
    },
    {
      target: '#panel_scout_ai_chat', // Assuming IDs based on your YAML
      content: 'Meet your Scout AI Retail Assistant! Click here to ask questions and get insights.',
      placement: 'left',
    },
    {
      target: '#panel_ai_insights', // Assuming IDs based on your YAML
      content: 'Here are AI-generated insights to provide quick summaries and actionable recommendations.',
      placement: 'top',
    },
    {
      target: 'nav a[href="/trends"]', // Assuming a nav link to the Trends page
      content: 'Navigate to the Market Trends page for in-depth temporal and regional analysis.',
      placement: 'right',
    },
    {
      target: 'nav a[href="/products"]', // Assuming a nav link to the Products page
      content: 'Visit Product Intelligence to analyze brand and category performance.',
      placement: 'right',
    },
    {
      target: 'nav a[href="/consumers"]', // Assuming a nav link to the Consumers page
      content: 'Discover Consumer Insights to understand your customer demographics and segments.',
      placement: 'right',
    },
    {
      target: 'body',
      content: 'You've completed the tour! Feel free to explore and interact with the Scout AI.',
      placement: 'center',
    },
  ]);

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status } = data;
    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status)) {
      onTutorialComplete();
    }
  };

  // Ensure Joyride runs only when runTutorial is true
  if (!runTutorial) {
    return null;
  }

  return (
    <Joyride
      steps={steps}
      run={runTutorial}
      continuous
      showProgress
      showSkipButton
      callback={handleJoyrideCallback}
      styles={{
        options: {
          zIndex: 10000,
        },
      }}
    />
  );
};

export default Tutorial; 