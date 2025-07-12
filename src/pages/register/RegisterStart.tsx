import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, Users, Building2, Store, UserSearch } from 'lucide-react';

const registerOptions = [
  {
    label: 'Usuário Comum',
    description: 'Solicite coletas, calcule seu impacto e obtenha benefícios.',
    icon: <Home className="h-7 w-7" />, // azul
    iconBg: 'bg-blue-500',
    image: '/Image/garden-5315602_1280.jpg',
    type: 'common',
  },
  {
    label: 'Coletor Individual',
    description: 'Receba agendamentos, registre coletas e aumente sua renda.',
    icon: <UserSearch className="h-7 w-7" />, // verde
    iconBg: 'bg-green-500',
    image: '/Image/Coletorindividual.jpg',
    type: 'collector',
  },
  {
    label: 'Cooperativa',
    description: 'Gerencie equipes e amplie seu alcance de coletas.',
    icon: <Users className="h-7 w-7" />, // verde escuro
    iconBg: 'bg-green-700',
    image: '/Image/Comunidade.jpg',
    type: 'cooperative',
  },
  {
    label: 'Empresa Coletora',
    description: 'Compre materiais diretamente dos coletores.',
    icon: <Building2 className="h-7 w-7" />, // roxo
    iconBg: 'bg-purple-500',
    image: '/Image/home-3097046_1280.jpg',
    type: 'company',
  },
  {
    label: 'Empresa Parceira',
    description: 'Demonstre responsabilidade ambiental e ofereça benefícios.',
    icon: <Store className="h-7 w-7" />, // laranja
    iconBg: 'bg-orange-500',
    image: '/Image/nature-3289812_1280.jpg',
    type: 'partner',
  },
];

const RegisterStart: React.FC = () => {
  const navigate = useNavigate();

  // Ripple effect handler
  const handleRipple = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    const button = e.currentTarget;
    const circle = document.createElement("span");
    const diameter = Math.max(button.clientWidth, button.clientHeight);
    const radius = diameter / 2;
    circle.classList.add("ripple");
    circle.style.width = circle.style.height = `${diameter}px`;
    circle.style.left = `${e.clientX - button.getBoundingClientRect().left - radius}px`;
    circle.style.top = `${e.clientY - button.getBoundingClientRect().top - radius}px`;
    button.appendChild(circle);
    circle.addEventListener("animationend", () => {
      circle.remove();
    });
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-neutral-100 pt-4 pb-10">
      <img src="/logo-neutro.png" alt="Neutro" className="h-12 mb-2 mt-2" />
      <div className="flex flex-col items-center w-full mb-2">
        <span className="inline-block bg-green-100 text-green-700 text-xs font-semibold px-3 py-1 rounded-full mb-2">Pequenos Gestos, Grandes Impactos</span>
        <span className="text-base text-neutral-700 text-center mb-2">Bem-vindo ao Neutro! Escolha seu perfil e comece a transformar o mundo com pequenos gestos.</span>
      </div>
      <h1 className="text-2xl md:text-3xl font-bold mb-6 text-neutral-800 text-center">Como você quer fazer parte?</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-5xl px-2 md:px-4">
        {registerOptions.map((option, idx) => (
          <button
            key={option.label}
            aria-label={`Cadastrar como ${option.label}`}
            onClick={() => navigate(`/register/new?type=${option.type}`)}
            className={`rounded-2xl overflow-hidden shadow-lg group focus:outline-none transition-transform active:scale-95 hover:scale-105 flex flex-row bg-white border border-transparent hover:border-green-300 focus:border-green-500 animate-fade-in-up`}
            style={{ minWidth: 220, animationDelay: `${idx * 80}ms` }}
          >
            <div className="w-1/3 aspect-[4/3] h-28 md:h-40 lg:h-48 overflow-hidden flex-shrink-0">
              <img
                src={option.image}
                alt={option.label}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="flex flex-col gap-2 p-4 md:p-5 items-start flex-1 justify-center">
              <div className={`inline-flex items-center justify-center rounded-lg ${option.iconBg} bg-opacity-90 mb-2 shadow-md`}>
                {option.icon}
              </div>
              <span className="text-base md:text-xl font-bold text-neutral-800">{option.label}</span>
              <span className="text-xs md:text-base text-neutral-600 font-normal leading-tight">{option.description}</span>
            </div>
          </button>
        ))}
      </div>
      <div className="mt-8 text-center">
        <span className="text-neutral-700">Já tem uma conta?</span>
        <button className="text-green-700 font-bold ml-2 underline" onClick={() => navigate('/login')}>
          Entrar
        </button>
      </div>
      <footer className="w-full text-center text-xs text-neutral-400 mt-10 pt-6 border-t border-neutral-200">
        © 2025 Neutro. Todos os direitos reservados.
      </footer>
    </div>
  );
};

export default RegisterStart; 