import React, { useState, useEffect } from 'react';
import { Check, User, Send, AlertCircle, ChevronDown, LogOut, ShieldCheck } from 'lucide-react';

const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzB9LxmFjOicGAPZS8qqOwqUepQlcem1tdAQik_A_PIktd2snQAcUQK3AYQYMnxnW2BIA/exec';

const CATEGORIAS = [
  {
    nome: '3 a 4 anos',
    elementos: [
      'Passo de dança 1',
      'Salto Galope',
      'Passo de dança 2',
      'Passo de dança 3',
      'Equilíbrio Passê',
      'Salto Parafuso 90º',
      'Pré acrobático',
      'Expressão facial'
    ]
  },
  {
    nome: '5 a 6 anos',
    elementos: [
      'Passo de dança 1',
      'Passo de dança 2',
      'Salto galope',
      'Chainê',
      'Chassê lateral',
      'Onda lateral',
      'Equilíbrio Passê',
      'Passo de dança 3',
      'Pivô Passê',
      'Expressão facial'
    ]
  },
  {
    nome: '7 a 9 anos',
    elementos: [
      'Passo de dança 1',
      'Equilíbrio Passê',
      'Onda Lateral',
      'Passo de dança 2',
      'Chainê',
      'Chassê lateral',
      'Pivô passê 360º',
      'Cambalhota',
      'Salto galope',
      'Passo de dança 3 com esquipe',
      'Expressão facial'
    ]
  },
  {
    nome: '10 a 13 anos',
    elementos: [
      'Passo de dança 1',
      'Pivô Passê 360º',
      'Esquipe',
      'Onda lateral',
      'Chainê',
      'Estrelinha',
      'Rolamento',
      'Passo de dança 2',
      'Salto corsa ou espacate',
      'Equilíbrio Passê com relevê',
      'Expressão facial'
    ]
  },
  {
    nome: '14+ anos',
    elementos: [
      'Passo de dança 1',
      'Passo de dança 2',
      'Equilíbrio Passê com relevê',
      'Estrelinha',
      'Rolamento',
      'Passo de dança 3',
      'Salto Corsa',
      'Onda lateral',
      'Chassê lateral',
      'Chainê',
      'Pivô Passê 360º',
      'Passo de dança 4',
      'Avião',
      'Expressão facial'
    ]
  },
  {
    nome: 'INTERMEDIÁRIO 5 a 6 anos',
    elementos: [
      'Passo de dança 1',
      'Passo de dança 2',
      'Salto galope',
      'Chainê',
      'Chassê lateral',
      'Onda lateral',
      'Equilíbrio Passê',
      'Passo de dança 3',
      'Pivô Passê',
      'Expressão facial'
    ]
  },
  {
    nome: 'INTERMEDIÁRIO 7 a 9 anos',
    elementos: [
      'Passo de Dança 1',
      'Equilíbrio ‘Y’',
      'Onda lateral',
      'Passo de dança 2',
      'Chassê lateral',
      'Pivô Passê 360',
      'Rolamento',
      'Salto corsa',
      'Passo de dança 3 com Esquipe',
      'Expressão facial'
    ]
  },
  {
    nome: 'INTERMEDIÁRIO 10 a 13 anos',
    elementos: [
      'Passo de dança 1',
      'Pivô Passê',
      'Esquipe',
      'Onda lateral',
      'Chainê',
      'Estrelinha',
      'Rolamento',
      'Passo de dança 3',
      'Salto espacate',
      'Equilíbrio ‘Y’',
      'Expressão facial'
    ]
  }
];

const OPTIONS = [
  { label: 'Perfeito', value: 0, color: 'bg-green-100 text-green-700 border-green-300', active: 'bg-green-500 text-white border-green-600' },
  { label: 'Falha Pequena (-0.1)', value: 0.1, color: 'bg-yellow-100 text-yellow-700 border-yellow-300', active: 'bg-yellow-500 text-white border-yellow-600' },
  { label: 'Falha Média (-0.3)', value: 0.3, color: 'bg-orange-100 text-orange-700 border-orange-300', active: 'bg-orange-500 text-white border-orange-600' },
  { label: 'Falha Grande (-0.5)', value: 0.5, color: 'bg-red-100 text-red-700 border-red-300', active: 'bg-red-500 text-white border-red-600' },
  { label: 'Não Executou (-1.0)', value: 1.0, color: 'bg-gray-200 text-gray-800 border-gray-400', active: 'bg-gray-800 text-white border-gray-900' }
];

export default function App() {
  const [ginasta, setGinasta] = useState('');
  const [arbitro, setArbitro] = useState('');
  const [loginInput, setLoginInput] = useState('');
  const [erroLogin, setErroLogin] = useState('');
  const [categoria, setCategoria] = useState(CATEGORIAS[0]);
  const [notas, setNotas] = useState({});
  const [saidaArea, setSaidaArea] = useState(false);
  const [loading, setLoading] = useState(true);
  const [ginastasData, setGinastasData] = useState({});
  const [arbitrosList, setArbitrosList] = useState([]);
  const [enviando, setEnviando] = useState(false);
  const [sucesso, setSucesso] = useState(false);

  useEffect(() => {
    carregarDadosPlanilha();
  }, []);

  const carregarDadosPlanilha = async () => {
    try {
      const response = await fetch(SCRIPT_URL, { redirect: 'follow' });
      const data = await response.json();
      setGinastasData(data.ginastas || {});
      setArbitrosList(data.arbitros || []);
    } catch (error) {
      console.error("Erro ao carregar dados da planilha", error);
    } finally {
      setLoading(false);
    }
  };

  const nomesGinastas = Object.keys(ginastasData);

  const handleLogin = (e) => {
    e.preventDefault();
    const digitado = loginInput.trim();
    if (!digitado) return;

    if (arbitrosList.length === 0) {
      setErroLogin('Lista de árbitros não carregada. Verifique a aba "arbitros" na planilha.');
      return;
    }

    // Compara ignorando maiúsculas/minúsculas para evitar erro de teclado no celular
    const arbitroAutorizado = arbitrosList.find(
      (item) => item.trim().toLowerCase() === digitado.toLowerCase()
    );

    if (arbitroAutorizado) {
      setArbitro(arbitroAutorizado);
      setErroLogin('');
      setLoginInput('');
    } else {
      setErroLogin('Acesso negado. Login de árbitro não encontrado na planilha.');
    }
  };

  const handleNota = (elemento, valor) => {
    setNotas(prev => ({ ...prev, [elemento]: valor }));
  };

  const calcularDeducao = () => {
    let total = 0;
    Object.values(notas).forEach(v => { total += v; });
    if (saidaArea) total += 1.0;
    return Number(total.toFixed(2));
  };

  const categoriaDivergente =
    ginasta &&
    ginastasData[ginasta] &&
    ginastasData[ginasta].trim().toLowerCase() !== categoria.nome.trim().toLowerCase();

  const handleSubmit = async () => {
    if (!ginasta) return alert("Selecione a ginasta!");

    if (nomesGinastas.length > 0 && !nomesGinastas.includes(ginasta)) {
      return alert("⚠️ Atenção: Selecione um nome exato da lista.");
    }

    if (ginastasData[ginasta]) {
      const categoriaReal = ginastasData[ginasta].trim().toLowerCase();
      const categoriaSelecionada = categoria.nome.trim().toLowerCase();

      if (categoriaReal !== categoriaSelecionada) {
        return alert(
          `⚠️ Categoria Incorreta!\n\nA ginasta "${ginasta}" pertence à categoria "${ginastasData[ginasta]}".\nAltere o campo de categoria acima antes de registrar a nota.`
        );
      }
    }

    if (Object.keys(notas).length !== categoria.elementos.length) {
      return alert("Preencha a nota de todos os elementos antes de enviar.");
    }

    setEnviando(true);
    const deducao = calcularDeducao();
    const notaFinalCalculada = Math.max(0, 20 - deducao).toFixed(2);

    const payload = {
      timestamp: new Date().toLocaleString('pt-BR'),
      arbitro,
      ginasta,
      categoria: categoria.nome,
      notaFinal: notaFinalCalculada,
      deducaoTotal: deducao.toFixed(2),
      saidaDeArea: saidaArea ? "Sim (-1.0)" : "Não",
      detalhesDeducoes: notas
    };

    try {
      await fetch(SCRIPT_URL, {
        method: 'POST',
        body: JSON.stringify(payload),
        headers: { 'Content-Type': 'text/plain;charset=utf-8' }
      });
      setSucesso(true);
      setTimeout(() => {
        setSucesso(false);
        setGinasta('');
        setNotas({});
        setSaidaArea(false);
        window.scrollTo(0, 0);
      }, 3000);
    } catch (error) {
      alert("Erro ao enviar dados. Verifique a conexão.");
    } finally {
      setEnviando(false);
    }
  };

  if (!arbitro) {
    return (
      <div className="min-h-screen bg-pink-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full">
          <div className="flex justify-center mb-6">
            <img
              src="/logo-kn.png"
              alt="KN Ginástica Rítmica"
              className="h-24 w-auto object-contain bg-white rounded-lg p-2"
            />
          </div>
          <h1 className="text-2xl font-bold text-center text-[#e71d73] mb-2">Acesso da Arbitragem</h1>
          <p className="text-sm text-center text-gray-500 mb-6 flex items-center justify-center gap-1">
            <ShieldCheck size={16} className="text-[#e71d73]" /> Acesso restrito a árbitros cadastrados
          </p>
          <form onSubmit={handleLogin}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Digite seu login (Nome + Código)
            </label>
            <input
              type="text"
              value={loginInput}
              onChange={(e) => {
                setLoginInput(e.target.value);
                if (erroLogin) setErroLogin('');
              }}
              required
              autoComplete="off"
              disabled={loading}
              className={`w-full border-2 rounded-xl p-3 outline-none transition ${
                erroLogin
                  ? 'border-red-400 bg-red-50'
                  : 'border-pink-200 focus:border-[#e71d73]'
              }`}
              placeholder={loading ? 'Carregando sistema...' : 'Ex: Maria123'}
            />
            {erroLogin && (
              <p className="text-red-500 text-xs mt-2 font-medium flex items-center gap-1">
                <AlertCircle size={14} /> {erroLogin}
              </p>
            )}
            <button
              type="submit"
              disabled={loading}
              className={`w-full mt-6 p-3 rounded-xl font-bold text-white transition ${
                loading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-[#e71d73] hover:bg-pink-700'
              }`}
            >
              {loading ? 'Validando conexão...' : 'Entrar'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24 font-sans text-gray-800">
      <header className="bg-[#e71d73] text-white p-4 shadow-md sticky top-0 z-20 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="bg-white p-1 rounded-lg shadow-sm">
            <img
              src="/logo-kn.png"
              alt="Logo KN"
              className="h-10 w-auto object-contain"
            />
          </div>
          <h1 className="text-xl font-bold leading-tight">
            Copa <span className="text-white">KN</span><br />
            <span className="text-sm font-normal text-pink-200">Arbitragem</span>
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <User size={16} className="text-pink-200" />
            <span className="text-sm font-medium truncate max-w-[110px]">{arbitro}</span>
          </div>
          <button
            onClick={() => {
              setArbitro('');
              setGinasta('');
              setNotas({});
              setSaidaArea(false);
            }}
            title="Sair"
            className="p-1.5 rounded-lg bg-pink-700/60 hover:bg-pink-800 transition"
          >
            <LogOut size={16} />
          </button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto p-4 space-y-6">
        <section className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="font-bold text-[#e71d73] text-lg mb-4 flex items-center gap-2">
            <User size={20} /> Identificação
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Categoria da Apresentação</label>
              <div className="relative">
                <select
                  className={`w-full appearance-none border-2 rounded-xl p-3 outline-none font-medium transition ${
                    categoriaDivergente
                      ? 'border-red-400 bg-red-50 text-red-700'
                      : 'border-gray-200 bg-gray-50 focus:border-[#e71d73] focus:bg-white'
                  }`}
                  value={CATEGORIAS.findIndex(c => c.nome === categoria.nome)}
                  onChange={(e) => {
                    setCategoria(CATEGORIAS[Number(e.target.value)]);
                    setNotas({});
                  }}
                >
                  {CATEGORIAS.map((cat, idx) => (
                    <option key={cat.nome} value={idx}>{cat.nome}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-3 text-gray-400 pointer-events-none" />
              </div>
              {categoriaDivergente && (
                <p className="text-red-500 text-xs mt-1 font-medium flex items-center gap-1">
                  <AlertCircle size={12} /> Atenção: esta ginasta está cadastrada na categoria "{ginastasData[ginasta]}".
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Nome da Ginasta</label>
              <input
                type="text"
                list="lista-ginastas"
                value={ginasta}
                onChange={(e) => setGinasta(e.target.value)}
                className={`w-full border-2 rounded-xl p-3 focus:outline-none transition ${
                  ginasta && nomesGinastas.length > 0 && !nomesGinastas.includes(ginasta)
                    ? 'border-red-400 bg-red-50'
                    : 'border-gray-200 focus:border-[#e71d73] bg-gray-50 focus:bg-white'
                }`}
                placeholder={loading ? "Carregando planilha..." : "Digite para buscar ou selecione..."}
                disabled={loading}
              />
              <datalist id="lista-ginastas">
                {nomesGinastas.map((nome, idx) => (
                  <option key={idx} value={nome} />
                ))}
              </datalist>
              {ginasta && nomesGinastas.length > 0 && !nomesGinastas.includes(ginasta) && (
                <p className="text-red-500 text-xs mt-1 font-medium flex items-center gap-1">
                  <AlertCircle size={12} /> Selecione um nome válido da lista.
                </p>
              )}
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="font-bold text-[#e71d73] text-lg px-2 flex justify-between items-end">
            Série Obrigatória
            <span className="text-sm font-normal text-gray-500">{categoria.elementos.length} elementos</span>
          </h2>

          {categoria.elementos.map((elemento, index) => (
            <div key={`${categoria.nome}-${elemento}`} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
              <p className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                <span className="bg-pink-100 text-[#e71d73] w-6 h-6 rounded-full flex items-center justify-center text-xs shrink-0">
                  {index + 1}
                </span>
                {elemento}
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {OPTIONS.map((opt, optIdx) => {
                  const isSelected = notas[elemento] === opt.value;
                  const spanLast = optIdx === OPTIONS.length - 1 ? 'col-span-2 sm:col-span-1' : '';
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => handleNota(elemento, opt.value)}
                      className={`p-2 rounded-xl border-2 text-xs sm:text-sm font-medium transition-all flex flex-col items-center justify-center gap-1 min-h-[60px] ${spanLast} ${
                        isSelected ? opt.active : opt.color
                      }`}
                    >
                      {isSelected && <Check size={16} />}
                      <span className="text-center leading-tight">{opt.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </section>

        <section className="bg-red-50 p-5 rounded-2xl border-2 border-red-100">
          <h2 className="font-bold text-red-700 text-lg mb-3">Penalidades Gerais</h2>
          <label className="flex items-center gap-3 p-3 bg-white rounded-xl border border-red-200 cursor-pointer hover:bg-red-50 transition">
            <input
              type="checkbox"
              checked={saidaArea}
              onChange={(e) => setSaidaArea(e.target.checked)}
              className="w-6 h-6 text-red-600 rounded border-gray-300 focus:ring-red-500"
            />
            <span className="font-medium text-gray-800">Saída da área de apresentação (-1.00)</span>
          </label>
        </section>
      </main>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 pb-safe shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-20">
        <div className="max-w-3xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-center sm:text-left flex-1">
            <p className="text-xs text-gray-500 uppercase tracking-wider font-bold">Nota Final Calculada</p>
            <p className="text-3xl font-black text-[#e71d73]">
              {Math.max(0, 20 - calcularDeducao()).toFixed(2)}
            </p>
          </div>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={enviando}
            className={`w-full sm:w-auto px-8 py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all text-white ${
              enviando ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-500 hover:bg-green-600 shadow-lg hover:shadow-green-500/30'
            }`}
          >
            {enviando ? 'Enviando...' : (
              <>
                <Send size={20} />
                Registrar Nota
              </>
            )}
          </button>
        </div>
      </div>

      {sucesso && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl animate-in zoom-in duration-300">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check size={40} className="text-green-500" />
            </div>
            <h3 className="text-2xl font-black text-gray-800 mb-2">Nota Registrada!</h3>
            <p className="text-gray-600 font-medium">Os dados foram enviados para a planilha oficial com sucesso.</p>
          </div>
        </div>
      )}
    </div>
  );
}