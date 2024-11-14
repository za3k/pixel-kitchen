/* Version 1: Leave a ghostly image behind */

function movePreview(preview, place) {
    const width = $("#game").width(),
          height = $("#game").height()
    const pWidth = preview.width(),
          pHeight = preview.height()
    if (place.x > width - pWidth) place.x = width - pWidth
    if (place.x < 0) place.x = 0
    if (place.y > height - pHeight) place.y = height - pHeight
    if (place.y < 0) place.y = 0

    preview.css("left", `${place.x}px`).css("top", `${place.y}px`)
}

function move(dragged, to) {
    if (!to) return
    const from = dragged.parent() //parents().filter(".drop-slot").first()
    dragged.detach().appendTo(to)
    dragged.trigger("drag", { from, to, dragged })
    to.trigger("dragTo", { from, to, dragged })
    from.trigger("dragFrom", { from, to, dragged })
}

function findTargetDrop(target) {
    const x = target.position().left + target.width()/2 
    const y = target.position().top + target.height()/2

    const e = $(document.elementsFromPoint(x, y)).filter(".drop-slot").first()
    if (e.length > 0) return e
}

function startDrag(target, offset) {
    const preview = target.clone()
    $("html").append(preview)
    target.addClass("drag-ghost")
    preview.addClass("drag-active")

    function dragLocation(e) {
        return {
            x: e.clientX - offset.x,
            y: e.clientY - offset.y
        }
    }

    $(window).on("mousemove", (e) => {
        movePreview(preview, dragLocation(e))

        const drop = findTargetDrop(preview)
        $(".drop-active").removeClass("drop-active") // Highlight where you're about to drop
        if (drop) drop.addClass("drop-active")
    })

    $(window).on("mouseup", (e) => {
        $(window).off("mouseup")
        $(window).off("mousemove")

        movePreview(preview, dragLocation(e))
        const slot = findTargetDrop(preview)
        preview.remove()
        $(".drop-active").removeClass("drop-active")

        target.removeClass("drag-ghost")
        move(target, slot)
    })
}

$(document).on("mousedown", ".draggable", (e) => {
    if (e.button > 0) return
    startDrag($(e.currentTarget), {x: e.offsetX, y: e.offsetY})
    e.preventDefault()
})
