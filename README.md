
# PixelBattle
https://pixelbattle.com.br

![Screenshot](/screenshot.png)

Imagine a cidade como um grande quadro para ser pintado coletivamente, em constante transformação através da sobreposição continua de pixels e cores. A batalha é uma provocação ao quanto colaborativos conseguimos ser.

Imagine the city as a big canvas to be painted collectively, in constant transformation through the continuous overlap of pixels and colors. The battle is a provocation of how collaborative we can be.

### Initialization
1. Install firebase tools
```console
npm install -g firebase-tools
```
2. Install dependencies
```console
npm install
```
3. Init firebase configuration
```console
npm run init
```
4. Configure firebase database data by setting the ``.env``. Sample configuration available at ``.env.sample``

### Developing
1. Run a local server over https://0.0.0.0:8080 that updates automatically when the code is changed
```console
npm run dev
```

### Publishing
1. Build and compress the files into the fonder ``docs``: 
```console
npm run build
```

2. Deploy the ``docs`` folder to firebase: 
```console
npm run deploy
```



## About the project
Everybody can paint the city using their mobile phones. Your drawing can be overlapped by other person drawing. The last pixel drew will be the displayed to everyone else. People can also freely explore spatially and temporally the drawings.

### Origin
The project idea started from talks with [@Mneunomne](https://github.com/mneunomne) about using maps as a platform of interventions over the city.
Then I saw [Reddit Places](https://en.wikipedia.org/wiki/Place_(Reddit)) and I the idea of using the city as a pixel art canvas emerged. The idea of collaboration versus competition and how it engaged the Reddit users really got me([Complete timelapse](https://www.youtube.com/watch?v=RCAsY8kjE3w)).
The project was developed during the Multiverso artistic residence.

### The technology  
First I decided to go with [Leaflet](https://leafletjs.com) instead of [Google Maps](https://cloud.google.com/maps-platform/) because the code architecture was much more JS oriented, and specifically the [grid layer](https://leafletjs.com/reference-1.3.0.html#gridlayer) was very useful.
So I decided to use [HTML Canvas](https://developer.mozilla.org/docs/Web/API/Canvas_API) to render the paintings, it was a good decision to get a realtime interactive performance with full drawing control.
At last but not least I choose to use [Firebase Realtime Database](https://firebase.google.com/docs/database) because the ecosystem(Host, Dev, Deploy, Manage, Code, Documentation) and it has a complete framework that already solved a lot of [data sync tasks](https://firebase.google.com/docs/database/web/lists-of-data).

### The algorithm data complexity

In general, all map engines works with tiles. Each tile show partially earth in the correspondent zoom level.
At zoom level 0 a single tile display the full eath map.
At zoom level 19(maximum in general maps) the earth map is subdivided in 524.287```(2^19)``` tiles horizontally and vertically.
[Leaflet: Understanding the tile system](https://leafletjs.com/examples/extending/extending-2-layers.html)
 
![Grid System](/grid-system.png)
 
At **Pixel Battle** maximum zoom level(19) the tile is also subdivided by 4 rows and 4 columns, resultin in 2.097.148```(524.287*4)``` tiles horizontally and vertically.
Finally we got a total of 4.398.029.733.904```(2.097.148^2)``` pixels to paint. More than 4 TRILLIONS!!!!

  ### Usefull links
1. [Inspiration: Mapeamento a project from ```@mneunomne```](https://github.com/mneunomne/mapeamento/)
2. [Inspiration: Reddit Place: A project similar project where time was the challange](https://en.wikipedia.org/wiki/Place_(Reddit))
3. [Inspiration: Reddit Place complete timeline](https://www.youtube.com/watch?v=RCAsY8kjE3w)
4. [Leaflet: JS map engine](https://leafletjs.com/)
5. [Leaflet: Understanding the grid system](https://leafletjs.com/examples/extending/extending-2-layers.html)
6. [Leaftlet: Grid layer documentation](https://leafletjs.com/reference-1.3.0.html#gridlayer) 