// Catálogo base com os identificadores para texto em PT e fotografia da versão/geração
const catalogoBase = [
    {
        id: "lancia-delta-s4",
        slugPt: "Lancia_Delta_S4",
        slugFoto: "Lancia_Delta_S4",
        nome: "Lancia Delta S4",
        categoria: "Rali",
        decada: "Anos 80",
        pais: "Itália"
    },
    {
        id: "audi-quattro",
        slugPt: "Audi_Quattro",
        slugFoto: "Audi_Quattro",
        nome: "Audi Quattro",
        categoria: "Rali",
        decada: "Anos 80",
        pais: "Alemanha"
    },
    {
        id: "renault-5-alpine-turbo",
        slugPt: "Renault_5",
        slugFoto: "Renault_5_Alpine",
        nome: "Renault 5 Alpine Turbo",
        categoria: "Europeu",
        decada: "Anos 80",
        pais: "França"
    },
    {
        id: "lancia-stratos",
        slugPt: "Lancia_Stratos",
        slugFoto: "Lancia_Stratos",
        nome: "Lancia Stratos HF",
        categoria: "Rali",
        decada: "Anos 70",
        pais: "Itália"
    },
    {
        id: "nissan-skyline-gtr",
        slugPt: "Nissan_Skyline_GT-R",
        slugFoto: "Nissan_Skyline_GT-R",
        nome: "Nissan Skyline GT-R",
        categoria: "JDM",
        decada: "Anos 90",
        pais: "Japão"
    },
    {
        id: "mazda-rx7-fd",
        slugPt: "Mazda_RX-7",
        slugFoto: "Mazda_RX-7",
        nome: "Mazda RX-7 (FD3S)",
        categoria: "JDM",
        decada: "Anos 90",
        pais: "Japão"
    },
    {
        id: "toyota-ae86",
        slugPt: "Toyota_AE86",
        slugFoto: "Toyota_AE86",
        nome: "Toyota Corolla AE86",
        categoria: "JDM",
        decada: "Anos 80",
        pais: "Japão"
    },
    {
        id: "honda-nsx-na1",
        slugPt: "Honda_NSX",
        slugFoto: "Honda_NSX_(first_generation)",
        nome: "Honda NSX (1.ª Geração)",
        categoria: "JDM",
        decada: "Anos 90",
        pais: "Japão"
    },
    {
        id: "bmw-m3-e30",
        slugPt: "BMW_M3",
        slugFoto: "BMW_3_Series_(E30)",
        nome: "BMW M3 (E30)",
        categoria: "Europeu",
        decada: "Anos 80",
        pais: "Alemanha"
    },
    {
        id: "peugeot-205-gti",
        slugPt: "Peugeot_205",
        slugFoto: "Peugeot_205",
        nome: "Peugeot 205 GTI",
        categoria: "Europeu",
        decada: "Anos 80",
        pais: "França"
    },
    {
        id: "vw-golf-mk1",
        slugPt: "Volkswagen_Golf",
        slugFoto: "Volkswagen_Golf_Mk1",
        nome: "Volkswagen Golf GTI Mk1",
        categoria: "Europeu",
        decada: "Anos 70/80",
        pais: "Alemanha"
    },
    {
        id: "ferrari-f40",
        slugPt: "Ferrari_F40",
        slugFoto: "Ferrari_F40",
        nome: "Ferrari F40",
        categoria: "Supercarro",
        decada: "Anos 80",
        pais: "Itália"
    }
];

// Devolve a classe CSS correspondente a cada categoria
function obterClasseCategoria(categoria) {
    switch (categoria) {
        case "Rali":
            return "badge-rali";
        case "JDM":
            return "badge-jdm";
        case "Europeu":
            return "badge-europeu";
        case "Supercarro":
            return "badge-supercarro";
        default:
            return "bg-secondary";
    }
}

// Lê os favoritos guardados no localStorage
function lerFavoritos() {
    try {
        return JSON.parse(localStorage.getItem("garagemClassicos")) || [];
    } catch {
        return [];
    }
}

// Adiciona ou remove um modelo da lista de favoritos e guarda no localStorage
function alternarFavoritoStorage(id) {
    let favoritos = lerFavoritos();

    if (favoritos.includes(id)) {
        favoritos = favoritos.filter((item) => item !== id);
    } else {
        favoritos.push(id);
    }

    try {
        localStorage.setItem("garagemClassicos", JSON.stringify(favoritos));
    } catch {
        // Ignora caso o navegador restrinja storage em ambiente local
    }

    return favoritos;
}