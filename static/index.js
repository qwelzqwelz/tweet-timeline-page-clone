const PHOTO_VIEWER_SETTINGS = {
    toolbar: {
        zoomIn: 4,
        zoomOut: 4,
        oneToOne: 4,
        reset: 4,
        prev: {
            show: 1,
            size: "large",
        },
        play: 0,
        next: {
            show: 1,
            size: "large",
        },
        rotateLeft: 4,
        rotateRight: 4,
        flipHorizontal: 4,
        flipVertical: 4,
    },
};

$(function() {
    // 图片浏览
    $(".media-photos-container").each(function() {
        new Viewer(this, PHOTO_VIEWER_SETTINGS);
    });
});