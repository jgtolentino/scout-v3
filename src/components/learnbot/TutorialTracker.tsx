import React, { useState, useEffect } from 'react';
import { Trophy, Star, Target, CheckCircle, Clock, Award } from 'lucide-react';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  unlocked: boolean;
  progress?: number;
  maxProgress?: number;
}

interface TutorialTrackerProps {
  linkedTo?: string;
  showCompletionPercentage?: boolean;
  showStepIndicators?: boolean;
  achievementsEnabled?: boolean;
  className?: string;
}

export const TutorialTracker: React.FC<TutorialTrackerProps> = ({
  linkedTo = 'learnbot_panel',
  showCompletionPercentage = true,
  showStepIndicators = true,
  achievementsEnabled = true,
  className = ''
}) => {
  const [completionPercentage, setCompletionPercentage] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [totalSteps, setTotalSteps] = useState(0);
  const [timeSpent, setTimeSpent] = useState(0);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [startTime] = useState(Date.now());

  // Track time spent
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeSpent(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime]);

  // Initialize achievements
  useEffect(() => {
    if (achievementsEnabled) {
      setAchievements([
        {
          id: 'first_step',
          title: 'Getting Started',
          description: 'Complete your first tutorial step',
          icon: <Star className="w-5 h-5" />,
          unlocked: false
        },
        {
          id: 'explorer',
          title: 'Explorer',
          description: 'Navigate to all dashboard sections',
          icon: <Target className="w-5 h-5" />,
          unlocked: false,
          progress: 0,
          maxProgress: 6
        },
        {
          id: 'filter_master',
          title: 'Filter Master',
          description: 'Use all filter types in combination',
          icon: <Trophy className="w-5 h-5" />,
          unlocked: false,
          progress: 0,
          maxProgress: 5
        },
        {
          id: 'ai_conversationalist',
          title: 'AI Conversationalist',
          description: 'Chat with both Yummy and Scout AI assistants',
          icon: <Award className="w-5 h-5" />,
          unlocked: false,
          progress: 0,
          maxProgress: 2
        },
        {
          id: 'speed_learner',
          title: 'Speed Learner',
          description: 'Complete tutorial in under 10 minutes',
          icon: <Clock className="w-5 h-5" />,
          unlocked: false
        },
        {
          id: 'completionist',
          title: 'Completionist',
          description: 'Finish the entire tutorial',
          icon: <CheckCircle className="w-5 h-5" />,
          unlocked: false
        }
      ]);
    }
  }, [achievementsEnabled]);

  // Simulate tutorial progress (in real implementation, this would connect to LearnBotPanel)
  useEffect(() => {
    // Demo progression for the tracker
    const demoInterval = setInterval(() => {
      setCurrentStep(prev => {
        const next = Math.min(prev + 1, 8);
        setTotalSteps(8);
        setCompletionPercentage((next / 8) * 100);
        
        // Check for achievements
        checkAchievements(next);
        
        return next;
      });
    }, 3000);

    return () => clearInterval(demoInterval);
  }, []);

  const checkAchievements = (step: number) => {
    setAchievements(prev => prev.map(achievement => {
      switch (achievement.id) {
        case 'first_step':
          return { ...achievement, unlocked: step >= 1 };
        case 'explorer':
          return { 
            ...achievement, 
            progress: Math.min(step, achievement.maxProgress || 0),
            unlocked: step >= (achievement.maxProgress || 0)
          };
        case 'filter_master':
          return { 
            ...achievement, 
            progress: Math.min(Math.floor(step * 0.6), achievement.maxProgress || 0),
            unlocked: step >= 6
          };
        case 'ai_conversationalist':
          return { 
            ...achievement, 
            progress: step >= 4 ? 2 : step >= 3 ? 1 : 0,
            unlocked: step >= 4
          };
        case 'speed_learner':
          return { ...achievement, unlocked: step >= 8 && timeSpent < 600 };
        case 'completionist':
          return { ...achievement, unlocked: step >= 8 };
        default:
          return achievement;
      }
    }));
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getStepStatus = (stepIndex: number): 'completed' | 'current' | 'upcoming' => {
    if (stepIndex < currentStep) return 'completed';
    if (stepIndex === currentStep) return 'current';
    return 'upcoming';
  };

  const unlockedAchievements = achievements.filter(a => a.unlocked);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Progress Overview */}
      {showCompletionPercentage && (
        <div className="tbwa-kpi-card">
          <div className="text-center">
            <div className="text-3xl font-bold text-primary mb-2">
              {Math.round(completionPercentage)}%
            </div>
            <div className="text-sm text-gray-600 mb-3">Tutorial Progress</div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-primary to-accent h-3 rounded-full transition-all duration-500"
                style={{ width: `${completionPercentage}%` }}
              ></div>
            </div>
            <div className="mt-3 text-xs text-gray-500">
              Step {currentStep} of {totalSteps}
            </div>
          </div>
        </div>
      )}

      {/* Step Indicators */}
      {showStepIndicators && totalSteps > 0 && (
        <div className="tbwa-chart-card">
          <h4 className="font-medium text-gray-900 mb-3">Tutorial Steps</h4>
          <div className="space-y-2">
            {Array.from({ length: totalSteps }, (_, index) => {
              const status = getStepStatus(index);
              return (
                <div key={index} className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${
                    status === 'completed' ? 'bg-green-500' :
                    status === 'current' ? 'bg-primary animate-pulse' :
                    'bg-gray-300'
                  }`} />
                  <span className={`text-sm ${
                    status === 'completed' ? 'text-green-600 line-through' :
                    status === 'current' ? 'text-primary font-medium' :
                    'text-gray-500'
                  }`}>
                    Step {index + 1}
                    {status === 'completed' && <CheckCircle className="w-4 h-4 inline ml-2" />}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Time Tracking */}
      <div className="tbwa-chart-card">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Clock className="w-5 h-5 text-gray-500" />
            <span className="text-sm text-gray-600">Time Spent</span>
          </div>
          <span className="text-lg font-semibold text-primary">
            {formatTime(timeSpent)}
          </span>
        </div>
      </div>

      {/* Achievements */}
      {achievementsEnabled && (
        <div className="tbwa-chart-card">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-medium text-gray-900">Achievements</h4>
            <div className="tbwa-badge">
              {unlockedAchievements.length} / {achievements.length}
            </div>
          </div>
          
          <div className="space-y-3">
            {achievements.map((achievement) => (
              <div
                key={achievement.id}
                className={`flex items-center space-x-3 p-3 rounded-lg border transition-colors ${
                  achievement.unlocked
                    ? 'bg-green-50 border-green-200'
                    : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className={`${
                  achievement.unlocked ? 'text-green-600' : 'text-gray-400'
                }`}>
                  {achievement.icon}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className={`text-sm font-medium ${
                    achievement.unlocked ? 'text-green-800' : 'text-gray-700'
                  }`}>
                    {achievement.title}
                  </div>
                  <div className={`text-xs ${
                    achievement.unlocked ? 'text-green-600' : 'text-gray-500'
                  }`}>
                    {achievement.description}
                  </div>
                  
                  {achievement.maxProgress && (
                    <div className="mt-1">
                      <div className="w-full bg-gray-200 rounded-full h-1">
                        <div 
                          className={`h-1 rounded-full transition-all duration-300 ${
                            achievement.unlocked ? 'bg-green-500' : 'bg-blue-500'
                          }`}
                          style={{ 
                            width: `${((achievement.progress || 0) / achievement.maxProgress) * 100}%` 
                          }}
                        ></div>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {achievement.progress || 0} / {achievement.maxProgress}
                      </div>
                    </div>
                  )}
                </div>
                
                {achievement.unlocked && (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Stats */}
      <div className="tbwa-chart-card">
        <h4 className="font-medium text-gray-900 mb-3">Learning Stats</h4>
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-primary">
              {unlockedAchievements.length}
            </div>
            <div className="text-xs text-gray-600">Achievements</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-accent">
              {currentStep}
            </div>
            <div className="text-xs text-gray-600">Steps Completed</div>
          </div>
        </div>
      </div>

      {/* Motivational Messages */}
      <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg p-4 border border-primary/20">
        <div className="text-center">
          {completionPercentage === 0 && (
            <div>
              <div className="text-lg">🚀</div>
              <div className="text-sm font-medium text-primary">Ready to start learning?</div>
            </div>
          )}
          {completionPercentage > 0 && completionPercentage < 50 && (
            <div>
              <div className="text-lg">📚</div>
              <div className="text-sm font-medium text-primary">Great progress! Keep learning!</div>
            </div>
          )}
          {completionPercentage >= 50 && completionPercentage < 100 && (
            <div>
              <div className="text-lg">⭐</div>
              <div className="text-sm font-medium text-primary">You're more than halfway there!</div>
            </div>
          )}
          {completionPercentage === 100 && (
            <div>
              <div className="text-lg">🎉</div>
              <div className="text-sm font-medium text-primary">Congratulations! Tutorial complete!</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};