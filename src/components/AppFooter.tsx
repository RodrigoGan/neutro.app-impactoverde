
import React from 'react';
import { Link } from 'react-router-dom';
import Logo from './Logo';
import { Instagram, Facebook, Twitter, Linkedin } from 'lucide-react';

const AppFooter: React.FC = () => {
  return (
    <footer className="bg-neutral-100 border-t">
      <div className="container px-4 py-8 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-1">
            <Logo className="mb-4" />
            <p className="text-neutral-600 mb-4">
              Pequenos Gestos, Grandes Impactos
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-neutro hover:text-neutro-dark">
                <Instagram size={20} />
              </a>
              <a href="#" className="text-neutro hover:text-neutro-dark">
                <Facebook size={20} />
              </a>
              <a href="#" className="text-neutro hover:text-neutro-dark">
                <Twitter size={20} />
              </a>
              <a href="#" className="text-neutro hover:text-neutro-dark">
                <Linkedin size={20} />
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-bold text-lg mb-4">Sobre</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/about" className="text-neutral-600 hover:text-neutro">
                  Quem Somos
                </Link>
              </li>
              <li>
                <Link to="/blog" className="text-neutral-600 hover:text-neutro">
                  Blog
                </Link>
              </li>
              <li>
                <Link to="/impact" className="text-neutral-600 hover:text-neutro">
                  Impacto Ambiental
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-neutral-600 hover:text-neutro">
                  Contato
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-lg mb-4">Recursos</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/calculator" className="text-neutral-600 hover:text-neutro">
                  Calculadora
                </Link>
              </li>
              <li>
                <Link to="/schedule" className="text-neutral-600 hover:text-neutro">
                  Agendamento
                </Link>
              </li>
              <li>
                <Link to="/pricing" className="text-neutral-600 hover:text-neutro">
                  Planos
                </Link>
              </li>
              <li>
                <Link to="/partners" className="text-neutral-600 hover:text-neutro">
                  Parceiros
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-lg mb-4">Legal</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/terms" className="text-neutral-600 hover:text-neutro">
                  Termos de Uso
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-neutral-600 hover:text-neutro">
                  Política de Privacidade
                </Link>
              </li>
              <li>
                <Link to="/cookies" className="text-neutral-600 hover:text-neutro">
                  Política de Cookies
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-neutral-200">
          <p className="text-center text-neutral-600">
            &copy; {new Date().getFullYear()} Neutro. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default AppFooter;
