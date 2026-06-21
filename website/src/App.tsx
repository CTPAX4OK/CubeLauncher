import React from 'react';
import { Download, Server, Cpu, FolderOpen, Shield, Heart } from 'lucide-react';

function App() {
  return (
    <div className="min-h-screen bg-[#0f172a] text-white selection:bg-blue-500/30">
      
      {/* Navbar */}
      <nav className="container mx-auto px-6 py-6 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <img src="https://raw.githubusercontent.com/CTPAX4OK/CubeLauncher/main/public/logo.png" alt="CubeLauncher Logo" className="w-10 h-10 object-contain" />
          <span className="text-xl font-bold tracking-tight">CubeLauncher</span>
        </div>
        <div className="hidden md:flex gap-8 text-sm font-medium text-slate-300">
          <a href="#features" className="hover:text-white transition-colors">Особенности</a>
          <a href="#screenshots" className="hover:text-white transition-colors">Интерфейс</a>
          <a href="#support" className="hover:text-white transition-colors">Поддержать</a>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="container mx-auto px-6 pt-20 pb-32 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8">
            Управляй серверами <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">без боли</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-400 mb-12 max-w-2xl mx-auto leading-relaxed">
            Современный лаунчер для локальных серверов Minecraft. Никаких батников, сложной консоли и мусора в папках. Только удобный интерфейс, умная телеметрия и полная изоляция ядер.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center items-center gap-6">
            <a 
              href="https://github.com/CTPAX4OK/CubeLauncher/releases/latest" 
              className="flex items-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold text-lg transition-all shadow-[0_0_20px_rgba(37,99,235,0.4)] hover:shadow-[0_0_30px_rgba(37,99,235,0.6)] transform hover:-translate-y-1"
            >
              <Download size={24} />
              Скачать для Windows
            </a>
            
            <a 
              href="https://github.com/CTPAX4OK/CubeLauncher" 
              className="flex items-center gap-2 px-8 py-4 bg-white text-black hover:bg-gray-200 rounded-xl font-semibold text-lg transition-all transform hover:-translate-y-1"
            >
              <Github size={24} />
              Смотреть на GitHub
            </a>
          </div>
        </div>
      </header>

      {/* Main Mockup */}
      <section className="container mx-auto px-6 pb-32 relative">
        <div className="absolute inset-0 bg-blue-500/10 blur-[100px] rounded-full" />
        <img 
          src="https://raw.githubusercontent.com/CTPAX4OK/CubeLauncher/main/public/dashboard.png" 
          alt="CubeLauncher Dashboard" 
          className="w-full max-w-5xl mx-auto rounded-2xl shadow-2xl border border-slate-700 glow relative z-10"
        />
      </section>

      {/* Features */}
      <section id="features" className="bg-[#1e293b] py-32 border-y border-slate-800">
        <div className="container mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">Почему CubeLauncher?</h2>
            <p className="text-slate-400 text-lg">Мы собрали лучшие инструменты для разработчиков и админов.</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            <FeatureCard 
              icon={<Server size={32} />}
              title="Ядра в 1 клик"
              desc="Мгновенно скачивай и настраивай ядра Vanilla, Paper или Fabric прямо из интерфейса."
            />
            <FeatureCard 
              icon={<Cpu size={32} />}
              title="Умная телеметрия"
              desc="Контролируй здоровье сервера: графики нагрузки процессора, ОЗУ и точный TPS в реальном времени."
            />
            <FeatureCard 
              icon={<FolderOpen size={32} />}
              title="Встроенный ФС"
              desc="Безопасно управляй файлами и редактируй .properties и .yml не выходя из лаунчера."
            />
            <FeatureCard 
              icon={<Shield size={32} />}
              title="Полная изоляция"
              desc="Каждый профиль сервера работает в своей песочнице. Никаких конфликтов плагинов и миров."
            />
          </div>
        </div>
      </section>

      {/* Screenshots Section */}
      <section id="screenshots" className="py-32">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl md:text-5xl font-bold mb-16 text-center">Красивый. Быстрый. Твой.</h2>
          
          <div className="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto">
            <div className="flex flex-col justify-center gap-6">
              <h3 className="text-2xl font-bold text-blue-400">Архитектура Клиент-Сервер</h3>
              <p className="text-slate-400 text-lg leading-relaxed">
                Современный фронтенд на React постоянно взаимодействует с фоновыми процессами Node.js через защищенные IPC каналы Electron для безопасного управления оборудованием.
              </p>
            </div>
            <div>
              <img 
                src="https://raw.githubusercontent.com/CTPAX4OK/CubeLauncher/main/public/architecture.png" 
                alt="Architecture" 
                className="rounded-xl border border-slate-700 shadow-xl"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto mt-24">
             <div className="order-2 md:order-1">
              <img 
                src="https://raw.githubusercontent.com/CTPAX4OK/CubeLauncher/main/public/stats.png" 
                alt="Statistics" 
                className="rounded-xl border border-slate-700 shadow-xl"
              />
            </div>
            <div className="flex flex-col justify-center gap-6 order-1 md:order-2">
              <h3 className="text-2xl font-bold text-blue-400">Подробная статистика</h3>
              <p className="text-slate-400 text-lg leading-relaxed">
                Забудь про /tps в консоли. Лаунчер сам рисует красивые графики и предупреждает, если серверу не хватает ресурсов или он перегружен.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Support Author Section */}
      <section id="support" className="bg-[#1e293b] py-32 border-t border-slate-800 text-center">
        <div className="container mx-auto px-6 max-w-2xl">
          <Heart size={48} className="mx-auto text-pink-500 mb-8" />
          <h2 className="text-3xl md:text-5xl font-bold mb-6">Поддержать автора</h2>
          <p className="text-slate-400 text-lg mb-10">
            CubeLauncher — это проект с открытым исходным кодом, который создается в свободное время. Если он сэкономил тебе часы работы с консолью, ты можешь сказать спасибо!
          </p>
          <div className="flex justify-center gap-4">
            <a 
              href="https://github.com/CTPAX4OK" 
              className="px-8 py-4 bg-slate-800 hover:bg-slate-700 rounded-xl font-semibold transition-colors flex items-center gap-2"
            >
              <Github size={20} />
              Подписаться на GitHub
            </a>
            {/* You can add BuyMeACoffee or Boosty links here in the future */}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 text-center text-slate-500 border-t border-slate-800">
        <p>© {new Date().getFullYear()} CubeLauncher. Made with ❤️ for Minecraft Server Admins.</p>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div className="bg-[#0f172a] p-8 rounded-2xl border border-slate-800 hover:border-blue-500/50 transition-colors group">
      <div className="text-blue-500 mb-6 group-hover:scale-110 transition-transform origin-left">{icon}</div>
      <h3 className="text-xl font-bold mb-4">{title}</h3>
      <p className="text-slate-400 leading-relaxed">{desc}</p>
    </div>
  );
}

function Github({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" stroke="none">
      <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.379.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.161 22 16.416 22 12c0-5.523-4.477-10-10-10z" />
    </svg>
  );
}

export default App;
