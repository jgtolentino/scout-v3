import React, { useState, useEffect } from 'react';
import { Package, TrendingUp, BarChart3, Shuffle, Brain, Target, Zap } from 'lucide-react';
import { useTransactionData } from '../hooks/useTransactionData';
import { getDataProvider } from '../lib/dataProvider';

interface CategoryData {
  category: string;
  revenue: number;
  transactions: number;
  growth: number;
  margin: number;
  volume: number;
}

interface SubstitutionFlow {
  from: string;
  to: string;
  frequency: number;
  reason: string;
}

interface CulturalInsight {
  brand: string;
  colorAssociation: string[];
  generationalPattern: string;
  emotionalTriggers: string[];
  bundlingOpportunities: string[];
  marketPosition: string;
}

interface TreemapData {
  name: string;
  value: number;
  growth: number;
  color: string;
  level: number;
}

const ProductMix: React.FC = () => {
  const { kpiData, loading } = useTransactionData();
  const [categoryData, setCategoryData] = useState<CategoryData[]>([]);
  const [substitutionFlows, setSubstitutionFlows] = useState<SubstitutionFlow[]>([]);
  const [culturalInsights, setCulturalInsights] = useState<CulturalInsight[]>([]);
  const [treemapData, setTreemapData] = useState<TreemapData[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    fetchProductData();
    generateSubstitutionFlows();
    generateCulturalInsights();
  }, []);

  const fetchProductData = async () => {
    try {
      setLoadingData(true);
      const db = getDataProvider();
      
      // Fetch category performance data
      const { data, error } = await db
        .from('transactions_fmcg')
        .select(`
          total_amount,
          transaction_items_fmcg!inner(
            quantity,
            unit_price,
            products!inner(
              category,
              brand_name,
              unit_cost
            )
          )
        `);

      if (error) throw error;

      // Process category data
      const categoryMap = new Map<string, {
        revenue: number;
        transactions: number;
        volume: number;
        cost: number;
      }>();

      data?.forEach((transaction: any) => {
        transaction.transaction_items_fmcg?.forEach((item: any) => {
          const category = item.products?.category || 'Other';
          const current = categoryMap.get(category) || { 
            revenue: 0, 
            transactions: 0, 
            volume: 0, 
            cost: 0 
          };
          
          const revenue = item.quantity * item.unit_price;
          const cost = item.quantity * (item.products?.unit_cost || 0);
          
          current.revenue += revenue;
          current.transactions += 1;
          current.volume += item.quantity;
          current.cost += cost;
          
          categoryMap.set(category, current);
        });
      });

      // Convert to category data with calculations
      const categories: CategoryData[] = Array.from(categoryMap.entries())
        .map(([category, data]) => ({
          category,
          revenue: data.revenue,
          transactions: data.transactions,
          volume: data.volume,
          growth: Math.random() * 30 - 10, // Mock growth data
          margin: data.revenue > 0 ? ((data.revenue - data.cost) / data.revenue) * 100 : 0
        }))
        .sort((a, b) => b.revenue - a.revenue);

      setCategoryData(categories);

      // Generate treemap data
      const maxRevenue = Math.max(...categories.map(c => c.revenue));
      const treemap: TreemapData[] = categories.map((cat, index) => ({
        name: cat.category,
        value: cat.revenue,
        growth: cat.growth,
        color: getTreemapColor(cat.revenue, maxRevenue, cat.growth),
        level: index
      }));

      setTreemapData(treemap);
    } catch (error) {
      console.error('Error fetching product data:', error);
    } finally {
      setLoadingData(false);
    }
  };

  const generateSubstitutionFlows = async () => {
    // Generate realistic substitution patterns for FMCG
    const flows: SubstitutionFlow[] = [
      { from: 'Coca-Cola', to: 'Pepsi', frequency: 245, reason: 'Price sensitivity' },
      { from: 'Instant Noodles (Brand A)', to: 'Instant Noodles (Brand B)', frequency: 189, reason: 'Availability' },
      { from: 'Shampoo (Premium)', to: 'Shampoo (Economy)', frequency: 156, reason: 'Budget constraints' },
      { from: 'Milk (UHT)', to: 'Powdered Milk', frequency: 134, reason: 'Shelf life preference' },
      { from: 'Coffee (3-in-1)', to: 'Ground Coffee', frequency: 98, reason: 'Quality preference' },
      { from: 'Detergent (Powder)', to: 'Detergent (Liquid)', frequency: 87, reason: 'Convenience' },
      { from: 'Biscuits (Premium)', to: 'Biscuits (Regular)', frequency: 76, reason: 'Value seeking' }
    ].sort((a, b) => b.frequency - a.frequency);

    setSubstitutionFlows(flows);
  };

  const generateCulturalInsights = () => {
    const insights: CulturalInsight[] = [
      {
        brand: 'San Miguel',
        colorAssociation: ['Blue (Trust)', 'Gold (Premium)', 'White (Purity)'],
        generationalPattern: 'Strong with Gen X and Boomers, growing with Millennials',
        emotionalTriggers: ['Filipino Pride', 'Family Tradition', 'Celebration'],
        bundlingOpportunities: ['Beer + Pulutan', 'Coffee + Breakfast items'],
        marketPosition: 'Heritage leader with premium positioning'
      },
      {
        brand: 'Jollibee',
        colorAssociation: ['Red (Energy)', 'Yellow (Joy)', 'White (Cleanliness)'],
        generationalPattern: 'Universal appeal across all age groups',
        emotionalTriggers: ['Nostalgia', 'Family bonding', 'Filipino taste'],
        bundlingOpportunities: ['Burger + Fries + Drink', 'Fried Chicken + Rice'],
        marketPosition: 'Cultural icon with emotional connection'
      },
      {
        brand: 'Oishi',
        colorAssociation: ['Green (Natural)', 'Orange (Fun)', 'Yellow (Energy)'],
        generationalPattern: 'Dominates Gen Z and Millennials',
        emotionalTriggers: ['Fun', 'Sharing', 'Trendy'],
        bundlingOpportunities: ['Snacks + Beverages', 'Party packs'],
        marketPosition: 'Youthful snack innovator'
      },
      {
        brand: 'Del Monte',
        colorAssociation: ['Red (Freshness)', 'Green (Natural)', 'Yellow (Sunshine)'],
        generationalPattern: 'Trusted by Gen X and Boomers, educating younger segments',
        emotionalTriggers: ['Health', 'Family nutrition', 'Trust'],
        bundlingOpportunities: ['Fruits + Vegetables', 'Healthy meal combinations'],
        marketPosition: 'Health-focused family brand'
      },
      {
        brand: 'Nestle',
        colorAssociation: ['Blue (Trust)', 'Red (Energy)', 'White (Purity)'],
        generationalPattern: 'Strong maternal influence across generations',
        emotionalTriggers: ['Maternal care', 'Nutrition', 'Global trust'],
        bundlingOpportunities: ['Baby food + Formula', 'Coffee + Creamer'],
        marketPosition: 'Global nutrition authority'
      }
    ];

    setCulturalInsights(insights);
  };

  const getTreemapColor = (revenue: number, maxRevenue: number, growth: number) => {
    const intensity = revenue / maxRevenue;
    if (growth > 15) return '#10b981'; // High growth - green
    if (growth > 5) return '#f59e0b';  // Medium growth - yellow
    if (growth > -5) return '#6b7280'; // Stable - gray
    return '#ef4444'; // Declining - red
  };

  const getSankeyPath = (fromIndex: number, toIndex: number, width: number) => {
    const startY = fromIndex * 40 + 20;
    const endY = toIndex * 40 + 20;
    const midX = width / 2;
    
    return `M 0 ${startY} C ${midX} ${startY} ${midX} ${endY} ${width} ${endY}`;
  };

  if (loading || loadingData) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-xl p-6 text-white">
        <div className="flex items-center space-x-3">
          <Package className="h-8 w-8" />
          <div>
            <h1 className="text-2xl font-bold">Product Mix Intelligence</h1>
            <p className="text-green-100">Category performance, substitution patterns & cultural insights</p>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Categories</p>
              <p className="text-2xl font-bold text-gray-900">{categoryData.length}</p>
            </div>
            <Package className="h-8 w-8 text-green-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Top Category</p>
              <p className="text-lg font-bold text-gray-900">{categoryData[0]?.category || 'N/A'}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-blue-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Substitutions</p>
              <p className="text-2xl font-bold text-gray-900">{substitutionFlows.length}</p>
            </div>
            <Shuffle className="h-8 w-8 text-purple-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-orange-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Margin</p>
              <p className="text-2xl font-bold text-gray-900">
                {categoryData.length > 0 ? 
                  `${(categoryData.reduce((sum, c) => sum + c.margin, 0) / categoryData.length).toFixed(1)}%` 
                  : '0%'
                }
              </p>
            </div>
            <BarChart3 className="h-8 w-8 text-orange-500" />
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Category Treemap */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
            <BarChart3 className="h-5 w-5 mr-2 text-green-600" />
            Category Performance Treemap
          </h3>
          
          <div className="grid grid-cols-4 gap-2 h-64">
            {treemapData.slice(0, 12).map((item, index) => {
              const size = Math.max(1, Math.floor((item.value / treemapData[0].value) * 4));
              return (
                <div
                  key={item.name}
                  className={`rounded-lg p-3 text-white text-xs font-medium flex flex-col justify-between transition-all hover:scale-105 cursor-pointer col-span-${size}`}
                  style={{ backgroundColor: item.color }}
                  title={`${item.name}: ₱${item.value.toLocaleString()}`}
                >
                  <div className="font-semibold">{item.name}</div>
                  <div className="text-right">
                    <div>₱{(item.value / 1000).toFixed(0)}K</div>
                    <div className={`text-xs ${item.growth >= 0 ? 'text-green-200' : 'text-red-200'}`}>
                      {item.growth >= 0 ? '+' : ''}{item.growth.toFixed(1)}%
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
            <span>Size = Revenue</span>
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-green-500 rounded"></div>
                <span>High Growth</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                <span>Medium Growth</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-red-500 rounded"></div>
                <span>Declining</span>
              </div>
            </div>
          </div>
        </div>

        {/* Top Categories Table */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
            <TrendingUp className="h-5 w-5 mr-2 text-blue-600" />
            Category Rankings
          </h3>
          
          <div className="space-y-3">
            {categoryData.slice(0, 8).map((category, index) => (
              <div key={category.category} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-medium text-sm">#{index + 1}</span>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{category.category}</div>
                    <div className="text-sm text-gray-500">
                      {category.transactions} transactions • {category.margin.toFixed(1)}% margin
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-gray-900">
                    ₱{category.revenue.toLocaleString()}
                  </div>
                  <div className={`text-sm ${category.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {category.growth >= 0 ? '+' : ''}{category.growth.toFixed(1)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sankey Substitution Flow */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
          <Shuffle className="h-5 w-5 mr-2 text-purple-600" />
          Product Substitution Flow Analysis
        </h3>
        
        <div className="grid lg:grid-cols-2 gap-6">
          <div>
            <h4 className="text-md font-medium text-gray-700 mb-4">Substitution Patterns</h4>
            <div className="space-y-3">
              {substitutionFlows.slice(0, 6).map((flow, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-gray-800">{flow.from}</span>
                      <span className="text-gray-400">→</span>
                      <span className="text-sm font-medium text-gray-800">{flow.to}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-purple-600">{flow.frequency}</div>
                    <div className="text-xs text-gray-500">{flow.reason}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="text-md font-medium text-gray-700 mb-4">Flow Visualization</h4>
            <div className="relative h-64 bg-gray-50 rounded-lg p-4">
              <svg className="w-full h-full">
                {substitutionFlows.slice(0, 5).map((flow, index) => {
                  const fromY = index * 40 + 20;
                  const toY = (index + 1) * 35 + 20;
                  const strokeWidth = Math.max(2, flow.frequency / 50);
                  
                  return (
                    <g key={index}>
                      <path
                        d={getSankeyPath(index, index + 1, 300)}
                        stroke="#8b5cf6"
                        strokeWidth={strokeWidth}
                        fill="none"
                        opacity="0.6"
                      />
                      <text x="10" y={fromY + 5} className="text-xs fill-gray-700">
                        {flow.from.split(' ')[0]}
                      </text>
                      <text x="250" y={toY + 5} className="text-xs fill-gray-700">
                        {flow.to.split(' ')[0]}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Cultural AI Insights */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
          <Brain className="h-5 w-5 mr-2 text-indigo-600" />
          Cultural Intelligence & Brand Dictionary
        </h3>
        
        <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {culturalInsights.map((insight, index) => (
            <div key={index} className="border rounded-xl p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-gray-900">{insight.brand}</h4>
                <div className="text-sm text-gray-500">{insight.marketPosition}</div>
              </div>
              
              <div className="space-y-3 text-sm">
                <div>
                  <div className="flex items-center space-x-2 mb-1">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="font-medium text-gray-700">Color Psychology</span>
                  </div>
                  <div className="text-gray-600 text-xs">
                    {insight.colorAssociation.join(' • ')}
                  </div>
                </div>
                
                <div>
                  <div className="flex items-center space-x-2 mb-1">
                    <Target className="w-3 h-3 text-green-500" />
                    <span className="font-medium text-gray-700">Generation Appeal</span>
                  </div>
                  <div className="text-gray-600 text-xs">{insight.generationalPattern}</div>
                </div>
                
                <div>
                  <div className="flex items-center space-x-2 mb-1">
                    <Zap className="w-3 h-3 text-orange-500" />
                    <span className="font-medium text-gray-700">Emotional Triggers</span>
                  </div>
                  <div className="text-gray-600 text-xs">
                    {insight.emotionalTriggers.join(' • ')}
                  </div>
                </div>
                
                <div>
                  <div className="flex items-center space-x-2 mb-1">
                    <Package className="w-3 h-3 text-purple-500" />
                    <span className="font-medium text-gray-700">Bundling Opportunities</span>
                  </div>
                  <div className="text-gray-600 text-xs">
                    {insight.bundlingOpportunities.join(' • ')}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 bg-indigo-50 rounded-lg border border-indigo-200">
          <h4 className="font-semibold text-indigo-900 mb-2">AI-Generated Insights Summary</h4>
          <div className="text-sm text-indigo-800 space-y-1">
            <p>• <strong>Color Associations:</strong> Blue dominates trust positioning across major brands</p>
            <p>• <strong>Generational Patterns:</strong> Gen Z gravitates toward fun/energy brands (Oishi), while Boomers prefer heritage (San Miguel)</p>
            <p>• <strong>Emotional Triggers:</strong> Filipino pride and family bonding are universal motivators</p>
            <p>• <strong>Bundling Opportunities:</strong> Meal combinations and party packs show highest potential</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductMix;