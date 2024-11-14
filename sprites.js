// TODO: Deal with scaling, preferably in a way that doesn't look blurry

var Sprites = {
    Sprite: class Sprite {
        constructor(href, left, top, width, height) {
            this.href = href;
            this.left = left;
            this.top = top;
            this.width = width;
            this.height = height;
        }

        make() {
            const div = document.createElement('div');
            div.classList = "sprite";
            div.style = `width: ${this.width}px; height: ${this.height}px; background-position: ${this.left}px ${this.top}px; background-image: url(${this.href});`;
            return div;
        }
    },

    imageDimensions: async function(href) {
        const image = new Image()
        image.src = href
        return new Promise((resolve) => {
            image.onload = function() {
                resolve({
                    width: image.naturalWidth, 
                    height: image.naturalHeight
                });
            }
        })
    },

    rename: function(sprites, names) {
        if (names) {
            const spritesD = {}
            for (var i in sprites) spritesD[names[i]] = sprites[i]
            delete spritesD[undefined]
            return spritesD;
        } else return sprites;
    },

    loadAll: async function(href, gridSize, names) {
        const size = await Sprites.imageDimensions(href);

        const sprites = [];
        for (var t = 0; t < size.height; t+= gridSize) {
            for (var l = 0; l < size.width; l+= gridSize) {
                sprites.push(new Sprites.Sprite(href, l, t, gridSize, gridSize));
            }
        }
        return Sprites.rename(sprites, names)

        // TODO: synchronously return an object, so you can call: await Sprites.loadSheet("sheet.png", 16).at(1, 2)
    },

    load: async function(href, scale) {
        const size = await Sprites.imageDimensions(href);

        return new Sprites.Sprite(href, 0, 0, size.width, size.height);
    }
};
