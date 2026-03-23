import { motion } from 'framer-motion';

export default function Footer() {
  return (
    <footer className="bg-surface-container mt-12 py-8 px-4 rounded-t-3xl shadow-[0_-4px_20px_rgba(0,0,0,0.05)] text-on-surface">
      <div className="max-w-[390px] mx-auto space-y-8">
        
        {/* Sobre Nós */}
        <section className="space-y-3">
          <h3 className="font-[family-name:var(--font-noto-serif)] italic font-bold text-lg text-primary">
            Sobre Nós
          </h3>
          <p className="text-sm text-on-surface-variant leading-relaxed">
            Bem-vindo ao <strong>O Zé Boteco</strong>, o seu ponto de encontro para os melhores lanches, bebidas geladas e sobremesas da região. Trabalhamos com ingredientes selecionados para entregar sabor e qualidade na sua mesa ou no conforto da sua casa.
          </p>
        </section>

        {/* Google Maps (Placeholder embed) */}
        <section className="space-y-3">
          <h3 className="font-[family-name:var(--font-noto-serif)] italic font-bold text-lg text-primary">
            Como Chegar
          </h3>
          <div className="w-full h-[180px] rounded-2xl overflow-hidden shadow-sm border border-outline-variant/20">
            <iframe 
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d117024.46820251703!2d-46.7317374!3d-23.5684711!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x94ce59d0b67ea275%3A0xe7a505e838b0d36c!2sAv.%20Paulista%2C%20S%C3%A3o%20Paulo%20-%20SP!5e0!3m2!1spt-BR!2sbr!4v1700000000000!5m2!1spt-BR!2sbr" 
              width="100%" 
              height="100%" 
              style={{ border: 0 }} 
              allowFullScreen={false} 
              loading="lazy" 
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
          <p className="text-xs text-on-surface-variant italic">
            Estamos localizados no coração da cidade. Venha nos visitar!
          </p>
        </section>

        {/* Links Sociais e Informações */}
        <section className="border-t border-outline-variant/30 pt-6 flex flex-col items-center space-y-4">
          <div className="flex gap-4">
            <a href="#" className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center hover:bg-primary hover:text-white transition-colors">
              {/* Instagram Icon Placeholder */}
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
            </a>
            <a href="#" className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center hover:bg-primary hover:text-white transition-colors">
              {/* Facebook Icon Placeholder */}
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M22.675 0h-21.35C.593 0 0 .593 0 1.325v21.351C0 23.407.593 24 1.325 24h11.495v-9.294H9.691v-3.622h3.129V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12V24h6.116c.73 0 1.323-.593 1.323-1.325v-21.35C24 .593 23.407 0 22.675 0z"/></svg>
            </a>
          </div>

          <div className="text-center space-y-1 text-xs text-on-surface-variant pb-6">
            <p className="font-bold">O Zé Boteco Ltda.</p>
            <p>CNPJ: 00.000.000/0001-00</p>
            <p>© {new Date().getFullYear()} Todos os direitos reservados.</p>
          </div>
        </section>

      </div>
    </footer>
  );
}
