import React, { useState, useEffect, useMemo } from 'react';
import { Save, AlertCircle, CheckCircle2, User, UserSquare2, AlertTriangle, ShieldAlert } from 'lucide-react';

const CATEGORIAS = {
  "Selecione uma categoria": [],
  "3 a 4 anos": [
    "Passo de dança 1", "Salto Galope", "Passo de dança 2", "Passo de dança 3",
    "Equilíbrio Passê", "Salto Parafuso 90º", "Pré acrobático", "Expressão facial"
  ],
  "5 a 6 anos": [
    "Passo de dança 1", "Passo de dança 2", "Salto galope", "Chainê",
    "Chassê lateral", "Onda lateral", "Equilíbrio Passê", "Passo de dança 3",
    "Pivô Passê", "Expressão facial"
  ],
  "7 a 9 anos": [
    "Passo de dança 1", "Equilíbrio Passê", "Onda Lateral", "Passo de dança 2",
    "Chainê", "Chassê lateral", "Pivô passê 360º", "Cambalhota",
    "Passo de dança 3", "Salto galope", "Esquipe", "Passo de dança 4", "Expressão facial"
  ],
  "10 a 13 anos": [
    "Passo de dança 1", "Pivô Passê 360º", "Esquipe", "Onda lateral",
    "Chainê", "Estrelinha", "Rolamento", "Passo de dança 2",
    "Salto corsa ou espacate", "Passo de dança 3", "Equilíbrio Passê com relevê", "Expressão facial"
  ],
  "14+ anos": [
    "Passo de dança 1", "Passo de dança 2", "Equilíbrio Passê com relevê", "Estrelinha",
    "rolamento", "Passo de dança 3", "Salto Corsa", "Onda lateral",
    "Chainê", "Pivô Passê 360º", "Passo de dança 4", "Avião", "Expressão facial"
  ],
  "INTERMEDIÁRIO 5 a 6 anos": [
    "Passo de dança 1", "Passo de dança 2", "Salto galope", "Chainê",
    "Chassê lateral", "Onda lateral", "Equilíbrio Passê", "Passo de dança 3",
    "Pivô Passê", "Expressão facial"
  ],
  "INTERMEDIÁRIO 7 a 9 anos": [
    "Passo de Dança 1", "Equilíbrio ‘Y’", "Onda lateral", "Passo de dança 2",
    "Chassê lateral", "Pivô Passê 360", "Rolamento", "Passo de dança 3",
    "Salto corsa", "Esquipe", "Expressão facial"
  ],
  "INTERMEDIÁRIO 10 a 13 anos": [
    "Passo de dança 1", "Pivô Passê", "Esquipe", "Onda lateral",
    "Chainê", "Estrelinha", "Rolamento", "Passo de dança 3",
    "Salto espacate", "Passo de dança 4", "Equilíbrio ‘Y’", "Expressão facial"
  ]
};

const OPTIONS = [
  { label: 'Perfeito', value: 0, color: 'bg-green-100 text-green-700 border-green-300', active: 'bg-green-500 text-white border-green-600' },
  { label: 'Pequena (-0.1)', value: 0.1, color: 'bg-yellow-50 text-yellow-700 border-yellow-200', active: 'bg-yellow-500 text-white border-yellow-600' },
  { label: 'Média (-0.3)', value: 0.3, color: 'bg-orange-50 text-orange-700 border-orange-200', active: 'bg-orange-500 text-white border-orange-600' },
  { label: 'Não Ex. (-0.5)', value: 0.5, color: 'bg-red-50 text-red-700 border-red-200', active: 'bg-red-500 text-white border-red-600' }
];

// COLE A SUA URL AQUI DENTRO DAS ASPAS SIMPLES:
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwnucDokejCGcH73rc3Gl97BRJJyJelhslDtfOwDSbhoP2auVoktmmHDG_QnICcUQ5qKA/exec'

export default function App() {
  const [ginasta, setGinasta] = useState('');
  const [ginastasList, setGinastasList] = useState([]);
  const [arbitro, setArbitro] = useState('');
  const [categoria, setCategoria] = useState('Selecione uma categoria');
  const [deducoes, setDeducoes] = useState({});
  const [saidaArea, setSaidaArea] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  // Zera as deduções sempre que a categoria mudar
  useEffect(() => {
    setDeducoes({});
    setSaidaArea(false);
  }, [categoria]);

  // Busca os nomes das ginastas da planilha ao carregar o app
  useEffect(() => {
    const fetchGinastas = async () => {
      if (SCRIPT_URL === 'COLE_AQUI_A_URL_DO_APP_DA_WEB') {
        console.warn("Configure a SCRIPT_URL com o link gerado no Google Apps Script.");
        return;
      }
      try {
        // Bate na API do Google Sheets para ler os nomes
        const response = await fetch(SCRIPT_URL);
        if (!response.ok) throw new Error('Falha ao buscar planilha');
        
        const names = await response.json();
        setGinastasList(names.sort());
      } catch (err) {
        console.error("Não foi possível carregar a lista da planilha. Mantendo input livre.", err);
      }
    };
    
    fetchGinastas();
  }, []);

  const elementosAtuais = CATEGORIAS[categoria] || [];

  const handleDeducao = (index, valor) => {
    setDeducoes(prev => ({
      ...prev,
      [index]: valor
    }));
  };

  const totais = useMemo(() => {
    let deducaoElementos = 0;
    // Soma das deduções dos elementos
    Object.values(deducoes).forEach(val => {
      deducaoElementos += val;
    });
    
    // Penalidade por saída de área (1.0)
    const deducaoSaidaArea = saidaArea ? 1.0 : 0;
    
    const deducaoTotal = deducaoElementos + deducaoSaidaArea;
    const notaFinal = Math.max(0, 20.0 - deducaoTotal);

    return {
      deducaoTotal,
      notaFinal
    };
  }, [deducoes, saidaArea]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!ginasta || !arbitro || categoria === 'Selecione uma categoria') {
      showToast('Por favor, preencha nome da ginasta, do árbitro e escolha a categoria.', 'error');
      return;
    }

    // VALIDAÇÃO DE DADOS: Verifica se a ginasta está na lista da planilha
    if (ginastasList.length > 0 && !ginastasList.includes(ginasta)) {
      showToast('Nome inválido. Selecione uma ginasta da lista.', 'error');
      return;
    }

    setIsSubmitting(true);

    // Montar o payload (objeto) que será enviado para o banco de dados (ex: Planilha do Google)
    const payload = {
      timestamp: new Date().toISOString(),
      arbitro,
      ginasta,
      categoria,
      deducaoTotal: totais.deducaoTotal.toFixed(2),
      notaFinal: totais.notaFinal.toFixed(2),
      saidaDeArea: saidaArea ? "Sim (-1.0)" : "Não",
      detalhesDeducoes: elementosAtuais.map((el, index) => ({
        elemento: el,
        deducao: deducoes[index] || 0
      }))
    };

    try {
      // Envia os dados para a Planilha do Google!
      const response = await fetch(SCRIPT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8', // Usamos text/plain para evitar bloqueio de CORS no navegador
        },
        body: JSON.stringify(payload)
      });
      
      const result = await response.json();
      
      if (result.status !== 'success') {
        throw new Error(result.message || 'Erro desconhecido');
      }

      showToast('Avaliação enviada e salva com sucesso!', 'success');
      
      // Limpar formulário para a próxima ginasta
      setGinasta('');
      setCategoria('Selecione uma categoria');
      setDeducoes({});
      setSaidaArea(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });

    } catch (error) {
      showToast('Erro ao salvar avaliação. Verifique a conexão.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const showToast = (message, type) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans pb-32">
      {/* HEADER */}
      <header className="bg-[#e71d73] text-white shadow-lg sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-center relative">
          <h1 className="text-2xl font-bold tracking-wider text-center uppercase drop-shadow-md">
            Copa <span className="text-yellow-300">KN</span> - Arbitragem
          </h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4 mt-4 space-y-6">
        {/* INFO CARD */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-semibold text-gray-600 flex items-center gap-2">
                <UserSquare2 size={16} className="text-[#e71d73]"/> Nome da Ginasta
              </label>
              <input 
                type="text" 
                value={ginasta}
                onChange={(e) => setGinasta(e.target.value)}
                placeholder={ginastasList.length > 0 ? "Digite para buscar ou selecione..." : "Ex: Maria Silva"}
                list="ginastas-list"
                className={`w-full border-2 rounded-lg p-3 outline-none transition-colors text-lg ${
                  ginasta && ginastasList.length > 0 && !ginastasList.includes(ginasta) 
                    ? 'border-red-400 focus:border-red-500 bg-red-50 text-red-700' 
                    : 'border-gray-200 focus:border-[#e71d73]'
                }`}
              />
              {ginasta && ginastasList.length > 0 && !ginastasList.includes(ginasta) && (
                <p className="text-xs font-bold text-red-500 mt-1">
                  ⚠ Atenção: Selecione um nome válido da lista.
                </p>
              )}
              <datalist id="ginastas-list">
                {ginastasList.map((nome, idx) => (
                  <option key={idx} value={nome} />
                ))}
              </datalist>
            </div>
            
            <div className="space-y-1">
              <label className="text-sm font-semibold text-gray-600 flex items-center gap-2">
                <User size={16} className="text-[#e71d73]"/> Nome do Árbitro
              </label>
              <input 
                type="text" 
                value={arbitro}
                onChange={(e) => setArbitro(e.target.value)}
                placeholder="Seu nome"
                className="w-full border-2 border-gray-200 rounded-lg p-3 outline-none focus:border-[#e71d73] transition-colors text-lg"
              />
            </div>

            <div className="space-y-1 md:col-span-2">
              <label className="text-sm font-semibold text-gray-600">Categoria</label>
              <select 
                value={categoria}
                onChange={(e) => setCategoria(e.target.value)}
                className="w-full border-2 border-gray-200 rounded-lg p-3 outline-none focus:border-[#e71d73] transition-colors text-lg bg-white font-medium text-[#e71d73]"
              >
                {Object.keys(CATEGORIAS).map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>
        </section>

        {/* ELEMENTOS (Ficha de avaliação) */}
        {categoria !== 'Selecione uma categoria' && (
          <section className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gray-100 px-5 py-3 border-b border-gray-200 flex justify-between items-center">
              <h2 className="font-bold text-gray-700 uppercase text-sm">Elementos da Série</h2>
              <span className="text-xs bg-[#e71d73] text-white px-2 py-1 rounded-full font-bold">Obrigatórios</span>
            </div>
            
            <div className="divide-y divide-gray-100">
              {elementosAtuais.map((elemento, index) => {
                const selectedValue = deducoes[index] || 0;
                
                return (
                  <div key={index} className="p-4 hover:bg-gray-50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <span className="font-medium text-gray-800 text-lg md:text-base flex-1">
                      {index + 1}. {elemento}
                    </span>
                    
                    <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
                      {OPTIONS.map((opt) => {
                        const isSelected = selectedValue === opt.value;
                        return (
                          <button
                            key={opt.label}
                            type="button"
                            onClick={() => handleDeducao(index, opt.value)}
                            className={`flex-1 md:flex-none whitespace-nowrap px-4 py-3 rounded-lg border-2 font-bold text-sm transition-all transform active:scale-95 touch-manipulation ${
                              isSelected 
                                ? opt.active + ' shadow-sm'
                                : opt.color + ' opacity-70 hover:opacity-100 bg-white'
                            }`}
                          >
                            {opt.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* SAÍDA DE ÁREA */}
            <div className="p-5 bg-red-50 border-t-2 border-red-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ShieldAlert className="text-red-500" size={24}/>
                <div>
                  <h3 className="font-bold text-red-700 text-lg">Saída de Área</h3>
                  <p className="text-sm text-red-600">Dedução fixa de -1,00 ponto</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSaidaArea(!saidaArea)}
                className={`relative inline-flex h-8 w-16 items-center rounded-full transition-colors focus:outline-none ${saidaArea ? 'bg-red-500' : 'bg-gray-300'}`}
              >
                <span className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${saidaArea ? 'translate-x-9' : 'translate-x-1'}`} />
              </button>
            </div>
          </section>
        )}
      </main>

      {/* SUMMARY FOOTER (Sticky) */}
      <div className="fixed bottom-0 w-full bg-white border-t border-gray-200 shadow-[0_-10px_15px_-3px_rgba(0,0,0,0.1)] z-40 p-4">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-6 w-full md:w-auto justify-around md:justify-start">
            <div className="text-center md:text-left">
              <span className="block text-xs font-bold text-gray-400 uppercase">Partida</span>
              <span className="text-lg font-bold text-gray-700">20.00</span>
            </div>
            <div className="text-center md:text-left">
              <span className="block text-xs font-bold text-red-400 uppercase">Deduções</span>
              <span className="text-lg font-bold text-red-600">-{totais.deducaoTotal.toFixed(2)}</span>
            </div>
            <div className="text-center md:text-left">
              <span className="block text-xs font-bold text-[#e71d73] uppercase">Nota Final</span>
              <span className="text-3xl font-black text-[#e71d73] drop-shadow-sm">
                {totais.notaFinal.toFixed(2)}
              </span>
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={isSubmitting || categoria === 'Selecione uma categoria'}
            className="w-full md:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-[#e71d73] to-[#c2145d] text-white px-8 py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl hover:brightness-110 active:scale-95 transition-all disabled:opacity-50 disabled:pointer-events-none"
          >
            {isSubmitting ? (
              <span className="animate-pulse flex items-center gap-2">Enviando...</span>
            ) : (
              <>
                <Save size={24} />
                Enviar Avaliação
              </>
            )}
          </button>
        </div>
      </div>

      {/* TOAST NOTIFICATION */}
      {toast && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-4">
          <div className={`flex items-center gap-3 px-6 py-4 rounded-xl shadow-2xl font-bold text-white ${toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}>
            {toast.type === 'success' ? <CheckCircle2 size={24} /> : <AlertTriangle size={24} />}
            {toast.message}
          </div>
        </div>
      )}

    </div>
  );
}