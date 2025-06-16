import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Play, SkipForward, Volume2, VolumeX } from 'lucide-react';

interface WalkthroughStep {
  id: string;
  title: string;
  content: string;
  target: string;
  placement: 'top' | 'bottom' | 'left' | 'right' | 'center';
  backdrop?: boolean;
  highlight_class?: string;
  voice_text?: string;
}

interface WalkthroughConfig {
  tour_id: string;
  title: string;
  description: string;
  theme: string;
  auto_start: boolean;
  show_progress: boolean;
  show_navigation: boolean;
  backdrop: boolean;
  spotlight_radius: number;
  steps: WalkthroughStep[];
  keyboard_navigation: {
    enabled: boolean;
    next_key: string;
    prev_key: string;
    skip_key: string;
  };
  customization: {
    primary_color: string;
    accent_color: string;
    background_color: string;
    text_color: string;
    border_radius: string;
  };
}

interface InteractiveWalkthroughProps {
  tourConfig?: string;
  highlightElements?: boolean;
  showTooltips?: boolean;
  enableSpotlight?: boolean;
  voiceNarration?: boolean;
  className?: string;
}

export const InteractiveWalkthrough: React.FC<InteractiveWalkthroughProps> = ({
  tourConfig = 'ai/walkthrough_config.json',
  highlightElements = true,
  showTooltips = true,
  enableSpotlight = true,
  voiceNarration = true,
  className = ''
}) => {
  const [config, setConfig] = useState<WalkthroughConfig | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load walkthrough configuration
  useEffect(() => {
    loadWalkthroughConfig();
  }, [tourConfig]);

  // Keyboard navigation
  useEffect(() => {
    if (!isActive || !config?.keyboard_navigation.enabled) return;

    const handleKeyPress = (event: KeyboardEvent) => {
      switch (event.key) {
        case config.keyboard_navigation.next_key:
          nextStep();
          break;
        case config.keyboard_navigation.prev_key:
          prevStep();
          break;
        case config.keyboard_navigation.skip_key:
          endWalkthrough();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isActive, config, currentStep]);

  // Voice narration
  useEffect(() => {
    if (voiceEnabled && voiceNarration && config && isActive) {
      const currentStepData = config.steps[currentStep];
      if (currentStepData?.voice_text) {
        speakText(currentStepData.voice_text);
      }
    }
  }, [currentStep, voiceEnabled, isActive, config, voiceNarration]);

  const loadWalkthroughConfig = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/${tourConfig}`);
      if (!response.ok) {
        throw new Error(`Failed to load walkthrough config: ${response.statusText}`);
      }
      
      const configData = await response.json();
      setConfig(configData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load walkthrough config');
      // Fallback to demo config
      setConfig(createDemoConfig());
    } finally {
      setLoading(false);
    }
  };

  const createDemoConfig = (): WalkthroughConfig => ({
    tour_id: 'scout_demo_walkthrough',
    title: 'Scout Analytics Demo Tour',
    description: 'Quick introduction to the main features',
    theme: 'tbwa',
    auto_start: false,
    show_progress: true,
    show_navigation: true,
    backdrop: true,
    spotlight_radius: 10,
    steps: [
      {
        id: 'welcome',
        title: '🎓 Welcome to Scout Analytics',
        content: 'Welcome to your interactive walkthrough! Learn to navigate Philippine FMCG retail intelligence.',
        target: 'body',
        placement: 'center',
        backdrop: true,
        voice_text: 'Welcome to Scout Analytics! Let me show you around.'
      },
      {
        id: 'sidebar',
        title: '📊 Navigation Sidebar',
        content: 'Use this sidebar to navigate between different dashboard sections.',
        target: '.tbwa-sidebar',
        placement: 'right',
        highlight_class: 'ring-4 ring-tbwa-navy',
        voice_text: 'This sidebar helps you navigate between dashboard sections.'
      },
      {
        id: 'filters',
        title: '🎯 Global Filters',
        content: 'Filter your data by date, region, brand, or category for targeted insights.',
        target: '.filter-bar',
        placement: 'bottom',
        highlight_class: 'ring-4 ring-tbwa-yellow',
        voice_text: 'Use filters to focus on specific data segments.'
      }
    ],
    keyboard_navigation: {
      enabled: true,
      next_key: 'ArrowRight',
      prev_key: 'ArrowLeft',
      skip_key: 'Escape'
    },
    customization: {
      primary_color: '#003865',
      accent_color: '#FFC72C',
      background_color: '#F9FAFB',
      text_color: '#1A1A1A',
      border_radius: '0.75rem'
    }
  });

  const speakText = (text: string) => {
    if (!voiceNarration || !window.speechSynthesis) return;

    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
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

  const startWalkthrough = () => {
    setIsActive(true);
    setCurrentStep(0);
  };

  const endWalkthrough = () => {
    setIsActive(false);
    setCurrentStep(0);
    stopSpeaking();
    removeHighlights();
  };

  const nextStep = () => {
    if (!config) return;
    
    if (currentStep < config.steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      endWalkthrough();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const removeHighlights = () => {
    // Remove any existing highlight classes
    document.querySelectorAll('[class*="ring-"]').forEach(el => {
      el.classList.remove(...Array.from(el.classList).filter(c => c.startsWith('ring-')));
    });
  };

  const highlightElement = (step: WalkthroughStep) => {
    if (!highlightElements) return;

    removeHighlights();
    
    try {
      const targetElement = document.querySelector(step.target);
      if (targetElement && step.highlight_class) {
        targetElement.classList.add(...step.highlight_class.split(' '));
      }
    } catch (error) {
      console.warn(`Could not highlight element: ${step.target}`);
    }
  };

  const getTooltipPosition = (step: WalkthroughStep) => {
    const baseClasses = 'absolute z-50 max-w-sm bg-white rounded-lg shadow-xl border border-gray-200 p-4';
    
    switch (step.placement) {
      case 'top':
        return `${baseClasses} bottom-full mb-2 left-1/2 transform -translate-x-1/2`;
      case 'bottom':
        return `${baseClasses} top-full mt-2 left-1/2 transform -translate-x-1/2`;
      case 'left':
        return `${baseClasses} right-full mr-2 top-1/2 transform -translate-y-1/2`;
      case 'right':
        return `${baseClasses} left-full ml-2 top-1/2 transform -translate-y-1/2`;
      case 'center':
        return `${baseClasses} top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2`;
      default:
        return baseClasses;
    }
  };

  // Apply highlighting when step changes
  useEffect(() => {
    if (isActive && config) {
      const currentStepData = config.steps[currentStep];
      if (currentStepData) {
        highlightElement(currentStepData);
      }
    }
    
    return () => {
      if (!isActive) {
        removeHighlights();
      }
    };
  }, [currentStep, isActive, config, highlightElements]);

  if (loading) {
    return (
      <div className={`tbwa-chart-card flex items-center justify-center ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-gray-600 text-sm">Loading walkthrough...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`tbwa-chart-card ${className}`}>
        <div className="text-center text-red-600">
          <p className="mb-2 text-sm">⚠️ {error}</p>
          <button 
            onClick={loadWalkthroughConfig}
            className="tbwa-btn-primary text-sm"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!config) return null;

  const currentStepData = config.steps[currentStep];
  const progressPercentage = ((currentStep + 1) / config.steps.length) * 100;

  return (
    <div className={className}>
      {/* Control Panel */}
      {!isActive && (
        <div className="tbwa-chart-card text-center">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-primary mb-2">{config.title}</h3>
            <p className="text-gray-600 text-sm">{config.description}</p>
          </div>
          
          <div className="flex items-center justify-center space-x-3">
            <button
              onClick={startWalkthrough}
              className="tbwa-btn-primary flex items-center space-x-2"
            >
              <Play className="w-4 h-4" />
              <span>Start Walkthrough</span>
            </button>
            
            {voiceNarration && (
              <button
                onClick={() => setVoiceEnabled(!voiceEnabled)}
                className={`p-2 rounded-lg transition-colors ${
                  voiceEnabled ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600'
                }`}
                title="Toggle voice narration"
              >
                {voiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Walkthrough Overlay */}
      {isActive && (
        <>
          {/* Backdrop */}
          {config.backdrop && (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-40" />
          )}

          {/* Tooltip/Step Content */}
          {currentStepData && showTooltips && (
            <div className={getTooltipPosition(currentStepData)}>
              <div className="flex items-start justify-between mb-3">
                <h4 className="font-semibold text-primary">{currentStepData.title}</h4>
                <button
                  onClick={endWalkthrough}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              <p className="text-gray-700 text-sm mb-4 leading-relaxed">
                {currentStepData.content}
              </p>

              {/* Progress Bar */}
              {config.show_progress && (
                <div className="mb-4">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Step {currentStep + 1} of {config.steps.length}</span>
                    <span>{Math.round(progressPercentage)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1">
                    <div 
                      className="bg-primary h-1 rounded-full transition-all duration-300"
                      style={{ width: `${progressPercentage}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Navigation */}
              {config.show_navigation && (
                <div className="flex items-center justify-between">
                  <button
                    onClick={prevStep}
                    disabled={currentStep === 0}
                    className="flex items-center space-x-1 px-3 py-1 text-sm rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Back</span>
                  </button>

                  <div className="flex items-center space-x-2">
                    {voiceNarration && (
                      <button
                        onClick={() => setVoiceEnabled(!voiceEnabled)}
                        className={`p-1 rounded transition-colors ${
                          voiceEnabled ? 'text-primary' : 'text-gray-400'
                        }`}
                        title="Toggle voice"
                      >
                        {voiceEnabled ? <Volume2 className="w-3 h-3" /> : <VolumeX className="w-3 h-3" />}
                      </button>
                    )}
                    
                    <button
                      onClick={endWalkthrough}
                      className="flex items-center space-x-1 px-2 py-1 text-xs text-gray-500 hover:text-gray-700 transition-colors"
                    >
                      <SkipForward className="w-3 h-3" />
                      <span>Skip</span>
                    </button>
                  </div>

                  <button
                    onClick={nextStep}
                    className="flex items-center space-x-1 px-3 py-1 text-sm bg-primary text-white rounded hover:bg-primary/90 transition-colors"
                  >
                    <span>{currentStep === config.steps.length - 1 ? 'Finish' : 'Next'}</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};