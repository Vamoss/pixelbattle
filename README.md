# PixelBattle
https://pixelbattle.com.br

![Screenshot](/screenshot.png)

**Português:** Imagine a cidade como um grande quadro para ser pintado coletivamente, em constante transformação através da sobreposição continua de pixels e cores. A batalha é uma provocação ao quanto colaborativos conseguimos ser.

**English:** Imagine the city as a big canvas to be painted collectively, in constant transformation through the continuous overlap of pixels and colors. The battle is a provocation of how collaborative we can be.


## Sobre o projeto (About the project)
**Português:** Todos podem pintar a cidade usando seus celulares. Seu desenho pode ser sobreposto por outra pessoa. O último pixel desenhado será o exibido para todos. Pessoas também podem explorar livremente os desenhos espacialmente e temporalmente.

**English:** Everybody can paint the city using their mobile phones. Your drawing can be overlapped by other person drawing. The last pixel drew will be the displayed to everyone else. People can also freely explore spatially and temporally the drawings.

### Origem (Origin)
**Português:** A ideia do projeto começa de conversas com [@Mneunomne](https://github.com/mneunomne) sobre usar mapas como uma plataforma de intervenções sobre a cidade.

Então eu vi o [Reddit Places](https://en.wikipedia.org/wiki/Place_(Reddit)) e surge a ideia de usar a cidade como uma grande tela. A ideia de colaboração e compenteição e como os usuários do Reddit se engajaram realmente me pegou ([Complete timelapse](https://www.youtube.com/watch?v=RCAsY8kjE3w)).

O projeto foi desenvolvido durante a residência artística Multiverso.

**English:** The project idea started from talks with [@Mneunomne](https://github.com/mneunomne) about using maps as a platform of interventions over the city.

Then I saw [Reddit Places](https://en.wikipedia.org/wiki/Place_(Reddit)) and I the idea of using the city as a pixel art canvas emerged. The idea of collaboration versus competition and how it engaged the Reddit users really got me([Complete timelapse](https://www.youtube.com/watch?v=RCAsY8kjE3w)).

The project was developed during the Multiverso artistic residence.

### A tecnologia (The technology)  
**Português:** Primeiro decidir ir com o [Leaflet](https://leafletjs.com) ao invés do [Google Maps](https://cloud.google.com/maps-platform/) porque a arquitetura do código era muito mais orientada à JS, e especificamente o [grid layer](https://leafletjs.com/reference-1.3.0.html#gridlayer) era muito útil.

Então eu decidi usar o [HTML Canvas](https://developer.mozilla.org/docs/Web/API/Canvas_API) para exibir as pinturas, e foi uma decisão para obter uma boa performance com dados em tempo real e interativos interativa e controle total sobre os desenhos.

O ambiente de produção foi feito com os serviços da Amazon, e toda arquitetura de DevOps foi feita pelo [Cristian Mello](https://github.com/cristiancmello).

Adotamos no projeto o banco de dados [RethinkDB](https://rethinkdb.com/), por sua maneira trabalhar com dados em tempo real.

**English:** First I decided to go with [Leaflet](https://leafletjs.com) instead of [Google Maps](https://cloud.google.com/maps-platform/) because the code architecture was much more JS oriented, and specifically the [grid layer](https://leafletjs.com/reference-1.3.0.html#gridlayer) was very useful.

So I decided to use [HTML Canvas](https://developer.mozilla.org/docs/Web/API/Canvas_API) to render the paintings, it was a good decision to get a realtime interactive performance with full drawing control.

The production environment was done using the Amazon services, and all the DevOps archtecture was done by [Cristian Mello](https://github.com/cristiancmello).

We adopted the [RethinkDB](https://rethinkdb.com/) database, by his way of working with realtime data.

### A complexidade do algoritimo de dados (The algorithm data complexity)
**Português:** Em geral, todo motor de mapa é feito de quadrados(Tiles). Cada quadrado mostra parcialmente a Terra em nível de ampliação(zoom) correspondente.

Na ampliação 0 um único quadrado exibe a Terra inteiramente.

Na ampliação 19(Máxiom em motorores de mapa) a Terra é dividida em 524.287```(2^19)``` quadrados horizontalmente e verticalmente.

**English:** In general, all map engines works with tiles. Each tile show partially earth in the correspondent zoom level.

At zoom level 0 a single tile display the full eath map.

At zoom level 19(maximum in general maps) the earth map is subdivided in 524.287```(2^19)``` tiles horizontally and vertically.

[Leaflet: Understanding the tile system](https://leafletjs.com/examples/extending/extending-2-layers.html)
 
![Grid System](/grid-system.png)
 
 **Português:** Na ampliação máxima(19) do **Pixel Battle** os quadrados são subdivididos em 4 linhas e 4 colunas, resultando em 2.097.148```(524.287*4)``` quadrados horizontalmente e verticalmente.

 Finalmente nós temos um total de 4.398.029.733.904```(2.097.148^2)``` pixels para pintar. Mais de 4 TRILHÕES!!!!

**English:** At **Pixel Battle** maximum zoom level(19) the tile is also subdivided by 4 rows and 4 columns, resultin in 2.097.148```(524.287*4)``` tiles horizontally and vertically.

Finally we got a total of 4.398.029.733.904```(2.097.148^2)``` pixels to paint. More than 4 TRILLIONS!!!!


## Desenvolvimento (Development)

**Português:** 
Este projeto é executado dentro de um ambiente de desenvolvimento criado pelo Docker Container.

Primeiro é necessário clonar o [repositório do Docker Container](https://github.com/cristiancmello/pixel-battle-stack).

Ao seguir os passos de configuração do repositório acima, o servidor do banco de dados e node serão levantados.

Ao concluir os passos será necessário clonar este repositório na pasta src/ do Container.

**English:**
This project is executed inside a development environment created by a Docker Container.

It is first necessary to clone the [Docker repository](https://github.com/cristiancmello/pixel-battle-stack).

Follow the configuration steps from the repository above, the database server and the node server will get up.

When concluding the steps it will be needed to clone this repository in the /src folder at the Container.


### Inicialização (Initialization)
1. Intalando as dependencias (Install dependencies)
```console
npm install
```
2. Copie o arquivo ``.env.sample`` renomeando-o para ``.env`` (Copy the file ``.env.sambple`` renaming it to ``.env``)

### Desenvolvendo (Developing)
1. Run a local server over http://localhost:8080/.
```console
npm run dev
```

### Publicando (Release)
1. Para publicar o front-end e comprimi-lo na pasta ``public`` (To build and compress the front-end files into the ``public`` folder)
```console
npm run build
```

2. Para rodar o servidor node em modo de produção (To run the node server in production mode)
```console
npm run start
```

  ### Links úteis (Usefull links)
1. [Inspiration: Mapeamento a project from ```@mneunomne```](https://github.com/mneunomne/mapeamento/)
2. [Inspiration: Reddit Place: A project similar project where time was the challange](https://en.wikipedia.org/wiki/Place_(Reddit))
3. [Inspiration: Reddit Place complete timeline](https://www.youtube.com/watch?v=RCAsY8kjE3w)
4. [Leaflet: JS map engine](https://leafletjs.com/)
5. [Leaflet: Understanding the grid system](https://leafletjs.com/examples/extending/extending-2-layers.html)
6. [Leaftlet: Grid layer documentation](https://leafletjs.com/reference-1.3.0.html#gridlayer) 