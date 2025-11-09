class ControleInstalacoes {
    constructor() {
        this.instalacoes = this.carregarDados();
        this.init();
    }

    init() {
        document.getElementById('instalacaoForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.adicionarInstalacao();
        });

        // Data padrão é hoje
        document.getElementById('data').value = this.getDataHoje();
        
        this.atualizarInterface();
    }

    getDataHoje() {
        return new Date().toISOString().split('T')[0];
    }

    calcularValor(quantidadeDia) {
        if (quantidadeDia === 1) return 90;
        if (quantidadeDia === 2) return 100;
        return 110; // 3 ou mais
    }

    adicionarInstalacao() {
        const codigo = document.getElementById('codigo').value;
        const nome = document.getElementById('nome').value;
        const data = document.getElementById('data').value;

        // Validar código (5 dígitos)
        if (!/^\d{5}$/.test(codigo)) {
            alert('Código deve ter exatamente 5 dígitos!');
            return;
        }

        const instalacao = {
            codigo,
            nome,
            data,
            id: Date.now() // ID único
        };

        this.instalacoes.push(instalacao);
        this.salvarDados();
        this.atualizarInterface();

        // Limpar formulário
        document.getElementById('instalacaoForm').reset();
        document.getElementById('data').value = data; // Mantém a data
    }

    getInstalacoesPorData() {
        const agrupadas = {};
        
        this.instalacoes.forEach(inst => {
            if (!agrupadas[inst.data]) {
                agrupadas[inst.data] = [];
            }
            agrupadas[inst.data].push(inst);
        });

        return agrupadas;
    }

    calcularTotais() {
        const agrupadas = this.getInstalacoesPorData();
        let totalMes = 0;

        Object.keys(agrupadas).forEach(data => {
            const qtd = agrupadas[data].length;
            const valorUnitario = this.calcularValor(qtd);
            const totalDia = qtd * valorUnitario;
            totalMes += totalDia;
        });

        return { totalMes };
    }

    atualizarInterface() {
        this.atualizarResumoDia();
        this.atualizarListaInstalacoes();
        this.atualizarTotalMes();
    }

    atualizarResumoDia() {
        const dataHoje = this.getDataHoje();
        const instalacoesHoje = this.instalacoes.filter(inst => inst.data === dataHoje);
        const qtdHoje = instalacoesHoje.length;
        const valorUnitario = this.calcularValor(qtdHoje);
        const totalHoje = qtdHoje * valorUnitario;

        document.getElementById('resumoDia').innerHTML = `
            <p><strong>Instalações hoje:</strong> ${qtdHoje}</p>
            <p><strong>Valor unitário:</strong> R$ ${valorUnitario},00</p>
            <p><strong>Total hoje:</strong> R$ ${totalHoje},00</p>
        `;
    }

    atualizarListaInstalacoes() {
        const lista = document.getElementById('listaInstalacoes');
        const agrupadas = this.getInstalacoesPorData();

        let html = '';
        
        Object.keys(agrupadas).sort().reverse().forEach(data => {
            const instalacoes = agrupadas[data];
            const qtd = instalacoes.length;
            const valorUnitario = this.calcularValor(qtd);
            const totalDia = qtd * valorUnitario;

            html += `
                <div class="dia-group">
                    <h4>${this.formatarData(data)} - ${qtd} instalação(ões) - R$ ${totalDia},00</h4>
                    ${instalacoes.map(inst => `
                        <div class="instalacao-item">
                            <span>${inst.codigo} - ${inst.nome}</span>
                            <span>R$ ${valorUnitario},00</span>
                        </div>
                    `).join('')}
                </div>
            `;
        });

        lista.innerHTML = html || '<p>Nenhuma instalação cadastrada ainda.</p>';
    }

    atualizarTotalMes() {
        const { totalMes } = this.calcularTotais();
        document.getElementById('totalMes').textContent = `R$ ${totalMes},00`;
    }

    formatarData(data) {
        return new Date(data + 'T00:00:00').toLocaleDateString('pt-BR');
    }

    salvarDados() {
        localStorage.setItem('controleInstalacoes', JSON.stringify(this.instalacoes));
    }

    carregarDados() {
        const dados = localStorage.getItem('controleInstalacoes');
        return dados ? JSON.parse(dados) : [];
    }
}

// Iniciar a aplicação quando a página carregar
document.addEventListener('DOMContentLoaded', () => {
    new ControleInstalacoes();
});