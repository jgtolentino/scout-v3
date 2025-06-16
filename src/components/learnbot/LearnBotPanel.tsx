import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Play, Pause, RotateCcw, BookOpen, Volume2, VolumeX, CheckCircle, Circle } from 'lucide-react';

interface TutorialStep {
  id: string;
  title: string;
  content: string;
  section: string;
  isComplete: boolean;
}

interface LearnBotPanelProps {
  stepsSource?: string;
  enableCodeWalkthrough?: boolean;
  enableVoiceMode?: boolean;
  tutorialTheme?: string;
  autoProgress?: boolean;
  completionTracking?: boolean;
  className?: string;
}

export const LearnBotPanel: React.FC<LearnBotPanelProps> = ({
  stepsSource = 'ai/learnbot_steps.md',
  enableCodeWalkthrough = true,
  enableVoiceMode = true,
  tutorialTheme = 'tbwa',
  autoProgress = false,
  completionTracking = true,
  className = ''
}) => {
  const [steps, setSteps] = useState<TutorialStep[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());

  // Load tutorial steps from markdown
  useEffect(() => {
    loadTutorialSteps();
  }, [stepsSource]);

  // Voice synthesis for narration
  useEffect(() => {
    if (voiceEnabled && enableVoiceMode && steps[currentStep] && isPlaying) {
      speakStep(steps[currentStep]);
    }
  }, [currentStep, voiceEnabled, isPlaying, steps, enableVoiceMode]);

  const loadTutorialSteps = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/${stepsSource}`);
      if (!response.ok) {
        throw new Error(`Failed to load tutorial: ${response.statusText}`);
      }
      
      const markdown = await response.text();
      const parsedSteps = parseMarkdownToSteps(markdown);
      setSteps(parsedSteps);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load tutorial');
      // Fallback to demo steps if loading fails
      setSteps(createDemoSteps());
    } finally {
      setLoading(false);
    }
  };

  const parseMarkdownToSteps = (markdown: string): TutorialStep[] => {
    const sections = markdown.split(/^## 🎯/gm).filter(Boolean);
    
    return sections.map((section, index) => {
      const lines = section.trim().split('\n');
      const title = lines[0]?.replace(/^[^:]*:\s*/, '') || `Step ${index + 1}`;
      const content = lines.slice(1).join('\n').trim();
      
      return {
        id: `step-${index}`,
        title,
        content,
        section: `Step ${index + 1}`,
        isComplete: false
      };
    });
  };

  const createDemoSteps = (): TutorialStep[] => [
    {
      id: 'welcome',
      title: 'Welcome to Scout Analytics',
      content: `# Welcome to Scout Analytics LearnBot 🎓

Learn to navigate Philippine FMCG retail intelligence with your AI guide!

### What you'll discover:
- Dashboard navigation and KPI interpretation
- Advanced filtering for targeted insights  
- AI chat assistants (Scout & Yummy Intelligence)
- Real-time FMCG data analysis across 17 regions`,
      section: 'Introduction',
      isComplete: false
    },
    {
      id: 'overview',
      title: 'Overview Dashboard',
      content: `# Executive Dashboard Mastery 📊

Navigate to the **Overview** page to see:

### Key Performance Indicators:
- **Total Revenue**: ₱1.2M+ from real FMCG transactions
- **Transaction Volume**: 5,000 verified retail transactions
- **Regional Coverage**: 17 Philippine regions
- **Brand Intelligence**: TBWA portfolio insights

### Pro Tips:
- Hover over KPI cards for trend indicators
- Yellow accents highlight TBWA brands
- Green ↗ arrows indicate growth`,
      section: 'Navigation',
      isComplete: false
    },
    {
      id: 'filters',
      title: 'Master the Filter System',
      content: `# Global Filter System 🎯

The filter bar is your command center for data analysis.

### Core Filters:
- **📅 Date Range**: 7d, 30d, 90d, or custom
- **🌍 Region**: NCR, CALABARZON, Visayas, Mindanao
- **🏷️ Brand**: TBWA (Oishi, Del Monte) vs competitors
- **📦 Category**: Beverages 🧃, Snacks 🍿, Dairy 🥛

### Try This:
1. Select "Last 30 days" + "NCR" + "Beverages"
2. Watch all charts update in real-time
3. Notice blue filter tags below the bar`,
      section: 'Features',
      isComplete: false
    },
    {
      id: 'ai-chat',
      title: 'AI Assistants',
      content: `# Meet Your AI Team 🤖

Two specialized agents for different analysis needs:

### 🏪 Yummy Intelligence:
- Inventory monitoring & stock alerts
- Promotion ROI analysis
- Competitive intelligence
- FMCG category optimization

### 📊 Scout Analytics:
- Revenue trends & regional analysis
- Consumer demographics & behavior
- Brand performance comparisons
- Strategic business recommendations

### Sample Questions:
*"Which TBWA brands are growing fastest in NCR?"*
*"Show me low-stock items needing reorder"*`,
      section: 'AI Features',
      isComplete: false
    }
  ];

  const speakStep = (step: TutorialStep) => {
    if (!enableVoiceMode || !window.speechSynthesis) return;

    window.speechSynthesis.cancel(); // Stop any current speech
    
    const utterance = new SpeechSynthesisUtterance(
      step.content.replace(/[#*`>]/g, '').replace(/\n+/g, '. ')
    );
    
    utterance.rate = 0.9;
    utterance.pitch = 1.0;
    utterance.volume = 0.8;
    
    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      markStepComplete(currentStep);
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const markStepComplete = (stepIndex: number) => {
    if (completionTracking && steps[stepIndex]) {
      const newCompleted = new Set(completedSteps);
      newCompleted.add(steps[stepIndex].id);
      setCompletedSteps(newCompleted);
    }
  };

  const resetTutorial = () => {
    setCurrentStep(0);
    setCompletedSteps(new Set());
    setIsPlaying(false);
    stopSpeaking();
  };

  const togglePlayPause = () => {
    if (isPlaying) {
      stopSpeaking();
    }
    setIsPlaying(!isPlaying);
  };

  const currentStepData = steps[currentStep];
  const progressPercentage = steps.length > 0 ? ((currentStep + 1) / steps.length) * 100 : 0;
  const completionPercentage = steps.length > 0 ? (completedSteps.size / steps.length) * 100 : 0;

  if (loading) {
    return (
      <div className={`tbwa-chart-card flex items-center justify-center ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading LearnBot tutorial...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`tbwa-chart-card ${className}`}>
        <div className="text-center text-red-600">
          <p className="mb-4">⚠️ {error}</p>
          <button 
            onClick={loadTutorialSteps}
            className="tbwa-btn-primary"
          >
            Retry Loading
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`tbwa-chart-card ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-primary to-accent rounded-xl flex items-center justify-center">
            <BookOpen className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-primary">LearnBot Tutorial</h3>
            <p className="text-sm text-gray-600">Interactive Scout Analytics Guide</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {enableVoiceMode && (
            <button
              onClick={() => setVoiceEnabled(!voiceEnabled)}
              className={`p-2 rounded-lg transition-colors ${
                voiceEnabled ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600'
              }`}
              title={voiceEnabled ? 'Disable voice narration' : 'Enable voice narration'}
            >
              {voiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
          )}
          
          <button
            onClick={togglePlayPause}
            className={`p-2 rounded-lg transition-colors ${
              isPlaying ? 'bg-accent text-primary' : 'bg-primary text-white'
            }`}
            title={isPlaying ? 'Pause tutorial' : 'Play tutorial'}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>
          
          <button
            onClick={resetTutorial}
            className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
            title="Restart tutorial"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Step {currentStep + 1} of {steps.length}</span>
          <span>{Math.round(progressPercentage)}% complete</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-primary to-accent h-2 rounded-full transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
      </div>

      {/* Step Content */}
      {currentStepData && (
        <div className="mb-6">
          <div className="flex items-center space-x-2 mb-3">
            {completedSteps.has(currentStepData.id) ? (
              <CheckCircle className="w-5 h-5 text-green-500" />
            ) : (
              <Circle className="w-5 h-5 text-gray-400" />
            )}
            <h4 className="text-xl font-semibold text-primary">
              {currentStepData.title}
            </h4>
          </div>
          
          <div className="prose prose-sm max-w-none">
            <div 
              className="text-gray-700 leading-relaxed"
              dangerouslySetInnerHTML={{ 
                __html: currentStepData.content
                  .replace(/#{1,6}\s*(.*)/g, '<h4 class="text-lg font-semibold text-primary mb-2">$1</h4>')
                  .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-primary">$1</strong>')
                  .replace(/\*(.*?)\*/g, '<em class="text-accent">$1</em>')
                  .replace(/`(.*?)`/g, '<code class="bg-gray-100 px-1 py-0.5 rounded text-sm">$1</code>')
                  .replace(/\n\n/g, '</p><p class="mb-3">')
                  .replace(/^(.*)$/gm, '<p class="mb-3">$1</p>')
              }}
            />
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={prevStep}
          disabled={currentStep === 0}
          className="flex items-center space-x-2 px-4 py-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Previous</span>
        </button>

        <div className="flex items-center space-x-1">
          {steps.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentStep(index)}
              className={`w-3 h-3 rounded-full transition-colors ${
                index === currentStep
                  ? 'bg-primary'
                  : completedSteps.has(steps[index]?.id)
                  ? 'bg-green-500'
                  : 'bg-gray-300'
              }`}
              title={`Go to step ${index + 1}`}
            />
          ))}
        </div>

        <button
          onClick={nextStep}
          disabled={currentStep === steps.length - 1}
          className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-primary text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors"
        >
          <span>Next</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Completion Status */}
      {completionTracking && (
        <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between text-sm">
            <span className="text-blue-700">
              Progress: {completedSteps.size} of {steps.length} steps completed
            </span>
            <span className="text-blue-600 font-medium">
              {Math.round(completionPercentage)}%
            </span>
          </div>
        </div>
      )}
    </div>
  );
};