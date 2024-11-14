const game = $("#game")

function randChoice(array) { return array[Math.floor(Math.random()*array.length)] }

async function loadSprites() {
    const sprites = await Sprites.loadAll("assets/food1_64.png", 64);
    for (var i=0; i<100; i++) sprites.push(await Sprites.load(`assets/food2_64/${i}.png`));
    for (var i=0; i<100; i++) sprites.push(await Sprites.load(`assets/food3_64/${i}.png`));

    sprites.forEach((sprite, i) => {
        const unused = $(`<div class="unused"><span class="label">${i}</span></div>`)
        unused.prepend(sprite.make())
        $("#unused").append(unused)
    });

    return Sprites.rename(sprites, {
        // Ingredients
        105: "milk",
        109: "cheese",
        211: "watermelonWhole",
        32: "tomato",
        49: "fish",
        127: "lettuce",
        53: "bacon",
        180: "dough",
        143: "blueberry",
        86: "emptyCup",

        119: "mushroom",
        13: "olives",
        17: "sausage",

        // Finished recipes
        176: "tomatoSauce",
        24: "pretzel",
        64: "burger",
        66: "breadLoaf",
        65: "breadSlice",
        87: "coffee",
        212: "watermelonSlice",
        146: "blueberryPie",
        145: "blueberryPieSlice",
        108: "pizza",
        107: "pizzaSlice",
        89: "sushi",
        78: "iceCream",

        // TODO: BLT, Pizza with stuff
    });
}

function slot() {
     const e  = $(`<div class="slot drop-slot"></div>`)
     const r = {
        e,
        callbacks: [],
        item: undefined,
        onChange: function(f) {
            this.callbacks.push(f.bind(this))
        },
        change: function() {
            this.callbacks.forEach((f) => { f(); });
            this.e.toggleClass("recent-change")
            setTimeout(() => this.e.removeClass("recent-change"), 1000)
        },
        droppable: function(isDroppable) {
            e.toggleClass("drop-slot", isDroppable)
        },
        setItem: function(item, dragged) {
            this.droppable(!item)
            this.item = item
            if (!dragged) {
                this.e.empty()
                if (item) this.e.append(item.e)
            }
        }
     }
     e.data("slot", r)
     e.on("dragTo", (e, d) => {
        r.setItem(d.dragged.data("item"), true)
        r.change()
     })
     e.on("dragFrom", (e) => {
        r.setItem(undefined, true)
        r.change()
     })
     return r
}

function recipe(slots, inputs, outputs) {
    if (slots.length < inputs.length || slots.length < outputs.length) throw("Not enough slots for recipe")

    function canDoRecipe() {
        var ingredients = []
        slots.forEach((slot) => {
            if (!!slot.item) ingredients.push(slot.item)
        })
        if (inputs.length != ingredients.length) return false;
        return inputs.every((requirement) => {
            return ingredients.some((ingredient) => {
                return ingredient.equals(requirement)
            })
        })
    }

    function checkRecipe() {
        if (!canDoRecipe()) return;
        slots.forEach((slot, i) => {
            slot.setItem(i < outputs.length ? outputs[i].copy() : null)
        })
    }

    slots.forEach((slot) => slot.onChange(checkRecipe))
}

function machine(pe, name, numSlots) {
    if (!pe) pe = game

    const e = $(`<div class="machine"><span class="label">${name}</span><div class="slots"></div></div>`)
    pe.append(e)

    const r = {
        e,
        slots: [],
        slot: function() {
            const s = slot() 
            this.slots.push(s)
            this.e.find(".slots").append(s.e)
            return s
        },
        remove: function() {
            this.e.remove()
        }
    }
    for (var i=0; i<numSlots; i++) r.slot()
    return r
}

function section(pe) {
    if (!pe) pe = game

    const e = $(`<div class="section"></div>`)
    pe.append(e)

    return {
        e,
        machines: [],
        machine: function(...arr) {
            const m = machine(e, ...arr)
            this.machines.push(m)
            return m
        },
    }
}

function item(thing) {
    const e = $(`<div class="item draggable"></div>`)
    e.append(sprites[thing].make())

    const r = {
        e,
        id: thing,
        equals: function(other, strict) {
            if (other.id != this.id) return false
            return true
        },
        drag: function(other) {
        },
        copy: function() {
            return item(this.id)
        }
    }
    e.on("drag", r.drag.bind(r))
    e.data("item", r)
    return r
}

var sprites;
async function main() {
    sprites = await loadSprites();
    
    const s1 = section()
    function addCustomer() {
        const possibleOrders = [
            item("milk"),
            item("cheese"),
            item("fish"),
            item("bacon"),
            item("tomatoSauce"),
            item("pretzel"),
            item("burger"),
            item("breadSlice"),
            item("coffee"),
            item("watermelonSlice"),
            item("blueberryPieSlice"),
            item("pizza"),
            item("pizzaSlice"),
            item("sushi"),
            item("iceCream"),
        ]
        const customer = s1.machine("customer", 2)
        const order = randChoice(possibleOrders).copy()
        customer.slots[0].setItem(order)
        customer.slots[0].item.e.removeClass("draggable")
        customer.slots[0].e.addClass("fixed")

        customer.slots[1].onChange(function() {
            if (this.item && this.item.equals(order)) {
                customer.remove()
                addCustomer()
            }
        })
    }
    addCustomer()
    addCustomer()
    addCustomer()

    const s2 = section()
    const prep = s2.machine("prep station", 1)
    recipe(prep.slots, [item("tomato")], [item("tomatoSauce")])
    recipe(prep.slots, [item("dough")], [item("pretzel")])
    recipe(prep.slots, [item("fish")], [item("sushi")])


    const slicer = s2.machine("slicer", 2)
    recipe(slicer.slots, [item("breadLoaf")], [item("breadLoaf"), item("breadSlice")])
    recipe(slicer.slots, [item("watermelonWhole")], [item("watermelonWhole"), item("watermelonSlice")])
    recipe(slicer.slots, [item("pizza")], [item("pizza"), item("pizzaSlice")])
    recipe(slicer.slots, [item("blueberryPie")], [item("blueberryPie"), item("blueberryPieSlice")])

    const assembler = s2.machine("assembly table", 2)
    recipe(assembler.slots, [item("breadSlice"), item("breadSlice")], [item("burger")])
    recipe(assembler.slots, [item("dough"), item("blueberry")], [item("blueberryPie")])
    recipe(assembler.slots, [item("dough"), item("tomatoSauce")], [item("pizza")])
    recipe(assembler.slots, [item("blueberry"), item("milk")], [item("iceCream")])


    const oven = s2.machine("oven", 1)
    recipe(oven.slots, [item("dough")], [item("breadLoaf")])

    const coffeeMachine = s2.machine("coffee machine", 1)
    recipe(coffeeMachine.slots, [item("emptyCup")], [item("coffee")])

    const s3 = section()
    s3.machine("counter", 5)
    const trash = s3.machine("trash", 1)
    trash.slots[0].onChange(function () { this.setItem() })

    const s4 = section()
    const pantry = s4.machine("pantry", 0)
    pantryItems = [
        item("emptyCup"),
        item("bacon"),
        //item("lettuce"),
        //item("tomato"),
        item("cheese"),
        item("dough"),
        item("milk"),
        item("blueberry"),
        item("watermelonWhole"),
        item("fish"),
        //item("mushrooms"),
        //item("olives"),
        //item("sausage"),
    ]
    pantryItems.forEach((item, i) => {
        const slot = pantry.slot()
        slot.setItem(item)
        recipe([slot], [], [item.copy()])
    })

    pantry.slots.forEach((slot) => {
        if (!slot.item) return
    })

}

main()
