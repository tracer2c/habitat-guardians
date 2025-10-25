import { MarsBackground } from '@/components/MarsBackground';
import { PresentationSlide } from '@/components/PresentationSlide';
import { usePresentationNavigation } from '@/hooks/usePresentationNavigation';
import { Button } from '@/components/ui/button';
import { X, ArrowRight, Rocket, Brain, Gauge, Network, Activity, Target, Code, TrendingUp, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Present = () => {
  const { currentSlide, nextSlide, prevSlide, goToSlide, totalSlides } = usePresentationNavigation(10);
  const navigate = useNavigate();

  const handleScreenClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickXPercent = (clickX / rect.width) * 100;

    if (clickXPercent < 20) {
      prevSlide();
    } else if (clickXPercent > 80) {
      nextSlide();
    }
  };

  return (
    <div className="relative h-screen w-screen overflow-hidden cursor-pointer" onClick={handleScreenClick}>
      <MarsBackground />

      {/* Exit Button */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-4 right-4 z-50 text-white/70 hover:text-white hover:bg-white/10"
        onClick={(e) => {
          e.stopPropagation();
          navigate('/');
        }}
      >
        <X className="h-6 w-6" />
      </Button>

      {/* Slide Counter */}
      <div className="absolute top-4 left-4 z-50 text-white/50 text-sm font-mono">
        {currentSlide + 1} / {totalSlides}
      </div>

      {/* Slide 1: Title */}
      <PresentationSlide isActive={currentSlide === 0}>
        <div className="text-center space-y-8">
          <div className="space-y-4">
            <h1 className="text-8xl font-bold text-white tracking-wider presentation-title animate-glow">
              HABIT.AI
            </h1>
            <div className="h-1 w-64 mx-auto bg-gradient-to-r from-transparent via-[#ff6f3c] to-transparent" />
          </div>
          <p className="text-3xl text-white/90 font-light tracking-wide">
            Autonomous Mars Habitat Intelligence System
          </p>
          <p className="text-xl text-[#ff6f3c] font-medium mt-8">
            Keeping Humanity Alive on the Red Planet
          </p>
          <div className="flex items-center justify-center gap-3 mt-12 opacity-50">
            <ArrowRight className="w-5 h-5 text-white animate-pulse" />
            <span className="text-white/70 text-sm">Click right side or press → to continue</span>
          </div>
        </div>
      </PresentationSlide>

      {/* Slide 2: The Problem */}
      <PresentationSlide isActive={currentSlide === 1}>
        <div className="space-y-12">
          <h2 className="text-6xl font-bold text-white text-center">The Challenge: Survival on Mars</h2>
          
          <div className="grid grid-cols-2 gap-8 mt-16">
            <div className="bg-black/30 backdrop-blur-sm border border-white/10 rounded-xl p-8 space-y-6">
              <h3 className="text-2xl font-bold text-[#ff6f3c]">Environmental Hazards</h3>
              <div className="space-y-4 text-white/90 text-lg">
                <div className="flex items-center gap-4 animate-fade-in" style={{animationDelay: '0.1s'}}>
                  <div className="w-3 h-3 rounded-full bg-[#d84315]" />
                  <div>Average Temperature: <span className="text-[#ff6f3c] font-bold">-63°C (-81°F)</span></div>
                </div>
                <div className="flex items-center gap-4 animate-fade-in" style={{animationDelay: '0.2s'}}>
                  <div className="w-3 h-3 rounded-full bg-[#d84315]" />
                  <div>Atmosphere: <span className="text-[#ff6f3c] font-bold">95% CO₂</span></div>
                </div>
                <div className="flex items-center gap-4 animate-fade-in" style={{animationDelay: '0.3s'}}>
                  <div className="w-3 h-3 rounded-full bg-[#d84315]" />
                  <div>Radiation: <span className="text-[#ff6f3c] font-bold">100x Earth Levels</span></div>
                </div>
                <div className="flex items-center gap-4 animate-fade-in" style={{animationDelay: '0.4s'}}>
                  <div className="w-3 h-3 rounded-full bg-[#d84315]" />
                  <div>Dust Storms: <span className="text-[#ff6f3c] font-bold">Months Duration</span></div>
                </div>
              </div>
            </div>

            <div className="bg-black/30 backdrop-blur-sm border border-white/10 rounded-xl p-8 space-y-6">
              <h3 className="text-2xl font-bold text-[#ff6f3c]">Critical Needs</h3>
              <div className="space-y-4 text-white/90 text-lg">
                <div className="flex items-center gap-4 animate-fade-in" style={{animationDelay: '0.5s'}}>
                  <Activity className="w-6 h-6 text-[#ff6f3c]" />
                  <div>Real-time Environmental Monitoring</div>
                </div>
                <div className="flex items-center gap-4 animate-fade-in" style={{animationDelay: '0.6s'}}>
                  <Brain className="w-6 h-6 text-[#ff6f3c]" />
                  <div>AI-Powered Predictive Analytics</div>
                </div>
                <div className="flex items-center gap-4 animate-fade-in" style={{animationDelay: '0.7s'}}>
                  <Target className="w-6 h-6 text-[#ff6f3c]" />
                  <div>Autonomous Crisis Management</div>
                </div>
                <div className="flex items-center gap-4 animate-fade-in" style={{animationDelay: '0.8s'}}>
                  <Rocket className="w-6 h-6 text-[#ff6f3c]" />
                  <div>Robotic Mission Orchestration</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </PresentationSlide>

      {/* Slide 3: Our Solution */}
      <PresentationSlide isActive={currentSlide === 2}>
        <div className="space-y-12">
          <h2 className="text-6xl font-bold text-white text-center">HABIT.AI: Your Mission Control</h2>
          
          <div className="relative mx-auto max-w-4xl">
            <div className="bg-black/40 backdrop-blur-md border border-white/20 rounded-2xl p-12">
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-6 text-center animate-fade-in" style={{animationDelay: '0.1s'}}>
                  <div className="w-20 h-20 mx-auto bg-gradient-to-br from-[#ff6f3c] to-[#d84315] rounded-2xl flex items-center justify-center">
                    <Brain className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white">AI Prediction Engine</h3>
                  <p className="text-white/70">Anomaly detection, forecasting, crisis alerts</p>
                </div>

                <div className="space-y-6 text-center animate-fade-in" style={{animationDelay: '0.2s'}}>
                  <div className="w-20 h-20 mx-auto bg-gradient-to-br from-[#0ea5e9] to-[#0284c7] rounded-2xl flex items-center justify-center">
                    <Rocket className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white">Autonomous Missions</h3>
                  <p className="text-white/70">Rover fleet management & orchestration</p>
                </div>

                <div className="space-y-6 text-center animate-fade-in" style={{animationDelay: '0.3s'}}>
                  <div className="w-20 h-20 mx-auto bg-gradient-to-br from-[#10b981] to-[#059669] rounded-2xl flex items-center justify-center">
                    <Activity className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white">Real-time Monitoring</h3>
                  <p className="text-white/70">8 critical environmental parameters</p>
                </div>

                <div className="space-y-6 text-center animate-fade-in" style={{animationDelay: '0.4s'}}>
                  <div className="w-20 h-20 mx-auto bg-gradient-to-br from-[#f59e0b] to-[#d97706] rounded-2xl flex items-center justify-center">
                    <Network className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white">Earth-Mars Bridge</h3>
                  <p className="text-white/70">Multi-location intelligence network</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </PresentationSlide>

      {/* Slide 4: Dual Mode Intelligence */}
      <PresentationSlide isActive={currentSlide === 3}>
        <div className="space-y-12">
          <h2 className="text-6xl font-bold text-white text-center">Earth & Mars: Connected Intelligence</h2>
          
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-[#4a1810]/80 to-[#2d1410]/80 backdrop-blur-md border-2 border-[#ff6f3c]/50 rounded-2xl p-8 space-y-6 animate-fade-in">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-[#ff6f3c] rounded-xl flex items-center justify-center">
                  <Rocket className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-3xl font-bold text-[#ff6f3c]">Mars Mode</h3>
              </div>
              <div className="space-y-4 text-white/90 text-lg pl-4">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-[#ff6f3c]" />
                  <span>Habitat Environmental Monitoring</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-[#ff6f3c]" />
                  <span>Real-time Crisis Detection</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-[#ff6f3c]" />
                  <span>Rover Fleet Management</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-[#ff6f3c]" />
                  <span>AI-Generated Recommendations</span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-[#0c4a6e]/80 to-[#082f49]/80 backdrop-blur-md border-2 border-[#0ea5e9]/50 rounded-2xl p-8 space-y-6 animate-fade-in" style={{animationDelay: '0.2s'}}>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-[#0ea5e9] rounded-xl flex items-center justify-center">
                  <Network className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-3xl font-bold text-[#0ea5e9]">Earth Mode</h3>
              </div>
              <div className="space-y-4 text-white/90 text-lg pl-4">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-[#0ea5e9]" />
                  <span>Real-time NASA Weather Data</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-[#0ea5e9]" />
                  <span>Multi-location Tracking</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-[#0ea5e9]" />
                  <span>Earth-Mars Communication Bridge</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-[#0ea5e9]" />
                  <span>Investigation Activity Feed</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </PresentationSlide>

      {/* Slide 5: AI Features */}
      <PresentationSlide isActive={currentSlide === 4}>
        <div className="space-y-12">
          <h2 className="text-6xl font-bold text-white text-center">Intelligent Systems for Survival</h2>
          
          <div className="grid grid-cols-2 gap-6">
            {[
              { icon: TrendingUp, title: 'Predictive Analytics', desc: '5-day environmental forecasting with AI-powered trend analysis', delay: '0.1s', color: '#10b981' },
              { icon: Target, title: 'Anomaly Detection', desc: 'Real-time threat identification with <5s response time', delay: '0.2s', color: '#f59e0b' },
              { icon: Activity, title: 'Crisis Mode', desc: 'Automatic emergency protocols & priority alerts', delay: '0.3s', color: '#ef4444' },
              { icon: Brain, title: 'AI Recommendations', desc: 'Context-aware action plans generated in real-time', delay: '0.4s', color: '#8b5cf6' },
            ].map((feature) => (
              <div
                key={feature.title}
                className="bg-black/40 backdrop-blur-md border border-white/20 rounded-xl p-8 space-y-4 hover:scale-105 transition-transform duration-300 animate-fade-in"
                style={{animationDelay: feature.delay}}
              >
                <div className="flex items-center gap-4">
                  <div 
                    className="w-14 h-14 rounded-lg flex items-center justify-center"
                    style={{background: `linear-gradient(135deg, ${feature.color}, ${feature.color}dd)`}}
                  >
                    <feature.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white">{feature.title}</h3>
                </div>
                <p className="text-white/70 text-lg pl-[72px]">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </PresentationSlide>

      {/* Slide 6: Mission Control */}
      <PresentationSlide isActive={currentSlide === 5}>
        <div className="space-y-12">
          <h2 className="text-6xl font-bold text-white text-center">Autonomous Rover Fleet Management</h2>
          
          <div className="bg-black/40 backdrop-blur-md border border-white/20 rounded-2xl p-12">
            <div className="grid grid-cols-5 gap-4 mb-8">
              {[
                { name: 'Sample Collection', color: '#10b981', icon: '🧪' },
                { name: 'Equipment Repair', color: '#f59e0b', icon: '🔧' },
                { name: 'Scientific Survey', color: '#3b82f6', icon: '🔬' },
                { name: 'Resource Extraction', color: '#8b5cf6', icon: '⛏️' },
                { name: 'Emergency Response', color: '#ef4444', icon: '🚨' },
              ].map((mission, i) => (
                <div
                  key={mission.name}
                  className="bg-black/60 border border-white/10 rounded-xl p-6 text-center space-y-3 animate-fade-in hover:scale-105 transition-transform duration-300"
                  style={{animationDelay: `${i * 0.1}s`}}
                >
                  <div className="text-4xl">{mission.icon}</div>
                  <div className="text-white font-medium">{mission.name}</div>
                  <div 
                    className="h-1 w-full rounded-full"
                    style={{backgroundColor: mission.color}}
                  />
                </div>
              ))}
            </div>

            <div className="grid grid-cols-3 gap-6 mt-12">
              <div className="text-center space-y-2">
                <div className="text-5xl font-bold text-[#ff6f3c]">4</div>
                <div className="text-white/70 text-lg">Autonomous Rovers</div>
              </div>
              <div className="text-center space-y-2">
                <div className="text-5xl font-bold text-[#0ea5e9]">5</div>
                <div className="text-white/70 text-lg">Mission Categories</div>
              </div>
              <div className="text-center space-y-2">
                <div className="text-5xl font-bold text-[#10b981]">Real-time</div>
                <div className="text-white/70 text-lg">Telemetry & Logs</div>
              </div>
            </div>
          </div>
        </div>
      </PresentationSlide>

      {/* Slide 7: Architecture */}
      <PresentationSlide isActive={currentSlide === 6}>
        <div className="space-y-12">
          <h2 className="text-6xl font-bold text-white text-center">Built for the Future</h2>
          
          <div className="space-y-6">
            {[
              { layer: 'Frontend', tech: 'React + TypeScript + Vite + Tailwind', icon: Code, color: '#3b82f6' },
              { layer: 'AI/ML', tech: 'Lovable AI (Gemini 2.5 Flash) + Predictive Analytics', icon: Brain, color: '#8b5cf6' },
              { layer: 'Backend', tech: 'Supabase (PostgreSQL + Real-time + Edge Functions)', icon: Network, color: '#10b981' },
              { layer: 'Data Viz', tech: 'Recharts + Custom Charts + Real-time Updates', icon: TrendingUp, color: '#f59e0b' },
              { layer: 'Real-time', tech: 'WebSocket (<100ms latency) + Live Data Sync', icon: Activity, color: '#ef4444' },
            ].map((item, i) => (
              <div
                key={item.layer}
                className="bg-black/40 backdrop-blur-md border border-white/20 rounded-xl p-6 flex items-center gap-6 animate-fade-in hover:scale-[1.02] transition-transform duration-300"
                style={{animationDelay: `${i * 0.1}s`}}
              >
                <div 
                  className="w-16 h-16 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{background: `linear-gradient(135deg, ${item.color}, ${item.color}dd)`}}
                >
                  <item.icon className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1">
                  <div className="text-2xl font-bold text-white mb-1">{item.layer}</div>
                  <div className="text-white/70 text-lg">{item.tech}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </PresentationSlide>

      {/* Slide 8: Metrics */}
      <PresentationSlide isActive={currentSlide === 7}>
        <div className="space-y-12">
          <h2 className="text-6xl font-bold text-white text-center">Performance That Matters</h2>
          
          <div className="grid grid-cols-2 gap-8">
            {[
              { metric: '8', label: 'Environmental Parameters', sublabel: 'Temperature, Pressure, Radiation, O₂, CO₂, Humidity, Power, Water', color: '#10b981' },
              { metric: '<100ms', label: 'Update Latency', sublabel: 'Real-time database with WebSocket connections', color: '#0ea5e9' },
              { metric: '<5s', label: 'AI Response Time', sublabel: 'From anomaly detection to recommendation generation', color: '#8b5cf6' },
              { metric: '4', label: 'Autonomous Rovers', sublabel: 'With real-time telemetry and mission orchestration', color: '#f59e0b' },
            ].map((item, i) => (
              <div
                key={item.label}
                className="bg-black/40 backdrop-blur-md border border-white/20 rounded-2xl p-10 text-center space-y-4 animate-fade-in"
                style={{animationDelay: `${i * 0.1}s`}}
              >
                <div 
                  className="text-7xl font-bold"
                  style={{color: item.color, textShadow: `0 0 30px ${item.color}80`}}
                >
                  {item.metric}
                </div>
                <div className="text-2xl font-bold text-white">{item.label}</div>
                <div className="text-white/60 text-lg leading-relaxed">{item.sublabel}</div>
              </div>
            ))}
          </div>
        </div>
      </PresentationSlide>

      {/* Slide 9: Impact */}
      <PresentationSlide isActive={currentSlide === 8}>
        <div className="space-y-12">
          <h2 className="text-6xl font-bold text-white text-center">Beyond the Hackathon</h2>
          
          <div className="space-y-8">
            <div className="bg-black/40 backdrop-blur-md border border-white/20 rounded-2xl p-10">
              <div className="grid grid-cols-3 gap-8 mb-10">
                <div className="text-center space-y-3 animate-fade-in" style={{animationDelay: '0.1s'}}>
                  <div className="text-3xl font-bold text-[#10b981]">Today</div>
                  <div className="text-white/80 text-lg">Habitat monitoring prototype</div>
                </div>
                <div className="text-center space-y-3 animate-fade-in" style={{animationDelay: '0.3s'}}>
                  <div className="text-3xl font-bold text-[#0ea5e9]">Tomorrow</div>
                  <div className="text-white/80 text-lg">Multi-habitat networks</div>
                </div>
                <div className="text-center space-y-3 animate-fade-in" style={{animationDelay: '0.5s'}}>
                  <div className="text-3xl font-bold text-[#ff6f3c]">Future</div>
                  <div className="text-white/80 text-lg">Autonomous Mars colonies</div>
                </div>
              </div>

              <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent mb-10" />

              <h3 className="text-3xl font-bold text-white mb-6 text-center">Potential Applications</h3>
              <div className="grid grid-cols-2 gap-4">
                {['NASA Mars Missions', 'SpaceX Starbase', 'Research Stations', 'Commercial Settlements'].map((app, i) => (
                  <div
                    key={app}
                    className="bg-black/60 border border-white/10 rounded-lg p-4 text-white/90 text-lg text-center animate-fade-in"
                    style={{animationDelay: `${(i + 6) * 0.1}s`}}
                  >
                    {app}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </PresentationSlide>

      {/* Slide 10: Thank You */}
      <PresentationSlide isActive={currentSlide === 9}>
        <div className="text-center space-y-12">
          <div className="space-y-6">
            <h1 className="text-8xl font-bold text-white tracking-wider presentation-title animate-glow">
              HABIT.AI
            </h1>
            <div className="h-1 w-64 mx-auto bg-gradient-to-r from-transparent via-[#ff6f3c] to-transparent" />
          </div>
          
          <p className="text-3xl text-white/80">Mission to Mars Hackathon 2025</p>
          
          <div className="flex items-center justify-center gap-4 text-xl text-white/60 mt-8">
            <Heart className="w-6 h-6 text-[#ff6f3c] animate-pulse" />
            <span>Built with passion for space exploration</span>
          </div>

          <div className="mt-16 space-y-4">
            <div className="text-5xl font-bold text-white">Questions?</div>
            <div className="text-xl text-white/60">Let's discuss the future of Mars habitation</div>
          </div>

          <Button
            size="lg"
            className="mt-12 bg-gradient-to-r from-[#ff6f3c] to-[#d84315] text-white text-xl px-12 py-6 hover:scale-110 transition-transform"
            onClick={(e) => {
              e.stopPropagation();
              navigate('/');
            }}
          >
            <Rocket className="w-6 h-6 mr-3" />
            View Live Demo
          </Button>
        </div>
      </PresentationSlide>

      {/* Navigation Dots */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3 z-50">
        {Array.from({ length: totalSlides }).map((_, i) => (
          <button
            key={i}
            onClick={(e) => {
              e.stopPropagation();
              goToSlide(i);
            }}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              i === currentSlide
                ? 'bg-[#ff6f3c] w-8'
                : 'bg-white/30 hover:bg-white/50'
            }`}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>

      {/* Navigation Hints */}
      <div className="absolute bottom-8 left-8 text-white/40 text-sm z-40">
        ← Click or press arrow keys →
      </div>
      <div className="absolute bottom-8 right-8 text-white/40 text-sm z-40">
        ESC to exit
      </div>
    </div>
  );
};

export default Present;
