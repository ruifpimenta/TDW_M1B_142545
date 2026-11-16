let listaCarros = [];
let garagemFavoritos = lerFavoritos();
let mostrarApenasGaragem = false;

document.addEventListener("DOMContentLoaded", () => {
    atualizarContadorGaragem();
    configurarEventosCatalogo();
    carregarCatalogoApi();
});

function configurarEventosCatalogo() {
    document.getElementById("campo-pesquisa").addEventListener("input", aplicarFiltros);
    document.getElementById("filtro-categoria").addEventListener("change", aplicarFiltros);

    document.getElementById("btn-limpar").addEventListener("click", () => {
        document.getElementById("campo-pesquisa").value = "";
        document.getElementById("filtro-categoria").value = "todas";
        mostrarApenasGaragem = false;
        atualizarEstadoBotaoGaragem();
        aplicarFiltros();
    });

    document.getElementById("btn-ver-garagem").addEventListener("click", () => {
        mostrarApenasGaragem = !mostrarApenasGaragem;
        atualizarEstadoBotaoGaragem();
        aplicarFiltros();
    });
}

// Carrega o resumo curto e a fotografia para cada cartão do catálogo
async function carregarCatalogoApi() {
    const indicador = document.getElementById("estado-carregamento");

    try {
        const pedidos = catalogoBase.map(async (carro, indice) => {
            const respostaPt = await fetch(`https://pt.wikipedia.org/api/rest_v1/page/summary/${carro.slugPt}`);
            const dadosPt = respostaPt.ok ? await respostaPt.json() : {};

            let dadosFoto = dadosPt;
            if (carro.slugFoto !== carro.slugPt) {
                const respostaFoto = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${carro.slugFoto}`);
                if (respostaFoto.ok) {
                    dadosFoto = await respostaFoto.json();
                }
            }

            const imagemCard = dadosFoto.thumbnail?.source
                || dadosPt.thumbnail?.source
                || "https://placehold.co/600x400/eae5d9/1b1a18?text=Sem+Fotografia";

            return {
                ...carro,
                numeroArquivo: String(indice + 1).padStart(2, "0"),
                imagem: imagemCard,
                resumoCurto: dadosPt.extract || "Consultar ficha técnica e histórica completa deste modelo."
            };
        });

        listaCarros = await Promise.all(pedidos);
        indicador.classList.add("d-none");
        renderizarGrelha(listaCarros);

    } catch (erro) {
        console.error("Erro ao carregar catálogo:", erro);
        indicador.innerHTML = `
            <div class="alert alert-danger d-inline-block">
                Não foi possível carregar o catálogo. Verifica a tua ligação à internet.
            </div>
        `;
    }
}

function renderizarGrelha(lista) {
    const grelha = document.getElementById("grelha-classicos");
    grelha.innerHTML = "";

    if (lista.length === 0) {
        grelha.innerHTML = `
            <div class="col-12 text-center py-5">
                <p class="texto-mono small texto-secundario mb-1">SEM RESULTADOS</p>
                <p class="titulo-serif fs-5">Nenhum automóvel corresponde aos critérios selecionados.</p>
            </div>
        `;
        return;
    }

    for (const carro of lista) {
        const classeBadge = obterClasseCategoria(carro.categoria);
        const estaNaGaragem = garagemFavoritos.includes(carro.id);
        const classeBotaoFav = estaNaGaragem ? "guardado" : "";
        const iconeMarcador = estaNaGaragem ? "bi-bookmark-fill" : "bi-bookmark";

        const coluna = document.createElement("div");
        coluna.className = "col-md-6 col-lg-4";

        coluna.innerHTML = `
            <article class="card h-100 cartao-carro">
                <div class="contentor-imagem">
                    <img src="${carro.imagem}" class="cartao-imagem" alt="${carro.nome}">
                    <button class="btn btn-favorito ${classeBotaoFav} position-absolute top-0 end-0 m-2" 
                            title="Guardar na Garagem Pessoal" 
                            onclick="clicarFavorito('${carro.id}')">
                        <i class="bi ${iconeMarcador}"></i>
                    </button>
                </div>
                <div class="card-body d-flex flex-column p-4">
                    <div class="d-flex justify-content-between align-items-center mb-2">
                        <span class="texto-mono small texto-secundario">N.º ${carro.numeroArquivo} • ${carro.decada}</span>
                        <span class="badge ${classeBadge}">${carro.categoria}</span>
                    </div>
                    <h2 class="titulo-cartao mb-1">${carro.nome}</h2>
                    <p class="texto-mono small texto-secundario mb-3">${carro.pais}</p>
                    <p class="card-text small resumo-curto mb-4">${carro.resumoCurto}</p>
                    <div class="rodape-cartao mt-auto">
                        <a href="detalhe.html?id=${carro.id}" class="link-ficha">
                            <span>Abrir ficha histórica</span>
                            <i class="bi bi-arrow-right"></i>
                        </a>
                    </div>
                </div>
            </article>
        `;

        grelha.appendChild(coluna);
    }
}

function aplicarFiltros() {
    const termoPesquisa = document.getElementById("campo-pesquisa").value.toLowerCase().trim();
    const categoriaSelecionada = document.getElementById("filtro-categoria").value;

    const listaFiltrada = listaCarros.filter((carro) => {
        const correspondeTexto = carro.nome.toLowerCase().includes(termoPesquisa) ||
                                 carro.pais.toLowerCase().includes(termoPesquisa) ||
                                 carro.decada.toLowerCase().includes(termoPesquisa);
        const correspondeCategoria = categoriaSelecionada === "todas" || carro.categoria === categoriaSelecionada;
        const correspondeGaragem = !mostrarApenasGaragem || garagemFavoritos.includes(carro.id);

        return correspondeTexto && correspondeCategoria && correspondeGaragem;
    });

    renderizarGrelha(listaFiltrada);
}

function clicarFavorito(id) {
    garagemFavoritos = alternarFavoritoStorage(id);
    atualizarContadorGaragem();
    aplicarFiltros();
}

function atualizarContadorGaragem() {
    document.getElementById("contador-garagem").textContent = garagemFavoritos.length;
}

function atualizarEstadoBotaoGaragem() {
    const botao = document.getElementById("btn-ver-garagem");
    botao.classList.toggle("ativo", mostrarApenasGaragem);
}