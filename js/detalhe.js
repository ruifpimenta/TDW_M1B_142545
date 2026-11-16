document.addEventListener("DOMContentLoaded", () => {
    iniciarPaginaDetalhe();
});

async function iniciarPaginaDetalhe() {
    const indicador = document.getElementById("estado-carregamento-detalhe");
    const contentorVeiculo = document.getElementById("conteudo-veiculo");

    const parametrosUrl = new URLSearchParams(window.location.search);
    const idVeiculo = parametrosUrl.get("id");

    const carro = catalogoBase.find((item) => item.id === idVeiculo);

    if (!carro) {
        indicador.innerHTML = `
            <div class="alert alert-warning d-inline-block">
                Modelo não encontrado no arquivo. <a href="index.html" class="alert-link">Regressar ao índice</a>.
            </div>
        `;
        return;
    }

    document.title = `${carro.nome} — Arquivo Clássico`;

    try {
        const respostaResumo = await fetch(`https://pt.wikipedia.org/api/rest_v1/page/summary/${carro.slugPt}`);
        const dadosResumo = respostaResumo.ok ? await respostaResumo.json() : {};

        let dadosFoto = dadosResumo;
        if (carro.slugFoto !== carro.slugPt) {
            const respostaFoto = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${carro.slugFoto}`);
            if (respostaFoto.ok) {
                dadosFoto = await respostaFoto.json();
            }
        }

        const textoCompletoHtml = await obterArtigoCompletoPt(carro.slugPt, dadosResumo.extract);

        const imagemFinal = dadosFoto.originalimage?.source
            || dadosFoto.thumbnail?.source
            || dadosResumo.thumbnail?.source
            || "https://placehold.co/800x500/eae5d9/1b1a18?text=Sem+Fotografia";

        document.getElementById("detalhe-imagem").src = imagemFinal;
        document.getElementById("detalhe-imagem").alt = carro.nome;
        document.getElementById("detalhe-titulo").textContent = carro.nome;
        document.getElementById("detalhe-subtitulo").textContent = dadosResumo.description || `Registo Histórico • ${carro.pais}`;

        const badgeCategoria = document.getElementById("detalhe-categoria");
        badgeCategoria.textContent = carro.categoria;
        badgeCategoria.className = `badge ${obterClasseCategoria(carro.categoria)}`;

        document.getElementById("detalhe-decada").textContent = carro.decada;
        document.getElementById("detalhe-pais").textContent = carro.pais;
        document.getElementById("detalhe-link-wiki").href = dadosResumo.content_urls?.desktop?.page || `https://pt.wikipedia.org/wiki/${carro.slugPt}`;
        document.getElementById("detalhe-texto-historico").innerHTML = textoCompletoHtml;

        configurarBotaoFavoritoDetalhe(carro.id);

        indicador.classList.add("d-none");
        contentorVeiculo.classList.remove("d-none");

    } catch (erro) {
        console.error("Erro ao carregar detalhe do veículo:", erro);
        indicador.innerHTML = `
            <div class="alert alert-danger d-inline-block">
                Ocorreu um erro ao carregar a história deste modelo. Tenta novamente mais tarde.
            </div>
        `;
    }
}

async function obterArtigoCompletoPt(slugPt, textoAlternativo) {
    try {
        const url = `https://pt.wikipedia.org/w/api.php?action=query&prop=extracts&explaintext=1&titles=${encodeURIComponent(slugPt)}&redirects=1&format=json&origin=*`;
        const resposta = await fetch(url);

        if (!resposta.ok) {
            throw new Error("Falha ao obter texto completo.");
        }

        const dados = await resposta.json();
        const paginas = dados?.query?.pages;
        const pagina = paginas ? Object.values(paginas)[0] : null;
        const textoBruto = pagina?.extract;

        if (!textoBruto) {
            return `<p>${textoAlternativo || "Informação histórica indisponível."}</p>`;
        }

        return converterTextoParaHtml(textoBruto);

    } catch {
        return `<p>${textoAlternativo || "Informação histórica indisponível."}</p>`;
    }
}

function converterTextoParaHtml(textoBruto) {
    const linhas = textoBruto.split("\n").map((linha) => linha.trim()).filter((linha) => linha.length > 0);
    let html = "";
    let totalParagrafos = 0;

    for (const linha of linhas) {
        if (/^==\s*(Ver também|Referências|Ligações externas|Notas|Bibliografia)/i.test(linha)) {
            break;
        }

        if (linha.startsWith("==") && linha.endsWith("==")) {
            const subtitulo = linha.replace(/=/g, "").trim();
            html += `<h5>${subtitulo}</h5>`;
        } else if (!linha.startsWith("=")) {
            html += `<p>${linha}</p>`;
            totalParagrafos++;
        }

        if (totalParagrafos >= 10) {
            break;
        }
    }

    return html;
}

function configurarBotaoFavoritoDetalhe(id) {
    const botao = document.getElementById("btn-favorito-detalhe");

    const atualizarVisualBotao = () => {
        const favoritos = lerFavoritos();
        const estaGuardado = favoritos.includes(id);

        if (estaGuardado) {
            botao.classList.add("ativo");
            botao.innerHTML = `<i class="bi bi-bookmark-fill me-2"></i>Guardado na Garagem`;
        } else {
            botao.classList.remove("ativo");
            botao.innerHTML = `<i class="bi bi-bookmark me-2"></i>Guardar na Garagem`;
        }
    };

    atualizarVisualBotao();

    botao.addEventListener("click", () => {
        alternarFavoritoStorage(id);
        atualizarVisualBotao();
    });
}